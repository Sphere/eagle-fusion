import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { NSQuiz } from './quiz.model'
import { BehaviorSubject, Observable } from 'rxjs'
import get from 'lodash/get'
import filter from 'lodash/filter'
import toLower from 'lodash/toLower'
import { IndexedDBService } from 'src/app/online-indexed-db.service'
import { ConfigurationsService } from '@ws-widget/utils'

const API_END_POINTS = {
  // ASSESSMENT_SUBMIT_V2: `/apis/protected/v8/user/evaluate/assessment/submit/v2`,
  ASSESSMENT_SUBMIT_V2: `/apis/protected/v8/assessment/submit/v2`,
  UPDATE_PASSBOOK: `/apis/proxies/v8/user/v1/passbook`,
  COMPETENCY_ASSESSMENT_SUBMIT_V2: 'apis/protected/v8/assessmentCompetency/v1/assessment/submit',
}

@Injectable({
  providedIn: 'root',
})

export class QuizService {
  questionState: any
  public updateMtf = new BehaviorSubject<any>(undefined)
  public updateMtf$ = this.updateMtf.asObservable()
  constructor(
    private http: HttpClient,
    private configservice: ConfigurationsService,
    private onlineIndexedDbService: IndexedDBService
  ) {

  }
  submitQuizV2(req: any): Observable<NSQuiz.IQuizSubmitResponse> {
    console.log(req, 'req')
    this.onlineIndexedDbService.getRecordFromTable('userEnrollCourse', req.userId, req.courseId).subscribe((record) => {
      console.log(record, '36')

      let cUrl = window.location.href
      console.log(cUrl.split('/'))
      let id = cUrl.split('/')[5]
      console.log(id)
      this.onlineIndexedDbService.deleteRecordByKey('userEnrollCourse', req.courseId).subscribe(
        (message: any) => { // 'next' callback
          console.log('Record deleted successfully', message)

          this.onlineIndexedDbService.insertProgressData(this.configservice.userProfile!.userId, req.courseId, req.contentId, 'userEnrollCourse', window.location.href, req).subscribe(
            async (dat: any) => {
              console.log('Data inserted successfully2', dat)
              let msg = await dat
              if (msg) {
              }
            },
            (error: any) => { // 'error' callback for insertProgressData
              console.error('Error inserting progress data:', error)
            }
          )
        },
        (error: any) => { // 'error' callback for deleteRecordByKey
          console.error('Error deleting record:', error)
        }
      )
    }, (error) => {
      console.log(error, '63')
      this.onlineIndexedDbService.insertProgressData(this.configservice.userProfile!.userId, req.courseId, req.contentId, 'userEnrollCourse', window.location.href, req).subscribe(
        (dat: any) => {
          console.log('Data inserted successfully1', dat)

        })
    })

    return this.http.post<NSQuiz.IQuizSubmitResponse>(API_END_POINTS.ASSESSMENT_SUBMIT_V2, req)
  }
  competencySubmitQuizV2(req: NSQuiz.IQuizSubmitRequest): Observable<NSQuiz.IQuizSubmitResponse> {
    let url = ''
    if (window.location.origin.indexOf('http://localhost:') === -1) {
      url = `${window['env']['azureHost']}/${API_END_POINTS.COMPETENCY_ASSESSMENT_SUBMIT_V2}`
    } else {
      url = `${API_END_POINTS.COMPETENCY_ASSESSMENT_SUBMIT_V2}`
    }
    // console.log(url)
    return this.http.post<NSQuiz.IQuizSubmitResponse>(url, req)
  }

  updatePassbook(passbookBody: any) {
    return this.http.patch(`${API_END_POINTS.UPDATE_PASSBOOK}`, passbookBody)
  }
  createAssessmentSubmitRequest(
    identifier: string,
    title: string,
    quiz: NSQuiz.IQuiz,
    questionAnswerHash: { [questionId: string]: any[] },
  ): NSQuiz.IQuizSubmitRequest {
    const quizWithAnswers = {
      ...quiz,
      identifier,
      title,
    }
    quizWithAnswers.questions.map(question => {
      if (
        question.questionType === undefined ||
        question.questionType === 'mcq-mca' ||
        question.questionType === 'mcq-sca'
      ) {
        return question.options.map(option => {
          if (questionAnswerHash[question.questionId]) {
            option.userSelected = questionAnswerHash[question.questionId].includes(option.optionId)
          } else {
            option.userSelected = false
          }
          return option
        })
      } if (question.questionType === 'fitb') {
        for (let i = 0; i < question.options.length; i += 1) {
          if (questionAnswerHash[question.questionId]) {
            question.options[i].response = questionAnswerHash[question.questionId][0].split(',')[i]
          }
        }
      } else if (question.questionType === 'mtf') {
        question.options = questionAnswerHash[question.questionId]
      }
      return question
    })
    return quizWithAnswers
  }

