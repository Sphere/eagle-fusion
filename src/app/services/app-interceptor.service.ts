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
          locale: lang.join(','),
          wid: (this.configSvc.userProfile && this.configSvc.userProfile.userId) || '',
          hostPath: this.configSvc.hostPath,
          Authorization: '',
        },
      })

      // return next.handle(modifiedReq)
      return next.handle(modifiedReq).pipe(
        catchError((error: { status: any; error: { redirectUrl: string } }) => {
          if (error instanceof HttpErrorResponse) {
            switch (error.status) {
              case 419: // login
                const localUrl = location.origin
                sessionStorage.setItem('login_url', error.error.redirectUrl + `?q=${localUrl}`)
                if (location.pathname.indexOf('/public') >= 0) {
                  // this.http.get('/apis/reset')
                  break
                }

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
          return throwError('error')
        })
      )
    }
    return next.handle(req)
  }
}
