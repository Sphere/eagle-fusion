import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { TFetchStatus } from '@ws-widget/utils'
import { ReplaySubject, Observable, from } from 'rxjs'
import { NsAnalytics } from '../../../../app-toc/models/app-toc-analytics.model'
import { WidgetContentService } from '@ws-widget/collection'
import { map } from 'rxjs/operators'

const PROTECTED_SLAG_V8 = '/apis/protected/v8'

const API_SERVER_BASE = '/apis'

const PROXIES_SLAG_V8 = `${API_SERVER_BASE}/proxies/v8`

const API_END_POINTS = {
  NAVIGATOR_LP: `${PROTECTED_SLAG_V8}/navigator/lp`,
  NAVIGATOR_FS: `${PROTECTED_SLAG_V8}/navigator/fp`,
  NAVIGATOR_ROLES: `${PROTECTED_SLAG_V8}/navigator/roles`,
  NAVIGATOR_ROLE: `${PROTECTED_SLAG_V8}/navigator/role`,
  NAVIGATOR_SUGGESTIONS: `${PROTECTED_SLAG_V8}/navigator/topics`,
  NAVIGATOR_COMMONS_DATA: `${PROXIES_SLAG_V8}/web-hosted/navigator/json/commonsdata.json`,
  NAVIGATOR_LP_DATA: `${PROXIES_SLAG_V8}/web-hosted/navigator/json/data.json`,
  NAVIGATOR_ROLES_DATA: `${PROXIES_SLAG_V8}/web-hosted/navigator/json/nsodata.json`,
  NAVIGATOR_BPM_DATA: `${PROTECTED_SLAG_V8}/navigator/bpm`,
}

@Injectable({
  providedIn: 'root',
})
export class NavigatorService {
  analyticsFetchStatus: TFetchStatus = 'none'
  private analyticsReplaySubject: ReplaySubject<any> = new ReplaySubject(0)
  constructor(private http: HttpClient, private contentSvc: WidgetContentService) { }

  fetchLearningPathData(): Observable<any> {
    return this.http.get(`${API_END_POINTS.NAVIGATOR_LP}`)
  }

  fetchFullStackData(): Observable<any> {
    return this.http.get(`${API_END_POINTS.NAVIGATOR_FS}`)
  }
  fetchNavigatorRoles(): Observable<any> {
    return this.http.get(`${API_END_POINTS.NAVIGATOR_ROLES}`)
  }
  fetchNavigatorTopics(): Observable<any> {
    return this.http.get(`${API_END_POINTS.NAVIGATOR_LP_DATA}`).pipe(
      map((data: any) => {
        const topics = new Set()
        data.lp_data.forEach((lp: any) => {
          lp.profiles.forEach((profile: any) => {
            profile.technology.forEach((technology: string) => {
              topics.add(technology.trim())
            })
          })
        })
        return Array.from(topics)
      })
    )
  }

  fetchCommonsData(): Observable<any> {
    return this.http.get(`${API_END_POINTS.NAVIGATOR_COMMONS_DATA}`)
  }

  fetchRolesVariantData(roleId: string, variantId: string): Observable<any> {
    return this.http.get(`${API_END_POINTS.NAVIGATOR_ROLE}/${roleId}/${variantId}`)
  }

  fetchLearningPathIdData(lpId: string): Observable<any> {
    return this.http.get(`${API_END_POINTS.NAVIGATOR_LP}/${lpId}`)
  }

  fetchBpmData(): Observable<any> {
    return this.http.get(`${API_END_POINTS.NAVIGATOR_BPM_DATA}`)
  }

  fetchContentAnalyticsData(tagName: string) {
    if (this.analyticsFetchStatus !== 'fetching' && this.analyticsFetchStatus !== 'done') {
      this.getContentAnalytics(tagName)
    }
    return this.analyticsReplaySubject
  }
  getContentAnalytics(tagName: string): Observable<NsAnalytics.IAnalyticsResponse> {
    this.analyticsFetchStatus = 'fetching'
    // tslint:disable-next-line: max-line-length
    const url = `${PROXIES_SLAG_V8}/LA/LA/api/participants?aggsSize=1000&endDate=${this.endDate}&startDate=${this.startDate}&from=0&refinementfilter=${encodeURIComponent('"source":["Wingspan","Learning Hub"]')}$${encodeURIComponent(`"topics": ["${tagName}"]`)}`
    // this.http
    //   .get(url)
    //   .subscribe(
    //     result => {
    //       this.analyticsFetchStatus = 'done'
    //       this.analyticsReplaySubject.next(result)
    //     },
    //     () => {
    //       this.analyticsReplaySubject.next(null)
    //       this.analyticsFetchStatus = 'done'
    //     },
    // )
    return this.http.get<NsAnalytics.IAnalyticsResponse>(url)
  }

  fetchImageForContentID(contentId: string): Observable<any> {
    if (contentId) {
      const ids: string[] = []
      ids.push(contentId)
      return this.contentSvc.fetchMultipleContent(ids)
    }
    return from([''])

  }

  fetchImageForContentIDs(contentIds: string[]): Observable<any> {
    return this.contentSvc.fetchMultipleContent(contentIds)
  }

  private get endDate() {
    return `${new Date().getFullYear()}-${`0${new Date().getMonth() + 1}`.slice(-2)}-${`0${new Date().getDate()}`.slice(-2)}`
  }
  private get startDate() {
    return `2018-04-01`
  }
}
