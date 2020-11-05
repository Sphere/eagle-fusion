import { Component, Input, OnInit, OnChanges, OnDestroy } from '@angular/core'
import { Subscription, interval, Observable } from 'rxjs'
import { DomSanitizer } from '@angular/platform-browser'
import { map } from 'rxjs/operators'
import { NSHandsOnModels } from './hands-on.model'
import { NSHandsOnConstants } from './hands-on.constants'
import { LoggerService, EventService } from '@ws-widget/utils'
import { HandsOnService } from './hands-on.service'
import { MatDialog } from '@angular/material'
import { HandsOnDialogComponent } from './components/hands-on-dialog/hands-on-dialog.component'

import 'brace'
import 'brace/snippets/text'
import 'brace/ext/language_tools'
import 'brace/mode/javascript'
import 'brace/snippets/javascript'

import 'brace/mode/python'
import 'brace/snippets/python'

import 'brace/mode/scala'
import 'brace/snippets/scala'

import 'brace/mode/golang'
import 'brace/snippets/golang'

import 'brace/mode/perl'
import 'brace/snippets/perl'

import 'brace/mode/ruby'
import 'brace/snippets/ruby'

import 'brace/mode/c_cpp'
import 'brace/snippets/c_cpp'

import 'brace/mode/clojure'
import 'brace/snippets/clojure'

import 'brace/mode/coffee'
import 'brace/snippets/coffee'

import 'brace/mode/java'
import 'brace/snippets/java'

import 'brace/mode/csharp'
import 'brace/snippets/csharp'

import 'brace/mode/r'
import 'brace/snippets/r'

import 'brace/mode/sh'
import 'brace/snippets/sh'

import 'brace/mode/typescript'
import 'brace/snippets/typescript'

import 'brace/mode/php'
import 'brace/snippets/php'

import 'brace/theme/eclipse'

@Component({
  selector: 'viewer-plugin-hands-on',
  templateUrl: './hands-on.component.html',
  styleUrls: ['./hands-on.component.scss'],
})
export class HandsOnComponent implements OnInit, OnChanges, OnDestroy {

  @Input() resourceType: 'Exercise' | 'Tryout' = 'Tryout'
  @Input() identifier = ''
  @Input() handsOn: NSHandsOnModels.IHandsOnJson | null = null
  @Input() artifactUrl = ''
  firstInput = true
  isInput = false
  inputInterval: any
  firstClick = true
  isClick = false
  clickInterval: any
  inputStarterCode!: string
  executionInProgress = false
  options: any = {
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true,
    printMargin: false,
  }
  exerciseData: NSHandsOnModels.IHandsOnJson | null = null
  verifyData: any
  submitData: any
  apiErrorOccurred = false
  exerciseStartedAt = 0
  exerciseTimeRemaining = 0
  isPostActionSectionShown = false
  postActionSectionContent: 'execute' | 'verify' | 'submit' | 'submitNoVerify' = 'execute'
  exerciseResult: any
  verifyResult: any
  verifyJavaResult: any
  submitResult: any
  executed = false
  isError = false
  EXECUTION_STATUS: any
  private timerSubscription: Subscription | null = null
  private notifierTimerSubscription: Subscription | null = null
  constructor(
    private logger: LoggerService,
    private sanitizer: DomSanitizer,
    private handsOnSvc: HandsOnService,
    public dialog: MatDialog,
    private eventSvc: EventService,
  ) { }

  ngOnInit() {
    this.EXECUTION_STATUS = NSHandsOnConstants.EXECUTION_STATUS
  }

