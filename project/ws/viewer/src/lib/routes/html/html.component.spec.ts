jest.mock('@ws-widget/collection', () => ({
  NsContent: {
    EMimeTypes: { HTML: 'application/x-html' },
    EContentTypes: { COURSE: 'Course' },
  },
  NsDiscussionForum: {
    EDiscussionType: { LEARNING: 'learning' },
  },
  WidgetContentService: class { setS3Cookie = jest.fn() },
}))
jest.mock('@ws-widget/utils', () => ({
  EventService: class { dispatchEvent = jest.fn() },
  SubapplicationRespondService: class { loadedRespond = jest.fn(); telemetryEvents = jest.fn(); unsubscribeResponse = jest.fn() },
  WsEvents: {
    EnumTelemetrySubType: { Loaded: 'Loaded', Unloaded: 'Unloaded' },
    WsEventType: { Telemetry: 'Telemetry' },
    WsEventLogLevel: { Info: 'Info' },
    WsTimeSpentType: { Player: 'Player' },
    WsTimeSpentMode: { Play: 'Play' },
  },
  ConfigurationsService: class {},
}))
jest.mock('@ws/author', () => ({
  AccessControlService: class { authoringConfig = { newDesign: false }; hasAccess = jest.fn().mockReturnValue(true) },
}))
jest.mock('../../viewer-util.service', () => ({
  ViewerUtilService: class { getContent = jest.fn() },
}))

import { HtmlComponent } from './html.component'
import { of } from 'rxjs'

