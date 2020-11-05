import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfigurationsService } from '@ws-widget/utils'
import { IFilterUnitItem, IFilterUnitResponse, ISearchConfigContentStrip, IWsSearchAdvancedFilter } from '../../models/search.model'
import { SearchServService } from '../../services/search-serv.service'
@Component({
  selector: 'ws-app-filter-display',
  templateUrl: './filter-display.component.html',
  styleUrls: ['./filter-display.component.scss'],
})
export class FilterDisplayComponent implements OnInit {
  @Input() filtersResponse: IFilterUnitResponse[] = []
  @Input() routeComp = ''
  @Input() filtersResetAble = false
  @Input() sideNavBarOpened = false
  @Output() filterClose: EventEmitter<boolean> = new EventEmitter()
  advancedFilters: IWsSearchAdvancedFilter[] = []
  translatedFilters: any = {}
  searchRequest: {
    filters: { [type: string]: string[] }
  } = {
      filters: {},
    }
  constructor(
    private activated: ActivatedRoute,
    private router: Router,
    private searchServ: SearchServService,
    private configSvc: ConfigurationsService,
  ) { }

  ngOnInit() {
    const lang = this.configSvc.userPreference && this.configSvc.userPreference.selectedLocale
    this.searchServ.translateSearchFilters(lang || 'en').then(val => {
      this.lowerCaseFilter(val, Object.keys(val))
      this.translatedFilters = val
    })
    if (
      this.activated.parent &&
      this.activated.parent.snapshot.data.searchPageData.data.search.tabs
    ) {
      this.activated.parent.snapshot.data.searchPageData.data.search.tabs.map(
        (cur: ISearchConfigContentStrip) => {
          if (
            this.routeComp === cur.titleKey &&
            cur.searchQuery &&
            cur.searchQuery.advancedFilters
          ) {
            this.advancedFilters = cur.searchQuery.advancedFilters
          }
        },
      )
    }
    this.activated.queryParamMap.subscribe(queryParams => {
      // Reset search request object
      this.searchRequest = {
        filters: {},
      }
      // filters
      if (queryParams.has('f')) {
        // try {
        const filters = JSON.parse(queryParams.get('f') || '{}')
        this.searchRequest.filters = filters
        // } catch (err) {
        //   logger.error('Unable to read filter from query. Possibly cause is invalid filter object/JSON', err);
        // }
      }
    })

  }

  advancedFilterClick(filter: IWsSearchAdvancedFilter) {
    this.router.navigate([], {
      queryParams: { f: JSON.stringify(filter.filters) },
      relativeTo: this.activated.parent,
      queryParamsHandling: 'merge',
    })
  }
  filterUnitResponseTrackBy(filter: IFilterUnitResponse) {
    return filter.id
  }
  filterUnitTrackBy(filter: IFilterUnitItem) {
    return filter.id
  }
  applyFilters(unitFilterObject: { unitFilter: IFilterUnitItem; filterType: string }) {

    this.filtersResponse = []
    const filterItem = {
      key: unitFilterObject.filterType,
      value: unitFilterObject.unitFilter.type || '',
    }

    const requestFilters = this.searchRequest.filters
    let filterRemove = false

    if (requestFilters) {
      if (
        requestFilters[filterItem.key] &&
        requestFilters[filterItem.key].indexOf(filterItem.value) !== -1
      ) {
        filterRemove = true
      }
    }
    if (!filterRemove) {
      this.addFilter(filterItem)
    } else {
      this.removeFilter(filterItem)
    }
  }
  addFilter({ key, value }: { key: string; value: string }) {

    const filters = { ...this.searchRequest.filters }

    if (key in filters) {
      filters[key] = [...filters[key], value]
    } else {
      filters[key] = [value]
    }

    this.router.navigate([], {
      queryParams: { f: JSON.stringify(filters) },
      relativeTo: this.activated.parent,
      queryParamsHandling: 'merge',
    })
  }
  removeFilter({ key, value }: { key: string; value: string }) {

    const filters = { ...this.searchRequest.filters }

    if (key in filters || filters) {
      filters[key] = filters[key].filter(filter => filter !== value)
      for (const fil in filters) {
        if (filters[fil].length === 0) {
          delete filters[fil]
        }
      }
      this.router.navigate([], {
        queryParams: { f: JSON.stringify(filters) },
        relativeTo: this.activated.parent,
        queryParamsHandling: 'merge',
      })
    }
  }

  removeFilters() {
    this.router.navigate([], {
      queryParams: { f: null },
      queryParamsHandling: 'merge',
      relativeTo: this.activated.parent,
    })
  }

  lowerCaseFilter(filterObj: any, filterKeys: string[]) {
    filterKeys.forEach(data => {
      Object.defineProperty(filterObj, data.toLowerCase(), Object.getOwnPropertyDescriptor(filterObj, data) || {})
      if (filterObj[data].value && filterObj[data].value !== {}) {
        this.lowerCaseFilter(filterObj[data].value, Object.keys(filterObj[data].value))
      }
    })
  }
}
