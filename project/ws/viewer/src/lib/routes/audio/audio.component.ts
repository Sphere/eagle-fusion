import { Component, OnInit, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'
import { ValueService } from '@ws-widget/utils'
import { ActivatedRoute } from '@angular/router'
import { AccessControlService } from '@ws/author'
import {
  NsContent,
  IWidgetsPlayerMediaData,
  NsDiscussionForum,
  WidgetContentService,
} from '@ws-widget/collection'
import { ViewerUtilService } from '../../viewer-util.service'
import { NsWidgetResolver } from '@ws-widget/resolver'

@Component({
  selector: 'viewer-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss'],
})
export class AudioComponent implements OnInit, OnDestroy {
  private routeDataSubscription: Subscription | null = null
  private screenSizeSubscription: Subscription | null = null
  private viewerDataSubscription: Subscription | null = null
  isScreenSizeSmall = false
  isNotEmbed = true
  isFetchingDataComplete = false
  forPreview = window.location.href.includes('/author/')
  audioData: NsContent.IContent | null = null
  widgetResolverAudioData: NsWidgetResolver.IRenderConfigWithTypedData<
    IWidgetsPlayerMediaData
  > | null = null
  discussionForumWidget: NsWidgetResolver.IRenderConfigWithTypedData<
    NsDiscussionForum.IDiscussionForumInput
  > | null = null
  constructor(
    private activatedRoute: ActivatedRoute,
    private contentSvc: WidgetContentService,
    private valueSvc: ValueService,
    private viewerSvc: ViewerUtilService,
    private accessControlSvc: AccessControlService,
  ) {}

  ngOnInit() {
    this.screenSizeSubscription = this.valueSvc.isXSmall$.subscribe(data => {
      this.isScreenSizeSmall = data
    })
    this.isNotEmbed = !(
      window.location.href.includes('/embed/') ||
      this.activatedRoute.snapshot.queryParams.embed === 'true'
    )
    if (
      this.activatedRoute.snapshot.queryParamMap.get('preview') &&
      !this.accessControlSvc.authoringConfig.newDesign
    ) {
      // to do make sure the data updates for two consecutive resource of same mimeType
      this.viewerDataSubscription = this.viewerSvc
        .getContent(this.activatedRoute.snapshot.paramMap.get('resourceId') || '')
        .subscribe(data => {
          this.audioData = data
          if (this.audioData) {
            this.formDiscussionForumWidget(this.audioData)
          }
          this.widgetResolverAudioData = this.initWidgetResolverAudioData()
          this.widgetResolverAudioData.widgetData.url = this.audioData
            ? `/apis/authContent/${encodeURIComponent(this.audioData.artifactUrl)}`
            : ''
          this.widgetResolverAudioData.widgetData.disableTelemetry = true
          this.isFetchingDataComplete = true
        })
      // this.htmlData = this.viewerDataSvc.resource
    } else {
      this.routeDataSubscription = this.activatedRoute.data.subscribe(
        async data => {
          this.widgetResolverAudioData = null
          this.audioData = data.content.data
          if (this.audioData) {
            this.formDiscussionForumWidget(this.audioData)
          }
          if (this.audioData && this.audioData.artifactUrl.indexOf('content-store') >= 0) {
            await this.setS3Cookie(this.audioData.identifier)
          }
          this.widgetResolverAudioData = this.initWidgetResolverAudioData()
          if (this.audioData && this.audioData.identifier) {
            if (this.activatedRoute.snapshot.queryParams.collectionId) {
              await this.fetchContinueLearning(
                this.activatedRoute.snapshot.queryParams.collectionId,
                this.audioData.identifier,
              )
            } else {
              await this.fetchContinueLearning(this.audioData.identifier, this.audioData.identifier)
            }
          }
          if (this.forPreview) {
            this.widgetResolverAudioData.widgetData.disableTelemetry = true
          }
          this.widgetResolverAudioData.widgetData.url = this.audioData
            ? this.forPreview
              ? this.viewerSvc.getAuthoringUrl(this.audioData.artifactUrl)
              : this.audioData.artifactUrl
            : ''
          this.widgetResolverAudioData.widgetData.identifier = this.audioData
            ? this.audioData.identifier
            : ''
          this.widgetResolverAudioData = JSON.parse(JSON.stringify(this.widgetResolverAudioData))
          this.isFetchingDataComplete = true
        },
        () => {},
      )
    }
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

  initWidgetResolverAudioData() {
    return {
      widgetType: 'player',
      widgetSubType: 'playerAudio',
      widgetData: {
        disableTelemetry: false,
        url: '',
        identifier: '',
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

  async fetchContinueLearning(collectionId: string, audioId: string): Promise<boolean> {
    return new Promise(resolve => {
      this.contentSvc.fetchContentHistory(collectionId).subscribe(
        data => {
          if (data) {
            if (
              data.identifier === audioId &&
              data.continueData &&
              data.continueData.progress &&
              this.widgetResolverAudioData
            ) {
              this.widgetResolverAudioData.widgetData.resumePoint = Number(
                data.continueData.progress,
              )
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
      .catch(() => {
        // throw new DataResponseError('COOKIE_SET_FAILURE')
      })
    return
  }
}
