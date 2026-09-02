jest.mock('@ws-widget/collection', () => ({
  WidgetContentService: class { changeMessage = jest.fn(); fetchContentHistoryV2 = jest.fn(); fetchHierarchyContent = jest.fn() },
}))
jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class {},
  EventService: class { raiseInteractTelemetry = jest.fn() },
  LoggerService: class { log = jest.fn(); warn = jest.fn(); error = jest.fn() },
  SafeResourceUrlService: class { trust = jest.fn() },
  TelemetryService: class { start = jest.fn(); end = jest.fn() },
}))
jest.mock('@ws-widget/utils/src/public-api', () => ({}))
jest.mock('../../../../../../../src/app/services/mobile-apps.service', () => ({
  MobileAppsService: class { isMobile = false },
}))
jest.mock('./SCORMAdapter/scormAdapter', () => ({
  SCORMAdapterService: class {
    contentId = ''
    htmlName = ''
    parent = ''
    LMSInitialize = jest.fn().mockReturnValue(true)
  },
}))
jest.mock('../../../../../../../project/ws/viewer/src/lib/viewer-util.service', () => ({
  ViewerUtilService: class {
    realTimeProgressUpdateV3 = jest.fn()
    generateInteractTelemetry = jest.fn()
  },
}))

import { HtmlComponent } from './html.component'
import { of, throwError } from 'rxjs'

// ngOnChanges wraps its body in a fire-and-forget IIFE, so it no longer returns
// a promise. Call it, then flush microtask ticks for the internal awaits/`.then`
// chains to settle.
const runNgOnChanges = async (component: HtmlComponent) => {
  component.ngOnChanges()
  for (let i = 0; i < 5; i++) {
    await Promise.resolve()
  }
}

