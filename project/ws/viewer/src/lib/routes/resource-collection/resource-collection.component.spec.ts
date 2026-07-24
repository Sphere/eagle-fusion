jest.mock('@ws-widget/collection', () => ({
  WidgetContentService: class { },
  NsDiscussionForum: {
    EDiscussionType: { LEARNING: 'learning' },
  },
  NsContent: {
    EMimeTypes: {
      COLLECTION_RESOURCE: 'application/vnd.ekstep.resource-collection',
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

import { ResourceCollectionComponent } from './resource-collection.component'
import { NsContent } from '@ws-widget/collection'
import { WsEvents } from '@ws-widget/utils'
import { of, Subject } from 'rxjs'

describe('ResourceCollectionComponent', () => {
  let component: ResourceCollectionComponent
  let mockActivatedRoute: any
  let mockContentSvc: any
  let mockHttp: any
  let mockEventSvc: any
  let mockViewSvc: any
  let dataSubject: Subject<any>

  const baseContent = {
    identifier: 'res-1',
    name: 'Resource Collection',
    description: 'desc',
    artifactUrl: 'http://example.com/manifest.json',
    mimeType: NsContent.EMimeTypes.COLLECTION_RESOURCE,
  }

  beforeEach(() => {
    dataSubject = new Subject()
    mockActivatedRoute = { data: dataSubject.asObservable() }
    mockContentSvc = {
      setS3Cookie: jest.fn().mockReturnValue({ toPromise: () => Promise.resolve({}) }),
    }
    mockHttp = {
      get: jest.fn().mockReturnValue({ toPromise: () => Promise.resolve({ resources: [] }) }),
    }
    mockEventSvc = { dispatchEvent: jest.fn() }
    mockViewSvc = { getAuthoringUrl: jest.fn(url => `authored-${url}`) }

    component = new ResourceCollectionComponent(
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
    it('loads collection data and sets isFetchingDataComplete on success', async () => {
      component.ngOnInit()
      dataSubject.next({ content: { data: { ...baseContent } } })
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      expect(component.isFetchingDataComplete).toBe(true)
      expect(component.isErrorOccured).toBe(false)
      expect(component.discussionForumWidget).toBeTruthy()
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
    })

    it('sets isErrorOccured when manifest is missing', async () => {
      mockHttp.get.mockReturnValue({ toPromise: () => Promise.resolve(undefined) })
      component.ngOnInit()
      dataSubject.next({ content: { data: { ...baseContent, mimeType: 'other-mime' } } })
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      expect(component.isErrorOccured).toBe(true)
      expect(component.isFetchingDataComplete).toBe(false)
    })

    it('calls setS3Cookie when artifactUrl is a content-store url', async () => {
      component.ngOnInit()
      dataSubject.next({
        content: { data: { ...baseContent, artifactUrl: 'http://example.com/content-store/manifest.json' } },
      })
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      expect(mockContentSvc.setS3Cookie).toHaveBeenCalledWith('res-1')
    })

    it('raises Unloaded for oldData when already raised and new data arrives', async () => {
      component.ngOnInit()
      dataSubject.next({ content: { data: { ...baseContent } } })
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      mockEventSvc.dispatchEvent.mockClear()
      dataSubject.next({ content: { data: { ...baseContent, identifier: 'res-2' } } })
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
    it('raises Unloaded event and unsubscribes when data present', async () => {
      component.ngOnInit()
      dataSubject.next({ content: { data: { ...baseContent } } })
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      mockEventSvc.dispatchEvent.mockClear()
      const unsubSpy = jest.spyOn((component as any).dataSubscription, 'unsubscribe')
      component.ngOnDestroy()
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
      expect(unsubSpy).toHaveBeenCalled()
    })

    it('does nothing when no data and no subscription', () => {
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('formDiscussionForumWidget', () => {
    it('builds discussion forum widget config from content', () => {
      component.formDiscussionForumWidget(baseContent as any)
      expect(component.discussionForumWidget).toEqual({
        widgetData: {
          description: 'desc',
          id: 'res-1',
          name: 'learning',
          title: 'Resource Collection',
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
          data: expect.objectContaining({ identifier: 'res-1' }),
        }),
      )
    })
  })
})
