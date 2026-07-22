import { BehaviorSubject, Subject } from 'rxjs'
import { WsEvents } from '../../../../utils/src/lib/services/event.model'

jest.mock('@ws-widget/utils', () => ({
  ...jest.requireActual('../../../../utils/src/lib/services/event.model'),
}))

// eslint-disable-next-line import/first
import { PageComponent } from './page.component'

describe('PageComponent', () => {
  let component: PageComponent
  let activateRouteMock: any
  let loggerMock: any
  let configSvcMock: any
  let valueSvcMock: any
  let eventSvcMock: any
  let domSanitizerMock: any
  let respondSvcMock: any
  let dialogMock: any
  let exploreResolverSvcMock: any
  let routerMock: any
  let metaMock: any
  let isXSmallSubject: BehaviorSubject<boolean>
  let tourGuideSubject: Subject<boolean>
  let routeDataSubject: Subject<any>

  const createComponent = () => {
    isXSmallSubject = new BehaviorSubject<boolean>(false)
    tourGuideSubject = new Subject<boolean>()
    routeDataSubject = new Subject<any>()

    activateRouteMock = { data: routeDataSubject }
    loggerMock = { log: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() }
    configSvcMock = {
      userProfile: { name: 'John' },
      instanceConfig: { logos: { app: 'logo.png' }, sources: [] },
      restrictedFeatures: new Set(),
      tourGuideNotifier: tourGuideSubject,
      pageNavBar: { color: 'blue' },
    }
    valueSvcMock = { isXSmall$: isXSmallSubject.asObservable() }
    eventSvcMock = { dispatchEvent: jest.fn() }
    domSanitizerMock = { bypassSecurityTrustResourceUrl: jest.fn().mockReturnValue('safe-url') }
    respondSvcMock = { loadedRespond: jest.fn(), unsubscribeResponse: jest.fn() }
    dialogMock = { open: jest.fn() }
    exploreResolverSvcMock = { isInitialized: false, initialize: jest.fn() }
    routerMock = { navigateByUrl: jest.fn() }
    metaMock = { updateTag: jest.fn() }

    return new PageComponent(
      activateRouteMock,
      loggerMock,
      configSvcMock,
      valueSvcMock,
      eventSvcMock,
      domSanitizerMock,
      respondSvcMock,
      dialogMock,
      exploreResolverSvcMock,
      routerMock,
      metaMock,
    )
  }

  beforeEach(() => {
    localStorage.clear()
    component = createComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should navigate to organisations/home in constructor when orgValue is nhsrc', () => {
    localStorage.setItem('orgValue', 'nhsrc')
    const c = createComponent()
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/organisations/home')
    expect(c).toBeTruthy()
  })

  it('should not update isXSmall before ngOnInit is called', () => {
    isXSmallSubject.next(true)
    expect(component.isXSmall).toBe(false)
  })

  describe('ngOnInit', () => {
    it('should subscribe to isXSmall$ and update flag', () => {
      component.ngOnInit()
      isXSmallSubject.next(true)
      expect(component.isXSmall).toBe(true)
    })

    it('should update meta robots tag', () => {
      component.ngOnInit()
      expect(metaMock.updateTag).toHaveBeenCalledWith({ name: 'robots', content: 'noindex, nofollow' })
    })

    it('should set authenticated true when userProfile exists', () => {
      component.ngOnInit()
      expect(component.authenticated).toBe(true)
    })

    it('should set authenticated false and log when userProfile missing and not initialized', () => {
      configSvcMock.userProfile = null
      component.ngOnInit()
      expect(component.authenticated).toBe(false)
      expect(loggerMock.info).toHaveBeenCalledWith('Not Authenticated')
    })

    it('should initialize exploreResolverSvc when not initialized', () => {
      component.ngOnInit()
      expect(exploreResolverSvcMock.initialize).toHaveBeenCalled()
    })

    it('should not initialize exploreResolverSvc when already initialized', () => {
      exploreResolverSvcMock.isInitialized = true
      component.ngOnInit()
      expect(exploreResolverSvcMock.initialize).not.toHaveBeenCalled()
    })

    it('should set navbarIcon when instanceConfig has logos.app', () => {
      component.ngOnInit()
      expect(domSanitizerMock.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('logo.png')
      expect(component.navbarIcon).toBe('safe-url')
    })

    it('should set isHlpMenuXs based on restrictedFeatures', () => {
      configSvcMock.restrictedFeatures = new Set(['helpMenuXs'])
      component.ngOnInit()
      expect(component.isHlpMenuXs).toBe(true)
    })

    it('should not set navbar/logos when instanceConfig missing', () => {
      configSvcMock.instanceConfig = null
      component.ngOnInit()
      expect(component.navbarIcon).toBeUndefined()
    })

    it('should update isTourGuideAvailable via tourGuideNotifier subscription', () => {
      component.ngOnInit()
      tourGuideSubject.next(true)
      expect(component.isTourGuideAvailable).toBe(true)
    })

    it('should not update isTourGuideAvailable when restrictedFeatures has tourGuide', () => {
      configSvcMock.restrictedFeatures = new Set(['tourGuide'])
      component.ngOnInit()
      tourGuideSubject.next(true)
      expect(component.isTourGuideAvailable).toBe(false)
    })

    it('should set pageData/navBackground/links from routeData.pageData.data', () => {
      component.ngOnInit()
      const pageData = {
        navigationBar: {
          background: { color: 'red' },
          links: [{ widgetData: { actionBtnId: 'x', config: {} } }],
        },
      }
      routeDataSubject.next({ pageData: { data: pageData } })
      expect(component.pageData).toBe(pageData)
      expect(component.navBackground).toEqual({ color: 'red' })
      expect(component.links.length).toBe(1)
    })

    it('should filter out channel_how_to link when not xsmall', () => {
      component.ngOnInit()
      const pageData = {
        navigationBar: {
          background: null,
          links: [
            { widgetData: { actionBtnId: 'channel_how_to', config: {} } },
            { widgetData: { actionBtnId: 'other', config: {} } },
          ],
        },
      }
      routeDataSubject.next({ pageData: { data: pageData } })
      expect(component.links.length).toBe(1)
      expect(component.navBackground).toEqual({ color: 'blue' })
    })

    it('should map links with mat-menu-item type when isXSmall true', () => {
      component.ngOnInit()
      isXSmallSubject.next(true)
      const pageData = {
        navigationBar: {
          background: { color: 'red' },
          links: [{ widgetData: { actionBtnId: 'channel_how_to', config: {} } }],
        },
      }
      routeDataSubject.next({ pageData: { data: pageData } })
      expect(component.links[0].widgetData.config.type).toBe('mat-menu-item')
    })

    it('should use widgetData when routeData.pageData.data is absent', () => {
      component.widgetData = {
        navigationBar: {
          background: { color: 'green' },
          links: [{ widgetData: { actionBtnId: 'x', config: {} } }],
        },
      } as any
      component.ngOnInit()
      routeDataSubject.next({ pageData: {} })
      expect(component.pageData).toBe(component.widgetData)
      expect(component.navBackground).toEqual({ color: 'green' })
    })

    it('should set error and network error flags for object error with status 0', () => {
      component.ngOnInit()
      routeDataSubject.next({ pageData: { error: { type: 'NetworkError', status: 0 } } })
      expect(component.pageData).toBeNull()
      expect(component.isNetworkError).toBe(true)
      expect(loggerMock.error).toHaveBeenCalled()
      expect(loggerMock.warn).toHaveBeenCalledWith('No page data available')
    })

    it('should set isServerError for 5xx status', () => {
      component.ngOnInit()
      routeDataSubject.next({ pageData: { error: { status: 500 } } })
      expect(component.isServerError).toBe(true)
    })

    it('should set isForbiddenError for 403 status', () => {
      component.ngOnInit()
      routeDataSubject.next({ pageData: { error: { status: 403 } } })
      expect(component.isForbiddenError).toBe(true)
    })

    it('should set isClientError for 4xx status', () => {
      component.ngOnInit()
      routeDataSubject.next({ pageData: { error: { status: 404 } } })
      expect(component.isClientError).toBe(true)
    })

    it('should handle legacy string error (NoContent)', () => {
      component.ngOnInit()
      routeDataSubject.next({ pageData: { error: 'NoContent' } })
      expect(component.isNetworkError).toBe(false)
    })

    it('should handle legacy string error (non NoContent) as network error', () => {
      component.ngOnInit()
      routeDataSubject.next({ pageData: { error: 'SomeError' } })
      expect(component.isNetworkError).toBe(true)
    })

    it('should raise unloaded event when alreadyRaised and oldData present on second emission', () => {
      component.ngOnInit()
      const pageData1 = { navigationBar: undefined }
      routeDataSubject.next({ pageData: { data: pageData1 } })
      expect(eventSvcMock.dispatchEvent).toHaveBeenCalled()
      eventSvcMock.dispatchEvent.mockClear()
      const pageData2 = { navigationBar: undefined }
      routeDataSubject.next({ pageData: { data: pageData2 } })
      const calls = eventSvcMock.dispatchEvent.mock.calls
      expect(calls[0][0].data.state).toBe(WsEvents.EnumTelemetrySubType.Unloaded)
    })

    it('should subscribe to window message events and call loadedRespond on LOADED', async () => {
      component.ngOnInit()
      routeDataSubject.next({ pageData: { data: { navigationBar: undefined } } })
      const contentWindow = { postMessage: jest.fn() }
      const messageEvent = new MessageEvent('message', {
        data: { requestId: 'LOADED', subApplicationName: 'app1' },
        source: contentWindow as any,
      })
      window.dispatchEvent(messageEvent)
      await Promise.resolve()
      expect(respondSvcMock.loadedRespond).toHaveBeenCalledWith(contentWindow, 'app1')
    })

    it('should ignore message events without requestId matching LOADED', async () => {
      component.ngOnInit()
      routeDataSubject.next({ pageData: { data: { navigationBar: undefined } } })
      const contentWindow = { postMessage: jest.fn() }
      const messageEvent = new MessageEvent('message', {
        data: { requestId: 'OTHER' },
        source: contentWindow as any,
      })
      window.dispatchEvent(messageEvent)
      await Promise.resolve()
      expect(respondSvcMock.loadedRespond).not.toHaveBeenCalled()
    })
  })

  describe('ngAfterViewInit', () => {
    it('should scroll into view when hash present and not numeric', () => {
      jest.useFakeTimers()
      const el = document.createElement('div')
      el.id = 'section1'
      ;(el as any).scrollIntoView = jest.fn()
      document.body.appendChild(el)
      const scrollSpy = jest.spyOn(el, 'scrollIntoView')
      Object.defineProperty(window, 'location', { value: { hash: '#section1' }, writable: true })
      component.ngAfterViewInit()
      jest.advanceTimersByTime(1000)
      expect(scrollSpy).toHaveBeenCalled()
      document.body.removeChild(el)
      jest.useRealTimers()
    })

    it('should do nothing when hash is numeric', () => {
      jest.useFakeTimers()
      Object.defineProperty(window, 'location', { value: { hash: '#123' }, writable: true })
      expect(() => component.ngAfterViewInit()).not.toThrow()
      jest.useRealTimers()
    })

    it('should notify tourGuideNotifier when pageData.tourGuide truthy', () => {
      component.pageData = { tourGuide: true } as any
      const nextSpy = jest.spyOn(tourGuideSubject, 'next')
      Object.defineProperty(window, 'location', { value: { hash: '' }, writable: true })
      component.ngAfterViewInit()
      expect(nextSpy).toHaveBeenCalledWith(true)
    })
  })

  describe('raiseEvent', () => {
    it('should dispatch telemetry event with pageId from pathname', () => {
      Object.defineProperty(window, 'location', { value: { pathname: '/home' }, writable: true })
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded)
      expect(eventSvcMock.dispatchEvent).toHaveBeenCalled()
      const arg = eventSvcMock.dispatchEvent.mock.calls[0][0]
      expect(arg.data.pageId).toBe('home')
    })
  })

  describe('getNavLinks', () => {
    it('should return empty array when no pageData', () => {
      expect(component.getNavLinks()).toEqual([])
    })

    it('should return links unmodified when not isXSmall', () => {
      component.pageData = { navigationBar: { links: [{ widgetData: { config: {} } }] } } as any
      component.isXSmall = false
      expect(component.getNavLinks().length).toBe(1)
    })

    it('should map to mat-menu-item when isXSmall', () => {
      component.pageData = { navigationBar: { links: [{ widgetData: { config: {} } }] } } as any
      component.isXSmall = true
      const result = component.getNavLinks()
      expect(result[0].widgetData.config.type).toBe('mat-menu-item')
    })

    it('should return empty array when links is not an array', () => {
      component.pageData = { navigationBar: { links: undefined } } as any
      expect(component.getNavLinks()).toEqual([])
    })
  })

  describe('logout', () => {
    it('should open the logout dialog', () => {
      component.logout()
      expect(dialogMock.open).toHaveBeenCalled()
    })
  })

  describe('reloadPage', () => {
    it('should clear error state and reload window', () => {
      component.error = 'err'
      component.isNetworkError = true
      component.isServerError = true
      component.isForbiddenError = true
      component.isClientError = true
      const reloadFn = jest.fn()
      Object.defineProperty(window, 'location', { value: { reload: reloadFn }, writable: true })
      component.reloadPage()
      expect(component.error).toBeNull()
      expect(component.isNetworkError).toBe(false)
      expect(reloadFn).toHaveBeenCalled()
    })
  })

  describe('ngOnDestroy', () => {
    it('should raise unloaded event when pageData present', () => {
      Object.defineProperty(window, 'location', { value: { pathname: '/home' }, writable: true })
      component.pageData = { navigationBar: undefined } as any
      component.ngOnDestroy()
      expect(eventSvcMock.dispatchEvent).toHaveBeenCalled()
    })

    it('should notify tourGuideNotifier false and unsubscribe responseSubscription', () => {
      const nextSpy = jest.spyOn(tourGuideSubject, 'next')
      const sub = { unsubscribe: jest.fn() }
      ;(component as any).responseSubscription = sub
      component.ngOnDestroy()
      expect(nextSpy).toHaveBeenCalledWith(false)
      expect(sub.unsubscribe).toHaveBeenCalled()
    })

    it('should not raise event when pageData absent', () => {
      component.pageData = null
      eventSvcMock.dispatchEvent.mockClear()
      component.ngOnDestroy()
      expect(eventSvcMock.dispatchEvent).not.toHaveBeenCalled()
    })
  })

  describe('startTour', () => {
    it('should unsubscribe response and call unsubscribeResponse when responseSubscription present', () => {
      const sub = { unsubscribe: jest.fn() }
      ;(component as any).responseSubscription = sub
      component.startTour()
      expect(respondSvcMock.unsubscribeResponse).toHaveBeenCalled()
      expect(sub.unsubscribe).toHaveBeenCalled()
    })

    it('should do nothing when responseSubscription absent', () => {
      ;(component as any).responseSubscription = null
      expect(() => component.startTour()).not.toThrow()
      expect(respondSvcMock.unsubscribeResponse).not.toHaveBeenCalled()
    })
  })
})
