import { Injectable } from '@angular/core'
import { Resolve } from '@angular/router'
import { Observable, of } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http'
import { IResolveResponse } from '@ws-widget/utils'
import { NsTnc } from '../models/tnc.model'

const API_END_POINTS = {
  USER_SIGNUP: `apis/public/v8/register/registerUserWithEmail`,
  REGISTERUSERWITHMOBILE: `apis/public/v8/register/registerUserWithMobile`,
  VERIFY_OTP: `/apis/public/v8/register/verifyUserWithMobileNumber`,
  RESET_PASSWORD: `/apis/public/v8/register/resetPassword`,
  SETPASSWORD_OTP: `/apis/public/v8/register/setPasswordWithOTP`,
}
@Injectable()
export class TncPublicResolverService implements Resolve<Observable<IResolveResponse<NsTnc.ITnc>> | IResolveResponse<NsTnc.ITnc>> {

  constructor(
    private http: HttpClient,
  ) { }

  resolve(): Observable<IResolveResponse<NsTnc.ITnc>> {
    return this.getPublicTnc().pipe(
      map(data => ({ data, error: null })),
      catchError(error => of({ error, data: null })),
    )
  }
  getPublicTnc(locale?: string): Observable<NsTnc.ITnc> {
    let url = '/apis/public/v8/tnc'
    if (locale) {
      url += `?locale=${locale}`
    }
    return this.http.get<NsTnc.ITnc>(url)
  }


  signup(data: any): Observable<any> {
    return this.http.post<any>('/apis/public/v8/register/registerUserWithEmail', data).pipe(
      map(response => {
        return response
      }),
    )
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
