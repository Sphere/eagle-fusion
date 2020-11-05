import { Component, OnInit, OnDestroy } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Subscription } from 'rxjs'
import { NsContent, NsDiscussionForum, WidgetContentService } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ActivatedRoute } from '@angular/router'
import { EventService, WsEvents } from '@ws-widget/utils'
import { ViewerUtilService } from '../../viewer-util.service'

@Component({
  selector: 'viewer-web-module',
  templateUrl: './web-module.component.html',
  styleUrls: ['./web-module.component.scss'],
})
export class WebModuleComponent implements OnInit, OnDestroy {
  private dataSubscription: Subscription | null = null
  private telemetryIntervalSubscription: Subscription | null = null
  forPreview = window.location.href.includes('/author/') || window.location.href.includes('?preview=true')
  isFetchingDataComplete = false
  isErrorOccured = false
  webmoduleData: NsContent.IContent | null = null
  oldData: NsContent.IContent | null = null
  alreadyRaised = false
  webmoduleManifest: any
  discussionForumWidget: NsWidgetResolver.IRenderConfigWithTypedData<
    NsDiscussionForum.IDiscussionForumInput
  > | null = null
  constructor(
    private activatedRoute: ActivatedRoute,
    private contentSvc: WidgetContentService,
    private http: HttpClient,
    private eventSvc: EventService,
    private viewSvc: ViewerUtilService,
  ) { }

  ngOnInit() {
    this.dataSubscription = this.viewSvc
      .getContent(this.activatedRoute.snapshot.paramMap.get('resourceId') || '')
      .subscribe(
        // this.dataSubscription = this.activatedRoute.data.subscribe(

        async data => {
          // this.webmoduleData = data.content.data
          this.webmoduleData = data
          if (this.alreadyRaised && this.oldData) {
            this.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, this.oldData)
          }
          if (this.webmoduleData) {
            this.formDiscussionForumWidget(this.webmoduleData)
          }
          if (!this.forPreview && this.webmoduleData && this.webmoduleData.artifactUrl.indexOf('content-store') >= 0) {
            await this.setS3Cookie(this.webmoduleData.identifier)
          }
          if (
            this.webmoduleData &&
            (this.webmoduleData.mimeType === NsContent.EMimeTypes.WEB_MODULE ||
              this.webmoduleData.mimeType === NsContent.EMimeTypes.WEB_MODULE_EXERCISE)
          ) {
            this.webmoduleManifest = await this.transformWebmodule(this.webmoduleData)
          }
          if (this.webmoduleData && this.webmoduleData.identifier) {
            this.webmoduleData.resumePage = 1
            if (this.activatedRoute.snapshot.queryParams.collectionId) {
              await this.fetchContinueLearning(this.activatedRoute.snapshot.queryParams.collectionId, this.webmoduleData.identifier)
            } else {
              await this.fetchContinueLearning(this.webmoduleData.identifier, this.webmoduleData.identifier)
            }
          }
          if (this.webmoduleData && this.webmoduleManifest) {
            this.oldData = this.webmoduleData
            this.alreadyRaised = true
            this.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, this.webmoduleData)
            this.isFetchingDataComplete = true
          } else {
            this.isErrorOccured = true
          }
        },
        () => { },
      )
    // this.telemetryIntervalSubscription = interval(30000).subscribe(() => {
    //   if (this.webmoduleData && this.webmoduleData.identifier) {
    //     this.raiseEvent(WsEvents.EnumTelemetrySubType.HeartBeat)
    //   }
    // })
  }

  ngOnDestroy() {
    if (this.webmoduleData) {
      this.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, this.webmoduleData)
    }
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe()
    }
    if (this.telemetryIntervalSubscription) {
      this.telemetryIntervalSubscription.unsubscribe()
    }
  }

  private async transformWebmodule(_content: NsContent.IContent) {
    let manifestFile = ''
    if (this.webmoduleData && this.webmoduleData.artifactUrl) {
      const artifactUrl = this.viewSvc.getAuthoringUrl(this.webmoduleData.artifactUrl)
      this.webmoduleData.artifactUrl = artifactUrl
      manifestFile = await this.http
        .get<any>(artifactUrl || '')
        .toPromise()
        .catch((_err: any) => { })
    }
    return manifestFile
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
    if (this.forPreview) {
      return
    }
    const event = {
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Info,
      from: 'web-module',
      to: '',
      data: {
        state,
        type: WsEvents.WsTimeSpentType.Player,
        mode: WsEvents.WsTimeSpentMode.Play,
        content: data,
        identifier: data ? data.identifier : null,
        mimeType: NsContent.EMimeTypes.WEB_MODULE,
        url: data ? data.artifactUrl : null,
      },
    }
    this.eventSvc.dispatchEvent(event)
  }
  async fetchContinueLearning(collectionId: string, webModuleId: string): Promise<boolean> {
    return new Promise(resolve => {
      this.contentSvc.fetchContentHistory(collectionId).subscribe(
        data => {
          if (data) {
            if (
              data.identifier === webModuleId
              && data.continueData
              && data.continueData.progress
              && this.webmoduleData
            ) {
              this.webmoduleData.resumePage = Number(data.continueData.progress)
            }
          }
          resolve(true)
        },
        () => resolve(true))
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
