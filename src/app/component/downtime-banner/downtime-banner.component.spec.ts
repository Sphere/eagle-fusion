import { Subject, of } from 'rxjs'
import { DowntimeBannerComponent } from './downtime-banner.component'
import { DowntimeState } from '../../models/downtime.model'

const makeState = (overrides: Partial<DowntimeState> = {}): DowntimeState => ({
  isDowntime: false,
  type: 'partial',
  content: {
    icon: 'alert',
    title: { en: 'Service notification', hi: 'सेवा अधिसूचना' },
    message: { en: 'We are under maintenance.', hi: 'हम मेंटेनेंस में हैं।' },
    css: {
      bannerColor: '#FFF8EE',
      textColor: '#333333',
      borderColor: '#CE9A39',
      borderPosition: 'left',
      position: 'top',
    },
  },
  ...overrides,
})

describe('DowntimeBannerComponent', () => {
  let component: DowntimeBannerComponent
  let stateSubject: Subject<DowntimeState>
  let mockDowntimeService: any
  let mockLanguageService: any

  beforeEach(() => {
    stateSubject = new Subject<DowntimeState>()

    mockDowntimeService = {
      getCurrentDowntimeState: jest.fn().mockReturnValue(makeState()),
      getDowntimeState: jest.fn().mockReturnValue(stateSubject.asObservable()),
      isBypassed: jest.fn().mockReturnValue(false),
    }

    mockLanguageService = {
      getCurrentLanguage: jest.fn().mockReturnValue('en'),
    }

    component = new DowntimeBannerComponent(mockDowntimeService, mockLanguageService)
  })

  afterEach(() => jest.clearAllMocks())

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('default property values', () => {
    it('should default isVisible to false', () => {
      expect(component.isVisible).toBe(false)
    })

    it('should default content to null', () => {
      expect(component.content).toBeNull()
    })

    it('should default currentLanguage to en', () => {
      expect(component.currentLanguage).toBe('en')
    })

    it('should default cssConfig to null', () => {
      expect(component.cssConfig).toBeNull()
    })
  })

  describe('ngOnInit', () => {
    it('should show banner when downtime is active (partial)', () => {
      mockDowntimeService.getCurrentDowntimeState.mockReturnValue(
        makeState({ isDowntime: true, type: 'partial' }),
      )
      component.ngOnInit()
      expect(component.isVisible).toBe(true)
      expect(component.content).not.toBeNull()
    })

    it('should show banner when downtime type is full', () => {
      mockDowntimeService.getCurrentDowntimeState.mockReturnValue(
        makeState({ isDowntime: true, type: 'full' }),
      )
      component.ngOnInit()
      expect(component.isVisible).toBe(true)
    })

    it('should not show banner when not in downtime', () => {
      component.ngOnInit()
      expect(component.isVisible).toBe(false)
    })

    it('should not show banner when bypassed', () => {
      mockDowntimeService.getCurrentDowntimeState.mockReturnValue(
        makeState({ isDowntime: true, type: 'partial' }),
      )
      mockDowntimeService.isBypassed.mockReturnValue(true)
      component.ngOnInit()
      expect(component.isVisible).toBe(false)
    })

    it('should set cssConfig from content.css on active downtime', () => {
      const state = makeState({ isDowntime: true, type: 'partial' })
      mockDowntimeService.getCurrentDowntimeState.mockReturnValue(state)
      component.ngOnInit()
      expect(component.cssConfig).toEqual(state.content.css)
    })
  })

  describe('reactive updates via getDowntimeState()', () => {
    beforeEach(() => component.ngOnInit())

    it('should show banner when state becomes active', () => {
      stateSubject.next(makeState({ isDowntime: true, type: 'partial' }))
      expect(component.isVisible).toBe(true)
    })

    it('should hide banner when state becomes inactive', () => {
      stateSubject.next(makeState({ isDowntime: true, type: 'partial' }))
      stateSubject.next(makeState({ isDowntime: false }))
      expect(component.isVisible).toBe(false)
    })

    it('should not update after ngOnDestroy', () => {
      component.ngOnDestroy()
      stateSubject.next(makeState({ isDowntime: true, type: 'partial' }))
      expect(component.isVisible).toBe(false)
    })
  })

  describe('language initialization', () => {
    it('should read currentLanguage from languageService', () => {
      mockLanguageService.getCurrentLanguage.mockReturnValue('hi')
      component.ngOnInit()
      expect(component.currentLanguage).toBe('hi')
    })

    it('should fall back to en when service returns non-string', () => {
      mockLanguageService.getCurrentLanguage.mockReturnValue(null)
      component.ngOnInit()
      expect(component.currentLanguage).toBe('en')
    })

    it('should fall back to en when service throws', () => {
      mockLanguageService.getCurrentLanguage.mockImplementation(() => { throw new Error('fail') })
      component.ngOnInit()
      expect(component.currentLanguage).toBe('en')
    })
  })

  describe('getLocalizedTitle', () => {
    beforeEach(() => {
      component.content = makeState().content
    })

    it('should return current language title', () => {
      component.currentLanguage = 'hi'
      expect(component.getLocalizedTitle()).toBe('सेवा अधिसूचना')
    })

    it('should fall back to en when language key missing', () => {
      component.currentLanguage = 'fr'
      expect(component.getLocalizedTitle()).toBe('Service notification')
    })

    it('should return fallback string when content is null', () => {
      component.content = null
      expect(component.getLocalizedTitle()).toBe('Service notification')
    })
  })

  describe('getLocalizedMessage', () => {
    beforeEach(() => {
      component.content = makeState().content
    })

    it('should return current language message', () => {
      component.currentLanguage = 'en'
      expect(component.getLocalizedMessage()).toBe('We are under maintenance.')
    })

    it('should fall back to en when language key missing', () => {
      component.currentLanguage = 'fr'
      expect(component.getLocalizedMessage()).toBe('We are under maintenance.')
    })

    it('should return empty string when content is null', () => {
      component.content = null
      expect(component.getLocalizedMessage()).toBe('')
    })
  })

  describe('getAppLink', () => {
    it('should return null when content is null', () => {
      component.content = null
      expect(component.getAppLink()).toBeNull()
    })

    it('should return null when appLink is missing', () => {
      component.content = makeState().content
      expect(component.getAppLink()).toBeNull()
    })

    it('should return null when appLink.isEnabled is false', () => {
      component.content = {
        ...makeState().content,
        appLink: { isEnabled: false, url: 'https://example.com', label: 'Download App' },
      }
      expect(component.getAppLink()).toBeNull()
    })

    it('should return link object when enabled and url/label present', () => {
      component.content = {
        ...makeState().content,
        appLink: { isEnabled: true, url: 'https://example.com', label: 'Download', hint: 'Click here' },
      }
      expect(component.getAppLink()).toEqual({ url: 'https://example.com', label: 'Download', hint: 'Click here' })
    })
  })

  describe('getBannerStyles', () => {
    it('should return empty object when cssConfig is null', () => {
      component.cssConfig = null
      expect(component.getBannerStyles()).toEqual({})
    })

    it('should include backgroundColor and textColor from config', () => {
      component.cssConfig = { bannerColor: '#fff', textColor: '#000', borderPosition: 'none' }
      const styles = component.getBannerStyles()
      expect(styles['backgroundColor']).toBe('#fff')
      expect(styles['color']).toBe('#000')
    })

    it('should add borderLeft when borderPosition is left', () => {
      component.cssConfig = { borderPosition: 'left', borderColor: '#CE9A39' }
      const styles = component.getBannerStyles()
      expect(styles['borderLeft']).toBe('4px solid #CE9A39')
    })

    it('should not add border when borderPosition is none', () => {
      component.cssConfig = { borderPosition: 'none', borderColor: '#CE9A39' }
      const styles = component.getBannerStyles()
      expect(styles['borderLeft']).toBeUndefined()
    })
  })

  describe('getWrapperStyles', () => {
    it('should return empty object for top position', () => {
      component.cssConfig = { position: 'top' }
      expect(component.getWrapperStyles()).toEqual({})
    })

    it('should return bottom styles for bottom position', () => {
      component.cssConfig = { position: 'bottom' }
      const styles = component.getWrapperStyles()
      expect(styles['top']).toBe('auto')
      expect(styles['bottom']).toBe('24px')
    })

    it('should return empty object when cssConfig is null', () => {
      component.cssConfig = null
      expect(component.getWrapperStyles()).toEqual({})
    })
  })

  describe('getIconName', () => {
    it('should map wrench to build', () => {
      component.content = { ...makeState().content, icon: 'wrench' }
      expect(component.getIconName()).toBe('build')
    })

    it('should map maintenance to build', () => {
      component.content = { ...makeState().content, icon: 'maintenance' }
      expect(component.getIconName()).toBe('build')
    })

    it('should map info to info', () => {
      component.content = { ...makeState().content, icon: 'info' }
      expect(component.getIconName()).toBe('info')
    })

    it('should fall back to error for unknown icon name', () => {
      component.content = { ...makeState().content, icon: 'unknown-icon' }
      expect(component.getIconName()).toBe('error')
    })

    it('should return error when content is null', () => {
      component.content = null
      expect(component.getIconName()).toBe('error')
    })
  })

  describe('isIconUrl', () => {
    it('should return true for https URL', () => {
      component.content = { ...makeState().content, icon: 'https://example.com/icon.png' }
      expect(component.isIconUrl()).toBe(true)
    })

    it('should return true for http URL', () => {
      component.content = { ...makeState().content, icon: 'http://example.com/icon.png' }
      expect(component.isIconUrl()).toBe(true)
    })

    it('should return false for icon name string', () => {
      component.content = { ...makeState().content, icon: 'wrench' }
      expect(component.isIconUrl()).toBe(false)
    })

    it('should return false when content is null', () => {
      component.content = null
      expect(component.isIconUrl()).toBe(false)
    })
  })

  describe('getIconStyles', () => {
    it('should use borderColor when available', () => {
      component.cssConfig = { borderColor: '#CE9A39' }
      expect(component.getIconStyles()['color']).toBe('#CE9A39')
    })

    it('should fall back to primaryColor when borderColor is absent', () => {
      component.cssConfig = { primaryColor: '#1F4E79' }
      expect(component.getIconStyles()['color']).toBe('#1F4E79')
    })

    it('should use default color when cssConfig is null', () => {
      component.cssConfig = null
      expect(component.getIconStyles()['color']).toBe('#CE9A39')
    })
  })

  describe('dismissBanner', () => {
    it('should set isVisible to false', () => {
      component.isVisible = true
      component.dismissBanner()
      expect(component.isVisible).toBe(false)
    })
  })
})
