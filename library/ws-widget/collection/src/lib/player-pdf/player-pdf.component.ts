import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core'
import { UntypedFormControl } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { EventService, WsEvents, TelemetryService, ConfigurationsService, UtilityService, LoggerService } from '@ws-widget/utils'
import {
  interval, merge, Subject, Subscription,
} from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { ViewerUtilService } from '../../../../../../project/ws/viewer/src/lib/viewer-util.service'
import { ROOT_WIDGET_CONFIG } from '../collection.config'
import { NsContent } from '../_services/widget-content.model'
import { WidgetContentService } from '../_services/widget-content.service'
import { IWidgetsPlayerPdfData } from './player-pdf.model'
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer'
import { ViewerDataService } from 'project/ws/viewer/src/lib/viewer-data.service'

@Component({
  standalone: false,
  selector: 'ws-widget-player-pdf',
  templateUrl: './player-pdf.component.html',
  styleUrls: ['./player-pdf.component.scss'],

})
export class PlayerPdfComponent extends WidgetBaseComponent
  implements OnInit, AfterViewInit, OnDestroy, NsWidgetResolver.IWidgetData<any> {
  @Input() widgetData!: IWidgetsPlayerPdfData
  @ViewChild('fullScreenContainer', { static: true }) fullScreenContainer: any
  @ViewChild('input', { static: true }) input: any
  containerSection!: ElementRef<HTMLElement>

  DEFAULT_SCALE = 1.0
  MAX_SCALE = 3
  MIN_SCALE = 0.2
  CSS_UNITS = 96 / 72
  totalPages = 0
  currentPage = new UntypedFormControl(1)
  // zoom = new FormControl(this.DEFAULT_SCALE)
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
  private activityStartedAt: Date | null = null
  private renderSubject = new Subject()
  private lastRenderTask: any | null = null
  private lastSentPage = -1  // Track last page we sent progress for
  private maxPageReached = 0  // Highest page ever viewed — progress never goes below this
  private contentDataFetched = false  // Track if we've already fetched contentData
  private contentHistoryResponse: any = null  // Store full progress response for messaging
  // Subscriptions
  private contextMenuSubs: Subscription | null = null
  private renderSubscriptions: Subscription | null = null
  private runnerSubs: Subscription | null = null
  private routerSubs: Subscription | null = null
  public isInFullScreen = false
  contentData: any
  pdfHeight = 'calc(100vh - 355px)'
  pdfMobileHeight = '300px'
  pdfZoom = '28%'
  sidebarOpen = false
  pdfViewerReady = false  // Start hidden; enabled after delay to let old PDFViewerApplication clean up

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private eventSvc: EventService,
    private contentSvc: WidgetContentService,
    private viewerSvc: ViewerUtilService,
    private configSvc: ConfigurationsService,
    private readonly utilitySvc: UtilityService,
    public viewerDataSvc: ViewerDataService,
    private readonly telemetrySvc: TelemetryService,
    private logger: LoggerService,
  ) {
    super()
    pdfDefaultOptions.assetsFolder = 'bleeding-edge'
  }

  // changeScale(val: 'zoomin' | 'zoomout') {
  //   const currentZoom = this.zoom.value
  //   const step = 0.1
  //   if (val === 'zoomin') {
  //     this.zoom.setValue(currentZoom + step)
  //   } else {
  //     this.zoom.setValue(currentZoom - step)
  //   }
  // }

  fullScreenState(fsState: any) {
    this.isInFullScreen = fsState.state
    if (fsState) {
      this.pdfHeight = '100vh'
      this.pdfMobileHeight = 'calc(100vh - 50px)'
      this.pdfZoom = '40%'
    } else {
      this.pdfHeight = 'calc(100vh - 355px)'
      this.pdfMobileHeight = '200px'
      this.pdfZoom = '28%'
      // const diplayedPagesCount = fsState.mode.includes('portrait') ? 2 : 1
      // if (this.currentPage.value + diplayedPagesCount >= this.totalPages) {
      //   setTimeout(() => {
      //     this.currentPage.setValue(this.totalPages)
      //   }, 500)
      // }
    }
    // this.renderSubject.next()
  }

  ngOnInit() {
    // Delay showing the PDF viewer to allow any previous PDFViewerApplication
    // singleton to fully clean up its eventBus before we create a new instance.
    // setTimeout with 0 defers to the next macrotask, which is enough for cleanup.
    this.pdfViewerReady = true

    // this.zoom.disable()
    this.currentPage.disable()
    // this.valueSvc.isLtMedium$.subscribe(ltMedium => {
    //   if (ltMedium) {
    //     this.zoom.setValue(0.5)
    //   }
    // })
    // this.valueSvc.isXSmall$.subscribe(isXSmall => {
    //   if (isXSmall) {
    //     this.zoom.setValue(0.4)
    //   }
    // })

    this.widgetData.disableTelemetry = false
    if (this.widgetData.readValuesQueryParamsKey) {
      const keys = this.widgetData.readValuesQueryParamsKey
      this.activatedRoute.queryParamMap.pipe(distinctUntilChanged()).subscribe(params => {
        const pageNumber = Number(params.get(keys.pageNumber))
        if (pageNumber > 0 && pageNumber <= this.totalPages) {
          this.currentPage.setValue(pageNumber)
        }
      })
    }

    this.renderSubscriptions = merge(
      this.currentPage.valueChanges.pipe(distinctUntilChanged()),
      this.renderSubject.asObservable(),
    )

      .pipe(debounceTime(250))
      .subscribe(async _ => {
        if (this.widgetData.readValuesQueryParamsKey) {
          const { pageNumber } = this.widgetData.readValuesQueryParamsKey
          const params = this.activatedRoute.snapshot.queryParamMap
          if (
            Number(params.get(pageNumber)) !== this.currentPage.value
          ) {
            this.router.navigate([], {
              queryParams: {
                [pageNumber]: this.currentPage.value,
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

  ngAfterViewInit() {
    if (this.widgetData && this.widgetData.pdfUrl) {
      if (this.widgetData.identifier) {
        this.identifier = this.widgetData.identifier
      }
    }
    if (this.containerSection && this.containerSection.nativeElement.clientWidth < 400) {
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
    if (this.input) {
      this.input.underlineRef.nativeElement.className = null
    }
  }

  ngOnDestroy() {
    this.pdfViewerReady = false

    // Remove any stale locale link tags left by ngx-extended-pdf-viewer.
    // If these remain, the next viewer instance detects them as "user-provided"
    // translations and skips adding its own, breaking locale initialization.
    document.querySelectorAll('link[type="application/l10n"]').forEach(el => el.remove())

    if (this.identifier) {
      this.fireRealTimeProgress(this.identifier)
    }
    // Reset tracking variables
    this.lastSentPage = -1
    this.maxPageReached = 0
    this.contentDataFetched = false

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
    // this.raiseTelemetry('pageChange')
    if (pageNum < 1 || pageNum > this.totalPages) {
      return
    }
    this.currentPage.setValue(pageNum)
    // if (!this.widgetData.disableTelemetry) {
    //   this.eventDispatcher(WsEvents.EnumTelemetrySubType.StateChange)
    // }
    this.telemetrySvc.interact('application/pdf', 'page-change', 'player', {
      id: this.widgetData.identifier,
      type: 'application/pdf',
      version: '',
    })
  }
  // raiseTelemetry(action: string) {
  //   if (this.identifier) {
  //     this.eventSvc.raiseInteractTelemetry(action, 'click', {
  //       contentId: this.identifier,
  //     })
  //   }
  // }

  fireRealTimeProgress(id: string) {
    // Finalize telemetry only - API calls already made on start and last page
    const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?? this.widgetData.identifier
    const data1: any = {
      "id": this.widgetData.identifier,
      "type": "application/pdf",
      "version": "",
      "rollup": {
        "l1": collectionId,
        "l2": id,
      },
    }
    const extras: any = {
      values: [{
        courseID: this.activatedRoute.snapshot.queryParams.collectionId ?? this.widgetData.identifier,
        contentId: this.widgetData.identifier,
        name: this.viewerDataSvc.resource?.name || '',  // Add null check
        moduleId: this.viewerDataSvc.resource?.parent ? this.viewerDataSvc.resource.parent : undefined,
      }],
    }
    // End telemetry session
    this.telemetrySvc.end('application/pdf', 'pdf-close', 'player', data1, extras)
    return
  }

  private async render(): Promise<boolean> {
    // if (!this.pdfContainer || this.pdfInstance === null) {
    //   return false
    // }
    // this.pdfContainer.nativeElement.innerHTML = ''
    // const page = await this.pdfInstance.getPage(this.currentPage.value)

    const pageNumStr = this.currentPage.value.toString()
    if (!this.current.includes(pageNumStr)) {
      this.current.push(pageNumStr)
    }
    // const viewport = page.getViewport({ scale: this.zoom.value })
    // this.pdfContainer.nativeElement.width = viewport.width
    // this.pdfContainer.nativeElement.height = viewport.height
    // this.lastRenderTask = new pdfjsViewer.PDFPageView({
    //   scale: viewport.scale,
    //   container: this.pdfContainer.nativeElement,
    //   id: this.currentPage.value,
    //   defaultViewport: viewport,
    //   textLayerFactory: new pdfjsViewer.DefaultTextLayerFactory(),
    //   annotationLayerFactory: new pdfjsViewer.DefaultAnnotationLayerFactory(),
    // })
    if (this.lastRenderTask) {
      // this.lastRenderTask.setPdfPage(page)
      this.lastRenderTask.draw()
    }

    // Only fetch contentData once, not on every render
    if (!this.contentDataFetched) {
      this.contentDataFetched = true
      let userId
      if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId || ''
      }
      const req: NsContent.IContinueLearningDataReq = {
        request: {
          userId,
          batchId: this.activatedRoute.snapshot.queryParams.batchId,
          courseId: this.activatedRoute.snapshot.queryParams.collectionId || '',
          contentIds: [this.identifier || ''],  // Include current resource ID
          fields: ['progressdetails'],
        },
      }
      this.contentSvc.fetchContentHistoryV2(req).subscribe(
        data => {
          // Store full response for later messaging to TOC
          this.contentHistoryResponse = data['result']
          // Cache single item contentData
          this.contentData = data['result']['contentList'].find((obj: any) => obj.contentId === this.identifier)

          // Initialize maxPageReached from server-stored progress so we never go below it
          if (this.contentData?.progressdetails?.current) {
            const serverPage = Array.isArray(this.contentData.progressdetails.current)
              ? parseInt(this.contentData.progressdetails.current[0] || '0', 10)
              : parseInt(this.contentData.progressdetails.current || '0', 10)
            if (serverPage > this.maxPageReached) {
              this.maxPageReached = serverPage
            }
          }

          // Now trigger the progress check logic
          this.checkAndUpdateProgress()
        })
    } else {
      // Use cached contentData - check progress without fetching API
      this.checkAndUpdateProgress()
    }

    return true
  }

  private checkAndUpdateProgress() {
    if (this.identifier) {
      // Update the high-water mark — progress is always based on the furthest page reached
      if (this.currentPage.value > this.maxPageReached) {
        this.maxPageReached = this.currentPage.value
      }

      const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?? this.widgetData.identifier
      const batchId = this.activatedRoute.snapshot.queryParams.batchId ?? this.widgetData.identifier

      // Calculate percentage from the highest page ever reached, not the current page
      let percentMilis = (this.maxPageReached / this.totalPages) * 100

      // If highest page is the last page, set to 100% completion
      if (this.maxPageReached >= this.totalPages) {
        percentMilis = 100
      }

      const percent = parseFloat(percentMilis.toFixed(2))

      // Only update if new percentage is strictly greater than stored percentage
      const storedPercentage = this.contentData?.completionPercentage || 0
      if (percent <= storedPercentage) {
        // Don't degrade or re-send same progress — skip API call
        return
      }

      const realTimeProgressRequest = {
        ...this.realTimeProgressRequest,
        max_size: this.totalPages,
        current: [this.maxPageReached.toString()],  // Always send highest page reached
      }

      // Only send if we've reached a new high page
      if (this.maxPageReached !== this.lastSentPage) {
        this.lastSentPage = this.maxPageReached
        this.makeProgressUpdate(realTimeProgressRequest, percent, collectionId, batchId)
      }
    }
  }

  private makeProgressUpdate(realTimeProgressRequest: any, percent: number, collectionId: string, batchId: string) {
    // realTimeProgressRequest.current already contains [maxPageReached] — use it directly
    const updateRequest = { ...realTimeProgressRequest }

    const highestPage = this.maxPageReached
    const status = this.viewerSvc.getStatus(highestPage, updateRequest.max_size, updateRequest.mime_type)

    this.viewerSvc.realTimeProgressUpdateV3(this.identifier || '', updateRequest, collectionId, batchId).subscribe(
      () => {
        // Keep local cache in sync so the guard in checkAndUpdateProgress stays effective
        if (this.contentData) {
          this.contentData.completionPercentage = percent
        } else {
          this.contentData = { completionPercentage: percent }
        }

        // Ensure we have contentHistoryResponse before sending message to TOC
        if (!this.contentHistoryResponse || !this.contentHistoryResponse.contentList || this.contentHistoryResponse.contentList.length === 0) {
          // Fetch full progress data if not already cached or empty
          let userId
          if (this.configSvc.userProfile) {
            userId = this.configSvc.userProfile.userId || ''
          }
          const req: NsContent.IContinueLearningDataReq = {
            request: {
              userId,
              batchId,
              courseId: collectionId,
              contentIds: [this.identifier || ''],  // Include current resource ID to get its progress
              fields: ['progressdetails'],
            },
          }
          this.contentSvc.fetchContentHistoryV2(req).subscribe(
            data => {
              // Now we have the full response
              this.contentHistoryResponse = data['result']
              this.sendProgressMessageToTOC(percent, status)
            }
          )
        } else {
          // We already have contentHistoryResponse, send message immediately
          this.sendProgressMessageToTOC(percent, status)
        }
      },
      error => {
        this.logger.error('Error updating progress:', error)
      }
    )
  }

  private sendProgressMessageToTOC(percent: number, status: number) {
    // Always create message for TOC - even if contentList is empty or missing,
    // TOC needs to know about the completion to update the tree
    if (this.contentHistoryResponse) {
      let contentList = this.contentHistoryResponse.contentList || []

      // If contentList is empty, create an entry for at least this resource
      if (contentList.length === 0) {
        this.logger.warn('contentHistoryResponse has empty contentList, creating minimal entry for TOC', {
          identifier: this.identifier,
          percent,
          status,
        })
        contentList = [{
          contentId: this.identifier,
          completionPercentage: percent,
          status: status,
        }]
      } else {
        // Update existing content list with new completion percentage
        contentList = contentList.map((item: any) =>
          item.contentId === this.identifier
            ? { ...item, completionPercentage: percent, status }
            : item
        )
      }

      // Send message to TOC with the content list
      const messageData = { ...this.contentHistoryResponse, contentList: contentList, type: 'PDF' }
      this.logger.log('Sending progress message to TOC:', {
        contentListLen: contentList.length,
        identifier: this.identifier,
        completionPercentage: percent,
        status,
      })
      this.viewerSvc.generateInteractTelemetry('progress-update-success', { contentId: this.identifier, completionPercentage: percent, status, mimeType: 'application/pdf' })
      this.contentSvc.changeMessage(messageData)
    } else {
      this.logger.error('contentHistoryResponse is null/undefined', { identifier: this.identifier, percent, status })
    }
  }

  // refresh() {
  //   this.renderSubject.next()
  // }

  private async loadDocument() {
    // const pdf = await PDFJS.getDocument(url).promise
    // this.pdfInstance = pdf
    // this.totalPages = this.pdfInstance.numPages
    // this.zoom.enable()
    const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?? this.widgetData.identifier

    const object = {
      "id": this.widgetData.identifier,
      "type": "application/pdf",
      "version": "",
      "rollup": {
        "l1": collectionId,
        "l2": this.widgetData.identifier,
      },
    }
    this.telemetrySvc.start('application/pdf', 'pdf-start', 'player', object)
    this.currentPage.enable()
    this.currentPage.setValue(
      typeof this.widgetData.resumePage === 'number' &&
        this.widgetData.resumePage >= 1 &&
        this.widgetData.resumePage <= this.totalPages
        ? this.widgetData.resumePage
        : 1,
    )
    this.renderSubject.next(undefined)
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
        // links[i].addEventListener('click', async (e: any) => {
        //   const layer = unescape((new URL(e.toElement.href).hash as string).slice(1))
        //   const pageIndex: any = JSON.parse(layer)
        //     ; (this.pdfInstance as any)
        //       .getPageIndex(pageIndex[0])
        //       .then((pageNumber: number) => {
        //         this.currentPage.setValue(pageNumber + 1)
        //       })
        //       .catch((ex: any) => {
        //         this.logger.error(ex)
        //       })
        // })
      }
    }
  }

  documentLoded(event: any) {
    if (event) {
      this.totalPages = event.pagesCount
      this.loadDocument()
    }
  }

  get getPDFHeight(): string {
    if (this.utilitySvc.isMobile || window.innerWidth < 960) {
      return this.pdfMobileHeight
    }
    return this.pdfHeight
  }

  get getPDFZoom(): string {
    if (this.utilitySvc.isMobile) {
      return this.pdfZoom
    }
    return 'auto'
  }
}
