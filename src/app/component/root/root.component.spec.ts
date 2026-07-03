jest.mock('@angular/core', () => ({
  ...jest.requireActual('@angular/core'),
  effect: (fn: any) => { fn(); return {} },
}))

jest.mock('@angular/common', () => ({
  isPlatformBrowser: jest.fn().mockReturnValue(false),
}))

jest.mock('@angular/core/rxjs-interop', () => ({
  toSignal: jest.fn().mockReturnValue(() => []),
  toObservable: jest.fn(),
}))

jest.mock('lodash', () => ({
  split: (str: string, sep: string) => (str || '').split(sep),
}))

jest.mock('@capacitor/app', () => ({
  App: { addListener: jest.fn(), removeAllListeners: jest.fn() },
}))

jest.mock('dayjs', () => jest.fn().mockReturnValue({ format: jest.fn().mockReturnValue('2024-01-01') }))

jest.mock('@ws-widget/collection', () => ({
  BtnPageBackService: class { initialize = jest.fn(); handler = { next: jest.fn() } },
  WidgetContentService: class {
    workMessage = { subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }) }
    fetchContentHistoryV2 = jest.fn()
  },
  WidgetUserService: class {
    fetchUserBatchList = jest.fn().mockReturnValue({ pipe: jest.fn().mockReturnThis() })
  },
}))

jest.mock('@ws-widget/utils', () => ({
  AuthKeycloakService: class { isLoggedIn = jest.fn().mockReturnValue(false) },
  ConfigurationsService: class {
    userProfile = null
    unMappedUser = null
    isAuthenticated = false
  },
  ValueService: class {
    isMobile = jest.fn().mockReturnValue(false)
    updateWidth = jest.fn()
  },
  TelemetryService: class {
    start = jest.fn(); end = jest.fn(); interact = jest.fn()
    registrationInteract = jest.fn(); getTelemetryConfig = jest.fn()
    impression = jest.fn(); audit = jest.fn(); publicImpression = jest.fn()
  },
  LoggerService: class { log = jest.fn(); warn = jest.fn(); error = jest.fn() },
  WsEvents: { WsAuditTypes: { Created: 'Created' } },
}))

jest.mock('@ws-widget/resolver', () => ({
  LoginResolverService: class { isInitialized = false; initialize = jest.fn() },
}))

jest.mock('../../../../library/ws-widget/resolver/src/public-api', () => ({
  LoginResolverService: class { isInitialized = false; initialize = jest.fn() },
}))

jest.mock('../../../../library/ws-widget/resolver/src/lib/explore-resolver.service', () => ({
  ExploreResolverService: class { isInitialized = false; initialize = jest.fn() },
}))

jest.mock('../../../../project/ws/app/src/lib/routes/org/org-service.service', () => ({
  OrgServiceService: class { getOrgDetails = jest.fn() },
}))

jest.mock('project/ws/app/src/lib/routes/user-profile/services/user-profile.service', () => ({
  UserProfileService: class {
    updateuser$ = { pipe: jest.fn().mockReturnThis(), subscribe: jest.fn() }
    clearUserDetailsCache = jest.fn()
    getUserdetailsFromRegistry = jest.fn()
  },
}))

jest.mock('../../services/mobile-apps.service', () => ({
  MobileAppsService: class { init = jest.fn() },
}))

jest.mock('../../services/user-data-cache.service', () => ({
  UserDataCacheService: class {
    clearUserData = jest.fn(); setUserData = jest.fn(); getUserData = jest.fn()
  },
}))

jest.mock('../../routes/competency/services/config.service', () => ({
  ConfigService: class { getCompetencyConfig = jest.fn(); setConfig = jest.fn() },
}))

jest.mock('src/app/services/user-agent.service', () => ({
  UserAgentResolverService: class {
    getUserAgent = jest.fn().mockReturnValue({ browserName: 'Chrome', OS: 'Mac' })
    generateCookie = jest.fn(); setSource = jest.fn()
  },
}))

jest.mock('../../../../library/ws-widget/collection/src/public-api', () => ({
  WidgetContentService: class {
    fetchContentHistoryV2 = jest.fn()
    workMessage = { subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }) }
  },
  WidgetUserService: class {
    fetchUserBatchList = jest.fn().mockReturnValue({ pipe: jest.fn().mockReturnThis() })
  },
  BtnPageBackService: class { initialize = jest.fn(); handler = { next: jest.fn() } },
}))

jest.mock('project/ws/viewer/src/lib/viewer-util.service', () => ({
  ViewerUtilService: class { initUpdate = jest.fn() },
}))

jest.mock('@ngx-translate/core', () => ({
  TranslateService: class { instant = jest.fn() },
}))

jest.mock('../../services/playlist.service', () => ({
  PlaylistService: class {
    loadPlaylistData = jest.fn().mockResolvedValue({})
    getPlaylistConfig = jest.fn().mockResolvedValue({})
    orgDetails = jest.fn().mockReturnValue({})
    headerConfig = jest.fn().mockReturnValue({})
    sections = jest.fn().mockReturnValue({})
    selectedTabConfig = jest.fn().mockReturnValue([])
    config = jest.fn().mockReturnValue([])
    footerConfig = jest.fn().mockReturnValue({})
  },
}))

jest.mock('../../services/downtime-config.service', () => ({
  DowntimeConfigService: class {
    initializeDowntimeConfig = jest.fn()
    themeConfig = jest.fn().mockReturnValue({})
  },
}))

jest.mock('../../services/theme.service', () => ({
  ThemeService: class {
    isDark = jest.fn().mockReturnValue(false)
    setTheme = jest.fn()
    hasStoredPreference = jest.fn().mockReturnValue(false)
    applyOrgTheme = jest.fn()
  },
}))

jest.mock('../../services/seo.service', () => ({
  SeoService: class { update = jest.fn() },
}))

jest.mock('./root.service', () => ({
  RootService: class {
    showNavbarDisplay$ = { pipe: jest.fn().mockReturnThis(), subscribe: jest.fn() }
  },
}))

import { NavigationEnd, NavigationStart, NavigationCancel, NavigationError } from '@angular/router'
import { of, Subject, throwError } from 'rxjs'
import { RootComponent } from './root.component'

beforeAll(() => {
  ;(window as any).fcWidget = {
    open: jest.fn(), show: jest.fn(), hide: jest.fn(), init: jest.fn(),
    on: jest.fn(), setConfig: jest.fn(),
    user: { setFirstName: jest.fn(), setLastName: jest.fn(), setPhone: jest.fn(), setMeta: jest.fn() },
  }
})

