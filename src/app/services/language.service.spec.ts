jest.mock('@ngx-translate/core', () => ({
  TranslateService: class {
    use = jest.fn()
    get = jest.fn().mockReturnValue({ subscribe: jest.fn() })
    instant = jest.fn().mockImplementation((k: string) => k)
  },
}))

import { LanguageService } from './language.service'
import { TranslateService } from '@ngx-translate/core'

describe('LanguageService', () => {
  let service: LanguageService
  let mockTranslate: any

  beforeEach(() => {
    localStorage.clear()
    mockTranslate = new TranslateService()
    service = new LanguageService(mockTranslate)
  })

  afterEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('defaults to "en" when localStorage is empty', () => {
    expect(service.getCurrentLanguage()).toBe('en')
  })

  it('restores language from localStorage on init', () => {
    localStorage.setItem('language', 'hi')
    const svc2 = new LanguageService(mockTranslate)
    expect(svc2.getCurrentLanguage()).toBe('hi')
  })

  it('setLanguage to valid code updates current language', () => {
    service.setLanguage('hi')
    expect(service.getCurrentLanguage()).toBe('hi')
    expect(mockTranslate.use).toHaveBeenCalledWith('hi')
  })

  it('setLanguage to invalid code is ignored', () => {
    service.setLanguage('en')
    service.setLanguage('zz')
    expect(service.getCurrentLanguage()).toBe('en')
  })

  it('setLanguage persists to localStorage', () => {
    service.setLanguage('hi')
    expect(localStorage.getItem('language')).toBe('hi')
  })

  it('getAvailableLanguages returns both en and hi', () => {
    const langs = service.getAvailableLanguages()
    expect(langs.map((l: any) => l.code)).toContain('en')
    expect(langs.map((l: any) => l.code)).toContain('hi')
  })

  it('isHindi returns true when language is hi', () => {
    service.setLanguage('hi')
    expect(service.isHindi()).toBe(true)
  })

  it('isHindi returns false when language is en', () => {
    service.setLanguage('en')
    expect(service.isHindi()).toBe(false)
  })

  it('isEnglish returns true when language is en', () => {
    expect(service.isEnglish()).toBe(true)
  })

  it('isLanguage matches current language code', () => {
    service.setLanguage('hi')
    expect(service.isLanguage('hi')).toBe(true)
    expect(service.isLanguage('en')).toBe(false)
  })

  it('getTranslation delegates to translateService.get', () => {
    service.getTranslation('KEY', { param: 'val' })
    expect(mockTranslate.get).toHaveBeenCalledWith('KEY', { param: 'val' })
  })

  it('instant delegates to translateService.instant', () => {
    const result = service.instant('MY_KEY')
    expect(mockTranslate.instant).toHaveBeenCalledWith('MY_KEY', undefined)
    expect(result).toBe('MY_KEY')
  })
})
