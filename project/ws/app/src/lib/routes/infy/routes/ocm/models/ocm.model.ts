import { NSSearch, ICarousel } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'

export interface IWsOcmJsonResponse {
  pageTitle: string
  banners: NsWidgetResolver.IRenderConfigWithTypedData<ICarousel[]>
  about: IWsAboutConfig
  sentientInfosys: IWsSearchConfig
  leadChange: IWsSearchConfig
  programs: IWsProgramsConfig
  toDoList: IWsToDoListRequest
  changeChampions: IWsChampionsConfig
  inbox: IWsSearchConfig
  stats: IWsStatsConfig
  events: IWsEventsConfig
  feedback: IWsFeedbackConfig
  coCreate: IWsCoCreatorConfig
  influencer: IWsInfluencerConfig
  changeStories: IWsSearchConfig
}

export interface IWsToDoListResponse {
  name: string
  completed: boolean
}

export interface IWsAboutConfig {
  title: string
  about: string
}

export interface IWsSearchConfig {
  title: string
  widgetSearchQuery: NsWidgetResolver.IRenderConfigWithTypedData<NSSearch.ISearchRequest>
}

export interface IWsProgramsConfig {
  title: string
  programsList: IWsPrograms[]
}

export interface IWsPrograms {
  title: string
  logo: string
  widgetSearchQuery: NsWidgetResolver.IRenderConfigWithTypedData<NSSearch.ISearchRequest>
}

export interface IWsToDoListRequest {
  title: string
  toDoId: string
}

export interface IWsChampionsConfig {
  title: string
  champions: IWsChampions[]
}

export interface IWsChampions {
  title: string
  championsList: IWsChampionsDetails[]
}

export interface IWsChampionsDetails {
  firstName: string
  lastName: string
  emailId: string
  desc: string
}

export interface IWsStatsConfig {
  title: string
  dashboardsList: IWsStat[]
}

export interface IWsStat {
  title: string
  titleKey: string
}

export interface IWsInfluencerConfig {
  title: string
  yammerGroupId?: string
}

export interface IWsCoCreatorConfig {
  title: string
  desc: string
  emailTo: string
  contributionList: IWsContribution[]
}

export interface IWsContribution {
  name: string
  iconName: string
  emailText: string
}

export interface IWsFeedbackConfig {
  title: string
}

export interface IWsEventsConfig {
  title: string
  eventsList: IWsEvent[]
}
export interface IWsEvent {
  timestamp: number
  eventTitle: string
  eventDesc: string
  eventTime: string
  category: string
  items?: string[]
}

export interface IWsChannels {
  title: string
  desc: string
  logo?: string
  icon?: string
  routerLink: string
  isAvailable: boolean
}
