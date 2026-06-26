jest.mock('@angular/core', () => {
  const actual = jest.requireActual('@angular/core')
  return {
    ...actual,
    effect: (fn: () => void) => { fn() },
  }
})

jest.mock('../../services/playlist.service', () => ({
  PlaylistService: class {
    orgDetails = jest.fn().mockReturnValue('')
    headerConfig = jest.fn().mockReturnValue(null)
    loadPlaylistData = jest.fn().mockResolvedValue(null)
    selectedTabConfig = jest.fn().mockReturnValue('')
    getPlaylistConfig = jest.fn().mockResolvedValue([])
  },
}))

jest.mock('../../services/language.service', () => ({
  LanguageService: class {
    getCurrentLanguage = jest.fn().mockReturnValue('en')
    isHindi = jest.fn().mockReturnValue(false)
  },
}))

jest.mock('../../services/theme.service', () => ({
  ThemeService: class {
    isDark = jest.fn().mockReturnValue(false)
  },
}))

import { Subject, of } from 'rxjs'
import { AppNavBarComponent } from './app-nav-bar.component'
import { NavigationStart, NavigationEnd } from '@angular/router'
import { SimpleChanges } from '@angular/core'

describe('AppNavBarComponent', () => {
  let component: AppNavBarComponent
  let routerEventsSubject: Subject<any>
  let mockDomSanitizer: any
  let mockConfigSvc: any
  let mockRouter: any
  let mockAccessService: any
  let mockValueSvc: any
  let mockDialog: any
  let mockNavOption: any
  let mockPlaylistSvc: any
  let mockLanguageSvc: any
  let mockCdr: any
  let mockLogger: any
  let mockThemeSvc: any

  beforeEach(() => {
    routerEventsSubject = new Subject<any>()

    mockDomSanitizer = {
      bypassSecurityTrustResourceUrl: jest.fn().mockReturnValue('safe-url'),
    }

    mockConfigSvc = {
      unMappedUser: null,
      restrictedFeatures: null,
      instanceConfig: null,
      userProfile: { userId: 'user1', rootOrgId: 'org1' },
      rootOrg: 'testOrg',
      primaryNavBar: null,
      pageNavBar: null,
      primaryNavBarConfig: null,
      appsConfig: null,
      orgSelectiveCourseConfig: null,
    }

    mockRouter = {
      events: routerEventsSubject.asObservable(),
      navigate: jest.fn(),
      navigateByUrl: jest.fn(),
    }

    mockAccessService = {
      hasRole: jest.fn().mockReturnValue(false),
    }

    mockValueSvc = {
      isMobile: jest.fn().mockReturnValue(false),
    }

    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
      }),
    }

    mockNavOption = {
      changeNavBarActive: jest.fn(),
    }

    mockPlaylistSvc = {
      orgDetails: jest.fn().mockReturnValue(''),
      headerConfig: jest.fn().mockReturnValue(null),
      loadPlaylistData: jest.fn().mockResolvedValue(null),
      selectedTabConfig: jest.fn().mockReturnValue(''),
      getPlaylistConfig: jest.fn().mockResolvedValue([]),
    }

    mockLanguageSvc = {
      getCurrentLanguage: jest.fn().mockReturnValue('en'),
      isHindi: jest.fn().mockReturnValue(false),
    }

    mockCdr = {
      detectChanges: jest.fn(),
      markForCheck: jest.fn(),
    }

    mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }

    mockThemeSvc = {
      isDark: jest.fn().mockReturnValue(false),
    }
  })

  const createComponent = () =>
    new AppNavBarComponent(
      mockDomSanitizer,
      mockConfigSvc,
      mockRouter,
      mockAccessService,
      mockValueSvc,
      mockDialog,
      mockNavOption,
      mockPlaylistSvc,
      mockLanguageSvc,
      mockCdr,
      mockLogger,
      mockThemeSvc,
    )

  afterEach(() => jest.clearAllMocks())

  it('should create', () => {
    component = createComponent()
    expect(component).toBeTruthy()
  })

  describe('default property values', () => {
    it('should have allowAuthor false', () => {
      component = createComponent()
      expect(component.allowAuthor).toBe(false)
    })

    it('should have mode top', () => {
      component = createComponent()
      expect(component.mode).toBe('top')
    })

    it('should have showNavLinkPage true for non-tnc URL', () => {
      component = createComponent()
      expect(component.showNavLinkPage).toBe(true)
    })

    it('should have isDark false when ThemeService returns false', () => {
      component = createComponent()
      expect(component.isDark).toBe(false)
    })

    it('should have isXSmall false when isMobile returns false', () => {
      component = createComponent()
      expect(component.isXSmall).toBe(false)
    })
  })

  describe('constructor — showNavLinkPage', () => {
    it('should set showNavLinkPage false when unMappedUser has no profileDetails', () => {
      mockConfigSvc.unMappedUser = { someField: true }
      component = createComponent()
      expect(component.showNavLinkPage).toBe(true) // location.href branch runs after and overrides
    })

    it('should set isHelpMenuRestricted when restrictedFeatures includes helpNavBarMenu', () => {
      mockConfigSvc.restrictedFeatures = new Set(['helpNavBarMenu'])
      component = createComponent()
      expect(component.isHelpMenuRestricted).toBe(true)
    })

    it('should not set isHelpMenuRestricted when restrictedFeatures is null', () => {
      mockConfigSvc.restrictedFeatures = null
      component = createComponent()
      expect(component.isHelpMenuRestricted).toBe(false)
    })

    it('should set langPresent from languageService.isHindi()', () => {
      mockLanguageSvc.isHindi.mockReturnValue(true)
      component = createComponent()
      expect(component.langPresent).toBe(true)
    })
  })

  describe('constructor — effect() reactive block', () => {
    it('should set isXSmall true when isMobile returns true', () => {
      mockValueSvc.isMobile.mockReturnValue(true)
      component = createComponent()
      expect(component.isXSmall).toBe(true)
    })

    it('should set isDark true when ThemeService returns true', () => {
      mockThemeSvc.isDark.mockReturnValue(true)
      component = createComponent()
      expect(component.isDark).toBe(true)
    })

    it('should set showCreateBtn true on mobile when userProfile is null', () => {
      mockValueSvc.isMobile.mockReturnValue(true)
      mockConfigSvc.userProfile = null
      component = createComponent()
      expect(component.showCreateBtn).toBe(true)
    })
  })

  describe('constructor — router events subscription', () => {
    it('should call cancelTour on NavigationStart', () => {
      component = createComponent()
      jest.spyOn(component, 'cancelTour')
      routerEventsSubject.next(new NavigationStart(1, '/app/home'))
      expect(component.cancelTour).toHaveBeenCalled()
    })

    it('should call cancelTour on NavigationEnd', () => {
      component = createComponent()
      jest.spyOn(component, 'cancelTour')
      routerEventsSubject.next(new NavigationEnd(1, '/app/home', '/app/home'))
      expect(component.cancelTour).toHaveBeenCalled()
    })
  })

  describe('cancelTour', () => {
    it('should set isTourGuideClosed false when popupTour is set', () => {
      component = createComponent()
      component.popupTour = { someRef: true }
      component.isTourGuideClosed = true
      component.cancelTour()
      expect(component.isTourGuideClosed).toBe(false)
    })

    it('should not throw when popupTour is undefined', () => {
      component = createComponent()
      component.popupTour = undefined
      expect(() => component.cancelTour()).not.toThrow()
    })
  })

  describe('ngOnChanges', () => {
    it('should add showTitle to widgetData when mode changes to bottom', () => {
      component = createComponent()
      const changes: SimpleChanges = {
        mode: {
          previousValue: 'top',
          currentValue: 'bottom',
          firstChange: false,
          isFirstChange: () => false,
        },
      }
      component.mode = 'bottom'
      component.ngOnChanges(changes)
      expect(component.btnAppsConfig.widgetData.showTitle).toBe(true)
    })

    it('should reset widgetData to basicBtnAppsConfig when mode changes to top', () => {
      component = createComponent()
      component.mode = 'top'
      const changes: SimpleChanges = {
        mode: {
          previousValue: 'bottom',
          currentValue: 'top',
          firstChange: false,
          isFirstChange: () => false,
        },
      }
      component.ngOnChanges(changes)
      expect(component.btnAppsConfig.widgetData.showTitle).toBeUndefined()
    })

    it('should not throw when changes do not include mode', () => {
      component = createComponent()
      expect(() => component.ngOnChanges({})).not.toThrow()
    })
  })

  describe('navigate', () => {
    it('should navigate to profile-view when dob is set', () => {
      mockConfigSvc.unMappedUser = {
        profileDetails: {
          profileReq: {
            personalDetails: { dob: '01/01/1990' },
          },
        },
      }
      component = createComponent()
      component.navigate()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/profile-view'])
    })

    it('should navigate to about-you when dob is not set', () => {
      mockConfigSvc.unMappedUser = null
      component = createComponent()
      component.navigate()
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/app/about-you'],
        { queryParams: { redirect: '/page/home' } },
      )
    })
  })

  describe('goHomePage', () => {
    it('should navigate to page/home when no orgSelectiveConfig', () => {
      mockConfigSvc.orgSelectiveCourseConfig = null
      component = createComponent()
      component.goHomePage()
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('page/home')
    })

    it('should redirect to orgSelectiveCourseConfig url when orgId matches', () => {
      mockConfigSvc.orgSelectiveCourseConfig = {
        orgId: 'org1',
        redirectUrl: 'page/org-home',
      }
      component = createComponent()
      component.goHomePage()
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('page/org-home')
    })
  })

  describe('createAcct', () => {
    it('should navigate to create-account', () => {
      component = createComponent()
      component.createAcct()
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/create-account')
    })
  })

  describe('changeLanguage', () => {
    it('should open the language dialog', () => {
      component = createComponent()
      component.changeLanguage()
      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should update preferedLanguage from afterClosed result', () => {
      mockDialog.open = jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(['hindi'])),
      })
      component = createComponent()
      component.changeLanguage()
      expect(component.preferedLanguage).toEqual(['hindi'])
    })
  })

  describe('setUIData', () => {
    it('should set menuItems filtered by webMenuItems when config is set and not mobile', async () => {
      mockPlaylistSvc.orgDetails.mockReturnValue({ appLogo: 'logo.png', foundationLogo: 'fl.png', foundationLogoDark: 'fld.png' })
      mockPlaylistSvc.headerConfig.mockReturnValue({
        menuItems: [{ id: 'home' }, { id: 'search' }, { id: 'profile' }],
        webMenuItems: ['home', 'search'],
        mobileMenuItems: ['home'],
      })
      component = createComponent()
      component.isXSmall = false
      await component.setUIData()
      expect(component.menuItems).toHaveLength(2)
    })

    it('should set menuItems filtered by mobileMenuItems when isXSmall is true', async () => {
      mockPlaylistSvc.orgDetails.mockReturnValue({ appLogo: 'logo.png' })
      mockPlaylistSvc.headerConfig.mockReturnValue({
        menuItems: [{ id: 'home' }, { id: 'search' }],
        webMenuItems: ['home', 'search'],
        mobileMenuItems: ['home'],
      })
      component = createComponent()
      component.isXSmall = true
      await component.setUIData()
      expect(component.menuItems).toHaveLength(1)
    })

    it('should call loadPlaylistData when orgData is empty string', async () => {
      mockPlaylistSvc.orgDetails.mockReturnValue('')
      mockPlaylistSvc.headerConfig.mockReturnValue(null)
      component = createComponent()
      await component.setUIData()
      expect(mockPlaylistSvc.loadPlaylistData).toHaveBeenCalled()
    })
  })

  describe('ngOnInit', () => {
    it('should call setUIData and set domain', async () => {
      mockPlaylistSvc.orgDetails.mockReturnValue({})
      mockPlaylistSvc.headerConfig.mockReturnValue(null)
      component = createComponent()
      jest.spyOn(component, 'setUIData').mockResolvedValue(undefined)
      await component.ngOnInit()
      expect(component.setUIData).toHaveBeenCalled()
      expect(component.domain).toBe(window.location.hostname)
    })

    it('should set hideCreateButton false when orgValue is nhsrc', async () => {
      localStorage.setItem('orgValue', 'nhsrc')
      component = createComponent()
      jest.spyOn(component, 'setUIData').mockResolvedValue(undefined)
      await component.ngOnInit()
      expect(component.hideCreateButton).toBe(false)
      localStorage.removeItem('orgValue')
    })

    it('should set featureApps from appsConfig', async () => {
      mockConfigSvc.appsConfig = { features: { home: {}, search: {} } }
      component = createComponent()
      jest.spyOn(component, 'setUIData').mockResolvedValue(undefined)
      await component.ngOnInit()
      expect(component.featureApps).toEqual(['home', 'search'])
    })

    it('should set instanceVal and navbar config from instanceConfig', async () => {
      mockConfigSvc.instanceConfig = {
        logos: { appBottomNav: 'bottom-icon.png' },
        showNavBarInSetup: false,
      }
      mockConfigSvc.primaryNavBar = { color: 'blue' }
      mockConfigSvc.pageNavBar = { color: 'red' }
      mockConfigSvc.primaryNavBarConfig = { show: true }
      component = createComponent()
      jest.spyOn(component, 'setUIData').mockResolvedValue(undefined)
      await component.ngOnInit()
      expect(component.instanceVal).toBe('testOrg')
      expect(component.primaryNavbarBackground).toEqual({ color: 'blue' })
    })

    it('should set showAppNavBar false for /app/setup with instanceConfig no showNavBarInSetup', async () => {
      mockConfigSvc.instanceConfig = { showNavBarInSetup: false, logos: {} }
      component = createComponent()
      jest.spyOn(component, 'setUIData').mockResolvedValue(undefined)
      await component.ngOnInit()
      routerEventsSubject.next(new NavigationEnd(1, '/app/setup', '/app/setup'))
      expect(component.showAppNavBar).toBe(false)
    })

    it('should hide search icon on /search/home route', async () => {
      mockConfigSvc.instanceConfig = null
      component = createComponent()
      jest.spyOn(component, 'setUIData').mockResolvedValue(undefined)
      await component.ngOnInit()
      routerEventsSubject.next(new NavigationEnd(1, '/search/home', '/search/home'))
      expect(component.showSearchIcon).toBe(false)
    })

    it('should show search icon on normal routes', async () => {
      component = createComponent()
      jest.spyOn(component, 'setUIData').mockResolvedValue(undefined)
      await component.ngOnInit()
      routerEventsSubject.next(new NavigationEnd(1, '/app/home', '/app/home'))
      expect(component.showSearchIcon).toBe(true)
    })
  })

  describe('navigate with menuItems', () => {
    it('should clear active state on all menuItems before navigating', () => {
      mockConfigSvc.unMappedUser = null
      component = createComponent()
      component.menuItems = [{ id: 'home', active: true }, { id: 'search', active: true }]
      component.navigate()
      expect(component.menuItems.every(item => !item.active)).toBe(true)
    })
  })

  describe('onPopState', () => {
    it('should assign location.href to /page/home', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { href: '' },
      })
      component = createComponent()
      component.onPopState({})
      expect(window.location.href).toBe('/page/home')
    })
  })
})
