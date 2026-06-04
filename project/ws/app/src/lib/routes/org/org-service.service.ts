// import { map, catchError } from 'rxjs/operators'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, BehaviorSubject } from 'rxjs'
import { shareReplay } from 'rxjs/operators'
import { ConfigurationsService, LoggerService } from '@ws-widget/utils'
import { API_END_POINTS } from '../../../../../../../src/app/constants/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class OrgServiceService {
  hideHeaderFooter = new BehaviorSubject<boolean>(false)
  sitePath = `assets/configurations/`
  private orgConfigCache$: Observable<any> | null = null
  private orgConfigCachedAt = 0
  private readonly ORG_CONFIG_TTL_MS = 5 * 60 * 1000 // 5 minutes

  constructor(private http: HttpClient, private configSvc: ConfigurationsService, private logger: LoggerService) { }

  getOrgConfig(): Observable<any> {
    const now = Date.now()
    if (!this.orgConfigCache$ || (now - this.orgConfigCachedAt) > this.ORG_CONFIG_TTL_MS) {
      const body = {
        request: {
          type: 'org_config',
          subtype: '*',
          action: 'get',
          component: 'web',
          framework: '*',
          rootOrgId: '*',
        },
      }
      this.orgConfigCache$ = this.http.post<any>(API_END_POINTS.FORM_READ, body).pipe(
        shareReplay(1)
      )
      this.orgConfigCachedAt = now
    }
    return this.orgConfigCache$
  }

  resolve(): any {
    // return this.getOrgMetadata().pipe(
    //   map((data: any) => ({ data, error: null })),
    //   catchError((error: any) => of({ error, data: null })),
    // )
  }

  // getOrgMetadata() {
  //   const orgMeta = this.http.get(`${this.sitePath}/orgmeta.config.json`)
  //   return orgMeta
  // }

  getSearchResults(source?: any): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const req = {
      request: {
        filters: {
          primaryCategory: ['Course'], contentType: ['Course'], status: [
            'Live',
          ],
          sourceName: source,
        },
      }, query: '', sort: [{ lastUpdatedOn: 'desc' }],
    }
    return this.http.post<any>(API_END_POINTS.SEARCH_V6PUBLIC, req)
  }
  getSearchV7Results(source?: any): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const req = {
      request: {
        filters: {
          primaryCategory: ['Course'], contentType: ['Course'], status: [
            'Live',
          ],
          sourceName: source,
        },
      }, query: '', sort: [{ lastUpdatedOn: 'desc' }],
    }
    return this.http.post<any>(API_END_POINTS.SEARCH_V7PUBLIC, req)
  }
  getSearchResultsById(identifier?: any): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const req = {
      request: {
        filters: {
          primaryCategory: ['Course'], contentType: ['Course'], status: [
            'Live',
          ],
          identifier,
        },
      }, query: '', sort: [{ lastUpdatedOn: 'desc' }],
    }
    return this.http.post<any>(API_END_POINTS.SEARCH_V6PUBLIC, req)
  }
  getSearchResultsV7ById(identifier?: any): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const req = {
      request: {
        filters: {
          primaryCategory: ['Course'], contentType: ['Course'], status: [
            'Live',
          ],
          identifier,
        },
      }, query: '', sort: [{ lastUpdatedOn: 'desc' }],
    }
    return this.http.post<any>(API_END_POINTS.SEARCH_V7PUBLIC, req)
  }

  getDatabyOrgId(): Promise<any> {
    const url = `${this.configSvc.sitePath}/page/course.json`
    return this.http.get<any>(`${url}`).toPromise()
  }
  getEnroledUserForCourses(sourceName: any): Observable<any> {
    return this.http.get<any>(`${API_END_POINTS.ENROLLED_USER}?sourceName=${sourceName}`)
  }

  getLiveSearchResults(lang?: any): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const req = {
      request: {
        filters: {
          primaryCategory: ['Course'],
          contentType: ['Course'],
          status: ['Live'],
          lang,
        },
      }, query: '', sort: [{ lastUpdatedOn: 'desc' }],
    }
    return this.http.post<any>(API_END_POINTS.SEARCH_V6PUBLIC, req)
  }
  getTopLiveSearchResults(identifiers: any, lang?: any): Observable<any> {
    // tslint:disable-next-line:max-line-length
    this.logger.log('lang ', lang)
    const req = {
      request: {
        filters: {
          primaryCategory: ['Course'],
          contentType: ['Course'],
          identifier: identifiers,

          status: ['Live'],
        },
      }, query: '', sort: [{ lastUpdatedOn: 'desc' }],
    }
    return this.http.post<any>(API_END_POINTS.SEARCH_V6PUBLIC, req)
  }
  setSashaktId(token: any, id: any): Observable<any> {
    return this.http.get<any>(`${API_END_POINTS.Sashakt_Auth}?token=${token}&moduleId=${id}`)
  }
  setMaternyId(data: any): Observable<any> {
    this.logger.log(data)
    return this.http.post<any>(`${API_END_POINTS.Maternity_Auth}`, data)
  }
  setMNCId(data: any): Observable<any> {
    this.logger.log(data)
    return this.http.post<any>(`${API_END_POINTS.MNC_Auth}`, data)
  }
  setTnaiToken(data: any): Observable<any> {
    this.logger.log(data)
    return this.http.post<any>(`${API_END_POINTS.Tnai_Auth}`, data)
  }
  setTnnmcToken(data: any): Observable<any> {
    this.logger.log(data)
    return this.http.post<any>(`${API_END_POINTS.Tnnmc_Auth}`, data)
  }
  setConnectSid(authCode: any): Observable<any> {
    return this.http.post<any>(`${API_END_POINTS.KEYCLOAK_COOKIE}/endpoint?keycloak=true&code=${authCode}`, {})

  }
}
