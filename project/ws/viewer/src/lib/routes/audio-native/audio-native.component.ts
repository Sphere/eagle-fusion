import { Component, OnInit, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'
import { ValueService, ConfigurationsService } from '@ws-widget/utils'
import { ActivatedRoute } from '@angular/router'
import { NsContent, NsDiscussionForum, WidgetContentService } from '@ws-widget/collection'
import { ViewerUtilService } from '../../viewer-util.service'
import { NsWidgetResolver } from '@ws-widget/resolver'

@Component({
  selector: 'viewer-audio-native',
  templateUrl: './audio-native.component.html',
  styleUrls: ['./audio-native.component.scss'],
})
export class AudioNativeComponent implements OnInit, OnDestroy {
  private routeDataSubscription: Subscription | null = null
  private screenSizeSubscription: Subscription | null = null
  private viewerDataSubscription: Subscription | null = null
  isScreenSizeSmall = false
  isFetchingDataComplete = false
  audioData: NsContent.IContent | null = null
  discussionForumWidget: NsWidgetResolver.IRenderConfigWithTypedData<
    NsDiscussionForum.IDiscussionForumInput
  > | null = null
  defaultThumbnail = ''
  isPreviewMode = false
  forPreview = window.location.href.includes('/author/')

  constructor(
    private activatedRoute: ActivatedRoute,
    private contentSvc: WidgetContentService,
    private valueSvc: ValueService,
    private viewerSvc: ViewerUtilService,
    private configSvc: ConfigurationsService,
  ) {}

  ngOnInit() {
    if (this.configSvc.instanceConfig) {
      this.defaultThumbnail = this.configSvc.instanceConfig.logos.defaultContent
    }
    this.screenSizeSubscription = this.valueSvc.isXSmall$.subscribe(data => {
      this.isScreenSizeSmall = data
    })
    this.routeDataSubscription = this.activatedRoute.data.subscribe(
      async data => {
        this.audioData = data.content.data
        if (this.audioData) {
          this.formDiscussionForumWidget(this.audioData)
          this.audioData.artifactUrl = this.forPreview
            ? this.viewerSvc.getAuthoringUrl(this.audioData.artifactUrl)
            : this.audioData.artifactUrl
          if (this.audioData.appIcon) {
            this.defaultThumbnail = this.forPreview
              ? this.viewerSvc.getAuthoringUrl(this.audioData.appIcon)
              : this.audioData.appIcon
          } else {
            if (this.configSvc.instanceConfig) {
              this.defaultThumbnail = this.configSvc.instanceConfig.logos.defaultContent
            }
          }
        }
        if (this.audioData && this.audioData.artifactUrl.indexOf('content-store') >= 0) {
          await this.setS3Cookie(this.audioData.identifier)
        }
        this.saveContinueLearning(this.audioData)
        this.isFetchingDataComplete = true
      },
      () => {},
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

  saveContinueLearning(content: NsContent.IContent | null) {
    this.contentSvc
      .saveContinueLearning({
        contextPathId: content ? content.identifier : '',
        resourceId: content ? content.identifier : '',
        data: JSON.stringify({ timestamp: Date.now() }),
        dateAccessed: Date.now(),
      })
      .toPromise()
      .catch()
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
      .catch(() => {
        // throw new DataResponseError('COOKIE_SET_FAILURE')
      })
    return
  }
}
