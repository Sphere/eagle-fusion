import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core'
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material'
import { ActivatedRoute } from '@angular/router'
import { interval, Subscription } from 'rxjs'
import { map } from 'rxjs/operators'
import { FetchStatus } from '../../quiz.component'
import { NSQuiz } from '../../quiz.model'
import { QuizService } from '../../quiz.service'
declare var $: any
import { ValueService } from '@ws-widget/utils'
import * as _ from 'lodash'
@Component({
  selector: 'viewer-assesment-modal',
  templateUrl: './assesment-modal.component.html',
  styleUrls: ['./assesment-modal.component.scss'],
  // tslint:disable-next-line:use-component-view-encapsulation
  encapsulation: ViewEncapsulation.None,
})
export class AssesmentModalComponent implements OnInit, AfterViewInit, OnDestroy {
  isXSmall$ = this.valueSvc.isXSmall$
  timeLeft = 0
  startTime = 0
  tabIndex = 0
  isIdeal = false
  totalQuestion = 0
  activeIndex = 0
  numCorrectAnswers = 0
  numIncorrectAnswers = 0
  numUnanswered = 0
  passPercentage = 0
  result = 0
  progressbarValue = 0
  isCompleted = false
  fetchingResultsStatus: FetchStatus = 'none'
  questionAnswerHash: any = {}
  timerSubscription: Subscription | null = null
  dialog: any
  tabActive = false
  disableNext = false
  diablePrevious = true
  assesmentActive = true
  constructor(
    public dialogRef: MatDialogRef<AssesmentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public assesmentdata: any,
    public quizService: QuizService,
    public route: ActivatedRoute,
    private valueSvc: ValueService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.timeLeft = this.assesmentdata.questions.timeLimit
    this.startTime = Date.now()
    this.timer(this.timeLeft)
    this.questionAnswerHash = {}
    this.totalQuestion = Object.keys(this.assesmentdata.questions.questions).length
    // this.progressbarValue = this.totalQuestion
  }
  ngAfterViewInit() {
    if (this.assesmentdata.questions.questions[0].questionType === 'mtf') {
      this.updateQuestionType(true)
    }
  }
  closePopup() {
    this.dialogRef.close({ event: 'CLOSE' })
    // if (this.tabActive) {
    //   this.dialogRef.close({ event: 'DONE' })
    // }
  }

  closeDone() {
    this.dialogRef.close({ event: 'DONE' })
  }

  retakeQuiz() {
    this.dialogRef.close({ event: 'RETAKE_QUIZ' })
  }

  timer(data: any) {
    if (data > -1) {
      this.timerSubscription = interval(100)
        .pipe(
          map(
            () =>
              this.startTime + this.assesmentdata.questions.timeLimit - Date.now(),
          ),
        )
        .subscribe(_timeRemaining => {
          this.timeLeft -= 0.1
          if (this.timeLeft < 0) {
            this.isIdeal = true
            this.timeLeft = 0
            if (this.timerSubscription) {
              this.timerSubscription.unsubscribe()
            }
            this.tabIndex = 1
            this.tabActive = true
            this.assesmentActive = false
          }
        })
    }
  }

  fillSelectedItems(question: NSQuiz.IQuestion, optionId: string, qindex: number) {
    if (
      this.questionAnswerHash[question.questionId] &&
      question.multiSelection
    ) {
      const questionIndex = this.questionAnswerHash[question.questionId].indexOf(optionId)
      if (questionIndex === -1) {
        this.questionAnswerHash[question.questionId].push(optionId)
      } else {
        this.questionAnswerHash[question.questionId].splice(questionIndex, 1)
      }
      if (!this.questionAnswerHash[question.questionId].length) {
        delete this.questionAnswerHash[question.questionId]
      }
    } else {
      this.questionAnswerHash[question.questionId] = [optionId]
    }
    this.questionAnswerHash['qslideIndex'] = qindex
  }

