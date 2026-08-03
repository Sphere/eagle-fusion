import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { AccessControlService } from '@ws/author'
import { NsContent, NsDiscussionForum, WidgetContentService } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import {
  EventService,
  SubapplicationRespondService,
  WsEvents,
  ConfigurationsService,
} from '@ws-widget/utils'
import { fromEvent, Subscription } from 'rxjs'
import { filter } from 'rxjs/operators'
import { ViewerUtilService } from '../../viewer-util.service'

@Component({
  standalone: false,
  selector: 'viewer-html',
  templateUrl: './html.component.html',
  styleUrls: ['./html.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class HtmlComponent implements OnInit, OnDestroy {
  private routeDataSubscription: Subscription | null = null
  private responseSubscription: Subscription | null = null
  private viewerDataSubscription: Subscription | null = null
  forPreview = window.location.href.includes('/author/')
  isNotEmbed = true
  isFetchingDataComplete = false
  htmlData: NsContent.IContent | null = null
  oldData: NsContent.IContent | null = null
  alreadyRaised = false
  subApp = false
  discussionForumWidget: NsWidgetResolver.IRenderConfigWithTypedData<
    NsDiscussionForum.IDiscussionForumInput
  > | null = null
  uuid: string | null | undefined = null
  realTimeProgressRequest = {
    content_type: 'Resource',
    current: ['0'],
    max_size: 0,
    mime_type: NsContent.EMimeTypes.HTML,
    user_id_type: 'uuid',
  }
  realTimeProgressTimer: any
  hasFiredRealTimeProgress = false
  isPreviewMode = false
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly contentSvc: WidgetContentService,
    private readonly viewerSvc: ViewerUtilService,
    private readonly respondSvc: SubapplicationRespondService,
    private readonly eventSvc: EventService,
    private readonly accessControlSvc: AccessControlService,
    private readonly configSvc: ConfigurationsService
  ) { }

  ngOnInit() {
    this.uuid = this.configSvc.userProfile ? this.configSvc.userProfile.userId : ''
    this.isNotEmbed = !(
      window.location.href.includes('/embed/') ||
      this.activatedRoute.snapshot.queryParams.embed === 'true'
    )
    if (
      this.activatedRoute.snapshot.queryParamMap.get('preview') === 'true' &&
      !this.accessControlSvc.authoringConfig.newDesign
    ) {
      this.isPreviewMode = true
      // to do make sure the data updates for two consecutive resource of same mimeType
      this.viewerDataSubscription = this.viewerSvc
        .getContent(this.activatedRoute.snapshot.paramMap.get('resourceId') || '')
        .subscribe(
          data => {
            void (async () => {
              data.artifactUrl = (data.artifactUrl.startsWith('https://')
                ? data.artifactUrl
                : data.artifactUrl.startsWith('http://')
                  ? data.artifactUrl
                  : `https://${data.artifactUrl}`).replace(/ /ig, '').replace(/%20/ig, '').replace(/\n/ig, '')
              if (this.accessControlSvc.hasAccess(data as any, true)) {
                if (data && data.artifactUrl.indexOf('content-store') >= 0) {
                  await this.setS3Cookie(data.identifier)
                  this.htmlData = data
                } else {
                  this.htmlData = data
                }

              }
              if (this.htmlData) {
                this.formDiscussionForumWidget(this.htmlData)
                if (this.discussionForumWidget) {
                  this.discussionForumWidget.widgetData.isDisabled = true
                }
              }
            })()
          })
    } else {
      this.routeDataSubscription = this.activatedRoute.data.subscribe(
        data => {
          void (async () => {
            data.content.data.artifactUrl =
              data.content.data.artifactUrl.indexOf('ScormCoursePlayer') > -1
                ? `${data.content.data.artifactUrl.replace(/%20/g, '')}&Param1=${this.uuid}`
                : data.content.data.artifactUrl.replace(/%20/g, '')
            const tempHtmlData = data.content.data
            if (this.alreadyRaised && this.oldData) {
              this.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, this.oldData)
              if (!this.hasFiredRealTimeProgress) {
                if (this.realTimeProgressTimer) {
                  clearTimeout(this.realTimeProgressTimer)
                }
              }
              this.subApp = false
            }
            if (tempHtmlData) {
              this.formDiscussionForumWidget(tempHtmlData)
            }
            if (tempHtmlData && tempHtmlData.artifactUrl.indexOf('content-store') >= 0) {
              await this.setS3Cookie(tempHtmlData.identifier)
              this.htmlData = tempHtmlData
            } else {
              this.htmlData = tempHtmlData
            }
            this.raiseRealTimeProgress()
            if (this.htmlData) {
              this.oldData = this.htmlData
              this.alreadyRaised = true
              this.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, this.htmlData)
              this.responseSubscription = fromEvent<MessageEvent>(window, 'message')
                .pipe(
                  filter(
                    (event: MessageEvent) =>
                      Boolean(event) &&
                      Boolean(event.data) &&
                      Boolean(event.source && typeof event.source.postMessage === 'function'),
                  ),
                )
                .subscribe((event: MessageEvent) => {
                  void (async () => {
                    const contentWindow = event.source as Window
                    if (event.data.requestId && this.htmlData) {
                      switch (event.data.requestId) {
                        case 'LOADED':
                          await this.respondSvc.loadedRespond(
                            contentWindow,
                            event.data.subApplicationName,
                            this.htmlData.identifier,
                          )
                          if (event.data.subApplicationName === 'RBCP') {
                            this.subApp = true
                          }
                          break
                        case 'TELEMETRY':
                          await this.respondSvc.telemetryEvents(event.data)
                          break
                        default:
                          break
                      }
                    }
                  })()
                })
            }
            this.isFetchingDataComplete = true
          })()
        },
        () => { },
      )
    }
  }

  ngOnDestroy() {
    void (async () => {
      if (this.htmlData) {
        this.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, this.htmlData)
      }
      if (this.routeDataSubscription) {
        this.routeDataSubscription.unsubscribe()
      }
      if (this.responseSubscription) {
        this.respondSvc.unsubscribeResponse()
        this.responseSubscription.unsubscribe()
      }
      if (this.viewerDataSubscription) {
        this.viewerDataSubscription.unsubscribe()
      }
    })()
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
      })
    return
  }

  raiseEvent(state: WsEvents.EnumTelemetrySubType, data: NsContent.IContent) {
    if (this.forPreview) {
      return
    }
    const event = {
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Info,
      from: 'html',
      to: '',
      data: {
        state,
        type: WsEvents.WsTimeSpentType.Player,
        mode: WsEvents.WsTimeSpentMode.Play,
        courseId: null,
        content: data,
        identifier: data ? data.identifier : null,
        isCompleted: true,
        mimeType: NsContent.EMimeTypes.HTML,
        isIdeal: false,
        url: data ? data.artifactUrl : null,
      },
    }
    this.eventSvc.dispatchEvent(event)
  }

  private raiseRealTimeProgress() {
    if (this.forPreview) {
      return
    }

    this.realTimeProgressRequest = {
      ...this.realTimeProgressRequest,
      current: ['1'],
      max_size: 1,
    }
    if (this.realTimeProgressTimer) {
      clearTimeout(this.realTimeProgressTimer)
    }
    this.hasFiredRealTimeProgress = false
    this.realTimeProgressTimer = setTimeout(() => {
      this.hasFiredRealTimeProgress = true
      this.fireRealTimeProgress()
      // tslint:disable-next-line: align
    }, 2 * 60 * 1000)
  }

  private fireRealTimeProgress() {
    if (this.forPreview) {
      return
    }
    if (this.htmlData) {
      if (
        this.htmlData.contentType === NsContent.EContentTypes.COURSE &&
        this.htmlData.isExternal
      ) {
        return
      }
      if (
        this.htmlData.resourceType &&
        this.htmlData.resourceType.toLowerCase() === 'certification'
      ) {
        return
      }
    }
    if ((this.htmlData || ({} as any)).isIframeSupported &&
      (this.htmlData || ({} as any)).isIframeSupported.toLowerCase() !== 'yes') {
      return
    }
    if (this.htmlData) {
      if (this.htmlData.sourceName === 'Cross Knowledge') {
        return
      }
    }
    this.realTimeProgressRequest.content_type = this.htmlData ? this.htmlData.contentType : ''
    return
  }
}
