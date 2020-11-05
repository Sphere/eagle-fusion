import { HttpClient } from '@angular/common/http'
import { Inject, Injectable, LOCALE_ID } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve } from '@angular/router'
import { forkJoin, Observable, of } from 'rxjs'
import { catchError, map, mergeMap } from 'rxjs/operators'
import { ConfigurationsService } from '../services/configurations.service'
import { JSON_MAP } from './page.constant'
import { NsPage } from './page.model'
import { IResolveResponse } from './resolver.model'
import { NsContent } from '../../../../collection/src/lib/_services/widget-content.model'

@Injectable({
  providedIn: 'root',
})
export class PageResolve implements Resolve<IResolveResponse<NsPage.IPage>> {
  private baseUrl = this.configSvc.sitePath
  constructor(
    private configSvc: ConfigurationsService,
    private http: HttpClient,
    @Inject(LOCALE_ID) private locale: string,
  ) { }
  resolve(
    route: ActivatedRouteSnapshot,
  ): Observable<IResolveResponse<NsPage.IPage>> | IResolveResponse<NsPage.IPage> {
    if (route.data.pageUrl) {
      return this.getData(route.data.pageUrl)
    }
    if (route.data.pageType === 'feature' && route.data.pageKey) {
      return this.getData(`${this.baseUrl}/feature/${route.data.pageKey}`)
    }
    if (
      route.data.pageType === 'page' &&
      route.data.pageKey &&
      route.paramMap.has(route.data.pageKey)
    ) {
      return this.getData(`${this.baseUrl}/page/${route.paramMap.get(route.data.pageKey)}`)
    }
    if (
      route.data.pageType === 'page' &&
      route.data.pageKey &&
      route.data.pageKey === 'toc'
    ) {
      return this.getData(`${this.baseUrl}/page/${route.data.pageKey}`)
    }
    return {
      data: null,
      error: 'CONFIGURATION_ERROR_PAGE_URL_NOT_FORMED',
    }
  }

  private setS3Cookie(contentId: string): Observable<any> {
    return this.http.post(`/apis/protected/v8/content/setCookie`, { contentId }).pipe(
      catchError(_err => of(true)),
    )
  }

  private getContent(id: string) {
    return this.http
      .post<NsContent.IContent>(
        `/apis/protected/v8/content/${id}?hierarchyType=minimal`,
        ['status', 'artifactUrl'],
      )
  }

  private getData(url: string) {
    const id = (url.split('/').pop() as string).split('.')[0] || ''
    const equivalentId = id.startsWith('lex_auth_') ? id : JSON_MAP[id]
    if (equivalentId) {
      return forkJoin([this.setS3Cookie(equivalentId), this.getContent(equivalentId)]).pipe(
        mergeMap(([_, v]) => {
          if (v.status === 'Expired' || v.status === 'Deleted' || !v.artifactUrl) {
            return of({ data: null, error: 'NoContent' })
          }
          return this.http
            .get<NsPage.IPage>(`${v.artifactUrl}?ts=${new Date().getTime()}`)
            .pipe(
              map(data => ({ data, error: null })),
              catchError(err => of({ data: null, error: err })),
            )
        }),
        catchError(err => of({ data: null, error: err })),
      )
    }
    const pageRequest = [
      (equivalentId ? this.setS3Cookie(equivalentId) : of(true)).pipe(
        mergeMap(() =>
          this.http.get<NsPage.IPage>(`${url}.json`).pipe(
            map(data => ({ data, error: null })),
            catchError(err => of({ data: null, error: err })),
          ),
        ),
      ),
      this.locale === 'en' || this.locale === 'en-US' ?
        of({ data: undefined as any, error: null }) :
        this.http.get<NsPage.IPage>(`${url}.${this.locale}.json`).pipe(
          map(data => ({ data, error: null })),
          catchError(err => of({ data: null, error: err })),
        ),
    ]
    return forkJoin(pageRequest).pipe(
      map(
        ([general, withLocale]): IResolveResponse<NsPage.IPage> => {
          if (withLocale.data) {
            return withLocale
          }
          return general
        },
      ),
    )
  }

}
