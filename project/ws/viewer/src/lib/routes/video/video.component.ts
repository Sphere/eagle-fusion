import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'
import { AccessControlService } from '@ws/author'
import {
  NsContent,
  IWidgetsPlayerMediaData,
  NsDiscussionForum,
  WidgetContentService,
} from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ConfigurationsService, LoggerService, ValueService } from '@ws-widget/utils'
import { ActivatedRoute } from '@angular/router'
import { ViewerUtilService } from '../../viewer-util.service'
import { Platform } from '@angular/cdk/platform'
import dayjs from 'dayjs'
import { API_END_POINTS } from '../../../../../../../src/app/constants/apiConstants'
@Component({
  standalone: false,
  selector: 'viewer-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],

})
export class VideoComponent implements OnInit, OnDestroy {
  private routeDataSubscription: Subscription | null = null
  private screenSizeSubscription: Subscription | null = null
  private viewerDataSubscription: Subscription | null = null
  forPreview = window.location.href.includes('/author/')
  isScreenSizeSmall = false
  videoData: NsContent.IContent | null = null
  isFetchingDataComplete = false
  isNotEmbed = true
  widgetResolverVideoData: NsWidgetResolver.IRenderConfigWithTypedData<
    IWidgetsPlayerMediaData
  > | null = null
  discussionForumWidget: NsWidgetResolver.IRenderConfigWithTypedData<
    NsDiscussionForum.IDiscussionForumInput
  > | null = null
  batchId = this.activatedRoute.snapshot.queryParamMap.get('batchId')
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly valueSvc: ValueService,
    private readonly viewerSvc: ViewerUtilService,
    private readonly contentSvc: WidgetContentService,
    private readonly platform: Platform,
    private readonly accessControlSvc: AccessControlService,
    private readonly configSvc: ConfigurationsService,
    private readonly logger: LoggerService,
    private readonly cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.screenSizeSubscription = this.valueSvc.isXSmall$.subscribe(data => {
      this.isScreenSizeSmall = data
    })
    this.isNotEmbed =
      this.activatedRoute.snapshot.queryParamMap.get('embed') === 'true' ? false : true
    if (this.shouldUsePreviewMode()) {
      this.initPreviewMode()
    } else {
      this.initRouteDataMode()
    }
  }

  private shouldUsePreviewMode(): boolean {
    return Boolean(
      this.activatedRoute.snapshot.queryParamMap.get('preview') &&
      !this.accessControlSvc.authoringConfig.newDesign
    )
  }

  private initPreviewMode(): void {
    this.viewerDataSubscription = this.viewerSvc
      .getContent(this.activatedRoute.snapshot.paramMap.get('resourceId') || '')
      .subscribe(data => this.handlePreviewContentData(data))
  }

  private handlePreviewContentData(data: any): void {
    this.logger.log(data, '')
    this.videoData = data
    if (this.videoData) {
      this.formDiscussionForumWidget(this.videoData)
    }
    this.widgetResolverVideoData = this.initWidgetResolverVideoData(this.videoData)
    let url = ''
    if (this.videoData.artifactUrl.indexOf('/content-store/') > -1) {
      url = API_END_POINTS.AUTH_CONTENT(new URL(this.videoData.artifactUrl).pathname)
    } else {
      url = API_END_POINTS.AUTH_CONTENT(encodeURIComponent(this.videoData.artifactUrl))
    }
    this.widgetResolverVideoData.widgetData.url = this.videoData ? url : ''
    this.widgetResolverVideoData.widgetData.disableTelemetry = true
    this.isFetchingDataComplete = true
  }

  private initRouteDataMode(): void {
    this.routeDataSubscription = this.activatedRoute.data.subscribe(
      data => {
        void this.handleRouteData(data)
      },
      () => { },
    )
  }

  private async handleRouteData(data: any): Promise<void> {
    this.widgetResolverVideoData = null
    this.videoData = data.content.data

    if (this.videoData) {
      // Fire-and-forget: kicks off the progress-history sync without blocking the
      // widget-resolver assembly below (matches the original concurrent behaviour).
      this.syncVideoProgressHistory()
    }
    this.widgetResolverVideoData = this.initWidgetResolverVideoData(this.videoData as any)
    if (this.videoData && this.videoData.identifier) {
      if (this.activatedRoute.snapshot.queryParams.collectionId) {
        await this.fetchContinueLearning(
          this.activatedRoute.snapshot.queryParams.collectionId,
          this.videoData.identifier,
        )
      } else {
        await this.fetchContinueLearning(this.videoData.identifier, this.videoData.identifier)
      }
    }
    this.widgetResolverVideoData.widgetData.url = this.videoData
      ? this.forPreview
        ? this.viewerSvc.getAuthoringUrl(this.videoData.artifactUrl)
        : this.videoData.artifactUrl
      : ''
    // Only use getResumePoint as fallback if fetchContinueLearning didn't set a value
    if (!this.widgetResolverVideoData.widgetData.resumePoint) {
      this.widgetResolverVideoData.widgetData.resumePoint = this.getResumePoint(this.videoData)
    }
    this.widgetResolverVideoData.widgetData.identifier = this.videoData
      ? this.videoData.identifier
      : ''
    this.widgetResolverVideoData.widgetData.mimeType = data.content.data.mimeType
    this.widgetResolverVideoData = JSON.parse(JSON.stringify(this.widgetResolverVideoData))
    if (this.videoData && this.videoData.artifactUrl.indexOf('content-store') >= 0) {
      await this.setS3Cookie(this.videoData.identifier)
    }
    this.isFetchingDataComplete = true
    this.cdr.detectChanges()
  }

  private syncVideoProgressHistory(): void {
    this.formDiscussionForumWidget(this.videoData!)
    let userId
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || ''
    }
    const req: NsContent.IContinueLearningDataReq = {
      request: {
        userId,
        batchId: this.batchId,
        courseId: this.activatedRoute.snapshot.queryParams.collectionId || '',
        contentIds: this.videoData ? [this.videoData.identifier] : [],
        fields: ['progressdetails'],
      },
    }
    this.contentSvc.fetchContentHistoryV2(req).subscribe(historyData => {
      this.handleContentHistoryResponse(historyData)
    })
  }

  private handleContentHistoryResponse(historyData: any): void {
    if (!(historyData && historyData.result && historyData.result.contentList.length)) {
      this.initZeroProgressSilent()
      return
    }
    // .find() is synchronous — no await needed here.
    const contentData = historyData['result']['contentList'].find((obj: any) => obj.contentId === this.videoData!.identifier)
    this.logger.log(contentData)
    if (contentData === undefined || contentData.completionPercentage === 0) {
      this.logger.log('contentData')
      this.initZeroProgressWithNotify()
    } else {
      this.syncExistingVideoProgress(contentData)
    }
  }

  private initZeroProgressWithNotify(): void {
    if (!this.configSvc.userProfile) {
      return
    }
    const req: any = {
      request: {
        userId: this.configSvc.userProfile.userId || '',
        contents: [
          {
            contentId: this.videoData!.identifier,
            batchId: this.activatedRoute.snapshot.queryParamMap.get('batchId') || '',
            courseId: this.activatedRoute.snapshot.queryParams.collectionId || '',
            status: 1,
            lastAccessTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss:SSSZZ'),
            progressdetails: {},
            completionPercentage: 0,
          },
        ],
      },
    }
    this.logger.log(req)
    this.viewerSvc.initUpdate(req).subscribe((data: any) => {
      this.logger.log(data)
      const result = data.result
      result['type'] = 'video'
      this.contentSvc.changeMessage(result)
    })
  }

  private syncExistingVideoProgress(contentData: any): void {
    if (!this.configSvc.userProfile) {
      return
    }
    const req: any = {
      request: {
        userId: this.configSvc.userProfile.userId || '',
        contents: [
          {
            contentId: this.videoData!.identifier,
            batchId: this.activatedRoute.snapshot.queryParamMap.get('batchId') || '',
            courseId: this.activatedRoute.snapshot.queryParams.collectionId || '',
            status: contentData.status,
            lastAccessTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss:SSSZZ'),
            progressdetails: contentData.progressdetails,
            completionPercentage: contentData.completionPercentage,
          },
        ],
      },
    }
    this.logger.log(req)
    this.viewerSvc.initUpdate(req).subscribe((data: any) => {
      this.logger.log(data)
      const result = data.result
      result['type'] = 'video'
      this.contentSvc.changeMessage(result)
    })
  }

  private initZeroProgressSilent(): void {
    if (!this.configSvc.userProfile) {
      return
    }
    const req: any = {
      request: {
        userId: this.configSvc.userProfile.userId || '',
        contents: [
          {
            contentId: this.videoData!.identifier,
            batchId: this.activatedRoute.snapshot.queryParamMap.get('batchId') || '',
            courseId: this.activatedRoute.snapshot.queryParams.collectionId || '',
            status: 1,
            lastAccessTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss:SSSZZ'),
            progressdetails: {},
            completionPercentage: 0,
          },
        ],
      },
    }
    this.logger.log(req, '183')
    this.viewerSvc.initUpdate(req).subscribe((data: any) => {
      this.logger.log(data)
    })
  }

  ngOnDestroy() {
    if (this.routeDataSubscription) {
      this.routeDataSubscription.unsubscribe()
    }
    if (this.screenSizeSubscription) {
      this.screenSizeSubscription.unsubscribe()
    }
    if (this.viewerDataSubscription) {
      this.viewerDataSubscription.unsubscribe()
    }
  }
  getResumePoint(content: NsContent.IContent | null) {
    if (content) {
      if (content.progress && content.progress.progressSupported && content.progress.progress) {
        return Math.floor(content.duration * content.progress.progress) || 0
      }
      return 0

    }
    return 0
  }

  initWidgetResolverVideoData(content: NsContent.IContent) {
    let isVideojs = false
    if (this.platform.IOS) {
      isVideojs = true
    } else if (!this.platform.WEBKIT && !this.platform.IOS && !this.platform.SAFARI) {
      isVideojs = true
    } else if (this.platform.ANDROID) {
      isVideojs = true
    } else {
      isVideojs = false
    }
    return {
      widgetType: 'player',
      widgetSubType: 'playerVideo',
      widgetData: {
        isVideojs,
        disableTelemetry: false,
        url: '',
        identifier: '',
        mimeType: content.mimeType,
        resumePoint: 0,
        continueLearning: true,
      },
      widgetHostClass: 'video-full',
    }
  }

  formDiscussionForumWidget(content: NsContent.IContent) {
    this.discussionForumWidget = {
      widgetData: {
        description: content.description,
        id: content.identifier,
        name: NsDiscussionForum.EDiscussionType.LEARNING,
        title: content.name,
        initialPostCount: 2,
        isDisabled: this.forPreview,
      },
      widgetSubType: 'discussionForum',
      widgetType: 'discussionForum',
    }
  }
  async fetchContinueLearning(collectionId: string, videoId: string): Promise<boolean> {
    return new Promise(resolve => {
      let userId
      if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId || ''
      }
      const req: NsContent.IContinueLearningDataReq = {
        request: {
          userId,
          batchId: this.batchId,
          courseId: collectionId || '',
          contentIds: [videoId],
          fields: ['progressdetails'],
        },
      }
      this.contentSvc.fetchContentHistoryV2(req).subscribe(
        data => {
          if (data && data.result && data.result.contentList.length) {
            for (const content of data.result.contentList) {
              if (
                content.contentId === videoId &&
                content.progressdetails &&
                content.progressdetails.current &&
                this.widgetResolverVideoData
              ) {
                this.widgetResolverVideoData.widgetData.resumePoint = Number(
                  Array.isArray(content.progressdetails.current)
                    ? content.progressdetails.current[0]
                    : content.progressdetails.current
                )
              }
            }
          }
          resolve(true)
        },
        () => resolve(true),
      )
    })
  }
  private async setS3Cookie(contentId: string) {
    await this.contentSvc
      .setS3Cookie(contentId)
      .toPromise()
      .catch(() => { })
    return
  }
}
