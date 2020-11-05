import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { IResponseAllSources } from './models/userRegistration.model'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

const API_ENDPOINTS = {
  getAllSources: '/apis/protected/v8/admin/userRegistration/getAllSources',
  registerUsers: '/apis/protected/v8/admin/userRegistration/register',
  createUser: '/apis/protected/v8/admin/userRegistration/create-user',
  getOrdinals: '/apis/authApi/action/meta/v2/ordinals/list',
  getAccessPaths: '/apis/protected/v8/admin/userRegistration/user/access-path',
  updateAccessPaths: '/apis/protected/v8/admin/userRegistration/user/update-access-path',
  getBulkUploadData: '/apis/protected/v8/admin/userRegistration/bulkUploadData',
}
@Injectable()
export class TenantAdminService {

  constructor(
    private http: HttpClient,
  ) {
  }

  async fetchJson(jsonUrl: string) {
    const json = await this.http.get<any>(jsonUrl).toPromise()
    return json
  }

  async getAllSources(): Promise<IResponseAllSources[]> {
    return await this.http.get<IResponseAllSources[]>(API_ENDPOINTS.getAllSources).toPromise()
  }

  async registerUsers(data: any) {
    return await this.http.post(API_ENDPOINTS.registerUsers, data).toPromise()
  }

  createUser(data: any): Observable<any> {
    return this.http.post<any>(API_ENDPOINTS.createUser, data).pipe(
      map(response => {
        return response.result
      }),
    )
  }

  async getOrdinals(rootOrg: string | null, org: string[] | null) {
    // tslint:disable-next-line: no-console
    console.log('org', org)
    return await this.http.get(`${API_ENDPOINTS.getOrdinals}?rootOrg=${rootOrg}&org=${org}`).toPromise()
  }

  getAcessPaths(wid: any): Observable<any> {
    return this.http.post<any>(API_ENDPOINTS.getAccessPaths, { wid }).pipe(
      map(response => {
        return response
      }),
    )
  }

  async getBulkUploadData() {
    return await this.http.get(`${API_ENDPOINTS.getBulkUploadData}`).toPromise()
  }

  updateAccessPaths(data: any): Observable<any> {
    return this.http.post<any>(API_ENDPOINTS.updateAccessPaths, data).pipe(
      map(response => {
        return response.result
      }),
    )
  }

}
