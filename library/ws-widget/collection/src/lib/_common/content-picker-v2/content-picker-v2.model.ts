import { NSSearch } from '../../_services/widget-search.model'
export interface IAppliedFilters {
  [key: string]: Set<string>
}

export interface IWidgetData {
  preselected?: Set<string>
  includedFilters?: IFilter
  preAppliedFilters?: IFilter
  mode?: 'ids' | 'query'
  sortableFields?: NSSearch.ISearchSort
}

export interface IFilter {
  [key: string]: string[]
}

export interface IIncludedFilters {
  [key: string]: {
    displayName: string,
    values: string[]
  }
}
