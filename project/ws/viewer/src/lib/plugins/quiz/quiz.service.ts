import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { NSQuiz } from './quiz.model'
import { BehaviorSubject, Observable } from 'rxjs'
import { get, filter, toLower } from 'lodash'
import { IndexedDBService } from 'src/app/services/online-indexed-db.service'
import { ConfigurationsService, LoggerService } from '@ws-widget/utils'
import { API_END_POINTS } from '../../../../../../../src/app/constants/apiConstants'


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
    private onlineIndexedDbService: IndexedDBService,
    private logger: LoggerService
  ) {

  }
  submitQuizV2(req: any): Observable<NSQuiz.IQuizSubmitResponse> {
    this.logger.log(req, 'req')
    this.onlineIndexedDbService.getRecordFromTable('userEnrollCourse', req.userId, req.courseId).subscribe(record => {
      this.logger.log(record, '36')

      const cUrl = window.location.href
      this.logger.log(cUrl.split('/'))
      const id = cUrl.split('/')[5]
      this.logger.log(id)
      this.onlineIndexedDbService.deleteRecordByKey('userEnrollCourse', req.courseId).subscribe(
        (message: any) => { // 'next' callback
          this.logger.log('Record deleted successfully', message)

          this.onlineIndexedDbService.insertProgressData(this.configservice.userProfile!.userId, req.courseId, req.contentId, 'userEnrollCourse', window.location.href, req).subscribe(
            async (dat: any) => {
              this.logger.log('Data inserted successfully2', dat)
              const msg = await dat
              if (msg) {
              }
            },
            (error: any) => { // 'error' callback for insertProgressData
              this.logger.error('Error inserting progress data:', error)
            }
          )
        },
        (error: any) => { // 'error' callback for deleteRecordByKey
          this.logger.error('Error deleting record:', error)
        }
      )
    }, error => {
      this.logger.log(error, '63')
      this.onlineIndexedDbService.insertProgressData(this.configservice.userProfile!.userId, req.courseId, req.contentId, 'userEnrollCourse', window.location.href, req).subscribe(
        (dat: any) => {
          this.logger.log('Data inserted successfully1', dat)

        })
    })

    return this.http.post<NSQuiz.IQuizSubmitResponse>(API_END_POINTS.ASSESSMENT_SUBMIT_V2, req)
  }
  competencySubmitQuizV2(req: NSQuiz.IQuizSubmitRequest): Observable<NSQuiz.IQuizSubmitResponse> {
    return this.http.post<NSQuiz.IQuizSubmitResponse>(API_END_POINTS.COMPETENCY_ASSESSMENT_SUBMIT_V2, req)
  }

  updatePassbook(passbookBody: any) {
    return this.http.patch(`${API_END_POINTS.UPDATE_PASSBOOK}`, passbookBody)
  }

  // ASHA-home extra flow: record a self-assessment attempt against the learner path.
  updateAshaAssessment(req: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.UPDATE_ASHA_PROGRESS, req)
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
    // The hash entry is `[jsPlumb connections[]]` on first answer, but callers overwrite it with
    // `userAnswer.answer` (a flat array of option objects) after this runs — so `[0]` is not
    // always an array.
    const stored = questionAnswerHash[userSelectedAnswer.questionId]
    const first = Array.isArray(stored) ? stored[0] : undefined
    // Already resolved by an earlier call (e.g. Next pressed again while `qslideIndex` still points
    // here). Re-resolving would find no connections and wipe every `response`, so keep it as is.
    if (Array.isArray(stored) && stored.length && !Array.isArray(first)) {
      userSelectedAnswer['answer'] = stored
      userSelectedAnswer['isExplanation'] = true
      return userSelectedAnswer
    }
    const connections: any[] = Array.isArray(first) ? first : []
    // Resolve each option to the box the learner actually connected it to, for the Response
    // column of the review table. Two bugs used to leave this permanently blank:
    //
    // 1. The guard tested `connections[i]`, indexing the connection list by option position,
    //    so when fewer pairs were connected than there are options every row past that count
    //    was blanked even if it had been answered.
    // 2. It compared `source.innerText` against `option.text` directly. innerText returns the
    //    *rendered* text, and CSS collapses runs of whitespace — option text in the authored
    //    content frequently contains double spaces, so the two never matched.
    const normalize = (value: string) => (value || '').replace(/\s+/g, ' ').trim()
    userSelectedAnswer.options.forEach((option: any) => {
      const connection = connections.find(
        (item: any) => item && item.source && normalize(item.source.innerText) === normalize(option.text)
      )
      option.response = connection ? connection.target.innerText : ''
    })
    const matchHintDisplay: any = []
    quiz.questions[questionAnswerHash['qslideIndex']].options.map(option => (option.matchForView = option.match))
    const array = quiz.questions[questionAnswerHash['qslideIndex']].options.map(elem => elem.match)
    const arr = this.shuffle(array)
    for (let i = 0; i < quiz.questions[questionAnswerHash['qslideIndex']].options.length; i += 1) {
      quiz.questions[questionAnswerHash['qslideIndex']].options[i].matchForView = arr[i]
    }
    const matchHintDisplayLocal = [...quiz.questions[questionAnswerHash['qslideIndex']].options]
    matchHintDisplayLocal.forEach(element => {
      element.text = normalize(element.text)
      element.matchForView = normalize(element.matchForView)
      element.match = normalize(element.match)
      element.response = normalize(element.response)
      // A pair is correct only when the learner connected something and it equals the expected match
      element.isCorrect = !!element.response && toLower(element.response) === toLower(element.match)
      matchHintDisplay.push(element)
    })
    userSelectedAnswer['answer'] = matchHintDisplay
    userSelectedAnswer['isExplanation'] = true
    return userSelectedAnswer
  }
  sanitizeAssessmentSubmitRequest(requestData: NSQuiz.IQuizSubmitRequest): NSQuiz.IQuizSubmitRequest {
    requestData.questions = requestData.questions
      ?.filter(question => question.options !== undefined) // remove questions without options
      .map(question => {
        question.question = ''
        question.options?.forEach(option => {
          option.hint = ''
          option.text = (question.questionType === 'fitb' || question.questionType === 'mtf')
            ? option.text
            : ''
        })
        return question
      })
    return requestData
  }

}
