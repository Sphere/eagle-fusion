jest.mock('@angular/core', () => ({
  ...jest.requireActual('@angular/core'),
  effect: (fn: any) => { fn(); return {} },
}))

jest.mock('lodash', () => ({
  map: (arr: any, fn?: any) => typeof fn === 'string' ? arr?.map((item: any) => item[fn]) : arr?.map(fn),
  flatten: (arr: any[]) => ([] as any[]).concat(...(arr || [])),
  filter: (arr: any[], fn: any) => arr?.filter(fn),
  reduce: (arr: any[], fn: any, init: any) => arr?.reduce(fn, init),
  forEach: (arr: any[], fn: any) => arr?.forEach(fn),
  concat: (...args: any[]) => ([] as any[]).concat(...args),
}))

jest.mock('../../../../../library/ws-widget/utils/src/public-api', () => ({
  ConfigurationsService: class {
    userProfile = { userId: 'user-1' }
    unMappedUser = null
    hostedInfo = null
  },
  ValueService: class { isMobile = jest.fn().mockReturnValue(false) },
  LogoutComponent: class {},
  TelemetryService: class {
    getTelemetryConfig = jest.fn()
    interact = jest.fn()
  },
  LoggerService: class { log = jest.fn(); warn = jest.fn(); error = jest.fn() },
}))

jest.mock('../../../../../library/ws-widget/collection/src/public-api', () => ({
  WidgetContentService: class {
    workMessage = { subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }) }
    fetchGeneralAndRcCertificates = jest.fn()
    getCertificateAPI = jest.fn()
    updateValue$ = { subscribe: jest.fn() }
  },
}))

jest.mock('../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service', () => ({
  UserProfileService: class {
    getUserdetailsFromRegistry = jest.fn()
    updateuser$ = { pipe: jest.fn().mockReturnThis(), subscribe: jest.fn() }
  },
}))

jest.mock('../../../../../project/ws/app/src/lib/routes/user-profile/models/user-profile.model', () => ({}))

jest.mock('../profile-select/profile-select.component', () => ({
  ProfileSelectComponent: class {},
}))

jest.mock('../../competency/services/config.service', () => ({
  ConfigService: class { getCompetencyConfig = jest.fn() },
}))

jest.mock('../../../../../src/app/services/language.service', () => ({
  LanguageService: class { getCurrentLanguage = jest.fn().mockReturnValue('en') },
}))

jest.mock('../../../services/playlist.service', () => ({
  PlaylistService: class {
    getSelectedTab = jest.fn().mockReturnValue('')
    setSelectedTab = jest.fn()
    bodyConfig = jest.fn().mockReturnValue('')
    selectedTabConfig = jest.fn()
    loadPlaylistData = jest.fn().mockResolvedValue({ LAYOUT_BODY: { sections: { accountTab: {} } } })
    earnedBadges$ = { subscribe: jest.fn() }
    orgDetails = jest.fn().mockReturnValue(null)
  },
}))

jest.mock('../leadership-dashboard/leadership-dashboard.component', () => ({
  LeadershipDashboardComponent: class {},
}))

jest.mock('../../../services/theme.service', () => ({
  ThemeService: class {
    isDarkMode = false
    isDark = jest.fn().mockReturnValue(false)
  },
}))

jest.mock('@ngx-translate/core', () => ({
  TranslateService: class { instant = jest.fn().mockImplementation((k: string) => k) },
}))

import { of } from 'rxjs'
import { MobileProfileDashboardComponent } from './mobile-profile-dashboard.component'

