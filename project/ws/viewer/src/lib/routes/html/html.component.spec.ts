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
      await component.ngOnDestroy()
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
      expect((component as any).routeDataSubscription.unsubscribe).toHaveBeenCalled()
      expect(mockRespondSvc.unsubscribeResponse).toHaveBeenCalled()
    })

    it('does nothing extra when there is no htmlData or subscriptions', async () => {
      component.htmlData = null
      await expect(component.ngOnDestroy()).resolves.toBeUndefined()
    })
  })
})
