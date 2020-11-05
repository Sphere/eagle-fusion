export interface IWidgetsPlayerAmpData {
  subtitles?: {
    srclang: string;
    label: string;
    url: string;
  }[]
  tokens?: {
    streamingToken: string;
    manifest: string;
  }
  markers?: string[]
  resumePoint?: number
  passThroughData?: any
  posterImage?: string
}
