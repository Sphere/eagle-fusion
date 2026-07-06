import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'
import { NSProfileData } from '../models/profile.model'
// import { ITimeSpent } from '../routes/learning/models/learning.models'
import { ConfigurationsService } from '@ws-widget/utils'
import { API_END_POINTS } from '../../../../../../../../src/app/constants/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  httpOptions = {
    headers: new HttpHeaders({
      validator_URL: `https://${this.configSvc.hostPath}${API_END_POINTS.VALIDATE_USER}`,
    }),
  }
  baseUrl = this.configSvc.sitePath
  constructor(private http: HttpClient, private configSvc: ConfigurationsService) { }

  fetchConfigFile(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/feature/profile.json`).pipe()
  }

  timeSpent(
    startDate: string,
    endDate: string,
    contentType: string,
    isCompleted: number,
  ): Observable<NSProfileData.ITimeSpentResponse> {
    return this.http.get<NSProfileData.ITimeSpentResponse>(
      `${API_END_POINTS.TIME_SPENT}?startDate=${startDate}&endDate=${endDate}&isCompleted=${isCompleted}&contentType=${contentType}`,
      this.httpOptions,
    )
  }

  nsoArtifacts(
    startDate: string,
    endDate: string,
    contentType: string,
    isCompleted: number,
  ): Observable<NSProfileData.INsoResponse> {
    return this.http.get<NSProfileData.INsoResponse>(
      `${API_END_POINTS.NSO_PROGRESS}?startDate=${startDate}&endDate=${endDate}&isCompleted=${isCompleted}&contentType=${contentType}`,
      this.httpOptions,
    )
  }

  // getDashBoard(startDate: string, endDate: string): Observable<ITimeSpent> {
  //   // tslint:disable-next-line:max-line-length
  //   return this.http.get<ITimeSpent>(
  //     `${LA_API_END_POINTS.USER_ORG_GRAPH}?startdate=${startDate}&enddate=${endDate}`,
  //   )
  // }
}
