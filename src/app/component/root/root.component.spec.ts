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
  BtnPageBackService: class { handler = { next: jest.fn() } },
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
    instanceConfig = null
    hasAcceptedTnc = false
    profileDetailsStatus = false
    orgSelectiveCourseConfig = null
  },
  ValueService: class {
    isMobile = jest.fn().mockReturnValue(false)
    updateWidth = jest.fn()
  },
  TelemetryService: class {
    start = jest.fn()
    end = jest.fn()
    interact = jest.fn()
    registrationInteract = jest.fn()
  },
  LoggerService: class { log = jest.fn(); warn = jest.fn(); error = jest.fn() },
  WsEvents: {},
}))

jest.mock('@ws-widget/resolver', () => ({
  LoginResolverService: class { login = jest.fn() },
}))

jest.mock('../../../../library/ws-widget/resolver/src/public-api', () => ({
  LoginResolverService: class { login = jest.fn() },
}))

jest.mock('../../../../library/ws-widget/resolver/src/lib/explore-resolver.service', () => ({
  ExploreResolverService: class { resolve = jest.fn() },
}))

jest.mock('../../../../project/ws/app/src/lib/routes/org/org-service.service', () => ({
  OrgServiceService: class { getOrgDetails = jest.fn() },
}))

jest.mock('project/ws/app/src/lib/routes/user-profile/services/user-profile.service', () => ({
  UserProfileService: class {
    updateuser$ = { pipe: jest.fn().mockReturnThis(), subscribe: jest.fn() }
    clearUserDetailsCache = jest.fn()
  },
}))

jest.mock('../../services/mobile-apps.service', () => ({
  MobileAppsService: class { init = jest.fn() },
}))

jest.mock('../../services/user-data-cache.service', () => ({
  UserDataCacheService: class {
    clearUserData = jest.fn()
    setUserData = jest.fn()
    getUserData = jest.fn()
  },
}))

jest.mock('../../routes/competency/services/config.service', () => ({
  ConfigService: class { getCompetencyConfig = jest.fn(); setConfig = jest.fn() },
}))

