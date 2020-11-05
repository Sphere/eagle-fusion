export interface IPickerContentData {
  preselected?: Set<string>
  availableFilters?: string[]
  enablePreselected?: boolean
  showChips?: boolean
  chipNamesHash?: { [id: string]: string }
}

export interface IRemoveSubsetResponse {
  resource_list: string[]
  suggested_time: number
  goal_message: string[]
}

export interface ISearchConfig {
  search: {
    languageSearch: string[];
  }
}
