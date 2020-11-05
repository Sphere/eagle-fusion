import { NsWidgetResolver } from '@ws-widget/resolver'
export interface ISelectorResponsive {
  selectFrom: ISelectorResponsiveUnit[]
  type?: string
  subType?: string
}

export interface ISelectorResponsiveUnit {
  minWidth: number
  maxWidth: number
  widget: NsWidgetResolver.IRenderConfigWithAnyData
}
