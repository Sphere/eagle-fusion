jest.mock('@angular/core', () => ({
  ...jest.requireActual('@angular/core'),
  effect: (fn: any) => { fn(); return {} },
}))

jest.mock('@angular/common', () => ({
  isPlatformBrowser: jest.fn().mockReturnValue(true),
}))

jest.mock('@ws-widget/utils', () => ({
  ValueService: class { isMobile = jest.fn().mockReturnValue(false) },
  ConfigurationsService: class {
    userProfile = null
    unMappedUser = null
  },
  LoggerService: class { log = jest.fn(); error = jest.fn() },
}))

jest.mock('../../services/scroll.service', () => ({
  ScrollService: class { scrollToDivEvent = { subscribe: jest.fn(), emit: jest.fn() } },
}))

jest.mock('../../services/language.service', () => ({
  LanguageService: class { getCurrentLanguage = jest.fn().mockReturnValue('en') },
}))

jest.mock('../../services/playlist.service', () => ({
  PlaylistService: class {
    bodyConfig = jest.fn().mockReturnValue('')
    loadPlaylistData = jest.fn().mockResolvedValue({ LAYOUT_BODY: [{ data: [], bannerStats: {} }] })
  },
}))

jest.mock('../../services/theme.service', () => ({
  ThemeService: class { isDark = jest.fn().mockReturnValue(false) },
}))

import { isPlatformBrowser } from '@angular/common'
import { WebHomeComponent } from './web-home.component'

