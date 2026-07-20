import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, BehaviorSubject, of } from 'rxjs'
import { map, retry, tap, catchError } from 'rxjs/operators'
import { UserDataCacheService } from 'src/app/services/user-data-cache.service'
import {
  IUserProfileDetails,
  ILanguagesApiData,
  INationalityApiData,
  IUserProfileDetailsFromRegistry,
} from '../models/user-profile.model'
import { LoggerService } from '../../../../../../../../library/ws-widget/utils/src/public-api'
import { API_END_POINTS } from '../../../../../../../../src/app/constants/apiConstants'
import {
  IUpdateProfileRequest,
  IApprovalRequest,
  ILeaderboardRequest,
  IProfileProfessionalDetails,
} from './user-profile.service.model'


@Injectable()
export class UserProfileService {
  public _updateuser = new BehaviorSubject<any>(undefined)
  // Observable navItem stream
  updateuser$ = this._updateuser.asObservable()

  // Cache to store user details by user ID to prevent repeated API calls
  private userDetailsCache = new Map<string, any>()

  constructor(
    private readonly http: HttpClient,
    private readonly userDataCacheSvc: UserDataCacheService,
    private readonly logger: LoggerService
  ) {
  }

  updateProfileDetails(data: IUpdateProfileRequest): Observable<any> {
    return this.http.post<any>(API_END_POINTS.updateProfileWithSourceDetails, data).pipe(
      tap((response: any) => {
        this.logger.log('[UserProfileService] Profile updated, clearing all user caches', response)
        this.userDetailsCache.clear()
        this.userDataCacheSvc.clearUserData()
        this._updateuser.next(response)
      }),
      catchError(error => {
        this.logger.error('[UserProfileService] Error updating profile', error)
        throw error
      })
    )
  }
  getUserdetails(email: string | undefined): Observable<[IUserProfileDetails]> {
    return this.http.post<[IUserProfileDetails]>(API_END_POINTS.getUserdetails, { email })
  }
  bnrcRegistration(value: IUpdateProfileRequest): Observable<any> {
    return this.http.post<any>(API_END_POINTS.bnrcRegistration, { value }).pipe(
      catchError(error => {
        this.logger.error('[UserProfileService] BNRC registration error', error)
        throw error
      })
    )
  }

  bnrcSendOtp(phone: { phone: string }): Observable<any> {
    return this.http.post<any>(API_END_POINTS.bnrcSendOtpRegistration, phone).pipe(
      catchError(error => {
        this.logger.error('[UserProfileService] BNRC send OTP error', error)
        throw error
      })
    )
  }
  bnrcResendOtp(phone: { phone: string }): Observable<[IUserProfileDetails]> {
    return this.http.post<[IUserProfileDetails]>(API_END_POINTS.bnrcReSendOtpRegistration, phone)
  }

  bnrcValidateOtp(value: { phone: string; otp: string }): Observable<any> {
    return this.http.post<any>(API_END_POINTS.bnrcValidateOtpRegistration, value).pipe(
      catchError(error => {
        this.logger.error('[UserProfileService] BNRC validate OTP error', error)
        throw error
      })
    )
  }
  upsmfRegistration(value: IUpdateProfileRequest): Observable<any> {
    return this.http.post<any>(API_END_POINTS.upsmfRegistration, { value }).pipe(
      catchError(error => {
        this.logger.error('[UserProfileService] UPSMF registration error', error)
        throw error
      })
    )
  }
  upsmfSendOtp(phone: { phone: string }): Observable<any> {
    return this.http.post<any>(API_END_POINTS.upsmfSendOtpRegistration, phone).pipe(
      catchError(error => {
        this.logger.error('[UserProfileService] UPSMF send OTP error', error)
        throw error
      })
    )
  }
  upsmfResendOtp(phone: { phone: string }): Observable<any> {
    return this.http.post<any>(API_END_POINTS.upsmfReSendOtpRegistration, phone).pipe(
      catchError(error => {
        this.logger.error('[UserProfileService] UPSMF resend OTP error', error)
        throw error
      })
    )
  }

  mpValidateOtp(value: { phone: string; otp: string }): Observable<any> {
    return this.http.post<any>(API_END_POINTS.mpValidateOtpRegistration, value).pipe(
      catchError(error => {
        this.logger.error('[UserProfileService] MP validate OTP error', error)
        throw error
      })
    )
  }
  mpRegistration(value: IUpdateProfileRequest): Observable<any> {
    return this.http.post<any>(API_END_POINTS.mpRegistration, { value }).pipe(
      catchError(error => {
        this.logger.error('[UserProfileService] MP registration error', error)
        throw error
      })
    )
  }
  mpSendOtp(phone: { phone: string }): Observable<any> {
    return this.http.post<any>(API_END_POINTS.mpSendOtpRegistration, phone).pipe(
      catchError(error => {
        this.logger.error('[UserProfileService] MP send OTP error', error)
        throw error
      })
    )
  }
  mpResendOtp(phone: { phone: string }): Observable<any> {
    return this.http.post<any>(API_END_POINTS.mpReSendOtpRegistration, phone).pipe(
      catchError(error => {
        this.logger.error('[UserProfileService] MP resend OTP error', error)
        throw error
      })
    )
  }

