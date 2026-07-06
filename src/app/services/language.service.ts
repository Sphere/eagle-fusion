import { Injectable } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { BehaviorSubject, Observable } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private currentLanguage = new BehaviorSubject<string>('en')
  public currentLanguage$ = this.currentLanguage.asObservable()

  private availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
  ]

  constructor(private translateService: TranslateService) {
    this.initializeLanguage()
  }

  /**
   * Initialize language from localStorage or browser default
   */
  initializeLanguage(): void {
    const savedLanguage = localStorage.getItem('language') || 'en'
    this.setLanguage(savedLanguage)
  }

  /**
   * Set the current language
   * @param languageCode Language code (e.g., 'en', 'hi')
   */
  setLanguage(languageCode: string): void {
    if (this.availableLanguages.some(lang => lang.code === languageCode)) {
      this.translateService.use(languageCode)
      this.currentLanguage.next(languageCode)
      localStorage.setItem('language', languageCode)
      document.documentElement.lang = languageCode
    }
  }

  /**
   * Get current language code
   */
  getCurrentLanguage(): string {
    return this.currentLanguage.value
  }

  /**
   * Get available languages
   */
  getAvailableLanguages(): Array<{ code: string; name: string }> {
    return this.availableLanguages
  }

  /**
   * Get translated text
   * @param key Translation key
   * @param params Optional parameters for interpolation
   */
  getTranslation(key: string, params?: any): Observable<string> {
    return this.translateService.get(key, params)
  }

  /**
   * Translate instant (synchronous)
   * @param key Translation key
   * @param params Optional parameters
   */
  instant(key: string, params?: any): string {
    return this.translateService.instant(key, params)
  }

  /**
   * Check if current language is Hindi
   * @returns true if language is 'hi'
   */
  isHindi(): boolean {
    return this.getCurrentLanguage() === 'hi'
  }

  /**
   * Check if current language is English
   * @returns true if language is 'en'
   */
  isEnglish(): boolean {
    return this.getCurrentLanguage() === 'en'
  }

  /**
   * Check if current language matches given code
   * @param langCode Language code to check (e.g., 'hi', 'en')
   * @returns true if current language matches
   */
  isLanguage(langCode: string): boolean {
    return this.getCurrentLanguage() === langCode
  }
}
