export interface IChannelHub {
  cards: IChannelHubCard[]
  label: string
  containerClass?: string
  containerStyle?: string
}

export interface IChannelHubCard {
  description: string
  endDate?: Date | string
  image: string
  name: string
  startDate: Date | string
  url: string
  disable?: boolean
}
