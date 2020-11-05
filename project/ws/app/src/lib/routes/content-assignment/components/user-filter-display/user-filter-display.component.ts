import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import {
  IUserSearchRequestModel,
  IUserSearchUnitFilterModel,
} from '../../../../../../../../../library/ws-widget/collection/src/lib/content-assign/content-assign.model'
import { ContentAssignService } from '../../../../../../../../../library/ws-widget/collection/src/public-api'
import { ConfigurationsService } from '../../../../../../../../../library/ws-widget/utils/src/public-api'

@Component({
  selector: 'ws-app-user-filter-display',
  templateUrl: './user-filter-display.component.html',
  styleUrls: ['./user-filter-display.component.scss'],
})
export class UserFilterDisplayComponent implements OnInit, OnChanges {
  @Input() filterSearchRequest!: IUserSearchRequestModel
  @Input() filtersResponse!: IUserSearchUnitFilterModel[]
  @Input() filtersResetAble = false
  @Input() sideNavBarOpened = false
  @Output() filterClose: EventEmitter<boolean> = new EventEmitter()
  @Output() change = new EventEmitter<{
    filters: { [key: string]: string[] }
  }>()

  userAdminLevel = ''
  userType = ''
  userFilterLevel = ''

  constructor(
    private configSvc: ConfigurationsService,
    private contentAssignSvc: ContentAssignService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.userAdminLevel = this.route.snapshot.queryParams.adminLevel
      this.userType = this.route.snapshot.queryParams.userType
      if (this.userType === 'admin') {
        this.applyLevelFilter()
      }
    },         10)
  }

  ngOnChanges() {
    this.filterChecked()
  }

  filterChecked() {
    if (this.filtersResponse) {
      for (const parentFilter of this.filtersResponse) {
        const keyName = parentFilter.type
        for (const value of parentFilter.values) {
          const valueName = value.type
          if (this.filterSearchRequest.filters.hasOwnProperty(keyName)) {
            if (this.filterSearchRequest.filters[keyName].includes(valueName)) {
              parentFilter.checked = true
              value.checked = true
            }
          }
        }
      }
    }
  }

  applyFilters(unitFilterObject: { unitFilter: IUserSearchUnitFilterModel; filterType: string }, checked: boolean) {

    const filterItem = {
      key: unitFilterObject.filterType,
      value: unitFilterObject.unitFilter.type || '',
    }
    if (checked) {
      this.addFilter(filterItem)
    } else {
      this.removeFilter(filterItem)
    }
  }

  applyLevelFilter() {
    if (this.configSvc.userProfile && this.configSvc.org && this.userAdminLevel) {
      const reqBody = {
        pageSize: 10,
        orgs: this.configSvc.org,
        filters: {
          wid: [this.configSvc.userProfile.userId],
        },
        requiredSources: [this.userAdminLevel],
      }
      if (this.userAdminLevel === 'dealer_code') {
        reqBody.requiredSources.push('dealer_name_branch_code')
      } else if (this.userAdminLevel === 'dealer_group_code') {
        reqBody.requiredSources.push('dealer_name_group_code')
      }
      this.contentAssignSvc.searchUsers(reqBody).subscribe(
        (data: any) => {
          if (data.result.length) {
            this.userFilterLevel = data.result[0][this.userAdminLevel]
            const filterItem = {
              key: this.userAdminLevel,
              value: this.userFilterLevel,
            }
            this.addFilter(filterItem)
          }
        }
      )
    }
  }
  addFilter({ key, value }: { key: string; value: string }) {
    let filters: {
      [key: string]: string[]
    } = {}
    if (this.filterSearchRequest) {
      filters = this.filterSearchRequest.filters
    }
    if (key in filters) {
      filters[key] = [...filters[key], value]
    } else {
      filters[key] = [value]
    }

    this.change.emit({
      filters,
    })
  }
  removeFilter({ key, value }: { key: string; value: string }) {
    const filters = this.filterSearchRequest.filters
    if (key in filters || filters) {
      filters[key] = filters[key].filter(filter => filter !== value)
      for (const fil in filters) {
        if (filters[fil].length === 0) {
          delete filters[fil]
        }
      }
      this.change.emit({
        filters,
      })
    }
  }

  removeFilters() {
    this.change.emit({
      filters: {},
    })
  }

}
