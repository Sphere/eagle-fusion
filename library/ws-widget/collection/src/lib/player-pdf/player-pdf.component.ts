import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core'
import { FormControl } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { EventService, LoggerService, WsEvents, ValueService } from '@ws-widget/utils'
import * as PDFJS from 'pdfjs-dist/webpack'
import { fromEvent, interval, merge, Subject, Subscription } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { ViewerUtilService } from '../../../../../../project/ws/viewer/src/lib/viewer-util.service'
import { ROOT_WIDGET_CONFIG } from '../collection.config'
import { NsContent } from '../_services/widget-content.model'
import { WidgetContentService } from '../_services/widget-content.service'
import { IWidgetsPlayerPdfData } from './player-pdf.model'

const pdfjsViewer = require('pdfjs-dist/web/pdf_viewer')
@Component({
  selector: 'ws-widget-player-pdf',
  templateUrl: './player-pdf.component.html',
  styleUrls: ['./player-pdf.component.scss'],
})
export class PlayerPdfComponent extends WidgetBaseComponent
  implements OnInit, AfterViewInit, OnDestroy, OnChanges, NsWidgetResolver.IWidgetData<any> {
  @Input() widgetData!: IWidgetsPlayerPdfData
  @ViewChild('fullScreenContainer', { static: true })
  containerSection!: ElementRef<HTMLElement>

  @ViewChild('pdfContainer', { static: true })
  pdfContainer!: ElementRef<HTMLCanvasElement>
  DEFAULT_SCALE = 1.0
  MAX_SCALE = 3
  MIN_SCALE = 0.2
  CSS_UNITS = 96 / 72
  totalPages = 0
  currentPage = new FormControl(0)
  zoom = new FormControl(this.DEFAULT_SCALE)
  isSmallViewPort = false
  realTimeProgressRequest = {
    content_type: 'Resource',
    current: ['0'],
    max_size: 0,
    mime_type: NsContent.EMimeTypes.PDF,
    user_id_type: 'uuid',
  }
  current: string[] = []
  identifier: string | null = null
  enableTelemetry = false
  private pdfInstance: PDFJS.PDFDocumentProxy | null = null
  private activityStartedAt: Date | null = null
  private renderSubject = new Subject()
  private lastRenderTask: any | null = null
  // Subscriptions
  private contextMenuSubs: Subscription | null = null
  private renderSubscriptions: Subscription | null = null
  private runnerSubs: Subscription | null = null
  private routerSubs: Subscription | null = null
  public isInFullScreen = false
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private eventSvc: EventService,
    private logger: LoggerService,
    private contentSvc: WidgetContentService,
    private viewerSvc: ViewerUtilService,
    private valueSvc: ValueService,
  ) {
    super()
  }

  changeScale(val: 'zoomin' | 'zoomout') {
    const currentZoom = this.zoom.value
    const step = 0.1
    if (val === 'zoomin') {
      this.zoom.setValue(currentZoom + step)
    } else {
      this.zoom.setValue(currentZoom - step)
    }
  }

  fullScreenState(state: boolean) {
    this.isInFullScreen = state
  }

  ngOnInit() {
    // SimpleLinkService does not support handling of relative link switching PDFLinkService
    pdfjsViewer.SimpleLinkService.prototype.getDestinationHash =
      pdfjsViewer.PDFLinkService.prototype.getDestinationHash
    pdfjsViewer.SimpleLinkService.prototype.getAnchorUrl =
      pdfjsViewer.PDFLinkService.prototype.getAnchorUrl

    this.zoom.disable()
    this.currentPage.disable()
    this.valueSvc.isLtMedium$.subscribe(ltMedium => {
      if (ltMedium) {
        this.zoom.setValue(0.5)
      }
    })
    this.widgetData.disableTelemetry = false
    if (this.widgetData.readValuesQueryParamsKey) {
      const keys = this.widgetData.readValuesQueryParamsKey
      this.activatedRoute.queryParamMap.pipe(distinctUntilChanged()).subscribe(params => {
        const pageNumber = Number(params.get(keys.pageNumber))
        const zoom = Number(params.get(keys.zoom))
        if (pageNumber > 0 && pageNumber <= this.totalPages) {
          this.currentPage.setValue(pageNumber)
        }
        if (zoom > 0) {
          this.zoom.setValue(zoom)
        }
      })
    }

    this.renderSubscriptions = merge(
      this.zoom.valueChanges.pipe(distinctUntilChanged()),
      this.currentPage.valueChanges.pipe(distinctUntilChanged()),
      this.renderSubject.asObservable(),
    )
      .pipe(debounceTime(250))
      .subscribe(async _ => {
        if (this.widgetData.readValuesQueryParamsKey) {
          const { zoom, pageNumber } = this.widgetData.readValuesQueryParamsKey
          const params = this.activatedRoute.snapshot.queryParamMap
          if (
            Number(params.get(zoom)) !== this.zoom.value ||
            Number(params.get(pageNumber)) !== this.currentPage.value
          ) {
            this.router.navigate([], {
              queryParams: {
                [pageNumber]: this.currentPage.value,
                [zoom]: this.zoom.value,
              },
            })
          }
        }
        await this.render()
        setTimeout(() => this.preserveAllApiCalls(), 500)
      })

    if (!this.widgetData.disableTelemetry) {
      this.runnerSubs = interval(30000).subscribe(_ => {
        this.eventDispatcher(WsEvents.EnumTelemetrySubType.HeartBeat)
      })
      this.eventDispatcher(WsEvents.EnumTelemetrySubType.Init)
    }
  }
  ngOnChanges() {
    // if (this.widgetData !== this.oldData) {
    //   if (this.totalPages > 0) {
    //     this.saveContinueLearning()
    //     this.fireRealTimeProgress()
    //     this.realTimeProgressRequest = {
    //       content_type: 'Resource',
    //       current: ['0'],
    //       max_size: 0,
    //       mime_type: NsContent.EMimeTypes.PDF,
    //       user_id_type: 'uuid',
    //     }
    //     this.current = ['1']
    //   }
    // }
  }
  ngAfterViewInit() {
    this.contextMenuSubs = fromEvent(this.pdfContainer.nativeElement, 'contextmenu').subscribe(e =>
      e.preventDefault(),
    )
    if (this.widgetData && this.widgetData.pdfUrl) {
      this.loadDocument(this.widgetData.pdfUrl)
      if (this.widgetData.identifier) {
        this.identifier = this.widgetData.identifier
      }
    }
    if (this.containerSection.nativeElement.clientWidth < 400) {
      this.isSmallViewPort = true
    }
    document.addEventListener('textlayerrendered', _event => {
      const pdfLinks = document.getElementsByClassName('linkAnnotation')
      for (let i = 0; i < pdfLinks.length; i += 1) {
        if (pdfLinks[i].getElementsByTagName('a')[0] && !pdfLinks[i].getElementsByTagName('a')[0].classList.contains('internalLink')) {
          pdfLinks[i].getElementsByTagName('a')[0].setAttribute('target', 'blank')
        }
      }
    })
  }
  ngOnDestroy() {
    if (this.identifier) {
      this.saveContinueLearning(this.identifier)
      this.fireRealTimeProgress(this.identifier)
    }
    if (this.contextMenuSubs) {
      this.contextMenuSubs.unsubscribe()
    }
    if (this.renderSubscriptions) {
      this.renderSubscriptions.unsubscribe()
    }
    if (this.runnerSubs) {
      this.runnerSubs.unsubscribe()
    }
    if (!this.widgetData.disableTelemetry) {
      this.eventDispatcher(WsEvents.EnumTelemetrySubType.Unloaded)
    }
    if (this.routerSubs) {
      this.routerSubs.unsubscribe()
    }
  }
  loadPageNum(pageNum: number) {
    this.raiseTelemetry('pageChange')
    if (pageNum < 1 || pageNum > this.totalPages) {
      return
    }
    this.currentPage.setValue(pageNum)
    if (!this.widgetData.disableTelemetry) {
      this.eventDispatcher(WsEvents.EnumTelemetrySubType.StateChange)
    }
  }
  raiseTelemetry(action: string) {
    if (this.identifier) {
      this.eventSvc.raiseInteractTelemetry(action, 'click', {
        contentId: this.identifier,
      })
    }
  }
  saveContinueLearning(id: string) {
    if (this.activatedRoute.snapshot.queryParams.collectionType &&
      this.activatedRoute.snapshot.queryParams.collectionType.toLowerCase() === 'playlist') {
      const reqBody = {
        contextPathId: this.activatedRoute.snapshot.queryParams.collectionId
          ? this.activatedRoute.snapshot.queryParams.collectionId
          : id,
        resourceId: id,
        contextType: 'playlist',
        dateAccessed: Date.now(),
        data: JSON.stringify({
          progress: this.currentPage.value,
          timestamp: Date.now(),
          contextFullPath: [this.activatedRoute.snapshot.queryParams.collectionId, id],
        }),
      }
      this.contentSvc
        .saveContinueLearning(reqBody)
        .toPromise()
        .catch()
    } else {
      const reqBody = {
        contextPathId: this.activatedRoute.snapshot.queryParams.collectionId
          ? this.activatedRoute.snapshot.queryParams.collectionId
          : id,
        resourceId: id,
        dateAccessed: Date.now(),
        data: JSON.stringify({
          progress: this.currentPage.value,
          timestamp: Date.now(),
        }),
      }
      this.contentSvc
        .saveContinueLearning(reqBody)
        .toPromise()
        .catch()
    }
  }
  fireRealTimeProgress(id: string) {
    if (this.totalPages > 0 && this.current.length > 0) {
      const realTimeProgressRequest = {
        ...this.realTimeProgressRequest,
        max_size: this.totalPages,
        current: this.current,
      }
      this.viewerSvc.realTimeProgressUpdate(id, realTimeProgressRequest)
    }
    return
  }

  private async render(): Promise<boolean> {
    if (!this.pdfContainer || this.pdfInstance === null) {
      return false
    }
    this.pdfContainer.nativeElement.innerHTML = ''
    const page = await this.pdfInstance.getPage(this.currentPage.value)
    // if (this.zoom.pristine) {
    //   const viewportWithNoScale = page.getViewport({ scale: this.DEFAULT_SCALE })
    //   const zoom = this.containerSection.nativeElement.clientWidth / (viewportWithNoScale.width)
    //   if (this.zoom.value !== Math.min(2, Math.floor(zoom * 100) / 100)) {
    //     this.zoom.setValue(Math.min(2, Math.floor(zoom * 100) / 100))
    //   }
    // }
    const pageNumStr = this.currentPage.value.toString()
    if (!this.current.includes(pageNumStr)) {
      this.current.push(pageNumStr)
    }
    const viewport = page.getViewport({ scale: this.zoom.value })
    this.pdfContainer.nativeElement.width = viewport.width
    this.pdfContainer.nativeElement.height = viewport.height
    this.lastRenderTask = new pdfjsViewer.PDFPageView({
      scale: viewport.scale,
      container: this.pdfContainer.nativeElement,
      id: this.currentPage.value,
      defaultViewport: viewport,
      textLayerFactory: new pdfjsViewer.DefaultTextLayerFactory(),
      annotationLayerFactory: new pdfjsViewer.DefaultAnnotationLayerFactory(),
    })
    if (this.lastRenderTask) {
      this.lastRenderTask.setPdfPage(page)
      this.lastRenderTask.draw()
    }
    return true
  }

  refresh() {
    this.renderSubject.next()
  }

  private async loadDocument(url: string) {
    const pdf = await PDFJS.getDocument(url).promise
    this.pdfInstance = pdf
    this.totalPages = this.pdfInstance.numPages
    this.zoom.enable()
    this.currentPage.enable()
    this.currentPage.setValue(
      typeof this.widgetData.resumePage === 'number' &&
        this.widgetData.resumePage >= 1 &&
        this.widgetData.resumePage <= this.totalPages
        ? this.widgetData.resumePage
        : 1,
    )
    this.renderSubject.next()
    this.activityStartedAt = new Date()
    if (!this.widgetData.disableTelemetry) {
      this.eventDispatcher(WsEvents.EnumTelemetrySubType.Loaded)
    }
  }

  private eventDispatcher(
    eventType: WsEvents.EnumTelemetrySubType,
    activity: WsEvents.EnumTelemetryPdfActivity = WsEvents.EnumTelemetryPdfActivity.NONE,
  ) {
    if (this.widgetData.disableTelemetry) {
      return
    }
    const commonStructure: WsEvents.WsEventTelemetryPDF = {
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Info,
      from: {
        type: 'widget',
        widgetType: ROOT_WIDGET_CONFIG.player._type,
        widgetSubType: ROOT_WIDGET_CONFIG.player.pdf,
      },
      to: '',
      data: {
        eventSubType: eventType,
        activityType: activity,
        currentPage: this.currentPage.value,
        totalPage: this.totalPages,
        activityStartedAt: this.activityStartedAt,
      },
      passThroughData: this.widgetData.passThroughData,
    }

    switch (eventType) {
      case WsEvents.EnumTelemetrySubType.HeartBeat:
      case WsEvents.EnumTelemetrySubType.Init:
      case WsEvents.EnumTelemetrySubType.Loaded:
      case WsEvents.EnumTelemetrySubType.StateChange:
      case WsEvents.EnumTelemetrySubType.Unloaded:
        break
      default:
        return
    }
    if (this.enableTelemetry) {
      this.eventSvc.dispatchEvent(commonStructure)
    }
  }

  // Function which listens on relative link calls and trigger page load
  preserveAllApiCalls() {
    const links = Array.prototype.slice.call(document.getElementsByTagName('a'))
    for (let i = 0; i < links.length; i = i + 1) {
      if (links[i].className.includes('internalLink')) {
        links[i].addEventListener('click', async (e: any) => {
          const layer = unescape((new URL(e.toElement.href).hash as string).slice(1))
          const pageIndex: any = JSON.parse(layer)
            // tslint:disable-next-line: whitespace
            ; (this.pdfInstance as any)
              .getPageIndex(pageIndex[0])
              .then((pageNumber: number) => {
                this.currentPage.setValue(pageNumber + 1)
              })
              .catch((ex: any) => {
                this.logger.error(ex)
              })
        })
      }
    }
  }
}
