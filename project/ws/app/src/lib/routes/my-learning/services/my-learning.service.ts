import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ConfigurationsService } from '@ws-widget/utils'
import { Observable } from 'rxjs'
import { NSLearningData } from '../models/my-learning.model'

const PROTECTED_SLAG_V8 = `/LA1`

const LA_API_END_POINTS = {
  MY_LEARNING: `${PROTECTED_SLAG_V8}/api/la/myLearning`,
}

@Injectable({
  providedIn: 'root',
})
export class MyLearningService {
  httpOptions = {
    headers: new HttpHeaders({
      validator_URL: `https://${this.configSvc.hostPath}/apis/protected/v8/user/validate`,
    }),
  }
  constructor(private http: HttpClient, private configSvc: ConfigurationsService) { }

  getMyLearningData(): Observable<NSLearningData.ILearningDetails> {
    return this.http.get<NSLearningData.ILearningDetails>(
      `${LA_API_END_POINTS.MY_LEARNING}`,
      this.httpOptions,
    )
  }
}
