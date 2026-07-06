import { Injectable } from '@angular/core'
import { map } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http'
import {
  IWsEmailTextRequest,
  IWsEmailResponse,
  IWsEmailUserId,
  IWsUserFollow,
} from '../model/leadership-email.model'
import { Observable } from 'rxjs'
import { API_END_POINTS } from '../../../constants/apiConstants'

const RANDOM_ID_PER_USER = 0

@Injectable({
  providedIn: 'root',
})
export class LeadershipService {
  constructor(private http: HttpClient) { }

  get randomId() {
    return RANDOM_ID_PER_USER + 1
  }

  shareTextMail(req: IWsEmailTextRequest): Observable<IWsEmailResponse> {
    return this.http.post<any>(API_END_POINTS.EMAIL_TEXT, req).pipe(map(u => u.result))
  }

  emailToUserId(email: string): Observable<IWsEmailUserId> {
    return this.http.get<IWsEmailUserId>(`${API_END_POINTS.EMAIL_TO_USERID}/${email}`)
  }

  //  Follow
  fetchUserFollow(userId: string): Observable<IWsUserFollow> {
    const body = {
      userid: userId,
    }
    return this.http.post<IWsUserFollow>(`${API_END_POINTS.USER_FOLLOW_DATA}`, body)
  }
  followUser(request: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.USER_FOLLOW, request)
  }
  unFollowUser(request: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.USER_UNFOLLOW, request)
  }
}
