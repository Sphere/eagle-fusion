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
  SEARCH_V6PUBLIC: '/apis/public/v8/publicContent/v1/search',
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
    const req = { request: { filters: { primaryCategory: ['Course'], contentType: ['Course'] } }, query: '', sort: [{ lastUpdatedOn: 'desc' }] }
    return this.http.post<any>(API_END_POINTS.SEARCH_V6PUBLIC, req)
  }

  getDatabyOrgId(): Promise<any> {
    const url = `${this.configSvc.sitePath}/page/course.json`
    return this.http.get<any>(`${url}`).toPromise()
  }

  getLiveSearchResults(): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const req = { request: { filters: { primaryCategory: ['Course'], contentType: ['Course'], status: ['Live'] } }, query: '', sort: [{ lastUpdatedOn: 'desc' }] }
    return this.http.post<any>(API_END_POINTS.SEARCH_V6PUBLIC, req)
  }
}
