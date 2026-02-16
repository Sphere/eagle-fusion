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

const API_ENDPOINTS = {
  // updateProfileDetails: '/apis/protected/v8/user/profileRegistry/updateUserRegistry',
  updateProfileDetails: '/apis/protected/v8/user/profileDetails/updateUser',
  updateProfileWithSourceDetails: '/apis/protected/v8/user/profileDetails/v2/updateUser',
  // getUserdetailsFromRegistry: '/apis/protected/v8/user/profileRegistry/getUserRegistryById',
  getUserdetailsFromRegistry: '/apis/proxies/v8/api/user/v2/read',
  getUserdetails: '/apis/protected/v8/user/details/detailV1',
  getMasterNationlity: '/apis/protected/v8/user/profileRegistry/getMasterNationalities',
  getMasterLanguages: '/apis/protected/v8/user/profileRegistry/getMasterLanguages',
  // getProfilePageMeta: '/apis/protected/v8/user/profileRegistry/getProfilePageMeta',
  getAllDepartments: '/apis/protected/v8/portal/listDeptNames',
  approveRequest: '/apis/protected/v8/workflowhandler/transition',
  getPendingFields: '/apis/protected/v8/workflowhandler/userWFApplicationFieldsSearch',
  bnrcRegistration: '/apis/public/v8/bnrcUserCreation/createUser',
  bnrcSendOtpRegistration: '/apis/public/v8/bnrcUserCreation/otp/sendOtp',
  bnrcReSendOtpRegistration: '/apis/public/v8/bnrcUserCreation/otp/resendOtp',
  bnrcValidateOtpRegistration: '/apis/public/v8/bnrcUserCreation/otp/validateOtp',
  upsmfRegistration: '/apis/public/v8/upsmfUserCreation/createUser',
  upsmfSendOtpRegistration: '/apis/public/v8/upsmfUserCreation/otp/sendOtp',
  upsmfReSendOtpRegistration: '/apis/public/v8/upsmfUserCreation/otp/resendOtp',
  upsmfValidateOtpRegistration: '/apis/public/v8/upsmfUserCreation/otp/validateOtp',
  mpRegistration: '/apis/public/v8/mpNHMUserCreation/createUser',
  mpSendOtpRegistration: '/apis/public/v8/mpNHMUserCreation/otp/sendOtp',
  mpReSendOtpRegistration: '/apis/public/v8/mpNHMUserCreation/otp/resendOtp',
  mpValidateOtpRegistration: '/apis/public/v8/mpNHMUserCreation/otp/validateOtp',
  getLeaderBoardData: '/apis/proxies/v8/user/v1/leaderboard',
  // getProfilePageMeta: '/apis/protected/v8/user/profileDetails/getProfilePageMeta',
}

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
  ) {
  }

  updateProfileDetails(data: any) {
    return this.http.post<any>(API_ENDPOINTS.updateProfileWithSourceDetails, data).pipe(
      tap((response: any) => {
        console.log('[UserProfileService] Profile updated, clearing all user caches', response)
        // Clear all user caches since profile was updated
        this.userDetailsCache.clear()
        this.userDataCacheSvc.clearUserData()
        // Emit update event - components listening to this can refresh global caches
        this._updateuser.next(response)
      })
    )
  }
  getUserdetails(email: string | undefined): Observable<[IUserProfileDetails]> {
    return this.http.post<[IUserProfileDetails]>(API_ENDPOINTS.getUserdetails, { email })
  }
  bnrcRegistration(value: any): Observable<[IUserProfileDetails]> {
    return this.http.post<[IUserProfileDetails]>(API_ENDPOINTS.bnrcRegistration, { value })
  }

  // bnrcSendOtp(value: any): Observable<[IUserProfileDetails]> {
  //   return this.http.post<[IUserProfileDetails]>(API_ENDPOINTS.bnrcSendOtpRegistration, { value })
  // }
  bnrcSendOtp(phone: { phone: string }): Observable<IUserProfileDetails[]> {
    return this.http.post<IUserProfileDetails[]>(API_ENDPOINTS.bnrcSendOtpRegistration, phone)
  }
  bnrcResendOtp(phone: { phone: string }): Observable<[IUserProfileDetails]> {
    return this.http.post<[IUserProfileDetails]>(API_ENDPOINTS.bnrcReSendOtpRegistration, phone)
  }

  bnrcValidateOtp(value: { phone: string; otp: string }): Observable<IUserProfileDetails[]> {
    return this.http.post<IUserProfileDetails[]>(API_ENDPOINTS.bnrcValidateOtpRegistration, value)
  }
  upsmfRegistration(value: any): Observable<[IUserProfileDetails]> {
    return this.http.post<[IUserProfileDetails]>(API_ENDPOINTS.upsmfRegistration, { value })
  }
  upsmfSendOtp(phone: { phone: string }): Observable<IUserProfileDetails[]> {
    return this.http.post<IUserProfileDetails[]>(API_ENDPOINTS.upsmfSendOtpRegistration, phone)
  }
  upsmfResendOtp(phone: { phone: string }): Observable<[IUserProfileDetails]> {
    return this.http.post<[IUserProfileDetails]>(API_ENDPOINTS.upsmfReSendOtpRegistration, phone)
  }

  mpValidateOtp(value: { phone: string; otp: string }): Observable<IUserProfileDetails[]> {
    return this.http.post<IUserProfileDetails[]>(API_ENDPOINTS.mpValidateOtpRegistration, value)
  }
  mpRegistration(value: any): Observable<[IUserProfileDetails]> {
    return this.http.post<[IUserProfileDetails]>(API_ENDPOINTS.mpRegistration, { value })
  }
  mpSendOtp(phone: { phone: string }): Observable<IUserProfileDetails[]> {
    return this.http.post<IUserProfileDetails[]>(API_ENDPOINTS.mpSendOtpRegistration, phone)
  }
  mpResendOtp(phone: { phone: string }): Observable<[IUserProfileDetails]> {
    return this.http.post<[IUserProfileDetails]>(API_ENDPOINTS.mpReSendOtpRegistration, phone)
  }

  upsmfValidateOtp(value: { phone: string; otp: string }): Observable<IUserProfileDetails[]> {
    return this.http.post<IUserProfileDetails[]>(API_ENDPOINTS.upsmfValidateOtpRegistration, value)
  }
  getMasterLanguages(): Observable<ILanguagesApiData> {
    return this.http.get<ILanguagesApiData>(API_ENDPOINTS.getMasterLanguages)
  }
  getMasterNationlity(): Observable<INationalityApiData> {
    return this.http.get<INationalityApiData>(API_ENDPOINTS.getMasterNationlity)
  }
  // getProfilePageMeta(): Observable<IProfileMetaApiData> {
  //   return this.http.get<IProfileMetaApiData>(API_ENDPOINTS.getProfilePageMeta)
  // }
  // getUserdetailsFromRegistry(): Observable<[IUserProfileDetailsFromRegistry]> {
  //   return this.http.get<[IUserProfileDetailsFromRegistry]>(API_ENDPOINTS.getUserdetailsFromRegistry)
  // }
  getUserdetailsFromRegistry(wid: string): Observable<[IUserProfileDetailsFromRegistry]> {
    // Check if data is already cached for this user (in-memory)
    if (this.userDetailsCache.has(wid)) {
      const cachedData = this.userDetailsCache.get(wid)
      console.log(`[UserProfileService] Returning cached user details for ${wid}`)
      return of(cachedData)
    }

    // Check global user data cache from UserDataCacheService
    const globalCachedData = this.userDataCacheSvc.getCachedUserData()
    if (globalCachedData && globalCachedData.userId) {
      console.log(`[UserProfileService] Using user details from global UserDataCache`)
      this.userDetailsCache.set(wid, globalCachedData)
      return of(globalCachedData)
    }

    // If not cached, fetch from API and cache the result
    return this.http.get<[IUserProfileDetailsFromRegistry]>(`${API_ENDPOINTS.getUserdetailsFromRegistry}/${wid}`)
      .pipe(
        retry(1),
        map((res: any) => res.result.response),
        tap((data: any) => {
          // Cache the result in-memory for fast access
          this.userDetailsCache.set(wid, data)
          // Also cache globally using UserDataCacheService (which handles session storage and 6-hour expiration)
          this.userDataCacheSvc.setUserData(data)
          console.log(`[UserProfileService] Cached user details for ${wid} in global cache`)
        }),
      )
  }
  getAllDepartments() {
    return this.http.get<INationalityApiData>(API_ENDPOINTS.getAllDepartments)
  }
  approveRequest(data: any) {
    return this.http.post(API_ENDPOINTS.approveRequest, data)
  }
  listApprovalPendingFields() {
    return this.http.post<any>(API_ENDPOINTS.getPendingFields, {
      serviceName: 'profile',
      applicationStatus: 'SEND_FOR_APPROVAL',
    })
  }
  getLeaderBoardData(request): Observable<any> {
    const options = {
      url: API_ENDPOINTS.getLeaderBoardData,
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
    console.log('[UserProfileService] User details cache cleared')
  }

  /**
   * Force refresh of global user data cache
   * This should be called after updating profile to ensure cached data is refreshed
   */
  refreshGlobalUserDataCache(userDataCacheSvc: any): void {
    if (userDataCacheSvc) {
      console.log('[UserProfileService] Refreshing global user data cache')
      userDataCacheSvc.clearUserData()
      // Clear per-user cache as well
      this.userDetailsCache.clear()
    }
  }
}
