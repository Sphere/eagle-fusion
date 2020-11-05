import { Injectable } from '@angular/core'
import { AUTHORING_IAP_BASE } from '@ws/author/src/lib/constants/apiEndpoints'
import { ApiService } from '@ws/author/src/public-api'
import { Observable } from 'rxjs'
import { ConfigurationsService } from '@ws-widget/utils'

@Injectable()
export class IapAssessmentService {
  constructor(
    private apiService: ApiService,
    private configservice: ConfigurationsService,
  ) { }

  getIapId(data: any): Observable<any> {
    return this.apiService.post<any>(
      `${AUTHORING_IAP_BASE}Contest/Authoring/CreateContest?rootOrg=${this.configservice.rootOrg || 'Infosys'}`,
      data,
      )
  }

  getObjQuestions(questionDetails: any) {
    return this.apiService.post<any>(
      `${AUTHORING_IAP_BASE}elastic/searchObjV2/?pageCount=500&page=1&rootOrg=${this.configservice.rootOrg || 'Infosys'}`,
      questionDetails,
    )
  }
  getGroupQuestions(groupDetails: any) {
    return this.apiService.post<any>(
      `${AUTHORING_IAP_BASE}Contest/Authoring/Groups/Fetch`,
      groupDetails,
    )
  }
  getSectionId(sectionDetails: any) {
    return this.apiService.post<any>(
      `${AUTHORING_IAP_BASE}Authoring/CreateSection?rootOrg=${this.configservice.rootOrg || 'Infosys'}`,
      sectionDetails,
    )
  }
  removeSection(sectionDetails: any) {
    return this.apiService.post<any>(`${AUTHORING_IAP_BASE}Authoring/RemoveSection`, sectionDetails)
  }
  addObjQuestionstoSections(data: any) {
    return this.apiService.post<any>(
      `${AUTHORING_IAP_BASE}Contest/Authoring/AddObjectiveQuestionsToSection`,
      data,
    )
  }
  adGroupQuestionsToSections(data: any) {
    return this.apiService.post<any>(
      `${AUTHORING_IAP_BASE}Contest/Authoring/AddGroupToSection`,
      data,
    )
  }
  removeObjQuestionstoSections(data: any) {
    return this.apiService.post<any>(
      `${AUTHORING_IAP_BASE}Contest/Authoring/Draft/RemoveObjectiveQuestionsFromSection`,
      data,
    )
  }
  getContestDetails(data: any) {
    return this.apiService.post<any>(`${AUTHORING_IAP_BASE}Contest/Authoring/GetContest`, data)
  }
  getCreatedSection(data: any) {
    return this.apiService.post<any>(`${AUTHORING_IAP_BASE}Authoring/getCreatedSection`, data)
  }

  getSectionData(sectionId: string) {
    return this.apiService.get<any>(`${AUTHORING_IAP_BASE}Authoring/getSections/${sectionId}`)
  }
  editRandomization(data: any) {
    return this.apiService.post<any>(`${AUTHORING_IAP_BASE}Authoring/Groups/Randomization`, data)
  }
  removeGroupFromSection(data: any) {
    return this.apiService.post<any>(`${AUTHORING_IAP_BASE}Authoring/RemoveGroupFromSection`, data)
  }
  saveContestDetails(data: any) {
    return this.apiService.post<any>(`${AUTHORING_IAP_BASE}ResultAuthoring/EditContest`, data)
  }
  reviewContestFlow(data: any) {
    return this.apiService.post<any>(`${AUTHORING_IAP_BASE}ResultAuthoring/Review/Contest`, data)
  }

  publishContest(data: any) {
    return this.apiService.post<any>(`${AUTHORING_IAP_BASE}Authoring/DraftToPublished`, data)
  }
  contestToDraft(data: any) {
    return this.apiService.post<any>(`${AUTHORING_IAP_BASE}Contest/Authoring/PublishToDraft`, data)
  }

  editSectionName(data: any) {
    return this.apiService.post<any>(`${AUTHORING_IAP_BASE}Authoring/EditSectionName`, data)
  }
}
