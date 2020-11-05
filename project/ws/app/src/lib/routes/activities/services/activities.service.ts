import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ConfigurationsService } from '@ws-widget/utils'
import { IActivity } from '../interfaces/activities.model'

@Injectable({
  providedIn: 'root',
})
export class ActivitiesService {

  constructor(
    private configSvc: ConfigurationsService,
    private http: HttpClient) { }

  fetchActivites() {
    const activities: Promise<IActivity> = this.http
      .get<IActivity>(`${this.configSvc.baseUrl}/feature/activities.json`)
      .toPromise()
    return activities
  }
}