jest.mock('src/app/services/user-agent.service', () => ({
  UserAgentResolverService: class {
    getUserAgent = jest.fn().mockReturnValue({})
    generateCookie = jest.fn()
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
  BtnPageBackService: class { handler = { next: jest.fn() } },
}))

jest.mock('project/ws/viewer/src/lib/viewer-util.service', () => ({
  ViewerUtilService: class { initUpdate = jest.fn() },
}))

jest.mock('@ngx-translate/core', () => ({
  TranslateService: class { instant = jest.fn() },
}))

jest.mock('../../services/playlist.service', () => ({
  PlaylistService: class {
    bodyConfig = jest.fn().mockReturnValue([])
    loadPlaylistData = jest.fn().mockResolvedValue({})
    earnedBadges$ = { subscribe: jest.fn() }
  },
}))

jest.mock('../../services/downtime-config.service', () => ({
  DowntimeConfigService: class { getDowntimeConfig = jest.fn() },
}))

jest.mock('../../services/theme.service', () => ({
  ThemeService: class {
    isDark = jest.fn().mockReturnValue(false)
    setTheme = jest.fn()
  },
}))

jest.mock('../../services/seo.service', () => ({
  SeoService: class { update = jest.fn() },
}))

jest.mock('./root.service', () => ({
  RootService: class { getConfig = jest.fn() },
}))

import { of, Subject } from 'rxjs'
import { RootComponent } from './root.component'

describe('RootComponent', () => {
  let component: RootComponent
  let mockRouter: any
  let mockAuthSvc: any
  let mockConfigSvc: any
  let mockValueSvc: any
  let mockTelemetrySvc: any
  let mockMobileAppsSvc: any
  let mockRootSvc: any
  let mockBtnBackSvc: any
  let mockChangeDetector: any
  let mockLoginServ: any
  let mockExploreService: any
  let mockOrgService: any
  let mockActivatedRoute: any
  let mockUserProfileSvc: any
  let mockUserDataCacheSvc: any
  let mockContentSvc: any
  let mockCompetencyConfigSvc: any
  let mockUserAgentSvc: any
  let mockUserSvc: any
  let mockViewerSvc: any
  let mockInjector: any
  let mockPlaylistSvc: any
  let mockLogger: any
  let mockDowntimeService: any
  let mockThemeSvc: any
  let mockSeoSvc: any
  let routerEvents$: Subject<any>

  beforeEach(() => {
    routerEvents$ = new Subject()
    mockRouter = { events: routerEvents$, navigate: jest.fn(), navigateByUrl: jest.fn(), url: '/page/home' }
    mockAuthSvc = { isLoggedIn: jest.fn().mockReturnValue(false) }
    mockConfigSvc = {
      userProfile: null,
      unMappedUser: null,
      instanceConfig: null,
      hasAcceptedTnc: false,
      profileDetailsStatus: false,
      orgSelectiveCourseConfig: null,
    }
    mockValueSvc = { isMobile: jest.fn().mockReturnValue(false), updateWidth: jest.fn() }
    mockTelemetrySvc = { start: jest.fn(), end: jest.fn(), interact: jest.fn(), registrationInteract: jest.fn() }
    mockMobileAppsSvc = { init: jest.fn() }
    mockRootSvc = { getConfig: jest.fn() }
    mockBtnBackSvc = { handler: { next: jest.fn() } }
    mockChangeDetector = { detectChanges: jest.fn() }
    mockLoginServ = { login: jest.fn() }
    mockExploreService = { resolve: jest.fn() }
    mockOrgService = { getOrgDetails: jest.fn() }
    mockActivatedRoute = { snapshot: { queryParamMap: { get: jest.fn() } } }
    mockUserProfileSvc = {
      updateuser$: { pipe: jest.fn().mockReturnThis(), subscribe: jest.fn() },
      clearUserDetailsCache: jest.fn(),
    }
    mockUserDataCacheSvc = { clearUserData: jest.fn(), setUserData: jest.fn(), getUserData: jest.fn() }
    mockContentSvc = {
      fetchContentHistoryV2: jest.fn().mockReturnValue(of({})),
      workMessage: { subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }) },
    }
    mockCompetencyConfigSvc = { getCompetencyConfig: jest.fn(), setConfig: jest.fn() }
    mockUserAgentSvc = { getUserAgent: jest.fn().mockReturnValue({}), generateCookie: jest.fn() }
    mockUserSvc = { fetchUserBatchList: jest.fn().mockReturnValue(of([])) }
    mockViewerSvc = { initUpdate: jest.fn().mockReturnValue(of({})) }
    mockInjector = { get: jest.fn().mockReturnValue(null) }
    mockPlaylistSvc = {
      bodyConfig: jest.fn().mockReturnValue([]),
      loadPlaylistData: jest.fn().mockResolvedValue({}),
      earnedBadges$: { subscribe: jest.fn() },
    }
    mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    mockDowntimeService = { getDowntimeConfig: jest.fn() }
    mockThemeSvc = { isDark: jest.fn().mockReturnValue(false), setTheme: jest.fn() }
    mockSeoSvc = { update: jest.fn() }

    component = new RootComponent(
      mockRouter,
      mockAuthSvc,
      mockConfigSvc,
      mockValueSvc,
      mockTelemetrySvc,
      mockMobileAppsSvc,
      mockRootSvc,
      mockBtnBackSvc,
      mockChangeDetector,
      mockLoginServ,
      mockExploreService,
      mockOrgService,
      mockActivatedRoute,
      mockUserProfileSvc,
      mockUserDataCacheSvc,
      mockContentSvc,
      mockCompetencyConfigSvc,
      mockUserAgentSvc,
      mockUserSvc,
      mockViewerSvc,
      mockInjector,
      mockPlaylistSvc,
      mockLogger,
      mockDowntimeService,
      mockThemeSvc,
      mockSeoSvc,
      'server' as any,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default routeChangeInProgress to false', () => {
    expect(component.routeChangeInProgress).toBe(false)
  })

  it('should default showNavbar to false', () => {
    expect(component.showNavbar).toBe(false)
  })

  it('should default isLoggedIn to false', () => {
    expect(component.isLoggedIn).toBe(false)
  })

  it('should call mobileAppsSvc.init in constructor', () => {
    expect(mockMobileAppsSvc.init).toHaveBeenCalled()
  })

  describe('mergeProgressDetails', () => {
    it('should merge two objects, with obj2 values overriding obj1', () => {
      const obj1 = { a: 1, b: 2 }
      const obj2 = { b: 99, c: 3 }
      const result = component.mergeProgressDetails(obj1, obj2)
      expect(result).toEqual({ a: 1, b: 99, c: 3 })
    })

    it('should add keys from obj2 not in obj1', () => {
      const obj1 = { x: 10 }
      const obj2 = { y: 20, z: 30 }
      const result = component.mergeProgressDetails(obj1, obj2)
      expect(result.y).toBe(20)
      expect(result.z).toBe(30)
    })

    it('should not mutate obj1', () => {
      const obj1 = { a: 1 }
      const obj2 = { b: 2 }
      component.mergeProgressDetails(obj1, obj2)
      expect(obj1).toEqual({ a: 1 })
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe routerEventsSubscription', () => {
      const spy = jest.spyOn(component['routerEventsSubscription'], 'unsubscribe')
      component.ngOnDestroy()
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('openFreshChat', () => {
    it('calls fcWidget.open and fcWidget.show', () => {
      component.openFreshChat()
      expect(window.fcWidget.open).toHaveBeenCalled()
      expect(window.fcWidget.show).toHaveBeenCalled()
    })
  })

  describe('backToChatIcon', () => {
    it('sets isCommonChatEnabled to true', () => {
      component.isCommonChatEnabled = false
      component.backToChatIcon()
      expect(component.isCommonChatEnabled).toBe(true)
    })

    it('calls fcWidget.setConfig and fcWidget.init', () => {
      component.backToChatIcon()
      expect(window.fcWidget.setConfig).toHaveBeenCalledWith({ headerProperty: { hideChatButton: true } })
      expect(window.fcWidget.init).toHaveBeenCalled()
    })

    it('does not throw when fcWidget is unavailable', () => {
      const original = (window as any).fcWidget
      ;(window as any).fcWidget = undefined
      expect(() => component.backToChatIcon()).not.toThrow()
      ;(window as any).fcWidget = original
    })
  })

  describe('handleKeyDown', () => {
    it('calls backToChatIcon on Enter key', () => {
      const spy = jest.spyOn(component, 'backToChatIcon')
      component.handleKeyDown({ key: 'Enter' } as KeyboardEvent)
      expect(spy).toHaveBeenCalled()
    })

    it('calls backToChatIcon on Space key', () => {
      const spy = jest.spyOn(component, 'backToChatIcon')
      component.handleKeyDown({ key: ' ' } as KeyboardEvent)
      expect(spy).toHaveBeenCalled()
    })

    it('does not call backToChatIcon on other keys', () => {
      const spy = jest.spyOn(component, 'backToChatIcon')
      component.handleKeyDown({ key: 'Tab' } as KeyboardEvent)
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('setCompetencyConfig', () => {
    it('calls CompetencyConfiService.setConfig when profileDetails is present', () => {
      const data = {
        profileDetails: {
          profileReq: { userId: 'u1' },
        },
      }
      component.setCompetencyConfig(data)
      expect(mockCompetencyConfigSvc.setConfig).toHaveBeenCalledWith(
        data.profileDetails.profileReq,
        data.profileDetails,
      )
    })

    it('does not throw when profileDetails is absent', () => {
      expect(() => component.setCompetencyConfig({})).not.toThrow()
    })
  })

  describe('onResize', () => {
    it('calls valueSvc.updateWidth with window.innerWidth', () => {
      mockRouter.url = '/other'
      component.onResize()
      expect(mockValueSvc.updateWidth).toHaveBeenCalledWith(window.innerWidth)
    })

    it('navigates to search/home when on search route and width <= 767', () => {
      mockRouter.url = '/app/search'
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 600 })
      component.onResize()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/search/home'])
    })

    it('navigates to search/learning when on search route and width > 767', () => {
      mockRouter.url = '/app/search'
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 1200 })
      component.onResize()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/search/learning'])
    })
  })

  describe('property defaults', () => {
    it('featuredCourse defaults to empty array', () => {
      expect(component.featuredCourse).toEqual([])
    })

    it('topCertifiedCourseIdentifier defaults to empty array', () => {
      expect(component.topCertifiedCourseIdentifier).toEqual([])
    })

    it('appOnline defaults to true', () => {
      expect(component.appOnline).toBe(true)
    })

    it('isEkshamata defaults to false', () => {
      expect(component.isEkshamata).toBe(false)
    })

    it('isInIframe defaults to false', () => {
      expect(component.isInIframe).toBe(false)
    })

    it('showNavigation defaults to true', () => {
      expect(component.showNavigation).toBe(true)
    })
  })
})
