import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { Option, FillUps, MatchQuiz, MatchOption, McqQuiz } from '../components/quiz-class'
import { QUESTION_CONFIG, QUIZCONFIG } from '../constants/quiz-constants'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'

@Injectable()
export class QuizStoreService {

  selectedQuizIndex = new BehaviorSubject<number>(0)
  currentQuizIndex = 0
  collectiveQuiz: { [key: string]: any[] } = {}
  validationDoneStatus = false
  questionConfig: any
  resourceType = 'Quiz'
  currentId = ''
  errorLog: { [key: number]: { [key: string]: string } } = {}
  hasChanged = false

  constructor() { }

  changeQuiz(index: number) {
    this.currentQuizIndex = index
    this.selectedQuizIndex.next(index)
  }

  updateQuiz(index: number, quizObj: any) {
    this.hasChanged = true
    this.collectiveQuiz[this.currentId][index] = quizObj
  }

  getQuiz(index: number) {
    return this.collectiveQuiz[this.currentId][index] ? JSON.parse(JSON.stringify(this.collectiveQuiz[this.currentId][index])) : null
  }

  getQuizConfig(questionType: string) {
    if (!this.questionConfig) {
      // this.questionConfig  =  this.http.get().catch(err=>'some error happened')
      this.questionConfig = QUESTION_CONFIG
    }
    return this.questionConfig[QUIZCONFIG[questionType]]
  }

  addQuestion(questionType: string) {
    let ques
    const config = this.getQuizConfig(questionType)
    switch (questionType) {
      case 'fitb':
        ques = new FillUps({ questionType })
        ques.options = Array(config.minOptions).fill(new Option({ isCorrect: true }))
        break
      case 'mtf':
        ques = new MatchQuiz({ questionType })
        ques.options = Array(config.minOptions).fill(new MatchOption({ isCorrect: true }))
        break
      default:
        ques = new McqQuiz({ questionType })
        ques.options = Array(config.minOptions).fill(new Option({ isCorrect: false }))
        break
    }
    this.collectiveQuiz[this.currentId].push(ques)
    this.changeQuiz(this.collectiveQuiz[this.currentId].length - 1)
    this.hasChanged = true
  }

  removeQuestion(index: number) {
    const dataArr = this.collectiveQuiz[this.currentId]
    dataArr.splice(index, 1)
    let i = this.currentQuizIndex
    if (this.currentQuizIndex === index) {
      i = index ? (index >= dataArr.length ? index - 1 : index) : index
      this.changeQuiz(i)
    } else if (this.currentQuizIndex > dataArr.length && this.currentQuizIndex > index || this.currentQuizIndex === (dataArr.length)) {
      i = this.currentQuizIndex - 1
      this.changeQuiz(i)
    }
    this.hasChanged = true
  }

  generateOptionId(questionId: string, lastNum: number): string {
    return `${questionId}-${String.fromCharCode(97 + lastNum)}`
  }

  generateQuestionId(lastNum: number): string {
    return `${this.resourceType.slice(0, 1)}1${(lastNum < 10 ? `0${lastNum}` : lastNum)}`
  }

  // 1:{}
  updateErrorlog(errorData: any) {
    if (errorData.type) {
      if (!this.errorLog[errorData.quizNumber] && errorData.message) {
        this.errorLog[errorData.quizNumber] = {}
      }
      if (this.errorLog[errorData.quizNumber]) {
        this.errorLog[errorData.quizNumber][errorData.type] = errorData.message
      }
    }
  }

  validateQuiz(quizIndex: number) {
    const quizObj = this.collectiveQuiz[this.currentId][quizIndex]
    let errMessage = ''
    let errType = ''
    let errMessageForLog = ''
    quizObj.questionId = this.generateQuestionId(quizIndex)
    if (quizObj.question === '' || quizObj.question.trim().length === 0) {
      errMessageForLog = (quizObj.question && quizObj.question.trim().length === 0) ? Notify.QUESTION_SPACES_ALONE :
        Notify.QUESTION_EMPTY
      errMessage = errMessageForLog
    } else {
      errMessageForLog = ''
    }
    this.updateErrorlog({
      type: 'question',
      quizNumber: quizIndex,
      message: errMessageForLog,
    })
    if (quizObj.questionType === 'fitb') {
      errType = 'question'
      if (!quizObj.question.match(/<input/g) || quizObj.question.match(/<input/g).length !== quizObj.options.length) {
        errMessageForLog = Notify.FILLUPS_BLANKS_OPTIONS
        if (!errMessage) {
          errMessage = errMessageForLog
        }
      } else {
        errMessageForLog = ''
      }
      this.updateErrorlog({
        type: errType,
        quizNumber: quizIndex,
        message: errMessageForLog,
      })
    }
    let correctAnswersCount = 0
    for (let ctr = 0; ctr < quizObj.options.length; ctr = ctr + 1) {
      const quesOpt = quizObj.options[ctr]
      const generalCondition = quesOpt.text === '' || quesOpt.text.trim().length === 0
      const condition = quizObj.questionType === 'mtf' ?
        (generalCondition && quesOpt.match === '' || quesOpt.match.trim().length === 0) : generalCondition
      if (condition) {
        const checkForNotEmpty = quizObj.questionType === 'mtf' ? (quesOpt.text.length || quesOpt.match.length) : quesOpt.text.length
        errMessageForLog = checkForNotEmpty ? Notify.OPTION_SPACES_ALONE :
          Notify.OPTION_EMPTY
        if (!errMessage) {
          errMessage = errMessageForLog
        }
      } else {
        errMessageForLog = ''
      }
      if (quesOpt.isCorrect) {
        correctAnswersCount = correctAnswersCount + 1
      }
      if (!errMessage) {
        quizObj.options[ctr].optionId = this.generateOptionId(quizObj.questionId, ctr)
      }
      errType = String(ctr)
      this.updateErrorlog({
        type: errType,
        quizNumber: quizIndex,
        message: errMessageForLog,
      })
    }
    // all options would have got validated
    errMessageForLog = ''
    if (correctAnswersCount === 0 && (quizObj.questionType === 'mcq-sca' || quizObj.questionType === 'mcq-mca')) {
      errMessageForLog = Notify.MCQ_NO_OPTION_CORRECT
      if (!errMessage) {
        errMessage = errMessageForLog
      }
    }
    if (correctAnswersCount === (quizObj.options.length) && (quizObj.questionType === 'mcq-sca' || quizObj.questionType === 'mcq-mca')) {
      errMessageForLog = Notify.MCQ_ALL_OPTIONS_CORRECT
      if (!errMessage) {
        errMessage = errMessageForLog
      }
    }
    this.updateErrorlog({
      type: 'options',
      quizNumber: quizIndex,
      message: errMessageForLog,
    })
    if (quizObj.questionType === 'mcq-sca' && correctAnswersCount > 1) {
      quizObj.questionType = 'mcq-mca'
      quizObj.multiSelection = true
    }
    if (errMessage) {
      quizObj.isInValid = true
    } else {
      quizObj.isInValid = false
    }
    return errMessage

  }

}
