import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { NSQuiz } from './quiz.model'
import { BehaviorSubject, Observable } from 'rxjs'
import * as _ from 'lodash'
const API_END_POINTS = {
  // ASSESSMENT_SUBMIT_V2: `/apis/protected/v8/user/evaluate/assessment/submit/v2`,
  ASSESSMENT_SUBMIT_V2: `/apis/protected/v8/assessment/submit/v2`,
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
  ) {

  }
  submitQuizV2(req: NSQuiz.IQuizSubmitRequest): Observable<NSQuiz.IQuizSubmitResponse> {
    return this.http.post<NSQuiz.IQuizSubmitResponse>(API_END_POINTS.ASSESSMENT_SUBMIT_V2, req)
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
        for (let i = 0; i < question.options.length; i += 1) {
          if (questionAnswerHash[question.questionId] && questionAnswerHash[question.questionId][0][i]) {
            for (let j = 0; j < questionAnswerHash[question.questionId][0].length; j += 1) {
              if (question.options[i].text.trim() === questionAnswerHash[question.questionId][0][j].source.innerText.trim()) {
                question.options[i].response = questionAnswerHash[question.questionId][0][j].target.innerText
              }
            }
          } else {
            question.options[i].response = ''
          }
        }
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
    const userSelectedAnswer = quiz.questions[questionAnswerHash['qslideIndex']]
    userSelectedAnswer['isCorrect'] = false
    userSelectedAnswer.options.map(option => {
      if (option.isCorrect) {
        userSelectedAnswer['answer'] = option.text
      }
      if (questionAnswerHash[_.get(userSelectedAnswer, 'questionId')]) {
        option.userSelected = questionAnswerHash[userSelectedAnswer.questionId].includes(option.optionId)
      } else {
        option.userSelected = false
      }
    })
    if (_.filter(userSelectedAnswer.options, 'isCorrect')[0].userSelected) {
      userSelectedAnswer['isCorrect'] = true
    }
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