  /* check each question is it correct or wrong */
  checkAnswer(
    quiz: NSQuiz.IQuiz,
    questionAnswerHash: any,
  ) {
    const userSelectedAnswer: any = quiz.questions[questionAnswerHash['qslideIndex']]
    userSelectedAnswer['isCorrect'] = false
    userSelectedAnswer.options.map((option: any) => {
      if (option.isCorrect) {
        userSelectedAnswer['answer'] = option.text
      }
      if (questionAnswerHash[get(userSelectedAnswer, 'questionId')]) {
        option.userSelected = questionAnswerHash[userSelectedAnswer.questionId].includes(option.optionId)
      } else {
        option.userSelected = false
      }
    })
    if (filter(userSelectedAnswer.options, 'isCorrect')[0].userSelected) {
      userSelectedAnswer['isCorrect'] = true
    }
    userSelectedAnswer['isExplanation'] = false
    if (quiz.questions[questionAnswerHash['qslideIndex']].
      questionType === 'fitb') {
      if (toLower(filter(userSelectedAnswer.options, 'text')[0].text) === questionAnswerHash[userSelectedAnswer.questionId][0]) {
        userSelectedAnswer['isCorrect'] = true
      } else {
        userSelectedAnswer['isCorrect'] = false
      }
    }
    return userSelectedAnswer
  }
  shuffle(array: any[] | (string | undefined)[]) {
    let currentIndex = array.length
    let temporaryValue
    let randomIndex

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex -= 1

      // And swap it with the current element.
      temporaryValue = array[currentIndex]
      array[currentIndex] = array[randomIndex]
      array[randomIndex] = temporaryValue
    }
    return array
  }
  checkMtfAnswer(quiz: NSQuiz.IQuiz, questionAnswerHash: any) {
    const userSelectedAnswer: any = quiz.questions[questionAnswerHash['qslideIndex']]
    for (let i = 0; i < quiz.questions[questionAnswerHash['qslideIndex']].options.length; i += 1) {
      // tslint:disable-next-line: max-line-length
      if (questionAnswerHash[quiz.questions[questionAnswerHash['qslideIndex']].questionId] && questionAnswerHash[quiz.questions[questionAnswerHash['qslideIndex']].questionId][0][i]) {
        for (let j = 0; j < questionAnswerHash[quiz.questions[questionAnswerHash['qslideIndex']].questionId][0].length; j += 1) {
          // tslint:disable-next-line: max-line-length
          if (quiz.questions[questionAnswerHash['qslideIndex']].options[i].text.trim() === questionAnswerHash[quiz.questions[questionAnswerHash['qslideIndex']].questionId][0][j].source.innerText.trim()) {
            // tslint:disable-next-line: max-line-length
            quiz.questions[questionAnswerHash['qslideIndex']].options[i].response = questionAnswerHash[quiz.questions[questionAnswerHash['qslideIndex']].questionId][0][j].target.innerText
          }
        }
      } else {
        quiz.questions[questionAnswerHash['qslideIndex']].options[i].response = ''
      }
    }
    const matchHintDisplay: any = []
    quiz.questions[questionAnswerHash['qslideIndex']].options.map(option => (option.matchForView = option.match))
    const array = quiz.questions[questionAnswerHash['qslideIndex']].options.map(elem => elem.match)
    const arr = this.shuffle(array)
    for (let i = 0; i < quiz.questions[questionAnswerHash['qslideIndex']].options.length; i += 1) {
      quiz.questions[questionAnswerHash['qslideIndex']].options[i].matchForView = arr[i]
    }
    const matchHintDisplayLocal = [...quiz.questions[questionAnswerHash['qslideIndex']].options]
    matchHintDisplayLocal.forEach(element => {

      matchHintDisplay.push(element)

    })
    userSelectedAnswer['answer'] = matchHintDisplay
    userSelectedAnswer['isExplanation'] = true
    return userSelectedAnswer
  }
  sanitizeAssessmentSubmitRequest(requestData: NSQuiz.IQuizSubmitRequest): NSQuiz.IQuizSubmitRequest {
    requestData.questions.map(question => {
      question.question = ''
      question.options.map(option => {
        option.hint = ''
        option.text = question.questionType === 'fitb' || question.questionType === 'mtf' ? option.text : ''
      })
    })
    return requestData
  }

}
