import { Injectable, LOCALE_ID, Inject } from '@angular/core'
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http'
import { Observable, throwError, timer } from 'rxjs'
import { ConfigurationsService } from '@ws-widget/utils'
import { catchError, retryWhen, mergeMap } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class AppInterceptorService implements HttpInterceptor {
  constructor(
    private configSvc: ConfigurationsService,
    @Inject(LOCALE_ID) private locale: string,
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.endsWith('/api/course/v1/content/state/read') || req.url.endsWith("/apis/public/v8/mobileApp/v2/updateProgress")) {
      return next.handle(req)
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
      // Extract token from localStorage
      let token: string | null = null
      try {
        const loginDetails = localStorage.getItem('loginDetailsWithToken')
        if (loginDetails) {
          const parsedDetails = JSON.parse(loginDetails)
          // Extract access_token from token object
          if (parsedDetails.token && typeof parsedDetails.token === 'object') {
            token = parsedDetails.token.access_token || null
          } else if (typeof parsedDetails.token === 'string') {
            token = parsedDetails.token
          }
        }
      } catch (e) {
        console.warn('Error extracting token from localStorage:', e)
      }

      const headersObj: any = {
        org: this.configSvc.activeOrg,
        rootOrg: this.configSvc.rootOrg,
        locale: 'en',
        wid: (this.configSvc.userProfile && this.configSvc.userProfile.userId) || '',
        hostPath: this.configSvc.hostPath,
      }

      // Add Authorization header with token if available
      if (token) {
        headersObj['Authorization'] = `Bearer ${token}`
        console.log('✅ Adding Authorization header with JWT token')
      }

      const modifiedReq = req.clone({
        setHeaders: headersObj,
        withCredentials: true,  // Allow cookies to be sent with the request
      })

      console.log('📤 Request to:', modifiedReq.url)
      console.log('📤 Headers sent:', modifiedReq.headers.keys())
      console.log('📤 With credentials:', modifiedReq.withCredentials)

      return next.handle(modifiedReq).pipe(
        retryWhen(errors =>
          errors.pipe(
            mergeMap((error, index) => {
              // Only retry on 419 for the specific user read API endpoint
              if (error instanceof HttpErrorResponse &&
                error.status === 419 &&
                error.url?.includes('/api/user/v2/read')) {
                const retryCount = index + 1
                const delayMs = Math.min(1000 * Math.pow(2, retryCount), 5000) // Exponential backoff: 2s, 4s, 5s max

                if (retryCount <= 3) {
                  console.warn(`⏳ 419 Error on user read API - Retrying in ${delayMs}ms (attempt ${retryCount}/3)`)
                  return timer(delayMs)
                } else {
                  console.error('❌ 419 Error - Max retries exceeded')
                  return throwError(error)
                }
              }
              // Don't retry other errors or other endpoints
              return throwError(error)
            })
          )
        ),
        catchError((error: { status: any; error: { redirectUrl: string } }) => {
          if (error instanceof HttpErrorResponse) {
            console.log(error.status, '/', error.url)
            switch (error.status) {
              case 419: // login
                if (location.pathname.indexOf('/public') >= 0) {
                  break
                }
            }
          }
          return throwError(error)
        })
      )
    }
    return next.handle(req)
  }
}