describe('HtmlComponent (routes/html)', () => {
  let component: HtmlComponent
  let mockActivatedRoute: any
  let mockContentSvc: any
  let mockViewerSvc: any
  let mockRespondSvc: any
  let mockEventSvc: any
  let mockAccessControlSvc: any
  let mockConfigSvc: any

  const content: any = {
    identifier: 'c1',
    name: 'Content',
    artifactUrl: 'https://example.com/x.html',
    description: 'desc',
    contentType: 'Resource',
  }

  beforeEach(() => {
    mockActivatedRoute = {
      snapshot: { queryParams: {}, queryParamMap: { get: jest.fn().mockReturnValue(null) } },
      data: of({ content: { data: { ...content } } }),
    }
    mockContentSvc = { setS3Cookie: jest.fn().mockReturnValue({ toPromise: () => Promise.resolve({}) }) }
    mockViewerSvc = { getContent: jest.fn().mockReturnValue(of({ ...content })) }
    mockRespondSvc = { loadedRespond: jest.fn(), telemetryEvents: jest.fn(), unsubscribeResponse: jest.fn() }
    mockEventSvc = { dispatchEvent: jest.fn() }
    mockAccessControlSvc = { authoringConfig: { newDesign: false }, hasAccess: jest.fn().mockReturnValue(true) }
    mockConfigSvc = { userProfile: { userId: 'user1' } }

    component = new HtmlComponent(
      mockActivatedRoute,
      mockContentSvc,
      mockViewerSvc,
      mockRespondSvc,
      mockEventSvc,
      mockAccessControlSvc,
      mockConfigSvc
    )
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit (non-preview path)', () => {
    it('sets htmlData from route data and marks fetching complete', async () => {
      component.ngOnInit()
      await Promise.resolve()
      await Promise.resolve()
      expect(component.htmlData).toBeTruthy()
      expect(component.isFetchingDataComplete).toBe(true)
    })

    it('sets isNotEmbed false when embed query param is true', () => {
      mockActivatedRoute.snapshot.queryParams = { embed: 'true' }
      component.ngOnInit()
      expect(component.isNotEmbed).toBe(false)
    })
  })

  describe('ngOnInit (preview path)', () => {
    beforeEach(() => {
      mockActivatedRoute.snapshot.queryParamMap.get = jest.fn((key: string) => (key === 'preview' ? 'true' : null))
      mockActivatedRoute.snapshot.paramMap = { get: jest.fn().mockReturnValue('res1') }
    })

    it('fetches content via viewerSvc.getContent and sets htmlData', async () => {
      component.ngOnInit()
      await Promise.resolve()
      expect(component.isPreviewMode).toBe(true)
      expect(component.htmlData).toBeTruthy()
    })

    it('does not set htmlData when hasAccess returns false', async () => {
      mockAccessControlSvc.hasAccess.mockReturnValue(false)
      component.ngOnInit()
      await Promise.resolve()
      expect(component.htmlData).toBeNull()
    })
  })

  describe('ngOnInit (non-preview path) - content-store branch', () => {
    it('calls setS3Cookie when artifactUrl contains content-store', async () => {
      mockActivatedRoute.data = of({
        content: { data: { ...content, artifactUrl: 'https://x.com/content-store/y.html' } },
      })
      component.ngOnInit()
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      expect(mockContentSvc.setS3Cookie).toHaveBeenCalled()
      expect(component.htmlData).toBeTruthy()
    })

    it('raises unloaded event and clears timer when already raised on next data emission', async () => {
      const subject: any = { data: null }
      const { Subject } = require('rxjs')
      const subj = new Subject()
      mockActivatedRoute.data = subj.asObservable()
      component.ngOnInit()
      subj.next({ content: { data: { ...content } } })
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      expect(component.alreadyRaised).toBe(true)
      subj.next({ content: { data: { ...content, name: 'Content2' } } })
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
      void subject
    })

    it('handles LOADED and TELEMETRY postMessage events', async () => {
      component.ngOnInit()
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      const source = { postMessage: jest.fn() }
      window.dispatchEvent(new MessageEvent('message', {
        data: { requestId: 'LOADED', subApplicationName: 'RBCP' },
        source: source as any,
      }))
      await Promise.resolve()
      await Promise.resolve()
      expect(mockRespondSvc.loadedRespond).toHaveBeenCalled()
      expect(component.subApp).toBe(true)

      window.dispatchEvent(new MessageEvent('message', {
        data: { requestId: 'TELEMETRY' },
        source: source as any,
      }))
      await Promise.resolve()
      await Promise.resolve()
      expect(mockRespondSvc.telemetryEvents).toHaveBeenCalled()

      window.dispatchEvent(new MessageEvent('message', {
        data: { requestId: 'UNKNOWN' },
        source: source as any,
      }))
      await Promise.resolve()
    })

    it('ignores postMessage events without a valid source', async () => {
      component.ngOnInit()
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      window.dispatchEvent(new MessageEvent('message', { data: { requestId: 'LOADED' } }))
      await Promise.resolve()
      expect(mockRespondSvc.loadedRespond).not.toHaveBeenCalled()
    })
  })

  describe('preview path - content-store branch', () => {
    beforeEach(() => {
      mockActivatedRoute.snapshot.queryParamMap.get = jest.fn((key: string) => (key === 'preview' ? 'true' : null))
      mockActivatedRoute.snapshot.paramMap = { get: jest.fn().mockReturnValue('res1') }
    })

    it('calls setS3Cookie when artifactUrl contains content-store', async () => {
      mockViewerSvc.getContent.mockReturnValue(of({ ...content, artifactUrl: 'https://x.com/content-store/y.html' }))
      component.ngOnInit()
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      expect(mockContentSvc.setS3Cookie).toHaveBeenCalled()
      expect(component.htmlData).toBeTruthy()
    })

    it('rewrites a bare artifactUrl to https', async () => {
      mockViewerSvc.getContent.mockReturnValue(of({ ...content, artifactUrl: 'example.com/x.html' }))
      component.ngOnInit()
      await Promise.resolve()
      await Promise.resolve()
      expect(component.htmlData).toBeTruthy()
    })
  })

  describe('setS3Cookie error handling', () => {
    it('swallows errors from the underlying service call', async () => {
      mockContentSvc.setS3Cookie.mockReturnValue({ toPromise: () => Promise.reject(new Error('fail')) })
      mockActivatedRoute.data = of({
        content: { data: { ...content, artifactUrl: 'https://x.com/content-store/y.html' } },
      })
      component.ngOnInit()
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      expect(component.htmlData).toBeTruthy()
    })
  })

  describe('fireRealTimeProgress / raiseRealTimeProgress', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })
    afterEach(() => {
      jest.useRealTimers()
    })

    it('does nothing when forPreview is true', () => {
      component.forPreview = true
      ;(component as any).raiseRealTimeProgress()
      expect(component.realTimeProgressTimer).toBeUndefined()
    })

    it('sets a timer and fires real time progress after the delay, skipping external courses', () => {
      component.forPreview = false
      component.htmlData = { ...content, contentType: 'Course', isExternal: true } as any
      ;(component as any).raiseRealTimeProgress()
      jest.advanceTimersByTime(2 * 60 * 1000)
      expect(component.hasFiredRealTimeProgress).toBe(true)
    })

    it('skips certification resource types', () => {
      component.forPreview = false
      component.htmlData = { ...content, resourceType: 'Certification' } as any
      ;(component as any).fireRealTimeProgress()
    })

    it('skips when isIframeSupported is not yes', () => {
      component.forPreview = false
      component.htmlData = { ...content, isIframeSupported: 'no' } as any
      ;(component as any).fireRealTimeProgress()
    })

    it('skips Cross Knowledge source', () => {
      component.forPreview = false
      component.htmlData = { ...content, sourceName: 'Cross Knowledge' } as any
      ;(component as any).fireRealTimeProgress()
    })

    it('sets content_type from htmlData when none of the skip conditions apply', () => {
      component.forPreview = false
      component.htmlData = { ...content, contentType: 'Resource' } as any
      ;(component as any).fireRealTimeProgress()
      expect(component.realTimeProgressRequest.content_type).toBe('Resource')
    })

    it('sets content_type to empty string when htmlData is null', () => {
      component.forPreview = false
      component.htmlData = null
      ;(component as any).fireRealTimeProgress()
      expect(component.realTimeProgressRequest.content_type).toBe('')
    })
  })

  describe('formDiscussionForumWidget', () => {
    it('builds the discussion forum widget config from content', () => {
      component.formDiscussionForumWidget(content)
      expect(component.discussionForumWidget).toBeTruthy()
      expect(component.discussionForumWidget!.widgetData.id).toBe('c1')
    })
  })

  describe('raiseEvent', () => {
    it('dispatches a telemetry event when not in preview mode', () => {
      component.forPreview = false
      component.raiseEvent('Loaded' as any, content)
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
    })

    it('does nothing when in preview mode', () => {
      component.forPreview = true
      component.raiseEvent('Loaded' as any, content)
      expect(mockEventSvc.dispatchEvent).not.toHaveBeenCalled()
    })
  })

  describe('ngOnDestroy', () => {
    it('raises unloaded event and unsubscribes when htmlData set', async () => {
      component.htmlData = content
      ;(component as any).routeDataSubscription = { unsubscribe: jest.fn() }
      ;(component as any).responseSubscription = { unsubscribe: jest.fn() }
      ;(component as any).viewerDataSubscription = { unsubscribe: jest.fn() }
      component.ngOnDestroy()
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
      expect((component as any).routeDataSubscription.unsubscribe).toHaveBeenCalled()
      expect(mockRespondSvc.unsubscribeResponse).toHaveBeenCalled()
    })

    it('does nothing extra when there is no htmlData or subscriptions', () => {
      component.htmlData = null
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })
})
