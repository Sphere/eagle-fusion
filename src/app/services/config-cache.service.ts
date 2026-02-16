import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, Observable, throwError } from 'rxjs'
import { shareReplay, tap, catchError, retry, take } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class ConfigCacheService {
  private baseUrl = 'assets/configurations'

  // Cache for language-specific host configs (host.config.json for en, host.config.hi.json for hi)
  private hostConfigCache: Map<string, { subject: BehaviorSubject<any>, call$: Observable<any> | null }> = new Map()

  constructor(private http: HttpClient) {
    this.restoreFromCache()
  }

  /**
   * Get host config for specified locale (host.config.json for en, host.config.hi.json for hi)
   * @param locale - Language locale (e.g., 'en', 'hi')
   */
  getHostConfig(locale: string = 'en'): Observable<any> {
    if (!this.hostConfigCache.has(locale)) {
      this.hostConfigCache.set(locale, { subject: new BehaviorSubject<any>(null), call$: null })
    }

    const cacheEntry = this.hostConfigCache.get(locale)!
    const cachedData = cacheEntry.subject.value

    if (cachedData) {
      console.log(`[ConfigCache] Returning cached host config for locale: ${locale}`)
      return cacheEntry.subject.asObservable().pipe(take(1))
    }

    if (cacheEntry.call$) {
      console.log(`[ConfigCache] Host config call already in progress for locale: ${locale}`)
      return cacheEntry.call$
    }

    // Build filename based on locale
    const filename = locale === 'hi' ? 'host.config.hi.json' : 'host.config.json'
    const configUrl = `${this.baseUrl}/${filename}`

    console.log('[ConfigCache] Fetching host config from', configUrl)
    cacheEntry.call$ = this.http.get<any>(configUrl)
      .pipe(
        retry(1),
        tap((data: any) => {
          console.log(`[ConfigCache] Host config loaded successfully for locale: ${locale}`)
          cacheEntry.subject.next(data)
          this.cacheToSession(data, locale)
        }),
        catchError((error: any) => {
          console.error(`[ConfigCache] Error fetching host config for locale ${locale}:`, error)
          cacheEntry.call$ = null
          return throwError(error)
        }),
        shareReplay(1),
      )

    return cacheEntry.call$
  }

  /**
   * Cache data to session storage with locale key
   */
  private cacheToSession(data: any, locale: string = 'en'): void {
    try {
      const cacheKey = `config_hostConfig_${locale}`
      sessionStorage.setItem(cacheKey, JSON.stringify(data))
    } catch (e) {
      console.warn('[ConfigCache] Could not cache config to session storage:', e)
    }
  }

  /**
   * Restore config from session storage on service initialization
   */
  private restoreFromCache(): void {
    try {
      // Restore both English and Hindi configs if they exist
      const locales = ['en', 'hi']
      locales.forEach(locale => {
        const cacheKey = `config_hostConfig_${locale}`
        const hostConfigCached = sessionStorage.getItem(cacheKey)
        if (hostConfigCached) {
          const data = JSON.parse(hostConfigCached)
          if (data && data.rootOrg) {
            console.log(`[ConfigCache] Restored host config from session storage for locale: ${locale}`)
            if (!this.hostConfigCache.has(locale)) {
              this.hostConfigCache.set(locale, { subject: new BehaviorSubject<any>(null), call$: null })
            }
            this.hostConfigCache.get(locale)!.subject.next(data)
          }
        }
      })
    } catch (e) {
      console.warn('[ConfigCache] Could not restore config from cache:', e)
    }
  }
}
