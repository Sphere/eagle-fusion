import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, of, throwError } from 'rxjs'
import { tap, shareReplay, catchError, finalize } from 'rxjs/operators'

export interface CacheMetadata {
  courseId: string
  data: any
  timestamp: number
  version: string
}

@Injectable({
  providedIn: 'root',
})
export class CourseHierarchyCacheService {
  private courseCache = new Map<string, CacheMetadata>()
  private cacheSubject = new Map<string, Observable<any>>()

  // Cache duration in milliseconds: 2 hours (adjustable)
  private readonly CACHE_DURATION = 30 * 60 * 1000 // 30 minutes
  private readonly API_ENDPOINT = 'apis/proxies/v8/action/content/v3/hierarchy'

  constructor(private http: HttpClient) {
    this.logCacheEvent('[Cache] Service initialized')
  }

  /**
   * Get course hierarchy with multi-layer caching
   * Priority: In-Memory → API → Cache
   */
  getCourseHierarchy(courseId: string): Observable<any> {
    // Guard: prevent API call with undefined id
    if (!courseId || courseId === 'undefined') {
      console.error('[Cache] Error: getCourseHierarchy called with undefined courseId')
      return throwError(() => new Error('Course ID is required'))
    }

    // 1. Check in-memory cache first (fastest, <1ms)
    const memoryCache = this.getFromMemory(courseId)
    if (memoryCache) {
      return of(memoryCache)
    }

    // 2. Prevent multiple simultaneous API calls for same course (request deduplication)
    if (this.cacheSubject.has(courseId)) {
      this.logCacheEvent(`[Cache] Deduplication: Using existing Observable for ${courseId}`)
      return this.cacheSubject.get(courseId)!
    }

    // 3. Fetch from API and cache the observable
    const api$ = this.fetchFromAPI(courseId).pipe(
      tap(response => {
        this.saveToMemory(courseId, response)
      }),
      catchError(error => {
        this.logCacheEvent(`[Cache] API Error for ${courseId}: ${error.message}`)
        throw error
      }),
      shareReplay(1), // Share result among subscribers (critical for deduplication)
      finalize(() => {
        // Clean up observable cache after completion
        this.cacheSubject.delete(courseId)
      })
    )

    this.cacheSubject.set(courseId, api$)
    return api$
  }

  /**
   * Fetch from API endpoint
   */
  private fetchFromAPI(courseId: string): Observable<any> {
    const url = `${this.API_ENDPOINT}/${courseId}?hierarchyType=detail`
    this.logCacheEvent(`[Cache] API Call: ${courseId}`)

    return this.http.get<any>(url)
  }

  /**
   * Check in-memory cache with expiration
   */
  private getFromMemory(courseId: string): any | null {
    const cached = this.courseCache.get(courseId)

    if (!cached) {
      return null
    }

    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION

    if (isExpired) {
      this.logCacheEvent(`[Cache] Expired: ${courseId}`)
      this.courseCache.delete(courseId)
      return null
    }

    const remainingTime = Math.round(
      (this.CACHE_DURATION - (Date.now() - cached.timestamp)) / 60000
    )
    this.logCacheEvent(`[Cache] HIT: ${courseId} (expires in ${remainingTime}m)`)
    return cached.data
  }

  /**
   * Save to in-memory cache with metadata
   */
  private saveToMemory(courseId: string, data: any): void {
    this.courseCache.set(courseId, {
      courseId,
      data,
      timestamp: Date.now(),
      version: data.pkgVersion || '1.0',
    })
    this.logCacheEvent(`[Cache] Saved to Memory: ${courseId}`)
  }

  /**
   * Invalidate specific course cache
   */
  invalidateCache(courseId: string): void {
    this.courseCache.delete(courseId)
    this.logCacheEvent(`[Cache] Invalidated: ${courseId}`)
  }

  /**
   * Invalidate all cached courses
   */
  invalidateAllCache(): void {
    this.courseCache.clear()
    this.logCacheEvent(`[Cache] Invalidated ALL courses`)
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): { inMemory: number; size: string } {
    const size = new Blob([JSON.stringify(Array.from(this.courseCache.values()))]).size
    return {
      inMemory: this.courseCache.size,
      size: this.formatBytes(size),
    }
  }

  /**
   * Format bytes to human readable
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  /**
   * Log cache events to console
   */
  private logCacheEvent(message: string): void {
    console.log(message)
  }
}
