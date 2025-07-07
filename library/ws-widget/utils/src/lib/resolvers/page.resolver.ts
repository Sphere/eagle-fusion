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
import { FormConfigService } from '../services/form-config.service'
import { FormConfigs } from '../constants/formConstant.enum'
@Injectable({
  providedIn: 'root',
})

export class PageResolve implements Resolve<IResolveResponse<NsPage.IPage>> {
  isEkshamata = false
  private baseUrl = this.configSvc.sitePath
  constructor(
    private configSvc: ConfigurationsService,
    private http: HttpClient,
    @Inject(LOCALE_ID) private locale: string,
    private formConfig: FormConfigService

  ) { }
  resolve(
    route: ActivatedRouteSnapshot,
  ): Observable<IResolveResponse<NsPage.IPage>> | IResolveResponse<NsPage.IPage> {
    if (route.data.pageUrl) {
      return this.getData(route.data.pageUrl)
    }
    this.readFormConfig()
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
      route.data.pageType === 'public' &&
      route.data.pageKey) {
      return this.getData(`${this.baseUrl}/page/public-home`)
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
  async readFormConfig() {
    let type = this.configSvc.userProfile ? 'private' : 'public'
    let layout
    if (type == 'private') {
      layout = this.formConfig.getValue('formType')
      if (!layout) {
        console.log("user profile data  app component ************ ", this.configSvc.userProfile)
        await this.formConfig.readFormUIConfig(this.configSvc.userProfile)
        layout = this.formConfig.getValue('formType')
        console.log("layout name again ", layout)
      }
      console.log("layout name ", layout)
    }
    let newUI = layout == 'competency_ekshamata' ? true : false
    let domain = window.location.hostname
    if (domain.includes('ekshamata')) {
      this.isEkshamata = true
    }
    let data = {
      request: !this.isEkshamata ?
        (type == 'public' ? FormConfigs.public_sphere : FormConfigs.default_sphere) :
        (type == 'public' ? FormConfigs.public_ekshamata : (newUI ? FormConfigs.competency_ekshamata : FormConfigs.default_ekshamata))
    }
    await this.formConfig.getFormConfig(data, type).then((res: any) => {
      console.log("******* app component oninit config " + type, res)
    }).catch(err => {
      console.log("******* error on app component oninit config " + type, err)
    })
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

    // tslint:disable-next-line: no-non-null-assertion
    if (this.configSvc.userProfile && this.configSvc.userProfile!.language) {
      // tslint:disable-next-line: no-non-null-assertion
      this.locale = this.configSvc.userProfile!.language
    } else {
      this.locale = 'en'
    }

    if (location.href.indexOf('hi/public/home') > -1) {
      this.locale = 'hi'
    }

    if (location.href.indexOf('hi/page/home') > -1) {
      this.locale = 'hi'
    }

    // tslint:disable-next-line: no-non-null-assertion
    // if (this.configSvc.userProfile && url.indexOf('public-home') <= -1) {
    //   // tslint:disable-next-line: no-non-null-assertion
    //   this.locale = this.configSvc.userProfile!.language || 'en-US'
    // }
    // if (localStorage.getItem('lang')) {
    //   // tslint:disable-next-line: no-non-null-assertion
    //   this.locale = localStorage.getItem('lang') || ''
    // }
    // tslint:disable-next-line: no-non-null-assertion
    // if (!localStorage.getItem('lang') && this.configSvc.userProfile !== null) {
    //   // tslint:disable-next-line: no-non-null-assertion
    //   if (this.configSvc.userProfile!.language === 'en') {
    //     // this.locale = 'en-US'
    //   } else {
    //     // tslint:disable-next-line: no-non-null-assertion
    //     this.locale = this.configSvc.userProfile!.language || 'en-US'
    //   }
    // }
    // tslint:disable-next-line:no-console
    // console.log(this.locale, url)
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
