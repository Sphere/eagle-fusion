import { map, catchError } from 'rxjs/operators'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, of, BehaviorSubject } from 'rxjs'
import { ConfigurationsService } from '@ws-widget/utils'
// import { environment } from './../../../../../../../src/environments/environment'

// let instanceConfigPath: string | null = window.location.host

// if (!environment.production && Boolean(environment.sitePath)) {
//   instanceConfigPath = environment.sitePath
// }
const API_END_POINTS = {
  // SEARCH_V6PUBLIC: '/apis/public/v8/publicContent/v1/search',
  SEARCH_V6PUBLIC: '/apis/public/v8/ratingsSearch/getCourses',
  KEYCLOAK_COOKIE: '/apis/public/v8/emailMobile/authv2',
  Sashakt_Auth: '/apis/public/v8/sashaktAuth/login',
  Maternity_Auth: '/apis/public/v8/maternityFoundation/login',
  ENROLLED_USER: 'apis/protected/v8/userEnrolledInSource',
  Tnai_Auth: '/apis/public/v8/tnai/login',
  Tnnmc_Auth: '/apis/public/v8/tnnmc/login',
}
@Injectable({
  providedIn: 'root',
})
export class OrgServiceService {
  hideHeaderFooter = new BehaviorSubject<boolean>(false)
  sitePath = `assets/configurations/`

  constructor(private http: HttpClient, private configSvc: ConfigurationsService) { }

  resolve(): Observable<any> {
    return this.getOrgMetadata().pipe(
      map((data: any) => ({ data, error: null })),
      catchError((error: any) => of({ error, data: null })),
    )
  }

  getOrgMetadata() {
    const orgMeta = this.http.get(`${this.sitePath}/orgmeta.config.json`)
    return orgMeta
  }

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
    const req = {
      request: {
        filters: {
          primaryCategory: ['Course'],
          contentType: ['Course'],
          identifier: identifiers,

          status: ['Live'],
          lang,
        },
      }, query: '', sort: [{ lastUpdatedOn: 'desc' }],
    }
    return this.http.post<any>(API_END_POINTS.SEARCH_V6PUBLIC, req)
  }
  setSashaktId(token: any, id: any): Observable<any> {
    return this.http.get<any>(`${API_END_POINTS.Sashakt_Auth}?token=${token}&moduleId=${id}`)
  }
  setMaternyId(data: any): Observable<any> {
    console.log(data)
    return this.http.post<any>(`${API_END_POINTS.Maternity_Auth}`, data)
  }
  setTnaiToken(data: any): Observable<any> {
    console.log(data)
    return this.http.post<any>(`${API_END_POINTS.Tnai_Auth}`, data)
  }
  setTnnmcToken(data: any): Observable<any> {
    console.log(data)
    return this.http.post<any>(`${API_END_POINTS.Tnnmc_Auth}`, data)
  }
  setConnectSid(authCode: any): Observable<any> {
    return this.http.post<any>(`${API_END_POINTS.KEYCLOAK_COOKIE}/endpoint?keycloak=true&code=${authCode}`, {})

  }
}
