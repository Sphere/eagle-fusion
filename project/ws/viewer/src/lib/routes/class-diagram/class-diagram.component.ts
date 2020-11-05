import { Component, OnInit, OnDestroy } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Subscription } from 'rxjs'
import { NsContent, WidgetContentService } from '@ws-widget/collection'
import { ValueService, EventService, WsEvents } from '@ws-widget/utils'
import { ActivatedRoute } from '@angular/router'
import { ViewerUtilService } from '../../viewer-util.service'

@Component({
  selector: 'viewer-class-diagram',
  templateUrl: './class-diagram.component.html',
  styleUrls: ['./class-diagram.component.scss'],
})
export class ClassDiagramComponent implements OnInit, OnDestroy {
  private routeDataSubscription: Subscription | null = null
  private isSmallSubscription: Subscription | null = null
  private isLtMedium$ = this.valueSvc.isLtMedium$
  public isLtMedium = false
  forPreview = window.location.href.includes('/author/')
  isFetchingDataComplete = false
  isErrorOccured = false
  classDiagramData: NsContent.IContent | null = null
  oldData: NsContent.IContent | null = null
  alreadyRaised = false
  classDiagramManifest: any

  constructor(
    private activatedRoute: ActivatedRoute,
    private contentSvc: WidgetContentService,
    private http: HttpClient,
    private valueSvc: ValueService,
    private eventSvc: EventService,
    private viewSvc: ViewerUtilService,
  ) {}

  ngOnInit() {
    this.isSmallSubscription = this.isLtMedium$.subscribe(isSmall => {
      this.isLtMedium = isSmall
    })

    this.routeDataSubscription = this.activatedRoute.data.subscribe(
      async data => {
        this.classDiagramData = data.content.data
        if (this.alreadyRaised && this.oldData) {
          this.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, this.oldData)
        }
        if (
          this.classDiagramData &&
          this.classDiagramData.artifactUrl.indexOf('content-store') >= 0
        ) {
          await this.setS3Cookie(this.classDiagramData.identifier)
        }
        if (
          this.classDiagramData &&
          this.classDiagramData.mimeType === NsContent.EMimeTypes.CLASS_DIAGRAM
        ) {
          this.classDiagramManifest = await this.transformClassDiagram(this.classDiagramData)
        }
        if (this.classDiagramData && this.classDiagramManifest) {
          this.oldData = this.classDiagramData
          this.alreadyRaised = true
          this.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, this.classDiagramData)
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
      && this.classDiagramData) {
      await this.contentSvc.continueLearning(this.classDiagramData.identifier,
                                             this.activatedRoute.snapshot.queryParams.collectionId,
                                             this.activatedRoute.snapshot.queryParams.collectionType,
      )
    } else if (this.classDiagramData) {
      await this.contentSvc.continueLearning(this.classDiagramData.identifier)
    }
    if (this.routeDataSubscription) {
      this.routeDataSubscription.unsubscribe()
    }
    if (this.isSmallSubscription) {
      this.isSmallSubscription.unsubscribe()
    }
    if (this.classDiagramData) {
      this.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, this.classDiagramData)
    }
  }

  private async transformClassDiagram(_content: NsContent.IContent) {
    let manifestFile = ''
    if (this.classDiagramData && this.classDiagramData.artifactUrl) {
      const artifactUrl = this.forPreview
        ? this.viewSvc.getAuthoringUrl(this.classDiagramData.artifactUrl)
        : this.classDiagramData.artifactUrl
      manifestFile = await this.http
        .get<any>(artifactUrl)
        .toPromise()
        .catch((_err: any) => {})
    }
    return manifestFile
  }

  raiseEvent(state: WsEvents.EnumTelemetrySubType, data: NsContent.IContent) {
    const event = {
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Info,
      from: 'class-diagram',
      to: '',
      data: {
        state,
        type: WsEvents.WsTimeSpentType.Player,
        mode: WsEvents.WsTimeSpentMode.Play,
        content: data,
        identifier: data ? data.identifier : null,
        mimeType: NsContent.EMimeTypes.CLASS_DIAGRAM,
        url: data ? data.artifactUrl : null,
      },
    }
    this.eventSvc.dispatchEvent(event)
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
