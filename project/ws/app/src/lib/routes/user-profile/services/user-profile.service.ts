import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, BehaviorSubject, of } from 'rxjs'
import { map, retry, tap } from 'rxjs/operators'
import { UserDataCacheService } from 'src/app/services/user-data-cache.service'
import {
  IUserProfileDetails,
  ILanguagesApiData,
  INationalityApiData,
  IUserProfileDetailsFromRegistry,
} from '../models/user-profile.model'
import { LoggerService } from '../../../../../../../../library/ws-widget/utils/src/public-api'
import { API_END_POINTS } from '../../../../../../../../src/app/constants/apiConstants'


@Injectable()
export class UserProfileService {
  public _updateuser = new BehaviorSubject<any>(undefined)
  // Observable navItem stream
  updateuser$ = this._updateuser.asObservable()

  // Cache to store user details by user ID to prevent repeated API calls
  private userDetailsCache = new Map<string, any>()

  constructor(
    private http: HttpClient,
    private userDataCacheSvc: UserDataCacheService,
    private logger: LoggerService
  ) {
  }

  updateProfileDetails(data: any) {
    return this.http.post<any>(API_END_POINTS.updateProfileWithSourceDetails, data).pipe(
      tap((response: any) => {
        this.logger.log('[UserProfileService] Profile updated, clearing all user caches', response)
        // Clear all user caches since profile was updated
        this.userDetailsCache.clear()
        this.userDataCacheSvc.clearUserData()
        // Emit update event - components listening to this can refresh global caches
        this._updateuser.next(response)
      })
    )
  }
  getUserdetails(email: string | undefined): Observable<[IUserProfileDetails]> {
    return this.http.post<[IUserProfileDetails]>(API_END_POINTS.getUserdetails, { email })
  }
  bnrcRegistration(value: any): Observable<[IUserProfileDetails]> {
    return this.http.post<[IUserProfileDetails]>(API_END_POINTS.bnrcRegistration, { value })
  }

  // bnrcSendOtp(value: any): Observable<[IUserProfileDetails]> {
  //   return this.http.post<[IUserProfileDetails]>(API_END_POINTS.bnrcSendOtpRegistration, { value })
  // }
  bnrcSendOtp(phone: { phone: string }): Observable<IUserProfileDetails[]> {
    return this.http.post<IUserProfileDetails[]>(API_END_POINTS.bnrcSendOtpRegistration, phone)
  }
  bnrcResendOtp(phone: { phone: string }): Observable<[IUserProfileDetails]> {
    return this.http.post<[IUserProfileDetails]>(API_END_POINTS.bnrcReSendOtpRegistration, phone)
  }

  bnrcValidateOtp(value: { phone: string; otp: string }): Observable<IUserProfileDetails[]> {
    return this.http.post<IUserProfileDetails[]>(API_END_POINTS.bnrcValidateOtpRegistration, value)
  }
  upsmfRegistration(value: any): Observable<[IUserProfileDetails]> {
    return this.http.post<[IUserProfileDetails]>(API_END_POINTS.upsmfRegistration, { value })
  }
  upsmfSendOtp(phone: { phone: string }): Observable<IUserProfileDetails[]> {
    return this.http.post<IUserProfileDetails[]>(API_END_POINTS.upsmfSendOtpRegistration, phone)
  }
  upsmfResendOtp(phone: { phone: string }): Observable<[IUserProfileDetails]> {
    return this.http.post<[IUserProfileDetails]>(API_END_POINTS.upsmfReSendOtpRegistration, phone)
  }

  mpValidateOtp(value: { phone: string; otp: string }): Observable<IUserProfileDetails[]> {
    return this.http.post<IUserProfileDetails[]>(API_END_POINTS.mpValidateOtpRegistration, value)
  }
  mpRegistration(value: any): Observable<[IUserProfileDetails]> {
    return this.http.post<[IUserProfileDetails]>(API_END_POINTS.mpRegistration, { value })
  }
  mpSendOtp(phone: { phone: string }): Observable<IUserProfileDetails[]> {
    return this.http.post<IUserProfileDetails[]>(API_END_POINTS.mpSendOtpRegistration, phone)
  }
  mpResendOtp(phone: { phone: string }): Observable<[IUserProfileDetails]> {
    return this.http.post<[IUserProfileDetails]>(API_END_POINTS.mpReSendOtpRegistration, phone)
  }

  upsmfValidateOtp(value: { phone: string; otp: string }): Observable<IUserProfileDetails[]> {
    return this.http.post<IUserProfileDetails[]>(API_END_POINTS.upsmfValidateOtpRegistration, value)
  }
  getMasterLanguages(): Observable<ILanguagesApiData> {
    return this.http.get<ILanguagesApiData>(API_END_POINTS.getMasterLanguages)
  }
  getMasterNationlity(): Observable<INationalityApiData> {
    return this.http.get<INationalityApiData>(API_END_POINTS.getMasterNationlity)
  }
  // getProfilePageMeta(): Observable<IProfileMetaApiData> {
  //   return this.http.get<IProfileMetaApiData>(API_END_POINTS.getProfilePageMeta)
  // }
  // getUserdetailsFromRegistry(): Observable<[IUserProfileDetailsFromRegistry]> {
  //   return this.http.get<[IUserProfileDetailsFromRegistry]>(API_END_POINTS.getUserdetailsFromRegistry)
  // }
  getUserdetailsFromRegistry(wid: string): Observable<[IUserProfileDetailsFromRegistry]> {
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
    return this.http.get<[IUserProfileDetailsFromRegistry]>(`${API_END_POINTS.getUserdetailsFromRegistry}/${wid}`)
      .pipe(
        retry(1),
        map((res: any) => res.result.response),
        tap((data: any) => {
          // Cache the result in-memory for fast access
          this.userDetailsCache.set(wid, data)
          // Also cache globally using UserDataCacheService (which handles session storage and 6-hour expiration)
          this.userDataCacheSvc.setUserData(data)
          this.logger.log(`[UserProfileService] Cached user details for ${wid} in global cache`)
        }),
      )
  }
  getAllDepartments() {
    return this.http.get<INationalityApiData>(API_END_POINTS.getAllDepartments)
  }
  approveRequest(data: any) {
    return this.http.post(API_END_POINTS.approveRequest, data)
  }
  listApprovalPendingFields() {
    return this.http.post<any>(API_END_POINTS.getPendingFields, {
      serviceName: 'profile',
      applicationStatus: 'SEND_FOR_APPROVAL',
    })
  }
  getLeaderBoardData(request): Observable<any> {
    const options = {
      url: API_END_POINTS.getLeaderBoardData,
      payload: request,
    }
    return this.http.post(options.url, options.payload)
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
      const professionalDetails = profileReq.professionalDetails[0]
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
  refreshGlobalUserDataCache(userDataCacheSvc: any): void {
    if (userDataCacheSvc) {
      this.logger.log('[UserProfileService] Refreshing global user data cache')
      userDataCacheSvc.clearUserData()
      // Clear per-user cache as well
      this.userDetailsCache.clear()
    }
  }
}
