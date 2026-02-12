import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, Observable, throwError } from 'rxjs'
import { map, shareReplay, tap, catchError, retry, take } from 'rxjs/operators'

const API_ENDPOINTS = {
  getUserProfile: '/apis/proxies/v8/api/user/v2/read',
}

@Injectable({
  providedIn: 'root',
})
export class UserDataCacheService {
  private userDataSubject = new BehaviorSubject<any>(null)
  public userData$ = this.userDataSubject.asObservable()
  private apiCall$: Observable<any> | null = null

  constructor(private http: HttpClient) {
    // Try to restore from session storage on service initialization
    this.restoreFromCache();

    // Debug: expose debug method to window for testing
    (window as any).clearUserCache = () => {
      this.clearUserData()
      console.log('[UserDataCache] Cache cleared! Reload page to see new API call.')
    }

    // Debug: expose method to get current cached data
    (window as any).getUserCached = () => {
      const data = this.userDataSubject.value
      console.log('[UserDataCache] Current cached user data:', data)
      return data
    }
  }

  /**
   * Get user data from cache or API
   * Prevents multiple simultaneous API calls
   */
  getUserData(): Observable<any> {
    // If data is already cached, return it
    const cachedData = this.userDataSubject.value
    if (cachedData) {
      console.log('[UserDataCache] Returning existing cached data for userId:', cachedData.userId)
      return this.userData$.pipe(take(1))
    }

    // If an API call is already in progress, return the same observable
    if (this.apiCall$) {
      console.log('[UserDataCache] API call already in progress, returning existing observable')
      return this.apiCall$
    }

    // If not cached and no call in progress, make the API call with retry
    console.log('[UserDataCache] No cache found, making API call to', API_ENDPOINTS.getUserProfile)
    this.apiCall$ = this.http
      .get<any>(API_ENDPOINTS.getUserProfile)
      .pipe(
        retry(1),
        map((res: any) => {
          console.log('[UserDataCache] API call successful, extracting response')
          return res.result.response
        }),
        tap((data: any) => {
          console.log('[UserDataCache] Caching data with userId:', data?.userId)
          this.userDataSubject.next(data)
          this.cacheToSession(data)
          this.apiCall$ = null
        }),
        catchError((error: any) => {
          console.error('[UserDataCache] Error fetching user data after retries:', error)
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
   * Set user data (e.g., after login/registration)
   */
  setUserData(data: any): void {
    this.userDataSubject.next(data)
    this.cacheToSession(data)
  }

  /**
   * Clear cached user data (e.g., on logout)
   */
  clearUserData(): void {
    this.userDataSubject.next(null)
    this.apiCall$ = null
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
        console.log('[UserDataCache] User data cached to session storage')
      } catch (e) {
        console.warn('[UserDataCache] Could not cache user data to session storage:', e)
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
        console.log('[UserDataCache] Found cached data in session storage, attempting to parse...')
        const data = JSON.parse(cached)
        if (data && data.userId) {
          console.log('[UserDataCache] Restoring data from session storage for userId:', data.userId)
          this.userDataSubject.next(data)
        } else {
          console.warn('[UserDataCache] Cached user data is invalid (no userId), clearing cache')
          sessionStorage.removeItem('userDataCache')
        }
      } else {
        console.log('[UserDataCache] No cached data found in session storage')
      }
    } catch (e) {
      console.warn('[UserDataCache] Could not restore user data from cache:', e)
      try {
        sessionStorage.removeItem('userDataCache')
      } catch (err) {
        console.warn('[UserDataCache] Could not clear invalid cache:', err)
      }
    }
  }
}
