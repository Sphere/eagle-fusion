import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { IAppliedFilters, IFilter, IIncludedFilters } from '../../content-picker-v2.model'

@Component({
  selector: 'ws-widget-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
})
export class FiltersComponent implements OnInit {

  @Input()
  includedFilters: IIncludedFilters = {}
  @Input()
  preAppliedFilters: IFilter = {}

  @Output()
  appliedFiltersEmitter = new EventEmitter<IAppliedFilters>()

  @Output()
  closeSideNav = new EventEmitter()

  appliedFilters: IAppliedFilters = {}
  objKeys = Object.keys

  constructor() { }

  filterChange(checked: boolean, filterType: string, filter: string) {
    if (!this.appliedFilters.hasOwnProperty(filterType)) {
      this.appliedFilters[filterType] = new Set([])
    }
    if (checked) {
      this.appliedFilters[filterType].add(filter)
    } else {
      this.appliedFilters[filterType].delete(filter)
    }
    this.appliedFiltersEmitter.emit(this.appliedFilters)
  }

  closeFilter() {
    this.closeSideNav.emit()
  }

  ngOnInit() {
    Object.keys(this.preAppliedFilters).forEach(key => {
      this.appliedFilters[key] = new Set(this.preAppliedFilters[key])
    })
    this.appliedFiltersEmitter.emit(this.appliedFilters)
  }

}
