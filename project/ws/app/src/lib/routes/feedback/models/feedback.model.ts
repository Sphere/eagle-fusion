export interface IFeedbackRequest {
  application: IFeedbackTypeRequest
  applicationcontent: IFeedbackTypeRequest
  bug: IFeedbackTypeRequest
}

export interface IFeedbackTypeRequest {
  contentId: string | null
  feedbackSubType: string | null
  rating?: string
  feedback: IFeedback[]
  feedbackType: string
}

export interface IFeedback {
  question: string
  meta: string
  answer: string
}