  proceedToSubmit() {
    this.submitQuiz()
  }

  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }

  submitQuiz() {
    this.ngOnDestroy()
    const submitQuizJson = JSON.parse(JSON.stringify(this.assesmentdata.questions))
    this.fetchingResultsStatus = 'fetching'
    const requestData: NSQuiz.IQuizSubmitRequest = this.quizService.createAssessmentSubmitRequest(
      this.assesmentdata.generalData.identifier,
      this.assesmentdata.generalData.name,
      {
        ...submitQuizJson,
        timeLimit: this.assesmentdata.questions.timeLimit * 1000,
      },
      this.questionAnswerHash,
    )
    const sanitizedRequestData: NSQuiz.IQuizSubmitRequest = this.quizService.sanitizeAssessmentSubmitRequest(requestData)
    sanitizedRequestData['artifactUrl'] = this.assesmentdata.generalData.artifactUrl
    sanitizedRequestData['contentId'] = this.assesmentdata.generalData.identifier
    sanitizedRequestData['courseId'] = this.assesmentdata.generalData.collectionId
    sanitizedRequestData['batchId'] = this.route.snapshot.queryParams.batchId
    sanitizedRequestData['userId'] = localStorage.getItem('userUUID')
    this.quizService.submitQuizV2(sanitizedRequestData).subscribe(
      (res: NSQuiz.IQuizSubmitResponse) => {
        window.scrollTo(0, 0)
        if (this.assesmentdata.questions.isAssessment) {
          this.isIdeal = true
        }
        this.fetchingResultsStatus = 'done'
        this.numCorrectAnswers = res.correct
        this.numIncorrectAnswers = res.inCorrect
        this.numUnanswered = res.blank
        /* tslint:disable-next-line:max-line-length */
        this.passPercentage = this.assesmentdata.generalData.collectionId === 'lex_auth_0131241730330624000' ? 70 : res.passPercent // NQOCN Course ID
        this.result = _.round(res.result)
        this.tabIndex = 1
        this.tabActive = true
        this.assesmentActive = false
        if (this.result >= this.passPercentage) {
          this.isCompleted = true
        }
      },
      (_error: any) => {
        this.openSnackbar('Something went wrong! Unable to submit.')
        this.fetchingResultsStatus = 'error'
      },
    )

  }

  calculateResults() {
    const correctAnswers = this.assesmentdata.questions.map(
      (question: NSQuiz.IQuestion) => {
        return {
          questionType: question.questionType,
          questionId: question.questionId,
          correctOptions: question.options
            .filter(option => option.isCorrect)
            .map(option =>
              question.questionType === 'fitb' ? option.text : option.optionId,
            ),
          correctMtfOptions: question.options
            .filter(option => option.isCorrect)
            .map(option =>
              question.questionType === 'mtf' ? option : undefined,
            ),
        }
      },
    )
    this.numCorrectAnswers = 0
    this.numIncorrectAnswers = 0
    correctAnswers.forEach((answer: any) => {
      const correctOptions = answer.correctOptions
      const correctMtfOptions = answer.correctMtfOptions
      let selectedOptions: any =
        this.questionAnswerHash[answer.questionId] || []
      if (
        answer.questionType === 'fitb' &&
        this.questionAnswerHash[answer.questionId] &&
        this.questionAnswerHash[answer.questionId][0]
      ) {
        selectedOptions =
          this.questionAnswerHash[answer.questionId][0].split(',') || []
        let correctFlag = true
        let unTouched = false
        if (selectedOptions.length < 1) {
          unTouched = true
        }
        if (correctOptions.length !== selectedOptions.length) {
          correctFlag = false
        }
        if (correctFlag && !unTouched) {
          for (let i = 0; i < correctOptions.length; i += 1) {
            if (
              correctOptions[i].trim().toLowerCase() !==
              selectedOptions[i].trim().toLowerCase()
            ) {
              correctFlag = false
            }
          }
        }
        if (correctFlag && !unTouched) {
          this.numCorrectAnswers += 1
        } else if (!unTouched) {
          this.numIncorrectAnswers += 1
        }

      } else if (answer.questionType === 'mtf') {
        let unTouched = false
        let correctFlag = true
        if (selectedOptions.length < 1 || selectedOptions[0].length < 1) {
          unTouched = true
        } else if (selectedOptions[0].length < correctMtfOptions.length) {
          correctFlag = false
        }
        if (selectedOptions && selectedOptions[0]) {
          (selectedOptions[0] as any[]).forEach(element => {
            const b = element.sourceId
            if (correctMtfOptions) {
              const option = correctMtfOptions[(b.slice(-1) as number) - 1] || { match: '' }
              const match = option.match
              if (match && match.trim() === element.target.innerHTML.trim()
              ) {
                element.setPaintStyle({
                  stroke: '#357a38',
                })

              } else {
                element.setPaintStyle({
                  stroke: '#f44336',
                })
                correctFlag = false

              }
            }
          })
        }
        if (correctFlag && !unTouched) {
          this.numCorrectAnswers += 1
        } else if (!unTouched) {
          this.numIncorrectAnswers += 1
        }
      } else {
        if (
          correctOptions.sort().join(',') === selectedOptions.sort().join(',')
        ) {
          this.numCorrectAnswers += 1
        } else if (selectedOptions.length > 0) {
          this.numIncorrectAnswers += 1
        }
      }
    })
    this.numUnanswered =
      this.assesmentdata.questions.length -
      this.numCorrectAnswers -
      this.numIncorrectAnswers
  }

  nextQuestion() {
    // tslint:disable-next-line: max-line-length
    if (this.questionAnswerHash && this.questionAnswerHash['qslideIndex']) {
      if (this.assesmentdata.questions.questions[this.questionAnswerHash['qslideIndex']] &&
        this.assesmentdata.questions.questions[this.questionAnswerHash['qslideIndex']]
          .questionType === 'mtf') {
        const submitQuizJson = JSON.parse(JSON.stringify(this.assesmentdata.questions))
        let userAnswer: any = {}
        userAnswer = this.quizService.checkMtfAnswer(submitQuizJson, this.questionAnswerHash)
        this.questionAnswerHash[userAnswer.questionId] = userAnswer.answer
        this.updateQuestionType(false)
      } else {
        const submitQuizJson = JSON.parse(JSON.stringify(this.assesmentdata.questions))
        const questionAnswerHash: any = {}
        questionAnswerHash['qslideIndex'] = this.quizService.questionState.active_slide_index
        let userAnswer: any = {}
        userAnswer = this.quizService.checkMtfAnswer(submitQuizJson, questionAnswerHash)
        this.questionAnswerHash[userAnswer.questionId] = userAnswer.answer
      }
    } else if (this.assesmentdata.questions.questions[this.quizService.questionState.active_slide_index] &&
      this.assesmentdata.questions.questions[this.quizService.questionState.active_slide_index]
        .questionType === 'mtf') {
      const submitQuizJson = JSON.parse(JSON.stringify(this.assesmentdata.questions))
      const questionAnswerHash: any = {}
      questionAnswerHash['qslideIndex'] = this.quizService.questionState.active_slide_index
      let userAnswer: any = {}
      userAnswer = this.quizService.checkMtfAnswer(submitQuizJson, questionAnswerHash)
      this.questionAnswerHash[userAnswer.questionId] = userAnswer.answer
    }

    this.disableNext = true
    this.progressbarValue += 100 / this.totalQuestion
    if (
      this.quizService.questionState.active_slide_index
      === (this.quizService.questionState.slides.length - 1)) {
      this.disableNext = true
      this.proceedToSubmit()

      return
    }
    const oldSlide = this.quizService.questionState.slides[this.quizService.questionState.active_slide_index]
    $(oldSlide).fadeOut('fast', () => {
      $(oldSlide).hide()

      for (let i = 0; i < this.quizService.questionState.slides.length; i += 1) {
        const slide = this.quizService.questionState.slides[i]
        $(slide).hide()
      }
      this.quizService.questionState.active_slide_index += 1
      const newSlide = this.quizService.questionState.slides[this.quizService.questionState.active_slide_index]
      $(newSlide).fadeIn(800, () => {
        $(newSlide).show()
        this.disableNext = false
        if (this.quizService.questionState.active_slide_index > 0) {
          this.diablePrevious = false
        }
      })
    })
    // tslint:disable-next-line: max-line-length
    if (this.assesmentdata.questions.questions[this.quizService.questionState.active_slide_index + 1].questionType === 'mtf') {
      this.updateQuestionType(true)
    } else {
      this.updateQuestionType(false)
    }
  }
  updateQuestionType(status: any) {
    this.quizService.updateMtf.next(status)
  }
  previousQuestion() {
    if (this.disableNext = true) {
      this.disableNext = false
    }
    this.diablePrevious = true
    this.progressbarValue -= 100 / this.totalQuestion
    if (this.quizService.questionState.active_slide_index === 0) {
      return
    }
    const oldSlide = this.quizService.questionState.slides[this.quizService.questionState.active_slide_index]
    $(oldSlide).fadeOut('fast', () => {
      $(oldSlide).hide()
      this.diablePrevious = true
      for (let i = 0; i < this.quizService.questionState.slides.length; i += 1) {
        const slide = this.quizService.questionState.slides[i]
        $(slide).hide()
      }
      this.quizService.questionState.active_slide_index -= 1
      const newSlide = this.quizService.questionState.slides[this.quizService.questionState.active_slide_index]
      $(newSlide).fadeIn(800, () => {
        $(newSlide).show()
        this.diablePrevious = false
        if (this.quizService.questionState.active_slide_index === 0) {
          this.diablePrevious = true
        }
      })
    })
    if (this.assesmentdata.questions.questions[this.quizService.questionState.active_slide_index - 1].questionType === 'mtf') {
      this.updateQuestionType(true)
    } else {
      this.updateQuestionType(false)
    }
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe()
    }
    this.startTime = 0
    this.timeLeft = 0
  }

}
