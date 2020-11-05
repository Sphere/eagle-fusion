import { IQuizQuestionType } from '../interface/quiz-interface'

export const QUESTION_CONFIG = {
  matchOptionsConfig: {
    colNameMinLength: 1,
    colNameMaxLength: 30,
    minOptions: 3,
    maxOptions: 7,
  },
  fillUpsOptionsConfig: {
    minOptions: 1,
    maxOptions: 7,
  },
  mcqOptionsConfig: {
    minOptions: 2,
    maxOptions: 7,
  },
  minMaxQuesConfig: {
    minQues: 1,
  },
}

export const QUIZCONFIG: { [key: string]: string } = {
  mtf: 'matchOptionsConfig',
  fitb: 'fillUpsOptionsConfig',
  'mcq-sca': 'mcqOptionsConfig',
  'mcq-mca': 'mcqOptionsConfig',
  ques: 'minMaxQuesConfig',
}

export const QUIZ_QUESTION_TYPE: IQuizQuestionType = {
  fillInTheBlanks: 'fitb',
  matchTheFollowing: 'mtf',
  multipleChoiceQuestionSingleCorrectAnswer: 'mcq-sca',
  multipleChoiceQuestionMultipleCorrectAnswer: 'mcq-mca',
}

export const NOTIFICATION_TIME = 5
export const QUIZ_JSON = 'quiz.json'
export const ASSESSMENT_JSON_WITHOUT_KEY = 'assessment.json'
export const ASSESSMENT_JSON_WITH_KEY = 'assessment-key.json'
export const ASSESSMENT = 'Assessment'
