import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

const API_END_POINTS = {
  USER_SIGNUP: `/apis/public/v8/emailMobile/signup`,
  REGISTERUSERWITHMOBILE: `/apis/public/v8/emailMobile/registerUserWithMobile`,
  GENERATE_OTP: `/apis/public/v8/emailMobile/generateOtp`,
  VALIDATE_OTP: `/apis/public/v8/emailMobile/validateOtp`,
  VERIFY_OTP: `/apis/public/v8/forgot-password/verifyOtp`,
  RESET_PASSWORD: `/apis/public/v8/forgot-password/reset/proxy/password`,
  SETPASSWORD_OTP: `/apis/public/v8/forgot-password/verifyOtp`,
}

@Injectable({
  providedIn: 'root',
})
export class SignupService {

  constructor(private http: HttpClient) { }

  signup(data: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.USER_SIGNUP, data).pipe(
      map(response => {
        return response
      }),
    )
  }

  registerWithMobile(data: any) {
    return this.http.post<any>(API_END_POINTS.REGISTERUSERWITHMOBILE, data).pipe(
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

  generateOtp(data: any) {
    return this.http.post<any>(API_END_POINTS.GENERATE_OTP, data).pipe(
      map(response => {
        return response
      })
    )
  }
  validateOtp(data: any) {
    return this.http.post<any>(API_END_POINTS.VALIDATE_OTP, data).pipe(
      map(response => {
        return response
      })
    )
  }

  public forgotPassword(request: any): Observable<any> {

    return this.http.post(API_END_POINTS.RESET_PASSWORD, request).pipe(
      map((response: any) => {
        return response
      }))
  }

  setPasswordWithOtp(request: any): Observable<any> {
    return this.http.post(API_END_POINTS.SETPASSWORD_OTP, request).pipe(
      map((response: any) => {
        return response
      }))
  }

}
