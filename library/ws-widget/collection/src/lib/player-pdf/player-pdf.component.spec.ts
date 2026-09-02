jest.mock('ngx-extended-pdf-viewer', () => ({
  pdfDefaultOptions: {},
}))
jest.mock('@ws-widget/utils', () => ({
  WsEvents: {
    EnumTelemetrySubType: {
      HeartBeat: 'HeartBeat', Init: 'Init', Loaded: 'Loaded', StateChange: 'StateChange', Unloaded: 'Unloaded',
    },
    EnumTelemetryPdfActivity: { NONE: 'NONE' },
    WsEventType: { Telemetry: 'Telemetry' },
    WsEventLogLevel: { Info: 'Info' },
  },
}))

import { of, throwError } from 'rxjs'
import { PlayerPdfComponent } from './player-pdf.component'

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0))

describe('PlayerPdfComponent', () => {
  let component: PlayerPdfComponent
  let mockActivatedRoute: any
  let mockRouter: any
  let mockEventSvc: any
  let mockContentSvc: any
  let mockViewerSvc: any
  let mockConfigSvc: any
  let mockUtilitySvc: any
  let mockViewerDataSvc: any
  let mockTelemetrySvc: any
  let mockLogger: any

  const buildComponent = () => new PlayerPdfComponent(
    mockActivatedRoute,
    mockRouter,
    mockEventSvc,
    mockContentSvc,
    mockViewerSvc,
    mockConfigSvc,
    mockUtilitySvc,
    mockViewerDataSvc,
    mockTelemetrySvc,
    mockLogger,
  )

  beforeEach(() => {
    jest.clearAllMocks()
    mockActivatedRoute = {
      snapshot: { queryParams: {}, queryParamMap: { get: jest.fn() } },
      queryParamMap: { pipe: jest.fn().mockReturnValue({ subscribe: jest.fn() }) },
    }
    mockRouter = { navigate: jest.fn() }
    mockEventSvc = { dispatchEvent: jest.fn() }
    mockContentSvc = {
      fetchContentHistoryV2: jest.fn().mockReturnValue(of({
        result: { contentList: [{ contentId: 'id1', completionPercentage: 0 }] },
      })),
      changeMessage: jest.fn(),
    }
    mockViewerSvc = {
      realTimeProgressUpdateV3: jest.fn().mockReturnValue(of({})),
      getStatus: jest.fn().mockReturnValue(1),
      generateInteractTelemetry: jest.fn(),
    }
    mockConfigSvc = { userProfile: { userId: 'u1' } }
    mockUtilitySvc = { isMobile: false }
    mockViewerDataSvc = { resource: { name: 'res', parent: 'p1' } }
    mockTelemetrySvc = { start: jest.fn(), interact: jest.fn(), end: jest.fn() }
    mockLogger = { log: jest.fn(), error: jest.fn(), warn: jest.fn() }

    component = buildComponent()
    component.widgetData = {
      identifier: 'id1',
      pdfUrl: 'http://x.pdf',
      disableTelemetry: false,
    } as any
    component.totalPages = 10
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('fullScreenState', () => {
    it('sets fullscreen dimensions when state true', () => {
      component.fullScreenState({ state: true })
      expect(component.isInFullScreen).toBe(true)
      expect(component.pdfHeight).toBe('100vh')
    })

    it('resets dimensions when state false', () => {
      component.fullScreenState({ state: false })
      expect(component.isInFullScreen).toBe(false)
      expect(component.pdfHeight).toBe('calc(100vh - 355px)')
    })
  })

  describe('ngOnInit', () => {
    it('sets pdfViewerReady true and disables currentPage control', () => {
      component.ngOnInit()
      expect(component.pdfViewerReady).toBe(true)
      expect(component.currentPage.disabled).toBe(true)
    })

    it('subscribes to queryParamMap when readValuesQueryParamsKey present', () => {
      component.widgetData.readValuesQueryParamsKey = { zoom: 'z', pageNumber: 'p' }
      const subscribeMock = jest.fn()
      mockActivatedRoute.queryParamMap.pipe.mockReturnValue({ subscribe: subscribeMock })
      component.ngOnInit()
      expect(subscribeMock).toHaveBeenCalled()
    })

    it('sets currentPage when pageNumber param valid within totalPages', () => {
      component.widgetData.readValuesQueryParamsKey = { zoom: 'z', pageNumber: 'p' }
      let capturedCb: any
      mockActivatedRoute.queryParamMap.pipe.mockReturnValue({
        subscribe: (cb: any) => { capturedCb = cb },
      })
      component.ngOnInit()
      capturedCb({ get: () => '5' })
      expect(component.currentPage.value).toBe(5)
    })

    it('starts telemetry heartbeat interval and dispatches when enableTelemetry flag on', () => {
      jest.useFakeTimers()
      component['enableTelemetry'] = true
      component.ngOnInit()
      jest.advanceTimersByTime(30001)
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
      jest.useRealTimers()
    })

    it('does not dispatch telemetry when disableTelemetry true', () => {
      component.widgetData.disableTelemetry = true
      component.ngOnInit()
      expect(mockEventSvc.dispatchEvent).not.toHaveBeenCalled()
    })
  })

  describe('ngAfterViewInit', () => {
    it('sets identifier when pdfUrl and identifier present', () => {
      component.ngAfterViewInit()
      expect(component.identifier).toBe('id1')
    })

    it('sets isSmallViewPort true when containerSection width < 400', () => {
      component.containerSection = { nativeElement: { clientWidth: 300 } } as any
      component.ngAfterViewInit()
      expect(component.isSmallViewPort).toBe(true)
    })

    it('sets underlineRef className to null when input present', () => {
      component.input = { underlineRef: { nativeElement: { className: 'x' } } }
      component.ngAfterViewInit()
      expect(component.input.underlineRef.nativeElement.className).toBeNull()
    })

    it('registers textlayerrendered listener that updates internal links target', () => {
      component.ngAfterViewInit()
      const a = document.createElement('a')
      const div = document.createElement('div')
      div.className = 'linkAnnotation'
      div.appendChild(a)
      document.body.appendChild(div)
      document.dispatchEvent(new Event('textlayerrendered'))
      expect(a.getAttribute('target')).toBe('blank')
      document.body.removeChild(div)
    })
  })

  describe('ngOnDestroy', () => {
    it('cleans up state, unsubscribes, dispatches unloaded and removes stale link tags', () => {
      component.identifier = 'id1'
      component['enableTelemetry'] = true
      component['lastSentPage'] = 5
      component['maxPageReached'] = 3
      component['contentDataFetched'] = true;
      (component as any).contextMenuSubs = { unsubscribe: jest.fn() }
      component['renderSubscriptions'] = { unsubscribe: jest.fn() } as any
      component['runnerSubs'] = { unsubscribe: jest.fn() } as any
      const link = document.createElement('link')
      link.setAttribute('type', 'application/l10n')
      document.head.appendChild(link)

      component.ngOnDestroy()

      expect(component.pdfViewerReady).toBe(false)
      expect(component['lastSentPage']).toBe(-1)
      expect(component['maxPageReached']).toBe(0)
      expect(component['contentDataFetched']).toBe(false)
      expect(mockTelemetrySvc.end).toHaveBeenCalled()
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
      expect(document.querySelectorAll('link[type="application/l10n"]').length).toBe(0)
    })

    it('is safe when identifier and subscriptions are null', () => {
      component.identifier = null
      expect(() => component.ngOnDestroy()).not.toThrow()
    })

    it('does not dispatch unloaded telemetry when disableTelemetry true', () => {
      component.widgetData.disableTelemetry = true
      component.ngOnDestroy()
      expect(mockEventSvc.dispatchEvent).not.toHaveBeenCalled()
    })
  })

  describe('loadPageNum', () => {
    it('sets currentPage and dispatches telemetry interact for a valid page', () => {
      component.loadPageNum(5)
      expect(component.currentPage.value).toBe(5)
      expect(mockTelemetrySvc.interact).toHaveBeenCalled()
    })

    it('ignores invalid page numbers (0, negative, or beyond totalPages)', () => {
      component.loadPageNum(0)
      component.loadPageNum(-1)
      component.loadPageNum(100)
      expect(mockTelemetrySvc.interact).not.toHaveBeenCalled()
    })

    it('coerces string page number', () => {
      component.loadPageNum('7' as any)
      expect(component.currentPage.value).toBe(7)
    })
  })

  describe('fireRealTimeProgress', () => {
    it('calls telemetrySvc.end with rollup data', () => {
      component.fireRealTimeProgress('id1')
      expect(mockTelemetrySvc.end).toHaveBeenCalledWith(
        'application/pdf', 'pdf-close', 'player', expect.any(Object), expect.any(Object),
      )
    })
  })

  describe('render / checkAndUpdateProgress / makeProgressUpdate / sendProgressMessageToTOC', () => {
    beforeEach(() => {
      component.identifier = 'id1'
      component.currentPage.setValue(5)
    })

    it('fetches contentData first time and calls checkAndUpdateProgress', async () => {
      await component['render']()
      expect(mockContentSvc.fetchContentHistoryV2).toHaveBeenCalled()
      expect(component['contentDataFetched']).toBe(true)
    })

    it('uses cached contentData on subsequent renders', async () => {
      component['contentDataFetched'] = true
      component['contentData'] = { completionPercentage: 100 }
      await component['render']()
      expect(mockContentSvc.fetchContentHistoryV2).not.toHaveBeenCalled()
    })

    it('initializes maxPageReached from server progress array', async () => {
      mockContentSvc.fetchContentHistoryV2.mockReturnValue(of({
        result: {
          contentList: [{ contentId: 'id1', completionPercentage: 0, progressdetails: { current: ['7'] } }],
        },
      }))
      await component['render']()
      expect(component['maxPageReached']).toBe(7)
    })

    it('initializes maxPageReached from server progress non-array', async () => {
      component.currentPage.setValue(2)
      mockContentSvc.fetchContentHistoryV2.mockReturnValue(of({
        result: {
          contentList: [{ contentId: 'id1', completionPercentage: 0, progressdetails: { current: '4' } }],
        },
      }))
      await component['render']()
      expect(component['maxPageReached']).toBe(4)
    })

    it('checkAndUpdateProgress sends update when percent increases past stored value', () => {
      component['contentData'] = { completionPercentage: 0 }
      component['checkAndUpdateProgress']()
      expect(mockViewerSvc.realTimeProgressUpdateV3).toHaveBeenCalled()
    })

    it('checkAndUpdateProgress sets 100% when maxPageReached equals totalPages', () => {
      component.currentPage.setValue(10)
      component['contentData'] = { completionPercentage: 0 }
      component['checkAndUpdateProgress']()
      expect(mockViewerSvc.realTimeProgressUpdateV3).toHaveBeenCalled()
    })

    it('checkAndUpdateProgress skips when percent does not exceed stored value', () => {
      component['contentData'] = { completionPercentage: 90 }
      component['maxPageReached'] = 1
      component['checkAndUpdateProgress']()
      expect(mockViewerSvc.realTimeProgressUpdateV3).not.toHaveBeenCalled()
    })

    it('checkAndUpdateProgress skips when maxPageReached equals lastSentPage', () => {
      component['maxPageReached'] = 5
      component['lastSentPage'] = 5
      component['contentData'] = { completionPercentage: 0 }
      component['checkAndUpdateProgress']()
      expect(mockViewerSvc.realTimeProgressUpdateV3).not.toHaveBeenCalled()
    })

    it('checkAndUpdateProgress does nothing when identifier missing', () => {
      component.identifier = null
      component['checkAndUpdateProgress']()
      expect(mockViewerSvc.realTimeProgressUpdateV3).not.toHaveBeenCalled()
    })

    it('makeProgressUpdate fetches contentHistory and sends message to TOC when not cached', async () => {
      component['contentHistoryResponse'] = null
      component['makeProgressUpdate']({ max_size: 10, mime_type: 'application/pdf' }, 50, 'col1', 'batch1')
      await flushPromises()
      expect(mockContentSvc.changeMessage).toHaveBeenCalled()
    })

    it('makeProgressUpdate uses cached contentHistoryResponse directly', () => {
      component['contentHistoryResponse'] = { contentList: [{ contentId: 'id1' }] }
      component['makeProgressUpdate']({ max_size: 10, mime_type: 'application/pdf' }, 50, 'col1', 'batch1')
      expect(mockContentSvc.changeMessage).toHaveBeenCalled()
    })

    it('makeProgressUpdate creates contentData when not previously set', () => {
      component['contentData'] = null
      component['contentHistoryResponse'] = { contentList: [{ contentId: 'id1' }] }
      component['makeProgressUpdate']({ max_size: 10, mime_type: 'application/pdf' }, 50, 'col1', 'batch1')
      expect(component['contentData'].completionPercentage).toBe(50)
    })

    it('makeProgressUpdate logs error on API failure', () => {
      mockViewerSvc.realTimeProgressUpdateV3.mockReturnValue(throwError(() => new Error('fail')))
      component['makeProgressUpdate']({ max_size: 10, mime_type: 'application/pdf' }, 50, 'col1', 'batch1')
      expect(mockLogger.error).toHaveBeenCalledWith('Error updating progress:', expect.any(Error))
    })

    it('makeProgressUpdate logs error when second contentHistory fetch fails', async () => {
      component['contentHistoryResponse'] = null
      mockContentSvc.fetchContentHistoryV2.mockReturnValue(throwError(() => new Error('fail2')))
      component['makeProgressUpdate']({ max_size: 10, mime_type: 'application/pdf' }, 50, 'col1', 'batch1')
      await flushPromises()
      expect(mockLogger.error).toHaveBeenCalledWith('Error fetching content history for progress update:', expect.any(Error))
    })

    it('sendProgressMessageToTOC handles empty contentList by creating minimal entry', () => {
      component['contentHistoryResponse'] = { contentList: [] }
      component['sendProgressMessageToTOC'](80, 1)
      expect(mockContentSvc.changeMessage).toHaveBeenCalled()
    })

    it('sendProgressMessageToTOC logs error when contentHistoryResponse missing', () => {
      component['contentHistoryResponse'] = null
      component['sendProgressMessageToTOC'](80, 1)
      expect(mockLogger.error).toHaveBeenCalled()
    })
  })

  describe('loadDocument / eventDispatcher / documentLoded', () => {
    it('loadDocument enables currentPage, sets resumePage and dispatches Loaded event', () => {
      component.widgetData.resumePage = 3
      component.totalPages = 10
      component['loadDocument']()
      expect(component.currentPage.enabled).toBe(true)
      expect(component.currentPage.value).toBe(3)
      expect(mockTelemetrySvc.start).toHaveBeenCalled()
    })

    it('loadDocument defaults to page 1 when resumePage invalid', () => {
      component.widgetData.resumePage = 999
      component.totalPages = 10
      component['loadDocument']()
      expect(component.currentPage.value).toBe(1)
    })

    it('eventDispatcher no-op when disableTelemetry true', () => {
      component.widgetData.disableTelemetry = true
      component['eventDispatcher']('Loaded' as any)
      expect(mockEventSvc.dispatchEvent).not.toHaveBeenCalled()
    })

    it('eventDispatcher dispatches for known event types when telemetry enabled internally', () => {
      component['enableTelemetry'] = true
      component['eventDispatcher']('Loaded' as any)
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
    })

    it('eventDispatcher returns early for unknown event type', () => {
      component['enableTelemetry'] = true
      component['eventDispatcher']('SomeUnknownType' as any)
      expect(mockEventSvc.dispatchEvent).not.toHaveBeenCalled()
    })

    it('documentLoded sets totalPages and calls loadDocument when event present', () => {
      const spy = jest.spyOn<any, any>(component, 'loadDocument' as any)
      component.documentLoded({ pagesCount: 20 })
      expect(component.totalPages).toBe(20)
      expect(spy).toHaveBeenCalled()
    })

    it('documentLoded does nothing when event is null', () => {
      const spy = jest.spyOn<any, any>(component, 'loadDocument' as any)
      component.documentLoded(null)
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('preserveAllApiCalls', () => {
    it('iterates anchor tags without throwing', () => {
      const a = document.createElement('a')
      a.className = 'internalLink'
      document.body.appendChild(a)
      expect(() => component.preserveAllApiCalls()).not.toThrow()
      document.body.removeChild(a)
    })
  })

  describe('getPDFHeight / getPDFZoom', () => {
    it('returns mobile height when isMobile true', () => {
      mockUtilitySvc.isMobile = true
      expect(component.getPDFHeight).toBe(component.pdfMobileHeight)
    })

    it('returns pdfHeight when not mobile and window wide', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true })
      mockUtilitySvc.isMobile = false
      expect(component.getPDFHeight).toBe(component.pdfHeight)
    })

    it('returns pdfZoom when mobile', () => {
      mockUtilitySvc.isMobile = true
      expect(component.getPDFZoom).toBe(component.pdfZoom)
    })

    it('returns auto zoom when not mobile', () => {
      mockUtilitySvc.isMobile = false
      expect(component.getPDFZoom).toBe('auto')
    })
  })
})
