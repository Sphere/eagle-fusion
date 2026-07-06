import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { Observable, of, throwError, timer } from 'rxjs'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { map, catchError, retryWhen, timeout, mergeMap } from 'rxjs/operators'
import { IResolveResponse } from '@ws-widget/utils'
import { UtilityService } from '../services/utility.service'
import { ConfigurationsService } from '../services/configurations.service'

@Injectable({
  providedIn: 'root',
})
export class ExploreDetailResolve {
  private baseUrl = this.configSvc.sitePath
  isIntranetAllowedSettings = false
  constructor(
    private http: HttpClient,
    private configSvc: ConfigurationsService,
    private utilitySvc: UtilityService
  ) { }

  resolve(
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<IResolveResponse<any>> {
    this.isIntranetAllowedSettings = this.configSvc.isIntranetAllowed
    const tag = decodeURIComponent(route.params.tags)
    let url = ''
    if (route.data.pageUrl) {
      url = route.data.pageUrl
    }
    if (route.data.pageType === 'page' && route.data.pageKey) {
      url = `${this.baseUrl}/page/${route.data.pageKey}.json`
    }
    return this.http.get(url).pipe(
      // Add timeout of 15 seconds to prevent hanging requests
      timeout(15000),
      // Retry up to 2 times on transient errors (network glitches)
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, retryCount) => {
            // Only retry on network errors or 5xx errors, not 404s or 403s
            if (error instanceof HttpErrorResponse) {
              if (error.status === 0 || (error.status >= 500 && error.status < 600)) {
                const delay = Math.min(1000 * Math.pow(2, retryCount), 5000)
                console.warn(`[RETRY ${retryCount + 1}] HTTP ${error.status || 'Network Error'}, retrying in ${delay}ms...`)
                if (retryCount < 2) {
                  return timer(delay)
                }
              }
            }
            // Don't retry on client errors (4xx) or after max retries
            return throwError(error)
          })
        )
      ),
      map(pageData => ({ data: this.transformPageData(pageData, tag), error: null })),
      catchError(err => {
        // Distinguish between different error types
        let errorType = 'NetworkError'

        if (err instanceof HttpErrorResponse) {
          if (err.status === 404) {
            errorType = 'NotFound'
          } else if (err.status === 403) {
            errorType = 'Forbidden'
          } else if (err.status >= 500) {
            errorType = 'ServerError'
          } else if (err.status === 0) {
            // Status 0 indicates network error or CORS issue
            errorType = 'NetworkError'
          } else if (err.status >= 400) {
            errorType = 'ClientError'
          }
        }

        return of({
          data: null,
          error: {
            type: errorType,
            status: err instanceof HttpErrorResponse ? err.status : 0,
            message: err instanceof HttpErrorResponse ? err.message : 'Unknown error',
            original: err,
          },
        })
      }),
    )
  }

  private transformPageData(pageData: any, tag: string) {
    const DELIMITER = '>'
    const path = tag.split(DELIMITER)
    pageData.pageLayout.widgetData.widgets = pageData.pageLayout.widgetData.widgets.map((widget: any) => {
      if (pageData.navigationBar && pageData.navigationBar.links) {
        pageData.navigationBar.links = pageData.navigationBar.links
          .filter((link: any) => link.widgetData.tags === tag)
      }

      if (widget.widgetSubType === 'cardBreadcrumb') {
        widget.widgetData.path = [{
          text: pageData.navigationBar.pageTitle,
          clickUrl: pageData.navigationBar.pageBackLink,
        }].concat(path.map((edge: string, idx: number) => ({
          text: edge,
          clickUrl: `/page/explore/${path.slice(0, idx + 1).join(DELIMITER)}`,
        })))
      }

      if (widget.widgetSubType === 'contentStripMultiple') {
        widget.widgetData.strips = widget.widgetData.strips.map((strip: any) => {
          strip.request.searchV6.filters[0].andFilters.push({ catalogPaths: [tag] })
          if (this.utilitySvc.isMobile && !this.isIntranetAllowedSettings) {
            strip.request.searchV6.filters[0].andFilters.push({ isInIntranet: ['false'] })
          }
          return strip
        })
        if (widget.widgetData.noDataWidget && widget.widgetData.noDataWidget.widgetData.strips) {
          widget.widgetData.noDataWidget.widgetData.strips = widget.widgetData.noDataWidget.widgetData.strips.map((strip: any) => {
            strip.request.searchV6.filters[0].andFilters.push({ catalogPaths: [tag] })
            if (this.utilitySvc.isMobile && !this.isIntranetAllowedSettings) {
              strip.request.searchV6.filters[0].andFilters.push({ isInIntranet: ['false'] })
            }
            return strip
          })
        }

      }
      return widget
    })

    return pageData
  }
}
