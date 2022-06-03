import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { ActivatedRoute } from '@angular/router'
import { interval, Subscription } from 'rxjs'
import { map } from 'rxjs/operators'
import { FetchStatus } from '../../quiz.component'
import { NSQuiz } from '../../quiz.model'
import { QuizService } from '../../quiz.service'
declare var $: any
@Component({
  selector: 'viewer-assesment-modal',
  templateUrl: './assesment-modal.component.html',
  styleUrls: ['./assesment-modal.component.scss'],
})
export class AssesmentModalComponent implements OnInit {

  timeLeft = 0;
  startTime = 0;
  tabIndex = 0;
  isIdeal = false;
  totalQuestion = 0;
  activeIndex = 0;
  numCorrectAnswers = 0;
  numIncorrectAnswers = 0;
  numUnanswered = 0
  passPercentage = 0
  result = 0
  progressbarValue = 5
  isCompleted = false
  fetchingResultsStatus: FetchStatus = 'none'
  questionAnswerHash: { [questionId: string]: string[] } = {}
  timerSubscription: Subscription | null = null
  dialog: any
  constructor(
    public dialogRef: MatDialogRef<AssesmentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public assesmentdata: any,
    public quizService: QuizService,
    public route: ActivatedRoute
  ) { }

  ngOnInit() {
    console.log("data", this.assesmentdata)

    this.timeLeft = this.assesmentdata.questions.timeLimit
    this.startTime = Date.now()
    console.log()
    this.timer(this.timeLeft)
    this.questionAnswerHash = {}
    this.totalQuestion = Object.keys(this.assesmentdata.questions.questions).length
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
            console.log("time out")
          }
        })
    }
  }


  fillSelectedItems(question: NSQuiz.IQuestion, optionId: string) {
    console.log(question, optionId)
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
    console.log(this.questionAnswerHash)
  }


  proceedToSubmit() {

    console.log(Object.keys(this.questionAnswerHash).length, this.assesmentdata.questions.questions.length)
    if (
      Object.keys(this.questionAnswerHash).length ===
      this.assesmentdata.questions.questions.length
    ) {
      this.submitQuiz()

    }



  }

  submitQuiz() {
    this.ngOnDestroy()
    if (!this.assesmentdata.questions.isAssessment) {
      this.calculateResults()
    }

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
        this.passPercentage = this.assesmentdata.generalData.collectionId === 'lex_auth_0131241730330624000' ? 70 : res.passPercent // NQOCN Course ID
        this.result = res.result
        console.log(this.result)
        this.tabIndex = 1
        if (this.result >= this.passPercentage) {
          this.isCompleted = true
        }
      },
      (_error: any) => {
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
    this.progressbarValue += 1
    console.log(this.quizService.questionState, this.totalQuestion)

    if (
      this.quizService.questionState.active_slide_index
      == (this.quizService.questionState.slides.length - 1)) {
      console.log("final")
      this.proceedToSubmit()
      return
    }
    const old_slide = this.quizService.questionState.slides[this.quizService.questionState.active_slide_index]
    $(old_slide).fadeOut("fast", () => {
      $(old_slide).hide()
      for (var i = 0; i < this.quizService.questionState.slides.length; i++) {
        const slide = this.quizService.questionState.slides[i]
        $(slide).hide()
      }
      this.quizService.questionState.active_slide_index++
      const new_slide = this.quizService.questionState.slides[this.quizService.questionState.active_slide_index]
      $(new_slide).fadeIn("fast", () => {
        $(new_slide).show()
      })
    })

  }
  previousQuestion() {
    this.progressbarValue -= 1
    if (this.quizService.questionState.active_slide_index == 0) {
      return
    }
    const old_slide = this.quizService.questionState.slides[this.quizService.questionState.active_slide_index]
    $(old_slide).fadeOut("fast", () => {
      $(old_slide).hide()
      for (var i = 0; i < this.quizService.questionState.slides.length; i++) {
        const slide = this.quizService.questionState.slides[i]
        $(slide).hide()
      }
      this.quizService.questionState.active_slide_index--
      const new_slide = this.quizService.questionState.slides[this.quizService.questionState.active_slide_index]
      $(new_slide).fadeIn("fast", () => {
        $(new_slide).show()
      })
    })
  }


  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe()
    }
    this.startTime = 0
    this.timeLeft = 0
  }
  closePopup() {

  }

}
