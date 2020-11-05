import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { IWsCounterInfyMeResponse, IWsCounterPlatformResponse } from '../models/counter.model'

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
export class CounterService {
  constructor(private http: HttpClient) {}

  fetchPlatformCounterData(): Observable<IWsCounterPlatformResponse> {
    return this.http.get<IWsCounterPlatformResponse>(`${API_END_POINTS.lexPlatform}`)
  }

  fetchInfyMeCounterData(): Observable<IWsCounterInfyMeResponse> {
    return this.http.get<IWsCounterInfyMeResponse>(`${API_END_POINTS.infyMeCounter}`)
  }
}
