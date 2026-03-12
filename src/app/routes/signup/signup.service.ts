import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { map, share } from 'rxjs/operators'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { UserDataCacheService } from '../../services/user-data-cache.service'
import get from 'lodash/get'
import isUndefined from 'lodash/isUndefined'

import { v4 as uuid } from 'uuid'
import { LoggerService } from '../../../../library/ws-widget/utils/src/public-api'
import { API_END_POINTS, S3_END_POINTS } from '../../constants/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class SignupService {
  someDataObservable!: Observable<any>

  constructor(private http: HttpClient,
    private configSvc: ConfigurationsService,
    private userDataCacheSvc: UserDataCacheService,
    private logger: LoggerService
  ) { }

  ssoValidateOTP(data: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.validateOTP, data).pipe(
      map(response => {
        return response
      }),
    )
  }
  ssoValidateOrgOTP(data: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.validateOrgOTP, data).pipe(
      map(response => {
        return response
      }),
    )
  }
  sendOTP(data: any) {
    return this.http.post<any>(API_END_POINTS.sendUserOTP, data).pipe(
      map(response => {
        return response
      }),
    )
  }
  resendOTP(data: any) {
    return this.http.post<any>(API_END_POINTS.resendOTP, data).pipe(
      map(response => {
        return response
      }),
    )
  }
  loginAPI(data: any) {
    return this.http.post<any>(API_END_POINTS.newLogin, data).pipe(
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

  ssoWithMobileEmailOrgForm(data: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.newssowithMobileEmailOrgForm, data).pipe(
      map(response => {
        return response
      }),
    )
  }

  signup(data: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.SIGNUP, data).pipe(
      map(response => {
        return response
      }),
    )
  }

  registerWithMobile(data: any) {
    return this.http.post<any>(API_END_POINTS.REGISTER_USERWITH_MOBILE, data).pipe(
      map(response => {
        return response
      })
    )
  }

  verifyUserMobile(data: any) {
    return this.http.post<any>(API_END_POINTS.VERIFY_FPW_OTP, data).pipe(
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
    return this.http.post(API_END_POINTS.RESET_FPW_PASSWORD, request).pipe(
      map((response: any) => {
        return response
      }))
  }

  setPasswordWithOtp(request: any): Observable<any> {
    return this.http.post(API_END_POINTS.SET_FPW_OTP, request).pipe(
      map((response: any) => {
        return response
      }))
  }
  async getUserData(): Promise<any> {
    let userPidProfile: any | null = null
    try {
      // Use cached user data service to prevent repeated API calls
      userPidProfile = await this.userDataCacheSvc.getUserData().toPromise()
      this.logger.log(this.configSvc.unMappedUser)
      this.logger.log(userPidProfile)
      if (this.configSvc.unMappedUser === undefined) {
        localStorage.setItem('telemetrySessionId', uuid())
        this.configSvc.unMappedUser = userPidProfile
      }
      return userPidProfile
    } catch (e) {
      this.configSvc.userProfile = null
      return e
    }

  }

  async fetchStartUpDetails(): Promise<any> {
    if (this.configSvc.instanceConfig) {
      let userPidProfile: any | null = null
      try {
        // Use cached user data service to prevent repeated API calls
        userPidProfile = await this.userDataCacheSvc.getUserData().toPromise()
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
        // Cache the user data for future use
        this.userDataCacheSvc.setUserData(userPidProfile)
        try {
          await this.fetchOrgSelectiveConfig()
        } catch (err) {
          this.logger.warn('fetchOrgSelectiveConfig failed (non-fatal):', err)
        }
        const details = {
          group: [],
          profileDetailsStatus: !!get(userPidProfile, 'profileDetails.mandatoryFieldsExists'),
          roles: (userPidProfile.roles || []).map((v: { toLowerCase: () => void }) => v.toLowerCase()),
          tncStatus: !(isUndefined(this.configSvc.unMappedUser)),
          isActive: !!!userPidProfile.isDeleted,
          userId: userPidProfile.userId,
          language: (userPidProfile.profileDetails && userPidProfile.profileDetails.preferences && userPidProfile.profileDetails.preferences.language) ? userPidProfile.profileDetails.preferences.language : 'en',
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
    location.href = '/public/login'
  }
  private async fetchOrgSelectiveConfig(): Promise<void> {
    try {
      const s3Url = S3_END_POINTS.ORG_SELECTIVE_COURSE
      const orgSelectiveData = await this.http.get<any>(s3Url).toPromise()

      if (orgSelectiveData && Array.isArray(orgSelectiveData.states)) {
        let matchedOrg: any = null

        // 1. Try matching for logged-in user (rootOrgId)
        if (this.configSvc.userProfile?.rootOrgId) {
          const rootOrgId = this.configSvc.userProfile.rootOrgId
          this.logger.log('Root Org ID:', rootOrgId)

          for (const state of orgSelectiveData.states) {
            const found = state.organisations?.find(
              (org: any) => org.orgId === rootOrgId
            )
            if (found) {
              matchedOrg = found
              break
            }
          }
        }

        // 2. If no match found, check ?org= param (public route)
        if (!matchedOrg) {
          const urlParams = new URLSearchParams(window.location.search)
          let orgNameFromUrl = urlParams.get('org')

          if (orgNameFromUrl) {
            // Decode + sanitize URL param
            orgNameFromUrl = decodeURIComponent(orgNameFromUrl)
              .replace(/\+/g, ' ')
              .trim()
              .toLowerCase()
              .replace(/&/g, 'and')

            this.logger.log('Normalized Org from URL:', orgNameFromUrl)

            // Iterate over all orgs to find match
            for (const state of orgSelectiveData.states) {
              const found = state.organisations?.find((org: any) => {
                const orgNameNormalized = (org.orgName || '')
                  .toLowerCase()
                  .trim()
                  .replace(/&/g, 'and')
                return orgNameNormalized === orgNameFromUrl
              })
              if (found) {
                matchedOrg = found
                break
              }
            }
          }
        }

        // 🔹 3. Save matched config
        if (matchedOrg) {
          this.configSvc.orgSelectiveCourseConfig = matchedOrg
          this.logger.log('Org Selective Config Found:', matchedOrg.orgName)
        } else {
          this.logger.warn('No matching org found in org-selective-course.json')
          this.logger.warn(
            'Available org names:',
            orgSelectiveData.states.flatMap((s: any) =>
              s.organisations.map((o: any) => o.orgName)
            )
          )
        }
      } else {
        this.logger.warn('org-selective-course.json missing or invalid format')
      }
    } catch (error) {
      this.logger.error('Failed to fetch org-selective-course.json:', error)
    }
  }

}
