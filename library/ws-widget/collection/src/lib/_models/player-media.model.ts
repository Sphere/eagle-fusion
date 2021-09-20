export interface IWidgetsPlayerMediaData {
  size?: any
  subtitles?: {
    srclang: string
    label: string
    url: string
  }[]
  identifier?: string
  url?: string
  autoplay?: boolean
  markers?: string[]
  resumePoint?: number
  passThroughData?: any
  posterImage?: string
  primaryCategory?: string,
  setCookie?: boolean
  disableTelemetry?: boolean
  isVideojs?: boolean
  platform?: any
  mimeType?: any
  continueLearning?: boolean
}
