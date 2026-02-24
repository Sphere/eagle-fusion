import { Injectable, LOCALE_ID, Inject } from '@angular/core'
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpResponse } from '@angular/common/http'
import { Observable, throwError, of } from 'rxjs'
import { ConfigurationsService, LoggerService } from '@ws-widget/utils'
import { catchError } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class AppInterceptorService implements HttpInterceptor {
  constructor(
    private configSvc: ConfigurationsService, // private http: HttpClient,
    private logger: LoggerService,
    @Inject(LOCALE_ID) private locale: string,
  ) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip interceptor for external CORS URLs (CloudFront, S3, etc)
    // These URLs should not have custom headers to avoid CORS preflight failures
    const isExternalUrl = req.url.startsWith('https://static.') ||
      req.url.startsWith('https://sunbirdcontent.s3') ||
      req.url.startsWith('https://') && !req.url.includes(window.location.hostname)

    if (isExternalUrl) {
      return next.handle(req)
    }

    // Skip auth headers for public/unauthenticated routes
    const isPublicPath = location.pathname.includes('/public') || location.pathname.includes('/app/create-account')
    if (isPublicPath || !this.configSvc.userProfile) {
      return next.handle(req).pipe(
        catchError((error: HttpErrorResponse) => {
          // For public pages, return empty response instead of throwing on auth errors
          if (isPublicPath && error.status === 419) {
            this.logger.warn('Public page received 419, returning empty response to allow page to load')
            return of(new HttpResponse({ status: 200, body: {} }))
          }
          return throwError(() => error)
        })
      )
    }

    if (req.url.endsWith('/api/course/v1/content/state/read') || req.url.endsWith("/apis/public/v8/mobileApp/v2/updateProgress")) {
      return next.handle(req)
    }

    // Add browser-like headers for JSON configuration requests to bypass Cloudflare/WAF blocks
    // Note: Sec-Fetch-* headers are forbidden and will be set by the browser automatically
    if (req.url.endsWith('.json')) {
      req = req.clone({
        setHeaders: {
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      })
    }

    const lang = [this.locale.replace('en-US', 'en')]
    if (this.configSvc.userPreference) {
      (this.configSvc.userPreference.selectedLangGroup || '')
        .split(',')
        .map(u => u.trim())
        .filter(u => u.length)
        .forEach(locale => {
          if (!lang.includes(locale)) {
            lang.push(locale)
          }
        })
    }

    if (this.configSvc.activeOrg && this.configSvc.rootOrg) {
      const modifiedReq = req.clone({
        setHeaders: {
          org: this.configSvc.activeOrg,
          rootOrg: this.configSvc.rootOrg,
          locale: 'en',
          wid: (this.configSvc.userProfile && this.configSvc.userProfile.userId) || '',
          hostPath: this.configSvc.hostPath,
          Authorization: '',
        },
      })

      // return next.handle(modifiedReq)
      return next.handle(modifiedReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error instanceof HttpErrorResponse) {
            this.logger.log(error.status, '/')
            if (error.status === 419) {
              // Session expired - don't redirect, let app handle gracefully
              this.logger.warn('Session expired (419), allowing error to propagate')
              return throwError(() => error)
            }
          }
          return throwError(() => error)
        })
      )
    }
    return next.handle(req)
  }
}
