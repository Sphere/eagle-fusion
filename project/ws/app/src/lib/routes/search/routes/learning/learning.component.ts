import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { NsContent, NsError, NSSearch, ROOT_WIDGET_CONFIG } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ConfigurationsService, ValueService, UtilityService } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import { IKhubFetchStatus } from '../../../infy/routes/knowledge-hub/models/knowledgeHub.model'
// import { TrainingService } from '../../../infy/routes/training/services/training.service'
import { FilterDisplayComponent } from '../../components/filter-display/filter-display.component'
// import { IFilterUnitResponse, ISearchRequest, ISearchRequestV2, ISearchTab } from '../../models/search.model'
import { IFilterUnitResponse, ISearchRequestV2, ISearchTab } from '../../models/search.model'
import { SearchServService } from '../../services/search-serv.service'
@Component({
  selector: 'ws-app-learning',
  templateUrl: './learning.component.html',
  styleUrls: ['./learning.component.scss'],
})
export class LearningComponent implements OnInit, OnDestroy {
  @ViewChild(FilterDisplayComponent, { static: false })
  appFilterDisplay: FilterDisplayComponent | null = null

  removable = true
  defaultSideNavBarOpenedSubscription: Subscription | null = null
  expandToPrefLang = true
  isLtMedium$ = this.valueSvc.isLtMedium$
  screenSizeIsLtMedium = false
  sideNavBarOpened = true
  searchRequestStatus: IKhubFetchStatus = 'none'
  // searchResults: NSSearch.ISearchV6ApiResult = {
  //   totalHits: 0,
  //   result: [],
  //   filters: [],
  //   filtersUsed: [],
  //   notVisibleFilters: [],
  // }
  // searchRequestObject: ISearchRequest = {
  //   filters: {},
  //   query: '',
  //   pageNo: 0,
  //   pageSize: 10,
  //   locale: [],
  //   sort: [],
  //   instanceCatalog: true,
  //   visibleFilters: [],
  //   excludeSourceFields: [],
  // }

  searchResults: NSSearch.ISearchV6ApiResultV2 = {
    id: '',
    ver: '',
    ts: '',
    params: {
      resmsgid: '',
      err: '',
      errmsg: '',
      msgid: '',
      status: '',
    },
    filters: [],
    responseCode: '',
    result: {
      count: 0,
      content: [],
      facets: [],
    },
  }
  searchRequestObject: ISearchRequestV2 = {
    request: {
      filters: {
        visibility: ['Default'],
      },
      query: '',
      sort_by: { lastUpdatedOn: 'desc' },
      fields: [],
      facets: [],
    },
  }
  searchResultsSubscription: Subscription | undefined
  filtersResetAble = false
  resultsDisplayType: 'basic' | 'advanced' = 'advanced'
  searchRequest: {
    query: string
    filters: { [type: string]: string[] }
    sort?: string
    lang?: string | null
  } = {
      query: '',
      filters: {},
      sort: '',
      lang: this.getActiveLocale() || '',
    }
  selectedFilterSet: Set<string> = new Set()
  noContent = false
  exactResult = {
    show: false,
    text: '',
    applied: false,
    old: '',
  }
  error = {
    load: false,
    message: '',
  }
  routeComp = ''
  translatedFilters: any = {}
  isIntranetAllowedSettings = false
  prefChangeSubscription: Subscription | null = null

