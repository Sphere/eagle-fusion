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
  get: (obj: any, path: string, defaultVal?: any) => {
    const keys = path.split('.')
    let result = obj
    for (const key of keys) {
      if (result == null) return defaultVal
      result = result[key]
    }
    return result !== undefined ? result : defaultVal
  },
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

    it('should handle organization case and clear work from sessionStorage', () => {
      expect(() => component.changeFunction({ name: 'organization', data: null, text: 'Org' })).not.toThrow()
      expect(component.showView).toBe('')
    })

    it('should handle academic case', () => {
      expect(() => component.changeFunction({ name: 'academic', data: null, text: 'Academic' })).not.toThrow()
    })

    it('should handle certificates case', () => {
      mockContentSvc.fetchGeneralAndRcCertificates = jest.fn().mockReturnValue({
        pipe: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
      })
      expect(() => component.changeFunction({ name: 'certificates', data: null, text: 'Certs' })).not.toThrow()
    })

    it('should set hideData true when showMobileView is true', () => {
      component.showMobileView = true
      component.changeFunction({ name: 'personal', data: null, text: 'Personal' })
      expect(component.hideData).toBe(true)
    })
  })

  describe('rcCertiface', () => {
    it('should return empty array when no sunbirdRcCertificates', () => {
      const result = component.rcCertiface({ generalCertificates: [], sunbirdRcCertificates: [] })
      expect(result).toEqual([])
    })

    it('should map sunbirdRcCertificates to formatted objects', () => {
      const data = {
        generalCertificates: [],
        sunbirdRcCertificates: [{ certificateName: 'Cert1', certificateDownloadUrl: 'url1', thumbnail: 'img1' }],
      }
      const result = component.rcCertiface(data)
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ name: 'Cert1', downloadUrl: 'url1', image: 'img1', rcCerticate: true })
    })
  })

  describe('assignProfession', () => {
    it('should set currentProfession', () => {
      component.assignProfession('Doctor')
      expect(component.currentProfession).toBe('Doctor')
    })
  })

  describe('assignUserName', () => {
    it('should update firstname when data.firstname is present', () => {
      component.userProfileData = { personalDetails: { firstname: 'Old', surname: 'OldSur' } } as any
      component.assignUserName({ firstname: 'New', surname: 'NewSur' })
      expect(component.userProfileData.personalDetails.firstname).toBe('New')
      expect(component.userProfileData.personalDetails.surname).toBe('NewSur')
    })

    it('should not update when data is empty', () => {
      component.userProfileData = { personalDetails: { firstname: 'Old', surname: 'OldSur' } } as any
      component.assignUserName({})
      expect(component.userProfileData.personalDetails.firstname).toBe('Old')
    })
  })

  describe('openCompetency', () => {
    it('should navigate to self-assessment', () => {
      component.openCompetency({})
      expect(mockRouter.navigate).toHaveBeenCalledWith(['app/user/self-assessment'])
    })
  })

  describe('openCompetencyDashboard', () => {
    it('should navigate to competency', () => {
      component.openCompetencyDashboard({})
      expect(mockRouter.navigate).toHaveBeenCalledWith(['app/user/competency'])
    })
  })

  describe('openLeaderboard', () => {
    it('should open LeadershipDashboardComponent dialog', async () => {
      await component.openLeaderboard()
      expect(mockDialog.open).toHaveBeenCalled()
    })
  })

  describe('openProfileDialog', () => {
    it('should open ProfileSelectComponent dialog', () => {
      const mockRef = { afterClosed: jest.fn().mockReturnValue({ subscribe: jest.fn((cb: any) => cb(null)) }) }
      mockDialog.open = jest.fn().mockReturnValue(mockRef)
      mockConfigSvc.unMappedUser = { id: 'user-1' }
      mockUserProfileSvc.getUserdetailsFromRegistry = jest.fn().mockReturnValue({ subscribe: jest.fn() })
      component['userProfileSvc'] = mockUserProfileSvc
      component.openProfileDialog()
      expect(mockDialog.open).toHaveBeenCalled()
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe from gotData', () => {
      const unsubscribeSpy = jest.fn()
      component.gotData = { unsubscribe: unsubscribeSpy }
      component.ngOnDestroy()
      expect(unsubscribeSpy).toHaveBeenCalled()
    })

    it('should not throw when gotData is null', () => {
      component.gotData = null
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('getUserDetails', () => {
    it('should call getUserdetailsFromRegistry when userProfile is set', () => {
      mockConfigSvc.unMappedUser = { id: 'user-1' }
      const mockData = {
        profileDetails: {
          profileReq: {
            personalDetails: { firstname: 'John', surname: 'Doe', photo: null },
            professionalDetails: [],
            academics: [],
          },
          preferences: { language: 'en' },
        },
      }
      mockUserProfileSvc.getUserdetailsFromRegistry = jest.fn().mockReturnValue({
        subscribe: jest.fn((cb: any) => cb(mockData)),
      })
      component['userProfileSvc'] = mockUserProfileSvc
      component['configSvc'] = mockConfigSvc
      jest.spyOn(component, 'setAcademicDetail').mockImplementation(() => {})
      component.getUserDetails()
      expect(mockUserProfileSvc.getUserdetailsFromRegistry).toHaveBeenCalledWith('user-1')
    })

    it('should skip API call when userProfile is null', () => {
      mockConfigSvc.userProfile = null
      component.getUserDetails()
      expect(mockUserProfileSvc.getUserdetailsFromRegistry).not.toHaveBeenCalled()
    })
  })

  describe('onToggleChange', () => {
    it('should call themeService.setTheme with event.checked', () => {
      const mockThemeSvc = { setTheme: jest.fn() }
      component['themeService'] = mockThemeSvc as any
      component.onToggleChange({ checked: true } as any)
      expect(mockThemeSvc.setTheme).toHaveBeenCalledWith(true)
    })
  })

  describe('ngOnInit', () => {
    it('should call setupMenuItems and getUserDetails on init', () => {
      mockConfigSvc.unMappedUser = { id: 'user-1' }
      mockUserProfileSvc.getUserdetailsFromRegistry = jest.fn().mockReturnValue({ subscribe: jest.fn() })
      mockUserProfileSvc.updateuser$ = { pipe: jest.fn().mockReturnThis(), subscribe: jest.fn() }
      component['userProfileSvc'] = mockUserProfileSvc
      const spy = jest.spyOn(component, 'getUserDetails')
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })

    it('should set isEkshamata true when hostedInfo is set', () => {
      mockConfigSvc.hostedInfo = { someInfo: true }
      mockUserProfileSvc.updateuser$ = { pipe: jest.fn().mockReturnThis(), subscribe: jest.fn() }
      jest.spyOn(component, 'getUserDetails').mockImplementation(() => {})
      component.ngOnInit()
      expect(component.isEkshamata).toBe(true)
    })

    it('should remove currentWindow from sessionStorage on init', () => {
      sessionStorage.setItem('currentWindow', 'personal')
      mockUserProfileSvc.updateuser$ = { pipe: jest.fn().mockReturnThis(), subscribe: jest.fn() }
      jest.spyOn(component, 'getUserDetails').mockImplementation(() => {})
      component.ngOnInit()
      expect(sessionStorage.getItem('currentWindow')).toBeNull()
    })

    it('should call getUserDetails when updateuser$ emits truthy value', () => {
      let subscribeCb: any
      mockUserProfileSvc.updateuser$ = { pipe: jest.fn().mockReturnThis(), subscribe: jest.fn((cb: any) => { subscribeCb = cb }) }
      const spy = jest.spyOn(component, 'getUserDetails').mockImplementation(() => {})
      component.ngOnInit()
      subscribeCb({ updated: true })
      expect(spy).toHaveBeenCalledTimes(2) // once from ngOnInit + once from callback
    })

    it('should call getLeaderBoardList when hasRequiredLeaderboardDetails returns true', () => {
      mockUserProfileSvc.updateuser$ = { pipe: jest.fn().mockReturnThis(), subscribe: jest.fn() }
      jest.spyOn(component, 'getUserDetails').mockImplementation(() => {})
      jest.spyOn(component, 'hasRequiredLeaderboardDetails').mockReturnValue(true)
      const spy = jest.spyOn(component, 'getLeaderBoardList').mockImplementation(() => {})
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('workMessage subscriber cases', () => {
    it('should set showView="" when data.type="work" and back=true', () => {
      let workCb: any
      mockContentSvc.workMessage.subscribe = jest.fn((cb: any) => {
        workCb = cb
        return { unsubscribe: jest.fn() }
      })
      component = new MobileProfileDashboardComponent(
        mockConfigSvc, mockRouter, mockDialog, mockUserProfileSvc, mockContentSvc,
        mockDomSanitizer, mockValueSvc, mockCompetencyConfigSvc, mockLanguageService,
        mockDocument, mockTelemetrySvc, mockPlylsSvc, mockSnackBar, mockCdr,
        mockLogger, mockTranslate, mockThemeService,
      )
      workCb({ type: 'work', back: true })
      expect(component.showView).toBe('')
    })

    it('should set selectedIndex="" when data.type="onListPage"', () => {
      let workCb: any
      mockContentSvc.workMessage.subscribe = jest.fn((cb: any) => {
        workCb = cb
        return { unsubscribe: jest.fn() }
      })
      component = new MobileProfileDashboardComponent(
        mockConfigSvc, mockRouter, mockDialog, mockUserProfileSvc, mockContentSvc,
        mockDomSanitizer, mockValueSvc, mockCompetencyConfigSvc, mockLanguageService,
        mockDocument, mockTelemetrySvc, mockPlylsSvc, mockSnackBar, mockCdr,
        mockLogger, mockTranslate, mockThemeService,
      )
      workCb({ type: 'onListPage' })
      expect(component.selectedIndex).toBe('')
    })

    it('should reset selectedIndex on data.type="back" when showMobileView is true', () => {
      let workCb: any
      mockContentSvc.workMessage.subscribe = jest.fn((cb: any) => {
        workCb = cb
        return { unsubscribe: jest.fn() }
      })
      mockValueSvc.isMobile.mockReturnValue(true)
      component = new MobileProfileDashboardComponent(
        mockConfigSvc, mockRouter, mockDialog, mockUserProfileSvc, mockContentSvc,
        mockDomSanitizer, mockValueSvc, mockCompetencyConfigSvc, mockLanguageService,
        mockDocument, mockTelemetrySvc, mockPlylsSvc, mockSnackBar, mockCdr,
        mockLogger, mockTranslate, mockThemeService,
      )
      workCb({ type: 'back' })
      expect(component.selectedIndex).toBe('')
    })
  })

  describe('setupMenuItems', () => {
    it('should use selectedTabConfig when selectedTab is accountTab', async () => {
      mockPlylsSvc.getSelectedTab.mockReturnValue('accountTab')
      mockPlylsSvc.selectedTabConfig.mockReturnValue({ menuItems: [], webOrderList: [], mobOrderList: [] })
      await component.setupMenuItems()
      expect(mockPlylsSvc.selectedTabConfig).toHaveBeenCalled()
    })
  })

  describe('changeFunction language case', () => {
    it('should call getUserDetails for language switch', () => {
      Object.defineProperty(window, 'scroll', { writable: true, value: jest.fn() })
      jest.spyOn(component, 'getUserDetails').mockImplementation(() => {})
      component.changeFunction({ name: 'language', data: null, text: 'Language' })
      expect(component.getUserDetails).toHaveBeenCalled()
    })
  })

  describe('formatAllRequest', () => {
    it('should set certificates from formateRequest and rcCertiface', () => {
      const data = { generalCertificates: [], sunbirdRcCertificates: [] }
      component.formatAllRequest(data)
      expect(component.certificates).toEqual([])
    })
  })

  describe('formateRequest', () => {
    it('should return empty array when no generalCertificates', () => {
      const result = component.formateRequest({ generalCertificates: [], sunbirdRcCertificates: [] })
      expect(result).toEqual([])
    })

    it('should format issued certificates from generalCertificates', () => {
      const data = {
        generalCertificates: [{ issuedCertificates: [{ identifier: 'cert-1', name: 'Cert One' }] }],
        sunbirdRcCertificates: [],
      }
      const result = component.formateRequest(data)
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ identifier: 'cert-1', name: 'Cert One', rcCertiface: false })
    })
  })

  describe('setAcademicDetail', () => {
    it('should not throw when data is null', () => {
      expect(() => component.setAcademicDetail(null)).not.toThrow()
    })

    it('should set userProfileData and currentProfession when data has professionalDetails', () => {
      mockCompetencyConfigSvc.setConfig = jest.fn()
      component['CompetencyConfiService'] = mockCompetencyConfigSvc
      const data = {
        profileDetails: {
          profileReq: {
            professionalDetails: [{ profession: 'Nurse' }],
            personalDetails: { photo: 'photo.jpg' },
            academics: [{ degree: 'MBBS' }],
          },
        },
      }
      component.setAcademicDetail(data)
      expect(component.currentProfession).toBe('Nurse')
    })

    it('should set currentProfession to "Not specified" when no professionalDetails', () => {
      mockCompetencyConfigSvc.setConfig = jest.fn()
      component['CompetencyConfiService'] = mockCompetencyConfigSvc
      const data = {
        profileDetails: {
          profileReq: {
            professionalDetails: [],
            personalDetails: null,
            photo: 'photo.jpg',
          },
        },
      }
      component.setAcademicDetail(data)
      expect(component.currentProfession).toBe('Not specified')
    })
  })

  describe('getLeaderBoardList', () => {
    it('should call getLeaderBoardData and set leaderboardData', () => {
      mockConfigSvc.unMappedUser = {
        rootOrgId: 'org-1',
        profileDetails: { profileReq: { professionalDetails: [{ designation: 'Nurse', instituteName: 'AIIMS' }] } },
      }
      const mockGetLeaderBoardData = jest.fn().mockReturnValue(of({
        result: { count: 5, content: { leaderboardList: [{ userId: 'u1' }], activeUserDetails: { userId: 'u1' } } },
      }))
      component['userProfileSvc'] = { ...mockUserProfileSvc, getLeaderBoardData: mockGetLeaderBoardData } as any
      component.getLeaderBoardList()
      expect(mockGetLeaderBoardData).toHaveBeenCalled()
      expect(component.totalUsers).toBe(5)
      expect(component.leaderboardData).toHaveLength(1)
    })
  })

  describe('eductionEdit / workInfoEdit / personalDetailEdit / navigate', () => {
    it('navigate should route to path when isBackgroundDetailsFilled returns true', () => {
      const mockIsBackgroundFilled = jest.fn().mockReturnValue(true)
      component['userProfileSvc'] = { ...mockUserProfileSvc, isBackgroundDetailsFilled: mockIsBackgroundFilled } as any
      component.navigate('app/education-list')
      expect(mockRouter.navigate).toHaveBeenCalledWith(['app/education-list'])
    })

    it('navigate should go to about-you when isBackgroundDetailsFilled returns false', () => {
      const mockIsBackgroundFilled = jest.fn().mockReturnValue(false)
      component['userProfileSvc'] = { ...mockUserProfileSvc, isBackgroundDetailsFilled: mockIsBackgroundFilled } as any
      component.navigate('app/education-list')
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/about-you'], expect.any(Object))
    })

    it('eductionEdit should call navigate with education-list', () => {
      const spy = jest.spyOn(component, 'navigate').mockImplementation(() => {})
      component.eductionEdit()
      expect(spy).toHaveBeenCalledWith('app/education-list')
    })

    it('workInfoEdit should call navigate with workinfo-list', () => {
      const spy = jest.spyOn(component, 'navigate').mockImplementation(() => {})
      component.workInfoEdit()
      expect(spy).toHaveBeenCalledWith('app/workinfo-list')
    })

    it('personalDetailEdit should call navigate with personal-detail-edit', () => {
      const spy = jest.spyOn(component, 'navigate').mockImplementation(() => {})
      component.personalDetailEdit()
      expect(spy).toHaveBeenCalledWith('app/personal-detail-edit')
    })
  })

  describe('showChat', () => {
    it('should not throw when widget element is not found', () => {
      mockDocument.getElementById.mockReturnValue(null)
      expect(() => component.showChat()).not.toThrow()
    })

    it('should set profileData attributes on element when found', () => {
      jest.useFakeTimers()
      const mockEl = {
        style: {},
        setAttribute: jest.fn(),
        querySelector: jest.fn().mockReturnValue(null),
      }
      mockDocument.getElementById.mockReturnValue(mockEl)
      component.profileData = { userId: 'u1', personalDetails: { firstname: 'John', surname: 'Doe' } }
      component.showChat()
      expect(mockEl.setAttribute).toHaveBeenCalledWith('userId', 'u1')
      jest.advanceTimersByTime(400)
      jest.useRealTimers()
    })
  })

  describe('logout', () => {
    it('should open logout dialog', () => {
      component.userInfo = { profileDetails: { profileReq: { id: 'u-1' } } }
      component.logout()
      expect(mockDialog.open).toHaveBeenCalled()
    })
  })

  describe('storeLanguage', () => {
    const setupStoreLanguage = () => {
      component.userInfo = {
        profileDetails: {
          profileReq: { personalDetails: {}, id: 'u-1' },
          preferences: { language: 'en' },
        },
      }
      component['languageService'] = { setLanguage: jest.fn() } as any
    }

    it('should call updateProfileDetails on language change', () => {
      setupStoreLanguage()
      const mockUpdateProfileDetails = jest.fn().mockReturnValue(of({ success: true }))
      component['userProfileSvc'] = { ...mockUserProfileSvc, updateProfileDetails: mockUpdateProfileDetails } as any
      component.storeLanguage('hi')
      expect(mockUpdateProfileDetails).toHaveBeenCalled()
      expect(mockLogger.log).toHaveBeenCalled()
    })

    it('should log error when updateProfileDetails fails', () => {
      setupStoreLanguage()
      const { throwError } = require('rxjs')
      const mockUpdateProfileDetails = jest.fn().mockReturnValue(throwError(() => new Error('lang error')))
      component['userProfileSvc'] = { ...mockUserProfileSvc, updateProfileDetails: mockUpdateProfileDetails } as any
      component.storeLanguage('hi')
      expect(mockLogger.error).toHaveBeenCalled()
    })
  })

  describe('changeFunction certificates callbacks', () => {
    it('should trigger next callback on successful certificate fetch', () => {
      const data = { generalCertificates: [], sunbirdRcCertificates: [] }
      mockContentSvc.fetchGeneralAndRcCertificates = jest.fn().mockReturnValue(of(data))
      component.isLoading = true
      component.changeFunction({ name: 'certificates', data: null, text: 'Certs' })
      expect(component.loader).toBe(false)
    })

    it('should trigger error callback on certificate fetch failure', () => {
      const { throwError } = require('rxjs')
      mockContentSvc.fetchGeneralAndRcCertificates = jest.fn().mockReturnValue(throwError(() => new Error('cert error')))
      component.changeFunction({ name: 'certificates', data: null, text: 'Certs' })
      expect(mockLogger.error).toHaveBeenCalled()
    })
  })

  describe('saveLanguage', () => {
    it('should log error on saveLanguage failure', () => {
      const { throwError } = require('rxjs')
      const mockUpdateProfileDetails = jest.fn().mockReturnValue(throwError(() => new Error('lang save error')))
      component['userProfileSvc'] = { ...mockUserProfileSvc, updateProfileDetails: mockUpdateProfileDetails } as any
      component['languageService'] = { setLanguage: jest.fn() } as any
      component.userData = { identifier: 'user-1', profileDetails: { preferences: {}, profileReq: { personalDetails: {} } } }
      component.saveLanguage({ value: { language: 'hi' } })
      expect(mockLogger.error).toHaveBeenCalled()
    })
  })

  describe('processCertiFicate', () => {
    it('should return from([true]) when certificateIdArray is empty', done => {
      const data = { generalCertificates: [], sunbirdRcCertificates: [] }
      component.processCertiFicate(data).subscribe({
        next: (v: any) => { expect(v).toBe(true); done() },
      })
    })

    it('should process certificate IDs and trigger finalize setTimeout and updateValue$ callback', async () => {
      // zone.js stores a ref to native setTimeout and bypasses jest fake timers;
      // use real timers here so the 500ms finalize delay actually fires
      jest.useRealTimers()

      const data = {
        generalCertificates: [{ issuedCertificates: [{ identifier: 'cert-1' }] }],
        sunbirdRcCertificates: [],
      }
      let updateValueCb: any
      mockContentSvc.getCertificateAPI = jest.fn().mockReturnValue(of({ result: {} }))
      mockContentSvc.updateValue$ = {
        subscribe: jest.fn((cb: any) => { updateValueCb = cb; return { unsubscribe: jest.fn() } }),
      }
      component.certificates = [{ identifier: 'cert-1' }]

      component.processCertiFicate(data).subscribe({ next: jest.fn(), error: jest.fn(), complete: jest.fn() })

      // wait for the 500ms setTimeout in finalize to fire
      await new Promise(resolve => setTimeout(resolve, 600))

      expect(mockContentSvc.updateValue$.subscribe).toHaveBeenCalled()
      if (updateValueCb) {
        updateValueCb({ 'cert-1': 'http://image-url.jpg' })
      }
      expect(component.certificates[0]['printUri']).toBe('http://image-url.jpg')
    }, 3000)
  })

  describe('setupMenuItems with orderList', () => {
    it('should build menuItems from config with webOrderList', async () => {
      const config = {
        menuItems: [
          { id: 'item1', name: 'Personal', text: 'Personal', data: {} },
          { id: 'item2', name: 'Work', text: 'Work', data: {} },
          { id: 'item3', name: 'Academic', text: 'Academic', data: {} },
        ],
        webOrderList: ['item1', 'item2', 'item3'],
        mobOrderList: [],
      }
      mockPlylsSvc.bodyConfig = jest.fn().mockReturnValue({ accountTab: config })
      component.showMobileView = false
      await component.setupMenuItems()
      expect(component.menuItems.length).toBeGreaterThan(0)
    })
  })

  describe('saveLanguage', () => {
    it('should call snackBar.open on success', () => {
      const mockUpdateProfileDetails = jest.fn().mockReturnValue(of({}))
      component['userProfileSvc'] = { ...mockUserProfileSvc, updateProfileDetails: mockUpdateProfileDetails } as any
      const mockLangSvc = { getCurrentLanguage: jest.fn().mockReturnValue('en'), setLanguage: jest.fn() }
      component['languageService'] = mockLangSvc as any
      component.userData = { identifier: 'user-1', profileDetails: { preferences: {}, profileReq: { personalDetails: {} } } }
      const form = { value: { language: 'hi' } }
      component.saveLanguage(form)
      expect(mockSnackBar.open).toHaveBeenCalled()
    })
  })
})
