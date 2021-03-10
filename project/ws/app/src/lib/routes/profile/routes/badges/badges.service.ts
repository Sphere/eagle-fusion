import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { IBadgeResponse, IUserNotifications } from './badges.model'
import { HttpClient } from '@angular/common/http'
import { map } from 'rxjs/operators'
const PROTECTED_SLAG_V8 = '/apis/protected/v8'

const API_END_POINTS = {
  USER_BADGE: `${PROTECTED_SLAG_V8}/user/badge`,
  USER_BADGE_RECENT: `${PROTECTED_SLAG_V8}/user/badge/notification`,
  USER_BADGES_UPDATE: `${PROTECTED_SLAG_V8}/user/badge/update`,
  GENERATE_QRCODE: `${PROTECTED_SLAG_V8}/generateQRCode`
}

@Injectable({
  providedIn: 'root',
})
export class BadgesService {
  constructor(private http: HttpClient) { }

  fetchBadges(): Observable<IBadgeResponse> {
    return this.http.get<IBadgeResponse>(`${API_END_POINTS.USER_BADGE}`)
  }

  reCalculateBadges(): Observable<any> {
    return this.http.post(`${API_END_POINTS.USER_BADGES_UPDATE}`, {})
  }

  fetchRecentBadge(): Observable<IUserNotifications> {
    return this.http
      .get<any>(API_END_POINTS.USER_BADGE_RECENT)
      .pipe(map(notifications => notifications))
  }

  generateQRCode(req: { firstName: any; lastName: any; course: string; date: string }): Observable<any> {
    return this.http.post(`${API_END_POINTS.GENERATE_QRCODE}`, req)
  }
}