  filtersResponse: IFilterUnitResponse[] = []
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
    private configSvc: ConfigurationsService,
    // private trainingSvc: TrainingService,
    private utilitySvc: UtilityService,
  ) { }

  getActiveLocale() {
    const locale = (this.configSvc.activeLocale && this.configSvc.activeLocale.locals[0]) || ''
    return this.searchServ.getLanguageSearchIndex(locale)
  }

  get applyPhraseSearch(): boolean {
    if (this.activated.snapshot.data.pageData.data.search.tabs[0].phraseSearch ||
      this.activated.snapshot.data.pageData.data.search.tabs[0].phraseSearch === undefined) {
      return true
    }
    return false
  }

  get applyIsStandAlone(): boolean {
    if (this.activated.snapshot.data.pageData.data.search.tabs[0].isStandAlone ||
      this.activated.snapshot.data.pageData.data.search.tabs[0].isStandAlone === undefined) {
      return true
    }
    return false
  }

  get filtersFromConfig() {
    return this.activated.snapshot.data.pageData.data.search.tabs[0].searchQuery.filters
  }

  get isDefaultFilterApplied() {
    const defaultFilters = JSON.parse(JSON.stringify(this.filtersFromConfig || {}))
    // const appliedFilters = JSON.parse(JSON.stringify(this.searchRequestObject.filters || {}))
    const appliedFilters = JSON.parse(JSON.stringify(this.searchRequestObject.request.filters || {}))
    if (!Object.keys(defaultFilters).length) {
      return false
    }
    for (const key of Object.keys(defaultFilters)) {
      if (JSON.stringify(defaultFilters[key]) !== JSON.stringify(appliedFilters[key])) {
        return false
      }
    }
    return true
  }

  get preferredLanguages(): string {
    if (this.configSvc.userPreference && this.configSvc.userPreference.selectedLangGroup) {
      let prefLang: string[] | string = this.configSvc.userPreference.selectedLangGroup.split(',').map(lang => {
        return this.searchServ.getLanguageSearchIndex(lang || 'en')
      })
      prefLang = prefLang.join(',')
      return prefLang
    }
    return 'en'
  }

  get searchAcrossPreferredLang() {
    // if (this.activated.snapshot.data.pageData.data.search.tabs[0].acrossPreferredLang) {
    //   if (this.searchRequestObject.locale && this.searchRequestObject.locale.join(',') !== this.preferredLanguages) {
    //     return true
    //   }
    //   return false
    // }
    return false
  }

  removeDefaultFiltersApplied() {
    const defaultFilters = JSON.parse(JSON.stringify(this.filtersFromConfig || {}))
    // const appliedFilters = JSON.parse(JSON.stringify(this.searchRequestObject.filters || {}))
    const appliedFilters = JSON.parse(JSON.stringify(this.searchRequestObject.request.filters || {}))
    const newFilters = JSON.parse(JSON.stringify(appliedFilters))
    for (const key of Object.keys(defaultFilters)) {
      if (!appliedFilters[key]) {
        return
      }
      if (JSON.stringify(defaultFilters[key]) !== JSON.stringify(appliedFilters[key])) {
        return
      }
      delete newFilters[key]
    }
    this.router.navigate([], {
      queryParams: { f: JSON.stringify(newFilters) },
      relativeTo: this.activated.parent,
      queryParamsHandling: 'merge',
    })
  }

  searchWithPreferredLanguage() {
    this.router.navigate([], {
      queryParams: { lang: this.preferredLanguages },
      relativeTo: this.activated.parent,
      queryParamsHandling: 'merge',
    })
  }

  ngOnInit() {
    this.searchServ.searchConfig = this.activated.snapshot.data.pageData.data
    this.prefChangeSubscription = this.configSvc.prefChangeNotifier.subscribe(() => {
      this.isIntranetAllowedSettings = this.configSvc.isIntranetAllowed
    })
    const queryMap = this.activated.snapshot.queryParamMap
    let defaultFilters = {}
    const lang = this.configSvc.userPreference && this.configSvc.userPreference.selectedLocale
    this.searchServ.translateSearchFilters(lang || 'en').then(val => {
      this.translatedFilters = val
    })
    if (queryMap.get('f')) {
      defaultFilters = JSON.parse(queryMap.get('f') || '{}')
    }
    if (!Object.keys(defaultFilters).length && Object.keys(this.filtersFromConfig).length) {
      this.router.navigate([], {
        queryParams: { f: JSON.stringify(this.filtersFromConfig) },
        relativeTo: this.activated.parent,
        queryParamsHandling: 'merge',
      })
    }
    this.defaultSideNavBarOpenedSubscription = this.isLtMedium$.subscribe((isLtMedium: boolean) => {
      this.screenSizeIsLtMedium = isLtMedium
      this.sideNavBarOpened = !isLtMedium
    })
    // if (this.activated.snapshot.data.learning && this.activated.snapshot.data.learning.result) {
    //   this.searchResults.totalHits = this.activated.snapshot.data.learning.totalHits
    //   this.searchResults.filters = this.activated.snapshot.data.learning.filters
    //   this.searchResults.type = this.activated.snapshot.data.learning.type
    //   this.searchResults.result = this.activated.snapshot.data.learning.result
    // } else {
    this.activated.queryParamMap.subscribe(queryParams => {
      // Reset search request object
      this.searchRequest = {
        query: '',
        filters: {},
      }
      if (
        this.activated.snapshot.data &&
        this.activated.snapshot.data.pageroute !== 'learning' &&
        this.activated.snapshot.data.pageData
      ) {
        this.routeComp = this.activated.snapshot.data.pageroute
        this.activated.snapshot.data.pageData.data.search.tabs.map((cur: ISearchTab) => {
          if (cur.titleKey === this.activated.snapshot.data.pageroute) {
            // this.searchRequestObject.filters = cur.searchQuery.filters
            this.searchRequestObject.request.filters = {}
          }
        })
      } else {
        this.routeComp = this.activated.snapshot.data.pageroute
        // this.searchRequestObject.filters = {}
      }
      if (this.utilitySvc.isMobile && !this.isIntranetAllowedSettings) {
        this.searchRequestObject.request.filters = {}
        // this.searchRequestObject.filters['isInIntranet'] = ['false']
      }
      // query
      if (queryParams.has('q')) {
        // if (this.searchRequestObject.query !== queryParams.get('q')) {
        //   this.expandToPrefLang = true
        // }
        // this.searchRequestObject.query = queryParams.get('q') || ''
        if (this.searchRequestObject.request.query !== queryParams.get('q')) {
          this.expandToPrefLang = true
        }
        this.searchRequestObject.request.query = queryParams.get('q') || ''
      }
      // filters
      if (queryParams.has('f')) {
        const filters = JSON.parse(queryParams.get('f') || '{}')
        if (this.searchRequest.filters !== filters) {
          this.expandToPrefLang = true
        }
        if (Object.keys(filters).length > 0) {
          this.searchRequest.filters = filters
          for (const key of Object.keys(this.searchRequest.filters)) {
            if (key) {
              this.searchRequestObject.request.filters = this.searchRequest.filters
            }
          }
        } else {
          this.searchRequestObject.request.filters = { visibility: ['Default'] }
        }
      }
      // if (queryParams.has('sort') && this.searchRequestObject.sort) {
      //   this.searchRequest.sort = queryParams.get('sort') || ''
      //   this.searchRequestObject.sort = this.getSortType(this.searchRequest.sort)
      // }
      if (queryParams.has('sort') && this.searchRequestObject.request.sort_by.lastUpdatedOn) {
        this.searchRequest.sort = queryParams.get('sort') || ''
        this.searchRequestObject.request.sort_by.lastUpdatedOn = this.getSortType()// this.searchRequest.sort
      }
      if (this.searchRequest.lang !== queryParams.get('lang') || this.getActiveLocale() || 'en') {
        this.expandToPrefLang = true
      }
      this.searchRequest.lang = queryParams.get('lang') || this.getActiveLocale() || 'en'
      if (this.searchRequest.lang) {
        this.searchRequest.lang = this.searchRequest.lang.toLowerCase()
        // this.searchRequestObject.locale =
        //   this.searchRequest.lang !== '' ? this.searchRequest.lang.split(',') : []
      }
      if (
        this.searchRequestObject.request.query.toLowerCase() !== 'all' &&
        this.searchRequestObject.request.query !== '*' && this.searchRequestObject.request.query !== ''
      ) {
        this.searchRequestObject.request.sort_by.lastUpdatedOn = ''
        if (!this.searchRequest.filters.hasOwnProperty('contentType')) {
          // this.searchRequestObject.isStandAlone = true
        } else if (this.searchRequest.filters.contentType.length === 0) {
          // this.searchRequestObject.isStandAlone = true
        }
        if (!this.applyIsStandAlone && this.searchRequestObject.hasOwnProperty('isStandAlone')) {
          // delete this.searchRequestObject.isStandAlone
        }
      } else {
        this.searchRequestObject.request.sort_by = { lastUpdatedOn: 'desc' }
      }
      this.noContent = false
      if (
        this.searchRequestObject.request.filters &&
        !Object.keys(this.searchRequestObject.request.filters).length
      ) {
        // if (this.searchRequestObject && this.searchRequestObject.pageNo) {
        //   this.searchRequestObject.pageNo = 0
        // }
        this.searchResults = {
          id: '',
          ver: '',
          ts: '',
          params: {
            resmsgid: '',
            err: '',
            errmsg: '',
            msgid: '',
            status: '',
          },
          responseCode: '',
          filters: [],
          result: {
            count: 0,
            content: [],
            facets: [],
          },
        }
      }
      const updatedFilterSet = this.searchServ.updateSelectedFiltersSet(this.searchRequest.filters)
      this.selectedFilterSet = updatedFilterSet.filterSet

      this.filtersResetAble = updatedFilterSet.filterReset
      // Modify filters
      this.getResults(undefined)
    })
    // }
  }

  ngOnDestroy() {
    if (this.searchResultsSubscription) {
      this.searchResultsSubscription.unsubscribe()
    }
    if (this.defaultSideNavBarOpenedSubscription) {
      this.defaultSideNavBarOpenedSubscription.unsubscribe()
    }
    if (this.prefChangeSubscription) {
      this.prefChangeSubscription.unsubscribe()
    }
  }

  getResults(withQuotes?: boolean, didYouMean = true) {
    // this.searchRequestObject.didYouMean = didYouMean
    if (this.searchResultsSubscription) {
      this.searchResultsSubscription.unsubscribe()
    }
    this.searchRequestStatus = 'fetching'
    this.exactResult.show = false
    if (this.exactResult.old !== this.searchRequestObject.request.query) {
      this.exactResult.applied = false
    }
    if (
      withQuotes === undefined &&
      this.searchRequestObject.request.query.indexOf(' ') > -1 &&
      !this.exactResult.applied // &&
      // this.searchRequestObject.pageNo === 0 && this.applyPhraseSearch
    ) {
      this.searchRequestObject.request.query = `"${this.searchRequestObject.request.query}"`
    } else if (withQuotes && this.searchRequestObject.request.query.indexOf(' ') > -1) {
      this.exactResult.applied = true
      this.searchRequestObject.request.query = this.searchRequestObject.request.query.replace(/['"]+/g, '')
      this.searchResults.result.content = []
      this.exactResult.show = false
      // this.searchRequestObject.request.pageNo = 0
      this.exactResult.old = this.searchRequestObject.request.query
    }
    this.searchServ.raiseSearchEvent(
      this.searchRequestObject.request.query,
      this.searchRequestObject.request.filters,
      '',
    )
    // if (this.searchRequestObject.locale && this.searchRequestObject.locale.length > 1) {
    //   this.searchRequestObject.didYouMean = false
    // }

    this.searchResultsSubscription = this.searchServ
      .getLearning(this.searchRequestObject)
      .subscribe(
        data => {
          this.searchResults.result.count = data.result.count
          this.searchServ.raiseSearchResponseEvent(
            this.searchRequestObject.request.query,
            this.searchRequestObject.request.filters,
            this.searchResults.result.count,
            '',
          )
          this.searchResults.filters = data.filters
          // this.searchResults.queryUsed = data.queryUsed
          // this.searchResults.type = data.type
          this.searchResults.result.content = (data.result.content) ? data.result.content : []
          // [...this.searchResults.result.content, ...(data.result.content ? data.result.content : [])]
          // this.searchResults.doYouMean = data.doYouMean
          // this.searchResults.queryUsed = data.queryUsed
          // this.handleFilters(this.searchResults.filters)
          const filteR = this.searchServ.handleFilters(
            this.searchResults.filters,
            this.selectedFilterSet,
            this.searchRequest.filters,
            this.activated.snapshot.data.pageroute !== 'learning' ? true : false,
          )
          this.searchServ.getSearchConfig().then(searchData => {
            if (filteR.filtersRes && filteR.filtersRes.length > 0) {
              filteR.filtersRes.forEach(ele => {
                if (searchData.search.visibleFiltersV2.hasOwnProperty(ele.displayName)) {
                  ele.displayName = searchData.search.visibleFiltersV2[ele.displayName].displayName
                }
              })
              this.filtersResponse = filteR.filtersRes
            }
          })
          if (
            this.searchResults.result.count === 0 && this.isDefaultFilterApplied
          ) {
            this.removeDefaultFiltersApplied()
            this.getResults(undefined, didYouMean)
            return
          } if (this.searchResults.result.count === 0 && this.searchAcrossPreferredLang && this.expandToPrefLang) {
            this.searchWithPreferredLanguage()
            this.getResults(undefined, didYouMean)
            return
          } if (
            this.searchResults.result.count === 0 &&
            this.searchRequestObject.request.query.indexOf(' ') === -1
          ) {
            this.noContent = true
          } else if ( // No results with phrase search disabled and space separated words
            this.searchResults.result.count === 0 &&
            this.searchRequestObject.request.query.indexOf(' ') > -1 &&
            !this.applyPhraseSearch
          ) {
            this.noContent = true
          } else if (
            this.searchResults.result.count === 0 &&
            this.searchRequestObject.request.query.indexOf(' ') > -1 &&
            withQuotes
          ) {
            this.noContent = true
          } else if (
            this.searchResults.result.count === 0 &&
            this.searchRequestObject.request.query.indexOf(' ') > -1 && this.applyPhraseSearch
          ) {
            // this.searchRequestObject.pageNo = 0
            this.getResults(true, didYouMean)
            return
          } else if (
            this.searchResults.result.count === 0 &&
            this.searchRequestObject.request.query.indexOf(' ') === -1 // &&
            // this.searchRequestObject.instanceCatalog
          ) {
            // this.searchRequestObject.pageNo = 0
            // this.searchRequestObject.instanceCatalog = false
            this.getResults(true, didYouMean)
            return
          } else if (
            this.searchResults.result.count > 0 &&
            this.searchRequestObject.request.query.indexOf(' ') > -1 &&
            !this.exactResult.applied
          ) {
            this.exactResult.show = true
            this.exactResult.text = this.searchRequestObject.request.query.replace(/['"]+/g, '')
          }
          if (this.searchResults.result.content.length < this.searchResults.result.count) {
            this.searchRequestStatus = 'hasMore'
          } else {
            this.searchRequestStatus = 'done'
          }
          if (this.searchResults.result.content.length < this.searchResults.result.count) {
            // tslint:disable-next-line: no-non-null-assertion
            // this.searchRequestObject.pageNo! += 1
          }

          this.getTrainingsLHub(this.searchResults)
        },
        error => {
          this.error.load = true
          this.error.message = error
          this.searchRequestStatus = 'done'
        },
      )
  }

  contentTrackBy(item: NsContent.IContent) {
    return item.identifier
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

  getSortType() {
    try {
      return 'desc'
    } catch (e) {
      throw e
    }
  }

  searchLanguage(type: string) {
    try {
      this.router.navigate([], {
        queryParams: { lang: type },
        queryParamsHandling: 'merge',
        relativeTo: this.activated.parent,
      }).then(() => {
        this.expandToPrefLang = false
      })
    } catch (e) {
      throw e
    }
  }

  didYouMeanSearch(query: string) {
    let q = query.replace('<em>', '')
    q = q.replace('</em>', '')
    this.router.navigate([], {
      queryParams: { q },
      queryParamsHandling: 'merge',
      relativeTo: this.activated.parent,
    })
  }

  searchInsteadFor() {
    // this.searchResults.result = []
    this.searchResults.result.content = []
    this.getResults(undefined, false)
  }

  removeFilters() {
    // const filtercheck = JSON.stringify(this.searchRequest.filters)

    this.router.navigate([], {
      queryParams: { f: null, q: this.searchRequestObject.request.query },
      // queryParams: { f: null, q: this.searchRequestObject.query },
      // queryParamsHandling: 'merge',
      relativeTo: this.activated.parent,
    })
  }

  removeLanguage() {

    this.searchRequest.lang = ''
    this.router.navigate([], {
      queryParams: { f: JSON.stringify(this.searchRequest.filters), q: this.searchRequestObject.request.query, lang: null },

      // queryParamsHandling: 'merge',
      relativeTo: this.activated.parent,
    })

  }

  closeFilter(value: boolean) {
    this.sideNavBarOpened = value
  }

  private getTrainingsLHub(_searchResults: NSSearch.ISearchV6ApiResultV2) {
    const restrictedFeatures = this.configSvc.restrictedFeatures
    const trainingLHubEnabled = restrictedFeatures && !restrictedFeatures.has('trainingLHub')

    if (trainingLHubEnabled) {
      // this.trainingSvc.getTrainingCountsForSearchResults(searchResults)
    }
  }

}