function buildMocks(overrides: any = {}) {
  const routerEvents$ = overrides.routerEvents$ || new Subject()
  const showNavbarDisplay$ = overrides.showNavbarDisplay$ || new Subject()
  const hideHeaderFooter$ = overrides.hideHeaderFooter$ || new Subject()

  const mockRouter = {
    events: routerEvents$, navigate: jest.fn(), navigateByUrl: jest.fn(), url: '/page/home',
  }
  const mockAuthSvc = { isLoggedIn: jest.fn().mockReturnValue(false) }
  const mockConfigSvc = overrides.configSvc || { userProfile: null, unMappedUser: null, isAuthenticated: false }
  const mockValueSvc = { isMobile: jest.fn().mockReturnValue(false), updateWidth: jest.fn() }
  const mockTelemetrySvc = {
    start: jest.fn(), end: jest.fn(), interact: jest.fn(),
    registrationInteract: jest.fn(), getTelemetryConfig: jest.fn(),
    impression: jest.fn(), audit: jest.fn(), publicImpression: jest.fn(),
  }
  const mockMobileAppsSvc = { init: jest.fn() }
  const mockRootSvc = { showNavbarDisplay$ }
  const mockBtnBackSvc = { initialize: jest.fn(), handler: { next: jest.fn() } }
  const mockChangeDetector = { detectChanges: jest.fn(), markForCheck: jest.fn() }
  const mockLoginServ = { isInitialized: false, initialize: jest.fn() }
  const mockExploreService = { isInitialized: false, initialize: jest.fn() }
  const mockOrgService = { hideHeaderFooter: hideHeaderFooter$ }
  const mockActivatedRoute = {
    snapshot: {
      queryParamMap: { keys: ['ref'], get: jest.fn().mockReturnValue('home') },
      data: { title: 'Test' },
    },
    firstChild: null,
  }
  const mockUserProfileSvc = overrides.userProfileSvc || {
    updateuser$: { pipe: jest.fn().mockReturnThis(), subscribe: jest.fn() },
    clearUserDetailsCache: jest.fn(),
    getUserdetailsFromRegistry: jest.fn().mockReturnValue(of({ profileDetails: { profileReq: {} } })),
  }
  const mockUserDataCacheSvc = { clearUserData: jest.fn(), setUserData: jest.fn(), getUserData: jest.fn() }
  const mockContentSvc = overrides.contentSvc || {
    fetchContentHistoryV2: jest.fn().mockReturnValue(of({ result: { contentList: [] } })),
    workMessage: { subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }) },
  }
  const mockCompetencyConfigSvc = { setConfig: jest.fn() }
  const mockUserAgentSvc = {
    getUserAgent: jest.fn().mockReturnValue({ browserName: 'Chrome', OS: 'Mac' }),
    generateCookie: jest.fn(), setSource: jest.fn(),
  }
  const mockUserSvc = { fetchUserBatchList: jest.fn().mockReturnValue(of([])) }
  const mockViewerSvc = { initUpdate: jest.fn().mockReturnValue(of({})) }
  const mockInjector = { get: jest.fn().mockReturnValue(null) }
  const mockPlaylistSvc = overrides.playlistSvc || {
    loadPlaylistData: jest.fn().mockResolvedValue({}),
    getPlaylistConfig: jest.fn().mockResolvedValue({}),
    orgDetails: jest.fn().mockReturnValue({}),
    headerConfig: jest.fn().mockReturnValue({}),
    sections: jest.fn().mockReturnValue({ homeTab: [] }),
    selectedTabConfig: jest.fn().mockReturnValue([]),
    config: jest.fn().mockReturnValue([]),
    footerConfig: jest.fn().mockReturnValue({}),
    programs: jest.fn().mockReturnValue({}),
    showDetails: { set: jest.fn() },
  }
  const mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
  const mockDowntimeService = overrides.downtimeService || {
    initializeDowntimeConfig: jest.fn().mockReturnValue(of({ active: false })),
    themeConfig: jest.fn().mockReturnValue({}),
  }
  const mockThemeSvc = {
    isDark: jest.fn().mockReturnValue(false), setTheme: jest.fn(),
    hasStoredPreference: jest.fn().mockReturnValue(false), applyOrgTheme: jest.fn(),
  }
  const mockSeoSvc = { update: jest.fn() }

  const comp = new RootComponent(
    mockRouter as any,
    mockAuthSvc as any,
    mockConfigSvc as any,
    mockValueSvc as any,
    mockTelemetrySvc as any,
    mockMobileAppsSvc as any,
    mockRootSvc as any,
    mockBtnBackSvc as any,
    mockChangeDetector as any,
    mockLoginServ as any,
    mockExploreService as any,
    mockOrgService as any,
    mockActivatedRoute as any,
    mockUserProfileSvc as any,
    mockUserDataCacheSvc as any,
    mockContentSvc as any,
    mockCompetencyConfigSvc as any,
    mockUserAgentSvc as any,
    mockUserSvc as any,
    mockViewerSvc as any,
    mockInjector as any,
    mockPlaylistSvc as any,
    mockLogger as any,
    mockDowntimeService as any,
    mockThemeSvc as any,
    mockSeoSvc as any,
    'server' as any,
  )

  return {
    comp, routerEvents$, showNavbarDisplay$, hideHeaderFooter$,
    mockRouter, mockConfigSvc, mockTelemetrySvc, mockLogger, mockSeoSvc,
    mockChangeDetector, mockLoginServ, mockExploreService, mockBtnBackSvc,
    mockDowntimeService, mockPlaylistSvc, mockThemeSvc, mockUserProfileSvc,
    mockContentSvc, mockViewerSvc, mockCompetencyConfigSvc, mockValueSvc, mockUserAgentSvc,
    mockMobileAppsSvc, mockUserDataCacheSvc,
  }
}

