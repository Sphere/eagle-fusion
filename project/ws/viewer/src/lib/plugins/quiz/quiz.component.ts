/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import {
  Component,
  ElementRef,
  Input,
  OnChanges, OnDestroy,
  QueryList,
  SimpleChanges,
  ViewChild, ViewChildren,
} from '@angular/core'
import { Location } from '@angular/common'
import { MatDialog } from '@angular/material/dialog'
import { MatSidenav } from '@angular/material/sidenav'
import { interval, Subject, Subscription } from 'rxjs'
import { map, takeUntil, first } from 'rxjs/operators'
import { NSQuiz } from './quiz.model'
import { QuestionComponent } from './components/question/question.component'
import { SubmitQuizDialogComponent } from './components/submit-quiz-dialog/submit-quiz-dialog.component'
import { OnConnectionBindInfo } from 'jsplumb'
import { QuizService } from './quiz.service'
import { EventService } from '../../../../../../../library/ws-widget/utils/src/public-api'
import { ViewerUtilService } from './../../viewer-util.service'
import { ActivatedRoute, Router } from '@angular/router'
import { AssesmentOverviewComponent } from './components/assesment-overview/assesment-overview.component'
import { AssesmentModalComponent } from './components/assesment-modal/assesment-modal.component'
import { AssesmentCloseModalComponent } from './components/assesment-close-modal/assesment-close-modal.component'
import { CloseQuizModalComponent } from './components/close-quiz-modal/close-quiz-modal.component'
import { get, isNull } from 'lodash'
import { QuizModalComponent } from './components/quiz-modal/quiz-modal.component'
import { ViewerDataService } from '../../viewer-data.service'
import { PlayerStateService } from '../../player-state.service'
import { ConfirmmodalComponent } from './confirm-modal-component'
import { CongratulationsPopupComponent } from './components/congratulations-popup/congratulations-popup.component'
import {
  NsContent,
  WidgetContentService,
} from '@ws-widget/collection'
import {
  LoggerService,
  ConfigurationsService,
} from '@ws-widget/utils'
import moment from 'moment'
import _ from 'lodash'
import { HttpClient } from '@angular/common/http'
// import { SearchApiService } from '../../../../../app/src/lib/routes/search/apis/search-api.service'
@Component({
  standalone: false,
  selector: 'viewer-plugin-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],

})
export class QuizComponent implements OnChanges, OnDestroy {
  [x: string]: any

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
    passPercentage: 60,
  }
  @ViewChildren('questionsReference') questionsReference: QueryList<QuestionComponent> | null = null
  @ViewChild('sidenav', { static: false }) sideNav: MatSidenav | null = null
  @ViewChild('submitModal', { static: false }) submitModal: ElementRef | null = null
  currentQuestionIndex = 0
  currentTheme = ''
  fetchingResultsStatus: NSQuiz.FetchStatus = 'none'
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
  public dialogOverview: any
  public dialogAssesment: any
  public dialogQuiz: any
  showCompletionMsg = false
  enrolledCourse: any
  castResourceSubscribe: any
  // **CRITICAL**: Store assessment progress to avoid redundant fetches
  private assessmentCurrentProgress: any = null
  /*
* to unsubscribe the observable
*/
  public unsubscribe = new Subject<void>()
  isAsha = false
  private readonly isAshaSubscription: Subscription
  private readonly isCurrentcardDataSubscribe: Subscription
  constructor(
    private readonly events: EventService,
    public dialog: MatDialog,
    private readonly quizSvc: QuizService,
    private readonly viewerSvc: ViewerUtilService,
    public route: ActivatedRoute,
    public location: Location,
    public viewerDataSvc: ViewerDataService,
    public playerStateService: PlayerStateService,
    public router: Router,
    private readonly contentSvc: WidgetContentService,
    private readonly loggerSvc: LoggerService,
    private readonly configSvc: ConfigurationsService,
    private readonly http: HttpClient,
    private readonly viewSvc: ViewerUtilService
  ) {

  }

  openOverviewDialog() {
    let overviewData: any = {}
    overviewData = {
      learningObjective: this.learningObjective,
      complexityLevel: this.complexityLevel,
      duration: this.duration,
      timeLimit: this.quizJson?.timeLimit,
      noOfQuestions: this.quizJson?.questions.length,
      progressStatus: this.progressStatus,
      isNqocnContent: this.isNqocnContent,
      isAssessment: get(this.quizJson, 'isAssessment'),
      subtitle: this.name,
      passPercentage: (this.quizJson && this.quizJson.hasOwnProperty('passPercentage')) ? this.quizJson?.passPercentage : 60,
    }
    if (!this.dialogOverview) {
      this.dialog.closeAll()
      this.dialogOverview = this.dialog.open(AssesmentOverviewComponent, {
        width: '542px',
        maxWidth: '95vw',
        panelClass: 'overview-modal',
        backdropClass: 'overview-backdrop',
        disableClose: true,
        data: overviewData,
      })

      this.dialogOverview.afterClosed().subscribe((result: any) => {
        this.dialogOverview = null
        this.handleOverviewDialogClose(result)
      })
    }
  }

  private async handleOverviewDialogClose(result: any): Promise<void> {
    if (result.event !== 'close-overview') {
      let res = await this.transformQuiz(this.artifactUrl)
      this.quizJson.questions = res.questions
      if (get(this.quizJson, 'isAssessment')) {
        this.openAssesmentDialog()
      } else {
        this.openQuizDialog()
      }
      return
    }
    if (result.competency) {
      this.router.navigate([`/app/user/competency`])
      return
    }
    if (result.asha) {
      this.router.navigate([`page/home`])
      return
    }
    this.navigateAfterOverviewClose()
  }

  private navigateAfterOverviewClose(): void {
    this.playerStateService.playerState.pipe(first(), takeUntil(this.unsubscribe)).subscribe((data: any) => {
      if (isNull(data.nextResource)) {
        this.navigateToCourseOverview()
        return
      }
      if (!this.viewerDataSvc.gatingEnabled) {
        this.router.navigate([data.nextResource], { queryParamsHandling: 'preserve' })
        return
      }
      if (data.currentCompletionPercentage === 100) {
        this.router.navigate([data.nextResource], { queryParamsHandling: 'preserve' })
      } else {
        this.navigateToCourseOverview()
      }
    })
  }
  private async transformQuiz(url: string): Promise<NSQuiz.IQuiz> {
    const artifactUrl = this.viewSvc.getCompetencyAuthoringUrl(url.split('/content')[1])
    let quizJSON: NSQuiz.IQuiz = await this.http
      .get<any>(artifactUrl || '')
      .toPromise()
      .catch((_err: any) => {
      })
    if (quizJSON && quizJSON.questions) {
      quizJSON.questions.forEach((question: NSQuiz.IQuestion) => {
        if (question.multiSelection && question.questionType === undefined) {
          question.questionType = 'mcq-mca'
        } else if (!question.multiSelection && question.questionType === undefined) {
          question.questionType = 'mcq-sca'
        }
      })
    }
    return quizJSON
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
    if (this.viewState === 'initial') {
      setTimeout(() => {
        this.openOverviewDialog()
      }, 500)
    }
    if (this.castResourceSubscribe) {
      this.castResourceSubscribe.unsubscribe()
    }
    this.castResourceSubscribe = this.viewerSvc.castResource.subscribe((content: any) => {
      setTimeout(() => {
        if (content) {
          if (content.type === 'Assessment') {
            this.viewState = 'initial'
          }
          if (content.openOverviewDialog) {
            this.openOverviewDialog()
          }
        }
      }, 0)
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
    if (this.castResourceSubscribe) {
      this.castResourceSubscribe.unsubscribe()
    }
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe()
    }
    if (this.telemetrySubscription) {
      this.telemetrySubscription.unsubscribe()
    }
    this.unsubscribe.complete()

    this.startTime = 0
    this.timeLeft = 0

    if (this.isAshaSubscription) {
      this.isAshaSubscription.unsubscribe()
    }

    if (this.isCurrentcardDataSubscribe) {
      this.isCurrentcardDataSubscribe.unsubscribe()
    }
  }

  openCongratulationPopup(): Promise<boolean> {
    const dialogRef = this.dialog.open(CongratulationsPopupComponent, {
      panelClass: 'congratulations-dialog',
      data: { collectionId: this.collectionId },
    })
    return dialogRef.afterClosed().toPromise().then((result: any) => {
      return !!result?.completed
    })
  }

  openAssesmentDialog() {
    // **CRITICAL**: Fetch current progress before opening modal
    let userId = ''
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || ''
    }
    const batchId = this.route.snapshot.queryParams.batchId

    const req: any = {
      request: {
        userId,
        batchId: batchId || undefined,
        courseId: this.collectionId,
        contentIds: [this.identifier],
        fields: ['progressdetails'],
      },
    }

    this.contentSvc.fetchContentHistoryV2(req).subscribe(
      (data: any) => {
        const currentProgress = data?.result?.contentList?.find((item: any) =>
          item.contentId === this.identifier
        )
        // **CRITICAL**: Store the progress for use in close handler to avoid redundant fetch
        this.assessmentCurrentProgress = currentProgress || null
        this.dialogAssesment = this.dialog.open(AssesmentModalComponent, {
          panelClass: 'assesment-modal',
          disableClose: true,
          data: {
            questions: this.quizJson,
            generalData: {
              identifier: this.identifier,
              artifactUrl: this.artifactUrl,
              name: this.name,
              collectionId: this.collectionId,
              gating: this.viewerDataSvc.gatingEnabled,
              mimeType: this.viewerDataSvc?.resource?.mimeType,
              isCorrectAnswerPopUp: this.viewerDataSvc?.resource?.isCorrectAnswerPopUp || undefined,

            },
            // **CRITICAL**: Pass existing progress data to modal so it doesn't reset completed assessments
            currentProgress: this.assessmentCurrentProgress,
          },
        })
        this.handleAssesmentDialogClose()
      },
      error => {
        this.loggerSvc.warn('Failed to fetch progress before opening assessment:', error)
        // On error, still open modal without progress data
        this.dialogAssesment = this.dialog.open(AssesmentModalComponent, {
          panelClass: 'assesment-modal',
          disableClose: true,
          data: {
            questions: this.quizJson,
            generalData: {
              identifier: this.identifier,
              artifactUrl: this.artifactUrl,
              name: this.name,
              collectionId: this.collectionId,
              gating: this.viewerDataSvc.gatingEnabled,
            },
            currentProgress: null,
          },
        })
        this.handleAssesmentDialogClose()
      }
    )
  }

  /**
   * Navigate after assessment completion based on gating and resources
   */
  private navigateAfterAssessment(): void {
    const isAsha = this.route.snapshot.queryParams.isAsha === 'true'
    this.playerStateService.playerState.pipe(first(), takeUntil(this.unsubscribe)).subscribe((data: any) => {
      if (isNull(data.nextResource)) {
        this.handleLastResourceNavigation(data, isAsha)
        return
      }
      this.navigateToNextResource(data, isAsha)
    })
  }

  private handleLastResourceNavigation(data: any, isAsha: boolean): void {
    // ASHA course completion is surfaced by the TOC's complete-courses modal (opened
    // from the progress update just fired), which stays in the viewer — so don't route
    // to /app/toc here.
    if (isAsha) {
      return
    }
    // Last resource in the course. If this attempt completes the course, show the
    // completion congratulations (same flow as the quiz plugin / mobile app) before
    // routing to the course overview; otherwise route directly.
    this.handleCourseCompletionOrNavigate(data)
  }

  private navigateToNextResource(data: any, isAsha: boolean): void {
    if (!this.viewerDataSvc.gatingEnabled) {
      // No gating - always allow navigation to next resource
      this.router.navigate([data.nextResource], { queryParamsHandling: 'preserve' })
      return
    }
    // If gating is enabled, only navigate if passed (completion 100%)
    if (data.currentCompletionPercentage === 100) {
      this.router.navigate([data.nextResource], { queryParamsHandling: 'preserve' })
    } else if (!isAsha) {
      // Gating enabled but not completed - go to TOC overview (ASHA stays in viewer)
      this.navigateToCourseOverview()
    }
  }

  /**
   * On the last resource, mirror the quiz plugin / mobile app behaviour: if the course is
   * now complete, show the congratulations popup + confirmation modal and route to the
   * course overview on confirm. Otherwise (or on any failure) route directly.
   */
  private handleCourseCompletionOrNavigate(data: any): void {
    let userId = ''
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || ''
    }
    this.contentSvc.fetchUserBatchList(userId).subscribe(
      (courses: NsContent.ICourse[]) => this.handleBatchListForCourseCompletion(courses, data),
      (error: any) => {
        this.loggerSvc.error('CONTENT HISTORY FETCH ERROR >', error)
        this.navigateToCourseOverview()
      }
    )
  }

  private handleBatchListForCourseCompletion(courses: NsContent.ICourse[], data: any): void {
    if (courses && courses.length) {
      this.enrolledCourse = courses.find((course: any) => course.courseId === this.collectionId)
    }
    // Show the "recently completed" message only if the course was completed just now.
    if (this.enrolledCourse && this.enrolledCourse.completedOn) {
      const completedDuration = moment.duration(moment(new Date()).diff(moment(this.enrolledCourse.completedOn)))
      this.showCompletionMsg = completedDuration.asMinutes() <= 0.5
    } else {
      this.showCompletionMsg = false
    }
    const courseCompleted =
      (this.enrolledCourse && this.enrolledCourse.completionPercentage === 100) ||
      data.currentCompletionPercentage === 100
    if (courseCompleted && this.contentSvc.showConformation && this.dialog.openDialogs.length === 0) {
      this.showCourseCompletionPopup()
    } else {
      this.navigateToCourseOverview()
    }
  }

  private showCourseCompletionPopup(): void {
    this.openCongratulationPopup().then((isCompleted: boolean) => {
      if (!isCompleted) {
        this.navigateToCourseOverview()
        return
      }
      const confirmdialog = this.dialog.open(ConfirmmodalComponent, {
        width: '300px',
        height: '420px',
        panelClass: 'overview-modal',
        disableClose: true,
        data: { request: { courseId: this.collectionId }, message: 'Congratulations!, you have completed the course' },
      })
      confirmdialog.afterClosed().subscribe((res: any) => {
        if (res?.event === 'CONFIRMED' || res?.event === 'close-complete') {
          this.navigateToCourseOverview()
        }
      })
    })
  }

  private navigateToCourseOverview(): void {
    this.router.navigate([`/app/toc/${this.collectionId}/overview`], {
      queryParams: {
        primaryCategory: 'Course',
        batchId: this.route.snapshot.queryParams.batchId,
      },
    })
  }

  private handleAssesmentDialogClose() {
    this.dialogAssesment.afterClosed().subscribe((result: any) => {
      this.loggerSvc.log(result.event)
      if (result) {
        this.processAssesmentResult(result)
      }
    })
  }

  private processAssesmentResult(result: any): void {
    if (result.event === "NEXT_COMPETENCY" && result.competency) {
      this.nextCompetency()
    }
    if (result.event === "FAILED_COMPETENCY") {
      this.router.navigate([`/app/user/competency`])
    }
    if (result.event === "VIEW_COURSES") {
      this.viewCompetencyCourses(result)
    }

    if (result.event === "FAILED_ASHA") {
      this.router.navigate([`page/home`])
    }

    if (result.event === "VIEW_ASHA_COURSES") {
      this.navigateToAshaCourses(result)
    }

    if (result.event === "CLOSE") {
      this.handleAssesmentCloseEvent(result)
    }

    if (result.event === 'RETAKE_QUIZ') {
      this.openOverviewDialog()
    } else if (result.event === 'DONE' || result.event === 'DONE_ASHA') {
      this.handleAssessmentDone(result)
    }
  }

  private handleAssesmentCloseEvent(result: any): void {
    if (result.competency) {
      this.router.navigate([`/app/user/competency`])
    } else if (result.asha) {
      this.router.navigate([`page/home`])
    } else {
      this.closeBtnDialog()
    }
  }

  private handleAssessmentDone(result: any): void {
    const Id = this.identifier
    const collectionId = this.collectionId
    const batchId = this.route.snapshot.queryParams.batchId

    // **CRITICAL**: Check if user failed and only update if new result is better than previous
    const userResult = result.result || 0
    const passPercentage = result.passPercentage || 0
    const userFailed = userResult < passPercentage

    if (userFailed) {
      this.handleAssessmentFailed(Id, collectionId, batchId, userResult)
    } else {
      this.handleAssessmentPassed(Id, collectionId, batchId)
    }
  }

  private handleAssessmentFailed(Id: string, collectionId: string, batchId: string, userResult: number): void {
    // User failed - use stored progress from modal open to avoid redundant fetch
    const previousCompletion = this.assessmentCurrentProgress?.completionPercentage || 0

    // Update if: first attempt (previousCompletion === 0) OR new result is better than previous
    if (previousCompletion === 0 || userResult > previousCompletion) {
      const data2 = {
        current: userResult,
        max_size: 100,
        mime_type: "application/json",
        completionPercentage: userResult,
        status: userResult >= 100 ? 2 : 1,  // status 2 only if 100%, otherwise 1
      }
      this.viewerSvc.realTimeProgressUpdateV3(Id, data2, collectionId, batchId).subscribe(
        () => {
          const messageData = {
            contentList: [{
              contentId: Id,
              completionPercentage: userResult,
              status: userResult >= 100 ? 2 : 1,  // Consistent with API call
            }],
            type: 'assessment',
          }
          this.viewerSvc.generateInteractTelemetry('progress-update-success', {
            contentId: Id,
            completionPercentage: userResult,
            status: userResult >= 100 ? 2 : 1,  // Consistent with API call
            mimeType: 'assessment',
            batchId: batchId || '',
          })
          this.contentSvc.changeMessage(messageData)
          // **CRITICAL**: Navigate after failed attempt
          this.navigateAfterAssessment()
        },
        error => { this.loggerSvc.warn('Progress update failed:', error) }
      )
    } else {
      this.loggerSvc.log('Skipping progress update: New result not better than previous', { newResult: userResult, previousCompletion })
      // Still navigate even if we skip the update
      this.navigateAfterAssessment()
    }
  }

  private handleAssessmentPassed(Id: string, collectionId: string, batchId: string): void {
    // User passed - update to 100%
    const data2 = {
      current: 10,
      max_size: 10,
      mime_type: "application/json",
      completionPercentage: 100,
      status: 2,
    }
    // **CRITICAL**: Fire-and-forget pattern - do not read/parse API response
    // Send telemetry and changeMessage with pre-calculated data
    this.viewerSvc.realTimeProgressUpdateV3(Id, data2, collectionId, batchId).subscribe(
      () => {
        const messageData = {
          contentList: [{
            contentId: Id,
            completionPercentage: 100,
            status: 2,
          }],
          type: 'assessment',
        }
        this.viewerSvc.generateInteractTelemetry('progress-update-success', {
          contentId: Id,
          completionPercentage: 100,
          status: 2,
          mimeType: 'assessment',
          batchId: batchId || '',
        })
        this.contentSvc.changeMessage(messageData)
        // **CRITICAL**: Navigate after passing
        this.navigateAfterAssessment()
      },
      error => { this.loggerSvc.warn('Progress update failed:', error) }
    )
  }

  navigateToAshaCourses(data) {
    let currentData

    currentData = this.contentSvc.getAshaCardData()
    console.log("Is ASHA card:", currentData)

    if (data.competencyId && data.competencyLevel) {
      const identifier: any = this.getCourseId(
        data.competencyId,
        data.competencyLevel,
        currentData
      )

      this.contentSvc.getFilteredCourseSearchResults(identifier).subscribe(res => {
        console.log(res.result.content[0])
        const navigationdata = res.result.content[0]
        const batchId = navigationdata.batches[0].batchId

        const ashaData = {
          isAsha: true,
          userid: this.configSvc.userProfile.userId || "",
          batchid: batchId,
          contentid: navigationdata.identifier,
          competencylevel: data.competencyLevel,
          completionpercentage: 0,
          progress: "course",
          competencyid: data.competencyId,
          competencyName: data?.title,
        }

        this.contentSvc.setAshaData(ashaData)

        this.router.navigate(
          [`/app/toc/${navigationdata.identifier}/overview`],
          {
            queryParams: {
              primaryCategory: "course",
              batchId: batchId,
              competencyid: data.competencyId,
              levelId: data.competencyLevel,
              courseid: data.courseid,
              isAsha: true,
            },
          }
        )
      })
    }
  }

  getCourseId(
    competencyId: string,
    levelId: string,
    ashaData: any
  ): string | null {
    // Extract the language from the ashaData
    const language = ashaData.lang

    // Iterate over the levels in the ashaData
    for (const level of ashaData.levels) {
      // Check if the competencyId and levelId match
      if (
        level.competencyId.toString() == competencyId &&
        level.level == levelId
      ) {
        // Iterate over the courses in the matched level
        for (const course of level.course) {
          // Check if the course language matches the input language (ashaData.lang)
          if (course.lang == language) {
            return course.id // Return the matched course ID
          }
        }
      }
    }

    // If no match is found, return null
    return null
  }

  nextCompetency() {
    this.viewState = 'answer'
    this.playerStateService.playerState.pipe(first(), takeUntil(this.unsubscribe)).subscribe((data: any) => {
      if (isNull(data.nextResource)) {
        this.router.navigate([`/app/user/competency`])

      } else {
        // Just navigate. The route container resets isFetchingDataComplete, so the next
        // resource recreates the quiz plugin fresh, and that plugin opens its own overview
        // via ngOnChanges with the correct level data. Opening it from here — by resetting
        // viewState/dialogOverview or subscribing to the stale competencyAsessment$
        // (a BehaviorSubject still holding `true`, which fires immediately) — pops a second,
        // stale overview for the previous/completed level before navigation completes.
        this.router.navigate([data.nextResource], { queryParamsHandling: 'preserve' })
      }
      return
    })
  }

  viewCompetencyCourses(data: any) {
    if (data.competencyId && data.competencyLevel) {
      this.router.navigate(['/app/search'], {
        queryParams: {
          q: [
            `${data.competencyId}-${data.competencyLevel}`,
          ], competency: true,
        },
        queryParamsHandling: 'merge',
      })
    }
  }

  /*open quiz dialog*/
  openQuizDialog() {
    // **CRITICAL**: Fetch current progress before opening modal
    let userId = ''
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || ''
    }
    const batchId = this.route.snapshot.queryParams.batchId

    const req: any = {
      request: {
        userId,
        batchId: batchId || undefined,
        courseId: this.collectionId,
        contentIds: [this.identifier],
        fields: ['progressdetails'],
      },
    }

    this.contentSvc.fetchContentHistoryV2(req).subscribe(
      (data: any) => {
        const currentProgress = data?.result?.contentList?.find((item: any) =>
          item.contentId === this.identifier
        )
        this.dialogQuiz = this.dialog.open(QuizModalComponent, {
          panelClass: 'quiz-modal',
          disableClose: true,
          data: {
            questions: this.quizJson,
            generalData: {
              identifier: this.identifier,
              artifactUrl: this.artifactUrl,
              name: this.name,
              collectionId: this.collectionId,
              gating: this.viewerDataSvc.gatingEnabled,
            },
            // **CRITICAL**: Pass existing progress data to modal so it doesn't reset ongoing quizzes
            currentProgress: currentProgress || null,
          },
        })
        this.handleQuizDialogClose()
      },
      error => {
        this.loggerSvc.warn('Failed to fetch progress before opening quiz:', error)
        // On error, still open modal without progress data
        this.dialogQuiz = this.dialog.open(QuizModalComponent, {
          panelClass: 'quiz-modal',
          disableClose: true,
          data: {
            questions: this.quizJson,
            generalData: {
              identifier: this.identifier,
              artifactUrl: this.artifactUrl,
              name: this.name,
              collectionId: this.collectionId,
              gating: this.viewerDataSvc.gatingEnabled,
            },
            currentProgress: null,
          },
        })
        this.handleQuizDialogClose()
      }
    )
  }

  private handleQuizDialogClose() {
    this.dialogQuiz.afterClosed().subscribe((result: any) => {
      this.loggerSvc.log(result, 'res')
      if (result) {
        if (result.event === 'CLOSE') {
          this.closeQuizBtnDialog(result.event)
        }

        if (result.event === 'RETAKE_QUIZ') {
          this.closeQuizBtnDialog(result.event)
        } else if (result.event === 'DONE' || result.event === 'DONE_ASHA') {
          this.handleQuizDone()
        }
      }
    })
  }

  private handleQuizDone(): void {
    const Id = this.identifier
    const collectionId = this.collectionId
    const batchId = this.route.snapshot.queryParams.batchId

    this.updateQuizProgressOnDone(Id, collectionId, batchId)

    let userId
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || ''
    }
    this.contentSvc.fetchUserBatchList(userId).subscribe(
      (courses: NsContent.ICourse[]) => { this.onQuizUserBatchListLoaded(courses) },
      (error: any) => {
        this.loggerSvc.error('CONTENT HISTORY FETCH ERROR >', error)
      },
    )
  }

  private updateQuizProgressOnDone(Id: string, collectionId: string, batchId: string): void {
    const data2 = {
      current: 10,
      max_size: 10,
      mime_type: "application/json",
      completionPercentage: 100,
      status: 2,
    }
    // **CRITICAL**: Fire-and-forget pattern - do not read/parse API response
    // Send telemetry and changeMessage with pre-calculated data
    this.viewerSvc.realTimeProgressUpdateV3(Id, data2, collectionId, batchId).subscribe(
      () => {
        const messageData = {
          contentList: [{
            contentId: Id,
            completionPercentage: 100,
            status: 2,
          }],
          type: 'quiz',
        }
        this.viewerSvc.generateInteractTelemetry('progress-update-success', {
          contentId: Id,
          completionPercentage: 100,
          status: 2,
          mimeType: 'quiz',
          batchId: batchId || '',
        })
        this.contentSvc.changeMessage(messageData)
      },
      error => { this.loggerSvc.warn('Progress update failed:', error) }
    )
  }

  private onQuizUserBatchListLoaded(courses: NsContent.ICourse[]): void {
    if (!this.collectionId) {
      return
    }
    this.findQuizEnrolledCourse(courses)
    // tslint:disable-next-line:no-console
    this.loggerSvc.log(this.enrolledCourse)
    this.updateQuizShowCompletionMsg()
    this.playerStateService.playerState.pipe(first(), takeUntil(this.unsubscribe)).subscribe((data: any) => {
      this.handleQuizPlayerState(data)
    })
  }

  private findQuizEnrolledCourse(courses: NsContent.ICourse[]): void {
    if (courses && courses.length) {
      this.enrolledCourse = courses.find(course => {
        const identifier = this.collectionId || ''
        if (course.courseId !== identifier) {
          return undefined
        }
        return course
      })
    }
  }

  private updateQuizShowCompletionMsg(): void {
    // Guard first: enrolledCourse.completedOn was being read before this check, throwing
    // whenever the current collectionId isn't found in the user's batch list — that silently
    // killed this subscribe callback and blocked all navigation/completion logic after it.
    if (!this.enrolledCourse || !this.enrolledCourse.completedOn) {
      this.showCompletionMsg = false
      return
    }
    const customerDate = moment(this.enrolledCourse.completedOn)
    const dateNow = moment(new Date())
    const duration = moment.duration(dateNow.diff(customerDate))
    this.showCompletionMsg = duration.asMinutes() <= 0.5
  }

  private handleQuizPlayerState(data: any): void {
    if (isNull(data.nextResource)) {
      // tslint:disable-next-line
      if (this.enrolledCourse && this.enrolledCourse!.completionPercentage === 100
        && this.contentSvc.showConformation) {
        const isDialogOpen = this.dialog.openDialogs.length > 0
        if (!isDialogOpen) {
          this.showQuizCompletionCongrats(data)
        }
      }
    } else {
      this.router.navigate([data.nextResource], { queryParamsHandling: 'preserve' })
    }
    return
  }

  private showQuizCompletionCongrats(data: any): void {
    this.openCongratulationPopup().then(isCompleted => {
      if (isCompleted) {
        const confirmdialog = this.dialog.open(ConfirmmodalComponent, {
          width: '300px',
          height: '420px',
          panelClass: 'overview-modal',
          disableClose: true,
          data: { request: data, message: 'Congratulations!, you have completed the course' },
        })

        confirmdialog.afterClosed().subscribe((res: any) => {
          if (res.event === 'CONFIRMED') {
            this.router.navigate([`/app/toc/${this.collectionId}/overview`], {
              queryParams: {
                primaryCategory: 'Course',
                batchId: this.route.snapshot.queryParams.batchId,
              },
            })
          }
        })
      }
    })
  }
  closeQuizBtnDialog(event: string) {
    const dialogRef = this.dialog.open(CloseQuizModalComponent, {
      panelClass: 'assesment-close-modal',
      disableClose: true,
      data: {
        type: event,
      },
    })
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result.event === 'CLOSE') {
        dialogRef.close()
        this.dialog.closeAll()
        this.playerStateService.playerState.pipe(first(), takeUntil(this.unsubscribe)).subscribe((data: any) => {
          if (isNull(data.nextResource)) {
            this.router.navigate([`/app/toc/${this.collectionId}/overview`], {
              queryParams: {
                primaryCategory: 'Course',
                batchId: this.route.snapshot.queryParams.batchId,
              },
            })
          } else if (!isNull(data.prevResource)) {
            this.router.navigate([data.prevResource], { queryParamsHandling: 'preserve' })
          }
          return
        })
      } else if (result.event === 'NO') {
        this.openQuizDialog()
      } else if (result.event === 'RETAKE_QUIZ') {
        this.openOverviewDialog()
      }
    })
  }
  closeBtnDialog() {
    const dialogRef = this.dialog.open(AssesmentCloseModalComponent, {
      panelClass: 'assesment-close-modal',
      disableClose: true,
    })
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result.event === 'CLOSE') {
        dialogRef.close()
        this.dialog.closeAll()
        this.playerStateService.playerState.pipe(first(), takeUntil(this.unsubscribe)).subscribe((data: any) => {
          if (isNull(data.nextResource)) {
            this.router.navigate([`/app/toc/${this.collectionId}/overview`], {
              queryParams: {
                primaryCategory: 'Course',
                batchId: this.route.snapshot.queryParams.batchId,
              },
            })
          } else if (!isNull(data.prevResource)) {
            this.router.navigate([data.prevResource], { queryParamsHandling: 'preserve' })
          }

          return
        })
      } else if (result.event === 'NO') {
        this.openOverviewDialog()
      }
    })
  }

  overViewed(event: NSQuiz.TUserSelectionType) {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe()
    }
    if (event === 'start') {
      this.startQuiz()
    } else if (event === 'skip') {
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
  reTakeQuiz() {
    this.startQuiz()
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
    sanitizedRequestData['artifactUrl'] = this.artifactUrl
    sanitizedRequestData['contentId'] = this.identifier
    sanitizedRequestData['courseId'] = this.collectionId
    sanitizedRequestData['batchId'] = this.route.snapshot.queryParams.batchId
    sanitizedRequestData['userId'] = localStorage.getItem('userUUID')
    this.quizSvc.submitQuizV2(sanitizedRequestData).subscribe(
      (res: NSQuiz.IQuizSubmitResponse) => {
        window.scrollTo(0, 0)
        if (this.quizJson.isAssessment) {
          this.isIdeal = true
        }
        this.fetchingResultsStatus = 'done'
        this.numCorrectAnswers = res.correct
        this.numIncorrectAnswers = res.inCorrect
        this.numUnanswered = res.blank
        this.passPercentage = this.collectionId === 'lex_auth_0131241730330624000' ? 70 : res.passPercent // NQOCN Course ID
        this.result = res.result
        if (this.result >= 0) {
          this.isCompleted = true
          const Id = this.identifier
          const collectionId = this.collectionId
          const batchId = this.route.snapshot.queryParams.batchId

          const data2 = {
            current: 10,
            max_size: 10,
            mime_type: "application/json",
            completionPercentage: 100,
            status: 2,
          }
          // **CRITICAL**: Fire-and-forget pattern - do not read/parse API response
          // Send telemetry and changeMessage with pre-calculated data
          this.viewerSvc.realTimeProgressUpdateV3(Id, data2, collectionId, batchId).subscribe(
            () => {
              const messageData = {
                contentList: [{
                  contentId: Id,
                  completionPercentage: 100,
                  status: 2,
                }],
                type: 'quiz',
              }
              this.viewerSvc.generateInteractTelemetry('progress-update-success', {
                contentId: Id,
                completionPercentage: 100,
                status: 2,
                mimeType: 'quiz',
                batchId: batchId || '',
              })
              this.contentSvc.changeMessage(messageData)
            },
            error => { this.loggerSvc.warn('Progress update failed:', error) }
          )
        }
      },
      (_error: any) => {
        this.fetchingResultsStatus = 'error'
      },
    )
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
    this.numCorrectAnswers = 0
    this.numIncorrectAnswers = 0
    correctAnswers.forEach(answer => {
      const selectedOptions: any =
        this.questionAnswerHash[answer.questionId] || []
      if (
        answer.questionType === 'fitb' &&
        this.questionAnswerHash[answer.questionId] &&
        this.questionAnswerHash[answer.questionId][0]
      ) {
        this.evaluateFitbAnswer(answer)
      } else if (answer.questionType === 'mtf') {
        this.evaluateMtfAnswer(answer, selectedOptions)
      } else {
        this.evaluateDefaultAnswer(answer.correctOptions, selectedOptions)
      }
    })
    this.numUnanswered =
      this.quizJson.questions.length -
      this.numCorrectAnswers -
      this.numIncorrectAnswers
  }

  private evaluateFitbAnswer(answer: any): void {
    const correctOptions = answer.correctOptions
    const selectedOptions =
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
  }

  private evaluateMtfAnswer(answer: any, selectedOptions: any): void {
    const correctMtfOptions = answer.correctMtfOptions
    let unTouched = false
    let correctFlag = true
    if (selectedOptions.length < 1 || selectedOptions[0].length < 1) {
      unTouched = true
    } else if (selectedOptions[0].length < correctMtfOptions.length) {
      correctFlag = false
    }
    if (selectedOptions && selectedOptions[0]) {
      correctFlag = this.paintMtfConnections(selectedOptions[0], correctMtfOptions, correctFlag)
    }
    if (correctFlag && !unTouched) {
      this.numCorrectAnswers += 1
    } else if (!unTouched) {
      this.numIncorrectAnswers += 1
    }
  }

  private paintMtfConnections(connections: any[], correctMtfOptions: any, correctFlag: boolean): boolean {
    let flag = correctFlag
    connections.forEach(element => {
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
          flag = false
          this.setBorderColor(element, '#f44336')
        }
      }
    })
    return flag
  }

  private evaluateDefaultAnswer(correctOptions: any, selectedOptions: any): void {
    if (
      correctOptions.sort((a: any, b: any) => a.localeCompare(b)).join(',') === selectedOptions.sort((a: any, b: any) => a.localeCompare(b)).join(',')
    ) {
      this.numCorrectAnswers += 1
    } else if (selectedOptions.length > 0) {
      this.numIncorrectAnswers += 1
    }
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
        "quiz",
        {
          id: optionId,
          type: 'quiz',
          version: '',
          rollup: {},
        },
        {
          values: [{
            optionId,
          }],
        }
      )
    } else {
      this.events.raiseInteractTelemetry(action, event, 'quiz', {
        id: this.identifier,
        type: 'quiz',
        version: '',
        rollup: {},
      }, {
        values: [{
          contentId: this.identifier,
        }],
      })
    }
  }
}