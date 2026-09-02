jest.mock('@ws-widget/collection', () => ({
  WidgetContentService: class { },
  NsDiscussionForum: {
    EDiscussionType: { LEARNING: 'learning' },
  },
  NsContent: {
    EMimeTypes: {
      WEB_MODULE: 'application/vnd.ekstep.web-module',
      WEB_MODULE_EXERCISE: 'application/vnd.ekstep.web-module-exercise',
    },
  },
}))
jest.mock('@ws-widget/utils', () => ({
  EventService: class { },
  WsEvents: {
    EnumTelemetrySubType: { Loaded: 'Loaded', Unloaded: 'Unloaded' },
    WsEventType: { Telemetry: 'Telemetry' },
    WsEventLogLevel: { Info: 'Info' },
    WsTimeSpentType: { Player: 'Player' },
    WsTimeSpentMode: { Play: 'Play' },
  },
}))

import { WebModuleComponent } from './web-module.component'
import { NsContent } from '@ws-widget/collection'
import { WsEvents } from '@ws-widget/utils'
import { Subject } from 'rxjs'

describe('WebModuleComponent (routes)', () => {
  let component: WebModuleComponent
  let mockActivatedRoute: any
  let mockContentSvc: any
  let mockHttp: any
  let mockEventSvc: any
  let mockViewSvc: any
  let contentSubject: Subject<any>

  const baseContent = {
    identifier: 'wm-1',
    name: 'Web Module',
    description: 'desc',
    artifactUrl: 'http://example.com/manifest.json',
    mimeType: NsContent.EMimeTypes.WEB_MODULE,
  }

  beforeEach(() => {
    contentSubject = new Subject()
    mockActivatedRoute = { snapshot: { paramMap: { get: jest.fn().mockReturnValue('wm-1') } } }
    mockContentSvc = {
      setS3Cookie: jest.fn().mockReturnValue({ toPromise: () => Promise.resolve({}) }),
    }
    mockHttp = {
      get: jest.fn().mockReturnValue({ toPromise: () => Promise.resolve({ resources: [] }) }),
    }
    mockEventSvc = { dispatchEvent: jest.fn() }
    mockViewSvc = {
      getContent: jest.fn().mockReturnValue(contentSubject.asObservable()),
      getAuthoringUrl: jest.fn((url: string) => `authored-${url}`),
    }

    component = new WebModuleComponent(
      mockActivatedRoute,
      mockContentSvc,
      mockHttp,
      mockEventSvc,
      mockViewSvc,
    )
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('loads web module data via viewSvc.getContent and completes fetch', async () => {
      component.ngOnInit()
      contentSubject.next({ ...baseContent })
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      expect(mockViewSvc.getContent).toHaveBeenCalledWith('wm-1')
      expect(component.isFetchingDataComplete).toBe(true)
      expect(component.isErrorOccured).toBe(false)
      expect(component.discussionForumWidget).toBeTruthy()
      expect(component.webmoduleData?.resumePage).toBe(1)
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
    })

    it('rewrites artifactUrl via getAuthoringUrl during transform', async () => {
      component.ngOnInit()
      contentSubject.next({ ...baseContent })
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      expect(mockViewSvc.getAuthoringUrl).toHaveBeenCalledWith(baseContent.artifactUrl)
      expect(mockHttp.get).toHaveBeenCalledWith('authored-http://example.com/manifest.json')
    })

    it('sets isErrorOccured when mimeType does not match web module types', async () => {
      component.ngOnInit()
      contentSubject.next({ ...baseContent, mimeType: 'other-mime' })
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      expect(component.isErrorOccured).toBe(true)
      expect(component.isFetchingDataComplete).toBe(false)
    })

    it('calls setS3Cookie when not in preview and artifactUrl is content-store, and skips when forPreview', async () => {
      component.forPreview = false
      component.ngOnInit()
      contentSubject.next({ ...baseContent, artifactUrl: 'http://example.com/content-store/manifest.json' })
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      expect(mockContentSvc.setS3Cookie).toHaveBeenCalledWith('wm-1')
    })

    it('skips setS3Cookie when forPreview is true even with content-store url', async () => {
      component.forPreview = true
      component.ngOnInit()
      contentSubject.next({ ...baseContent, artifactUrl: 'http://example.com/content-store/manifest.json' })
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      expect(mockContentSvc.setS3Cookie).not.toHaveBeenCalled()
    })

    it('raises Unloaded for oldData when new data arrives after already raised', async () => {
      component.ngOnInit()
      contentSubject.next({ ...baseContent })
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      mockEventSvc.dispatchEvent.mockClear()
      contentSubject.next({ ...baseContent, identifier: 'wm-2' })
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      const unloadedCall = mockEventSvc.dispatchEvent.mock.calls.find(
        (call: any) => call[0].data.state === 'Unloaded',
      )
      expect(unloadedCall).toBeTruthy()
    })
  })

  describe('ngOnDestroy', () => {
    it('raises Unloaded and unsubscribes both subscriptions', async () => {
      component.ngOnInit()
      contentSubject.next({ ...baseContent })
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      mockEventSvc.dispatchEvent.mockClear()
      const unsubSpy = jest.spyOn((component as any).dataSubscription, 'unsubscribe')
      component.ngOnDestroy()
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
      expect(unsubSpy).toHaveBeenCalled()
    })

    it('does nothing when no data and no subscriptions set', () => {
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('formDiscussionForumWidget', () => {
    it('builds discussion forum widget config from content', () => {
      component.formDiscussionForumWidget(baseContent as any)
      expect(component.discussionForumWidget).toEqual({
        widgetData: {
          description: 'desc',
          id: 'wm-1',
          name: 'learning',
          title: 'Web Module',
          initialPostCount: 2,
          isDisabled: component.forPreview,
        },
        widgetSubType: 'discussionForum',
        widgetType: 'discussionForum',
      })
    })
  })

  describe('raiseEvent', () => {
    it('does not dispatch when forPreview is true', () => {
      component.forPreview = true
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, baseContent as any)
      expect(mockEventSvc.dispatchEvent).not.toHaveBeenCalled()
    })

    it('dispatches telemetry event when not in preview', () => {
      component.forPreview = false
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, baseContent as any)
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ identifier: 'wm-1' }),
        }),
      )
    })
  })
})
