import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { IContentAssignModel, IUserSearchRequestModel } from './content-assign.model'
import { API_END_POINTS } from '../../../../../../src/app/constants/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class ContentAssignService {

  constructor(private http: HttpClient) { }

  searchUsers(searchUserRequest: IUserSearchRequestModel) {
    return this.http.post(API_END_POINTS.searchUsers, searchUserRequest)
  }

  getAdminLevel() {
    return this.http.get(API_END_POINTS.getAdminLevel)
  }

  assignContent(assignRequest: IContentAssignModel) {
    return this.http.post(API_END_POINTS.assignContent, assignRequest)
  }

  getAssignments(userType: string) {
    return this.http.get(`${API_END_POINTS.getAssignments}?assignmentType=${userType}`)
  }

  getManagerDetails(wid: string, rootOrg: string) {
    const reqBody = {
      source_fields: ['wid'],
      conditions: {
        wid,
        'json_unmapped_fields->>\'is_manager\'': true,
        root_org: rootOrg
        ,
      },
    }
    return this.http.post(API_END_POINTS.managerDetails, reqBody)
  }

}
