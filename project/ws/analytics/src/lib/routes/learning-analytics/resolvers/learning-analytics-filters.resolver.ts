import { Injectable } from '@angular/core'
import { ReplaySubject } from 'rxjs'
import { NsAnalytics } from '../models/learning-analytics.model'
@Injectable({
  providedIn: 'root',
})
export class AnalyticsResolver {
  dateEventChangeSubject = new ReplaySubject<{ startDate: string, endDate: string }>(1)
  searchEventChangeSubject = new ReplaySubject<{ searchQuery: string }>(1)
  removeFilterEventChangeSubject = new ReplaySubject<NsAnalytics.IFilter[]>(1)

  dateEvent = undefined
  searchEvent = undefined
  removeEvent = undefined
  constructor() { }
  setDateFilterEvent(dateEvent: { startDate: string, endDate: string }) {
    this.dateEventChangeSubject.next(dateEvent)
  }
  setSearchFilterEvent(searchEvent: { searchQuery: string }) {
    this.searchEventChangeSubject.next(searchEvent)
  }
  removeFilterEvent(removeEvent: NsAnalytics.IFilter[]) {
    this.removeFilterEventChangeSubject.next(removeEvent)
  }
}
