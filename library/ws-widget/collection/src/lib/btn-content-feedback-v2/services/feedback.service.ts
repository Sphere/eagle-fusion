import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import {
  IFeedbackSearchQuery,
  IFeedback,
  IFeedbackThread,
  IFeedbackSearchResult,
  IFeedbackSummary,
  IFeedbackConfig,
  INotificationRequest,
} from '../models/feedback.model'
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private readonly FEEDBACK_API_BASE = '/apis/protected/v8/user/feedbackV2'
  private readonly EVENT_NOTIFICATION = '/apis/protected/v8/user/share/content'

  constructor(private http: HttpClient) { }

  searchFeedback(query: IFeedbackSearchQuery): Observable<IFeedbackSearchResult> {
    return this.http.post<IFeedbackSearchResult>(`${this.FEEDBACK_API_BASE}/search`, query)
  }

  getFeedbackThread(feedbackId: string): Observable<IFeedbackThread[]> {
    return this.http.get<IFeedbackThread[]>(`${this.FEEDBACK_API_BASE}/${feedbackId}`)
  }

  submitPlatformFeedback(feedback: IFeedback): Observable<any> {
    return this.http.post(`${this.FEEDBACK_API_BASE}/platform`, feedback)
  }

  contentShareNew(req: INotificationRequest) {
    return this.http.post(
      this.EVENT_NOTIFICATION,
      req,
    )
  }

  submitContentFeedback(feedback: IFeedback): Observable<any> {
    return this.http.post(`${this.FEEDBACK_API_BASE}/content/${feedback.contentId}`, feedback)
  }

  submitContentRequest(feedback: IFeedback): Observable<any> {
    return this.http.post(`${this.FEEDBACK_API_BASE}/content-request`, feedback)
  }

  submitServiceRequest(feedback: IFeedback): Observable<any> {
    return this.http.post(`${this.FEEDBACK_API_BASE}/service-request`, feedback)
  }

  getFeedbackSummary(): Observable<IFeedbackSummary> {
    return this.http.get<IFeedbackSummary>(`${this.FEEDBACK_API_BASE}/feedback-summary`)
  }

  updateFeedbackStatus(rootFeedbackId: string, category?: string): Observable<IFeedbackThread> {
    let url = `${this.FEEDBACK_API_BASE}/${rootFeedbackId}`
    if (category) {
      url += `?category=${category}`
    }
    return this.http.patch<IFeedbackThread>(url, {})
  }

  getFeedbackConfig(): Observable<IFeedbackConfig> {
    return this.http.get<IFeedbackConfig>(`${this.FEEDBACK_API_BASE}/config`)
  }
}
