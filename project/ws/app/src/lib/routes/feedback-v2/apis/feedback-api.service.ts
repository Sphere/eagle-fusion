import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { IFeedbackSearchRequest, IFeedback } from '../models/feedback.model'

@Injectable()
export class FeedbackApiService {
  private readonly ROOT_ORG: string
  private readonly FEEDBACK_API_BASE = '/apis/protected/v8/user/feedbackV2'

  constructor(private http: HttpClient) {
    this.ROOT_ORG = 'Infosys'
  }

  searchFeedback(query: IFeedbackSearchRequest) {
    return this.http.post(`${this.FEEDBACK_API_BASE}/search`, query, {
      headers: { rootOrg: this.ROOT_ORG },
    })
  }

  submitPlatformFeedback(feedback: IFeedback) {
    return this.http.post(`${this.FEEDBACK_API_BASE}/platform`, feedback, {
      headers: { rootOrg: this.ROOT_ORG },
    })
  }
}