describe('MobileProfileDashboardComponent', () => {
  let component: MobileProfileDashboardComponent
  let mockConfigSvc: any
  let mockRouter: any
  let mockDialog: any
  let mockUserProfileSvc: any
  let mockContentSvc: any
  let mockDomSanitizer: any
  let mockValueSvc: any
  let mockCompetencyConfigSvc: any
  let mockLanguageService: any
  let mockDocument: any
  let mockTelemetrySvc: any
  let mockPlylsSvc: any
  let mockSnackBar: any
  let mockCdr: any
  let mockLogger: any
  let mockTranslate: any
  let mockThemeService: any

  beforeEach(() => {
    mockConfigSvc = {
      userProfile: { userId: 'user-1' },
      unMappedUser: null,
      hostedInfo: null,
    }
    mockRouter = { navigate: jest.fn(), navigateByUrl: jest.fn() }
    mockDialog = { open: jest.fn() }
    mockUserProfileSvc = {
      getUserdetailsFromRegistry: jest.fn().mockReturnValue(of({})),
      updateuser$: { pipe: jest.fn().mockReturnThis(), subscribe: jest.fn() },
    }
    mockContentSvc = {
      workMessage: { subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }) },
      fetchGeneralAndRcCertificates: jest.fn().mockReturnValue(of({ generalCertificates: [], sunbirdRcCertificates: [] })),
      getCertificateAPI: jest.fn().mockReturnValue(of({})),
      updateValue$: { subscribe: jest.fn() },
    }
    mockDomSanitizer = { bypassSecurityTrustUrl: jest.fn().mockReturnValue('safe-url') }
    mockValueSvc = { isMobile: jest.fn().mockReturnValue(false) }
    mockCompetencyConfigSvc = { getCompetencyConfig: jest.fn() }
    mockLanguageService = { getCurrentLanguage: jest.fn().mockReturnValue('en') }
    mockDocument = {
      getElementById: jest.fn().mockReturnValue(null),
    }
    mockTelemetrySvc = { getTelemetryConfig: jest.fn(), interact: jest.fn() }
    mockPlylsSvc = {
      getSelectedTab: jest.fn().mockReturnValue(''),
      setSelectedTab: jest.fn(),
      bodyConfig: jest.fn().mockReturnValue(''),
      selectedTabConfig: jest.fn(),
      loadPlaylistData: jest.fn().mockResolvedValue({ LAYOUT_BODY: { sections: { accountTab: null } } }),
      earnedBadges$: { subscribe: jest.fn() },
      orgDetails: jest.fn().mockReturnValue(null),
    }
    mockSnackBar = { open: jest.fn() }
    mockCdr = { detectChanges: jest.fn() }
    mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    mockTranslate = { instant: jest.fn().mockImplementation((k: string) => k) }
    mockThemeService = { isDarkMode: false, isDark: jest.fn().mockReturnValue(false) }

    sessionStorage.clear()

    component = new MobileProfileDashboardComponent(
      mockConfigSvc,
      mockRouter,
      mockDialog,
      mockUserProfileSvc,
      mockContentSvc,
      mockDomSanitizer,
      mockValueSvc,
      mockCompetencyConfigSvc,
      mockLanguageService,
      mockDocument,
      mockTelemetrySvc,
      mockPlylsSvc,
      mockSnackBar,
      mockCdr,
      mockLogger,
      mockTranslate,
      mockThemeService,
    )
  })

  afterEach(() => {
    sessionStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set menuItems to empty array when config has no order list', () => {
    expect(component.menuItems).toEqual([])
  })

  it('should default showMobileView to false when isMobile is false', () => {
    expect(component.showMobileView).toBe(false)
  })

  it('should default showLogOutBtn to true when isMobile is false', () => {
    expect(component.showLogOutBtn).toBe(true)
  })

  it('should set showMobileView true when isMobile is true', () => {
    mockValueSvc.isMobile.mockReturnValue(true)
    component = new MobileProfileDashboardComponent(
      mockConfigSvc, mockRouter, mockDialog, mockUserProfileSvc, mockContentSvc,
      mockDomSanitizer, mockValueSvc, mockCompetencyConfigSvc, mockLanguageService,
      mockDocument, mockTelemetrySvc, mockPlylsSvc, mockSnackBar, mockCdr,
      mockLogger, mockTranslate, mockThemeService,
    )
    expect(component.showMobileView).toBe(true)
  })

  describe('hasRequiredLeaderboardDetails', () => {
    it('should return falsy when userProfile is null', () => {
      mockConfigSvc.userProfile = null
      expect(component.hasRequiredLeaderboardDetails()).toBeFalsy()
    })

    it('should return falsy when unMappedUser has no professionalDetails', () => {
      mockConfigSvc.unMappedUser = { rootOrgId: 'org-1', profileDetails: { profileReq: {} } }
      expect(component.hasRequiredLeaderboardDetails()).toBeFalsy()
    })

    it('should return false when isEkshamata is false', () => {
      mockConfigSvc.unMappedUser = {
        rootOrgId: 'org-1',
        profileDetails: {
          profileReq: {
            professionalDetails: [{ designation: 'Nurse', instituteName: 'AIIMS' }],
          },
        },
      }
      component.isEkshamata = false
      expect(component.hasRequiredLeaderboardDetails()).toBe(false)
    })
  })

  describe('showSocialChats', () => {
    it('should set isCommonChatEnabled to false', () => {
      component.isCommonChatEnabled = true
      const event = { preventDefault: jest.fn(), stopPropagation: jest.fn() } as any
      component.showSocialChats(event)
      expect(component.isCommonChatEnabled).toBe(false)
    })
  })

  describe('backToChatIcon', () => {
    it('should set isCommonChatEnabled to true', () => {
      component.isCommonChatEnabled = false
      component.backToChatIcon()
      expect(component.isCommonChatEnabled).toBe(true)
    })
  })

  describe('changeFunction', () => {
    it('should return early if item has no name', () => {
      expect(() => component.changeFunction({})).not.toThrow()
      expect(() => component.changeFunction(null)).not.toThrow()
    })

    it('should set selectedIndexData and selectedIndextitle from item', () => {
      component.changeFunction({ name: 'personal', data: 'someData', text: 'Personal' })
      expect(component.selectedIndexData).toBe('someData')
      expect(component.selectedIndextitle).toBe('Personal')
    })
  })
})