  upsmfValidateOtp(value: { phone: string; otp: string }): Observable<any> {
    return this.http.post<any>(API_END_POINTS.upsmfValidateOtpRegistration, value).pipe(
      catchError(error => {
        this.logger.error('[UserProfileService] UPSMF validate OTP error', error)
        throw error
      })
    )
  }
  getMasterLanguages(): Observable<ILanguagesApiData> {
    return this.http.get<ILanguagesApiData>(API_END_POINTS.getMasterLanguages).pipe(
      catchError(error => {
        this.logger.error('[UserProfileService] Error fetching languages', error)
        throw error
      })
    )
  }
  getMasterNationlity(): Observable<INationalityApiData> {
    return this.http.get<INationalityApiData>(API_END_POINTS.getMasterNationlity).pipe(
      catchError(error => {
        this.logger.error('[UserProfileService] Error fetching nationality data', error)
        throw error
      })
    )
  }

  getUserdetailsFromRegistry(wid: string): Observable<any> {
    // Check if data is already cached for this user (in-memory)
    if (this.userDetailsCache.has(wid)) {
      const cachedData = this.userDetailsCache.get(wid)
      this.logger.log(`[UserProfileService] Returning cached user details for ${wid}`)
      return of(cachedData)
    }

    // Check global user data cache from UserDataCacheService
    const globalCachedData = this.userDataCacheSvc.getCachedUserData()
    if (globalCachedData && globalCachedData.userId) {
      this.logger.log(`[UserProfileService] Using user details from global UserDataCache`)
      this.userDetailsCache.set(wid, globalCachedData)
      return of(globalCachedData)
    }

    // If not cached, fetch from API and cache the result
    return this.http.get<{ result: { response: IUserProfileDetailsFromRegistry } }>(`${API_END_POINTS.getUserdetailsFromRegistry}/${wid}`)
      .pipe(
        retry(1),
        map((res: { result: { response: IUserProfileDetailsFromRegistry } }) => {
          if (!res.result || !res.result.response) {
            throw new Error('Invalid API response format')
          }
          return res.result.response as any
        }),
        tap((data: IUserProfileDetailsFromRegistry) => {
          this.userDetailsCache.set(wid, data)
          this.userDataCacheSvc.setUserData(data)
          this.logger.log(`[UserProfileService] Cached user details for ${wid} in global cache`)
        }),
        catchError(error => {
          this.logger.error(`[UserProfileService] Error fetching user details for ${wid}`, error)
          throw error
        })
      )
  }
  getAllDepartments(): Observable<any> {
    return this.http.get<any>(API_END_POINTS.getAllDepartments).pipe(
      catchError(error => {
        this.logger.error('[UserProfileService] Error fetching departments', error)
        throw error
      })
    )
  }
  approveRequest(data: IApprovalRequest): Observable<any> {
    return this.http.post(API_END_POINTS.approveRequest, data).pipe(
      catchError(error => {
        this.logger.error('[UserProfileService] Error approving request', error)
        throw error
      })
    )
  }

  listApprovalPendingFields(): Observable<any> {
    return this.http.post<any>(API_END_POINTS.getPendingFields, {
      serviceName: 'profile',
      applicationStatus: 'SEND_FOR_APPROVAL',
    }).pipe(
      catchError(error => {
        this.logger.error('[UserProfileService] Error fetching pending fields', error)
        throw error
      })
    )
  }
  getLeaderBoardData(request: ILeaderboardRequest): Observable<any> {
    const options = {
      url: API_END_POINTS.getLeaderBoardData,
      payload: request,
    }
    return this.http.post(options.url, options.payload).pipe(
      catchError(error => {
        this.logger.error('[UserProfileService] Error fetching leaderboard data', error)
        throw error
      })
    )
  }

  isBackgroundDetailsFilled(profileReq: any): boolean {
    let isFilled = true
    if (
      profileReq &&
      profileReq.personalDetails &&
      profileReq.professionalDetails &&
      profileReq.professionalDetails[0]
    ) {
      const personalDetails = profileReq.personalDetails
      const professionalDetails: IProfileProfessionalDetails = profileReq.professionalDetails[0]
      if (
        !(personalDetails.dob && personalDetails.postalAddress && professionalDetails.profession)
      ) {
        isFilled = false
      }
      switch (professionalDetails.profession) {
        case 'ASHA':
          isFilled = professionalDetails.block ? isFilled : false
          break
        case 'Others':
          isFilled = professionalDetails.selectBackground ? isFilled : false
          if (professionalDetails.selectBackground === 'Asha Facilitator') {
            isFilled = professionalDetails.block ? isFilled : false
          }
          break
        case 'Student':
          isFilled = professionalDetails.designation ? isFilled : false
          break
        case 'Healthcare Volunteer':
          isFilled = professionalDetails.designation ? isFilled : false
          break
        case 'Healthcare Worker':
          isFilled = professionalDetails.designation ? isFilled : false
          break
        case 'Faculty':
          isFilled = professionalDetails.designation ? isFilled : false
          break
      }
    } else {
      isFilled = false
    }
    return isFilled
  }

  /**
   * Clear the cached user details (call this on logout or when user data needs to be refreshed)
   */
  clearUserDetailsCache(): void {
    this.userDetailsCache.clear()
    // Clear global user data cache
    this.userDataCacheSvc.clearUserData()
    this.logger.log('[UserProfileService] User details cache cleared')
  }

  /**
   * Force refresh of global user data cache
   * This should be called after updating profile to ensure cached data is refreshed
   */
  refreshGlobalUserDataCache(): void {
    this.logger.log('[UserProfileService] Refreshing global user data cache')
    this.userDataCacheSvc.clearUserData()
    this.userDetailsCache.clear()
  }
}
