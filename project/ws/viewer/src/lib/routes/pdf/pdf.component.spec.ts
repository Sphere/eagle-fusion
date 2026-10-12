jest.mock('@ws-widget/collection', () => ({
  NsContent: {
    EMimeTypes: { PDF: 'application/pdf' },
  },
  NsDiscussionForum: {
    EDiscussionType: { LEARNING: 'learning' },
  },
  WidgetContentService: class { setS3Cookie = jest.fn(); fetchContentHistoryV2 = jest.fn() },
}))
jest.mock('@ws-widget/utils', () => ({
  WsEvents: {
    EnumTelemetrySubType: { Loaded: 'Loaded', Unloaded: 'Unloaded' },
    WsEventType: { Telemetry: 'Telemetry' },
    WsEventLogLevel: { Info: 'Info' },
    WsTimeSpentType: { Player: 'Player' },
    WsTimeSpentMode: { Play: 'Play' },
  },
  EventService: class { dispatchEvent = jest.fn() },
  ConfigurationsService: class {},
}))
jest.mock('@ws/author', () => ({
  AccessControlService: class { authoringConfig = { newDesign: false } },
}))
jest.mock('../../viewer-util.service', () => ({
  ViewerUtilService: class { getContent = jest.fn(); getAuthoringUrl = jest.fn() },
}))
jest.mock('../../../../../../../src/app/constants/apiConstants', () => ({
  API_END_POINTS: { AUTH_CONTENT: jest.fn((url: string) => `authed-${url}`) },
}))

import { PdfComponent } from './pdf.component'
import { of } from 'rxjs'

describe('PdfComponent (routes/pdf)', () => {
  let component: PdfComponent
  let mockActivatedRoute: any
  let mockContentSvc: any
  let mockViewerSvc: any
  let mockEventSvc: any
  let mockAccessControlSvc: any
  let mockConfigSvc: any
  let mockCdr: any

  const content: any = {
    identifier: 'pdf1',
    name: 'PDF Content',
    artifactUrl: 'https://example.com/x.pdf',
    description: 'desc',
  }

  beforeEach(() => {
    mockActivatedRoute = {
      snapshot: { queryParamMap: { get: jest.fn().mockReturnValue(null) }, queryParams: {} },
      data: of({ content: { data: { ...content } } }),
    }
    mockContentSvc = {
      setS3Cookie: jest.fn().mockReturnValue({ toPromise: () => Promise.resolve({}) }),
      fetchContentHistoryV2: jest.fn().mockReturnValue(of({ result: { contentList: [] } })),
    }
    mockViewerSvc = { getContent: jest.fn().mockReturnValue(of({ ...content })), getAuthoringUrl: jest.fn().mockReturnValue('authoring-url') }
    mockEventSvc = { dispatchEvent: jest.fn() }
    mockAccessControlSvc = { authoringConfig: { newDesign: false } }
    mockConfigSvc = { userProfile: { userId: 'user1' } }
    mockCdr = { detectChanges: jest.fn() }

    component = new PdfComponent(
      mockActivatedRoute,
      mockContentSvc,
      mockViewerSvc,
      mockEventSvc,
      mockAccessControlSvc,
      mockConfigSvc,
      mockCdr
    )
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit (non-preview path)', () => {
    it('sets pdfData from route data and marks fetching complete', async () => {
      component.ngOnInit()
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      expect(component.pdfData).toBeTruthy()
      expect(component.isFetchingDataComplete).toBe(true)
      expect(component.widgetResolverPdfData.widgetData.pdfUrl).toBe(content.artifactUrl)
    })

    it('uses authoring url when forPreview is true', async () => {
      ;(component as any).forPreview = true
      component.ngOnInit()
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      expect(mockViewerSvc.getAuthoringUrl).toHaveBeenCalledWith(content.artifactUrl)
    })
  })

  describe('ngOnInit (preview path)', () => {
    beforeEach(() => {
      mockActivatedRoute.snapshot.queryParamMap.get = jest.fn().mockReturnValue('true')
      mockActivatedRoute.snapshot.paramMap = { get: jest.fn().mockReturnValue('res1') }
    })

    it('fetches content via viewerSvc.getContent and disables telemetry', () => {
      component.ngOnInit()
      expect(component.isPreviewMode).toBe(true)
      expect(component.pdfData).toBeTruthy()
      expect(component.widgetResolverPdfData.widgetData.disableTelemetry).toBe(true)
      expect(component.isFetchingDataComplete).toBe(true)
    })
  })

  describe('formDiscussionForumWidget', () => {
    it('builds discussion forum widget data', () => {
      component.formDiscussionForumWidget(content)
      expect(component.discussionForumWidget!.widgetData.id).toBe('pdf1')
    })
  })

  describe('raiseEvent', () => {
    it('dispatches telemetry when not forPreview', () => {
      component.forPreview = false
      component.raiseEvent('Unloaded' as any, content)
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
    })

    it('skips dispatch when forPreview', () => {
      component.forPreview = true
      component.raiseEvent('Unloaded' as any, content)
      expect(mockEventSvc.dispatchEvent).not.toHaveBeenCalled()
    })
  })

  describe('fetchContinueLearning', () => {
    it('resolves true and updates resumePage when matching progress found', async () => {
      mockContentSvc.fetchContentHistoryV2.mockReturnValue(of({
        result: { contentList: [{ contentId: 'pdf1', progressdetails: { current: ['3'] } }] },
      }))
      const result = await component.fetchContinueLearning('course1', 'pdf1')
      expect(result).toBe(true)
      expect(component.widgetResolverPdfData.widgetData.resumePage).toBe(3)
    })

    it('resolves true even when the request errors', async () => {
      mockContentSvc.fetchContentHistoryV2.mockReturnValue({
        subscribe: (_success: any, error: any) => error(),
      })
      const result = await component.fetchContinueLearning('course1', 'pdf1')
      expect(result).toBe(true)
    })
  })

  describe('ngOnDestroy', () => {
    it('raises unloaded event and unsubscribes all subscriptions', () => {
      component.pdfData = content
      ;(component as any).dataSubscription = { unsubscribe: jest.fn() }
      ;(component as any).viewerDataSubscription = { unsubscribe: jest.fn() }
      ;(component as any).telemetryIntervalSubscription = { unsubscribe: jest.fn() }
      component.ngOnDestroy()
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
      expect((component as any).dataSubscription.unsubscribe).toHaveBeenCalled()
      expect((component as any).viewerDataSubscription.unsubscribe).toHaveBeenCalled()
      expect((component as any).telemetryIntervalSubscription.unsubscribe).toHaveBeenCalled()
    })

    it('does nothing extra when no pdfData or subscriptions', () => {
      component.pdfData = null
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })
})
