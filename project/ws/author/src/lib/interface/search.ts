import { NSContent } from './content'

export interface ISearchContent {
  locale: string
  subTitle: string
  sourceName: string
  isStandAlone: boolean
  isInIntranet: boolean
  exclusiveContent: boolean
  isContentEditingDisabled: boolean
  isAuthoringDisabled: boolean
  isMetaEditingDisabled: boolean
  publishedOn: string
  expiryDate: string
  hasTranslations: ITranslation[]
  isTranslationOf: ITranslation[]
  lastUpdatedOn: string
  children: any[]
  unit: string
  status: string
  isExternal: boolean
  learningMode: string
  name: string
  identifier: string
  description: string
  resourceType: string
  contentType: string
  appIcon: string
  artifactUrl: string
  mimeType: string
  creatorContacts: NSContent.IAuthorDetails[]
  duration: number
  creatorDetails: NSContent.IAuthorDetails[]
  idealScreenSize: string
  trackContacts: NSContent.IAuthorDetails[]
  publisherDetails: NSContent.IAuthorDetails[]
  comments: NSContent.IComments[]
  category: string
  categoryType: string
  versionDate: string
}

export interface ISearchResult {
  result: ISearchContent[]
  notVisibleFilters: any[]
  totalHits: number
  filtersUsed: string[]
  filters: ISearchFilter[]
}

export interface ISearchFilter {
  id?: string
  type: string
  displayName: string
  content: ISearchFilterContent[]
}
export interface ISearchFilterContent {
  type?: string
  id?: string
  displayName: string
  count: number
  children?: ISearchFilterContent[]
}

export interface ITranslation {
  identifier: string
  locale: string
}
