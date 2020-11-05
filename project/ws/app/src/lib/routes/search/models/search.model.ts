export interface ISearchRequest {
  filters: {
    [key: string]: string[]
  }
  advancedFilters?: {
    title: string
    filters: {
      [type: string]: string[]
    }
  }[]
  query: string
  isStandAlone?: boolean
  instanceCatalog?: boolean
  pageNo?: number
  pageSize?: number
  // sortBy?: 'lastUpdatedOn'
  // sortOrder?: 'ASC' | 'DESC'
  sort?: { [sortType: string]: 'asc' | 'desc' }[]
  locale?: string[]
  didYouMean?: boolean
}

export interface IFilterUnitResponse {
  id?: string
  type: string
  displayName: string
  content: IFilterUnitContent[]
  checked?: boolean
}
export interface IFilterUnitContent {
  type?: string
  id?: string
  displayName: string
  count: number
  children?: IFilterUnitContent[]
  checked?: boolean
}
export interface ITypeUnitResponse {
  displayName: string
  type: string
  count: string
}
export interface IFilterUnitItem {
  type?: string
  id?: string
  displayName: string
  count: number
  children?: IFilterUnitItem[]
  // added for UI
  checked?: boolean
  from?: string
  to?: string
  isExpanded?: boolean
}
export interface ISearchdateModified {
  from: string
  to: string
}
export type TSocialPostKind =
  | 'Blog'
  | 'Leadership-Blog'
  | 'Poll'
  | 'Query'
  | 'Reply'
  | 'Comment'
  | 'Unknown'
export interface ISearchSocialSearchPartialRequest {
  userId: string
  query: string
  pageNo: number
  pageSize: number
  sessionId: number
  postKind: TSocialPostKind
  filters?: {
    hashTags?: string[]
    tags?: string[]
    hasAcceptedAnswer?: boolean[]
    sourceName?: string[]
    sourceId?: string[]
    threadContributors?: string[]
    postCreator?: string[]
    dtLastModified?: ISearchdateModified[]
  }
  sort?: { [key: string]: string }[]
  locale?: string[]
}
export interface ISocialSearchRequest extends ISearchSocialSearchPartialRequest {
  org: string | null
  rootOrg: string | null
}
export interface IPostCreator {
  postCreatorId: string
  name: string
  emailId: string
}

export interface IThreadContributor {
  threadContributorId: string
  name: string
  emailId: string
}
export interface IPostActivity {
  activityData: {
    like: number
    upVote: number
    downVote: number
    flag: number
  }
  userActivity: {
    like: boolean
    upVote: boolean
    downVote: boolean
    flag: boolean
  }
}

export interface IWsSocialSearchResultData {
  abstract: string
  accessPaths: string[]
  activity: IPostActivity
  activityEndDate: string | null
  attachments: []
  body: string
  dtCreated: string
  dtLastModified: string
  dtPublished: string
  hasAcceptedAnswer: boolean
  highlight: {
    tags?: string[]
    body?: string[]
    title?: string[]
  }
  hashTags: string[]
  id: string
  likes: string
  options: []
  org: string
  postCreator: IPostCreator
  postKind: TSocialPostKind
  reply: []
  replyCount: number
  rootOrg: string
  source: {
    id: string
    name: string
  }
  status: string
  tags: string[]
  threadContributors: IThreadContributor[]
  thumbnail: string
  title: string
  upVoteCount: number
}
export interface ISocialFilterContent {
  displayName: string
  type: string
  count: number
}
export interface ISocialFilters {
  displayName: string
  type: string
  content: ISocialFilterContent[]
}
export interface ISocialSearchResult {
  total: number
  result: IWsSocialSearchResultData[]
  filters: ISocialFilters[]
}
export interface ISearchResolveResponse<T> {
  data: T | null
  error: any | null
}
export interface IFeatureSearchConfig {
  tabs: ISearchConfigContentStrip[]
  routeValue: string[]
  placeHolder: { [key: string]: string }
  social: {
    qanda?: {
      latest: { dtLastModified: string }
      trending: { upVoteCount: string }
    }
    blogs?: {
      latest: {
        dtLastModified: string
      }
      trending: {
        likeCount: string
      }
    }
  }
}

export interface INsSearchRedirection {
  f?: {
    [index: string]: string[]
  }
  q?: string
  tab?: string
}

export interface ISearchConfigContentStrip {
  titleKey?: string
  title?: string
  reqRoles?: string[]
  reqFeatures?: string[]
  searchRedirection?: INsSearchRedirection
  searchQuery?: ISearchRequest
  contentIds?: string[]
}
export interface IWsSearchAdvancedFilter {
  title: string
  filters: {
    [key: string]: string[]
  }
}
export interface ISearchTab {
  titleKey: string
  title: string
  searchQuery: {
    filters: {
      [key: string]: string[]
    }
    advancedFilters: {
      title: string
      filters: {
        [type: string]: string[]
      }
    }[]
    isStandAlone: boolean
  }
}

export interface ISearchAutoComplete {
  _source: {
    searchTerm: string
  }
}

export interface ISearchQuery {
  q: string
  l: string
}

export interface ISuggestedFilters {
  title: string
  icon: string
  url: string
  queryParams?: any
}
