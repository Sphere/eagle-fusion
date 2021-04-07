import {
  Component,
  ElementRef,
  Input,
  OnChanges, OnDestroy, OnInit,
  QueryList,
  SimpleChanges,
  ViewChild, ViewChildren,
} from '@angular/core'
import { MatDialog, MatSidenav } from '@angular/material'
import { interval, Subscription } from 'rxjs'
import { map } from 'rxjs/operators'
import { NSQuiz } from './quiz.model'
import { QuestionComponent } from './components/question/question.component'
import { SubmitQuizDialogComponent } from './components/submit-quiz-dialog/submit-quiz-dialog.component'
import { OnConnectionBindInfo } from 'jsplumb'
import { QuizService } from './quiz.service'
import { EventService } from '../../../../../../../library/ws-widget/utils/src/public-api'
export type FetchStatus = 'hasMore' | 'fetching' | 'done' | 'error' | 'none'
import { ViewerUtilService } from './../../viewer-util.service'

@Component({
  selector: 'viewer-plugin-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
})
export class QuizComponent implements OnInit, OnChanges, OnDestroy {

  @Input() identifier = ''
  @Input() artifactUrl = ''
  @Input() name = ''
  @Input() learningObjective = ''
  @Input() complexityLevel = ''
  @Input() duration = 0
  @Input() collectionId = ''
  @Input() viewStateChange: boolean | undefined
  @Input() progressStatus = ''
  @Input() quizJson = {
    timeLimit: 0,
    questions: [
      {
        multiSelection: false,
        question: '',
        questionId: '',
        options: [
          {
            optionId: '',
            text: '',
            isCorrect: false,
          },
        ],
      },
    ],
    isAssessment: false,
  }
  @ViewChildren('questionsReference') questionsReference: QueryList<QuestionComponent> | null = null
  @ViewChild('sidenav', { static: false }) sideNav: MatSidenav | null = null
  @ViewChild('submitModal', { static: false }) submitModal: ElementRef | null = null
  currentQuestionIndex = 0
  currentTheme = ''
  fetchingResultsStatus: FetchStatus = 'none'
  isCompleted = false
  isIdeal = false
  isSubmitted = false
  markedQuestions = new Set([])
  numCorrectAnswers = 0
  numIncorrectAnswers = 0
  numUnanswered = 0
  passPercentage = 0
  questionAnswerHash: { [questionId: string]: string[] } = {}
  result = 0
  sidenavMode = ''
  sidenavOpenDefault = false
  startTime = 0
  submissionState: NSQuiz.TQuizSubmissionState = 'unanswered'
  telemetrySubscription: Subscription | null = null
  timeLeft = 0
  timerSubscription: Subscription | null = null
  viewState: NSQuiz.TQuizViewMode = 'initial'
  paramSubscription: Subscription | null = null
  constructor(
    private events: EventService,
    public dialog: MatDialog,
    private quizSvc: QuizService,
    private viewerSvc: ViewerUtilService
  ) { }

  ngOnInit() {
  }

  scroll(qIndex: number) {
    if (!this.sidenavOpenDefault) {
      if (this.sideNav) {
        this.sideNav.close()
      }
    }
    const questionElement = document.getElementById(`question${qIndex}`)
    if (questionElement) {
      questionElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    this.viewerSvc.castResource.subscribe((content: any) => {
      if (content && content.type === 'Assessment') {
        this.viewState = 'initial'
      }
    })
    if (this.viewStateChange) {
      this.viewState = 'initial'
    }
    for (const change in changes) {
      if (change === 'quiz') {
        if (
          this.quizJson &&
          this.quizJson.timeLimit
        ) {
          this.quizJson.timeLimit *= 1000
        }
      }
    }
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe()
    }
    if (this.telemetrySubscription) {
      this.telemetrySubscription.unsubscribe()
    }
    this.startTime = 0
    this.timeLeft = 0
  }

