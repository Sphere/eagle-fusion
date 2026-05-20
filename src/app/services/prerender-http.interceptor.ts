import { Injectable, Inject, PLATFORM_ID } from '@angular/core'
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http'
import { isPlatformBrowser } from '@angular/common'
import { Observable, of } from 'rxjs'

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
      return next.handle(req.clone({ url: `${PRERENDER_BASE}${req.url}` }))
    }
    return of(new HttpResponse({ status: 200, body: null, url: req.url }))
  }
}
