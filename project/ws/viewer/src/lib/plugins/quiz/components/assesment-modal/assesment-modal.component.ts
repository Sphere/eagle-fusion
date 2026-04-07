import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute } from '@angular/router'
import { interval, Subject, Subscription } from 'rxjs'
import { first, map, takeUntil } from 'rxjs/operators'
import { NSQuiz } from '../../quiz.model'
import { QuizService } from '../../quiz.service'
declare let $: any
import { round, forEach, isNull } from 'lodash'
import { NsContent, WidgetContentService } from '@ws-widget/collection'
import { ViewerDataService } from '../../../../viewer-data.service'
import {
  ValueService,
  ConfigurationsService,
  TelemetryService,
  EventService,
  LoggerService,
} from '@ws-widget/utils'
import { ViewerUtilService } from '../../../../viewer-util.service'
import { PlayerStateService } from '../../../../player-state.service'
import { ViewAnswerComponent } from '../view-answer/view-answer.component'
import { PlaylistService } from '../../../../../../../../../src/app/services/playlist.service'
import { TranslateService } from '@ngx-translate/core'
import { S3_END_POINTS } from '../../../../../../../../../src/app/constants/apiConstants'
import { ScreenSecurityService } from '../../../../screen-security.service'
// declare var Telemetry: any
@Component({
    selector: 'viewer-assesment-modal',
    templateUrl: './assesment-modal.component.html',
    styleUrls: ['./assesment-modal.component.scss'],
    // tslint:disable-next-line:use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    
})
export class AssesmentModalComponent implements OnInit, AfterViewInit, OnDestroy {
  isXSmall$ = this.valueSvc.isXSmall$
  showSubmit = false
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
  isCompetencyComplted = false
  fetchingResultsStatus: NSQuiz.FetchStatus = 'none'
  questionAnswerHash: any = {}
  timerSubscription: Subscription | null = null
  tabActive = false
  disableNext = false
  diablePrevious = true
  assesmentActive = true
  disableContinue = false
  isCompetency = false
  competencyLevelId = ''
  proficiencyLevel = ''
  competencyId = ''
  public unsubscribe = new Subject<void>()

  // Organizations where View Answers should not be shown if isCorrectAnswerPopUp is not present
  // Fetched from S3 configuration
  private restrictedOrgIds: string[] = []
  isBlockedFlag: boolean
  constructor(
    public dialogRef: MatDialogRef<AssesmentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public assesmentdata: any,
    public quizService: QuizService,
    public route: ActivatedRoute,
    private valueSvc: ValueService,
    private snackBar: MatSnackBar,
    public viewerDataSvc: ViewerDataService,
    private configSvc: ConfigurationsService,
    private telemetrySvc: TelemetryService,
    private viewerSvc: ViewerUtilService,
    public playerStateService: PlayerStateService,
    private contentSvc: WidgetContentService,
    private events: EventService,
    private dialog: MatDialog,
    private http: HttpClient,
    private logger: LoggerService,
    private plylsSvc: PlaylistService,
    private translate: TranslateService,
    private scrnScrtySvc: ScreenSecurityService
  ) { }

  ngOnInit() {
    this.scrnScrtySvc.isBlocked$.subscribe(val => {
      this.isBlockedFlag = val
    })
    this.isBlockedFlag = JSON.parse(localStorage.getItem('screenBlocked'))
    this.logger.log("this.viewerDataSvc.resource", this.viewerDataSvc.resource)
    this.logger.log(this.assesmentdata)
    this.telemetrySvc.getTelemetryConfig()
    this.telemetrySvc.impression('assessment-page-loaded', 'popup-details', 'assessment-modal', { id: this.assesmentdata.generalData.identifier, type: 'application/json', version: "", rollup: { l1: this.assesmentdata.generalData.collectionId } })
    this.timeLeft = this.assesmentdata.questions.timeLimit
    this.startTime = Date.now()
    this.timer(this.timeLeft)
    this.questionAnswerHash = {}
    this.totalQuestion = Object.keys(this.assesmentdata.questions.questions).length
    // this.progressbarValue = this.totalQuestion
    this.progressbarValue += 100 / this.totalQuestion
    this.proficiencyLevel = this.assesmentdata.generalData.name
      .replace('Proficency', 'Proficiency').split('Proficiency')[1]
    this.isCompetency = this.route.snapshot.queryParams.competency
    this.fetchRestrictedOrgIds()
    // **CRITICAL**: Check current progress before sending update to avoid resetting completed assessments
    this.updateProgress()
  }
  updateProgress() {
    // **CRITICAL**: Check if currentProgress was already provided by parent component
    const parentProgress = this.assesmentdata?.currentProgress
    if (parentProgress && parentProgress.completionPercentage > 0) {
      // Parent already has progress data - assessment is in progress, don't reset it
      this.logger.log('Assessment already in progress with', parentProgress.completionPercentage, '% completion - skipping init progress update')
      return
    }

    // If no parent progress, fetch current progress first - only send 0% if assessment hasn't been started yet
    const collectionId = this.assesmentdata.generalData.collectionId
    const batchId = this.route.snapshot.queryParams.batchId
    let userId = ''
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || ''
    }

