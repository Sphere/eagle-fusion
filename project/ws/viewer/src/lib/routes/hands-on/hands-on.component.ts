import { Component, OnInit, OnDestroy } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Subscription } from 'rxjs'
import { EventService, WsEvents } from '@ws-widget/utils'
import { NsContent, WidgetContentService } from '@ws-widget/collection'
import { ActivatedRoute } from '@angular/router'
import { ViewerUtilService } from '../../viewer-util.service'

@Component({
  selector: 'viewer-hands-on',
  templateUrl: './hands-on.component.html',
  styleUrls: ['./hands-on.component.scss'],
})
export class HandsOnComponent implements OnInit, OnDestroy {
  private routeDataSubscription: Subscription | null = null
  isFetchingDataComplete = false
  isErrorOccured = false
  forPreview = window.location.href.includes('/author/')
  handsOnData: NsContent.IContent | null = null
  oldData: NsContent.IContent | null = null
  alreadyRaised = false
  handsOnManifest: any
  constructor(
    private eventSvc: EventService,
    private activatedRoute: ActivatedRoute,
    private contentSvc: WidgetContentService,
    private http: HttpClient,
    private viewSvc: ViewerUtilService,
  ) {}

  ngOnInit() {
    this.routeDataSubscription = this.activatedRoute.data.subscribe(
      async data => {
        this.handsOnData = data.content.data
        if (this.alreadyRaised && this.oldData) {
          this.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, this.oldData)
        }
        if (this.handsOnData && this.handsOnData.artifactUrl.indexOf('content-store') >= 0) {
          await this.setS3Cookie(this.handsOnData.identifier)
        }
        if (this.handsOnData && this.handsOnData.mimeType === NsContent.EMimeTypes.HANDS_ON) {
          this.handsOnManifest = await this.transformHandsOn(this.handsOnData)
        }
        if (this.handsOnData && this.handsOnManifest) {
          this.oldData = this.handsOnData
          this.alreadyRaised = true
          this.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, this.handsOnData)
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
      && this.handsOnData) {
      await this.contentSvc.continueLearning(this.handsOnData.identifier,
                                             this.activatedRoute.snapshot.queryParams.collectionId,
                                             this.activatedRoute.snapshot.queryParams.collectionType,
      )
    } else if (this.handsOnData) {
      await this.contentSvc.continueLearning(this.handsOnData.identifier)
    }
    if (this.handsOnData) {
      this.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, this.handsOnData)
    }
    if (this.routeDataSubscription) {
      this.routeDataSubscription.unsubscribe()
    }
  }

  private async transformHandsOn(_content: NsContent.IContent) {
    let manifestFile = ''
    if (this.handsOnData && this.handsOnData.artifactUrl) {
      const artifactUrl = this.forPreview
        ? this.viewSvc.getAuthoringUrl(this.handsOnData.artifactUrl)
        : this.handsOnData.artifactUrl
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
    const event = {
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Info,
      from: 'hands-on',
      to: '',
      data: {
        state,
        type: WsEvents.WsTimeSpentType.Player,
        mode: WsEvents.WsTimeSpentMode.Play,
        content: data,
        identifier: data ? data.identifier : null,
        mimeType: NsContent.EMimeTypes.HANDS_ON,
        url: data ? data.artifactUrl : null,
      },
    }
    this.eventSvc.dispatchEvent(event)
  }
}
