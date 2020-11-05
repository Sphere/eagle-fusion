export namespace NsFeedback {
  export interface IWsFeedbackTypeRequest {
    contentId: string | null
    feedbackSubType: string | null
    rating?: number | string
    feedback: IWsFeedback[]
    feedbackType: string
  }
  export interface IWsFeedback {
    question: string
    meta: string
    answer: string
  }
}
