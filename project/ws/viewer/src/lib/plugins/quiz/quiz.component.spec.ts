jest.mock('@ws-widget/collection', () => ({
  NsContent: { EMimeTypes: { APPLICATION_JSON: 'application/json' } },
  WidgetContentService: class {},
}))
jest.mock('@ws-widget/utils', () => ({
  LoggerService: class {},
  ConfigurationsService: class {},
}))

import { of, throwError, Subject } from 'rxjs'
import { QuizComponent } from './quiz.component'

describe('QuizComponent', () => {
  let component: QuizComponent
  let mockEvents: any
  let mockDialog: any
  let mockQuizSvc: any
  let mockViewerSvc: any
  let mockRoute: any
  let mockLocation: any
  let mockViewerDataSvc: any
  let mockPlayerStateService: any
  let mockRouter: any
  let mockContentSvc: any
  let mockLoggerSvc: any
  let mockConfigSvc: any

  beforeEach(() => {
    mockEvents = { raiseInteractTelemetry: jest.fn() }
    mockDialog = { open: jest.fn(), closeAll: jest.fn(), openDialogs: [] }
    mockQuizSvc = {
      createAssessmentSubmitRequest: jest.fn().mockReturnValue({}),
      sanitizeAssessmentSubmitRequest: jest.fn().mockReturnValue({}),
      submitQuizV2: jest.fn().mockReturnValue(of({ correct: 1, inCorrect: 0, blank: 0, passPercent: 60, result: 90 })),
    }
    mockViewerSvc = {
      castResource: new Subject(),
      realTimeProgressUpdateV3: jest.fn().mockReturnValue(of({})),
      generateInteractTelemetry: jest.fn(),
    }
    mockRoute = { snapshot: { queryParams: {} } }
    mockLocation = {}
    mockViewerDataSvc = { gatingEnabled: false, resource: { mimeType: 'application/json' } }
    mockPlayerStateService = { playerState: new Subject() }
    mockRouter = { navigate: jest.fn() }
    mockContentSvc = {
      fetchContentHistoryV2: jest.fn().mockReturnValue(of({ result: { contentList: [] } })),
      fetchUserBatchList: jest.fn().mockReturnValue(of([])),
      changeMessage: jest.fn(),
      showConformation: true,
      getAshaCardData: jest.fn().mockReturnValue({ lang: 'en', levels: [] }),
      getFilteredCourseSearchResults: jest.fn().mockReturnValue(of({ result: { content: [{ identifier: 'c2', batches: [{ batchId: 'b1' }] }] } })),
      setAshaData: jest.fn(),
    }
    mockLoggerSvc = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    mockConfigSvc = { userProfile: { userId: 'u1' } }

    component = new QuizComponent(
      mockEvents,
      mockDialog,
      mockQuizSvc,
      mockViewerSvc,
      mockRoute,
      mockLocation,
      mockViewerDataSvc,
      mockPlayerStateService,
      mockRouter,
      mockContentSvc,
      mockLoggerSvc,
      mockConfigSvc
    )
    component.identifier = 'id1'
    component.collectionId = 'c1'
    component.name = 'Quiz'
    component.quizJson = {
      timeLimit: 5,
      isAssessment: false,
      questions: [
        { questionId: 'q1', questionType: 'mcq-sca', options: [{ optionId: 'o1', isCorrect: true }], multiSelection: false },
        { questionId: 'q2', questionType: 'mcq-sca', options: [{ optionId: 'o2', isCorrect: true }], multiSelection: false },
      ],
    } as any
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('openOverviewDialog should open AssesmentOverviewComponent and navigate to competency on close', () => {
    const afterClosed = of({ event: 'close-overview', competency: 'true' })
    mockDialog.open.mockReturnValue({ afterClosed: () => afterClosed })
    component.openOverviewDialog()
    expect(mockDialog.open).toHaveBeenCalled()
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/user/competency'])
  })

  it('openOverviewDialog should navigate to asha page/home on close-overview with asha', () => {
    const afterClosed = of({ event: 'close-overview', asha: true })
    mockDialog.open.mockReturnValue({ afterClosed: () => afterClosed })
    component.openOverviewDialog()
    expect(mockRouter.navigate).toHaveBeenCalledWith(['page/home'])
  })

  it('openOverviewDialog should open assesment dialog when quiz isAssessment and event not close-overview', () => {
    component.quizJson.isAssessment = true
    const afterClosed = of({ event: 'other' })
    mockDialog.open.mockReturnValue({ afterClosed: () => afterClosed })
    const spy = jest.spyOn(component, 'openAssesmentDialog').mockImplementation()
    component.openOverviewDialog()
    expect(spy).toHaveBeenCalled()
  })

  it('openOverviewDialog should open quiz dialog when not assessment', () => {
    component.quizJson.isAssessment = false
    const afterClosed = of({ event: 'other' })
    mockDialog.open.mockReturnValue({ afterClosed: () => afterClosed })
    const spy = jest.spyOn(component, 'openQuizDialog').mockImplementation()
    component.openOverviewDialog()
    expect(spy).toHaveBeenCalled()
  })

  it('scroll should scroll question into view', () => {
    const el = { scrollIntoView: jest.fn() }
    jest.spyOn(document, 'getElementById').mockReturnValue(el as any)
    component.sidenavOpenDefault = true
    component.scroll(0)
    expect(el.scrollIntoView).toHaveBeenCalled()
  })

  it('ngOnChanges should open overview dialog after timeout when viewState initial', () => {
    jest.useFakeTimers()
    const spy = jest.spyOn(component, 'openOverviewDialog').mockImplementation()
    component.viewState = 'initial'
    component.ngOnChanges({})
    jest.advanceTimersByTime(500)
    expect(spy).toHaveBeenCalled()
    jest.useRealTimers()
  })

  it('ngOnChanges should subscribe to castResource and open overview dialog on flag', () => {
    jest.useFakeTimers()
    const spy = jest.spyOn(component, 'openOverviewDialog').mockImplementation()
    component.ngOnChanges({})
    mockViewerSvc.castResource.next({ type: 'Assessment', openOverviewDialog: true })
    jest.advanceTimersByTime(10)
    expect(component.viewState).toBe('initial')
    expect(spy).toHaveBeenCalled()
    jest.useRealTimers()
  })

  it('ngOnChanges should multiply timeLimit by 1000 for quiz change key', () => {
    component.quizJson.timeLimit = 5
    component.ngOnChanges({ quiz: {} as any })
    expect(component.quizJson.timeLimit).toBe(5000)
  })

  it('ngOnDestroy should unsubscribe all subscriptions', () => {
    component.castResourceSubscribe = { unsubscribe: jest.fn() }
    component.timerSubscription = { unsubscribe: jest.fn() } as any
    component.telemetrySubscription = { unsubscribe: jest.fn() } as any
    component['isAshaSubscription'] = { unsubscribe: jest.fn() } as any
    component['isCurrentcardDataSubscribe'] = { unsubscribe: jest.fn() } as any
    component.ngOnDestroy()
    expect(component.timeLeft).toBe(0)
    expect(component.startTime).toBe(0)
  })

  it('openCongratulationPopup should resolve true when result completed', async () => {
    mockDialog.open.mockReturnValue({ afterClosed: () => of({ completed: true }) })
    const result = await component.openCongratulationPopup()
    expect(result).toBe(true)
  })

  it('openCongratulationPopup should resolve false when no result', async () => {
    mockDialog.open.mockReturnValue({ afterClosed: () => of(undefined) })
    const result = await component.openCongratulationPopup()
    expect(result).toBe(false)
  })

  it('openAssesmentDialog should open modal with fetched progress', () => {
    mockContentSvc.fetchContentHistoryV2.mockReturnValue(of({ result: { contentList: [{ contentId: 'id1', completionPercentage: 30 }] } }))
    mockDialog.open.mockReturnValue({ afterClosed: () => of(undefined) })
    component.openAssesmentDialog()
    expect(mockDialog.open).toHaveBeenCalled()
  })

  it('openAssesmentDialog should open modal without progress on fetch error', () => {
    mockContentSvc.fetchContentHistoryV2.mockReturnValue(throwError(() => new Error('fail')))
    mockDialog.open.mockReturnValue({ afterClosed: () => of(undefined) })
    component.openAssesmentDialog()
    expect(mockLoggerSvc.warn).toHaveBeenCalled()
    expect(mockDialog.open).toHaveBeenCalled()
  })

  it('navigateToAshaCourses should navigate with resolved course id', () => {
    mockContentSvc.getAshaCardData.mockReturnValue({
      lang: 'en',
      levels: [{ competencyId: 5, level: 'L1', course: [{ lang: 'en', id: 'course1' }] }],
    })
    component['navigateToAshaCourses']({ competencyId: '5', competencyLevel: 'L1', courseid: 'c9', title: 'T' })
    expect(mockContentSvc.getFilteredCourseSearchResults).toHaveBeenCalledWith('course1')
    expect(mockRouter.navigate).toHaveBeenCalled()
  })

  it('getCourseId should return matched course id', () => {
    const ashaData = { lang: 'en', levels: [{ competencyId: 5, level: 'L1', course: [{ lang: 'en', id: 'course1' }] }] }
    const result = component.getCourseId('5', 'L1', ashaData)
    expect(result).toBe('course1')
  })

  it('getCourseId should return null when no match', () => {
    const ashaData = { lang: 'en', levels: [] }
    const result = component.getCourseId('5', 'L1', ashaData)
    expect(result).toBeNull()
  })

  it('nextCompetency should navigate to competency page when no next resource', () => {
    component.nextCompetency()
    mockPlayerStateService.playerState.next({ nextResource: null })
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/user/competency'])
  })

  it('nextCompetency should navigate to next resource when available', () => {
    component.nextCompetency()
    mockPlayerStateService.playerState.next({ nextResource: '/next' })
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/next'], { queryParamsHandling: 'preserve' })
  })

  it('viewCompetencyCourses should navigate to search with query params', () => {
    component.viewCompetencyCourses({ competencyId: 'comp1', competencyLevel: 'lvl1' })
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/search'], expect.any(Object))
  })

  it('viewCompetencyCourses should not navigate without competencyId/level', () => {
    component.viewCompetencyCourses({})
    expect(mockRouter.navigate).not.toHaveBeenCalled()
  })

  it('openQuizDialog should open QuizModalComponent with fetched progress', () => {
    mockDialog.open.mockReturnValue({ afterClosed: () => of(undefined) })
    component.openQuizDialog()
    expect(mockDialog.open).toHaveBeenCalled()
  })

  it('openQuizDialog should open modal without progress on error', () => {
    mockContentSvc.fetchContentHistoryV2.mockReturnValue(throwError(() => new Error('fail')))
    mockDialog.open.mockReturnValue({ afterClosed: () => of(undefined) })
    component.openQuizDialog()
    expect(mockLoggerSvc.warn).toHaveBeenCalled()
  })

  it('closeQuizBtnDialog should navigate to toc overview when no next resource', () => {
    mockDialog.open.mockReturnValue({ close: jest.fn(), afterClosed: () => of({ event: 'CLOSE' }) })
    component.closeQuizBtnDialog('CLOSE')
    mockPlayerStateService.playerState.next({ nextResource: null, prevResource: null })
    expect(mockRouter.navigate).toHaveBeenCalledWith([`/app/toc/${component.collectionId}/overview`], expect.any(Object))
  })

  it('closeQuizBtnDialog should re-open quiz dialog on NO', () => {
    mockDialog.open.mockReturnValue({ afterClosed: () => of({ event: 'NO' }) })
    const spy = jest.spyOn(component, 'openQuizDialog').mockImplementation()
    component.closeQuizBtnDialog('CLOSE')
    expect(spy).toHaveBeenCalled()
  })

  it('closeQuizBtnDialog should reopen overview dialog on RETAKE_QUIZ', () => {
    mockDialog.open.mockReturnValue({ afterClosed: () => of({ event: 'RETAKE_QUIZ' }) })
    const spy = jest.spyOn(component, 'openOverviewDialog').mockImplementation()
    component.closeQuizBtnDialog('CLOSE')
    expect(spy).toHaveBeenCalled()
  })

  it('closeBtnDialog should navigate to prev resource when available', () => {
    mockDialog.open.mockReturnValue({ close: jest.fn(), afterClosed: () => of({ event: 'CLOSE' }) })
    component.closeBtnDialog()
    mockPlayerStateService.playerState.next({ nextResource: 'ignored', prevResource: '/prev' })
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/prev'], { queryParamsHandling: 'preserve' })
  })

  it('closeBtnDialog should reopen overview dialog on NO', () => {
    mockDialog.open.mockReturnValue({ afterClosed: () => of({ event: 'NO' }) })
    const spy = jest.spyOn(component, 'openOverviewDialog').mockImplementation()
    component.closeBtnDialog()
    expect(spy).toHaveBeenCalled()
  })

  it('overViewed should start quiz on start event', () => {
    const spy = jest.spyOn(component, 'startQuiz').mockImplementation()
    component.overViewed('start')
    expect(spy).toHaveBeenCalled()
  })

  it('overViewed should unsubscribe timer and do nothing on skip', () => {
    component.timerSubscription = { unsubscribe: jest.fn() } as any
    component.overViewed('skip')
    expect(component.timerSubscription.unsubscribe).toHaveBeenCalled()
  })

  it('startQuiz should initialize state and start timer', () => {
    jest.useFakeTimers()
    component.startQuiz()
    expect(component.viewState).toBe('attempt')
    jest.advanceTimersByTime(200)
    jest.useRealTimers()
  })

  it('startQuiz should auto submit when time runs out', () => {
    jest.useFakeTimers()
    component.quizJson.timeLimit = 0
    component.startTime = Date.now() - 1000
    const spy = jest.spyOn(component, 'submitQuiz').mockImplementation()
    component.startQuiz()
    jest.advanceTimersByTime(200)
    expect(spy).toHaveBeenCalled()
    jest.useRealTimers()
  })

  it('reTakeQuiz should call startQuiz', () => {
    const spy = jest.spyOn(component, 'startQuiz').mockImplementation()
    component.reTakeQuiz()
    expect(spy).toHaveBeenCalled()
  })

  it('fillSelectedItems should toggle multiSelection option', () => {
    const question: any = { questionId: 'q1', multiSelection: true }
    component.fillSelectedItems(question, 'o1')
    expect(component.questionAnswerHash['q1']).toEqual(['o1'])
    component.fillSelectedItems(question, 'o1')
    expect(component.questionAnswerHash['q1']).toBeUndefined()
  })

  it('fillSelectedItems should reset question references when viewState answer', () => {
    component.viewState = 'answer'
    const resetFn = jest.fn()
    component.questionsReference = [{ reset: resetFn }] as any
    component.fillSelectedItems({ questionId: 'q1', multiSelection: false } as any, 'o1')
    expect(resetFn).toHaveBeenCalled()
    expect(component.viewState).toBe('attempt')
  })

  it('proceedToSubmit should open submit dialog when timeLeft set and call submitQuiz on confirm', () => {
    component.timeLeft = 10
    component.questionAnswerHash = {}
    mockDialog.open.mockReturnValue({ afterClosed: () => of(true) })
    const spy = jest.spyOn(component, 'submitQuiz').mockImplementation()
    component.proceedToSubmit()
    expect(spy).toHaveBeenCalled()
  })

  it('proceedToSubmit should not open dialog when no timeLeft', () => {
    component.timeLeft = 0
    component.proceedToSubmit()
    expect(mockDialog.open).not.toHaveBeenCalled()
  })

  it('submitQuiz should submit and process response for non-assessment quiz', () => {
    component.quizJson.isAssessment = false
    component.questionAnswerHash = { q1: ['o1'] }
    component.submitQuiz()
    expect(component.viewState).toBe('review')
    expect(component.numCorrectAnswers).toBe(1)
    expect(component.isCompleted).toBe(true)
  })

  it('submitQuiz should set error status on submit failure', () => {
    mockQuizSvc.submitQuizV2.mockReturnValue(throwError(() => new Error('fail')))
    component.submitQuiz()
    expect(component.fetchingResultsStatus).toBe('error')
  })

  it('showAnswers should call show mtf and fitb answers and set viewState', () => {
    const mtfSpy = jest.fn()
    const fitbSpy = jest.fn()
    component.questionsReference = [{ matchShowAnswer: mtfSpy, functionChangeBlankBorder: fitbSpy }] as any
    component.showAnswers()
    expect(mtfSpy).toHaveBeenCalled()
    expect(fitbSpy).toHaveBeenCalled()
    expect(component.viewState).toBe('answer')
  })

  it('calculateResults should count correct/incorrect answers for mcq', () => {
    component.questionAnswerHash = { q1: ['o1'], q2: ['wrong'] }
    component.calculateResults()
    expect(component.numCorrectAnswers).toBe(1)
    expect(component.numIncorrectAnswers).toBe(1)
  })

  it('setBorderColor should set border color on source and target elements', () => {
    const source = document.createElement('div')
    source.id = 'src1'
    const target = document.createElement('div')
    target.id = 'tgt1'
    document.body.appendChild(source)
    document.body.appendChild(target)
    component.setBorderColor({ sourceId: 'src1', targetId: 'tgt1' } as any, '#fff')
    expect(source.style.borderColor).toBeTruthy()
    document.body.removeChild(source)
    document.body.removeChild(target)
  })

  it('isQuestionAttempted should return true when questionId present', () => {
    component.questionAnswerHash = { q1: ['o1'] }
    expect(component.isQuestionAttempted('q1')).toBe(true)
    expect(component.isQuestionAttempted('q2')).toBe(false)
  })

  it('isQuestionMarked / markQuestion should toggle marked state', () => {
    expect(component.isQuestionMarked('q1' as any)).toBe(false)
    component.markQuestion('q1' as any)
    expect(component.isQuestionMarked('q1' as any)).toBe(true)
    component.markQuestion('q1' as any)
    expect(component.isQuestionMarked('q1' as any)).toBe(false)
  })

  it('raiseTelemetry should raise telemetry with optionId', () => {
    component.raiseTelemetry('mark', 'o1', 'click')
    expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalled()
  })

  it('raiseTelemetry should raise telemetry without optionId', () => {
    component.raiseTelemetry('quiz', null, 'submit')
    expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalled()
  })
})
