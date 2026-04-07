import { Component, effect, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router'
import { NsContent, NsError, NSSearch, ROOT_WIDGET_CONFIG } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ConfigurationsService, ValueService, UtilityService, LoggerService } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import { FilterDisplayComponent } from '../../components/filter-display/filter-display.component'
import { IFilterUnitResponse, ISearchRequestV2, ISearchTab, ISearchRequestV3 } from '../../models/search.model'
import { SearchServService } from '../../services/search-serv.service'
import { isEmpty, orderBy } from 'lodash'
import { filter } from 'rxjs/operators'
import { SearchApiService } from '../../apis/search-api.service'

type SearchResultLegacy = NSSearch.ISearchV6ApiResultV2
type SearchResultV3 = NSSearch.ISearchV6ApiResultV3

@Component({
    standalone: false,
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
  isXSmall = false
  screenSizeIsLtMedium = false
  sideNavBarOpened = true
  searchRequestStatus = 'none'
  lang = ''
  contactMethods = [
    { id: 'en', label: 'English' },
    { id: 'hi', label: 'हिंदी' },
  ]
  contact = ''
  newSearchResults: SearchResultV3 = {
    responseCode: '',
    result: {
      count: 0,
      content: [],
    },
  }
  searchResults: any = this.getInitialSearchResults()
  newSearchRequestObject: ISearchRequestV3 = {
    query: '',
    language: '',
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
  langPresent = false
  translatedFilters: any = {}
  isIntranetAllowedSettings = false
  prefChangeSubscription: Subscription | null = null
  withoutFilter = false
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
    private utilitySvc: UtilityService,
    private searchSvc: SearchApiService,
    private logger: LoggerService
  ) {
    effect(() => {
      this.isXSmall = this.valueSvc.isMobile()
    })
  }

  getActiveLocale() {
    const locale = (this.configSvc.activeLocale && this.configSvc.activeLocale.locals[0]) || ''
    return this.searchServ.getLanguageSearchIndex(locale)
  }

  get applyPhraseSearch(): boolean {
    const phraseSearch = this.activated.snapshot.data.pageData.data.search.tabs[0].phraseSearch
    return phraseSearch || phraseSearch === undefined
  }

  get applyIsStandAlone(): boolean {
    const isStandAlone = this.activated.snapshot.data.pageData.data.search.tabs[0].isStandAlone
    return isStandAlone || isStandAlone === undefined
  }

  get filtersFromConfig() {
    return this.activated.snapshot.data.pageData.data.search.tabs[0].searchQuery.filters
  }

  get isDefaultFilterApplied() {
    const defaultFilters = this.clone(this.filtersFromConfig ?? {})
    const appliedFilters = this.clone(this.searchRequestObject.request.filters || {})
    if (!Object.keys(defaultFilters).length) {
      return false
    }
    return Object.keys(defaultFilters).every(
      key => JSON.stringify(defaultFilters[key]) === JSON.stringify(appliedFilters[key]),
    )
  }

  get preferredLanguages(): string {
    if (this.configSvc.userPreference?.selectedLangGroup) {
      return this.configSvc.userPreference.selectedLangGroup
        .split(',')
        .map(lang => this.searchServ.getLanguageSearchIndex(lang || 'en'))
        .join(',')
    }
    return 'en'
  }

  get searchAcrossPreferredLang() {
    return false
  }

  selectLang(e: string) {
    this.lang = e
    this.router.navigate([], {
      queryParams: { lang: e },
      relativeTo: this.activated.parent,
      queryParamsHandling: 'merge',
    })
  }

  removeDefaultFiltersApplied() {
    const defaultFilters = this.clone(this.filtersFromConfig ?? {})
    const appliedFilters = this.clone(this.searchRequestObject.request.filters || {})
    const newFilters = this.clone(appliedFilters)

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
    this.trackRouteState()
    this.detectLanguageParam()
    this.initializeSearchConfig()
    this.setInitialFilters()
    this.trackViewport()
    this.subscribeToQueryParams()
  }

  private trackRouteState() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url.includes('/learning')) {
          this.withoutFilter = true
        }
      })
    this.logger.log('view', this.withoutFilter)
  }

  private detectLanguageParam() {
    const params = new URLSearchParams(window.location.href.split('?')[1] || '')
    if (params.has('lang')) {
      this.logger.log(params.get('lang'))
      this.langPresent = true
    } else {
      this.langPresent = false
    }
  }

  private initializeSearchConfig() {
    this.searchServ.searchConfig = this.activated.snapshot.data.pageData.data
    this.prefChangeSubscription = this.configSvc.prefChangeNotifier.subscribe(() => {
      this.isIntranetAllowedSettings = this.configSvc.isIntranetAllowed
    })
    const lang = this.configSvc.userPreference?.selectedLocale
    this.searchServ.translateSearchFilters(lang || 'en').then(val => {
      this.translatedFilters = val
    })
  }

  private setInitialFilters() {
    const queryMap = this.activated.snapshot.queryParamMap
    let defaultFilters = {}
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
  }

  private trackViewport() {
    this.defaultSideNavBarOpenedSubscription = this.isLtMedium$.subscribe((isLtMedium: boolean) => {
      this.screenSizeIsLtMedium = isLtMedium
      this.sideNavBarOpened = !isLtMedium
    })
  }

  private subscribeToQueryParams() {
    this.activated.queryParamMap.subscribe(queryParams => {
      if (queryParams.get('competency') === 'true') {
        this.getCompetencyResult(queryParams.getAll('q'))
        return
      }

      this.resetSearchRequest()
      this.updateRouteComponentState()
      this.applyMobileRestrictions()
      this.applyQueryParams(queryParams)
      this.getSearchResults(undefined)
    })
  }

  private resetSearchRequest() {
    this.searchRequest = {
      query: '',
      filters: {},
    }
  }

  private updateRouteComponentState() {
    if (
      this.activated.snapshot.data &&
      this.activated.snapshot.data.pageroute !== 'learning' &&
      this.activated.snapshot.data.pageData
    ) {
      this.routeComp = this.activated.snapshot.data.pageroute
      this.activated.snapshot.data.pageData.data.search.tabs.forEach((cur: ISearchTab) => {
        if (cur.titleKey === this.activated.snapshot.data.pageroute) {
          this.searchRequestObject.request.filters = {}
        }
      })
      return
    }

    this.routeComp = this.activated.snapshot.data.pageroute
  }

  private applyMobileRestrictions() {
    if (this.utilitySvc.isMobile && !this.isIntranetAllowedSettings) {
      this.searchRequestObject.request.filters = {}
    }
  }

  private applyQueryParams(queryParams: any) {
    this.applyQuery(queryParams)
    this.applyFilters(queryParams)
    this.applySort(queryParams)
    this.applyLanguage(queryParams)
    this.applySortingRules()
    this.resetSearchResultsWhenFiltersAreEmpty()
  }

  private applyQuery(queryParams: any) {
    if (!queryParams.has('q')) {
      return
    }

    const query = queryParams.get('q') || ''

    if (this.searchRequestObject.request.query !== query && queryParams.get('competency') === 'true') {
      this.expandToPrefLang = true
    }

    if (this.newSearchRequestObject.query !== query && queryParams.get('competency') === 'true') {
      this.expandToPrefLang = true
    }

    this.searchRequestObject.request.query = query
    this.newSearchRequestObject.query = query

    if (isEmpty(this.searchRequest.filters)) {
      this.searchRequestObject.request.filters = {
        visibility: ['Default'],
        primaryCategory: ['Course'],
        contentType: ['Course'],
      }
    }
  }

  private applyFilters(queryParams: any) {
    if (!queryParams.has('f')) {
      return
    }

    const filters = JSON.parse(queryParams.get('f') || '{}')
    if (this.searchRequest.filters !== filters) {
      this.expandToPrefLang = true
    }

    if (Object.keys(filters).length > 0) {
      this.searchRequest.filters = filters
      this.searchRequestObject.request.filters = this.searchRequest.filters
      return
    }

    this.searchRequestObject.request.filters = { visibility: ['Default'] }
  }


  private getLangFromUrl(): string {
    return new URLSearchParams(window.location.href.split('?')[1] || '').get('lang') || ''
  }

  private applySort(queryParams: any) {
    if (queryParams.has('sort') && this.searchRequestObject.request.sort_by.lastUpdatedOn) {
      this.searchRequest.sort = queryParams.get('sort') || ''
      this.searchRequestObject.request.sort_by.lastUpdatedOn = this.getSortType()
    }
  }

  private applyLanguage(queryParams: any) {
    if (this.searchRequest.lang !== queryParams.get('lang') || this.getActiveLocale() || 'en') {
      this.expandToPrefLang = true
    }

    this.searchRequest.lang = queryParams.get('lang')
    if (!this.searchRequest.lang) {
      return
    }

    this.searchRequest.lang = this.searchRequest.lang.toLowerCase()
    this.searchRequestObject.request.filters['lang'] = this.searchRequest.lang.toLowerCase()
    this.lang = this.searchRequest.lang.toLowerCase()
    this.contact = this.lang
  }

  private applySortingRules() {
    const query = this.searchRequestObject.request.query
    if (query.toLowerCase() !== 'all' && query !== '*' && query !== '') {
      this.searchRequestObject.request.sort_by.lastUpdatedOn = ''

      if (!this.applyIsStandAlone && this.searchRequestObject.hasOwnProperty('isStandAlone')) {
        return
      }
      return
    }

    this.searchRequestObject.request.sort_by = { lastUpdatedOn: 'desc' }
  }

  private resetSearchResultsWhenFiltersAreEmpty() {
    this.noContent = false
    if (
      this.searchRequestObject.request.filters &&
      !Object.keys(this.searchRequestObject.request.filters).length
    ) {
      this.searchResults = this.getInitialSearchResults()
    }
  }

  private getInitialSearchResults() {
    return {
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
  }

  ngOnDestroy() {
    this.searchResultsSubscription?.unsubscribe()
    this.defaultSideNavBarOpenedSubscription?.unsubscribe()
    this.prefChangeSubscription?.unsubscribe()
  }

  getCompetencyResult(data: string[]) {
    const reqData = {
      request: {
        filters: {
          competencySearch: data,
          primaryCategory: ['Course'],
          contentType: ['Course'],
          status: ['Live'],
        },
        sort_by: {
          lastUpdatedOn: 'desc',
        },
      },
      sort: [
        {
          lastUpdatedOn: 'desc',
        },
      ],
    }

    const didYouMean = true

    this.searchSvc.getSearchCompetencyCourses(reqData).subscribe(
      dataResponse => {
        this.searchResults.result.count = dataResponse.result.count
        this.searchServ.raiseSearchResponseEvent(
          this.searchRequestObject.request.query,
          this.searchRequestObject.request.filters,
          this.searchResults.result.count,
          '',
        )
        this.searchResults.filters = dataResponse.filters
        this.searchResults.result.content = dataResponse.result.content || []

        if (this.handleEmptyStateAndFallbacks(didYouMean)) {
          return
        }

        this.updateSearchRequestStatus()
        this.getTrainingsLHub(this.searchResults)
      },
      error => {
        this.handleSearchError(error)
      },
    )
  }
  private prepareLegacySearch(withQuotes?: boolean) {
    this.prepareSearchRequest(withQuotes, false)
    this.searchServ.raiseSearchEvent(
      this.searchRequestObject.request.query,
      this.searchRequestObject.request.filters,
      '',
    )

    if (localStorage.getItem('orgValue') === 'nhsrc') {
      this.searchRequestObject.request.filters['sourceName'] = ['Ministry of Health and Family Welfare']
    }
  }

  private prepareNewSearch(withQuotes?: boolean) {
    this.prepareSearchRequest(withQuotes, true)
    this.searchServ.raiseSearchEvent(this.newSearchRequestObject.query, '', '')
  }

  private prepareSearchRequest(withQuotes: boolean | undefined, useNewRequest: boolean) {
    this.logger.log('getResults', withQuotes)
    this.searchResultsSubscription?.unsubscribe()
    this.searchRequestStatus = 'fetching'
    this.exactResult.show = false

    const query = useNewRequest ? this.newSearchRequestObject.query : this.searchRequestObject.request.query

    if (this.exactResult.old !== query) {
      this.exactResult.applied = false
    }

    if (withQuotes === undefined && query.indexOf(' ') > -1 &&
      !this.exactResult.applied) {
      this.exactResult.applied = true
      const normalizedQuery = query.replace(/['"]+/g, '')
      if (useNewRequest) {
        this.newSearchRequestObject.query = normalizedQuery
      } else {
        this.searchRequestObject.request.query = normalizedQuery
      }
      this.searchResults.result.content = []
      this.exactResult.show = false
      this.exactResult.old = normalizedQuery
    } else if (withQuotes && query.indexOf(' ') > -1) {
      this.exactResult.applied = true
      const normalizedQuery = query.replace(/['"]+/g, '')

      if (useNewRequest) {
        this.newSearchRequestObject.query = normalizedQuery
      } else {
        this.searchRequestObject.request.query = normalizedQuery
      }

      this.searchResults.result.content = []
      this.exactResult.show = false
      this.exactResult.old = normalizedQuery
    }
  }

  private updateFiltersResponse(data: any) {
    this.logger.log('this.searchResults.result.content', this.searchResults.result.content)
    const filterData = this.searchServ.handleFilters(
      this.searchResults.filters,
      this.selectedFilterSet,
      this.searchRequest.filters,
      this.activated.snapshot.data.pageroute !== 'learning',
    )

    this.searchServ.getSearchConfig().then(searchData => {
      if (!(filterData.filtersRes && filterData.filtersRes.length > 0)) {
        return
      }

      filterData.filtersRes.forEach(ele => {
        if (searchData.search.visibleFilters.hasOwnProperty(ele.displayName)) {
          ele.displayName = searchData.search.visibleFilters[ele.displayName].displayName
        }
      })

      const facetFilters: any[] = []
      data.result.facets.forEach((facet: any) => {
        if (facet.values.length === 0) {
          return
        }

        facet.values.forEach((value: any) => {
          value.displayName = value.name
          value.type = value.name
          value.checked = true
          value.count = value.count
        })

        if (facet.name === 'resourceType' || facet.name === 'exclusiveContent') {
          facetFilters.push({
            displayName: facet.name,
            type: facet.name,
            checked: true,
            content: facet.values,
          })
        }
      })

      Array.prototype.push.apply(filterData.filtersRes, facetFilters)
      this.filtersResponse = filterData.filtersRes
    })
  }

  private handleEmptyStateAndFallbacks(
    didYouMean: boolean,
    withQuotes?: boolean,
    useLegacyRequest = false,
  ): boolean {
    const query = useLegacyRequest ? this.searchRequestObject.request.query : this.newSearchRequestObject.query

    if (this.searchResults.result.count === 0 && this.isDefaultFilterApplied) {
      this.removeDefaultFiltersApplied()
      useLegacyRequest ? this.getResults(undefined, didYouMean) : this.getSearchResults(undefined, didYouMean)
      return true
    }

    if (this.searchResults.result.count === 0 && this.searchAcrossPreferredLang && this.expandToPrefLang) {
      this.searchWithPreferredLanguage()
      useLegacyRequest ? this.getResults(undefined, didYouMean) : this.getSearchResults(undefined, didYouMean)
      return true
    }

    if (this.searchResults.result.count === 0 && query.indexOf(' ') === -1) {
      this.noContent = true
      return false
    }

    if (this.searchResults.result.count === 0 && query.indexOf(' ') === -1) {
      useLegacyRequest
        ? this.getResults(true, didYouMean)
        : this.getSearchResults(true, didYouMean)
      return true
    }

    if (this.searchResults.result.count === 0 && query.indexOf(' ') > -1 && !this.applyPhraseSearch) {
      this.noContent = true
      return false
    }

    if (this.searchResults.result.count === 0 && query.indexOf(' ') > -1 && withQuotes) {
      this.noContent = true
      return false
    }

    if (this.searchResults.result.count === 0 && query.indexOf(' ') > -1 && this.applyPhraseSearch) {
      useLegacyRequest ? this.getResults(true, didYouMean) : this.getSearchResults(true, didYouMean)
      return true
    }

    if (this.searchResults.result.count > 0 && query.indexOf(' ') > -1 && !this.exactResult.applied) {
      this.exactResult.show = true
      this.exactResult.text = query.replace(/['"]+/g, '')
    }

    return false
  }

  private updateSearchRequestStatus() {
    if (this.searchResults.result.content.length < this.searchResults.result.count) {
      this.searchRequestStatus = 'hasMore'
      return
    }
    this.searchRequestStatus = 'done'
  }

  private handleSearchError(error: any) {
    this.error.load = true
    this.error.message = error
    this.searchRequestStatus = 'done'
  }
  getResults(withQuotes?: boolean, didYouMean = true) {
    this.prepareLegacySearch(withQuotes)

    this.searchResultsSubscription = this.searchServ.getLearning(this.searchRequestObject).subscribe(
      data => {
        this.logger.log(data)
        this.searchResults.result.count = data.result.count
        this.searchServ.raiseSearchResponseEvent(
          this.searchRequestObject.request.query,
          this.searchRequestObject.request.filters,
          this.searchResults.result.count,
          '',
        )
        this.searchResults.filters = data.filters
        this.searchResults.result.content = data.result.content
          ? orderBy(data.result.content, ['lastPublishedOn'], ['desc'])
          : []

        this.updateFiltersResponse(data)

        if (this.handleEmptyStateAndFallbacks(didYouMean, withQuotes, true)) {
          return
        }

        this.updateSearchRequestStatus()
        this.getTrainingsLHub(this.searchResults)
      },
      error => {
        this.handleSearchError(error)
      },
    )
  }


  getSearchResults(withQuotes?: boolean, didYouMean = true) {
    this.prepareNewSearch(withQuotes)
    this.newSearchRequestObject.language = this.getLangFromUrl()

    this.searchResultsSubscription = this.searchServ.getsearchLearning(this.newSearchRequestObject).subscribe(
      data => {
        this.logger.log(data, 'data')
        this.searchResults.result.count = data?.result?.count || 0
        this.searchResults.result.content = data?.result?.content
          ? orderBy(data.result.content, ['lastPublishedOn'], ['desc'])
          : []

        this.searchServ.raiseNewSearchResponseEvent(
          this.newSearchRequestObject.query,
          this.searchResults.result.count,
          '',
        )

        if (this.handleEmptyStateAndFallbacks(didYouMean, withQuotes, false)) {
          return
        }

        this.updateSearchRequestStatus()
        this.getTrainingsLHub2(this.searchResults)
      },
      error => {
        this.handleSearchError(error)
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
    this.searchResults.result.content = []
    this.getSearchResults(undefined, false)
  }

  removeFilters() {
    this.router.navigate([], {
      queryParams: { f: null, q: this.searchRequestObject.request.query },
      relativeTo: this.activated.parent,
    })
  }

  removeLanguage() {
    this.router.navigateByUrl('/app/search/home?f=')
  }

  removeSearch() {
    this.contact = ''
    this.lang = ''
    this.router.navigateByUrl('/app/search/learning?q=')
  }

  closeFilter(value: boolean) {
    this.sideNavBarOpened = value
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value))
  }

  private getTrainingsLHub(_searchResults: SearchResultLegacy) {
    const restrictedFeatures = this.configSvc.restrictedFeatures
    const trainingLHubEnabled = restrictedFeatures && !restrictedFeatures.has('trainingLHub')

    if (trainingLHubEnabled) {
      // this.trainingSvc.getTrainingCountsForSearchResults(searchResults)
    }
  }

  private getTrainingsLHub2(_searchResults: SearchResultV3) {
    const restrictedFeatures = this.configSvc.restrictedFeatures
    const trainingLHubEnabled = restrictedFeatures && !restrictedFeatures.has('trainingLHub')

    if (trainingLHubEnabled) {
      // this.trainingSvc.getTrainingCountsForSearchResults(searchResults)
    }
  }
}