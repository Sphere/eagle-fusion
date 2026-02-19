import { Injectable, LOCALE_ID, Inject } from '@angular/core'
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http'
import { Observable, throwError } from 'rxjs'
import { ConfigurationsService } from '@ws-widget/utils'
import { catchError } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class AppInterceptorService implements HttpInterceptor {
  constructor(
    private configSvc: ConfigurationsService, // private http: HttpClient,
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
    if (req.url.endsWith('/api/course/v1/content/state/read') || req.url.endsWith("/apis/public/v8/mobileApp/v2/updateProgress")) {
      return next.handle(req)
    }

    // Add browser-like headers for JSON configuration requests to bypass Cloudflare/WAF blocks
    if (req.url.endsWith('.json')) {
      req = req.clone({
        setHeaders: {
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
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
        catchError((error: { status: any; error: { redirectUrl: string } }) => {
          if (error instanceof HttpErrorResponse) {
            console.log(error.status, '/')
            switch (error.status) {
              case 419: // login
                // const localUrl = location.origin
                // tslint:disable-next-line: prefer-template
                // Now we commenting this one, Later now we will remove it
                // localStorage.setItem('login_url', error.error.redirectUrl)
                if (location.pathname.indexOf('/public') >= 0) {
                  // this.http.get('/apis/reset')
                  break
                }
              //location.href = '/public/home'
              // const localUrl = location.origin
              // const pageName = '/public/home'
              // if (localUrl.includes('localhost')) {
              //   // tslint:disable-next-line: prefer-template
              //   window.location.href = error.error.redirectUrl + `?q=${localUrl}${pageName}`
              // } else {
              //   // tslint:disable-next-line: prefer-template
              //   window.location.href = error.error.redirectUrl + `?q=${pageName}`
              // }
              // break
            }
          }
          // return throwError('error')
          return throwError(error)
        })
      )
    }
    return next.handle(req)
  }
}