describe('HtmlComponent (plugins/html)', () => {
  let component: HtmlComponent
  let mockSafeResourceUrlSvc: any
  let mockMobAppSvc: any
  let mockScormAdapterService: any
  let mockRouter: any
  let mockConfigSvc: any
  let mockSnackBar: any
  let mockEvents: any
  let mockContentSvc: any
  let mockViewerSvc: any
  let mockActivatedRoute: any
  let mockTelemetrySvc: any
  let mockLogger: any
  let mockCdr: any

  const baseContent: any = {
    identifier: 'content1',
    name: 'Content 1',
    parent: 'parent1',
    artifactUrl: 'https://example.com/page.html',
    isIframeSupported: 'Yes',
    mimeType: 'text/html',
  }

  beforeEach(() => {
    mockSafeResourceUrlSvc = { trust: jest.fn().mockReturnValue('trustedUrl'), trustHtml: jest.fn() }
    mockMobAppSvc = { isMobile: false }
    mockScormAdapterService = {
      contentId: '',
      htmlName: '',
      parent: '',
      LMSInitialize: jest.fn().mockReturnValue(true),
    }
    mockRouter = { navigate: jest.fn() }
    mockConfigSvc = { userProfile: { userId: 'user1' }, instanceConfig: { intranetIframeUrls: [] } }
    mockSnackBar = { open: jest.fn() }
    mockEvents = { raiseInteractTelemetry: jest.fn() }
    mockContentSvc = {
      changeMessage: jest.fn(),
      fetchContentHistoryV2: jest.fn().mockReturnValue(of({ result: { contentList: [] } })),
      fetchHierarchyContent: jest.fn().mockReturnValue({ toPromise: () => Promise.resolve({ result: { content: {} } }) }),
    }
    mockViewerSvc = {
      realTimeProgressUpdateV3: jest.fn().mockReturnValue(of({})),
      generateInteractTelemetry: jest.fn(),
    }
    mockActivatedRoute = { snapshot: { queryParams: {} } }
    mockTelemetrySvc = { start: jest.fn(), end: jest.fn() }
    mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    mockCdr = { detectChanges: jest.fn() }

    component = new HtmlComponent(
      mockSafeResourceUrlSvc,
      mockMobAppSvc,
      mockScormAdapterService,
      mockRouter,
      mockConfigSvc,
      mockSnackBar,
      mockEvents,
      mockContentSvc,
      mockViewerSvc,
      mockActivatedRoute,
      mockTelemetrySvc,
      mockLogger,
      mockCdr
    )
  })

  afterEach(() => {
    component.ngOnDestroy()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('ngAfterViewInit assigns scorm adapter fields from htmlContent', () => {
    component.htmlContent = { ...baseContent }
    component.ngAfterViewInit()
    expect(mockScormAdapterService.contentId).toBe('content1')
    expect(mockScormAdapterService.htmlName).toBe('Content 1')
    expect(mockScormAdapterService.parent).toBe('parent1')
  })

  it('ngOnDestroy clears progress interval and subscriptions', () => {
    ;(component as any).progressInterval = setInterval(() => {}, 1000)
    ;(component as any).contentHistorySubscription = { unsubscribe: jest.fn() }
    const unsubSpy = (component as any).contentHistorySubscription.unsubscribe
    component.ngOnDestroy()
    expect(unsubSpy).toHaveBeenCalled()
    expect((component as any).progressInterval).toBeNull()
  })

  describe('ngOnChanges', () => {
    it('does nothing harmful when htmlContent is null', async () => {
      component.htmlContent = null
      await runNgOnChanges(component)
      expect(component.pageFetchStatus).toBe('error')
    })

    it('sets iframeUrl for a plain html mimeType content', async () => {
      component.htmlContent = { ...baseContent }
      await runNgOnChanges(component)
      expect(component.mimeType).toBe('text/html')
      expect(mockSafeResourceUrlSvc.trust).toHaveBeenCalledWith(baseContent.artifactUrl)
      expect(mockCdr.detectChanges).toHaveBeenCalled()
    })

    it('guards re-entrant processing for the same content id', async () => {
      component.htmlContent = { ...baseContent }
      ;(component as any).currentProcessingContentId = 'content1'
      await runNgOnChanges(component)
      // The guard returns early from the IIFE before reaching detectChanges().
      expect(mockCdr.detectChanges).not.toHaveBeenCalled()
    })

    it('sets pageFetchStatus to artifactUrlMissing when artifactUrl is empty', async () => {
      component.htmlContent = { ...baseContent, artifactUrl: '' }
      await runNgOnChanges(component)
      expect(component.pageFetchStatus).toBe('artifactUrlMissing')
    })

    it('sets pageFetchStatus to error when htmlContent is falsy edge case', async () => {
      component.htmlContent = null
      await runNgOnChanges(component)
      expect(component.pageFetchStatus).toBe('error')
    })

    it('initializes SCORM for html-archive mimeType content once', async () => {
      component.htmlContent = { ...baseContent, mimeType: 'application/vnd.ekstep.html-archive', status: 'Live', streamingUrl: 'https://static.sphere.aastrika.org/some/path' }
      await runNgOnChanges(component)
      expect(mockScormAdapterService.LMSInitialize).toHaveBeenCalledTimes(1)
      expect(component.scormInitializedIds.has('content1')).toBe(true)
    })
  })

  describe('backToDetailsPage', () => {
    it('navigates to the TOC overview page', () => {
      component.htmlContent = { ...baseContent, primaryCategory: 'Course' }
      component.backToDetailsPage()
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/app/toc/content1/overview'],
        { queryParams: { primaryCategory: 'Course' } }
      )
    })
  })

  describe('raiseTelemetry / receiveMessage', () => {
    it('raiseTelemetry dispatches interact telemetry when htmlContent set', () => {
      component.htmlContent = { ...baseContent }
      component.raiseTelemetry({ event: 'click' })
      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalled()
    })

    it('receiveMessage raises telemetry using msg.data when present', () => {
      component.htmlContent = { ...baseContent }
      const spy = jest.spyOn(component, 'raiseTelemetry')
      component.receiveMessage({ data: { event: 'click' } })
      expect(spy).toHaveBeenCalledWith({ event: 'click' })
    })

    it('receiveMessage raises telemetry using msg.message/id when data absent', () => {
      component.htmlContent = { ...baseContent }
      const spy = jest.spyOn(component, 'raiseTelemetry')
      component.receiveMessage({ message: 'evt', id: 'id1' })
      expect(spy).toHaveBeenCalledWith({ event: 'evt', id: 'id1' })
    })
  })

  describe('dismiss', () => {
    it('resets warning flags', () => {
      component.showIframeSupportWarning = true
      component.isIntranetUrl = true
      component.dismiss()
      expect(component.showIframeSupportWarning).toBe(false)
      expect(component.isIntranetUrl).toBe(false)
    })
  })

  describe('onIframeLoadOrError', () => {
    it('sets pageFetchStatus to error on error event', () => {
      component.onIframeLoadOrError('error')
      expect(component.pageFetchStatus).toBe('error')
    })

    it('sets pageFetchStatus to done via onload handler on load event', () => {
      const iframe: any = { contentWindow: {}, onload: null }
      component.onIframeLoadOrError('load', iframe)
      expect(typeof iframe.onload).toBe('function')
      iframe.onload({ target: iframe })
      expect(component.pageFetchStatus).toBe('done')
    })
  })

  describe('getModuleId', () => {
    it('returns parent when parent differs from courseID', () => {
      expect(component.getModuleId('course1', 'module1')).toBe('module1')
    })

    it('returns null when parent equals courseID or is falsy', () => {
      expect(component.getModuleId('course1', 'course1')).toBeNull()
      expect(component.getModuleId('course1', null)).toBeNull()
    })
  })

  describe('openInNewTab', () => {
    it('clicks the mobile anchor when on mobile', () => {
      mockMobAppSvc.isMobile = true
      component.htmlContent = { ...baseContent }
      ;(component as any).mobileOpenInNewTab = { nativeElement: { click: jest.fn() } }
      component.openInNewTab()
    })

    it('opens a new window when not on mobile', () => {
      mockMobAppSvc.isMobile = false
      component.htmlContent = { ...baseContent }
      const openSpy = jest.spyOn(window, 'open').mockReturnValue({} as any)
      component.openInNewTab()
      expect(openSpy).toHaveBeenCalled()
      openSpy.mockRestore()
    })

    it('shows a snackbar message when the popup is blocked', () => {
      mockMobAppSvc.isMobile = false
      component.htmlContent = { ...baseContent }
      const openSpy = jest.spyOn(window, 'open').mockReturnValue(null)
      component.openInNewTab()
      expect(mockSnackBar.open).toHaveBeenCalled()
      openSpy.mockRestore()
    })
  })

  describe('onBlur (youtube completion)', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      component.htmlContent = { ...baseContent }
      component.urlContains = 'https://youtube.com/watch?v=1'
      component.mimeType = 'video/x-youtube' as any
    })

    afterEach(() => jest.useRealTimers())

    it('should do nothing for a non-youtube url', () => {
      component.urlContains = 'https://example.com/page.html'
      component.onBlur()
      jest.runAllTimers()
      expect(mockTelemetrySvc.start).not.toHaveBeenCalled()
      expect(mockViewerSvc.realTimeProgressUpdateV3).not.toHaveBeenCalled()
    })

    it('should do nothing when there is no content', () => {
      component.htmlContent = null
      component.onBlur()
      jest.runAllTimers()
      expect(mockTelemetrySvc.start).not.toHaveBeenCalled()
    })

    it('should mark the video complete and close the telemetry span', () => {
      component.onBlur()
      jest.runAllTimers()

      expect(mockTelemetrySvc.start).toHaveBeenCalledWith('youtube', 'youtube-start', 'player')
      expect(mockViewerSvc.realTimeProgressUpdateV3).toHaveBeenCalledWith(
        'content1',
        expect.objectContaining({ completionPercentage: 100, status: 2 }),
        'content1',
        'content1',
      )
      expect(mockViewerSvc.generateInteractTelemetry).toHaveBeenCalledWith(
        'progress-update-success', expect.objectContaining({ mimeType: 'youtube' }),
      )
      expect(mockContentSvc.changeMessage).toHaveBeenCalledWith(expect.objectContaining({ type: 'youtube' }))
      expect(mockTelemetrySvc.end).toHaveBeenCalledWith(
        'youtube', 'youtube-close', 'player', expect.any(Object), expect.any(Object),
      )
    })

    it('should prefer the collection and batch ids from the query params', () => {
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'coll-1', batchId: 'b1' }
      component.onBlur()
      jest.runAllTimers()

      expect(mockViewerSvc.realTimeProgressUpdateV3).toHaveBeenCalledWith(
        'content1', expect.any(Object), 'coll-1', 'b1',
      )
      const [, telemetry] = mockViewerSvc.generateInteractTelemetry.mock.calls[0]
      expect(telemetry.batchId).toBe('b1')
    })

    it('should warn when the progress update fails', () => {
      mockViewerSvc.realTimeProgressUpdateV3.mockReturnValue(throwError(() => new Error('down')))
      component.onBlur()
      jest.runAllTimers()
      expect(mockLogger.warn).toHaveBeenCalledWith('Progress update failed:', expect.any(Error))
    })
  })

  describe('executeForms (google docs completion)', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      component.htmlContent = { ...baseContent }
      component.urlContains = 'https://docs.google.com/forms/d/1'
    })

    afterEach(() => jest.useRealTimers())

    it('should do nothing for a non-docs url', () => {
      component.urlContains = 'https://example.com/page.html'
      component.executeForms()
      jest.runAllTimers()
      expect(mockViewerSvc.realTimeProgressUpdateV3).not.toHaveBeenCalled()
    })

    it('should do nothing when there is no content', () => {
      component.htmlContent = null
      component.executeForms()
      jest.runAllTimers()
      expect(mockViewerSvc.realTimeProgressUpdateV3).not.toHaveBeenCalled()
    })

    it('should mark the form complete and close the telemetry span', () => {
      component.executeForms()
      jest.runAllTimers()

      expect(mockViewerSvc.realTimeProgressUpdateV3).toHaveBeenCalledWith(
        'content1',
        expect.objectContaining({ completionPercentage: 100, status: 2 }),
        'content1',
        'content1',
      )
      expect(mockViewerSvc.generateInteractTelemetry).toHaveBeenCalledWith(
        'progress-update-success', expect.objectContaining({ mimeType: 'docs.google' }),
      )
      expect(mockContentSvc.changeMessage).toHaveBeenCalledWith(expect.objectContaining({ type: 'docs.google' }))
      expect(mockTelemetrySvc.end).toHaveBeenCalledWith(
        'docs.google', 'docs.google-close', 'player', expect.any(Object), expect.any(Object),
      )
    })

    it('should prefer the collection and batch ids from the query params', () => {
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'coll-1', batchId: 'b1' }
      component.executeForms()
      jest.runAllTimers()
      expect(mockViewerSvc.realTimeProgressUpdateV3).toHaveBeenCalledWith(
        'content1', expect.any(Object), 'coll-1', 'b1',
      )
    })

    it('should warn when the progress update fails', () => {
      mockViewerSvc.realTimeProgressUpdateV3.mockReturnValue(throwError(() => new Error('down')))
      component.executeForms()
      jest.runAllTimers()
      expect(mockLogger.warn).toHaveBeenCalledWith('Progress update failed:', expect.any(Error))
    })
  })

  describe('mergeProgressDetails', () => {
    it('should carry over keys that only exist in the base object', () => {
      expect(component.mergeProgressDetails({ a: 1 }, {})).toEqual({ a: 1 })
    })

    it('should let the incoming object win on shared keys', () => {
      expect(component.mergeProgressDetails({ a: 1, b: 2 }, { b: 3 })).toEqual({ a: 1, b: 3 })
    })

    it('should add keys that only exist in the incoming object', () => {
      expect(component.mergeProgressDetails({ a: 1 }, { c: 4 })).toEqual({ a: 1, c: 4 })
    })

    it('should take a falsy incoming value over the existing one', () => {
      expect(component.mergeProgressDetails({ a: 1 }, { a: 0 })).toEqual({ a: 0 })
    })
  })

  describe('isDuplicateProcessing', () => {
    it('should be false before any content has been processed', () => {
      component.htmlContent = { ...baseContent }
      expect(component['isDuplicateProcessing']()).toBe(false)
    })

    it('should be true while the same content is already being processed', () => {
      component.htmlContent = { ...baseContent }
      component.currentProcessingContentId = 'content1'
      expect(component['isDuplicateProcessing']()).toBe(true)
    })

    it('should be false for a different content id', () => {
      component.htmlContent = { ...baseContent }
      component.currentProcessingContentId = 'other'
      expect(component['isDuplicateProcessing']()).toBe(false)
    })

    it('should be false when there is no content', () => {
      component.htmlContent = null
      component.currentProcessingContentId = 'content1'
      expect(component['isDuplicateProcessing']()).toBe(false)
    })
  })

  describe('processHtmlContentChange', () => {
    it('should do nothing without content', () => {
      component.htmlContent = null
      component['processHtmlContentChange']()
      expect(component.currentProcessingContentId).toBeNull()
    })

    it('should claim the content and seed the scorm adapter', () => {
      component.htmlContent = { ...baseContent }
      component['processHtmlContentChange']()

      expect(component.currentProcessingContentId).toBe('content1')
      expect(mockScormAdapterService.contentId).toBe('content1')
      expect(mockScormAdapterService.htmlName).toBe('Content 1')
      expect(mockScormAdapterService.parent).toBe('parent1')
      expect(component.urlContains).toBe(baseContent.artifactUrl)
    })

    it('should leave the adapter parent undefined when the content has none', () => {
      component.htmlContent = { ...baseContent, parent: undefined }
      component['processHtmlContentChange']()
      expect(mockScormAdapterService.parent).toBeUndefined()
    })

    it('should fetch the content history for non-scorm content', () => {
      component.htmlContent = { ...baseContent }
      component['processHtmlContentChange']()
      expect(mockContentSvc.fetchContentHistoryV2).toHaveBeenCalled()
    })

    it('should skip the history fetch for scorm content', () => {
      component.htmlContent = { ...baseContent, mimeType: 'application/vnd.ekstep.html-archive' }
      component['processHtmlContentChange']()
      expect(mockContentSvc.fetchContentHistoryV2).not.toHaveBeenCalled()
    })

    it('should drop a previous history subscription before starting a new one', () => {
      const unsubscribe = jest.fn()
      component.contentHistorySubscription = { unsubscribe } as any
      component.htmlContent = { ...baseContent }
      component['processHtmlContentChange']()
      expect(unsubscribe).toHaveBeenCalled()
    })
  })
})
