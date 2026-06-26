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
})
