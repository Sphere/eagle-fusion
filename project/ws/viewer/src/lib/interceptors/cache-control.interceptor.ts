import { Injectable } from '@angular/core'
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

/**
 * HTTP Interceptor to add cache control headers
 * Enables 3rd layer caching at HTTP/Browser level
 */
@Injectable()
export class CacheControlInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Only apply caching to course hierarchy API calls
    if (!req.url.includes('/hierarchy/')) {
      return next.handle(req)
    }

    // Add cache control headers for better browser caching
    const cachedReq = req.clone({
      setHeaders: {
        'Cache-Control': 'public, max-age=43200, must-revalidate', // 12 hours
      },
    })

    return next.handle(cachedReq).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          // Add cache metadata to response for debugging
          console.log(
            `[HTTP-Cache] Response for ${req.url}`,
            {
              status: event.status,
              cacheControl: event.headers.get('cache-control'),
              etag: event.headers.get('etag'),
            }
          )
        }
      })
    )
  }
}
