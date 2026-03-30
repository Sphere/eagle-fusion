import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, of } from 'rxjs'
import { tap, shareReplay, catchError, finalize } from 'rxjs/operators'
import { IndexedDBCacheService } from './indexeddb-cache.service'

export interface CacheMetadata {
  courseId: string
  data: any
  timestamp: number
  version: string
}

@Injectable({
  providedIn: 'root'
})
export class CourseHierarchyCacheService {
  private courseCache = new Map<string, CacheMetadata>()
  private cacheSubject = new Map<string, Observable<any>>()

  // Cache duration in milliseconds: 12 hours (adjustable)
  private readonly CACHE_DURATION = 12 * 60 * 60 * 1000 // 12 hours
  private readonly API_ENDPOINT = 'apis/proxies/v8/action/content/v3/hierarchy'

  constructor(
    private http: HttpClient,
    private indexedDBCache: IndexedDBCacheService
  ) {
    this.initializeFromIndexedDB()
  }

  /**
   * Get course hierarchy with multi-layer caching
   * Priority: In-Memory → IndexedDB → API
   */
  getCourseHierarchy(courseId: string): Observable<any> {
    // 1. Check in-memory cache first (fastest)
    const memoryCache = this.getFromMemory(courseId)
    if (memoryCache) {
      return of(memoryCache)
    }

    // 2. Prevent multiple simultaneous API calls for same course
    if (this.cacheSubject.has(courseId)) {
      return this.cacheSubject.get(courseId)!
    }

    // 3. Fetch with API call and cache the observable
    const api$ = this.fetchFromAPI(courseId).pipe(
      tap(response => {
        this.saveToMemory(courseId, response)
        this.indexedDBCache.save(courseId, response)
      }),
      catchError(error => {
        // On API error, try IndexedDB as fallback
        return this.indexedDBCache.get(courseId).then(cachedData => {
          if (cachedData) {
            console.warn(`[Cache] API failed, using IndexedDB fallback: ${courseId}`)
            return cachedData
          }
          throw error
        })
      }),
      shareReplay(1), // Share result among subscribers
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
    console.log(`[Cache] Fetching from API: ${courseId}`)

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
      console.log(`[Cache] Expired in memory: ${courseId}`)
      this.courseCache.delete(courseId)
      return null
    }

    const remainingTime = Math.round(
      (this.CACHE_DURATION - (Date.now() - cached.timestamp)) / 60000
    )
    console.log(`[Cache] Hit - Memory: ${courseId} (expires in ${remainingTime}m)`)
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
      version: data.pkgVersion || '1.0'
    })
    console.log(`[Cache] Saved to Memory: ${courseId}`)
  }

  /**
   * Initialize in-memory cache from IndexedDB on app startup
   */
  private initializeFromIndexedDB(): void {
    this.indexedDBCache.getAllCourses().then(courses => {
      courses.forEach(metadata => {
        if (!this.isExpired(metadata.timestamp)) {
          this.courseCache.set(metadata.courseId, metadata)
          console.log(`[Cache] Loaded from IndexedDB on init: ${metadata.courseId}`)
        }
      })
    })
  }

  /**
   * Check if cache is expired (6, 12, or 24 hours)
   */
  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.CACHE_DURATION
  }

  /**
   * Invalidate specific course cache (used when course is updated)
   */
  invalidateCache(courseId: string): void {
    this.courseCache.delete(courseId)
    this.indexedDBCache.delete(courseId)
    console.log(`[Cache] Invalidated: ${courseId}`)
  }

  /**
   * Invalidate all cached courses
   */
  invalidateAllCache(): void {
    this.courseCache.clear()
    this.indexedDBCache.clear()
    console.log(`[Cache] Invalidated all courses`)
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): { inMemory: number; size: string } {
    const size = new Blob([JSON.stringify(Array.from(this.courseCache.values()))]).size
    return {
      inMemory: this.courseCache.size,
      size: this.formatBytes(size)
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
}
