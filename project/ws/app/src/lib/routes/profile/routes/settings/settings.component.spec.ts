import { ReplaySubject, of, throwError } from 'rxjs'
import { SettingsComponent } from './settings.component'

describe('SettingsComponent', () => {
  let component: SettingsComponent
  let router: any
  let configSvc: any
  let userPrefSvc: any
  let snackBar: any
  let route: any
  let utilitySvc: any
  let userProfileSvc: any
  let userAgentSvc: any
  let languageSvc: any

  const buildInstanceConfig = (overrides: any = {}) => ({
    themes: [{ themeClass: 'theme-a' }],
    fontSizes: [{ fontClass: 'lg', scale: 2 }, { fontClass: 'sm', scale: 1 }],
    locals: [
      { path: 'en', isAvailable: true, isEnabled: true },
      { path: 'hi', isAvailable: true, isEnabled: false },
    ],
    ...overrides,
  })

  const build = () => {
    const c = new SettingsComponent(
      router, configSvc, userPrefSvc, snackBar, route, utilitySvc, userProfileSvc, userAgentSvc, languageSvc,
    )
    c.successToast = { nativeElement: { value: 'Saved' } } as any
    c.failureToast = { nativeElement: { value: 'Failed' } } as any
    c.maxContentLangToast = { nativeElement: { value: 'Max 3 languages' } } as any
    return c
  }

  beforeEach(() => {
    jest.useFakeTimers()
    router = { url: '/app/settings', navigate: jest.fn(), navigateByUrl: jest.fn() }
    configSvc = {
      restrictedFeatures: null,
      instanceConfig: buildInstanceConfig(),
      userPreference: null,
      userProfile: { language: '' },
      userProfileV2: null,
      activeLocale: null,
      activeThemeObject: null,
      activeFontObject: null,
      isIntranetAllowed: false,
      userUrl: '',
      prefChangeNotifier: new ReplaySubject<any>(1),
    }
    userPrefSvc = { saveUserPreference: jest.fn().mockResolvedValue(true) }
    snackBar = { open: jest.fn() }
    route = { snapshot: { queryParamMap: { get: jest.fn().mockReturnValue(null) } } }
    utilitySvc = { isMobile: false }
    userProfileSvc = {
      getUserdetailsFromRegistry: jest.fn().mockReturnValue(of({ profileDetails: { existing: true } })),
      updateProfileDetails: jest.fn().mockReturnValue(of({ ok: true })),
    }
    userAgentSvc = {
      getUserAgent: jest.fn().mockReturnValue({ OS: 'Windows', browserName: 'Chrome' }),
      generateCookie: jest.fn().mockReturnValue('cookie-1'),
    }
    languageSvc = { setLanguage: jest.fn() }
    component = build()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('should create with the documented defaults', () => {
    expect(component).toBeTruthy()
    expect(component.mode).toBe('settings')
    expect(component.showContentLang).toBe(false)
    expect(component.isIntranetAllowed).toBe(true)
    expect(component.showIntranetSettings).toBe(false)
    expect(component.isLanguageEnabled).toBe(true)
    expect(component.selectedIndex).toBeNull()
  })

  describe('ngOnInit', () => {
    it('should default to the general tab', () => {
      component.ngOnInit()
      expect(component.selectedIndex).toBe(0)
    })

    it('should select the notifications tab from the query param', () => {
      route.snapshot.queryParamMap.get.mockReturnValue('notifications')
      component.ngOnInit()
      expect(component.selectedIndex).toBe(1)
    })

    it('should show intranet settings on mobile when the feature is not restricted', () => {
      utilitySvc.isMobile = true
      configSvc.restrictedFeatures = new Set<string>()
      component.ngOnInit()
      expect(component.showIntranetSettings).toBe(true)
    })

    it('should hide intranet settings when the feature is restricted', () => {
      utilitySvc.isMobile = true
      configSvc.restrictedFeatures = new Set(['showIntranetMobile'])
      component.ngOnInit()
      expect(component.showIntranetSettings).toBe(false)
    })

    it('should hide intranet settings on desktop', () => {
      configSvc.restrictedFeatures = new Set<string>()
      component.ngOnInit()
      expect(component.showIntranetSettings).toBe(false)
    })
  })

  describe('initSettings', () => {
    it('should load themes and sort fonts by scale', () => {
      component.ngOnInit()
      expect(component.themes).toEqual([{ themeClass: 'theme-a' }])
      expect(component.fonts.map(f => f.fontClass)).toEqual(['sm', 'lg'])
    })

    it('should index the locales by path', () => {
      component.ngOnInit()
      expect(Object.keys(component.allowedLangCode)).toEqual(['en', 'hi'])
    })

    it('should disable language switching when only one locale exists', () => {
      configSvc.instanceConfig = buildInstanceConfig({ locals: [{ path: 'en', isAvailable: true, isEnabled: true }] })
      component.ngOnInit()
      expect(component.isLanguageEnabled).toBe(false)
    })

    it('should mark intranet content allowed on desktop', () => {
      component.ngOnInit()
      expect(component.isIntranetAllowed).toBe(true)
    })

    it('should mark intranet content disallowed on mobile', () => {
      utilitySvc.isMobile = true
      component.ngOnInit()
      expect(component.isIntranetAllowed).toBe(false)
    })

    it('should seed the content languages from the saved preference', () => {
      configSvc.userPreference = { selectedLangGroup: 'en,hi' }
      component.ngOnInit()
      expect(component.contentLanguage).toEqual(['en', 'hi'])
      expect(component.contentLangForm.value).toEqual(['en', 'hi'])
    })

    it('should tolerate a preference with no language group', () => {
      configSvc.userPreference = {}
      component.ngOnInit()
      expect(component.contentLanguage).toEqual([''])
    })

    it('should default the app language to en when nothing is set', () => {
      component.ngOnInit()
      expect(component.appLanguage).toBe('en')
      expect(component.chosenLanguage).toBe('en')
    })

    it('should take the app language from the user profile', () => {
      configSvc.userProfile = { language: 'hi' }
      component.ngOnInit()
      expect(component.appLanguage).toBe('hi')
    })

    it('should prefer the profile language over the active locale path', () => {
      configSvc.activeLocale = { path: 'en' }
      configSvc.userProfile = { language: 'hi' }
      component.ngOnInit()
      expect(component.appLanguage).toBe('hi')
    })

    it('should do nothing when there is no instance config', () => {
      configSvc.instanceConfig = null
      component.ngOnInit()
      expect(component.themes).toEqual([])
      expect(component.prefChangeSubs).toBeNull()
    })

    it('should refresh the active theme and font on a preference change', () => {
      component.ngOnInit()
      configSvc.activeThemeObject = { themeClass: 'theme-dark' }
      configSvc.activeFontObject = { fontClass: 'font-xl' }
      configSvc.isIntranetAllowed = true

      configSvc.prefChangeNotifier.next({})
      jest.advanceTimersByTime(100)

      expect(component.activeThemeKey).toBe('theme-dark')
      expect(component.activeFontClass).toBe('font-xl')
      expect(component.intranetContentForm.value).toBe(true)
    })

    it('should leave the active theme and font blank when none are set', () => {
      component.ngOnInit()
      expect(component.activeThemeKey).toBe('')
      expect(component.activeFontClass).toBe('')
    })
  })

  describe('ngOnDestroy', () => {
    it('should stop reacting to preference changes', () => {
      component.ngOnInit()
      component.ngOnDestroy()

      configSvc.activeThemeObject = { themeClass: 'theme-dark' }
      configSvc.prefChangeNotifier.next({})
      jest.advanceTimersByTime(100)

      expect(component.activeThemeKey).toBe('')
    })

    it('should be safe before init', () => {
      expect(() => component.ngOnDestroy()).not.toThrow()
    })

    it('should release the mode subscription when one exists', () => {
      const unsubscribe = jest.fn()
      component.modeChangeSubs = { unsubscribe } as any
      component.ngOnDestroy()
      expect(unsubscribe).toHaveBeenCalled()
    })
  })

  describe('locale helpers', () => {
    beforeEach(() => component.ngOnInit())

    it('should report locale availability', () => {
      expect(component.isLocaleAvailable('en')).toBe(true)
      expect(component.isLocaleAvailable('missing')).toBeFalsy()
    })

    it('should report locale enablement', () => {
      expect(component.isLocaleEnabled('en')).toBe(true)
      expect(component.isLocaleEnabled('hi')).toBe(false)
      expect(component.isLocaleEnabled('missing')).toBeFalsy()
    })

    it('should identify the chosen language as primary', () => {
      expect(component.isPrimary('en')).toBe(true)
      expect(component.isPrimary('hi')).toBe(false)
    })

    it('should expose an href path only for available and enabled locales', () => {
      expect(component.localeHrefPath('en')).toBe('en')
      expect(component.localeHrefPath('hi')).toBeNull()
      expect(component.localeHrefPath('missing')).toBeFalsy()
    })

    describe('localeIcon', () => {
      it('should show a checked radio for the active locale', () => {
        configSvc.activeLocale = { path: 'en' }
        expect(component.localeIcon('en')).toBe('radio_button_checked')
      })

      it('should show an unchecked radio for another enabled locale', () => {
        configSvc.activeLocale = { path: 'hi' }
        expect(component.localeIcon('en')).toBe('radio_button_unchecked')
      })

      it('should show not-interested for a disabled locale', () => {
        configSvc.activeLocale = { path: 'en' }
        expect(component.localeIcon('hi')).toBe('not_interested')
      })

      it('should show not-interested when no locale is active', () => {
        expect(component.localeIcon('en')).toBe('not_interested')
      })

      it('should show not-interested for an unknown locale', () => {
        configSvc.activeLocale = { path: 'en' }
        expect(component.localeIcon('missing')).toBe('not_interested')
      })
    })
  })

  describe('contentLangChanged', () => {
    it('should accept a selection of fewer than four languages', () => {
      component.contentLangForm.setValue(['en', 'hi', 'ta'])
      component.contentLangChanged()
      expect(component.contentLanguage).toEqual(['en', 'hi', 'ta'])
      expect(snackBar.open).not.toHaveBeenCalled()
    })

    it('should reject a fourth language and warn the user', () => {
      component.contentLanguage = ['en', 'hi', 'ta']
      component.contentLangForm.setValue(['en', 'hi', 'ta', 'kn'])
      component.contentLangChanged()

      expect(snackBar.open).toHaveBeenCalledWith('Max 3 languages')
      expect(component.contentLangForm.value).toEqual(['en', 'hi', 'ta'])
    })
  })

  describe('langChanged', () => {
    it('should do nothing when there is no v2 profile', () => {
      component.langChanged({ value: 'hi' } as any)
      expect(userProfileSvc.getUserdetailsFromRegistry).not.toHaveBeenCalled()
    })

    it('should persist the language against the registry profile', () => {
      configSvc.userProfileV2 = { userId: 'u1' }
      component.langChanged({ value: 'hi' } as any)

      expect(userProfileSvc.getUserdetailsFromRegistry).toHaveBeenCalledWith('u1')
      expect(component.chosenLanguage).toBe('hi')

      const [payload] = userProfileSvc.updateProfileDetails.mock.calls[0]
      expect(payload.request.userId).toBe('u1')
      expect(payload.request.profileLocation).toBe('sphere-web/settings')
      expect(payload.request.profileDetails).toEqual(expect.objectContaining({
        existing: true,
        preferences: { language: 'hi' },
        osName: 'Windows',
        browserName: 'Chrome',
        userCookie: 'cookie-1',
      }))
    })

    it('should swallow an update failure', () => {
      configSvc.userProfileV2 = { userId: 'u1' }
      userProfileSvc.updateProfileDetails.mockReturnValue(throwError(() => new Error('down')))
      expect(() => component.langChanged({ value: 'hi' } as any)).not.toThrow()
    })
  })

  describe('applyChanges', () => {
    beforeEach(() => component.ngOnInit())

    it('should save the chosen locale and content languages', async () => {
      component.contentLanguage = ['en', 'hi']
      await component.applyChanges()

      expect(userPrefSvc.saveUserPreference).toHaveBeenCalledWith({
        selectedLocale: 'en',
        selectedLangGroup: 'en,hi',
      })
      expect(snackBar.open).toHaveBeenCalledWith('Saved')
    })

    it('should switch the language and re-navigate when the locale changed', async () => {
      component.chosenLanguage = 'hi'
      await component.applyChanges()

      expect(languageSvc.setLanguage).toHaveBeenCalledWith('hi')
      expect(router.navigate).toHaveBeenCalledWith(['/app/settings'])
    })

    it('should return the user to their landing url in setup mode', async () => {
      component.mode = 'setup'
      configSvc.userUrl = '/app/home'
      await component.applyChanges()

      expect(languageSvc.setLanguage).not.toHaveBeenCalled()
      expect(router.navigateByUrl).toHaveBeenCalledWith('/app/home')
    })

    it('should not navigate in setup mode when no landing url was captured', async () => {
      component.mode = 'setup'
      await component.applyChanges()
      expect(router.navigateByUrl).not.toHaveBeenCalled()
    })

    it('should not navigate in settings mode when the locale is unchanged', async () => {
      await component.applyChanges()
      expect(router.navigate).not.toHaveBeenCalled()
      expect(router.navigateByUrl).not.toHaveBeenCalled()
    })
  })

  describe('updateCurrentTabIndex', () => {
    it('should record the general tab in the query params', () => {
      component.updateCurrentTabIndex({ index: 0 } as any)
      expect(component.selectedIndex).toBe(0)
      expect(router.navigate).toHaveBeenCalledWith([], { queryParams: { tab: 'general' } })
    })

    it('should record the notifications tab in the query params', () => {
      component.updateCurrentTabIndex({ index: 1 } as any)
      expect(component.selectedIndex).toBe(1)
      expect(router.navigate).toHaveBeenCalledWith([], { queryParams: { tab: 'notifications' } })
    })

    it('should fall back to general for any other index', () => {
      component.updateCurrentTabIndex({ index: 5 } as any)
      expect(router.navigate).toHaveBeenCalledWith([], { queryParams: { tab: 'general' } })
    })
  })
})
