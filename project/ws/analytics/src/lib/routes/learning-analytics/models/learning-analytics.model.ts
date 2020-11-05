import { IWidgetGraphData } from '@ws-widget/collection'

export namespace NsAnalytics {
  export interface IConfig {
    currentYear: number
    threshold: number
    todaysDate: string
    today: boolean
    years: any[]
    fromDate: Date | string | null
    toDate: Date | string | null
    type: string
    quarters: IQuarters[]
    selectedYear: number | null
    selectedQuarters: any[]
  }

  export interface IQuarters {
    name: string
    id: number
    color: string
  }
  export interface IQuarterObj {
    key: string
    value: number
  }

  export interface IFilterObj {
    [key: string]: string
  }

  export interface IFilter {
    filterName: string
    filterType: string
  }
  export interface IGraphWidget {
    widgetType: string
    widgetSubType: string
    widgetData: IWidgetGraphData
  }
}
