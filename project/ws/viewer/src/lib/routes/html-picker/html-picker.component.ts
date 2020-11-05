import { Component, OnInit, OnDestroy } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Subscription } from 'rxjs'
import { NsContent, WidgetContentService } from '@ws-widget/collection'
import { ActivatedRoute } from '@angular/router'
import { EventService, WsEvents } from '@ws-widget/utils'
import { ViewerUtilService } from '../../viewer-util.service'

@Component({
  selector: 'viewer-html-picker',
  templateUrl: './html-picker.component.html',
  styleUrls: ['./html-picker.component.scss'],
})
export class HtmlPickerComponent implements OnInit, OnDestroy {
  private routeDataSubscription: Subscription | null = null
  forPreview = window.location.href.includes('/author/')
  isFetchingDataComplete = false
  oldData: NsContent.IContent | null = null
  alreadyRaised = false
  isErrorOccured = false
  htmlPickerData: NsContent.IContent | null = null
  htmlPickerManifest: any
  constructor(
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private contentSvc: WidgetContentService,
    private eventSvc: EventService,
    private viewSvc: ViewerUtilService,
  ) {}

  ngOnInit() {
    this.routeDataSubscription = this.activatedRoute.data.subscribe(
      async data => {
        this.htmlPickerData = data.content.data
        if (this.alreadyRaised && this.oldData) {
          this.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, this.oldData)
        }
        if (this.htmlPickerData && this.htmlPickerData.artifactUrl.indexOf('content-store') >= 0) {
          await this.setS3Cookie(this.htmlPickerData.identifier)
        }
        if (
          this.htmlPickerData &&
          this.htmlPickerData.mimeType === NsContent.EMimeTypes.HTML_PICKER
        ) {
          this.htmlPickerManifest = await this.transformHandsOn(this.htmlPickerData)
        }
        if (this.htmlPickerData && this.htmlPickerManifest) {
          this.oldData = this.htmlPickerData
          this.alreadyRaised = true
          this.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, this.htmlPickerData)
          this.isFetchingDataComplete = true
        } else {
          this.isErrorOccured = true
        }
      },
      () => {},
    )
  }

   async ngOnDestroy() {
     if (this.activatedRoute.snapshot.queryParams.collectionId &&
       this.activatedRoute.snapshot.queryParams.collectionType
       && this.htmlPickerData) {
       await this.contentSvc.continueLearning(this.htmlPickerData.identifier,
                                              this.activatedRoute.snapshot.queryParams.collectionId,
                                              this.activatedRoute.snapshot.queryParams.collectionType,
       )
       } else if (this.htmlPickerData) {
       await this.contentSvc.continueLearning(this.htmlPickerData.identifier)
       }
    if (this.routeDataSubscription) {
      this.routeDataSubscription.unsubscribe()
    }
    if (this.htmlPickerData) {
      this.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, this.htmlPickerData)
    }
  }

  private async transformHandsOn(_content: NsContent.IContent) {
    let manifestFile = ''
    if (this.htmlPickerData && this.htmlPickerData.artifactUrl) {
      const artifactUrl = this.forPreview
        ? this.viewSvc.getAuthoringUrl(this.htmlPickerData.artifactUrl)
        : this.htmlPickerData.artifactUrl
      manifestFile = await this.http
        .get<any>(artifactUrl)
        .toPromise()
        .catch((_err: any) => {})
    }
    return manifestFile
  }

  raiseEvent(state: WsEvents.EnumTelemetrySubType, data: NsContent.IContent) {
    if (!this.forPreview) {
      const event = {
        eventType: WsEvents.WsEventType.Telemetry,
        eventLogLevel: WsEvents.WsEventLogLevel.Info,
        from: 'html-picker',
        to: '',
        data: {
          state,
          type: WsEvents.WsTimeSpentType.Player,
          mode: WsEvents.WsTimeSpentMode.Play,
          content: data,
          identifier: data ? data.identifier : null,
          mimeType: NsContent.EMimeTypes.HTML_PICKER,
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
