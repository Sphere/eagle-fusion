export interface IWsFeedbackRequest {
  application: IWsFeedbackTypeRequest
  applicationcontent: IWsFeedbackTypeRequest
  bug: IWsFeedbackTypeRequest
}

export interface IWsFeedbackTypeRequest {
  contentId: string | null
  feedbackSubType: string | null
  rating?: string
  feedback: IWsFeedback[]
  feedbackType: string
}

export interface IWsFeedback {
  question: string
  meta: string
  answer: string
}
