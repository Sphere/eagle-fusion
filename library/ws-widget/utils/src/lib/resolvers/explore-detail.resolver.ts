import { Injectable } from '@angular/core'
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { Observable, of } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { map, catchError } from 'rxjs/operators'
import { IResolveResponse } from '@ws-widget/utils'
import { UtilityService } from '../services/utility.service'
import { ConfigurationsService } from '../services/configurations.service'

@Injectable({
  providedIn: 'root',
})
export class ExploreDetailResolve
  implements
  Resolve<
  | Observable<IResolveResponse<any>>
  | IResolveResponse<any>
  > {
  private baseUrl = this.configSvc.sitePath
  isIntranetAllowedSettings = false
  constructor(
    private http: HttpClient,
    private configSvc: ConfigurationsService,
    private utilitySvc: UtilityService,
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
      map(pageData => ({ data: this.transformPageData(pageData, tag), error: null })),
      catchError(err => of({ data: null, error: err })),
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
