import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core'
import { ValueService, ConfigurationsService } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import { NSSearch } from '../../_services/widget-search.model'
import { SearchApiService } from '@ws/app/src/lib/routes/search/apis/search-api.service'
// import { SearchServService } from '@ws/app/src/lib/routes/search/services/search-serv.service'
import { IWidgetData } from './content-picker-v2.model'
// import { IWidgetData, IAppliedFilters } from './content-picker-v2.model'
import { NsContent } from '../../_services/widget-content.model'
import { ContentPickerV2Service } from './content-picker-v2.service'
import { FormControl } from '@angular/forms'
import { distinctUntilChanged } from 'rxjs/operators'

@Component({
  selector: 'ws-widget-content-picker-v2',
  templateUrl: './content-picker-v2.component.html',
  styleUrls: ['./content-picker-v2.component.scss'],
})
export class ContentPickerV2Component implements OnInit, OnDestroy {

  @Input()
  widgetData!: IWidgetData
  @Output()
  change = new EventEmitter<{
    checked: boolean
    content: Partial<NsContent.IContent>
  }>()
  @Output()
  searchQueryEvent = new EventEmitter<NSSearch.ISearchV6RequestV2>()
  // searchQueryEvent = new EventEmitter<NSSearch.ISearchV6Request>()
  isLtMedium = false
  filtersExpanded = false
  isLtMediumSubscription: Subscription | null = null
  triggerSearchSubscription: Subscription | null = null
  // searchReq: NSSearch.ISearchV6Request
  searchReq: NSSearch.ISearchV6RequestV2
  searchResults!: NSSearch.ISearchV6ApiResult
  defaultThumbnail = ''
  fetchStatus: 'none' | 'fetching' | 'done' | 'error'
  searchConfig: any = null
  objKey = Object.keys
  sortOrderControl = new FormControl('desc')
  sortByControl = new FormControl()

  constructor(
    private valueSvc: ValueService,
    private searchApiSvc: SearchApiService,
    private configSvc: ConfigurationsService,
    private contentPickerSvc: ContentPickerV2Service,
    // private searchServSvc: SearchServService,
  ) {
    this.fetchStatus = 'none'
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.defaultThumbnail = instanceConfig.logos.defaultContent
    }
    // this.searchReq = {
    //   query: '',
    //   didYouMean: false,
    //   locale: [this.searchServSvc.getLanguageSearchIndex(
    //     this.configSvc.activeLocale && this.configSvc.activeLocale.locals[0] || 'en'
    //   )],
    // }

    this.searchReq = {
      request: {
        query: '',
        fields: [],
        facets: [],
        sort_by: {
          lastUpdatedOn: '',
        },
        filters: {
          primaryCategory: [],
        },
      },
    }

