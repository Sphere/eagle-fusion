import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, BehaviorSubject } from 'rxjs'
import {
  IUserProfileDetails,
  ILanguagesApiData,
  INationalityApiData,
  IUserProfileDetailsFromRegistry,
} from '../models/user-profile.model'
import { map, retry } from 'rxjs/operators'

const API_ENDPOINTS = {
  // updateProfileDetails: '/apis/protected/v8/user/profileRegistry/updateUserRegistry',
  updateProfileDetails: '/apis/protected/v8/user/profileDetails/updateUser',
  // getUserdetailsFromRegistry: '/apis/protected/v8/user/profileRegistry/getUserRegistryById',
  getUserdetailsFromRegistry: '/apis/proxies/v8/api/user/v2/read',
  getUserdetails: '/apis/protected/v8/user/details/detailV1',
  getMasterNationlity: '/apis/protected/v8/user/profileRegistry/getMasterNationalities',
  getMasterLanguages: '/apis/protected/v8/user/profileRegistry/getMasterLanguages',
  // getProfilePageMeta: '/apis/protected/v8/user/profileRegistry/getProfilePageMeta',
  getAllDepartments: '/apis/protected/v8/portal/listDeptNames',
  approveRequest: '/apis/protected/v8/workflowhandler/transition',
  getPendingFields: '/apis/protected/v8/workflowhandler/userWFApplicationFieldsSearch',
  // getProfilePageMeta: '/apis/protected/v8/user/profileDetails/getProfilePageMeta',
}

@Injectable()
export class UserProfileService {
  public _updateuser = new BehaviorSubject<any>(undefined)
  // Observable navItem stream
  updateuser$ = this._updateuser.asObservable()
  constructor(
    private http: HttpClient,
  ) {
  }
  updateProfileDetails(data: any) {
    return this.http.patch<any>(API_ENDPOINTS.updateProfileDetails, data)
  }
  getUserdetails(email: string | undefined): Observable<[IUserProfileDetails]> {
    return this.http.post<[IUserProfileDetails]>(API_ENDPOINTS.getUserdetails, { email })
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
    return this.http.get<[IUserProfileDetailsFromRegistry]>(`${API_ENDPOINTS.getUserdetailsFromRegistry}/${wid}`)
      .pipe(retry(1),
        map((res: any) => res.result.response))
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

  isBackgroundDetailsFilled(profileReq: any): boolean {
    let isFilled = true
    if (profileReq && profileReq.personalDetails && profileReq.professionalDetails && profileReq.professionalDetails[0]) {
      const personalDetails = profileReq.personalDetails
      const professionalDetails = profileReq.professionalDetails[0]
      if (!(personalDetails.dob
        && personalDetails.postalAddress
        && professionalDetails.profession)) {
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
          isFilled = professionalDetails.qualification ? isFilled : false
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
}
