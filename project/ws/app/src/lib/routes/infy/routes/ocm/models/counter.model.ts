export interface IWsCounterInfyMeResponse {
  downloads: IWsCounterInfyMeEntity[]
  yesterdaysDownloads: number
  totalDownloads: number
}
export interface IWsCounterInfyMeEntity {
  date: string
  count: number
}
export interface IWsCounterPlatformResponse {
  load: IWsCounterPlatformEntity[]
  learners: IWsCounterPlatformEntity[]
  users: IWsCounterPlatformEntity[]
}
export interface IWsCounterPlatformEntity {
  time: number
  count: number
}
export interface IWsCounterPlotData {
  data: IWsCounterPlatformEntity[]
  meta: ICounterGraphMeta
}
export interface IWsCounterInfyMePlotData {
  data: IWsCounterInfyMeEntity[]
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
    icon: string;
    value: number;
    txt: string;
  }
}
