export namespace NSQuiz {
  export interface IQuiz {
    timeLimit: number
    questions: IQuestion[]
    isAssessment: boolean
  }

  export interface IQuestion {
    multiSelection: boolean
    question: string
    questionId: string
    options: IOption[]
    questionType?: TQuizQuestionType
  }

  export interface IOption {
    optionId: string
    text: string
    isCorrect: boolean
    hint?: string
    match?: string
    matchForView?: string
    response?: any
    userSelected?: boolean
  }

  export interface IQuizConfig {
    enableHint: boolean
    maxAttempts: number
  }

  export type TQuizQuestionType = 'mcq-sca' | 'mcq-mca' | 'fitb' | 'mtf'
  export type TUserSelectionType = 'start' | 'skip'
  export type TQuizSubmissionState = 'unanswered' | 'marked' | 'answered'
  export type TQuizViewMode = 'initial' | 'attempt' | 'review' | 'answer'

  export interface IQuizSubmitRequest {
    identifier: string
    isAssessment: boolean
    questions: IQuestion[]
    timeLimit: number
    title: string
  }

  export interface IQuizSubmitResponse {
    blank: number
    correct: number
    inCorrect: number
    passPercent: number
    result: number
    total: number
  }

}
