import { map, catchError } from 'rxjs/operators'
import { Injectable } from '@angular/core'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Observable, of, BehaviorSubject, throwError } from 'rxjs'
import { ConfigurationsService } from '@ws-widget/utils'
import { NsContent } from '../../library/ws-widget/collection/src/public-api'
// import { environment } from './../../../../../../../src/environments/environment'

// let instanceConfigPath: string | null = window.location.host

// if (!environment.production && Boolean(environment.sitePath)) {
//   instanceConfigPath = environment.sitePath
// }

const PROTECTED_SLAG_V8 = '/apis/protected/v8'

const API_END_POINTS = {
  FETCH_USER_GROUPS: (userId: string) =>
    `${PROTECTED_SLAG_V8}/user/group/fetchUserGroup?userId=${userId}`,
  FETCH_USER_ENROLLMENT_LIST: (userId: string | undefined) =>
    // tslint:disable-next-line: max-line-length
    `/apis/proxies/v8/learner/course/v1/user/enrollment/list/${userId}?orgdetails=orgName,email&licenseDetails=name,description,url&fields=contentType,topic,name,channel,mimeType,appIcon,gradeLevel,resourceType,identifier,medium,pkgVersion,thumbnail,board,subject,trackable,posterImage,duration,creatorLogo,license&batchDetails=name,endDate,startDate,status,enrollmentType,createdBy,certificates`,
  // SEARCH_V6PUBLIC: '/apis/public/v8/publicContent/v1/search',
  SEARCH_V6PUBLIC: '/apis/public/v8/publicSearch/getCourses',
  KEYCLOAK_COOKIE: '/apis/public/v8/emailMobile/authv2',
  PUBLIC_TELEMETRY: '/apis/public/v8/publicTelemetry',

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

  getSearchResults(): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const req = { request: { filters: { primaryCategory: ['Course'], contentType: ['Course'], sourceName: 'Ministry of Health and Family Welfare' } }, query: '', sort: [{ lastUpdatedOn: 'desc' }] }
    return this.http.post<any>(API_END_POINTS.SEARCH_V6PUBLIC, req)
  }
  postPublicTelemetry(data: any): Observable<any> {
    // tslint:disable-next-line:max-line-length
    return this.http.post<any>(API_END_POINTS.PUBLIC_TELEMETRY, data)
  }


  getDatabyOrgId(): Promise<any> {
    const url = `${this.configSvc.sitePath}/page/course.json`
    return this.http.get<any>(`${url}`).toPromise()
  }

  getLiveSearchResults(language: string): Observable<any> {
    // tslint:disable-next-line:max-line-length
    let req
    if (language) {
      req = {
        request: {
          filters: {
            primaryCategory: ['Course'], contentType: ['Course'], status: ['Live'], sourceName: 'Ministry of Health and Family Welfare', lang: language,
          },
        }, query: '', sort: [{ lastUpdatedOn: 'desc' }],
      }
    } else {
      req = {
        request: {
          filters: {
            primaryCategory: ['Course'], contentType: ['Course'], status: ['Live'], sourceName: 'Ministry of Health and Family Welfare',
          },
        }, query: '', sort: [{ lastUpdatedOn: 'desc' }],
      }
    }
    return this.http.post<any>(API_END_POINTS.SEARCH_V6PUBLIC, req)
  }

  setConnectSid(authCode: any): Observable<any> {
    // console.log(authCode)

    return this.http.post<any>(`${API_END_POINTS.KEYCLOAK_COOKIE}/endpoint?keycloak=true&code=${authCode}`, {})

  }
  fetchUserBatchList(userId: string | undefined): Observable<NsContent.ICourse[]> {
    let path = ''
    path = API_END_POINTS.FETCH_USER_ENROLLMENT_LIST(userId)
    return this.http
      .get(path)
      .pipe(
        catchError(this.handleError),
        map(
          (data: any) => data.result.courses
        )
      )
  }
  handleError(error: HttpErrorResponse) {
    return throwError(error)
  }
}
