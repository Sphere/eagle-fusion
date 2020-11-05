import { NsWidgetResolver } from '@ws-widget/resolver'

export namespace NsGalleryView {
  export interface IWidgetGalleryView {
    designVal?: string
    autoNext?: boolean
    delay?: number
    loop?: boolean
    type?: string
    subType?: string
    cardMenu: ICardMenu[]
    configs: ICardConfig
  }
  export interface ICardMenu {
    cardData?: ICardData
    widget: NsWidgetResolver.IRenderConfigWithAnyData
  }

  interface ICardConfig {
    widgetPlayer: IStyleConfig
    widgetRibbon: IStyleConfig
  }

  interface IStyleConfig {
    className: string
    styles: { [key: string]: string }
  }

  interface ICardData {
    title: string
    description: string
    thumbnail: string
    // UI only
    currentlyPlaying?: boolean
  }
}
