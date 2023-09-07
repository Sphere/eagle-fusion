import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { map, share } from 'rxjs/operators'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import get from 'lodash/get'
import isUndefined from 'lodash/isUndefined'

import { v4 as uuid } from 'uuid'

const API_END_POINTS = {
  USER_SIGNUP: `/apis/public/v8/emailMobile/signup`,
  REGISTERUSERWITHMOBILE: `/apis/public/v8/emailMobile/registerUserWithMobile`,
  GENERATE_OTP: `/apis/public/v8/emailMobile/generateOtp`,
  VALIDATE_OTP: `/apis/public/v8/emailMobile/validateOtp`,
  VERIFY_OTP: `/apis/public/v8/forgot-password/verifyOtp`,
  RESET_PASSWORD: `/apis/public/v8/forgot-password/reset/proxy/password`,
  SETPASSWORD_OTP: `/apis/public/v8/forgot-password/verifyOtp`,
  profilePid: '/apis/proxies/v8/api/user/v2/read',
  newssowithMobileEmail: '/apis/public/v8/signupWithAutoLoginV2/register',
  validateOTP: '/apis/public/v8/signupWithAutoLoginv2/validateOtpWithLogin'
}

@Injectable({
  providedIn: 'root',
})
export class SignupService {
  someDataObservable!: Observable<any>

  constructor(private http: HttpClient,
    private configSvc: ConfigurationsService
  ) { }

  ssoValidateOTP(data: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.validateOTP, data).pipe(
      map(response => {
        return response
      }),
    )
  }

  ssoWithMobileEmail(data: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.newssowithMobileEmail, data).pipe(
      map(response => {
        return response
      }),
    )
  }

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

  generateOtp(data: any): Observable<any> {
    if (this.someDataObservable) {
      return this.someDataObservable
    }
    this.someDataObservable = this.http.post<any>(API_END_POINTS.GENERATE_OTP, data).pipe(share())
    return this.someDataObservable
    // .pipe(
    //   map(response => {
    //     return response
    //   })
    // )

  }
  plumb5SendEvent(data: any) {
    return this.http.post<any>(`https://track.plumb5.com/EventDetails/SaveEventDetails`, data).pipe(
      map(response => {
        return response
      })
    )
  }

  plumb5SendForm(data: any) {
    return this.http.post<any>(`https://track.plumb5.com/FormInfoDetails/SaveFormDetails`, data).pipe(
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

  async fetchStartUpDetails(): Promise<any> {
    if (this.configSvc.instanceConfig) {
      let userPidProfile: any | null = null
      try {
        userPidProfile = await this.http
          .get<any>(API_END_POINTS.profilePid)
          .pipe(map((res: any) => res.result.response))
          .toPromise()
        if (userPidProfile && userPidProfile.roles && userPidProfile.roles.length > 0 &&
          this.hasRole(userPidProfile.roles)) {
          if (localStorage.getItem('telemetrySessionId')) {
            localStorage.removeItem('telemetrySessionId')
          }
          localStorage.setItem('telemetrySessionId', uuid())
          this.configSvc.unMappedUser = userPidProfile
          const profileV2 = get(userPidProfile, 'profiledetails')
          this.configSvc.userProfile = {
            country: get(profileV2, 'personalDetails.countryCode') || null,
            email: get(profileV2, 'profileDetails.officialEmail') || userPidProfile.email,
            givenName: userPidProfile.firstName,
            userId: userPidProfile.userId,
            firstName: userPidProfile.firstName,
            lastName: userPidProfile.lastName,
            rootOrgId: userPidProfile.rootOrgId,
            rootOrgName: userPidProfile.channel,
            userName: userPidProfile.userName,
            profileImage: userPidProfile.thumbnail,
            departmentName: userPidProfile.channel,
            dealerCode: null,
            isManager: false,
            phone: get(userPidProfile, 'phone'),
          }
          this.configSvc.userProfileV2 = {
            userId: get(profileV2, 'userId') || userPidProfile.userId,
            email: get(profileV2, 'personalDetails.officialEmail') || userPidProfile.email,
            firstName: get(profileV2, 'personalDetails.firstname') || userPidProfile.firstName,
            surName: get(profileV2, 'personalDetails.surname') || userPidProfile.lastName,
            middleName: get(profileV2, 'personalDetails.middlename') || '',
            departmentName: get(profileV2, 'employmentDetails.departmentName') || userPidProfile.channel,
            givenName: get(userPidProfile, 'userName'),
            userName: `${get(profileV2, 'personalDetails.firstname') ? get(profileV2, 'personalDetails.firstname') :
              ''}${get(profileV2, 'personalDetails.surname') ? get(profileV2, 'personalDetails.surname') : ''}`,
            profileImage: get(profileV2, 'photo') || userPidProfile.thumbnail,
            dealerCode: null,
            isManager: false,
          }
        }
        if (!this.configSvc.nodebbUserProfile) {
          this.configSvc.nodebbUserProfile = {
            username: userPidProfile.userName,
            email: 'null',
          }
        }
        const details = {
          group: [],
          profileDetailsStatus: !!get(userPidProfile, 'profileDetails.mandatoryFieldsExists'),
          roles: (userPidProfile.roles || []).map((v: { toLowerCase: () => void }) => v.toLowerCase()),
          tncStatus: !(isUndefined(this.configSvc.unMappedUser)),
          isActive: !!!userPidProfile.isDeleted,
          userId: userPidProfile.userId,
          status: 200,
        }
        this.configSvc.hasAcceptedTnc = details.tncStatus
        this.configSvc.profileDetailsStatus = details.profileDetailsStatus
        this.configSvc.userGroups = new Set(details.group)
        this.configSvc.userRoles = new Set((details.roles || []).map((v: string) => v.toLowerCase()))
        this.configSvc.isActive = details.isActive
        return details
      } catch (e) {
        this.configSvc.userProfile = null
        return e
      }
    }
    return { group: [], profileDetailsStatus: true, roles: new Set(['Public']), tncStatus: true, isActive: true }
  }

  hasRole(role: string[]): boolean {
    let returnValue = false
    const rolesForCBP: any = ['PUBLIC']
    role.forEach(v => {
      if ((rolesForCBP).includes(v)) {
        returnValue = true
      }
    })
    return returnValue
  }

  keyClockLogin() {
    let url = `${document.baseURI}`
    let redirectUrl = ''
    sessionStorage.setItem('url', url)
    if (url.includes('hi')) {
      url = url.replace('hi/', '')
      redirectUrl = `${url}openid/keycloak`
      sessionStorage.setItem('lang', 'hi')
    } else {
      redirectUrl = `${url}openid/keycloak`
    }
    // console.log(url, redirectUrl)
    const state = uuid()
    const nonce = uuid()
    sessionStorage.setItem('login-btn', 'clicked')
    // tslint:disable-next-line:max-line-length
    const keycloakurl = `${url}auth/realms/sunbird/protocol/openid-connect/auth?client_id=portal&redirect_uri=${encodeURIComponent(redirectUrl)}&state=${state}&response_mode=fragment&response_type=code&scope=openid&nonce=${nonce}`
    window.location.href = keycloakurl
  }

}
