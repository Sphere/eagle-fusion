import { Component, OnInit, OnDestroy } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Subscription } from 'rxjs'
import { EventService, WsEvents } from '@ws-widget/utils'
import { NsContent, WidgetContentService } from '@ws-widget/collection'
import { ActivatedRoute } from '@angular/router'
import { ViewerUtilService } from '../../viewer-util.service'

@Component({
  selector: 'viewer-rdbms-hands-on',
  templateUrl: './rdbms-hands-on.component.html',
  styleUrls: ['./rdbms-hands-on.component.scss'],
})
export class RdbmsHandsOnComponent implements OnInit, OnDestroy {
  private dataSubscription: Subscription | null = null
  forPreview = window.location.href.includes('/author/')
  isFetchingDataComplete = false
  isErrorOccured = false
  rDbmsHandsOnData: NsContent.IContent | null = null
  oldData: NsContent.IContent | null = null
  alreadyRaised = false
  rDbmsHandsOnManifest: any
  constructor(
    private eventSvc: EventService,
    private activatedRoute: ActivatedRoute,
    private contentSvc: WidgetContentService,
    private http: HttpClient,
    private viewSvc: ViewerUtilService,
  ) {}

  ngOnInit() {
    this.dataSubscription = this.activatedRoute.data.subscribe(
      async data => {
        this.isFetchingDataComplete = false
        this.rDbmsHandsOnData = data.content.data
        if (this.alreadyRaised && this.oldData) {
          this.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, this.oldData)
        }
        if (
          this.rDbmsHandsOnData &&
          this.rDbmsHandsOnData.artifactUrl.indexOf('content-store') >= 0
        ) {
          await this.setS3Cookie(this.rDbmsHandsOnData.identifier)
        }
        if (
          this.rDbmsHandsOnData &&
          this.rDbmsHandsOnData.mimeType === NsContent.EMimeTypes.RDBMS_HANDS_ON
        ) {
          this.rDbmsHandsOnManifest = await this.transformRDbmsModule(this.rDbmsHandsOnData)
        }
        if (this.rDbmsHandsOnData && this.rDbmsHandsOnManifest) {
          this.oldData = this.rDbmsHandsOnData
          this.alreadyRaised = true
          this.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, this.rDbmsHandsOnData)
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
      && this.rDbmsHandsOnData) {
      await this.contentSvc.continueLearning(this.rDbmsHandsOnData.identifier,
                                             this.activatedRoute.snapshot.queryParams.collectionId,
                                             this.activatedRoute.snapshot.queryParams.collectionType,
      )
    } else if (this.rDbmsHandsOnData) {
      await this.contentSvc.continueLearning(this.rDbmsHandsOnData.identifier)
    }
    if (this.rDbmsHandsOnData) {
      this.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, this.rDbmsHandsOnData)
    }
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe()
    }
  }

  private async transformRDbmsModule(_content: NsContent.IContent) {
    let manifestFile = ''
    if (this.rDbmsHandsOnData && this.rDbmsHandsOnData.artifactUrl) {
      const artifactUrl = this.forPreview
        ? this.viewSvc.getAuthoringUrl(this.rDbmsHandsOnData.artifactUrl)
        : this.rDbmsHandsOnData.artifactUrl
      manifestFile = await this.http
        .get<any>(artifactUrl)
        .toPromise()
        .catch((_err: any) => {})
    }
    return manifestFile
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

  raiseEvent(state: WsEvents.EnumTelemetrySubType, data: NsContent.IContent) {
    if (this.forPreview) {
      return
    }
    const event = {
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Info,
      from: 'rdbms-hands-on',
      to: '',
      data: {
        state,
        type: WsEvents.WsTimeSpentType.Player,
        mode: WsEvents.WsTimeSpentMode.Play,
        content: data,
        identifier: data ? data.identifier : null,
        mimeType: NsContent.EMimeTypes.RDBMS_HANDS_ON,
        url: data ? data.artifactUrl : null,
      },
    }
    this.eventSvc.dispatchEvent(event)
  }
}
