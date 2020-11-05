import { Component, OnInit, OnDestroy } from '@angular/core'
import { SearchApiService } from '../../apis/search-api.service'
import { Router, ActivatedRoute } from '@angular/router'
import { SearchServService } from '../../services/search-serv.service'
import { Subscription } from 'rxjs'
import {
  TSocialPostKind,
  IFilterUnitResponse,
  ISocialSearchResult,
  ISearchSocialSearchPartialRequest,
} from '../../models/search.model'
import { IKhubFetchStatus } from '../../../infy/routes/knowledge-hub/models/knowledgeHub.model'
import { NsContent, NsError, ROOT_WIDGET_CONFIG } from '@ws-widget/collection'
import { ValueService } from '@ws-widget/utils'
import { NsWidgetResolver } from '@ws-widget/resolver'

@Component({
  selector: 'ws-app-social',
  templateUrl: './social.component.html',
  styleUrls: ['./social.component.scss'],
})
export class SocialComponent implements OnInit, OnDestroy {
  defaultSideNavBarOpenedSubscription: Subscription | null = null
  isLtMedium$ = this.valueSvc.isLtMedium$
  screenSizeIsLtMedium = false
  sideNavBarOpened = true
  searchRequestStatus: IKhubFetchStatus = 'none'
  filtersResponse: IFilterUnitResponse[] = []
  searchResults: ISocialSearchResult = {} as ISocialSearchResult
  searchRequestObject: ISearchSocialSearchPartialRequest = {
    userId: this.authSvc.userId || '',
    query: '',
    pageNo: 0,
    pageSize: 10,
    sessionId: Date.now(),
    postKind: 'Query',
    filters: {},
    locale: ['en'],
    sort: [],
  }
  searchRequest: {
    query: string;
    filters: { [type: string]: string[] };
    social?: string;
    sort?: string;
  } = {
    query: '',
    filters: {},
    social: '',
    sort: 'Relevance',
  }
  searchResultsSubscription: Subscription | undefined
  selectedFilterSet: Set<string> = new Set()
  error = {
    load: false,
    message: '',
  }
  filtersResetAble = false
  noContent = false
  query = true
  routeComp = 'social'
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
    private authSvc: SearchApiService,
    private valueSvc: ValueService,
    private searchSrv: SearchServService,
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
      // query
      if (queryParams.has('q')) {
        this.searchRequestObject.query = queryParams.get('q') || ''
      }
      // filters
      if (queryParams.has('f')) {
        // try {
        const filters = JSON.parse(queryParams.get('f') || '{}')
        this.searchRequest.filters = filters
        this.searchRequestObject.filters = filters

        // } catch (err) {
        //   logger.error('Unable to read filter from query. Possibly cause is invalid filter object/JSON', err);
        // }
      }
      if (queryParams.has('sort')) {
        this.searchRequest.sort = queryParams.get('sort') || 'Relevance'
        if (this.searchRequest.sort) {
          if (this.searchRequest.sort === 'Latest') {
            this.searchRequestObject.sort = [{ dtLastModified: 'desc' }]
          } else if (this.searchRequest.sort === 'Trending') {
            this.searchRequestObject.sort = this.query
              ? [{ upVoteCount: 'desc' }]
              : [{ likeCount: 'desc' }]
          } else {
            this.searchRequestObject.sort = []
          }
        }
      } else {
        this.searchRequest.sort = 'Relevance'
      }
      if (queryParams.has('social')) {
        this.searchRequest.social = queryParams.get('social') || ''
        if (this.searchRequest.social) {
          this.query = this.searchRequest.social === 'Query' ? true : false
          this.searchRequestObject.postKind = this.searchRequest.social as TSocialPostKind
        }
      }
      this.noContent = false
      if (
        this.searchRequestObject.filters &&
        !Object.keys(this.searchRequestObject.filters).length
      ) {
        delete this.searchRequestObject.filters
      }
      if (this.searchRequestObject && this.searchRequestObject.pageNo) {
        this.searchRequestObject.pageNo = 0
      }
      this.searchResults = {
        total: 0,
        result: [],
        filters: [],
      }
      // this.updateSelectedFiltersSet()
      const updatedSet = this.searchSrv.updateSelectedFiltersSet(this.searchRequest.filters)
      this.selectedFilterSet = updatedSet.filterSet
      this.filtersResetAble = updatedSet.filterReset
      // Modify filters
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
    if (this.searchResultsSubscription) {
      this.searchResultsSubscription.unsubscribe()
    }
    this.searchRequestStatus = 'fetching'
    this.searchResultsSubscription = this.searchSrv
      .fetchSocialSearchUsers(this.searchRequestObject)
      .subscribe(
        data => {
          this.searchResults.total = data.total
          this.searchResults.filters = data.filters
          this.searchResults.result = [...this.searchResults.result, ...data.result]
          // this.handleFilters(this.searchResults.filters)
          const filteR = this.searchSrv.handleFilters(
            data.filters,
            this.selectedFilterSet,
            this.searchRequest.filters,
          )
          this.filtersResponse = filteR.filtersRes
          if (this.searchResults.result.length < this.searchResults.total) {
            this.searchRequestStatus = 'hasMore'
          } else {
            this.searchRequestStatus = 'done'
          }
          if (this.searchResults.total === 0) {
            this.noContent = true
          }
          this.searchRequestObject.pageNo += 1
        },
        // this.searchRequestStatus = 'error'
        error => {
          this.error.load = true
          this.error.message = error
          this.searchRequestStatus = 'done'
        },
      )
  }

  removeFilters() {
    this.router.navigate([], {
      queryParams: { f: null },
      queryParamsHandling: 'merge',
      relativeTo: this.activated.parent,
    })
  }

  contentTrackBy(item: NsContent.IContent) {
    return item.identifier
  }
  toggleBestResults() {
    try {
      this.query = !this.query
      this.searchRequestObject.postKind = this.query ? 'Query' : 'Blog'
      this.searchRequestObject.pageNo = 0
      this.router.navigate([], {
        queryParams: { social: this.searchRequestObject.postKind },
        queryParamsHandling: 'merge',
        relativeTo: this.activated.parent,
      })
    } catch (e) {
      throw e
    }
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
