import { Injectable } from '@angular/core'

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
export class TncPublicResolverService {

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
  getPublicTnc(): Observable<NsTnc.ITnc> {
    // Language detection uses LanguageService and localStorage (set by LanguageService)
    let lang: string = localStorage.getItem('language') || 'en'

    // Check user preferences as fallback
    lang = this.configSvc.unMappedUser?.profileDetails?.preferences?.language || lang

    const configUrl = lang === 'hi' ? '/fusion-assets/files/tnc.config.hi.json' : '/fusion-assets/files/tnc.config.json'
    return this.http.get<NsTnc.ITnc>(configUrl)
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
