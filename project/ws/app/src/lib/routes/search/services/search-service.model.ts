/**
 * Search Service Data Models
 */

export interface IProgressHash {
  [id: string]: number
}

export interface ISearchConfig {
  search: {
    tabs: Array<{
      phraseSearch?: boolean
      [key: string]: any
    }>
    visibleFilters?: Record<string, any>
    visibleFiltersV2?: Record<string, any>
    excludeSourceFields?: string[]
    defaultsearch?: any
  }
  [key: string]: any
}

export interface ISearchFilterOption {
  type: string
  displayName: string
  content: Array<{
    type?: string
    displayName: string
    count: number
    children?: any[]
  }>
  checked?: boolean
}

export interface IFilterHandleResult {
  concept: any[]
  filtersRes: ISearchFilterOption[]
}

export interface IFilterSet {
  filterSet: Set<string>
  filterReset: boolean
}
