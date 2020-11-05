import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { IWsEmailTextRequest, IWsEmailResponse } from '../models/co-create.model'
import { IWsToDoListResponse } from '../models/ocm.model'
import { IWsFeedbackTypeRequest } from '../models/feedback.model'

import { map } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http'

export const API_SERVER_BASE = '/apis'
const PROTECTED_SLAG_V8 = `${API_SERVER_BASE}/protected/v8`

const API_END_POINTS = {
  lexPlatform: `${PROTECTED_SLAG_V8}/counter`,
  infyMeCounter: `${PROTECTED_SLAG_V8}/counter/infyMe`,
  EMAIL_TEXT: `${PROTECTED_SLAG_V8}/user/email/emailText`, // #POST
  USER_FEEDBACK: `${PROTECTED_SLAG_V8}/user/feedback`,
  FETCH_TO_DOS: `${PROTECTED_SLAG_V8}/user/ocm/getToDos`,
}
@Injectable({
  providedIn: 'root',
})
export class OcmService {
  constructor(private http: HttpClient) {}

  shareTextMail(req: IWsEmailTextRequest): Observable<IWsEmailResponse> {
    return this.http.post<any>(API_END_POINTS.EMAIL_TEXT, req).pipe(map(u => u.result))
  }

  submitFeedback(request: IWsFeedbackTypeRequest): Observable<any> {
    return this.submitFeedbackWithData(request)
  }

  submitFeedbackWithData(data: IWsFeedbackTypeRequest): Observable<any> {
    // converting rating to string as per API request contract
    if (data.rating) {
      data.rating = data.rating.toString()
    }
    return this.http.post<any>(API_END_POINTS.USER_FEEDBACK, { request: data }).pipe(
      map(response => {
        return response.result
      }),
    )
  }

  fetchToDos(id: string): Observable<IWsToDoListResponse[]> {
    return this.http.get<IWsToDoListResponse[]>(`${API_END_POINTS.FETCH_TO_DOS}/${id}`)
  }
}
