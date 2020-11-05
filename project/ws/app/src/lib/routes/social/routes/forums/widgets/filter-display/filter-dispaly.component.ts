import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfigurationsService } from '../../../../../../../../../../../library/ws-widget/utils/src/public-api'
import { SocialForum } from '../../models/SocialForumposts.model'
import { FilterService } from '../../service/sub-services/filter.service'

@Component({
  selector: 'ws-app-filter-dispaly',
  templateUrl: './filter-dispaly.component.html',
  styleUrls: ['./filter-dispaly.component.scss'],
})
export class FilterDispalyComponent implements OnInit {
  @Input() filtersResponse: SocialForum.IFilterUnitResponse[] = []
  @Input() sideNavBarOpened = false
  @Input() filtersResetAble = false
  @Output() filterClose: EventEmitter<boolean> = new EventEmitter()
  translatedFilters: any = {}
  searchRequest: {
    filters: { [type: string]: any[] }
  } = {
      filters: {},
    }
  constructor(
    private activated: ActivatedRoute,
    private router: Router,
    private filterServ: FilterService,
    private configSvc: ConfigurationsService,
  ) { }

  ngOnInit() {
    this.activated.queryParamMap.subscribe(queryMap => {
      if (queryMap.has('f')) {
        const filters = JSON.parse(queryMap.get('f') || '{}')
        //   console.log('THE FILTERS ACTIVATEDDDDDDDDDDDDDDDDDD IN FILTER COMPONENT IS' + JSON.stringify(filters))
        this.searchRequest.filters = filters
      }
    })
    const lang = this.configSvc.userPreference && this.configSvc.userPreference.selectedLocale
    this.filterServ.translateSearchFilters(lang || 'en').then(val => {
      this.translatedFilters = val
    })

  }

  filterUnitResponseTrackBy(filter: SocialForum.IFilterUnitResponse) {
    return filter.id
  }
  filterUnitTrackBy(filter: SocialForum.IFilterUnitItem) {
    return filter.id
  }
  applyFilters(unitFilterObject: { unitFilter: SocialForum.IFilterUnitItem; filterType: string }) {
    // console.log(unitFilterObject)
    // console.log("The aTYPE OF apply filters received is" + unitFilterObject.filterType)
    this.filtersResponse = []
    // last  published filter handling starts

    // last  published filter handling ends`

    const filterItem = {
      key: unitFilterObject.filterType,
      value: unitFilterObject.unitFilter.type || '',
      from: unitFilterObject.unitFilter.from || '',
      to: unitFilterObject.unitFilter.to || '',
    }
    // if (unitFilterObject.filterType === "dtPublished") {
    //   filterItem.value = tempval

    // }
    const requestFilters = this.searchRequest.filters
    let filterRemove = false
    // console.log("Request filters XXXXXXXXXXXXXXXXXX is" + JSON.stringify(requestFilters[filterItem.key]))

    /// Trial starts

    if (unitFilterObject.filterType === 'dtPublished' && requestFilters[filterItem.key]) {
      requestFilters[filterItem.key].forEach(x => {
        // console.log(x.type)
        if (x.type === unitFilterObject.unitFilter.type) {
          //   console.log("filtertype remove")
          filterRemove = true
        }
      })
    }

    // trial ends
    // console.log("the val RRRRRRRRRRRRRRRRRRRR is" + requestFilters[filterItem.key].indexOf(filterItem.value))
    if (requestFilters) {
      // console.log("the key RRRRRRRRRRRRRRRRRRRR is" + JSON.stringify(filterItem.key))
      // console.log("the VAlue RRRRRRRRRRRRRRRRRRRR is" + JSON.stringify(filterItem.value))
      //  console.log("the val SSSSSSSSSSS is" + requestFilters[filterItem.key].indexOf(filterItem.value))
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
  addFilter({ key, value, from, to }: { key: string; value: string; from: string; to: string }) {

    const filters = { ...this.searchRequest.filters }
    // console.log('IN THE FILTER COMPONENT IS' + JSON.stringify(key) + " value is" + JSON.stringify(value))

    const tempvalx = {
      from,
      to,
      type: value,
    }
    if (key in filters) {
      // console.log("filter key is" + filters[key])
      if (to !== '') {

        //   console.log("case 1")
        filters[key] = [...filters[key], tempvalx]
      } else {
        // console.log("case 2")
        filters[key] = [...filters[key], value]
      }

    } else {
      //  console.log("case 3")
      if (to !== '') {

        //    console.log("case 1")
        // filters[key] = [...filters[key], tempvalx]
        filters[key] = [tempvalx]

      } else {
        filters[key] = [value]
      }
    }

    this.router.navigate([], {
      queryParams: { f: JSON.stringify(filters) },
      relativeTo: this.activated.parent,
      queryParamsHandling: 'merge',
    })
  }
  removeFilter({ key, value }: { key: string; value: string }) {
    //  console.log("The remove filter is CSALLED")
    const filters = { ...this.searchRequest.filters }

    if (key in filters || filters) {
      // console.log("filters key is" + JSON.stringify(filters[key]))
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
    /// trial
    // if (value in filters || filters) {
    //   console.log("filters val is" + JSON.stringify(filters[value]))
    //   filters[key] = filters[key].filter(filter => { filter !== value })
    //   for (const fil in filters) {
    //     if (filters[fil].length === 0) {
    //       delete filters[fil]
    //     }
    //   }

    this.router.navigate([], {
      queryParams: { f: JSON.stringify(filters) },
      relativeTo: this.activated.parent,
      queryParamsHandling: 'merge',
    })
  }

  removeFilters() {
    this.router.navigate([], {
      queryParams: { f: null },
      queryParamsHandling: 'merge',
      relativeTo: this.activated.parent,
    })
  }

}