describe('RootComponent', () => {
  let component: RootComponent
  let routerEvents$: Subject<any>
  let showNavbarDisplay$: Subject<boolean>
  let hideHeaderFooter$: Subject<boolean>
  let mocks: ReturnType<typeof buildMocks>

  beforeEach(() => {
    routerEvents$ = new Subject()
    showNavbarDisplay$ = new Subject()
    hideHeaderFooter$ = new Subject()
    mocks = buildMocks({ routerEvents$, showNavbarDisplay$, hideHeaderFooter$ })
    component = mocks.comp
  })

  afterEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('defaults routeChangeInProgress to false', () => {
    expect(component.routeChangeInProgress).toBe(false)
  })

  it('defaults showNavbar to false', () => {
    expect(component.showNavbar).toBe(false)
  })

  it('defaults isLoggedIn to false', () => {
    expect(component.isLoggedIn).toBe(false)
  })

  it('effect callback sets isXSmall$ via valueSvc.isMobile()', () => {
    expect(component.isXSmall$).toBe(false)
  })

  it('covers browser-only window resize subscribe callback (isPlatformBrowser=true in constructor)', () => {
    const { isPlatformBrowser } = require('@angular/common')
    isPlatformBrowser.mockReturnValue(true)
    const m = buildMocks({
      routerEvents$: new Subject(),
      showNavbarDisplay$: new Subject(),
      hideHeaderFooter$: new Subject(),
    })
    window.dispatchEvent(new Event('resize'))
    expect(m.mockValueSvc.updateWidth).toHaveBeenCalledWith(window.innerWidth)
    isPlatformBrowser.mockReturnValue(false)
    m.comp.ngOnDestroy()
  })

  it('covers toSignal map callback (map(res => buildEnrolledCourses(res))) when userProfile is set', () => {
    const { toSignal } = require('@angular/core/rxjs-interop')
    let mapCallbackResult: any
    toSignal.mockImplementationOnce((obs: any) => {
      obs.subscribe((v: any) => { mapCallbackResult = v })
      return () => mapCallbackResult || []
    })
    // fetchUserBatchList returns of([{content:{identifier:'x1'}}]) so map callback fires with that
    buildMocks({
      routerEvents$: new Subject(),
      showNavbarDisplay$: new Subject(),
      hideHeaderFooter$: new Subject(),
      configSvc: { userProfile: { userId: 'u1' }, unMappedUser: null, isAuthenticated: false },
    })
    // mapCallbackResult set when the observable emitted; it should be an array
    expect(Array.isArray(mapCallbackResult)).toBe(true)
  })

  describe('mergeProgressDetails', () => {
    it('merges with obj2 values overriding obj1', () => {
      expect(component.mergeProgressDetails({ a: 1, b: 2 }, { b: 99, c: 3 })).toEqual({ a: 1, b: 99, c: 3 })
    })

    it('adds keys from obj2 not in obj1', () => {
      const result = component.mergeProgressDetails({ x: 10 }, { y: 20, z: 30 })
      expect(result.y).toBe(20)
      expect(result.z).toBe(30)
    })

    it('does not mutate obj1', () => {
      const obj1 = { a: 1 }
      component.mergeProgressDetails(obj1, { b: 2 })
      expect(obj1).toEqual({ a: 1 })
    })
  })

  describe('ngOnDestroy', () => {
    it('unsubscribes routerEventsSubscription', () => {
      const spy = jest.spyOn(component['routerEventsSubscription'], 'unsubscribe')
      component.ngOnDestroy()
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('networkStatus', () => {
    it('sets appOnline via subscribe callback (online$ is of(true))', () => {
      component.appOnline = false
      component.networkStatus()
      expect(component.appOnline).toBe(true)
    })
  })

  describe('openFreshChat', () => {
    it('calls fcWidget.open and show', () => {
      component.openFreshChat()
      expect((window as any).fcWidget.open).toHaveBeenCalled()
      expect((window as any).fcWidget.show).toHaveBeenCalled()
    })
  })

  describe('backToChatIcon', () => {
    it('sets isCommonChatEnabled to true', () => {
      component.isCommonChatEnabled = false
      component.backToChatIcon()
      expect(component.isCommonChatEnabled).toBe(true)
    })

    it('calls fcWidget.setConfig and init', () => {
      component.backToChatIcon()
      expect((window as any).fcWidget.setConfig).toHaveBeenCalledWith({ headerProperty: { hideChatButton: true } })
      expect((window as any).fcWidget.init).toHaveBeenCalled()
    })

    it('does not throw when fcWidget is undefined', () => {
      const orig = (window as any).fcWidget
      ;(window as any).fcWidget = undefined
      expect(() => component.backToChatIcon()).not.toThrow()
      ;(window as any).fcWidget = orig
    })
  })

  describe('handleKeyDown', () => {
    it('calls backToChatIcon on Enter', () => {
      const spy = jest.spyOn(component, 'backToChatIcon')
      component.handleKeyDown({ key: 'Enter' } as KeyboardEvent)
      expect(spy).toHaveBeenCalled()
    })

    it('calls backToChatIcon on Space', () => {
      const spy = jest.spyOn(component, 'backToChatIcon')
      component.handleKeyDown({ key: ' ' } as KeyboardEvent)
      expect(spy).toHaveBeenCalled()
    })

    it('does not call backToChatIcon on other key', () => {
      const spy = jest.spyOn(component, 'backToChatIcon')
      component.handleKeyDown({ key: 'Tab' } as KeyboardEvent)
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('setCompetencyConfig', () => {
    it('calls setConfig when profileDetails present', () => {
      const data = { profileDetails: { profileReq: { userId: 'u1' } } }
      component.setCompetencyConfig(data)
      expect(mocks.mockCompetencyConfigSvc.setConfig).toHaveBeenCalledWith(
        data.profileDetails.profileReq, data.profileDetails,
      )
    })

    it('does not throw when profileDetails absent', () => {
      expect(() => component.setCompetencyConfig({})).not.toThrow()
    })
  })

  describe('onResize', () => {
    it('calls valueSvc.updateWidth', () => {
      mocks.mockRouter.url = '/other'
      component.onResize()
      expect(mocks.mockValueSvc.updateWidth).toHaveBeenCalledWith(window.innerWidth)
    })

    it('navigates to search/home when on search route and width <= 767', () => {
      mocks.mockRouter.url = '/app/search'
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 600 })
      component.onResize()
      expect(mocks.mockRouter.navigate).toHaveBeenCalledWith(['/app/search/home'])
    })

    it('navigates to search/learning when on search route and width > 767', () => {
      mocks.mockRouter.url = '/app/search'
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 1200 })
      component.onResize()
      expect(mocks.mockRouter.navigate).toHaveBeenCalledWith(['/app/search/learning'])
    })
  })

  describe('buildEnrolledCourses (private)', () => {
    it('maps items with identifier to course objects', () => {
      const res = [
        {
          content: {
            identifier: 'c1', appIcon: 'icon', thumbnail: 'thumb',
            name: 'Course 1', sourceName: 'Src', issueCertification: true,
            averageRating: 4, posterImage: 'poster',
          },
          dateTime: '2024', completionPercentage: 50,
        },
        { content: {} },
      ]
      const result = (component as any).buildEnrolledCourses(res)
      expect(result).toHaveLength(1)
      expect(result[0].identifier).toBe('c1')
      expect(result[0].completionPercentage).toBe(50)
    })

    it('skips items without identifier (forEach callback)', () => {
      const result = (component as any).buildEnrolledCourses([{ content: {} }, { content: null }])
      expect(result).toEqual([])
    })

    it('returns empty array for empty input', () => {
      expect((component as any).buildEnrolledCourses([])).toEqual([])
    })
  })

  describe('ngAfterViewInit', () => {
    it('calls fcWidget.hide and on when fcWidget exists', () => {
      component.ngAfterViewInit()
      expect((window as any).fcWidget.hide).toHaveBeenCalled()
      expect((window as any).fcWidget.on).toHaveBeenCalledWith('widget:closed', expect.any(Function))
    })

    it('covers the empty widget:closed arrow callback', () => {
      let closedCb: any
      ;(window as any).fcWidget.on = jest.fn((_: string, cb: any) => { closedCb = cb })
      component.ngAfterViewInit()
      expect(() => closedCb()).not.toThrow()
    })

    it('does not throw when fcWidget is undefined', () => {
      const orig = (window as any).fcWidget
      ;(window as any).fcWidget = undefined
      expect(() => component.ngAfterViewInit()).not.toThrow()
      ;(window as any).fcWidget = orig
    })

    it('covers catch block (line 735) when fcWidget.hide throws', () => {
      const orig = (window as any).fcWidget.hide
      ;(window as any).fcWidget.hide = jest.fn(() => { throw new Error('hide failed') })
      component.ngAfterViewInit()
      expect(mocks.mockLogger.log).toHaveBeenCalledWith(expect.any(Error))
      ;(window as any).fcWidget.hide = orig
    })
  })

  describe('fcSettingsFunc', () => {
    it('does not throw when fcWidget is undefined', () => {
      const orig = (window as any).fcWidget
      ;(window as any).fcWidget = undefined
      expect(() => component.fcSettingsFunc()).not.toThrow()
      ;(window as any).fcWidget = orig
    })

    it('calls fcWidget.setConfig and init', () => {
      component.fcSettingsFunc()
      expect((window as any).fcWidget.setConfig).toHaveBeenCalledWith({ headerProperty: { hideChatButton: true } })
      expect((window as any).fcWidget.init).toHaveBeenCalled()
    })

    it('sets user data when userProfile present', () => {
      component['configSvc'].userProfile = {
        userId: 'u1', userName: 'user', firstName: 'First', lastName: 'Last', phone: '12345',
      } as any
      component.fcSettingsFunc()
      expect((window as any).fcWidget.user.setFirstName).toHaveBeenCalledWith('First')
      expect((window as any).fcWidget.user.setLastName).toHaveBeenCalledWith('Last')
      expect((window as any).fcWidget.user.setPhone).toHaveBeenCalledWith('12345')
      expect((window as any).fcWidget.user.setMeta).toHaveBeenCalledWith({ userId: 'u1', username: 'user' })
    })

    it('covers catch block (line 756) when fcWidget.setConfig throws', () => {
      const orig = (window as any).fcWidget.setConfig
      ;(window as any).fcWidget.setConfig = jest.fn(() => { throw new Error('setConfig failed') })
      component.fcSettingsFunc()
      expect(mocks.mockLogger.log).toHaveBeenCalledWith(expect.any(Error))
      ;(window as any).fcWidget.setConfig = orig
    })
  })

  describe('getDeepestRouteData (private)', () => {
    it('returns root snapshot data when no firstChild', () => {
      component['activatedRoute'] = { snapshot: { data: { title: 'Home' } }, firstChild: null } as any
      expect((component as any).getDeepestRouteData()).toEqual({ title: 'Home' })
    })

    it('traverses firstChild chain to deepest route', () => {
      component['activatedRoute'] = {
        firstChild: {
          firstChild: { firstChild: null, snapshot: { data: { title: 'Deep' } } },
          snapshot: { data: { title: 'Middle' } },
        },
        snapshot: { data: { title: 'Root' } },
      } as any
      expect((component as any).getDeepestRouteData()).toEqual({ title: 'Deep' })
    })

    it('returns empty object when snapshot data is undefined', () => {
      component['activatedRoute'] = { snapshot: { data: undefined }, firstChild: null } as any
      expect((component as any).getDeepestRouteData()).toEqual({})
    })
  })

  describe('setPageTitle', () => {
    it('calls seoSvc.update on NavigationEnd (filter + map + subscribe callbacks)', () => {
      component['activatedRoute'] = {
        snapshot: { data: { title: 'My Page', seoDescription: 'desc', seoKeywords: 'kw', seoOgImage: 'img' } },
        firstChild: null,
      } as any
      component.setPageTitle()
      routerEvents$.next(new NavigationEnd(1, '/test', '/test'))
      expect(mocks.mockSeoSvc.update).toHaveBeenCalledWith({
        title: 'My Page', description: 'desc', keywords: 'kw', ogImage: 'img',
      })
    })

    it('ignores non-NavigationEnd events (filter callback)', () => {
      mocks.mockSeoSvc.update.mockClear()
      component.setPageTitle()
      routerEvents$.next(new NavigationStart(1, '/test'))
      expect(mocks.mockSeoSvc.update).not.toHaveBeenCalled()
    })
  })

  describe('handleRouterSubscription', () => {
    it('sets hideFooter true for org-selective-course (NavigationEnd)', () => {
      component.handleRouterSubscription()
      mocks.mockRouter.url = '/app/org-selective-course'
      routerEvents$.next(new NavigationEnd(1, '/app/org-selective-course', '/app/org-selective-course'))
      expect(component.hideFooter).toBe(true)
    })

    it('sets isSetupPage true when url includes /setup/', () => {
      component.handleRouterSubscription()
      mocks.mockRouter.url = '/other'
      routerEvents$.next(new NavigationEnd(1, '/setup/step1', '/setup/step1'))
      expect(component.isSetupPage).toBe(true)
    })

    it('sets showNavigation false and createAcc true for /app/create-account (NavigationEnd)', () => {
      component.handleRouterSubscription()
      mocks.mockRouter.url = '/app/create-account'
      routerEvents$.next(new NavigationEnd(1, '/app/create-account', '/app/create-account'))
      expect(component.showNavigation).toBe(false)
      expect(component.createAcc).toBe(true)
    })

    it('sets showNavigation false for /public/login (NavigationEnd)', () => {
      component.handleRouterSubscription()
      mocks.mockRouter.url = '/public/login'
      routerEvents$.next(new NavigationEnd(1, '/public/login', '/public/login'))
      expect(component.showNavigation).toBe(false)
    })

    it('sets isHomePage true and isNavBarRequired true for /page/home (NavigationEnd)', () => {
      component['configSvc'].userProfile = { userId: 'u1' } as any
      component.handleRouterSubscription()
      mocks.mockRouter.url = '/page/home'
      routerEvents$.next(new NavigationEnd(1, '/page/home', '/page/home'))
      expect(component.isHomePage).toBe(true)
      expect(component.isNavBarRequired).toBe(true)
    })

    it('sets isHomePage false for other urls (NavigationEnd)', () => {
      component.handleRouterSubscription()
      mocks.mockRouter.url = '/app/search'
      routerEvents$.next(new NavigationEnd(1, '/app/search', '/app/search'))
      expect(component.isHomePage).toBe(false)
    })

    it('sets showNavigation and hideHeaderFooter for /public/home (NavigationEnd)', () => {
      component.handleRouterSubscription()
      mocks.mockRouter.url = '/public/home'
      routerEvents$.next(new NavigationEnd(1, '/public/home', '/public/home'))
      expect(component.showNavigation).toBe(true)
      expect(component.hideHeaderFooter).toBe(false)
    })

    it('sets isNavBarRequired false when userProfile is null (NavigationEnd)', () => {
      component['configSvc'].userProfile = null
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationEnd(1, '/page/home', '/page/home'))
      expect(component.isNavBarRequired).toBe(false)
    })

    it('invokes paramMap.keys forEach callback on NavigationEnd', () => {
      component['activatedRoute'] = {
        snapshot: {
          queryParamMap: { keys: ['ref', 'source'], get: jest.fn().mockImplementation((k: string) => k) },
          data: {},
        },
        firstChild: null,
      } as any
      component.handleRouterSubscription()
      mocks.mockRouter.url = '/other'
      routerEvents$.next(new NavigationEnd(1, '/other', '/other'))
      expect(component.paramsJSON).toContain('ref')
    })

    it('sends telemetry audit when appStartRaised is true (NavigationEnd)', () => {
      component.appStartRaised = true
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationEnd(1, '/other', '/other'))
      expect(mocks.mockTelemetrySvc.audit).toHaveBeenCalled()
      expect(component.appStartRaised).toBe(false)
    })

    it('sends publicImpression when userProfile is null (NavigationEnd)', () => {
      component['configSvc'].userProfile = null
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationEnd(1, '/public/home', '/public/home'))
      expect(mocks.mockTelemetrySvc.publicImpression).toHaveBeenCalled()
    })

    it('sets showmobileFooter false for /public/scrom-player (NavigationStart)', () => {
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationStart(1, '/public/scrom-player'))
      expect(component.showmobileFooter).toBe(false)
    })

    it('sets showmobileFooter false for /app/create-account (NavigationStart)', () => {
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationStart(1, '/app/create-account'))
      expect(component.showmobileFooter).toBe(false)
    })

    it('sets hideHeaderFooter true for /public/login (NavigationStart)', () => {
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationStart(1, '/public/login'))
      expect(component.hideHeaderFooter).toBe(true)
      expect(component.showmobileFooter).toBe(false)
    })

    it('sets hideHeaderFooter true for app/new-tnc (NavigationStart)', () => {
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationStart(1, '/app/new-tnc'))
      expect(component.hideHeaderFooter).toBe(true)
    })

    it('sets disableChatForBnrc true for /bnrc/register (NavigationStart)', () => {
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationStart(1, '/bnrc/register'))
      expect(component.disableChatForBnrc).toBe(true)
      expect(component.showmobileFooter).toBe(false)
    })

    it('sets disableChatForBnrc true for /uttarpradesh/register (NavigationStart)', () => {
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationStart(1, '/uttarpradesh/register'))
      expect(component.disableChatForBnrc).toBe(true)
    })

    it('sets disableChatForBnrc true for /madhyapradesh/register (NavigationStart)', () => {
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationStart(1, '/madhyapradesh/register'))
      expect(component.disableChatForBnrc).toBe(true)
    })

    it('sets isNavBarRequired false for preview url (NavigationStart)', () => {
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationStart(1, '/preview/abc'))
      expect(component.isNavBarRequired).toBe(false)
      expect(component.hideHeaderFooter).toBe(true)
    })

    it('sets isNavBarRequired false for embed url (NavigationStart)', () => {
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationStart(1, '/embed/abc'))
      expect(component.isNavBarRequired).toBe(false)
    })

    it('sets isNavBarRequired false for /public/register (NavigationStart)', () => {
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationStart(1, '/public/register'))
      expect(component.isNavBarRequired).toBe(false)
    })

    it('sets isNavBarRequired false for author/ when isInIframe (NavigationStart)', () => {
      component.isInIframe = true
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationStart(1, '/author/content'))
      expect(component.isNavBarRequired).toBe(false)
    })

    it('sets hideFooter true for /app/org-selective-course (NavigationStart)', () => {
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationStart(1, '/app/org-selective-course'))
      expect(component.hideFooter).toBe(true)
    })

    it('handles app/toc: sets mobileView false when userProfile present (NavigationStart)', () => {
      component['configSvc'].userProfile = { userId: 'u1' } as any
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationStart(1, '/app/toc/do_123/overview'))
      expect(component.mobileView).toBe(false)
      expect(component.isNavBarRequired).toBe(true)
    })

    it('handles login url: sets location.href when url_before_login stored (NavigationStart)', () => {
      localStorage.setItem('userUUID', 'uuid123')
      localStorage.setItem('url_before_login', '/app/home')
      const origLocation = (global as any).location
      delete (global as any).location
      ;(global as any).location = { href: '' }
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationStart(1, '/login'))
      expect((global as any).location.href).toBe('/app/home')
      ;(global as any).location = origLocation
    })

    it('handles page/home: sets mobileView true (NavigationStart)', () => {
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationStart(1, '/page/home'))
      expect(component.mobileView).toBe(true)
    })

    it('handles /app/login: enters login branch (url contains "login") — no redirect without userUUID (NavigationStart)', () => {
      // /app/login contains 'login' so it hits the `includes('login')` branch, not the /app/login group
      component.handleRouterSubscription()
      expect(() => routerEvents$.next(new NavigationStart(1, '/app/login'))).not.toThrow()
      // mobileView unchanged because this branch only redirects when localStorage has userUUID
      expect(component.routeChangeInProgress).toBe(true)
    })

    it('handles /app/mobile-otp (NavigationStart)', () => {
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationStart(1, '/app/mobile-otp'))
      expect(component.hideHeaderFooter).toBe(true)
    })

    it('handles /app/email-otp (NavigationStart)', () => {
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationStart(1, '/app/email-otp'))
      expect(component.hideHeaderFooter).toBe(true)
    })

    it('handles /public/forgot-password (NavigationStart)', () => {
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationStart(1, '/public/forgot-password'))
      expect(component.hideHeaderFooter).toBe(true)
    })

    it('handles public/tnc: sets isNavBarRequired false (NavigationStart)', () => {
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationStart(1, '/public/tnc'))
      expect(component.isNavBarRequired).toBe(false)
      expect(component.hideHeaderFooter).toBe(true)
    })

    it('handles /app/about-you: hides header and nav (NavigationStart)', () => {
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationStart(1, '/app/about-you'))
      expect(component.hideHeaderFooter).toBe(true)
      expect(component.mobileView).toBe(false)
      expect(component.showNavigation).toBe(false)
    })

    it('handles /app/new-tnc as about-you branch (NavigationStart)', () => {
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationStart(1, '/app/new-tnc'))
      expect(component.isNavBarRequired).toBe(true)
    })

    it('handles /app/search/learning: sets mobileView false (NavigationStart)', () => {
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationStart(1, '/app/search/learning'))
      expect(component.mobileView).toBe(false)
      expect(component.isNavBarRequired).toBe(true)
      expect(component.showNavbar).toBe(true)
    })

    it('handles /app/video-player (NavigationStart)', () => {
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationStart(1, '/app/video-player'))
      expect(component.mobileView).toBe(false)
    })

    it('handles app/profile-view (NavigationStart)', () => {
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationStart(1, '/app/profile-view'))
      expect(component.mobileView).toBe(false)
    })

    it('handles default else branch (NavigationStart)', () => {
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationStart(1, '/some/other/route'))
      expect(component.isNavBarRequired).toBe(true)
      expect(component.mobileView).toBe(false)
      expect(component.routeChangeInProgress).toBe(true)
    })

    it('sets routeChangeInProgress false on NavigationCancel', () => {
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationCancel(1, '/test', ''))
      expect(component.routeChangeInProgress).toBe(false)
    })

    it('sets routeChangeInProgress false on NavigationError', () => {
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationError(1, '/test', new Error('err')))
      expect(component.routeChangeInProgress).toBe(false)
    })

    it('sets isProfile true when router.url is profile-view (NavigationEnd path)', () => {
      mocks.mockRouter.url = 'profile-view'
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationEnd(1, '/other', '/other'))
      expect(component.isProfile).toBe(true)
    })

    it('sets isProfile true via NavigationStart when router.url is profile-view', () => {
      mocks.mockRouter.url = 'profile-view'
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationStart(1, '/something'))
      expect(component.isProfile).toBe(true)
    })

    it('covers line 524: redirects to public/home when on /page/home with no unMappedUser (NavigationEnd)', () => {
      const origLocation = (global as any).location
      delete (global as any).location
      ;(global as any).location = { href: '' }
      component['configSvc'].unMappedUser = null
      mocks.mockRouter.url = '/page/home'
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationEnd(1, '/page/home', '/page/home'))
      expect((global as any).location.href).toBe('public/home')
      ;(global as any).location = origLocation
    })

    it('covers line 617-618: redirects to /page/home when login url and unMappedUser set (NavigationStart)', () => {
      localStorage.setItem('userUUID', 'uuid123')
      component['configSvc'].unMappedUser = { userId: 'u1' } as any
      const origLocation = (global as any).location
      delete (global as any).location
      ;(global as any).location = { href: '' }
      ;(global as any).window = { location: (global as any).location }
      component.handleRouterSubscription()
      routerEvents$.next(new NavigationStart(1, '/login'))
      expect((global as any).location.href).toBe('/page/home')
      ;(global as any).location = origLocation
    })
  })

  describe('navigationInterceptor (via constructor router.events)', () => {
    it('does not call navigationInterceptor for competency url', () => {
      const spy = jest.spyOn(component as any, 'navigationInterceptor')
      routerEvents$.next(new NavigationEnd(1, '/app/user/competency', '/app/user/competency'))
      expect(spy).not.toHaveBeenCalled()
    })

    it('calls navigationInterceptor for non-competency NavigationEnd', () => {
      const spy = jest.spyOn(component as any, 'navigationInterceptor')
      routerEvents$.next(new NavigationEnd(1, '/page/home', '/page/home'))
      expect(spy).toHaveBeenCalled()
    })

    it('logs NavigationEnd in navigationInterceptor', () => {
      routerEvents$.next(new NavigationEnd(1, '/page/home', '/page/home'))
      expect(mocks.mockLogger.log).toHaveBeenCalled()
    })

    it('handles NavigationEnd with contentURL — calls fetchContentHistoryV2', () => {
      const { isPlatformBrowser } = require('@angular/common')
      isPlatformBrowser.mockReturnValue(true)
      localStorage.setItem('contentId', 'https://example.com/do_12345?collectionId=coll1&batchId=b1')
      mocks.mockContentSvc.fetchContentHistoryV2 = jest.fn().mockReturnValue(of({ result: { contentList: [] } }))
      component['contentSvc'] = mocks.mockContentSvc
      routerEvents$.next(new NavigationEnd(1, '/page/home', '/page/home'))
      expect(mocks.mockContentSvc.fetchContentHistoryV2).toHaveBeenCalled()
      isPlatformBrowser.mockReturnValue(false)
    })

    it('covers fetchContentHistoryV2 error callback', () => {
      const { isPlatformBrowser } = require('@angular/common')
      isPlatformBrowser.mockReturnValue(true)
      localStorage.setItem('contentId', 'https://example.com/do_12345?collectionId=c1&batchId=b1')
      mocks.mockContentSvc.fetchContentHistoryV2 = jest.fn().mockReturnValue(
        throwError(() => new Error('fetch failed'))
      )
      component['contentSvc'] = mocks.mockContentSvc
      expect(() => routerEvents$.next(new NavigationEnd(1, '/page/home', '/page/home'))).not.toThrow()
      expect(mocks.mockLogger.error).toHaveBeenCalledWith('Error fetching content history:', expect.any(Error))
      isPlatformBrowser.mockReturnValue(false)
    })

    it('covers else branch (no matching contentData) — logs warn', () => {
      const { isPlatformBrowser } = require('@angular/common')
      isPlatformBrowser.mockReturnValue(true)
      localStorage.setItem('contentId', 'https://example.com/do_99999?collectionId=c1&batchId=b1')
      mocks.mockContentSvc.fetchContentHistoryV2 = jest.fn().mockReturnValue(
        of({ result: { contentList: [] } })
      )
      component['contentSvc'] = mocks.mockContentSvc
      expect(() => routerEvents$.next(new NavigationEnd(1, '/page/home', '/page/home'))).not.toThrow()
      expect(mocks.mockLogger.warn).toHaveBeenCalledWith('No data found for ID:', expect.anything())
      isPlatformBrowser.mockReturnValue(false)
    })

    it('covers initUpdate success callback (localStorage.removeItem)', () => {
      const { isPlatformBrowser } = require('@angular/common')
      isPlatformBrowser.mockReturnValue(true)
      localStorage.setItem('contentId', 'https://example.com/do_12345?collectionId=coll1&batchId=b1')
      localStorage.setItem('do_12345', JSON.stringify({ progress: 0.5 }))
      component['configSvc'] = { userProfile: { userId: 'u1' }, unMappedUser: { id: 'u1' } } as any
      mocks.mockContentSvc.fetchContentHistoryV2 = jest.fn().mockReturnValue(of({
        result: {
          contentList: [{ contentId: 'do_12345', status: 2, progressdetails: { page: 1 }, completionPercentage: 60 }],
        },
      }))
      mocks.mockViewerSvc.initUpdate = jest.fn().mockReturnValue(of({}))
      component['contentSvc'] = mocks.mockContentSvc as any
      component['viewerSvc'] = mocks.mockViewerSvc as any
      routerEvents$.next(new NavigationEnd(1, '/app/toc/coll1/chapters', '/app/toc/coll1/chapters'))
      expect(mocks.mockViewerSvc.initUpdate).toHaveBeenCalled()
      isPlatformBrowser.mockReturnValue(false)
    })

    it('covers initUpdate error callback', () => {
      const { isPlatformBrowser } = require('@angular/common')
      isPlatformBrowser.mockReturnValue(true)
      localStorage.setItem('contentId', 'https://example.com/do_12345?collectionId=coll1&batchId=b1')
      localStorage.setItem('do_12345', JSON.stringify({ progress: 0.5 }))
      component['configSvc'] = { userProfile: { userId: 'u1' }, unMappedUser: { id: 'u1' } } as any
      mocks.mockContentSvc.fetchContentHistoryV2 = jest.fn().mockReturnValue(of({
        result: {
          contentList: [{ contentId: 'do_12345', status: 2, progressdetails: {}, completionPercentage: 60 }],
        },
      }))
      mocks.mockViewerSvc.initUpdate = jest.fn().mockReturnValue(throwError(() => new Error('update failed')))
      component['contentSvc'] = mocks.mockContentSvc as any
      component['viewerSvc'] = mocks.mockViewerSvc as any
      expect(() =>
        routerEvents$.next(new NavigationEnd(1, '/app/toc/coll1/chapters', '/app/toc/coll1/chapters'))
      ).not.toThrow()
      expect(mocks.mockLogger.error).toHaveBeenCalledWith('Error updating progress:', expect.any(Error))
      isPlatformBrowser.mockReturnValue(false)
    })

    it('covers NavigationStart branch inside navigationInterceptor (direct call)', () => {
      ;(component as any).navigationInterceptor(new NavigationStart(1, '/page/home'))
      expect(mocks.mockLogger.log).toHaveBeenCalledWith('Navigation started to URL:', '/page/home')
    })

    it('covers NavigationCancel branch inside navigationInterceptor (direct call)', () => {
      ;(component as any).navigationInterceptor(new NavigationCancel(1, '/page/home', ''))
      expect(mocks.mockLogger.log).toHaveBeenCalledWith('Navigation canceled to URL:', '/page/home')
    })

    it('covers NavigationError branch inside navigationInterceptor (direct call)', () => {
      ;(component as any).navigationInterceptor(new NavigationError(1, '/page/home', new Error('e')))
      expect(mocks.mockLogger.log).toHaveBeenCalledWith('Navigation error to URL:', '/page/home')
    })
  })

  describe('ngOnInit', () => {
    let localRouterEvents$: Subject<any>
    let localShowNavbar$: Subject<boolean>
    let localHideHeader$: Subject<boolean>
    let localDowntime$: Subject<any>
    let localMocks: ReturnType<typeof buildMocks>

    beforeEach(() => {
      localRouterEvents$ = new Subject()
      localShowNavbar$ = new Subject()
      localHideHeader$ = new Subject()
      localDowntime$ = new Subject()
      localMocks = buildMocks({
        routerEvents$: localRouterEvents$,
        showNavbarDisplay$: localShowNavbar$,
        hideHeaderFooter$: localHideHeader$,
        downtimeService: {
          initializeDowntimeConfig: jest.fn().mockReturnValue(localDowntime$),
          themeConfig: jest.fn().mockReturnValue({}),
        },
      })
    })

    it('calls handleRouterSubscription and setPageTitle', async () => {
      const routerSpy = jest.spyOn(localMocks.comp, 'handleRouterSubscription')
      const titleSpy = jest.spyOn(localMocks.comp, 'setPageTitle')
      await localMocks.comp.ngOnInit()
      expect(routerSpy).toHaveBeenCalled()
      expect(titleSpy).toHaveBeenCalled()
    })

    it('downtimeService next callback logs state', async () => {
      await localMocks.comp.ngOnInit()
      localDowntime$.next({ active: false })
      expect(localMocks.mockLogger.log).toHaveBeenCalledWith(
        '[RootComponent] Downtime config initialized:', expect.anything(),
      )
    })

    it('downtimeService error callback logs warning', async () => {
      await localMocks.comp.ngOnInit()
      localDowntime$.error(new Error('downtime fail'))
      expect(localMocks.mockLogger.warn).toHaveBeenCalledWith(
        '[RootComponent] Error initializing downtime config, continuing normally:', expect.any(Error),
      )
    })

    it('sets isLoggedIn true when userProfile is set', async () => {
      localMocks.comp['configSvc'].userProfile = { userId: 'u1' } as any
      localMocks.comp['configSvc'].unMappedUser = { userId: 'u1', id: 'u1' } as any
      await localMocks.comp.ngOnInit()
      expect(localMocks.comp.isLoggedIn).toBe(true)
    })

    it('sets isLoggedIn false when userProfile is null', async () => {
      localMocks.comp['configSvc'].userProfile = null
      await localMocks.comp.ngOnInit()
      expect(localMocks.comp.isLoggedIn).toBe(false)
    })

    it('calls loginServ.initialize when not initialized', async () => {
      localMocks.mockLoginServ.isInitialized = false
      await localMocks.comp.ngOnInit()
      expect(localMocks.mockLoginServ.initialize).toHaveBeenCalled()
    })

    it('calls exploreService.initialize when not initialized', async () => {
      localMocks.mockExploreService.isInitialized = false
      await localMocks.comp.ngOnInit()
      expect(localMocks.mockExploreService.initialize).toHaveBeenCalled()
    })

    it('calls btnBackSvc.initialize', async () => {
      await localMocks.comp.ngOnInit()
      expect(localMocks.mockBtnBackSvc.initialize).toHaveBeenCalled()
    })

    it('calls getTelemetryConfig and impression', async () => {
      await localMocks.comp.ngOnInit()
      expect(localMocks.mockTelemetrySvc.getTelemetryConfig).toHaveBeenCalled()
      expect(localMocks.mockTelemetrySvc.impression).toHaveBeenCalled()
    })

    it('showNavbarDisplay$ subscribe callback sets showNavbar (with fake timers for delay(500))', async () => {
      jest.useFakeTimers()
      await localMocks.comp.ngOnInit()
      localShowNavbar$.next(true)
      jest.advanceTimersByTime(600)
      expect(localMocks.comp.showNavbar).toBe(true)
      jest.useRealTimers()
    })

    it('hideHeaderFooter subscribe callback sets hideHeaderFooter', async () => {
      await localMocks.comp.ngOnInit()
      localHideHeader$.next(true)
      expect(localMocks.comp.hideHeaderFooter).toBe(true)
    })

    it('router.events subscribe sets isHomePage on NavigationEnd', async () => {
      await localMocks.comp.ngOnInit()
      localRouterEvents$.next(new NavigationEnd(1, '/page/home', '/page/home'))
      expect(localMocks.comp.isHomePage).toBe(true)
    })

    it('router.events subscribe sets isHomePage false for non-home url', async () => {
      await localMocks.comp.ngOnInit()
      localRouterEvents$.next(new NavigationEnd(1, '/app/search', '/app/search'))
      expect(localMocks.comp.isHomePage).toBe(false)
    })

    it('calls getUserdetailsFromRegistry and setCompetencyConfig when userProfile present', async () => {
      const setCompSpy = jest.spyOn(localMocks.comp, 'setCompetencyConfig')
      localMocks.comp['configSvc'].userProfile = { userId: 'u1' } as any
      localMocks.comp['configSvc'].unMappedUser = { userId: 'u1', id: 'u1' } as any
      localMocks.mockUserProfileSvc.getUserdetailsFromRegistry = jest.fn().mockReturnValue(
        of({ profileDetails: { profileReq: { userId: 'u1' } } })
      )
      localMocks.comp['userProfileSvc'] = localMocks.mockUserProfileSvc
      await localMocks.comp.ngOnInit()
      expect(localMocks.mockUserProfileSvc.getUserdetailsFromRegistry).toHaveBeenCalled()
      expect(setCompSpy).toHaveBeenCalled()
    })

    it('logs error on getUserdetailsFromRegistry failure', async () => {
      localMocks.comp['configSvc'].userProfile = { userId: 'u1' } as any
      localMocks.comp['configSvc'].unMappedUser = { userId: 'u1', id: 'u1' } as any
      localMocks.mockUserProfileSvc.getUserdetailsFromRegistry = jest.fn().mockReturnValue(
        throwError(() => new Error('fail'))
      )
      localMocks.comp['userProfileSvc'] = localMocks.mockUserProfileSvc
      await localMocks.comp.ngOnInit()
      expect(localMocks.mockLogger.error).toHaveBeenCalledWith('Error fetching user details:', expect.any(Error))
    })

    it('sets appStartRaised true when isAuthenticated', async () => {
      localMocks.comp['configSvc'].isAuthenticated = true
      await localMocks.comp.ngOnInit()
      expect(localMocks.comp.appStartRaised).toBe(true)
    })

    it('covers App.addListener backButton callback when isPlatformBrowser=true', async () => {
      const { isPlatformBrowser } = require('@angular/common')
      isPlatformBrowser.mockReturnValue(true)
      const { App } = require('@capacitor/app')
      let backButtonCb: any
      App.addListener = jest.fn((event: string, cb: any) => { if (event === 'backButton') backButtonCb = cb })
      const origHistory = window.history.go
      window.history.go = jest.fn()
      await localMocks.comp.ngOnInit()
      expect(backButtonCb).toBeDefined()
      backButtonCb()
      expect(window.history.go).toHaveBeenCalledWith(-1)
      window.history.go = origHistory
      isPlatformBrowser.mockReturnValue(false)
    })
  })

  describe('setUpFormData', () => {
    it('sets orgDetails, footerConfig, and showNavbar on success', async () => {
      const m = buildMocks({ routerEvents$, showNavbarDisplay$, hideHeaderFooter$ })
      m.mockPlaylistSvc.loadPlaylistData = jest.fn().mockResolvedValue({ ok: true })
      m.mockPlaylistSvc.orgDetails = jest.fn().mockReturnValue({ name: 'Org' })
      m.mockPlaylistSvc.headerConfig = jest.fn().mockReturnValue({ logo: 'logo.png' })
      m.mockPlaylistSvc.sections = jest.fn().mockReturnValue({ homeTab: [{ type: 'banner' }] })
      m.mockPlaylistSvc.selectedTabConfig = jest.fn().mockReturnValue([])
      m.mockPlaylistSvc.config = jest.fn().mockReturnValue([])
      m.mockPlaylistSvc.footerConfig = jest.fn().mockReturnValue({ links: [] })
      m.comp['playlistSvc'] = m.mockPlaylistSvc
      m.comp['themeSvc'] = m.mockThemeSvc as any
      m.comp['downtimeService'] = { themeConfig: jest.fn().mockReturnValue({ defaultTheme: {} }) } as any
      await m.comp.setUpFormData()
      expect(m.comp.showNavbar).toBe(true)
      expect(m.comp.orgDetails).toBeDefined()
    })

    it('sets hasProgramConfig and resets showDetails when program config exists', async () => {
      const m = buildMocks({ routerEvents$, showNavbarDisplay$, hideHeaderFooter$ })
      m.mockPlaylistSvc.programs = jest.fn().mockReturnValue({ program1: {} })
      m.comp['playlistSvc'] = m.mockPlaylistSvc
      m.comp['themeSvc'] = m.mockThemeSvc as any
      m.comp['downtimeService'] = { themeConfig: jest.fn().mockReturnValue({}) } as any
      await m.comp.setUpFormData()
      expect(m.comp.hasProgramConfig).toBe(true)
      expect(m.mockPlaylistSvc.showDetails.set).toHaveBeenCalledWith(false)
    })

    it('leaves hasProgramConfig false and does not reset showDetails when program config is empty', async () => {
      const m = buildMocks({ routerEvents$, showNavbarDisplay$, hideHeaderFooter$ })
      m.comp['playlistSvc'] = m.mockPlaylistSvc
      m.comp['themeSvc'] = m.mockThemeSvc as any
      m.comp['downtimeService'] = { themeConfig: jest.fn().mockReturnValue({}) } as any
      await m.comp.setUpFormData()
      expect(m.comp.hasProgramConfig).toBe(false)
      expect(m.mockPlaylistSvc.showDetails.set).not.toHaveBeenCalled()
    })

    it('calls themeSvc.setTheme when no stored preference and isDark is false', async () => {
      const m = buildMocks({ routerEvents$, showNavbarDisplay$, hideHeaderFooter$ })
      m.mockPlaylistSvc.loadPlaylistData = jest.fn().mockResolvedValue({})
      m.mockPlaylistSvc.orgDetails = jest.fn().mockReturnValue({ themeConfig: { isDark: false } })
      m.mockPlaylistSvc.headerConfig = jest.fn().mockReturnValue({})
      m.mockPlaylistSvc.sections = jest.fn().mockReturnValue({})
      m.mockPlaylistSvc.selectedTabConfig = jest.fn().mockReturnValue([])
      m.mockPlaylistSvc.config = jest.fn().mockReturnValue([])
      m.mockPlaylistSvc.footerConfig = jest.fn().mockReturnValue({})
      m.mockThemeSvc.hasStoredPreference = jest.fn().mockReturnValue(false)
      m.comp['playlistSvc'] = m.mockPlaylistSvc
      m.comp['themeSvc'] = m.mockThemeSvc as any
      m.comp['downtimeService'] = { themeConfig: jest.fn().mockReturnValue({}) } as any
      await m.comp.setUpFormData()
      expect(m.mockThemeSvc.setTheme).toHaveBeenCalledWith(false)
    })

    it('sets footerConfig to empty and logs error on exception', async () => {
      const m = buildMocks({ routerEvents$, showNavbarDisplay$, hideHeaderFooter$ })
      m.mockPlaylistSvc.loadPlaylistData = jest.fn().mockResolvedValue({})
      m.mockPlaylistSvc.orgDetails = jest.fn().mockImplementation(() => { throw new Error('fail') })
      m.comp['playlistSvc'] = m.mockPlaylistSvc
      await m.comp.setUpFormData()
      expect(m.comp.footerConfig).toEqual({})
      expect(m.mockLogger.error).toHaveBeenCalledWith('Error setting up form data:', expect.any(Error))
    })

    it('sets orgDetails and footerConfig to empty when loadPlaylistData returns null', async () => {
      const m = buildMocks({ routerEvents$, showNavbarDisplay$, hideHeaderFooter$ })
      m.mockPlaylistSvc.loadPlaylistData = jest.fn().mockResolvedValue(null)
      m.comp['playlistSvc'] = m.mockPlaylistSvc
      await m.comp.setUpFormData()
      expect(m.comp.orgDetails).toEqual({})
      expect(m.comp.footerConfig).toEqual({})
    })

    it('skips loadPlaylistData when orgDetails already set', async () => {
      const m = buildMocks({ routerEvents$, showNavbarDisplay$, hideHeaderFooter$ })
      m.comp.orgDetails = { already: 'set' }
      m.mockPlaylistSvc.orgDetails = jest.fn().mockReturnValue({ already: 'set' })
      m.mockPlaylistSvc.headerConfig = jest.fn().mockReturnValue({})
      m.mockPlaylistSvc.sections = jest.fn().mockReturnValue({})
      m.mockPlaylistSvc.selectedTabConfig = jest.fn().mockReturnValue([])
      m.mockPlaylistSvc.config = jest.fn().mockReturnValue([])
      m.mockPlaylistSvc.footerConfig = jest.fn().mockReturnValue({})
      m.comp['playlistSvc'] = m.mockPlaylistSvc
      m.comp['themeSvc'] = m.mockThemeSvc as any
      m.comp['downtimeService'] = { themeConfig: jest.fn().mockReturnValue({}) } as any
      await m.comp.setUpFormData()
      expect(m.mockPlaylistSvc.loadPlaylistData).not.toHaveBeenCalled()
    })
  })

  describe('ngOnInit Promise.race timeout catch callback', () => {
    it('covers catch callback when setUpFormData times out (fake timers)', async () => {
      jest.useFakeTimers()
      const m = buildMocks({
        routerEvents$: new Subject(),
        showNavbarDisplay$: new Subject(),
        hideHeaderFooter$: new Subject(),
        downtimeService: {
          initializeDowntimeConfig: jest.fn().mockReturnValue(of({})),
          themeConfig: jest.fn().mockReturnValue({}),
        },
      })
      // Make loadPlaylistData never resolve so setUpFormData hangs
      m.mockPlaylistSvc.loadPlaylistData = jest.fn().mockReturnValue(new Promise(() => {}))
      m.comp['playlistSvc'] = m.mockPlaylistSvc
      const initPromise = m.comp.ngOnInit()
      // Advance time past 5s timeout to trigger the race reject
      jest.advanceTimersByTime(6000)
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      jest.useRealTimers()
      await initPromise
      expect(m.mockLogger.warn).toHaveBeenCalledWith(
        'Form data load timeout/failed, using defaults:', expect.any(Error),
      )
    })
  })

  describe('ngOnInit getPlaylistConfig catch callback', () => {
    it('covers catch callback when getPlaylistConfig rejects', async () => {
      const m = buildMocks({
        routerEvents$: new Subject(),
        showNavbarDisplay$: new Subject(),
        hideHeaderFooter$: new Subject(),
        downtimeService: {
          initializeDowntimeConfig: jest.fn().mockReturnValue(of({})),
          themeConfig: jest.fn().mockReturnValue({}),
        },
        configSvc: { userProfile: { userId: 'u1' }, unMappedUser: { userId: 'u1', id: 'u1' }, isAuthenticated: false },
      })
      m.mockPlaylistSvc.getPlaylistConfig = jest.fn().mockRejectedValue(new Error('config load fail'))
      m.comp['playlistSvc'] = m.mockPlaylistSvc
      await m.comp.ngOnInit()
      // Allow microtasks to flush so the rejected promise catch fires
      await Promise.resolve()
      expect(m.mockLogger.warn).toHaveBeenCalledWith(
        'Failed to pre-warm playlist config cache:', expect.any(Error),
      )
    })
  })

  describe('updateuser$ subscribe callback', () => {
    it('invokes callback with truthy profile and clears cache', () => {
      let capturedCb: any
      const userProfileSvcWithCb = {
        updateuser$: {
          pipe: jest.fn().mockReturnThis(),
          subscribe: jest.fn((cb: any) => { capturedCb = cb; return { unsubscribe: jest.fn() } }),
        },
        clearUserDetailsCache: jest.fn(),
        getUserdetailsFromRegistry: jest.fn().mockReturnValue(of({})),
      }
      buildMocks({ routerEvents$, showNavbarDisplay$, hideHeaderFooter$, userProfileSvc: userProfileSvcWithCb })
      capturedCb({ request: { profileDetails: { profileReq: { personal: {} } } } })
      expect(userProfileSvcWithCb.clearUserDetailsCache).toHaveBeenCalled()
    })

    it('covers setUserData branch when profileReq present', () => {
      let capturedCb: any
      const mockUDC = { clearUserData: jest.fn(), setUserData: jest.fn(), getUserData: jest.fn() }
      const userProfileSvcWithCb = {
        updateuser$: {
          pipe: jest.fn().mockReturnThis(),
          subscribe: jest.fn((cb: any) => { capturedCb = cb; return { unsubscribe: jest.fn() } }),
        },
        clearUserDetailsCache: jest.fn(),
        getUserdetailsFromRegistry: jest.fn().mockReturnValue(of({})),
      }
      const m = buildMocks({
        routerEvents$, showNavbarDisplay$, hideHeaderFooter$,
        userProfileSvc: userProfileSvcWithCb,
        configSvc: { userProfile: { userId: 'u1' }, unMappedUser: { userId: 'u1' }, isAuthenticated: false },
      })
      m.comp['userDataCacheSvc'] = mockUDC as any
      capturedCb({ request: { profileDetails: { profileReq: { personal: {} } } } })
      expect(mockUDC.setUserData).toHaveBeenCalled()
    })

    it('handles null updatedProfile (falsy branch — no clearUserData call)', () => {
      let capturedCb: any
      const userProfileSvcWithCb = {
        updateuser$: {
          pipe: jest.fn().mockReturnThis(),
          subscribe: jest.fn((cb: any) => { capturedCb = cb; return { unsubscribe: jest.fn() } }),
        },
        clearUserDetailsCache: jest.fn(),
        getUserdetailsFromRegistry: jest.fn().mockReturnValue(of({})),
      }
      buildMocks({ routerEvents$, showNavbarDisplay$, hideHeaderFooter$, userProfileSvc: userProfileSvcWithCb })
      expect(() => capturedCb(null)).not.toThrow()
      expect(userProfileSvcWithCb.clearUserDetailsCache).not.toHaveBeenCalled()
    })
  })

  describe('property defaults', () => {
    it('featuredCourse defaults to []', () => { expect(component.featuredCourse).toEqual([]) })
    it('topCertifiedCourseIdentifier defaults to []', () => { expect(component.topCertifiedCourseIdentifier).toEqual([]) })
    it('appOnline defaults to true', () => { expect(component.appOnline).toBe(true) })
    it('isEkshamata defaults to false', () => { expect(component.isEkshamata).toBe(false) })
    it('isInIframe defaults to false', () => { expect(component.isInIframe).toBe(false) })
    it('showNavigation defaults to true', () => { expect(component.showNavigation).toBe(true) })
  })
})