  overViewed(event: NSQuiz.TUserSelectionType) {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe()
    }
    if (event === 'start') {
      this.startQuiz()
    } else if (event === 'skip') {
      // alert('skip quiz TBI')
    }
  }

  startQuiz() {
    this.sidenavOpenDefault = true
    setTimeout(() => { this.sidenavOpenDefault = false }, 500)
    this.viewState = 'attempt'
    this.startTime = Date.now()
    this.markedQuestions = new Set([])
    this.questionAnswerHash = {}
    this.currentQuestionIndex = 0
    this.timeLeft = this.quizJson.timeLimit
    if (this.quizJson.timeLimit > -1) {
      this.timerSubscription = interval(100)
        .pipe(
          map(
            () =>
              this.startTime + this.quizJson.timeLimit - Date.now(),
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
            this.submitQuiz()
          }
        })
    }
  }

  fillSelectedItems(question: NSQuiz.IQuestion, optionId: string) {
    this.raiseTelemetry('mark', optionId, 'click')
    if (this.viewState === 'answer') {
      if (this.questionsReference) {
        this.questionsReference.forEach(questionReference => {
          questionReference.reset()
        })
      }
    }
    this.viewState = 'attempt'
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
  }

  proceedToSubmit() {
    if (this.timeLeft) {
      if (
        Object.keys(this.questionAnswerHash).length !==
        this.quizJson.questions.length
      ) {
        this.submissionState = 'unanswered'
      } else if (this.markedQuestions.size) {
        this.submissionState = 'marked'
      } else {
        this.submissionState = 'answered'
      }
      const dialogRef = this.dialog.open(SubmitQuizDialogComponent, {
        width: '250px',
        data: this.submissionState,
      })

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.submitQuiz()
        }
      })
    }
  }

  submitQuiz() {
    this.raiseTelemetry('quiz', null, 'submit')
    this.isSubmitted = true
    this.ngOnDestroy()
    if (!this.quizJson.isAssessment) {
      this.viewState = 'review'
      this.calculateResults()
    } else {
      this.viewState = 'answer'
    }
    const submitQuizJson = JSON.parse(JSON.stringify(this.quizJson))
    this.fetchingResultsStatus = 'fetching'
    const requestData: NSQuiz.IQuizSubmitRequest = this.quizSvc.createAssessmentSubmitRequest(
      this.identifier,
      this.name,
      {
        ...submitQuizJson,
        timeLimit: this.quizJson.timeLimit * 1000,
      },
      this.questionAnswerHash,
    )
    const sanitizedRequestData: NSQuiz.IQuizSubmitRequest = this.quizSvc.sanitizeAssessmentSubmitRequest(requestData)

    this.quizSvc.submitQuizV2(sanitizedRequestData).subscribe(
      (res: NSQuiz.IQuizSubmitResponse) => {
        if (this.quizJson.isAssessment) {
          this.isIdeal = true
        }
        this.fetchingResultsStatus = 'done'
        this.numCorrectAnswers = res.correct
        this.numIncorrectAnswers = res.inCorrect
        this.numUnanswered = res.blank
        this.passPercentage = this.collectionId === 'lex_auth_01311423170518220869' ? 70 : res.passPercent // NQOCN Course ID
        this.result = res.result
        if (this.result >= this.passPercentage) {
          this.isCompleted = true
        }
        // const result = {
        //   result: (this.numCorrectAnswers * 100.0) / this.processedContent.quiz.questions.length,
        //   total: this.processedContent.quiz.questions.length,
        //   blank: res.blank,
        //   correct: res.correct,
        //   inCorrect: res.inCorrect,
        //   passPercentage: res.passPercent,
        // }
        // this.quizSvc.firePlayerTelemetryEvent(
        //   this.processedContent.content.identifier,
        //   this.collectionId,
        //   MIME_TYPE.quiz,
        //   result,
        //   this.isCompleted,
        //   'DONE',
        //   this.isIdeal,
        //   true,
        // )
        const top = document.getElementById('quiz-end')
        if (top !== null) {
          top.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      },
      (_error: any) => {
        this.fetchingResultsStatus = 'error'
      },
    )
    // this.fetchingResultsStatus = 'done'
  }

  showAnswers() {
    this.showMtfAnswers()
    this.showFitbAnswers()
    this.viewState = 'answer'
  }

  showMtfAnswers() {
    if (this.questionsReference) {
      this.questionsReference.forEach(questionReference => {
        questionReference.matchShowAnswer()
      })
    }
  }

  showFitbAnswers() {
    if (this.questionsReference) {
      this.questionsReference.forEach(questionReference => {
        questionReference.functionChangeBlankBorder()
      })
    }
  }

  calculateResults() {
    const correctAnswers = this.quizJson.questions.map(
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
    // logger.log(correctAnswers);
    this.numCorrectAnswers = 0
    this.numIncorrectAnswers = 0
    correctAnswers.forEach(answer => {
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
        this.showFitbAnswers()
      } else if (answer.questionType === 'mtf') {
        let unTouched = false
        let correctFlag = true
        if (selectedOptions.length < 1 || selectedOptions[0].length < 1) {
          unTouched = true
        } else if (selectedOptions[0].length < correctMtfOptions.length) {
          correctFlag = false
        }
        if (selectedOptions && selectedOptions[0]) {
          // logger.log(selectedOptions)
          // logger.log(correctOptions)
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
                this.setBorderColor(element, '#357a38')
              } else {
                element.setPaintStyle({
                  stroke: '#f44336',
                })
                correctFlag = false
                this.setBorderColor(element, '#f44336')
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
      this.quizJson.questions.length -
      this.numCorrectAnswers -
      this.numIncorrectAnswers
  }

  setBorderColor(connection: OnConnectionBindInfo, color: string) {
    const connectionSourceId = document.getElementById(connection.sourceId)
    const connectionTargetId = document.getElementById(connection.targetId)
    if (connectionSourceId) {
      connectionSourceId.style.borderColor = color
    }
    if (connectionTargetId) {
      connectionTargetId.style.borderColor = color
    }
  }

  isQuestionAttempted(questionId: string): boolean {
    return !(Object.keys(this.questionAnswerHash).indexOf(questionId) === -1)
  }

  isQuestionMarked(questionId: string) {
    return this.markedQuestions.has(questionId as unknown as never)
  }

  markQuestion(questionId: string) {
    if (this.markedQuestions.has(questionId as unknown as never)) {
      this.markedQuestions.delete(questionId as unknown as never)
    } else {
      this.markedQuestions.add(questionId as unknown as never)
    }
  }

  raiseTelemetry(action: string, optionId: string | null, event: string) {
    if (optionId) {
      this.events.raiseInteractTelemetry(
        action,
        event,
        {
          optionId,
        },
      )
    } else {
      this.events.raiseInteractTelemetry(action, event, {
        contentId: this.identifier,
      })
    }
  }
}