    this.initSearchResults()
  }

  initSearchResults() {
    this.searchResults = {
      filters: [],
      filtersUsed: [],
      notVisibleFilters: [],
      result: [],
      totalHits: 0,
    }
  }

  changeSelectedContent(checked: boolean, content: NsContent.IContent) {
    this.change.emit({ checked, content })
  }

  // appliedFilters(filters: IAppliedFilters) {
  //   this.searchReq.filters = [{
  //     andFilters: Object.keys(filters).map(key => {
  //       return {
  //         [key]: Array.from(filters[key]).map(val => val),
  //       }
  //     }),
  //   }]
  //   this.triggerSearch()
  // }

  appliedFilters() {
    this.searchReq.request.filters.primaryCategory = []
    this.triggerSearch()
  }

  searchRequest(req: { lang: string, query: string }) {
    this.searchReq.request.query = req.query
    this.triggerSearch()
  }

  // searchRequest(req: { lang: string, query: string }) {
  // this.searchReq.locale = [req.lang]
  // this.searchReq.query = req.query
  // this.triggerSearch()
  // }

  // async triggerSearch() {
  //   if (!this.searchConfig) {
  //     this.searchConfig = {}
  //     try {
  //       this.searchConfig = await this.contentPickerSvc.getData(`${this.configSvc.sitePath}/feature/search.json`).toPromise()
  //     } catch (_err) { }
  //   }
  //   const isStandAlone = this.searchConfig.search.tabs[0].isStandAlone
  //   let applyIsStandAlone = false
  //   if (isStandAlone || isStandAlone === undefined) {
  //     applyIsStandAlone = true
  //   }
  //   this.searchReq.isStandAlone = applyIsStandAlone ? applyIsStandAlone : undefined
  //   this.searchQueryEvent.emit(this.searchReq)
  //   this.fetchStatus = 'fetching'
  //   this.initSearchResults()
  //   this.triggerSearchSubscription = this.searchApiSvc.getSearchV6Results(this.searchReq).subscribe(
  //     results => {
  //       this.fetchStatus = 'done'
  //       this.searchResults = JSON.parse(JSON.stringify(results))
  //     },
  //     _err => {
  //       this.fetchStatus = 'error'
  //     })
  // }

  async triggerSearch() {
    if (!this.searchConfig) {
      this.searchConfig = {}
      try {
        this.searchConfig = await this.contentPickerSvc.getData(`${this.configSvc.sitePath}/feature/search.json`).toPromise()
      } catch (_err) { }
    }
    // const isStandAlone = this.searchConfig.search.tabs[0].isStandAlone
    // let applyIsStandAlone = false
    // if (isStandAlone || isStandAlone === undefined) {
    //   applyIsStandAlone = true
    // }
    // this.searchReq.isStandAlone = applyIsStandAlone ? applyIsStandAlone : undefined
    this.searchQueryEvent.emit(this.searchReq)
    this.fetchStatus = 'fetching'
    this.initSearchResults()
    this.triggerSearchSubscription = this.searchApiSvc.getSearchV6Results(this.searchReq).subscribe(
      results => {
        this.fetchStatus = 'done'
        this.searchResults = JSON.parse(JSON.stringify(results))
      },
      _err => {
        this.fetchStatus = 'error'
      })
  }

  // ngOnInit() {
  //   this.isLtMediumSubscription = this.valueSvc.isLtMedium$.subscribe(isLtMedium => {
  //     this.isLtMedium = isLtMedium
  //   })
  //   this.sortByControl.valueChanges.pipe(
  //     distinctUntilChanged()
  //   ).subscribe(sortKey => {
  //     this.searchReq.sort = [{ [sortKey]: this.sortOrderControl.value }]
  //     this.triggerSearch()
  //   })
  //   this.sortOrderControl.valueChanges.pipe(
  //     distinctUntilChanged()
  //   ).subscribe(sortOrder => {
  //     if (this.sortByControl.value) {
  //       this.searchReq.sort = [{ [this.sortByControl.value]: sortOrder }]
  //       this.triggerSearch()
  //     }
  //   })
  // }

  ngOnInit() {
    this.isLtMediumSubscription = this.valueSvc.isLtMedium$.subscribe(isLtMedium => {
      this.isLtMedium = isLtMedium
    })
    this.sortByControl.valueChanges.pipe(
      distinctUntilChanged()
    ).subscribe(() => {
      this.searchReq.request.sort_by.lastUpdatedOn = this.sortOrderControl.value
      // this.searchReq.sort = [{ [sortKey]: this.sortOrderControl.value }]
      this.triggerSearch()
    })
    this.sortOrderControl.valueChanges.pipe(
      distinctUntilChanged()
    ).subscribe(() => {
      if (this.sortByControl.value) {
        // this.searchReq.sort = [{ [this.sortByControl.value]: sortOrder }]
        this.searchReq.request.sort_by.lastUpdatedOn = this.sortByControl.value
        this.triggerSearch()
      }
    })
  }

  ngOnDestroy() {
    if (this.isLtMediumSubscription) {
      this.isLtMediumSubscription.unsubscribe()
    }
    if (this.triggerSearchSubscription) {
      this.triggerSearchSubscription.unsubscribe()
    }
  }

}
