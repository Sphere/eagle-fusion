export interface IAuthoringPagination {
  offset: number,
  limit: number
}

export interface IMenuNode {
  name: string
  children?: IMenuNode[]
  icon?: string
  status?: string
}

export interface IMenuFlatNode {
  expandable: boolean
  name: string
  levels: number
}

export interface IFilterMenuNode {
  displayName: string
  content?: IFilterMenuNode[]
  type?: string
  checked?: boolean
  count?: number
}

export interface IFilterOptions {
  contentType: string[]
  resourceType: string[]
}

export interface IFilterObject {
  status: string[]
  contentType: string[]
  complexityLevel: string[]
  sourceName: string[]
}
