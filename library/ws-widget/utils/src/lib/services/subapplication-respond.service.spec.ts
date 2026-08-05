import { ReplaySubject, of } from 'rxjs'
import { SubapplicationRespondService } from './subapplication-respond.service'
import { WsEvents } from './event.model'

describe('SubapplicationRespondService', () => {
  let service: SubapplicationRespondService
  let configSvc: any
  let contentSvc: any
  let activatedRoute: any
  let router: any
  let eventSvc: any
  let teleSvc: any
  let contentWindow: any

  const buildWindow = () => ({
    postMessage: jest.fn(),
    location: { origin: 'https://sub.app' },
  })

  const build = () => new SubapplicationRespondService(
    configSvc, contentSvc, activatedRoute, router, eventSvc, teleSvc,
  )

  beforeEach(() => {
    configSvc = {
      prefChangeNotifier: new ReplaySubject<any>(1),
      userProfile: { userName: 'Ada Lovelace', userId: 'u1' },
      userRoles: new Set(['learner']),
      rootOrg: 'root-1',
      activeThemeObject: null,
      activeFontObject: null,
      userPreference: null,
      isDarkMode: false,
    }
    contentSvc = { fetchContentHistory: jest.fn().mockReturnValue(of({ continueData: { data: { progress: 1 } } })) }
    activatedRoute = { snapshot: { queryParams: {} } }
    router = { url: '/app/viewer/html/c1' }
    eventSvc = { dispatchEvent: jest.fn() }
    teleSvc = { externalImpression: jest.fn() }
    contentWindow = buildWindow()
    service = build()
  })

  afterEach(() => jest.clearAllMocks())

  it('should create with an empty state', () => {
    expect(service).toBeTruthy()
    expect(service.subAppname).toBe('')
    expect(service.continueLearningData).toBeNull()
    expect(service.loaded).toBe(false)
  })

  describe('loadedRespond', () => {
    it('should post a LOADED response with the parent context', () => {
      service.loadedRespond(contentWindow, 'RBCP')

      expect(contentWindow.postMessage).toHaveBeenCalledTimes(1)
      const [response, origin] = contentWindow.postMessage.mock.calls[0]
      expect(origin).toBe('https://sub.app')
      expect(response.requestId).toBe('LOADED')
      expect(response.subApplicationName).toBe('RBCP')
      expect(response.data).toBeNull()
      expect(response.parentContext).toEqual(expect.objectContaining({
        url: '/app/viewer/html/c1',
        rootOrg: 'root-1',
        theme: '',
        fontSize: '14px',
        locale: 'en',
        darkMode: false,
        subApplicationStartMode: '',
        heartbeatFrequency: '200',
      }))
      expect(response.parentContext.user).toEqual({
        firstName: 'Ada', lastName: 'Lovelace', userId: 'u1', roles: ['learner'],
      })
      expect(service.loaded).toBe(true)
      expect(service.subAppname).toBe('RBCP')
    })

    it('should fetch the continue-learning payload in resume mode', () => {
      activatedRoute.snapshot.queryParams = { viewMode: 'RESUME' }
      service.loadedRespond(contentWindow, 'RBCP', 'c1')

      expect(contentSvc.fetchContentHistory).toHaveBeenCalledWith('c1')
      const [response] = contentWindow.postMessage.mock.calls[0]
      expect(response.data).toEqual({ continueLearning: { progress: 1 } })
      expect(response.parentContext.subApplicationStartMode).toBe('RESUME')
    })

    it('should send a null payload when the history has no continue data', () => {
      activatedRoute.snapshot.queryParams = { viewMode: 'RESUME' }
      contentSvc.fetchContentHistory.mockReturnValue(of({ continueData: {} }))
      service.loadedRespond(contentWindow, 'RBCP', 'c1')
      expect(contentWindow.postMessage.mock.calls[0][0].data).toBeNull()
    })

    it('should ignore resume mode when no content id is given', () => {
      activatedRoute.snapshot.queryParams = { viewMode: 'RESUME' }
      service.loadedRespond(contentWindow, 'RBCP')
      expect(contentSvc.fetchContentHistory).not.toHaveBeenCalled()
    })

    it('should not respond when there is no user profile', () => {
      configSvc.userProfile = null
      service.loadedRespond(contentWindow, 'RBCP')
      expect(contentWindow.postMessage).not.toHaveBeenCalled()
      expect(service.loaded).toBe(false)
    })

    it('should carry the theme and font when they are configured', () => {
      configSvc.activeThemeObject = { themeName: 'dark', color: { primary: '#000' } }
      configSvc.activeFontObject = { baseFontSize: '16px' }
      configSvc.userPreference = { selectedLocale: 'hi' }
      configSvc.isDarkMode = true

      service.loadedRespond(contentWindow, 'RBCP')
      const { parentContext } = contentWindow.postMessage.mock.calls[0][0]
      expect(parentContext.theme).toEqual({ name: 'dark', primary: '#000' })
      expect(parentContext.fontSize).toBe('16px')
      expect(parentContext.locale).toBe('hi')
      expect(parentContext.darkMode).toBe(true)
    })

    it('should send blank user names when the profile has none', () => {
      configSvc.userProfile = { userId: '' }
      service.loadedRespond(contentWindow, 'RBCP')
      expect(contentWindow.postMessage.mock.calls[0][0].parentContext.user).toEqual({
        firstName: '', lastName: '', userId: '', roles: ['learner'],
      })
    })

    it('should send empty roles when none are resolved', () => {
      configSvc.userRoles = null
      service.loadedRespond(contentWindow, 'RBCP')
      expect(contentWindow.postMessage.mock.calls[0][0].parentContext.user.roles).toEqual([])
    })

    it('should fall back to a null origin when the frame origin is unreadable', () => {
      Object.defineProperty(contentWindow, 'location', {
        get() { throw new Error('cross-origin') },
      })
      service.loadedRespond(contentWindow, 'RBCP')
      expect(contentWindow.postMessage.mock.calls[0][1]).toBeNull()
    })
  })

  describe('telemetryEvents', () => {
    it('should dispatch an Interact telemetry event', () => {
      service.telemetryEvents({ eventId: 'INTERACT', subApplicationName: 'RBCP', data: { type: 'click' } })
      expect(eventSvc.dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({
        eventType: WsEvents.WsEventType.Telemetry,
        from: 'RBCP',
        to: 'Telemetry',
        data: expect.objectContaining({
          type: 'click',
          eventSubType: WsEvents.EnumTelemetrySubType.Interact,
        }),
      }))
    })

    it('should dispatch a HeartBeat telemetry event', () => {
      service.telemetryEvents({ eventId: 'HEARTBEAT', subApplicationName: 'RBCP', data: { type: 'player' } })
      expect(eventSvc.dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ eventSubType: WsEvents.EnumTelemetrySubType.HeartBeat }),
      }))
    })

    it('should forward an impression to the telemetry service', () => {
      service.telemetryEvents({ eventId: 'IMPRESSION', data: { type: 'view' } })
      expect(teleSvc.externalImpression).toHaveBeenCalledWith({ type: 'view' })
      expect(eventSvc.dispatchEvent).not.toHaveBeenCalled()
    })

    it('should ignore an unknown event id', () => {
      service.telemetryEvents({ eventId: 'SOMETHING', data: {} })
      expect(eventSvc.dispatchEvent).not.toHaveBeenCalled()
      expect(teleSvc.externalImpression).not.toHaveBeenCalled()
    })

    it('should ignore a null payload', () => {
      service.telemetryEvents(null)
      expect(eventSvc.dispatchEvent).not.toHaveBeenCalled()
    })
  })

  describe('unsubscribeResponse', () => {
    it('should clear the tracked sub-application state', () => {
      service.loadedRespond(contentWindow, 'RBCP')
      service.unsubscribeResponse()
      expect(service.subAppname).toBe('')
      expect(service.continueLearningData).toBeNull()
      expect(service.contentWindowinfo).toBeNull()
      expect(service.loaded).toBe(false)
    })
  })

  describe('changeContextrespond', () => {
    it('should post a CONTEXT_CHANGE response once loaded', () => {
      service.loadedRespond(contentWindow, 'RBCP')
      contentWindow.postMessage.mockClear()

      service.changeContextrespond()
      const [response, origin] = contentWindow.postMessage.mock.calls[0]
      expect(response.requestId).toBe('CONTEXT_CHANGE')
      expect(response.subApplicationName).toBe('RBCP')
      expect(response.parentContext).toBeDefined()
      expect(origin).toBe('https://sub.app')
    })

    it('should do nothing before a sub-application has loaded', () => {
      service.changeContextrespond()
      expect(contentWindow.postMessage).not.toHaveBeenCalled()
    })

    it('should do nothing once the profile is gone', () => {
      service.loadedRespond(contentWindow, 'RBCP')
      contentWindow.postMessage.mockClear()
      configSvc.userProfile = null

      service.changeContextrespond()
      expect(contentWindow.postMessage).not.toHaveBeenCalled()
    })

    it('should re-send the context when preferences change', async () => {
      service.loadedRespond(contentWindow, 'RBCP')
      contentWindow.postMessage.mockClear()

      // The constructor defers its prefChangeNotifier subscription to a microtask.
      await new Promise(resolve => queueMicrotask(() => resolve(null)))
      configSvc.prefChangeNotifier.next({ isDarkMode: true })

      expect(contentWindow.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ requestId: 'CONTEXT_CHANGE' }),
        'https://sub.app',
      )
    })
  })
})