    // Fetch current progress to check if assessment is already started/completed
    const req: any = {
      request: {
        userId,
        batchId: batchId || undefined,
        courseId: collectionId,
        contentIds: [this.assesmentdata.generalData?.identifier],
        fields: ['progressdetails'],
      },
    }

    this.contentSvc.fetchContentHistoryV2(req).subscribe(
      (data: any) => {
        // Check if this assessment already has progress recorded
        const currentProgress = data?.result?.contentList?.find((item: any) =>
          item.contentId === this.assesmentdata.generalData?.identifier
        )

        // **CRITICAL**: Only send 0% progress if assessment hasn't been started yet
        // If already in progress (completionPercentage > 0), don't reset it
        if (!currentProgress || currentProgress.completionPercentage === 0 || currentProgress.completionPercentage === undefined) {
          // Assessment is new or not started - safe to send 0%
          const realTimeProgressRequest = {
            content_type: 'Resource',
            current: ['0'],
            max_size: 0,
            mime_type: NsContent.EMimeTypes.APPLICATION_JSON,
            user_id_type: 'uuid',
            completionPercentage: 0,
            status: 1,
          }

          this.viewerSvc.realTimeProgressUpdateV3(
            this.assesmentdata.generalData?.identifier,
            realTimeProgressRequest,
            collectionId,
            batchId
          ).subscribe(
            () => { /* success - fire and forget */ },
            error => { this.logger.warn('Progress init failed:', error) }
          )
        } else {
          // Assessment already has progress - don't reset it
          this.logger.log('Assessment already in progress with', currentProgress.completionPercentage, '% completion - skipping init progress update')
        }
      },
      error => {
        this.logger.warn('Failed to fetch current progress:', error)
        // On error, don't send any progress update to avoid overwriting existing data
      }
    )
  }
  ngAfterViewInit() {
    const enabled: boolean = this.plylsSvc.orgDetails()?.assessmentConfig?.isRecoridngEnable ?? false
    if (!enabled) this.scrnScrtySvc.init()
    const object = {
      "id": this.assesmentdata.generalData.identifier,
      "type": "application/json",
      "version": "",
      "rollup": {
        "l1": this.assesmentdata.generalData.collectionId,
        "l2": this.assesmentdata.generalData.identifier,
      },
    }
    this.telemetrySvc.start('application/json', 'assessment-start', 'player', object)
    if (this.assesmentdata.questions.questions[0].questionType === 'mtf') {
      this.updateQuestionType(true)
    }
  }

  /**
   * Fetch restricted organization names from S3 configuration file
   */
  private fetchRestrictedOrgIds(): void {
    const s3ConfigUrl = S3_END_POINTS.QUIZ_CONFIG

    this.http.get<any>(s3ConfigUrl).subscribe(
      (config: any) => {
        if (config && Array.isArray(config.restrictedOrgIds)) {
          this.restrictedOrgIds = config.restrictedOrgIds
          this.logger.log('Restricted org names loaded from S3:', this.restrictedOrgIds)
        }
      },
      (error: any) => {
        this.logger.warn('Failed to load restricted org names from S3:', error)
      }
    )
  }

  /**
   * Check if View Answers button should be shown based on resource property and organization
   *
   * Logic:
   * - If isCorrectAnswerPopUp resource key is present and true: Show View Answers for all organizations
   * - If isCorrectAnswerPopUp resource key is NOT present/falsy:
   *   - Don't show for restricted orgs (from S3 config)
   *   - Show for all other organizations
   */
  canShowViewAnswers(): boolean {
    // Check if isCorrectAnswerPopUp is present in resource
    const orgData = this.plylsSvc.orgDetails()
    const resource = this.viewerDataSvc.resource
    const isCorrectAnswerPopUp = resource?.isCorrectAnswerPopUp
    const isDisplayAnswer = orgData?.assessmentConfig?.isCorrectAnswerPopUp ?? false
    // If isCorrectAnswerPopUp is explicitly false, don't show for ANY organization
    if (isCorrectAnswerPopUp === false) {
      return false
    }

    // If isCorrectAnswerPopUp is explicitly true, show View Answers for all orgs
    if (isCorrectAnswerPopUp === true) {
      return true
    }

    // If isCorrectAnswerPopUp is NOT present, check organization
    // Get the organization name from user profile
    const userOrgName = this.configSvc.userProfile?.rootOrgName

    // If user's organization is in restricted list (from S3), don't show View Answers
    if (userOrgName && !isDisplayAnswer) {
      return false
    }

    // For all other organizations, show View Answers
    return true
  }

  closePopup() {
    if (this.isCompetency) {
      this.dialogRef.close({
        event: 'CLOSE',
        competency: this.route.snapshot.queryParams.competency,
      })
    } else {

      this.dialogRef.close({ event: 'CLOSE' })
    }
    const data: any = {
      id: this.assesmentdata.generalData.identifier,
      type: "application/json",
      version: "",
      "rollup": {
        "l1": this.assesmentdata.generalData.collectionId,
        "l2": this.assesmentdata.generalData.identifier,
      },
    }
    const extras: any = {
      values: [{
        courseID: this.assesmentdata.generalData.collectionId,
        contentId: this.assesmentdata.generalData.identifier,
        name: this.assesmentdata.generalData.name,
        moduleId: this.viewerDataSvc.resource!.parent ? this.viewerDataSvc.resource!.parent : undefined,

      }],
    }
    this.telemetrySvc.interact('application/json', 'assessment-close-start', 'player', data, extras)
    this.telemetrySvc.interact('application/json', 'assessment-close-end', 'player', data, extras)
  }

  closeDone() {
    this.dialogRef.close({ event: 'DONE', result: this.result, passPercentage: this.passPercentage })
  }

  async retakeQuiz() {
    if (this.result === 100 || this.result < this.passPercentage) {
      this.dialogRef.close({ event: 'RETAKE_QUIZ' })
    } else {
      this.dialog.open(ViewAnswerComponent, {
        width: '100%',
        panelClass: 'view-answer-dialog',
        data: {
          questions: this.assesmentdata.questions.questions,
          userInput: this.questionAnswerHash,
        },
      })
    }
  }
  CompetencyDashboard() {
    this.dialogRef.close({
      event: 'FAILED_COMPETENCY',
      competency: this.route.snapshot.queryParams.competency,
    })
  }
  viewCourses() {
    this.dialogRef.close({
      event: 'VIEW_COURSES',
      competency: this.route.snapshot.queryParams.competency,
      competencyId: this.competencyId,
      competencyLevel: this.competencyLevelId,
    })
  }
  nextCompetency() {
    this.dialogRef.close({
      event: 'NEXT_COMPETENCY',
      competency: this.route.snapshot.queryParams.competency,
    })
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
            const data: any = {
              id: this.assesmentdata.generalData.identifier,
              type: "application/json",
              version: "",
              "rollup": {
                "l1": this.assesmentdata.generalData.collectionId,
                "l2": this.assesmentdata.generalData.identifier,
              },
            }
            const extras: any = {
              values: [{
                courseID: this.assesmentdata.generalData.collectionId,
                contentId: this.assesmentdata.generalData.identifier,
                name: this.assesmentdata.generalData.name,
                moduleId: this.viewerDataSvc.resource!.parent ? this.viewerDataSvc.resource!.parent : undefined,
              }],
            }
            this.telemetrySvc.end('application/json', 'assessment-auto-submit', 'player', data, extras)
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
    this.generateInteractTelemetry("", question, qindex)
    this.questionAnswerHash['qslideIndex'] = qindex
  }

  generateInteractTelemetry(
    status?: string,
    question?: NSQuiz.IQuestion,
    qindex?: number
  ) {
    const value = new Map()
    value["id"] = this.assesmentdata?.generalData?.identifier
    value["type"] = "application/json"
    value["version"] = ""
    value["rollup"] = { l1: this.assesmentdata?.generalData?.collectionId, l2: this.assesmentdata?.generalData?.identifier }
    const extras: any = {
      values: [{
        courseID: this.assesmentdata?.generalData?.collectionId,
        questionType: question ? question.questionType : "",
        identifier: this.assesmentdata?.generalData?.identifier,
        questionId: question ? question.questionId : "",
        qindex: question ? qindex : "",
      }],
    }
    this.events.raiseInteractTelemetry(status ? 'TOUCH' : 'select-option', status
      ? status === "next"
        ? 'next-question-clicked'
        : 'previous-question-clicked'
      : 'answer-clicked',
      'player',
      value, extras
    )
  }

  proceedToSubmit() {
    this.submitQuiz()
  }

  private openSnackbar(primaryMsg: string, duration = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
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
    if (this.route.snapshot.queryParams.competency) {
      this.submitCompetencyQuizV2(sanitizedRequestData)
    } else {
      this.submitQuizV2(sanitizedRequestData)
    }

  }
  submitQuizV2(sanitizedRequestData: any) {
    this.quizService.submitQuizV2(sanitizedRequestData).subscribe(
      (res: NSQuiz.IQuizSubmitResponse) => {
        const data: any = {
          id: this.assesmentdata.generalData.identifier,
          type: "application/json",
          version: "",
          "rollup": {
            "l1": this.assesmentdata.generalData.collectionId,
            "l2": this.assesmentdata.generalData.identifier,
          },
        }
        const extras: any = {
          values: [{
            courseID: this.assesmentdata.generalData.collectionId,
            contentId: this.assesmentdata.generalData.identifier,
            name: this.assesmentdata.generalData.name,
            moduleId: this.viewerDataSvc.resource!.parent ? this.viewerDataSvc.resource!.parent : undefined,
          }],
        }
        this.telemetrySvc.end('application/json', 'assessment-submit', 'player', data, extras)
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
        this.result = round(res.result)
        this.tabIndex = 1
        this.tabActive = true
        this.assesmentActive = false
        this.logger.log(this.result, this.passPercentage)
        if (this.result >= this.passPercentage) {
          this.isCompleted = true
        }
        if (this.viewerDataSvc.gatingEnabled && !this.isCompleted) {
          this.disableContinue = true
        }
      },
      (_error: any) => {
        this.openSnackbar(this.translate.instant("SUBMIT_ERR"))
        this.fetchingResultsStatus = 'error'
      },
    )
  }
  submitCompetencyQuizV2(sanitizedRequestData: any) {
    this.quizService.competencySubmitQuizV2(sanitizedRequestData).subscribe(
      (res: NSQuiz.IQuizSubmitResponse) => {
        const data1: any = {
          id: this.assesmentdata.generalData.identifier,
          type: "competency",
          version: "",
          "rollup": {
            "l1": this.assesmentdata.generalData.collectionId,
            "l2": this.assesmentdata.generalData.identifier,
          },
        }
        const extras: any = {
          values: [{
            courseID: this.assesmentdata.generalData.collectionId,
            contentId: this.assesmentdata.generalData.identifier,
            name: this.assesmentdata.generalData.name,
            moduleId: this.viewerDataSvc.resource!.parent ? this.viewerDataSvc.resource!.parent : undefined,
          }],
        }
        this.telemetrySvc.end('competency', 'competency-submit', 'player', data1, extras)
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
        this.result = round(res.result)
        this.tabIndex = 1
        this.tabActive = true
        this.assesmentActive = false
        if (this.result >= this.passPercentage) {
          this.isCompleted = true
          this.isCompetencyComplted = true
        } else {
          this.disableNext = true
        }
        this.isCompetency = this.route.snapshot.queryParams.competency
        if (this.viewerDataSvc.gatingEnabled && !this.isCompleted) {
          this.disableContinue = true
        }
        const data = localStorage.getItem('competency_meta_data')
        let competency_meta_data: any
        let competencyLevelId
        if (data) {
          competency_meta_data = JSON.parse(data)[0]
          forEach(JSON.parse(data), (item: any) => {
            if (item.competencyIds) {
              competencyLevelId = this.getCompetencyId(item.competencyIds)
              this.competencyLevelId = competencyLevelId ?? ''
            }
          })
        }
        this.competencyId = competency_meta_data.competencyId
        let userId = ''
        if (this.configSvc.userProfile) {
          userId = this.configSvc.userProfile.userId || ''
        }
        if (this.isCompetencyComplted) {
          const formatedData = {
            request: {
              userId,
              typeName: 'competency',
              competencyDetails: [
                {
                  competencyId: competency_meta_data.competencyId,
                  additionalParams: {
                    competencyName: competency_meta_data.competencyName,
                  },
                  acquiredDetails: {
                    acquiredChannel: 'selfAssessment',
                    competencyLevelId,
                    // effectiveDate: "2023-02-09 9:46:12",
                    additionalParams: {
                      competencyName: competency_meta_data.competencyName,
                      courseId: this.assesmentdata.generalData.collectionId,
                      ResourseId: this.assesmentdata.generalData.identifier,
                    },
                  },
                },
              ],
            },
          }
          this.quizService.updatePassbook(formatedData).subscribe(() => {
          })
          this.updateNextResourses()
        }
      },
      (_error: any) => {
        this.openSnackbar(this.translate.instant("SUBMIT_ERR"))
        this.fetchingResultsStatus = 'error'
      },
    )
  }

  getCompetencyId(data: any) {
    let id
    forEach(data, (item: any) => {
      if (item.identifier === this.assesmentdata.generalData.identifier) {
        id = item.competencyId.toString()
      }
    })
    return id
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
        this.questionAnswerHash[answer.questionId] ?? []
      if (
        answer.questionType === 'fitb' &&
        this.questionAnswerHash[answer.questionId] &&
        this.questionAnswerHash[answer.questionId][0]
      ) {
        selectedOptions =
          this.questionAnswerHash[answer.questionId][0].split(',') ?? []
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
              const option = correctMtfOptions[(b.slice(-1) as number) - 1] ?? { match: '' }
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

  updateNextResourses() {
    const realTimeProgressRequest = {
      content_type: 'Resource',
      current: ['0'],
      max_size: 0,
      mime_type: NsContent.EMimeTypes.APPLICATION_JSON,
      user_id_type: 'uuid',
    }
    this.playerStateService.playerState.pipe(first(), takeUntil(this.unsubscribe)).subscribe((data: any) => {
      if (!isNull(data.nextResource)) {
        // **CRITICAL**: Fire-and-forget pattern - do not read/parse API response
        // Send telemetry and changeMessage with pre-calculated data like video player does
        this.viewerSvc.realTimeProgressUpdateV3(data.nextContentId, realTimeProgressRequest, this.assesmentdata.generalData.collectionId, this.route.snapshot.queryParams.batchId).subscribe(
          () => {
            // Success - send telemetry and message with pre-calculated data (don't parse response)
            const messageData = {
              contentList: [{
                contentId: data.nextContentId,
                completionPercentage: 0,
                status: 0,
              }],
              type: 'application/json',
            }
            this.viewerSvc.generateInteractTelemetry('progress-update-success', {
              contentId: data.nextContentId,
              completionPercentage: 0,
              status: 0,
              mimeType: 'application/json',
              batchId: this.route.snapshot.queryParams.batchId || '',
            })
            this.contentSvc.changeMessage(messageData)
          },
          error => { this.logger.warn('Next resource progress update failed:', error) }
        )
      }
    })
  }
  nextQuestion() {
    // tslint:disable-next-line:max-line-length
    this.generateInteractTelemetry(
      "next",
      this.assesmentdata.questions.questions[
      this.questionAnswerHash["qslideIndex"]
      ]
    )
    if (this.assesmentdata.questions.questions[this.questionAnswerHash['qslideIndex']] && this.assesmentdata.questions.questions[this.questionAnswerHash['qslideIndex']].questionType === 'mtf') {
      const submitQuizJson = JSON.parse(JSON.stringify(this.assesmentdata.questions))
      let userAnswer: any = {}
      userAnswer = this.quizService.checkMtfAnswer(submitQuizJson, this.questionAnswerHash)
      this.questionAnswerHash[userAnswer.questionId] = userAnswer.answer
    }
    this.disableNext = true
    this.progressbarValue += 100 / this.totalQuestion
    if (
      this.quizService.questionState.active_slide_index
      === (this.quizService.questionState.slides.length - 1)) {
      this.disableNext = true
      // this.quizService.questionState.active_slide_index += 1
      this.showSubmit = true
      this.proceedToSubmit()
      this.updateQuestionType(false)

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
    // if (this.assesmentdata.questions.questions[this.questionAnswerHash['qslideIndex']] && this.assesmentdata.questions.questions[this.questionAnswerHash['qslideIndex']].questionType === 'mtf') {
    //   const submitQuizJson = JSON.parse(JSON.stringify(this.assesmentdata.questions))
    //   let userAnswer: any = {}
    //   userAnswer = this.quizService.checkMtfAnswer(submitQuizJson, this.questionAnswerHash)
    //   this.questionAnswerHash[userAnswer.questionId] = userAnswer.answer
    // }

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
    if (this.disableNext === true) {
      this.disableNext = false
    }
    this.diablePrevious = true
    this.generateInteractTelemetry("back")
    this.progressbarValue -= 100 / this.totalQuestion
    if (this.quizService.questionState.active_slide_index === 0) {
      return
    }

    // if (
    //   this.quizService.questionState.active_slide_index
    //   === (this.quizService.questionState.slides.length - 1)) {
    //   this.diablePrevious = false
    //   this.showSubmit = false
    //   this.proceedToSubmit()
    // }
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
