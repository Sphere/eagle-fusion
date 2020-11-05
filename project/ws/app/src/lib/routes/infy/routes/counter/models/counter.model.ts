export interface ICounterInfyMeResponse {
  downloads: ICounterInfyMeEntity[]
  yesterdaysDownloads: number
  totalDownloads: number
}
export interface ICounterInfyMeEntity {
  date: string
  count: number
}
export interface ICounterPlatformResponse {
  load: ICounterPlatformEntity[]
  learners: ICounterPlatformEntity[]
  users: ICounterPlatformEntity[]
}
export interface ICounterPlatformEntity {
  time: number
  count: number
}
export interface ICounterPlotData {
  data: ICounterPlatformEntity[]
  meta: ICounterGraphMeta
}
export interface ICounterInfyMePlotData {
  data: ICounterInfyMeEntity[]
  meta: ICounterGraphMeta
}
export interface ICounterGraphMeta {
  chartId: string
  graphLabel: string
  graphTitle: string
  graphType: string
  xLabel: string
  yLabel: string
  borderColor: string
  backgroundColor: string
  header?: {
    icon: string
    value: number
    txt: string
  }
}
