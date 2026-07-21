import { map, catchError } from 'rxjs/operators'
import { Injectable } from '@angular/core'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Observable, of, BehaviorSubject, throwError } from 'rxjs'
import { ConfigurationsService } from '@ws-widget/utils'
import { NsContent } from '../../../../library/ws-widget/collection/src/lib/_services/widget-content.model'
import { API_END_POINTS } from '../../constants/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class OrgServiceService {
  hideHeaderFooter = new BehaviorSubject<boolean>(false)
  sitePath = `assets/configurations/`

  constructor(private readonly http: HttpClient, private readonly configSvc: ConfigurationsService) { }

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
    return this.http.post<any>(API_END_POINTS.SEARCH_V7PUBLIC, req)
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
    return this.http.post<any>(API_END_POINTS.SEARCH_V7PUBLIC, req)
  }

  setConnectSid(authCode: any): Observable<any> {
    // this.logger.log(authCode)

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
