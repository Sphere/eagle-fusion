import { Injectable } from '@angular/core'
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http'
import { Observable, throwError, timer } from 'rxjs'
import { retry } from 'rxjs/operators'

/**
 * Retries a request that failed with a gateway-type error (status above 500: 502, 503, 504)
 * a limited number of times, with a short backoff.
 *
 * It used to retry without limit at 5s, 10s, 15s ..., so one unavailable upstream could
 * leave a page (and any resolver waiting on it) loading for minutes. Now a request gets at
 * most MAX_RETRIES extra attempts and then fails, so the caller's error handling runs.
 * Plain 500s are still not retried, and `body.excludeRetry` still opts a request out.
 */
@Injectable({
  providedIn: 'root',
})
export class AppRetryInterceptorService implements HttpInterceptor {
  static readonly MAX_RETRIES = 2
  /** Delay before each retry, in ms: 0.5s, then 1.5s. */
  static readonly BACKOFF_MS = [500, 1500]

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.body && req.body.excludeRetry) {
      return next.handle(req)
    }
    return next.handle(req).pipe(
      retry({
        count: AppRetryInterceptorService.MAX_RETRIES,
        delay: (error: HttpErrorResponse, retryCount: number) => {
          if (!this.shouldRetry(error)) {
            return throwError(() => error)
          }
          const backoff = AppRetryInterceptorService.BACKOFF_MS
          return timer(backoff[Math.min(retryCount, backoff.length) - 1])
        },
      }),
    )
  }

  private readonly shouldRetry = (error: HttpErrorResponse) => error.status > 500
}