  ngOnChanges() {
    this.ngOnDestroy()
    this.firstInput = true
    this.isInput = false
    this.firstClick = true
    this.isClick = false
    this.isPostActionSectionShown = false
    this.initializeExercise()
    this.notifier('init')
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe()
    }
    if (this.notifierTimerSubscription) {
      this.notifierTimerSubscription.unsubscribe()
    }
    if (this.inputInterval) {
      clearInterval(this.inputInterval)
    }
    if (this.clickInterval) {
      clearInterval(this.clickInterval)
    }
  }

  private initializeExercise() {
    this.exerciseData = JSON.parse(JSON.stringify(this.handsOn))
    if (this.exerciseData) {
      const problemStatement = this.exerciseData.problemStatement
      const artifactUrl = this.artifactUrl.substring(0, this.artifactUrl.lastIndexOf('/'))
      const problemStatementdata = problemStatement.replace(/src="([^">]+)"/g, `src='${artifactUrl}$1'`)
      this.exerciseData.safeProblemStatement = this.sanitize(
        problemStatementdata,
      )
      this.inputStarterCode = this.exerciseData.starterCodes[0]
      this.exerciseData.timeLimit *= 1000
      this.exerciseStartedAt = Date.now()
      this.exerciseTimeRemaining = this.exerciseData.timeLimit
      this.executed = false
      this.notifier('LOADED')
      if (this.exerciseData.timeLimit > -1) {
        this.timerSubscription = interval(100)
          .pipe(
            map(
              () =>
                this.exerciseStartedAt +
                (this.exerciseData ? this.exerciseData.timeLimit : 0) -
                Date.now(),
            ),
          )
          .subscribe(exerciseTimeRemaining => {
            this.exerciseTimeRemaining = exerciseTimeRemaining
            if (this.exerciseTimeRemaining < 0) {
              this.exerciseTimeRemaining = 0
              if (this.timerSubscription) {
                this.timerSubscription.unsubscribe()
              }
            }
          })
      }
    }
    this.notifierTimerSubscription = interval(30 * 1000).subscribe(() => {
      this.notifier('RUNNING')
    })
  }

  reset() {
    this.initializeExercise()
    this.exerciseResult = null
    this.verifyResult = null
  }

  openExecutionDialog(type: string) {
    this.notifier('SUBMIT')
    this.executed = true
    const dialogRef = this.dialog.open(HandsOnDialogComponent, {
      width: '500px',
      data: type,
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'submit') {
        this.submit(true)
      }
    })
  }

  showPostActionSection(option: 'execute' | 'verify' | 'submit') {
    this.postActionSectionContent = option
    this.isPostActionSectionShown = true
    if (option === 'execute') {
      this.execute()
    } else if (option === 'verify') {
      this.verify()
    } else if (option === 'submit') {
      this.submit()
    }
  }

  done() {
    this.notifier('DONE')
  }

  private sanitize(htmlString: string) {
    return this.sanitizer.bypassSecurityTrustHtml(htmlString)
  }

  private notifier(type: any) {
    const exerciseEvent: any = {
      type,
      plugin: 'handson',
      data: {},
    }
    switch (type) {
      case 'LOADED':
      case 'RUNNING':
        exerciseEvent.data.isSubmitted = this.executed
        break
      case 'SUBMIT':
        exerciseEvent.data = this.exerciseData
        break
      case 'DONE':
        break
      default:
    }
    // this.parentComm.raiseTelemetryEvent(type, exerciseEvent);
  }

  execute() {
    this.executionInProgress = true
    this.exerciseResult = null
    const exerciseData = {
      language: this.exerciseData ? this.exerciseData.supportedLanguages[0].id : 0,
      code: this.exerciseData ? this.exerciseData.starterCodes[0] : '',
      stdin: '',
    }
    this.handsOnSvc.execute(exerciseData).subscribe(data => {
      this.executionInProgress = false
      if (data) {
        this.exerciseResult = { ...data }
        this.exerciseResult.showOutput = ''
        if (
          this.exerciseResult.output !== '' &&
          this.exerciseResult.errors === ''
        ) {
          this.exerciseResult.status = NSHandsOnConstants.EXECUTION_STATUS.OK
          this.exerciseResult.showOutput = this.exerciseResult.output
        } else if (this.exerciseResult.errors !== '') {
          if (
            this.exerciseResult.output
              .toLowerCase()
              .indexOf('compilation failed') > -1
          ) {
            this.exerciseResult.status = NSHandsOnConstants.EXECUTION_STATUS.ERROR
            this.exerciseResult.showOutput =
              `Compilation failed\n${this.exerciseResult.errors}`
          } else if (
            this.exerciseResult.output
              .toLowerCase()
              .indexOf('compilation succeeded') > -1
          ) {
            this.exerciseResult.status = NSHandsOnConstants.EXECUTION_STATUS.WARNING
            this.exerciseResult.showOutput = `${this.exerciseResult.output}\nWarnings:\n${this.exerciseResult.errors}`
          } else {
            this.exerciseResult.status = NSHandsOnConstants.EXECUTION_STATUS.ERROR
            this.exerciseResult.showOutput = `${this.exerciseResult.output}\nRuntime Exception\n${this.exerciseResult.errors}`
          }
        }
      }
    })
  }

  verify() {
    this.executionInProgress = true
    setTimeout(
      () => {
        const resultElement = document.getElementById('verifyCard')
        if (resultElement) {
          resultElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      },
      500,
    )
    this.exerciseResult = null
    this.verifyResult = null
    this.submitResult = null
    this.verifyJavaResult = null
    this.apiErrorOccurred = false
    if (this.handsOn && this.handsOn.forFPCourse) {
      const lexId = this.identifier
      const exerciseDataFP = {
        user_solution: this.exerciseData ? this.exerciseData.starterCodes[0] : '',
        user_id_type: 'uuid',
        ignore_error: true,
      }
      const isJavaFPContent = this.handsOn.supportedLanguages[0].language.toLowerCase().indexOf('java') > -1
      const subscribe: Observable<any> = isJavaFPContent ?
        this.handsOnSvc.verifyJavaFp(lexId, exerciseDataFP) :
        this.handsOnSvc.verifyFp(lexId, exerciseDataFP)
      subscribe.subscribe(
        data => {
          if (data) {
            this.verifyData = { ...data }
            if (isJavaFPContent) {
              this.verifyJavaResult = this.verifyData.verifyResult
              this.verifyJavaResult.sample = this.verifyJavaResult.procedural[0]
              this.verifyJavaResult.actual = this.verifyJavaResult.procedural[1]
            } else {
              this.verifyResult = JSON.parse(this.verifyData.verifyResult)
              this.verifyResult.structural = this.verifyResult.TestResultData.filter((obj: { Type: string }) => obj.Type === 'Structural')
              this.verifyResult.sample = this.verifyResult.TestResultData.filter((obj: { SAType: string }) => obj.SAType === 'Sample')
              this.verifyResult.actual = this.verifyResult.TestResultData.filter((obj: { SAType: string }) => obj.SAType === 'Actual')
            }
          }
          this.executionInProgress = false
          const resultElement = document.getElementById('verifyCard')
          if (resultElement) {
            setTimeout(
              () => {
                resultElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
              },
              500)
          }
        },
        _error => {
          this.verifyResult = null
          this.apiErrorOccurred = true
          this.executionInProgress = false
          const resultElement = document.getElementById('verifyCard')
          if (resultElement) {
            setTimeout(
              () => {
                resultElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
              },
              500)
          }
        },
      )
    } else {
      const lexId = this.identifier
      const exerciseDataCE = {
        language_code: this.exerciseData ? this.exerciseData.supportedLanguages[0].id : 0,
        user_solution: this.exerciseData ? this.exerciseData.starterCodes[0] : '',
        user_id_type: 'uuid',
        ignore_error: true,
      }
      this.handsOnSvc.verifyCe(lexId, exerciseDataCE).subscribe(
        data => {
          if (data) {
            this.verifyData = { ...data }
            this.verifyResult = JSON.parse(this.verifyData.verifyResult)
            this.verifyResult.Hiddens = this.verifyResult.testCaseOutputs.filter((obj: { type: string }) => obj.type === 'hidden')
            this.verifyResult.Samples = this.verifyResult.testCaseOutputs.filter((obj: { type: string }) => obj.type === 'sample')
            this.verifyResult.SamplesPassed = this.verifyResult.Samples.filter((obj: { result: string }) => obj.result === 'Passed')
            this.verifyResult.HiddensPassed = this.verifyResult.Hiddens.filter((obj: { result: string }) => obj.result === 'Passed')
            this.verifyResult.HiddensFailed = this.verifyResult.Hiddens.filter((obj: { result: string }) => obj.result === 'Failed')
          }
          this.executionInProgress = false
          const resultElement = document.getElementById('verifyCard')
          if (resultElement) {
            setTimeout(
              () => {
                resultElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
              },
              500,
            )
          }
        },
        _error => {
          this.verifyResult = null
          this.apiErrorOccurred = true
          this.executionInProgress = false
          const resultElement = document.getElementById('verifyCard')
          if (resultElement) {
            setTimeout(
              () => {
                resultElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
              },
              500,
            )
          }
        },
      )
    }
  }

  submit(ignoreError = false) {
    this.executionInProgress = true
    setTimeout(
      () => {
        const resultElement = document.getElementById('submitCard')
        if (resultElement) {
          resultElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      },
      500,
    )
    this.exerciseResult = null
    this.verifyResult = null
    this.submitResult = null
    this.verifyResult = null
    this.apiErrorOccurred = false
    if (this.handsOn && this.handsOn.forFPCourse) {
      const lexId = this.identifier
      const exerciseDataFP = {
        user_solution: this.exerciseData ? this.exerciseData.starterCodes[0] : '',
        user_id_type: 'uuid',
        ignore_error: ignoreError,
      }
      const isJavaFPContent = this.handsOn.supportedLanguages[0].language.toLowerCase().indexOf('java') > -1
      const subscribe: Observable<any> = isJavaFPContent ?
        this.handsOnSvc.submitJavaFp(lexId, exerciseDataFP) :
        this.handsOnSvc.submitFp(lexId, exerciseDataFP)
      subscribe.subscribe(
        data => {
          if (data) {
            this.submitData = { ...data }
            this.submitResult = this.submitData.submitResult
            if (!this.submitResult.submitionStatus) {
              this.openExecutionDialog('submit')
            }
          }
          this.executionInProgress = false
          const resultElement = document.getElementById('submitCard')
          if (resultElement) {
            setTimeout(
              () => {
                resultElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
              },
              500,
            )
          }
        },
        _error => {
          this.submitResult = null
          this.apiErrorOccurred = true
          this.executionInProgress = false
          const resultElement = document.getElementById('submitCard')
          if (resultElement) {
            setTimeout(
              () => {
                resultElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
              },
              500,
            )
          }
        },
      )
    } else {
      const lexId = this.identifier
      const exerciseDataCE = {
        language_code: this.exerciseData ? this.exerciseData.supportedLanguages[0].id : 0,
        user_solution: this.exerciseData ? this.exerciseData.starterCodes[0] : '',
        user_id_type: 'uuid',
        ignore_error: ignoreError,
      }
      this.handsOnSvc.submitCe(lexId, exerciseDataCE).subscribe(
        data => {
          if (data) {
            this.submitData = { ...data }
            this.submitResult = this.submitData.submitResult
            if (!this.submitResult.submitionStatus) {
              this.openExecutionDialog('submit')
            }
          }
          this.executionInProgress = false
          const resultElement = document.getElementById('submitCard')
          if (resultElement) {
            setTimeout(
              () => {
                resultElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
              },
              500,
            )
          }
        },
        _error => {
          this.submitResult = null
          this.apiErrorOccurred = true
          this.executionInProgress = false
          const resultElement = document.getElementById('submitCard')
          if (resultElement) {
            setTimeout(
              () => {
                resultElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
              },
              500,
            )
          }
        },
      )
    }
  }

  viewLastSubmission() {
    const lexId = this.identifier
    this.handsOnSvc.viewLastSubmission(lexId).subscribe(
      data => {
        if (data) {
          if (data === '---no submission found---') {
            this.openExecutionDialog('no-submit')
          } else {
            const viewLastSubmissionData: string = data as string
            if (this.exerciseData) {
              this.exerciseData.starterCodes[0] = viewLastSubmissionData
            }
          }
        }
      },
      _error => {
        this.openExecutionDialog('no-submit')
      },
    )
  }

  copyToClipBoardFunction() {
    const id = 'mycustom-clipboard-textarea-hidden-id'
    let existsTextarea = document.getElementById(id) as HTMLTextAreaElement
    if (!existsTextarea) {
      const textarea = document.createElement('textarea')
      textarea.id = id
      // Place in top-left corner of screen regardless of scroll position.
      textarea.style.position = 'fixed'
      textarea.style.top = '0px'
      textarea.style.left = '0px'

      // Ensure it has a small width and height. Setting to 1px / 1em
      // doesn't work as this gives a negative w/h on some browsers.
      textarea.style.width = '1px'
      textarea.style.height = '1px'

      // We don't need padding, reducing the size if it does flash render.
      textarea.style.padding = '0px'

      // Clean up any borders.
      textarea.style.border = 'none'
      textarea.style.outline = 'none'
      textarea.style.boxShadow = 'none'

      // Avoid flash of white box if rendered for any reason.
      textarea.style.background = 'transparent'
      const documentBody = document.querySelector('body')
      if (documentBody) {
        documentBody.appendChild(textarea)
      }
      existsTextarea = document.getElementById(id) as HTMLTextAreaElement
    } else {
    }
    if (this.exerciseData) {
      existsTextarea.value = this.exerciseData.starterCodes[0]
    }
    existsTextarea.select()

    try {
      const status = document.execCommand('copy')
      if (!status) {
        this.logger.error('Cannot copy text')
      } else {
        const tooltip = document.getElementById('myTooltip')
        if (tooltip) {
          tooltip.innerHTML = 'Code Copied!'
        }
      }
    } catch (err) {
    }
  }

  outFunc() {
    const tooltip = document.getElementById('myTooltip')
    if (tooltip) {
      tooltip.innerHTML = 'Copy to clipboard'
    }
  }

  raiseInputChange() {
    if (this.inputStarterCode
      && this.exerciseData
      && this.exerciseData.starterCodes[0]
      && this.inputStarterCode !== this.exerciseData.starterCodes[0]) {
      this.isInput = true
      if (this.isInput && this.firstInput) {
        this.raiseInteractTelemetry('editor', 'codeinput')
        this.startInputTimer()
      }
      this.firstInput = false
    }
  }
  raiseClickEvent() {
    this.isClick = true
    if (this.isClick && this.firstClick) {
      this.raiseInteractTelemetry('editor', 'buttonclick')
      this.startClickTimer()
    }
    this.firstClick = false
  }

  raiseInteractTelemetry(action: string, event: string) {
    if (this.identifier) {
      this.eventSvc.raiseInteractTelemetry(action, event, {
        contentId: this.identifier,
      })
    }
    if (event === 'codeinput') {
      this.isInput = false
    }
    if (event === 'buttonclick') {
      this.isClick = false
    }
  }
  startInputTimer() {
    this.inputInterval = setInterval(
      () => {
      if (this.isInput) {
        this.raiseInteractTelemetry('editor', 'codeinput')
      }
    },
      2 * 60000)
  }
  startClickTimer() {
    this.clickInterval = setInterval(
      () => {
      if (this.isClick) {
        this.raiseInteractTelemetry('editor', 'buttonclick')
      }
    },
      2 * 60000)
  }

}