describe('WebHomeComponent', () => {
  let component: WebHomeComponent
  let mockRouter: any
  let mockValueSvc: any
  let mockConfigSvc: any
  let mockScrollService: any
  let mockElementRef: any
  let mockLanguageSvc: any
  let mockPlaylistSvc: any
  let mockLogger: any
  let mockThemeSvc: any
  let mockCdr: any

  beforeEach(() => {
    jest.useFakeTimers()
    mockRouter = { navigateByUrl: jest.fn() }
    mockValueSvc = { isMobile: jest.fn().mockReturnValue(false) }
    mockConfigSvc = { userProfile: null, unMappedUser: null }
    mockScrollService = { scrollToDivEvent: { subscribe: jest.fn(), emit: jest.fn() } }
    mockElementRef = { nativeElement: { scrollIntoView: jest.fn() } }
    mockLanguageSvc = { getCurrentLanguage: jest.fn().mockReturnValue('en') }
    mockPlaylistSvc = {
      bodyConfig: jest.fn().mockReturnValue(''),
      loadPlaylistData: jest.fn().mockResolvedValue({ LAYOUT_BODY: [{ data: [1, 2, 3], bannerStats: {} }] }),
    }
    mockLogger = { log: jest.fn(), error: jest.fn() }
    mockThemeSvc = { isDark: jest.fn().mockReturnValue(false) }
    mockCdr = { detectChanges: jest.fn() }

    component = new WebHomeComponent(
      'browser',
      mockRouter,
      mockValueSvc,
      mockConfigSvc,
      mockScrollService,
      mockElementRef,
      mockLanguageSvc,
      mockPlaylistSvc,
      mockLogger,
      mockThemeSvc,
      mockCdr,
    )
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default currentSlideIndex to 0', () => {
    expect(component.currentSlideIndex).toBe(0)
  })

  it('should default lang to "en"', () => {
    expect(component.lang).toBe('en')
  })

  it('should set isXsmall false when isMobile is false', () => {
    expect(component.isXsmall).toBe(false)
  })

  it('should set isXsmall true when isMobile is true', () => {
    mockValueSvc.isMobile.mockReturnValue(true)
    mockConfigSvc.userProfile = null
    component = new WebHomeComponent(
      'browser', mockRouter, mockValueSvc, mockConfigSvc, mockScrollService,
      mockElementRef, mockLanguageSvc, mockPlaylistSvc, mockLogger, mockThemeSvc, mockCdr,
    )
    expect(component.isXsmall).toBe(true)
  })

  it('should set showCreateBtn false when isMobile is true and userProfile is not null', () => {
    mockValueSvc.isMobile.mockReturnValue(true)
    mockConfigSvc.userProfile = { id: 'u1' }
    component = new WebHomeComponent(
      'browser', mockRouter, mockValueSvc, mockConfigSvc, mockScrollService,
      mockElementRef, mockLanguageSvc, mockPlaylistSvc, mockLogger, mockThemeSvc, mockCdr,
    )
    expect(component.showCreateBtn).toBe(false)
  })

  it('should set showCreateBtn true when isMobile is true and userProfile is null', () => {
    mockValueSvc.isMobile.mockReturnValue(true)
    mockConfigSvc.userProfile = null
    component = new WebHomeComponent(
      'browser', mockRouter, mockValueSvc, mockConfigSvc, mockScrollService,
      mockElementRef, mockLanguageSvc, mockPlaylistSvc, mockLogger, mockThemeSvc, mockCdr,
    )
    expect(component.showCreateBtn).toBe(true)
  })

  describe('nextSlide', () => {
    it('should advance currentSlideIndex', () => {
      component.dataCarousel = [1, 2, 3]
      component.currentSlideIndex = 0
      component.nextSlide()
      expect(component.currentSlideIndex).toBe(1)
    })

    it('should wrap around to 0 when at last slide', () => {
      component.dataCarousel = [1, 2, 3]
      component.currentSlideIndex = 2
      component.nextSlide()
      expect(component.currentSlideIndex).toBe(0)
    })

    it('should not change index when dataCarousel is empty', () => {
      component.dataCarousel = []
      component.currentSlideIndex = 0
      component.nextSlide()
      expect(component.currentSlideIndex).toBe(0)
    })
  })

  describe('prevSlide', () => {
    it('should go to last slide when at first slide', () => {
      component.dataCarousel = [1, 2, 3]
      component.currentSlideIndex = 0
      component.prevSlide()
      expect(component.currentSlideIndex).toBe(2)
    })
  })

  describe('goToSlide', () => {
    it('should set currentSlideIndex to given index', () => {
      component.dataCarousel = [1, 2, 3]
      component.goToSlide(2)
      expect(component.currentSlideIndex).toBe(2)
    })
  })

  describe('onBannerImgLoad', () => {
    it('should set imgsLoaded[index] to true', () => {
      component.imgsLoaded = [false, false, false]
      component.onBannerImgLoad(1)
      expect(component.imgsLoaded[1]).toBe(true)
    })
  })

  describe('ngOnDestroy', () => {
    it('should call clearInterval', () => {
      jest.spyOn(component, 'clearInterval')
      component.ngOnDestroy()
      expect(component.clearInterval).toHaveBeenCalled()
    })
  })

  describe('createAcct', () => {
    it('should navigate to app/create-account', () => {
      component.createAcct()
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/create-account')
    })
  })

  describe('scrollToHowSphereWorks', () => {
    it('should emit the value on scrollToDivEvent', () => {
      component.scrollToHowSphereWorks('scrollToHowSphereWorks')
      expect(mockScrollService.scrollToDivEvent.emit).toHaveBeenCalledWith('scrollToHowSphereWorks')
    })
  })

  describe('clearInterval', () => {
    it('should call global clearInterval when intervalId is set', () => {
      const spy = jest.spyOn(global, 'clearInterval')
      ;(component as any).intervalId = 42
      component.clearInterval()
      expect(spy).toHaveBeenCalledWith(42)
    })

    it('should not call global clearInterval when intervalId is null', () => {
      const spy = jest.spyOn(global, 'clearInterval')
      ;(component as any).intervalId = null
      component.clearInterval()
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('startCarousel', () => {
    it('should advance slide index after 3 seconds', () => {
      component.dataCarousel = [1, 2, 3]
      component.currentSlideIndex = 0
      component.startCarousel()
      jest.advanceTimersByTime(3001)
      expect(component.currentSlideIndex).toBe(1)
    })
  })

  describe('ngOnInit', () => {
    it('should call loadPlaylistData when bodyConfig returns empty string', async () => {
      mockPlaylistSvc.bodyConfig.mockReturnValue('')
      await component.ngOnInit()
      expect(mockPlaylistSvc.loadPlaylistData).toHaveBeenCalled()
    })

    it('should set config from bodyConfig when it returns a non-empty value', async () => {
      const mockConfig = { data: [1, 2], bannerStats: { total: 10 } }
      mockPlaylistSvc.bodyConfig.mockReturnValue([mockConfig])
      await component.ngOnInit()
      expect(component.config).toEqual(mockConfig)
    })

    it('should set lang from userProfile preferences when available', async () => {
      mockConfigSvc.unMappedUser = { profileDetails: { preferences: { language: 'hi' } } }
      await component.ngOnInit()
      expect(component.lang).toBe('hi')
    })

    it('should set lang from languageSvc when no userProfile preference', async () => {
      mockConfigSvc.unMappedUser = null
      mockLanguageSvc.getCurrentLanguage.mockReturnValue('en')
      await component.ngOnInit()
      expect(component.lang).toBe('en')
    })

    it('should set dataCarousel and bannerStatus from config', async () => {
      const mockConfig = { data: ['a', 'b'], bannerStats: { count: 5 } }
      mockPlaylistSvc.bodyConfig.mockReturnValue([mockConfig])
      await component.ngOnInit()
      expect(component.dataCarousel).toEqual(['a', 'b'])
      expect(component.bannerStatus).toEqual({ count: 5 })
    })

    it('should scroll to target div when scrollToDivEvent fires with valid id', async () => {
      mockScrollService.scrollToDivEvent.subscribe = jest.fn((cb: Function) => cb('scrollToHowSphereWorks'))
      await component.ngOnInit()
      expect(mockElementRef.nativeElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
    })

    it('should not scroll when scrollToDivEvent fires with unknown id', async () => {
      mockScrollService.scrollToDivEvent.subscribe = jest.fn((cb: Function) => cb('unknownDiv'))
      await component.ngOnInit()
      expect(mockElementRef.nativeElement.scrollIntoView).not.toHaveBeenCalled()
    })

    it('should fall back to "en" when getCurrentLanguage returns a falsy value', async () => {
      mockConfigSvc.unMappedUser = null
      mockLanguageSvc.getCurrentLanguage.mockReturnValue(undefined)
      await component.ngOnInit()
      expect(component.lang).toBe('en')
    })

    it('should default imgsLoaded to empty array when config has no data', async () => {
      mockPlaylistSvc.bodyConfig.mockReturnValue([{ bannerStats: {} }])
      await component.ngOnInit()
      expect(component.imgsLoaded).toEqual([])
    })
  })

  describe('startCarousel platform guard', () => {
    it('should not start the interval when not running in a browser', () => {
      ;(isPlatformBrowser as jest.Mock).mockReturnValueOnce(false)
      const spy = jest.spyOn(global, 'setInterval')
      component.startCarousel()
      expect(spy).not.toHaveBeenCalled()
      spy.mockRestore()
    })
  })
})
