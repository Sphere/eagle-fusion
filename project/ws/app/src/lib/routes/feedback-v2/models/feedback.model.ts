export interface IFeedbackSearchRequest {
  query?: string
  filters?: { [key: string]: string[] }
  author: boolean
}

export interface IFeedback {
  category?: string
  contentId?: string
  rootFeedbackId?: string
  sentiment?: 'positive' | 'negative'
  text: string
  type: EFeedbackType
}

export enum EFeedbackType {
  Content = 'content_feedback',
  Platform = 'platform_feedback',
  ContentRequest = 'content_request',
  ServiceRequest = 'service_request',
}
