import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router'
import { NsContent, NsError, NSSearch, ROOT_WIDGET_CONFIG } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ConfigurationsService, ValueService, UtilityService } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
// import { IKhubFetchStatus } from '../../../infy/routes/knowledge-hub/models/knowledgeHub.model'
// import { TrainingService } from '../../../infy/routes/training/services/training.service'
import { FilterDisplayComponent } from '../../components/filter-display/filter-display.component'
// import { IFilterUnitResponse, ISearchRequest, ISearchRequestV2, ISearchTab } from '../../models/search.model'
import { IFilterUnitResponse, ISearchRequestV2, ISearchTab, ISearchRequestV3 } from '../../models/search.model'
import { SearchServService } from '../../services/search-serv.service'
import isEmpty from 'lodash/isEmpty'
import orderBy from 'lodash/orderBy'
import { SearchApiService } from '../../apis/search-api.service'

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
  isXSmall$ = this.valueSvc.isXSmall$
  screenSizeIsLtMedium = false
  sideNavBarOpened = true
  searchRequestStatus = 'none'
  lang = ''
  contactMethods = [
    { id: 'en', label: 'English' },
    { id: 'hi', label: 'हिंदी' },
  ]
  contact = ''
  newSearchResults: NSSearch.ISearchV6ApiResultV3 = {
    responseCode: '',
    result: {
      count: 0,
      content: [],
    },
  }
  searchResults: any = {
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
  newSearchRequestObject: ISearchRequestV3 = {

    query: '',
    language: ''

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
  langPresent: boolean = false
  translatedFilters: any = {}
  isIntranetAllowedSettings = false
  prefChangeSubscription: Subscription | null = null
  withoutFilter: boolean = false
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
    private searchSvc: SearchApiService,

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
    const defaultFilters = JSON.parse(JSON.stringify(this.filtersFromConfig ?? {}))
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
  selectLang(e: any) {
    this.lang = e
    this.router.navigate([], {
      queryParams: { lang: e },
      relativeTo: this.activated.parent,
      queryParamsHandling: 'merge',
    })
  }

  removeDefaultFiltersApplied() {
    const defaultFilters = JSON.parse(JSON.stringify(this.filtersFromConfig ?? {}))
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
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        if (event.url.includes('/learning')) {
          this.withoutFilter = true
        }
      }
    })
    console.log("view", this.withoutFilter)

    let url = window.location.href
    // Extract the query parameters part of the URL
    let paramsString = url.split('?')[1] || ''
    let params = new URLSearchParams(paramsString)
    // Check if 'lang' parameter exists
    if (params.has('lang')) {
      console.log(params.get('lang'))
      this.langPresent = true
    }

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
      if (queryParams.get('competency') == 'true') {
        this.getCompetencyResult(queryParams.getAll('q'))

      } else {

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
          if (this.searchRequestObject.request.query !== queryParams.get('q') && queryParams.get('competency') == 'true') {
            this.expandToPrefLang = true
          }
          this.searchRequestObject.request.query = queryParams.get('q') || ''
          if (isEmpty(this.searchRequest.filters)) {
            this.searchRequestObject.request.filters = {
              visibility: ['Default'],
              primaryCategory: [
                'Course',
              ],
              contentType: [
                'Course',
              ],
            }
          }
        }
        if (queryParams.has('q')) {
          if (this.newSearchRequestObject.query !== queryParams.get('q') && queryParams.get('competency') == 'true') {
            this.expandToPrefLang = true
          }
          this.newSearchRequestObject.query = queryParams.get('q') || ''
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
        this.searchRequest.lang = queryParams.get('lang')
        if (this.searchRequest.lang) {
          this.searchRequest.lang = this.searchRequest.lang.toLowerCase()
          this.searchRequestObject.request.filters['lang'] = this.searchRequest.lang.toLowerCase()
          this.lang = this.searchRequest.lang.toLowerCase()
          this.contact = this.lang
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
            responseCode: '',
            result: {
              count: 0,
              content: [],
            },

          }
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
        // const updatedFilterSet = this.searchServ.updateSelectedFiltersSet(this.searchRequest.filters)
        // this.selectedFilterSet = updatedFilterSet.filterSet

        // this.filtersResetAble = updatedFilterSet.filterReset
        // Modify filters
        this.getSearchResults(undefined)
      }
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
  getCompetencyResult(data: any) {
    const reqData = {
      request: {
        filters: {
          competencySearch: data,
          primaryCategory: [
            'Course',
          ],
          contentType: [
            'Course',
          ],
          status: [
            'Live',
          ],
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
    let withQuotes: boolean
    const didYouMean = true
    this.searchSvc.getSearchCompetencyCourses(reqData).subscribe(
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
        console.log(orderBy(data.result.content, ['lastPublishedOn'], ['desc']))
        this.searchResults.result.content = (data.result.content) ? data.result.content : []

        // this.searchResults.result.content = (data.result.content) ? orderBy(data.result.content, ['lastPublishedOn'], ['desc']) : []
        // [...this.searchResults.result.content, ...(data.result.content ? data.result.content : [])]
        // this.searchResults.doYouMean = data.doYouMean
        // this.searchResults.queryUsed = data.queryUsed
        // this.handleFilters(this.searchResults.filters)
        // const filteR = this.searchServ.handleFilters(
        //   this.searchResults.filters,
        //   this.selectedFilterSet,
        //   this.searchRequest.filters,
        //   this.activated.snapshot.data.pageroute !== 'learning' ? true : false,
        // )
        // this.searchServ.getSearchConfig().then(searchData => {
        //   if (filteR.filtersRes && filteR.filtersRes.length > 0) {
        //     filteR.filtersRes.forEach(ele => {
        //       if (searchData.search.visibleFilters.hasOwnProperty(ele.displayName)) {
        //         ele.displayName = searchData.search.visibleFilters[ele.displayName].displayName
        //       }
        //     })
        //     const newArray: any = []
        //     data.result.facets.forEach((el: any) => {
        //       const obj2 = {}
        //       if (el.values.length > 0) {
        //         el.values.forEach((el1: any) => {
        //           el1['displayName'] = el1.name
        //           el1['type'] = el1.name
        //           el1['checked'] = true
        //           el1['count'] = el1.count
        //         })
        //         if (el.name === 'resourceType' || el.name === 'exclusiveContent') {
        //           obj2['displayName'] = el.name
        //           obj2['type'] = el.name
        //           obj2['checked'] = true
        //           obj2['content'] = el.values
        //           newArray.push(obj2)
        //         }
        //       }
        //     })
        //     Array.prototype.push.apply(filteR.filtersRes, newArray)
        //     this.filtersResponse = filteR.filtersRes
        //   }
        // })
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
  getResults(withQuotes?: boolean, didYouMean = true) {
    console.log('getResults', withQuotes)
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
      this.searchRequestObject.request.query = `${this.searchRequestObject.request.query}`
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
    if (localStorage.getItem('orgValue') === 'nhsrc') {
      this.searchRequestObject.request.filters['sourceName'] = ['Ministry of Health and Family Welfare']
    }

    this.searchResultsSubscription = this.searchServ
      .getLearning(this.searchRequestObject)
      .subscribe(
        data => {
          console.log(data)
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
          this.searchResults.result.content = (data.result.content) ? orderBy(data.result.content, ['lastPublishedOn'], ['desc']) : []
          // [...this.searchResults.result.content, ...(data.result.content ? data.result.content : [])]
          // this.searchResults.doYouMean = data.doYouMean
          // this.searchResults.queryUsed = data.queryUsed
          // this.handleFilters(this.searchResults.filters)
          console.log("this.searchResults.result.content", this.searchResults.result.content)
          const filteR = this.searchServ.handleFilters(
            this.searchResults.filters,
            this.selectedFilterSet,
            this.searchRequest.filters,
            this.activated.snapshot.data.pageroute !== 'learning' ? true : false,
          )
          this.searchServ.getSearchConfig().then(searchData => {
            if (filteR.filtersRes && filteR.filtersRes.length > 0) {
              filteR.filtersRes.forEach(ele => {
                if (searchData.search.visibleFilters.hasOwnProperty(ele.displayName)) {
                  ele.displayName = searchData.search.visibleFilters[ele.displayName].displayName
                }
              })
              const newArray: any = []
              data.result.facets.forEach((el: any) => {
                const obj2: any = {}
                if (el.values.length > 0) {
                  el.values.forEach((el1: any) => {
                    el1['displayName'] = el1.name
                    el1['type'] = el1.name
                    el1['checked'] = true
                    el1['count'] = el1.count
                  })
                  if (el.name === 'resourceType' || el.name === 'exclusiveContent') {
                    obj2['displayName'] = el.name
                    obj2['type'] = el.name
                    obj2['checked'] = true
                    obj2['content'] = el.values
                    newArray.push(obj2)
                  }
                }
              })
              Array.prototype.push.apply(filteR.filtersRes, newArray)
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
  // new search API integration
  getSearchResults(withQuotes?: boolean, didYouMean = true) {
    console.log('getResults', withQuotes)
    // this.searchRequestObject.didYouMean = didYouMean
    if (this.searchResultsSubscription) {
      this.searchResultsSubscription.unsubscribe()
    }
    this.searchRequestStatus = 'fetching'
    this.exactResult.show = false
    if (this.exactResult.old !== this.newSearchRequestObject.query) {
      this.exactResult.applied = false
    }
    if (
      withQuotes === undefined &&
      this.newSearchRequestObject.query.indexOf(' ') > -1 &&
      !this.exactResult.applied // &&
      // this.searchRequestObject.pageNo === 0 && this.applyPhraseSearch
    ) {
      this.newSearchRequestObject.query = `${this.newSearchRequestObject.query}`
    } else if (withQuotes && this.newSearchRequestObject.query.indexOf(' ') > -1) {
      this.exactResult.applied = true
      this.newSearchRequestObject.query = this.newSearchRequestObject.query.replace(/['"]+/g, '')
      this.searchResults.result.content = []
      this.exactResult.show = false
      // this.searchRequestObject.request.pageNo = 0
      this.exactResult.old = this.newSearchRequestObject.query
    }

    this.searchServ.raiseSearchEvent(
      this.newSearchRequestObject.query,
      '', '',
    )
    // let local = (this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails!.preferences && this.configSvc.unMappedUser!.profileDetails!.preferences!.language !== undefined) ? this.configSvc.unMappedUser.profileDetails.preferences.language : location.href.includes('/hi/') === true ? 'hi' : 'en'

    let url = window.location.href

    // Extract the query parameters part of the URL
    let paramsString = url.split('?')[1] || ''
    let params = new URLSearchParams(paramsString)

    let lang = '' // Default value

    // Check if 'lang' parameter exists
    if (params.has('lang')) {
      lang = params.get('lang') || ''
    }
    console.log(lang)
    this.newSearchRequestObject.language = lang
    if (localStorage.getItem('orgValue') === 'nhsrc') {
    }
    this.searchResultsSubscription = this.searchServ
      .getsearchLearning(this.newSearchRequestObject)
      .subscribe(
        data => {
          if (data && data.result && data.result.count) {
            console.log(data, 'data')
            this.searchResults.result.count = data.result.count
            this.searchResults.result.content = (data.result.content) ? orderBy(data.result.content, ['lastPublishedOn'], ['desc']) : []

          } else {
            this.searchResults.result.count = data.result.count
            console.log(data, 'data123')
          }

          this.searchServ.raiseNewSearchResponseEvent(
            this.newSearchRequestObject.query,
            this.searchResults.result.count,
            '',
          )

          if (
            this.searchResults.result.count === 0 && this.isDefaultFilterApplied
          ) {
            this.removeDefaultFiltersApplied()
            this.getSearchResults(undefined, didYouMean)
            return
          } if (this.searchResults.result.count === 0 && this.searchAcrossPreferredLang && this.expandToPrefLang) {
            this.searchWithPreferredLanguage()
            this.getSearchResults(undefined, didYouMean)
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
            this.getSearchResults(true, didYouMean)
            return
          } else if (
            this.searchResults.result.count === 0 &&
            this.searchRequestObject.request.query.indexOf(' ') === -1 // &&
          ) {

            this.getSearchResults(true, didYouMean)
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
          }
          if (data && data.result && data.result.count) {
            this.searchRequestStatus = 'done'
          }
          this.getTrainingsLHub2(this.searchResults)
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
    this.getSearchResults(undefined, false)
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
    // this.contact = this.lang = ''
    // this.searchRequest.filters['lang'] = []
    // console.log('filter', this.searchRequest)
    // this.router.navigate([], {
    //   queryParams: { f: JSON.stringify(this.searchRequest.filters), q: this.searchRequestObject.request.query, lang: null },
    //   // queryParamsHandling: 'merge',
    //   relativeTo: this.activated.parent,
    // })
    this.router.navigateByUrl('/app/search/home?f=')
  }

  removeSearch() {
    this.contact = this.lang = ''
    this.router.navigateByUrl('/app/search/learning?q=')
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

  private getTrainingsLHub2(_searchResults: NSSearch.ISearchV6ApiResultV3) {
    const restrictedFeatures = this.configSvc.restrictedFeatures
    const trainingLHubEnabled = restrictedFeatures && !restrictedFeatures.has('trainingLHub')

    if (trainingLHubEnabled) {
      // this.trainingSvc.getTrainingCountsForSearchResults(searchResults)
    }
  }

}
