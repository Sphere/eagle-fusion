import { NsContent } from '../../_services/widget-content.model'

export interface IFeedbackSearchQuery {
  query: string
  filters: { [key: string]: string[] | boolean[] }
  viewedBy: string
  all: boolean
  from: number
  size: number
}

export interface IFeedback {
  category?: string
  contentId?: string
  role: EFeedbackRole
  rootFeedbackId?: string
  sentiment?: 'positive' | 'negative'
  text: string
  type: EFeedbackType
}

export interface IFeedbackSearchResult {
  hits: number
  result: IFeedbackThread[]
}

export interface IFeedbackThread {
  assignedTo: {
    email: string
    name: string
    uuid: string
  }
  category: string | string[]
  contentDesc: string
  contentId: string
  contentTitle: string
  contentType: NsContent.EContentTypes
  createdOn: Date
  dimension: string
  feedbackBy: {
    email: string
    name: string
    userId: string
  }
  feedbackCategory: string
  feedbackId: string
  feedbackSentimentCategory: 'positive' | 'negative'
  feedbackSentimentValue: number
  feedbackText: string
  feedbackType: EFeedbackType
  lastActivityOn: Date
  lastUpdatedOn: Date
  replied: boolean
  rootFeedbackId: string
  rootOrg: string
  seenReply: boolean
}

export interface IFeedbackFilterDialogData {
  filterObj: IFeedbackFilterObj
  viewedBy: EFeedbackRole
  feedbackSummary: IFeedbackSummary
}

export interface IFeedbackFilterObj {
  contentType?: string[]
  feedbackType?: EFeedbackType[]
  showLimited: boolean
}

export interface IFeedbackSnackbarData {
  action: TFeedbackAction
  code: 'success' | 'failure'
}

export interface IFeedbackSummary {
  forActionCount: number
  roles: IFeedbackRole[]
  totalCount: number
}

export interface IFeedbackRole {
  enabled: boolean
  forActionCount: number
  hasAccess: boolean
  role: EFeedbackRole
  totalCount: number
}

export interface IFeedbackConfig {
  feedbackCategories: string[]
  feedbackSentimentMode: boolean
}

export enum EFeedbackType {
  Content = 'content_feedback',
  Platform = 'platform_feedback',
  ContentRequest = 'content_request',
  ServiceRequest = 'service_request',
}

export enum EFeedbackRole {
  User = 'user',
  Author = 'author',
  Platform = 'platform-feedback-admin',
  Service = 'service-request-admin',
  Content = 'content-request-admin',
}

export type TFeedbackAction =
  | 'content_feedback_submit'
  | 'platform_feedback_submit'
  | 'content_request_submit'
  | 'service_request_submit'

export interface INotificationRequest {
  'event-id': 'platform_feedback'
  'tag-value-pair': ITagValuePair
  recipients: IRecipients
}

interface IRecipients {
  learner: string[]
}

interface ITagValuePair {
  '#feedback': string
}
