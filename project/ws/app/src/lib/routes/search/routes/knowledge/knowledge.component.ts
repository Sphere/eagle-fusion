import { Component, OnInit, OnDestroy } from '@angular/core'
import { SearchServService } from '../../services/search-serv.service'
import { Router, ActivatedRoute } from '@angular/router'
import {
  IKhubItemTile,
  IKhubViewResultDocs,
  IKhubFetchStatus,
} from '../../../infy/routes/knowledge-hub/models/knowledgeHub.model'
import { IFilterUnitResponse } from '../../models/search.model'
import { Subscription } from 'rxjs'
import { ValueService } from '@ws-widget/utils'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { NsError, ROOT_WIDGET_CONFIG } from '@ws-widget/collection'

@Component({
  selector: 'ws-app-knowledge',
  templateUrl: './knowledge.component.html',
  styleUrls: ['./knowledge.component.scss'],
})
export class KnowledgeComponent implements OnInit, OnDestroy {
  defaultSideNavBarOpenedSubscription: Subscription | null = null
  isLtMedium$ = this.valueSvc.isLtMedium$
  screenSizeIsLtMedium = false
  sideNavBarOpened = true
  searchRequestStatus: IKhubFetchStatus = 'none'
  searchResultsSubscription: Subscription | undefined
  routeComp = 'knowledge'
  filtersResetAble = false
  selectedFilterSet: Set<string> = new Set()
  filtersResponse: IFilterUnitResponse[] = []
  searchObj = {
    searchQuery: '',
    from: 0,
    size: 18,
    category: 'document',
    filter: '',
  }
  searchRequest: {
    query: string;
    filters: { [type: string]: string[] };
    sort?: string;
  } = {
    query: '',
    filters: {},
    sort: '',
  }
  khubResult: IKhubViewResultDocs = {
    count: 0,
    filters: {},
    hits: [],
  }
  knowledgeData: IKhubItemTile[] = []
  noContent = false
  error = {
    load: false,
    message: '',
  }
  errorWidget: NsWidgetResolver.IRenderConfigWithTypedData<NsError.IWidgetErrorResolver> = {
    widgetType: ROOT_WIDGET_CONFIG.errorResolver._type,
    widgetSubType: ROOT_WIDGET_CONFIG.errorResolver.errorResolver,
    widgetData: {
      errorType: 'internalServer',
    },
  }
  constructor(
    private activated: ActivatedRoute,
    private router: Router,
    private valueSvc: ValueService,
    private searchServ: SearchServService,
  ) {}

  ngOnInit() {
    this.defaultSideNavBarOpenedSubscription = this.isLtMedium$.subscribe((isLtMedium: boolean) => {
      this.screenSizeIsLtMedium = isLtMedium
      this.sideNavBarOpened = !isLtMedium
    })
    this.activated.queryParamMap.subscribe(queryParams => {
      // Reset search request object
      this.searchRequest = {
        query: '',
        filters: {},
      }
      this.searchObj.from = 0
      this.searchObj.filter = ''
      this.knowledgeData = []
      // query
      if (queryParams.has('q')) {
        this.searchRequest.query = queryParams.get('q') || ''
        this.searchObj.searchQuery = this.searchRequest.query
      }
      // filters
      if (queryParams.has('f')) {
        const filters = JSON.parse(queryParams.get('f') || '{}')
        this.searchRequest.filters = filters
        this.searchObj.filter = this.searchServ.formatFilterForSearch(filters)
      }
      if (queryParams.has('sort')) {
        this.searchRequest.sort = queryParams.get('sort') || ''
      }
      this.noContent = false
      const updatedFilterSet = this.searchServ.updateSelectedFiltersSet(this.searchRequest.filters)
      this.selectedFilterSet = updatedFilterSet.filterSet
      this.filtersResetAble = updatedFilterSet.filterReset
      this.getResults()
    })
  }
  ngOnDestroy() {
    if (this.searchResultsSubscription) {
      this.searchResultsSubscription.unsubscribe()
    }
    if (this.defaultSideNavBarOpenedSubscription) {
      this.defaultSideNavBarOpenedSubscription.unsubscribe()
    }
  }
  getResults() {
    try {
      if (this.searchResultsSubscription) {
        this.searchResultsSubscription.unsubscribe()
      }
      this.searchRequestStatus = 'fetching'
      this.searchResultsSubscription = this.searchServ
        .fetchSearchDataDocs(this.searchObj)
        .subscribe(
          data => {
            this.khubResult = data
            this.knowledgeData = [
              ...this.knowledgeData,
              ...this.searchServ.setTilesDocs(this.khubResult.hits),
            ]
            this.filtersResponse = this.searchServ.handleFilters(
              this.searchServ.formatKhubFilters(data.filters),
              this.selectedFilterSet,
              this.searchRequest.filters,
            ).filtersRes
            if (this.khubResult.hits.length < this.khubResult.count) {
              this.searchRequestStatus = 'hasMore'
            } else {
              this.searchRequestStatus = 'done'
            }
            if (this.khubResult.count === 0) {
              this.noContent = true
            }
            this.searchObj.from += this.searchObj.size
          },
          // this.searchRequestStatus = 'error'
          error => {
            this.error.load = true
            this.error.message = error
            this.searchRequestStatus = 'done'
          },
        )
    } catch (e) {
      throw e
    }
  }

  removeFilters() {
    this.router.navigate([], {
      queryParams: { f: null },
      queryParamsHandling: 'merge',
      relativeTo: this.activated.parent,
    })
  }
  sortOrder(type: string) {
    try {
      this.router.navigate([], {
        queryParams: { sort: type },
        queryParamsHandling: 'merge',
        relativeTo: this.activated.parent,
      })
    } catch (e) {
      throw e
    }
  }
  closeFilter(value: boolean) {
    this.sideNavBarOpened = value
  }
}
