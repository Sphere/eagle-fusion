import { NsWidgetResolver } from '@ws-widget/resolver'
export interface IIntranetSelector {
  url?: string
  isIntranet?: IIntranetSelectorUnit
  isNotIntranet?: IIntranetSelectorUnit
}

export interface IIntranetSelectorUnit {
  widget: NsWidgetResolver.IRenderConfigWithAnyData
}
