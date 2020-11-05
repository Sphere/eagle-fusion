import { Injectable } from '@angular/core'
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http'
import { Observable, throwError, timer } from 'rxjs'
import { retryWhen, mergeMap } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class AppRetryInterceptorService implements HttpInterceptor {
  private maxAttempts = 1
  private scalingDuration = 5000
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.body && req.body.excludeRetry) {
      return next.handle(req)
    }
    return next.handle(req).pipe(retryWhen(this.genericRetryStrategy()))
  }

  private shouldRetry = (error: HttpErrorResponse) => error.status > 499

  private genericRetryStrategy = () => (attempts: Observable<any>) =>
    attempts.pipe(
      mergeMap((error: HttpErrorResponse, i: number) => {
        const retryAttempt = i + 1
        // if maximum number of retries have been met
        // or response is a status code we don't wish to retry, throw error
        if (retryAttempt > this.maxAttempts || !this.shouldRetry(error)) {
          return throwError(error)
        }
        // retry after 1s, 2s, etc...
        return timer(retryAttempt * this.scalingDuration)
      }),
    )
}
