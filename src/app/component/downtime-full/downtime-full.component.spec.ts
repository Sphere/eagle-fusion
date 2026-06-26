import { Subject } from 'rxjs'
import { DowntimeFullComponent } from './downtime-full.component'
import { DowntimeState } from '../../models/downtime.model'

const makeState = (overrides: Partial<DowntimeState> = {}): DowntimeState => ({
  isDowntime: false,
  type: 'full',
  content: {
    icon: 'wrench',
    title: { en: 'System under maintenance', hi: 'सिस्टम मेंटेनेंस' },
    message: { en: 'Please check back soon', hi: 'कृपया बाद में देखें' },
    css: {
      theme: 'light',
      backgroundColor: '#f5f5f5',
      textColor: '#222222',
      primaryColor: '#1F4E79',
    },
  },
  ...overrides,
})

describe('DowntimeFullComponent', () => {
  let component: DowntimeFullComponent
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

    component = new DowntimeFullComponent(mockDowntimeService, mockLanguageService)
  })

  afterEach(() => jest.clearAllMocks())

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('default property values', () => {
    it('should default content to null', () => {
      expect(component.content).toBeNull()
    })

    it('should default currentLanguage to en', () => {
      expect(component.currentLanguage).toBe('en')
    })

    it('should default cssConfig to null', () => {
      expect(component.cssConfig).toBeNull()
    })

    it('should default isLoading to true', () => {
      expect(component.isLoading).toBe(true)
    })

    it('should default currentDowntimeState to null', () => {
      expect(component.currentDowntimeState).toBeNull()
    })
  })

  describe('ngOnInit', () => {
    it('should set isLoading to false after init', () => {
      component.ngOnInit()
      expect(component.isLoading).toBe(false)
    })

    it('should populate content when state is active full downtime', () => {
      const state = makeState({ isDowntime: true, type: 'full' })
      mockDowntimeService.getCurrentDowntimeState.mockReturnValue(state)
      component.ngOnInit()
      expect(component.content).toEqual(state.content)
    })

    it('should not populate content when type is not full', () => {
      mockDowntimeService.getCurrentDowntimeState.mockReturnValue(
        makeState({ isDowntime: true, type: 'partial' }),
      )
      component.ngOnInit()
      expect(component.content).toBeNull()
    })

    it('should not populate content when bypassed', () => {
      mockDowntimeService.getCurrentDowntimeState.mockReturnValue(
        makeState({ isDowntime: true, type: 'full' }),
      )
      mockDowntimeService.isBypassed.mockReturnValue(true)
      component.ngOnInit()
      expect(component.content).toBeNull()
    })

    it('should set cssConfig from content.css', () => {
      const state = makeState({ isDowntime: true, type: 'full' })
      mockDowntimeService.getCurrentDowntimeState.mockReturnValue(state)
      component.ngOnInit()
      expect(component.cssConfig).toEqual(state.content.css)
    })

    it('should store currentDowntimeState', () => {
      const state = makeState({ isDowntime: true, type: 'full' })
      mockDowntimeService.getCurrentDowntimeState.mockReturnValue(state)
      component.ngOnInit()
      expect(component.currentDowntimeState).toEqual(state)
    })
  })

  describe('reactive updates via getDowntimeState()', () => {
    beforeEach(() => component.ngOnInit())

    it('should set content when state becomes active full downtime', () => {
      const state = makeState({ isDowntime: true, type: 'full' })
      stateSubject.next(state)
      expect(component.content).toEqual(state.content)
    })

    it('should clear content when state becomes inactive', () => {
      stateSubject.next(makeState({ isDowntime: true, type: 'full' }))
      stateSubject.next(makeState({ isDowntime: false }))
      expect(component.content).toBeNull()
      expect(component.cssConfig).toBeNull()
    })

    it('should not update after ngOnDestroy', () => {
      component.ngOnDestroy()
      stateSubject.next(makeState({ isDowntime: true, type: 'full' }))
      expect(component.content).toBeNull()
    })
  })

  describe('language initialization', () => {
    it('should read currentLanguage from languageService', () => {
      mockLanguageService.getCurrentLanguage.mockReturnValue('hi')
      component.ngOnInit()
      expect(component.currentLanguage).toBe('hi')
    })

    it('should fall back to en when service returns non-string', () => {
      mockLanguageService.getCurrentLanguage.mockReturnValue(42)
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
    beforeEach(() => { component.content = makeState().content })

    it('should return en title by default', () => {
      component.currentLanguage = 'en'
      expect(component.getLocalizedTitle()).toBe('System under maintenance')
    })

    it('should return hi title when language is hi', () => {
      component.currentLanguage = 'hi'
      expect(component.getLocalizedTitle()).toBe('सिस्टम मेंटेनेंस')
    })

    it('should fall back to en when language key missing', () => {
      component.currentLanguage = 'fr'
      expect(component.getLocalizedTitle()).toBe('System under maintenance')
    })

    it('should return fallback string when content is null', () => {
      component.content = null
      expect(component.getLocalizedTitle()).toBe('System under maintenance')
    })
  })

  describe('getLocalizedMessage', () => {
    beforeEach(() => { component.content = makeState().content })

    it('should return en message', () => {
      component.currentLanguage = 'en'
      expect(component.getLocalizedMessage()).toBe('Please check back soon')
    })

    it('should return hi message', () => {
      component.currentLanguage = 'hi'
      expect(component.getLocalizedMessage()).toBe('कृपया बाद में देखें')
    })

    it('should fall back to en when language key missing', () => {
      component.currentLanguage = 'fr'
      expect(component.getLocalizedMessage()).toBe('Please check back soon')
    })

    it('should return fallback string when content is null', () => {
      component.content = null
      expect(component.getLocalizedMessage()).toBe('Please check back soon')
    })
  })

  describe('getThemeClass', () => {
    it('should return dark-theme when theme is dark', () => {
      component.cssConfig = { theme: 'dark' }
      expect(component.getThemeClass()).toBe('dark-theme')
    })

    it('should return empty string for light theme', () => {
      component.cssConfig = { theme: 'light' }
      expect(component.getThemeClass()).toBe('')
    })

    it('should return empty string when cssConfig is null', () => {
      component.cssConfig = null
      expect(component.getThemeClass()).toBe('')
    })
  })

  describe('getContainerStyles', () => {
    it('should return empty object when cssConfig is null', () => {
      component.cssConfig = null
      expect(component.getContainerStyles()).toEqual({})
    })

    it('should include backgroundColor and color from config', () => {
      component.cssConfig = { backgroundColor: '#fff', textColor: '#000' }
      const styles = component.getContainerStyles()
      expect(styles['backgroundColor']).toBe('#fff')
      expect(styles['color']).toBe('#000')
    })

    it('should use dark defaults when theme is dark and no overrides', () => {
      component.cssConfig = { theme: 'dark' }
      const styles = component.getContainerStyles()
      expect(styles['backgroundColor']).toBe('#1a1a1a')
      expect(styles['color']).toBe('#ffffff')
    })
  })

  describe('getAccentStyles', () => {
    it('should return empty object when cssConfig is null', () => {
      component.cssConfig = null
      expect(component.getAccentStyles()).toEqual({})
    })

    it('should return primaryColor as color', () => {
      component.cssConfig = { primaryColor: '#1F4E79' }
      expect(component.getAccentStyles()['color']).toBe('#1F4E79')
    })
  })

  describe('getIconClass', () => {
    it('should return default icon class when content is null', () => {
      component.content = null
      expect(component.getIconClass()).toBe('icon-wrench')
    })

    it('should return https URL directly', () => {
      component.content = { ...makeState().content, icon: 'https://example.com/icon.png' }
      expect(component.getIconClass()).toBe('https://example.com/icon.png')
    })

    it('should map wrench to icon-wrench class', () => {
      component.content = { ...makeState().content, icon: 'wrench' }
      expect(component.getIconClass()).toBe('icon-wrench')
    })

    it('should map info to icon-info class', () => {
      component.content = { ...makeState().content, icon: 'info' }
      expect(component.getIconClass()).toBe('icon-info')
    })

    it('should fall back to icon-wrench for unknown icon names', () => {
      component.content = { ...makeState().content, icon: 'unknown' }
      expect(component.getIconClass()).toBe('icon-wrench')
    })
  })

  describe('getAppLink', () => {
    it('should return null when content is null', () => {
      component.content = null
      expect(component.getAppLink()).toBeNull()
    })

    it('should return null when appLink is not defined', () => {
      component.content = makeState().content
      expect(component.getAppLink()).toBeNull()
    })

    it('should return null when appLink.isEnabled is false', () => {
      component.content = {
        ...makeState().content,
        appLink: { isEnabled: false, url: 'https://app.example.com', label: 'Download' },
      }
      expect(component.getAppLink()).toBeNull()
    })

    it('should return link data when enabled', () => {
      component.content = {
        ...makeState().content,
        appLink: { isEnabled: true, url: 'https://app.example.com', label: 'Download App', hint: 'Android' },
      }
      expect(component.getAppLink()).toEqual({
        url: 'https://app.example.com',
        label: 'Download App',
        hint: 'Android',
      })
    })
  })
})
