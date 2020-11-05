import { NsWidgetResolver } from '@ws-widget/resolver'
import { NSSearch } from '../_services/widget-search.model'
import { NsContent } from '../_services/widget-content.model'

export namespace NsContentStripSingle {
  export interface IContentStripSingle {
    noDataWidget?: NsWidgetResolver.IRenderConfigWithAnyData
    loader?: boolean
    errorWidget?: NsWidgetResolver.IRenderConfigWithAnyData
    image: string
    key: string
    title: string
    request?: {
      search?: NSSearch.ISearchRequest
      searchV6?: NSSearch.ISearchV6Request
      searchRegionRecommendation?: NSSearch.ISearchOrgRegionRecommendationRequest
      api?: IStripRequestApi
      ids?: string[]
      manualData?: IContentStrip[]
    }
    searchV6Type?: 'KB' | 'Collections' | 'searchQuery' | null
  }

  export interface IContentStrip {
    title: string
    lastUpdatedOn: string | Date
    url: string
    target: '_blank' | '_self'
  }

  export interface IStripRequestApi {
    path: string
    queryParams?: {
      pageNo?: number
      pageSize?: number
      pageState?: string
    }
  }
  export interface IStripInfo {
    mode: 'below' | 'popup' | 'modal'
    visibilityMode?: 'hidden' | 'visible'
    icon: {
      icon: string
      scale: number
      style?: any // added for UI
    }
    widget: NsWidgetResolver.IRenderConfigWithAnyData
  }

  export interface IContentStripResponseApi {
    contents: NsContent.IContent[]
    hasMore?: boolean
    pageState?: string
    totalHits?: number
  }
}
