import { Component, OnInit, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'
import {
  NsContent,
  IWidgetsPlayerMediaData,
  NsDiscussionForum,
  WidgetContentService,
} from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ConfigurationsService, ValueService } from '@ws-widget/utils'
import { ActivatedRoute } from '@angular/router'
import { ViewerDataService } from './../../viewer-data.service'

@Component({
  standalone: false,
  selector: 'viewer-youtube',
  templateUrl: './youtube.component.html',
  styleUrls: ['./youtube.component.scss'],

})
export class YoutubeComponent implements OnInit, OnDestroy {
  private routeDataSubscription: Subscription | null = null
  private screenSizeSubscription: Subscription | null = null
  private readonly viewerDataSubscription: Subscription | null = null
  forPreview = window.location.href.includes('/author/')
  isScreenSizeSmall = false
  isFetchingDataComplete = false
  youtubeData: NsContent.IContent | null = null
  widgetResolverYoutubeData: NsWidgetResolver.IRenderConfigWithTypedData<
    IWidgetsPlayerMediaData
  > | null = null
  discussionForumWidget: NsWidgetResolver.IRenderConfigWithTypedData<
    NsDiscussionForum.IDiscussionForumInput
  > | null = null
  isScreenSizeLtMedium = false
  fs: boolean | undefined
  batchId = this.activatedRoute.snapshot.queryParamMap.get('batchId')
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly valueSvc: ValueService,
    private readonly contentSvc: WidgetContentService,
    private readonly dataSvc: ViewerDataService,
    private readonly configSvc: ConfigurationsService
  ) { }

  ngOnInit() {
    this.dataSvc.getFullScreenStatus.subscribe(fs => (this.fs = fs))
    this.screenSizeSubscription = this.valueSvc.isXSmall$.subscribe(data => {
      this.isScreenSizeSmall = data
    })
    this.routeDataSubscription = this.activatedRoute.data.subscribe(
      data => {
        void (async () => {
          this.widgetResolverYoutubeData = null
          this.youtubeData = data.content.data
          if (this.youtubeData) {
            this.formDiscussionForumWidget(this.youtubeData)
          }

          this.widgetResolverYoutubeData = this.initWidgetResolverYoutubeData()
          if (this.forPreview) {
            this.widgetResolverYoutubeData.widgetData.disableTelemetry = true
          }
          this.widgetResolverYoutubeData.widgetData.url = this.youtubeData
            ? this.youtubeData.artifactUrl
            : ''
          this.widgetResolverYoutubeData.widgetData.identifier = this.youtubeData
            ? this.youtubeData.identifier
            : ''
          this.widgetResolverYoutubeData.widgetData.isVideojs = false
          if (this.youtubeData && this.youtubeData.artifactUrl.indexOf('content-store') >= 0) {
            await this.setS3Cookie(this.youtubeData.identifier)
          }
          this.isFetchingDataComplete = true
        })()
      },
      () => { },
    )
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
                this.widgetResolverYoutubeData
              ) {
                this.widgetResolverYoutubeData.widgetData.resumePoint = Number(
                  content.progressdetails.current.pop(),
                )
                this.widgetResolverYoutubeData.widgetData.size = content.progressdetails.max_size
              }
            }
          }
          resolve(true)
        },
        () => resolve(true),
      )
    })
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

  initWidgetResolverYoutubeData() {
    return {
      widgetType: 'player',
      widgetSubType: 'playerYoutube',
      widgetData: {
        disableTelemetry: false,
        url: '',
        identifier: '',
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

  private async setS3Cookie(contentId: string) {
    await this.contentSvc
      .setS3Cookie(contentId)
      .toPromise()
      .catch(() => { })
    return
  }
}
