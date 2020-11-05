import { Component, OnInit, EventEmitter, Output } from '@angular/core'
// import { ISearchRequest } from '../../../../../../../../../../app/src/lib/routes/search/models/search.model'
import { NsContentStripRequest } from '../../models/content-strip-request.model'

@Component({
  selector: 'ws-admin-search-request',
  templateUrl: './search-request.component.html',
  styleUrls: ['./search-request.component.scss'],
})
export class SearchRequestComponent implements OnInit {
  @Output() searchRequest = new EventEmitter<any>()
  request: any = {
    query: '',
    filters: {},
    pageNo: 0,
    pageSize: 10,
    locale: [],
    sort: [{
      lastUpdatedOn: 'desc',
    }],
  }

  sortOrderTypes = NsContentStripRequest.ESearchSortOrderTypes
  sortOrder: NsContentStripRequest.ESearchSortOrderTypes =
    NsContentStripRequest.ESearchSortOrderTypes.ASCENDING

  sortByTypes = NsContentStripRequest.ESearchSortByTypes
  sortBy: NsContentStripRequest.ESearchSortByTypes =
    NsContentStripRequest.ESearchSortByTypes.LAST_UPDATED_ON

  constructor() { }

  ngOnInit() { }

  updateQuery(val: string) {
    let queryParams: any = val.split('?')[1]
    queryParams = queryParams.split('&')
    const res: any = {}
    queryParams.forEach((query: any) => {
      res[query.split('=')[0]] = decodeURIComponent(query.split('=')[1])
    })
    if (res.f) {
      res.f = JSON.parse(res.f)
      this.request.filters = res.f
    }
    if (res.lang) {
      this.request.locale.push(res.lang)
    }
    if (res.q) {
      this.request.query = res.q
    }
  }

  save() {
    if (this.request) {
      const request = {
        search: this.request,
      }
      this.searchRequest.emit(request)
    }
  }
}
