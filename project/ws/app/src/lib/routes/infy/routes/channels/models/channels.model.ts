export interface IWsChannelsConfig {
  tabs: IWsChannelsTab[]
}

export interface IWsChannelsTab {
  tabDetails: IWsChannelTabDetails
  tabContent: IWsChannelTabContent
}

export interface IWsChannelTabDetails {
  name: string
  key: string
  routerLink: string
}

export interface IWsChannelTabContent {
  cardType: string
  data: IWsChannelLeaderData[] | IWsChannelInitiativesData[] | IWsChannelEventsData[]
}

export interface IWsChannelLeaderData {
  name: string
  designation: string
  profileImage: string
  routerLink: string
}

export interface IWsChannelInitiativesData {
  title: string
  desc: string
  iconName: string
  routerLink: string
}

export interface IWsChannelEventsData {
  eventName: string
  routerLink: string
  startTime?: string
  endTime?: string
}
