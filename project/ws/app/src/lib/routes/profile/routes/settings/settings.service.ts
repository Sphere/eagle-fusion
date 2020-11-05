import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { NsSettings } from './settings.model'

const API_END_POINTS = {
  NOTIFICATIONS: `/apis/protected/v8/user/notifications/settings`,
}

@Injectable()
export class SettingsService {

  constructor(
    private http: HttpClient,
  ) { }

  fetchNotificationSettings(): Observable<NsSettings.INotificationGroup[]> {
    return this.http.get<NsSettings.INotificationGroup[]>(API_END_POINTS.NOTIFICATIONS)
  }
  updateNotificationSettings(body: NsSettings.INotificationGroup[]): Observable<any> {
    return this.http.patch(API_END_POINTS.NOTIFICATIONS, body)
  }
}
