import { Injectable } from '@angular/core'
import { ReplaySubject } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class GraphGeneralService {
  filterEventChangeSubject = new ReplaySubject<{ filterName: string, filterType: string | undefined }>(1)
  filterEvent = undefined
  constructor() { }
  updateFilterEvent(filterEvent: { filterName: string, filterType: string | undefined }) {
    this.filterEventChangeSubject.next(filterEvent)
  }

}
