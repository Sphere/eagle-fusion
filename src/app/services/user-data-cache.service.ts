import { Injectable, OnDestroy } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, Observable, throwError } from 'rxjs'
import { map, shareReplay, tap, catchError, retry, take } from 'rxjs/operators'
import { LoggerService } from '@ws-widget/utils'
import { API_END_POINTS } from '../constants/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class UserDataCacheService implements OnDestroy {
  private userDataSubject = new BehaviorSubject<any>(null)
  public userData$ = this.userDataSubject.asObservable()
  private apiCall$: Observable<any> | null = null
  private cacheExpirationTimeout: any = null
  private cacheTimestamp: number | null = null
  private readonly CACHE_EXPIRATION_TIME = 6 * 60 * 60 * 1000 // 6 hours in milliseconds

  constructor(private http: HttpClient, private logger: LoggerService) {
    // Try to restore from session storage on service initialization
    this.restoreFromCache();

    // Debug: expose debug method to window for testing
    (window as any).clearUserCache = () => {
      this.clearUserData()
      this.logger.log('[UserDataCache] Cache cleared! Reload page to see new API call.')
    }

    // Debug: expose method to get current cached data
    (window as any).getUserCached = () => {
      const data = this.userDataSubject.value
      this.logger.log('[UserDataCache] Current cached user data:', data)
      return data
    }

    // Debug: expose method to check cache expiration time
    (window as any).getCacheExpirationTime = () => {
      if (this.cacheTimestamp) {
        const expirationTime = new Date(this.cacheTimestamp + this.CACHE_EXPIRATION_TIME)
        this.logger.log('[UserDataCache] Cache will expire at:', expirationTime.toLocaleString())
        return expirationTime
      }
      this.logger.log('[UserDataCache] Cache is not set')
      return null
    }
  }

  /**
   * Check if cache has expired
   */
  private isCacheExpired(): boolean {
    if (!this.cacheTimestamp) {
      return true
    }
    const now = Date.now()
    const isExpired = now - this.cacheTimestamp > this.CACHE_EXPIRATION_TIME
    if (isExpired) {
      this.logger.log('[UserDataCache] Cache has expired after 6 hours')
    }
    return isExpired
  }

  /**
   * Set up automatic cache expiration after 6 hours
   */
  private setupCacheExpiration(): void {
    // Clear any existing timeout
    if (this.cacheExpirationTimeout) {
      clearTimeout(this.cacheExpirationTimeout)
    }

    // Set new timeout to clear cache after 6 hours
    this.cacheExpirationTimeout = setTimeout(() => {
      this.logger.log('[UserDataCache] 6-hour cache expiration timer triggered')
      this.clearUserData()
    }, this.CACHE_EXPIRATION_TIME)

    this.logger.log('[UserDataCache] Cache expiration timer set for 6 hours')
  }

  /**
   * Get user data from cache or API
   * Prevents multiple simultaneous API calls
   */
  getUserData(): Observable<any> {
    // Check if cache has expired
    if (this.isCacheExpired()) {
      this.logger.log('[UserDataCache] Cache expired, clearing and fetching fresh data')
      this.userDataSubject.next(null)
      this.apiCall$ = null
    }

    // If data is already cached, return it
    const cachedData = this.userDataSubject.value
    if (cachedData) {
      this.logger.log('[UserDataCache] Returning existing cached data for userId:', cachedData.userId)
      return this.userData$.pipe(take(1))
    }

    // If an API call is already in progress, return the same observable
    if (this.apiCall$) {
      this.logger.log('[UserDataCache] API call already in progress, returning existing observable')
      return this.apiCall$
    }

    // If not cached and no call in progress, make the API call with retry
    this.logger.log('[UserDataCache] No cache found, making API call to', API_END_POINTS.getUserdetailsFromRegistry)
    this.apiCall$ = this.http
      .get<any>(API_END_POINTS.getUserdetailsFromRegistry)
      .pipe(
        retry(1),
        map((res: any) => {
          this.logger.log('[UserDataCache] API call successful, extracting response')
          return res && res.result ? res.result.response : null
        }),
        tap((data: any) => {
          this.logger.log('[UserDataCache] Caching data with userId:', data?.userId)
          this.userDataSubject.next(data)
          this.cacheToSession(data)
          this.cacheTimestamp = Date.now()
          this.setupCacheExpiration()
          this.apiCall$ = null
        }),
        catchError((error: any) => {
          this.logger.error('[UserDataCache] Error fetching user data after retries:', error)
          this.apiCall$ = null
          return throwError(error)
        }),
        shareReplay(1),
      )

    return this.apiCall$
  }

  /**
   * Get cached user data synchronously
   */
  getCachedUserData(): any {
    return this.userDataSubject.value
  }

  /**
   * Sunbird Spark's user-read (V3) response omits the top-level `roles` array and only
   * carries roles nested per-organisation. Old Sunbird's top-level `roles` is a flat array
   * of role-name strings; Spark's V5 top-level `roles` is an array of raw role records
   * (`{role, scope, ...}`) instead. Normalize all three shapes down to plain role-name strings.
   */
  getRolesFromProfile(userPidProfile: any): string[] {
    const normalizeRoleEntries = (entries: any[]): string[] =>
      entries
        .map((entry: any) => (typeof entry === 'string' ? entry : entry?.role))
        .filter((role: any): role is string => typeof role === 'string' && role.length > 0)

    if (userPidProfile && Array.isArray(userPidProfile.roles) && userPidProfile.roles.length) {
      const roles = normalizeRoleEntries(userPidProfile.roles)
      if (roles.length) {
        return roles
      }
    }
    const organisations = (userPidProfile && userPidProfile.organisations) || []
    const roles = new Set<string>()
    organisations.forEach((org: any) => {
      (org.roles || []).forEach((role: string) => roles.add(role))
    })
    return Array.from(roles)
  }

  /**
   * Set user data (e.g., after login/registration)
   */
  setUserData(data: any): void {
    this.userDataSubject.next(data)
    this.cacheToSession(data)
    this.cacheTimestamp = Date.now()
    this.setupCacheExpiration()
  }

  /**
   * Clear cached user data (e.g., on logout)
   */
  clearUserData(): void {
    this.userDataSubject.next(null)
    this.apiCall$ = null
    this.cacheTimestamp = null
    if (this.cacheExpirationTimeout) {
      clearTimeout(this.cacheExpirationTimeout)
      this.cacheExpirationTimeout = null
    }
    sessionStorage.removeItem('userDataCache')
  }

  /**
   * Check if user data is loaded
   */
  isDataLoaded(): boolean {
    return this.userDataSubject.value !== null
  }

  /**
   * Cache user data to session storage for persistence during session
   */
  private cacheToSession(data: any): void {
    if (data && data.userId) {
      try {
        sessionStorage.setItem('userDataCache', JSON.stringify(data))
        this.logger.log('[UserDataCache] User data cached to session storage')
      } catch (e) {
        this.logger.warn('[UserDataCache] Could not cache user data to session storage:', e)
      }
    }
  }

  /**
   * Restore user data from session storage
   */
  private restoreFromCache(): void {
    try {
      const cached = sessionStorage.getItem('userDataCache')
      if (cached) {
        this.logger.log('[UserDataCache] Found cached data in session storage, attempting to parse...')
        const data = JSON.parse(cached)
        if (data && data.userId) {
          this.logger.log('[UserDataCache] Restoring data from session storage for userId:', data.userId)
          this.userDataSubject.next(data)
          this.cacheTimestamp = Date.now()
          this.setupCacheExpiration()
        } else {
          this.logger.warn('[UserDataCache] Cached user data is invalid (no userId), clearing cache')
          sessionStorage.removeItem('userDataCache')
        }
      } else {
        this.logger.log('[UserDataCache] No cached data found in session storage')
      }
    } catch (e) {
      this.logger.warn('[UserDataCache] Could not restore user data from cache:', e)
      try {
        sessionStorage.removeItem('userDataCache')
      } catch (err) {
        this.logger.warn('[UserDataCache] Could not clear invalid cache:', err)
      }
    }
  }

  /**
   * Clean up resources when service is destroyed
   */
  ngOnDestroy(): void {
    if (this.cacheExpirationTimeout) {
      clearTimeout(this.cacheExpirationTimeout)
      this.cacheExpirationTimeout = null
    }
  }
}
