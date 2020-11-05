export interface IUserSearchRequestModel {
  pageSize?: number,
  pageNo?: number,
  orgs: string[],
  userId?: string,
  filters: {
    [key: string]: string[]
  }
  requiredAggs?: string[],
  requiredSources?: string[]
}

export interface IContentAssignModel {
  contentIds: string[],
  userCriteria: {
    [key: string]: string[] | boolean
  },
  assignedBy: string,
  assignmentType: string,
  isMandatory: boolean
}

export interface IUserSearchResponseModel {
  result: IUserDataModel[]
  totalHits: number,
  filters: IUserSearchUnitFilterModel[]
}

export interface IUserDataModel {
  full_name: string,
  wid: string,
  job_title: string
}

export interface IUserSearchUnitFilterModel {
  displayName: string,
  values: IUserSearchFilterValues[],
  type: string
  checked?: boolean
}

export interface IUserSearchFilterValues {
  displayName: string,
  type: string,
  count: number,
  id?: string | null
  checked?: boolean
}
