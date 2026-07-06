import { Injectable } from '@angular/core'
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http'
import { Observable, of } from 'rxjs'
import { tap } from 'rxjs/operators'

/**
 * HTTP Interceptor that caches static asset/config JSON files in sessionStorage.
 *
 * Why sessionStorage:
 *  - Auto-clears when browser tab closes — no stale configs across deployments
 *  - Logout already calls sessionStorage.clear() — no extra cleanup needed
 *  - ~5MB limit is more than enough for these small JSON files
 *
 * How it works:
 *  - On GET for a cacheable file → return from sessionStorage if present
 *  - Otherwise, make the HTTP call, cache the response body, and return it
 *  - Only caches successful (200) responses with a body
 */

// Prefix used for all cache keys in sessionStorage
const CACHE_PREFIX = 'asset_cache:'

// URL patterns (substrings) that should be cached
const CACHEABLE_PATTERNS: string[] = [
  'fusion-assets/files/apps.json',
  'fusion-assets/files/apps.hi.json',
  'fusion-assets/files/site.config.json',
  'fusion-assets/files/widgets.config.json',
  'fusion-assets/files/features.config.json',
  'fusion-assets/files/search.json',
  'fusion-assets/files/toc.json',
  'fusion-assets/files/toc.hi.json',
  'fusion-assets/files/home.json',
  'fusion-assets/files/home.hi.json',
  'fusion-assets/files/license.meta.json',
  'assets/i18n/en.json',
  'assets/i18n/hi.json',
]

@Injectable({ providedIn: 'root' })
export class AssetCacheInterceptorService implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only cache GET requests that match our patterns
    if (req.method !== 'GET' || !this.isCacheable(req.url)) {
      return next.handle(req)
    }

    const cacheKey = this.getCacheKey(req.url)

    // Try to return from sessionStorage
    try {
      const cached = sessionStorage.getItem(cacheKey)
      if (cached !== null) {
        const body = JSON.parse(cached)
        return of(new HttpResponse({ status: 200, body }))
      }
    } catch {
      // Corrupted entry — remove and fetch fresh
      sessionStorage.removeItem(cacheKey)
    }

    // Cache miss — make the HTTP call and store the response
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse && event.status === 200 && event.body) {
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(event.body))
          } catch {
            // sessionStorage full — silently skip caching
          }
        }
      }),
    )
  }

  /** Check if the URL matches any cacheable pattern */
  private isCacheable(url: string): boolean {
    return CACHEABLE_PATTERNS.some(pattern => url.includes(pattern))
  }

  /** Derive a stable sessionStorage key from the URL */
  private getCacheKey(url: string): string {
    // Use the last meaningful path segment as the key
    // e.g. "fusion-assets/files/site.config.json" → "asset_cache:site.config.json"
    const match = CACHEABLE_PATTERNS.find(p => url.includes(p))
    return CACHE_PREFIX + (match || url)
  }

  /**
   * Manually clear all cached assets.
   * Not strictly needed — logout already calls sessionStorage.clear().
   * Exposed for any edge case where selective clearing is desired.
   */
  static clearCache(): void {
    const keysToRemove: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(k => sessionStorage.removeItem(k))
  }
}
