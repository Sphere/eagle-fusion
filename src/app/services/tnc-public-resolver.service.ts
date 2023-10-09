import { Injectable } from '@angular/core'
import { Resolve } from '@angular/router'
import { Observable, of } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http'
import { IResolveResponse, ConfigurationsService } from '@ws-widget/utils'
import { NsTnc } from '../models/tnc.model'

const API_END_POINTS = {
  USER_SIGNUP: `apis/public/v8/register/registerUserWithEmail`,
  USER_SIGNUP_NEW: `apis/protected/v8/user/profileDetails/createUser`,
  REGISTERUSERWITHMOBILE: `apis/public/v8/register/registerUserWithMobile`,
  VERIFY_OTP: `/apis/public/v8/register/verifyUserWithMobileNumber`,
  RESET_PASSWORD: `/apis/public/v8/register/resetPassword`,
  SETPASSWORD_OTP: `/apis/public/v8/register/setPasswordWithOTP`,
  ASSIGN_ADMIN_TO_CREATED_DEPARTMENT: '/apis/proxies/v8/user/private/v1/assign/role',
}
@Injectable()
export class TncPublicResolverService implements Resolve<Observable<IResolveResponse<NsTnc.ITnc>> | IResolveResponse<NsTnc.ITnc>> {

  constructor(
    private http: HttpClient,
    private configSvc: ConfigurationsService
  ) { }

  resolve(): Observable<IResolveResponse<NsTnc.ITnc>> {
    return this.getPublicTnc().pipe(
      map(data => ({ data, error: null })),
      catchError(error => of({ error, data: null })),
    )
  }
  getPublicTnc(locale?: string): Observable<NsTnc.ITnc> {
    let local = (this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails!.preferences && this.configSvc.unMappedUser!.profileDetails!.preferences!.language !== undefined) ? this.configSvc.unMappedUser.profileDetails.preferences.language : location.href.includes('/hi/') === true ? 'hi' : 'en'
    let url1 = local === 'hi' ? `${this.configSvc.sitePath}/tnc.config.${'hi'}.json` : `${this.configSvc.sitePath}/tnc.config.json`

    let url = `${this.configSvc.sitePath}/tnc.config.json`
    if (locale) {
      url += `?locale=${locale}`
    }
    return this.http.get<NsTnc.ITnc>(url1)
  }

  assignAdminToDepartment(data: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.ASSIGN_ADMIN_TO_CREATED_DEPARTMENT, data)
  }

  signup(data: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.USER_SIGNUP_NEW, data)
  }

  registerWithMobile(data: any) {
    return this.http.post<any>('/apis/public/v8/register/registerUserWithMobile', data).pipe(
      map(response => {
        return response
      })
    )
  }

  verifyUserMobile(data: any) {
    return this.http.post<any>(API_END_POINTS.VERIFY_OTP, data).pipe(
      map(response => {
        return response
      })
    )
  }
}
