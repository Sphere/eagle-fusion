export interface IWidgetGraphData {
  graphId: string
  graphType: TChartJsGraphType
  graphHeight: string
  graphWidth: string
  graphLegend: boolean
  graphLegendPosition?: 'left' | 'right' | 'top' | 'bottom'
  graphLegendFontSize?: number
  graphTicksFontSize?: number
  graphGridLinesDisplay: boolean
  graphXAxisLabel?: string
  graphYAxisLabel?: string
  graphIsXAxisLabel?: boolean
  graphIsXAxisAutoSkip?: boolean
  graphIsYAxisLabel?: boolean
  graphTicksXAxisDisplay?: boolean
  graphTicksYAxisDisplay?: boolean
  graphIsCustomizableColor?: boolean
  graphIsCustomizableType?: boolean
  graphDefaultPalette: TChartJsColorPalette
  graphDefaultType?: TChartJsGraphType
  graphXAxisMax?: number
  graphXAxisStepSize?: number
  graphXAxisMaxLimit?: number
  graphYAxisMax?: number
  graphFilterType?: string
  graphOnClick?: boolean
  graphYAxisStepSize?: number
  graphData: IGraphData
  graphIsCenterText?: boolean
  graphCenterText?: string
}

export interface IGraphData {
  labels: string[]
  datasets: IGraphDataSets[] | ILineGraphDataSets[] | IBubbleGraphDataSets[] | IRadarGraphDataSets[]
}

export interface IGraphDataSets {
  label?: string
  data: number[]
  backgroundColor: string[] | string | 'default' | 'primary' | 'accent' | 'warn'
  borderWidth: number
}

export interface ILineGraphDataSets {
  label?: string
  data: number[]
  backgroundColor?: string[] | string | 'default' | 'primary' | 'accent' | 'warn'
  borderWidth?: number
  lineTension?: number
  fill?: boolean
  type?: string
  borderColor?: string[]
  borderDash?: number[]
  pointRadius?: number[]
  pointBorderColor?: string
  pointBackgroundColor?: string
  pointHoverBackgroundColor?: string
  pointHoverBorderColor?: string
  pointBorderWidth?: number
  pointHoverRadius?: number
  pointHoverBorderWidth?: number
}

export interface IBubbleGraphDataSets {
  label: string
  data: IBubbleData[]
  backgroundColor: string[] | string | 'default' | 'primary' | 'accent' | 'warn'
  borderWidth: number
}

export interface IRadarGraphDataSets {
  label: string
  backgroundColor: string[] | string | 'default' | 'primary' | 'accent' | 'warn'
  data: number[]
}
export interface IBubbleData {
  x: string
  y: number
  r: number
}

export type TChartJsGraphType =
  | 'line'
  | 'bubble'
  | 'bar'
  | 'pie'
  | 'doughnut'
  | 'radar'
  | 'polar'
  | 'horizontalBar'
  | ''

export type TChartJsColorPalette = 'default' | 'palette1' | 'palette2' | 'palette3' | 'palette4'

export interface IGraphWidget {
  widgetType: string
  widgetSubType: string
  widgetData: IWidgetGraphData
}
