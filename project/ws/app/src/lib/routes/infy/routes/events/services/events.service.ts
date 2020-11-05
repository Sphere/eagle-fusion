import { Injectable } from '@angular/core'
import { IEvent } from '../models/event.model'
import { Observable } from 'rxjs'
import { HttpClient } from '@angular/common/http'

const PROTECTED_SLAG_V8 = '/apis/protected/v8'

const API_END_POINTS = {
  LIVE_EVENTS: `${PROTECTED_SLAG_V8}/events`,
}

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  constructor(private http: HttpClient) {}

  fetchLiveEvents(): Observable<IEvent[]> {
    return this.http.get<IEvent[]>(`${API_END_POINTS.LIVE_EVENTS}`)
  }
}
