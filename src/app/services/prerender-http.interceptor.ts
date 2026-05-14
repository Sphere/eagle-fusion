import { Injectable, Inject, PLATFORM_ID } from '@angular/core'
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http'
import { isPlatformBrowser } from '@angular/common'
import { Observable, of } from 'rxjs'

/**
 * In the prerender (server-side) context there is no HTTP server to resolve
 * relative URLs against. This interceptor short-circuits every request so
 * the app can bootstrap cleanly and routes can be extracted without hanging
 * or crashing on failed network calls.
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
    return of(new HttpResponse({ status: 200, body: null, url: req.url }))
  }
}
