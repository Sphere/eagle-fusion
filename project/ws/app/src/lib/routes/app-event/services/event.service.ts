import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, BehaviorSubject } from 'rxjs'

const apiEndPoint = '/apis/protected/v8/event-external/'
@Injectable()
export class EventService {
  bannerisEnabled = new BehaviorSubject<boolean>(true)
  constructor(private http: HttpClient) { }

  getEventData(): Observable<any> {
    return this.http.get(apiEndPoint)
  }
}
