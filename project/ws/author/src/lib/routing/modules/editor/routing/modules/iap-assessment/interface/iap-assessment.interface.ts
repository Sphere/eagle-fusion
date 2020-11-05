export interface ISectionDetailsContent {
  _id: string
  sectionName: string
  sectionDescription: string
  numberOfQuestionsAdded: number
  showOptions: boolean
  objectiveQuestionsList: string[]
  objectiveQuestionsData: IQuestionDetailsContent[]
  groupList: any[]
}
export interface IQuestionDetailsContent {
  option1: string
  option2: string
  option3?: string
  option4?: string
  option5?: string
  option6?: string
  tags?: string[]
  topic?: string
  title: string
  flag: string
  creatorId: string
  accuracy: number
  isPrivate: string
  type: string
  maxMarks: number
  totalSubmissions: number
  archived: string
  solution: string
  problemStatement: string
  difficultyValue: number
  shareList: any
  difficulty: string
  timeStamp: any
  correctSubmissions: number
  questionType: string
  _id: string
  ownership: string
  contestAdded: boolean
  loader: boolean
}
export interface IResponseQuestion {
  data: IQuestionDetailsContent[]
  totalCount: number
  page: number
}
export interface IAssessmentDetails {
  _id: string
  assessmentInstruction: string
  sectionList: string[]
  videoProctoring: boolean
  viewMarks: boolean
  objNegMarksEnable: string
  proctor: string
  reviewAttempt: boolean
  objNegMarks: number
  passPercentage: number
  instructions: string
}
export interface IQuestionDetail {
  myQuestion: string
  searchStatus: boolean
  sortBy: string
  tagsList: string[]
  topicList: string[]
  searchQuery: string

}
