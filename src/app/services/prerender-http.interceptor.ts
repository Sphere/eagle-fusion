import { Injectable, Inject, PLATFORM_ID } from '@angular/core'
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http'
import { isPlatformBrowser } from '@angular/common'
import { Observable, of } from 'rxjs'
import { shareReplay } from 'rxjs/operators'

/**
 * Process-wide cache of public API responses, shared across every prerendered route.
 *
 * Module scope rather than a field: the interceptor is instantiated per rendered
 * route, so a field would be empty every time and cache nothing.
 */
const prerenderCache = new Map<string, Observable<HttpEvent<any>>>()

const PRERENDER_BASE = 'https://sphere.aastrika.org'
const PUBLIC_API_PREFIX = '/apis/public/v8'

/**
 * During prerender there is no HTTP server to resolve relative URLs.
 * Public API paths are forwarded with an absolute base URL so course metadata
 * can be fetched at build time. All other requests return an empty 200 so
 * the app bootstraps cleanly without hanging.
 */
@Injectable()
export class PrerenderHttpInterceptor implements HttpInterceptor {
  private readonly isBrowser: boolean

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId)
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.isBrowser) {
      return next.handle(req)
    }
    if (req.url.startsWith(PUBLIC_API_PREFIX)) {
      // These are real network calls to PRERENDER_BASE, and the same handful of URLs
      // is requested by nearly every one of the ~480 prerendered routes. Rendering
      // used to finish before they settled, so the cost was invisible; now that the
      // app waits for pending tasks again, repeating them per route dominates the
      // build. The data is identical for a given URL within a single build, so fetch
      // each one once and replay it to every later route.
      if (req.method !== 'GET') {
        return next.handle(req.clone({ url: `${PRERENDER_BASE}${req.url}` }))
      }
      const key = req.urlWithParams
      let cached = prerenderCache.get(key)
      if (!cached) {
        cached = next.handle(req.clone({ url: `${PRERENDER_BASE}${req.url}` }))
          .pipe(shareReplay({ bufferSize: 1, refCount: false }))
        prerenderCache.set(key, cached)
      }
      return cached
    }
    return of(new HttpResponse({ status: 200, body: null, url: req.url }))
  }
}
