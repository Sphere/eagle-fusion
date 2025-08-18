import { NSSearch } from '../../_services/widget-search.model'
export interface IAppliedFilters {
  [key: string]: Set<string>
}

export interface IWidgetData {
  preselected?: Set<string>
  includedFilters?: IIncludedFilters
  preAppliedFilters?: IFilter
  mode?: 'ids' | 'query'
  sortableFields?: NSSearch.ISearchV6VisibleFilters
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
