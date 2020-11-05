import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { NsContent, NsDiscussionForum, WidgetContentService } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { EventService, SubapplicationRespondService, WsEvents } from '@ws-widget/utils'
import { fromEvent, Subscription } from 'rxjs'
import { filter } from 'rxjs/operators'
import { ViewerUtilService } from '../../viewer-util.service'

@Component({
  selector: 'viewer-iap',
  templateUrl: './iap.component.html',
  styleUrls: ['./iap.component.scss'],
})
export class IapComponent implements OnInit, OnDestroy {
  private routeDataSubscription: Subscription | null = null
  private responseSubscription: Subscription | null = null
  forPreview = window.location.href.includes('/author/')
  isPreviewMode = false
  isFetchingDataComplete = false
  iapData: NsContent.IContent | null = null
  oldData: NsContent.IContent | null = null
  alreadyRaised = false
  discussionForumWidget: NsWidgetResolver.IRenderConfigWithTypedData<
    NsDiscussionForum.IDiscussionForumInput
  > | null = null
  constructor(
    private activatedRoute: ActivatedRoute,
    private contentSvc: WidgetContentService,
    private eventSvc: EventService,
    private viewerSvc: ViewerUtilService,
    private respondSvc: SubapplicationRespondService,
  ) { }
  ngOnInit() {
    if (this.activatedRoute.snapshot.queryParamMap.get('preview')) {
      this.isPreviewMode = true
      this.routeDataSubscription = this.viewerSvc.getContent(this.activatedRoute.snapshot.paramMap.get('resourceId') || '').subscribe(
        async data => {
          this.iapData = data
          if (this.iapData) {
            this.formDiscussionForumWidget(this.iapData)
            if (this.discussionForumWidget) {
              this.discussionForumWidget.widgetData.isDisabled = true
            }
          }
          if (this.iapData && this.iapData.artifactUrl.indexOf('content-store') >= 0) {
            await this.setS3Cookie(this.iapData.identifier)
          }
          this.isFetchingDataComplete = true
        },
      )
    } else {
      this.routeDataSubscription = this.activatedRoute.data.subscribe(
        async data => {
          this.iapData = data.content.data
          if (this.alreadyRaised && this.oldData) {
            this.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, this.oldData)
          }
          if (this.iapData) {
            this.formDiscussionForumWidget(this.iapData)
          }
          if (this.iapData && this.iapData.artifactUrl.indexOf('content-store') >= 0) {
            await this.setS3Cookie(this.iapData.identifier)
          }
          if (this.iapData && this.iapData.identifier) {
            this.oldData = this.iapData
            this.alreadyRaised = true
            this.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, this.iapData)
            this.responseSubscription = fromEvent<MessageEvent>(window, 'message')
              .pipe(
                filter(
                  (event: MessageEvent) =>
                    Boolean(event) &&
                    Boolean(event.data) &&
                    event.data.subApplicationName === 'IAP' &&
                    Boolean(event.source && typeof event.source.postMessage === 'function'),
                ),
              )
              .subscribe(async (event: MessageEvent) => {
                const contentWindow = event.source as Window
                if (event.data.requestId && event.data.subApplicationName === 'IAP' && this.iapData) {
                  switch (event.data.requestId) {
                    case 'LOADED':
                      this.respondSvc.loadedRespond(
                        contentWindow,
                        event.data.subApplicationName,
                        this.iapData.identifier,
                      )
                      break
                    default:
                      break
                  }
                }
              })
          }
          this.isFetchingDataComplete = true
        },
        () => {
        },
      )
    }
  }

  async ngOnDestroy() {
    if (this.activatedRoute.snapshot.queryParams.collectionId &&
      this.activatedRoute.snapshot.queryParams.collectionType
      && this.iapData) {
      await this.contentSvc.continueLearning(this.iapData.identifier,
                                             this.activatedRoute.snapshot.queryParams.collectionId,
                                             this.activatedRoute.snapshot.queryParams.collectionType,
      )
    } else if (this.iapData) {
      await this.contentSvc.continueLearning(this.iapData.identifier)
    }
    if (this.iapData) {
      this.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, this.iapData)
    }
    if (this.routeDataSubscription) {
      this.routeDataSubscription.unsubscribe()
    }
    if (this.responseSubscription) {
      this.respondSvc.unsubscribeResponse()
      this.responseSubscription.unsubscribe()
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
  raiseEvent(state: WsEvents.EnumTelemetrySubType, data: NsContent.IContent) {
    if (!this.forPreview) {
      const event = {
        eventType: WsEvents.WsEventType.Telemetry,
        eventLogLevel: WsEvents.WsEventLogLevel.Info,
        from: 'iap',
        to: '',
        data: {
          state,
          type: WsEvents.WsTimeSpentType.Player,
          mode: WsEvents.WsTimeSpentMode.Play,
          content: data,
          identifier: data ? data.identifier : null,
          mimeType: NsContent.EMimeTypes.IAP,
          url: data ? data.artifactUrl : null,
        },
      }
      this.eventSvc.dispatchEvent(event)
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
