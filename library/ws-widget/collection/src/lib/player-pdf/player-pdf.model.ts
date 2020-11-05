export interface IWidgetsPlayerPdfData {
  pdfUrl: string
  resumePage?: number
  identifier: string
  passThroughData?: any
  disableTelemetry?: boolean
  hideControls?: boolean
  readValuesQueryParamsKey?: {
    zoom: string;
    pageNumber: string;
  }
}

export interface IPlayerPdf {
  pdfUrl: string
  resumePage?: number
  identifier?: string
  passThroughData?: any
  disableTelemetry?: boolean
  hideControls?: boolean
  readValuesQueryParamsKey?: {
    zoom: string;
    pageNumber: string;
  }
}
