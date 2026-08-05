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

  describe('navigateToCourseOverview', () => {
    it('should route to the toc overview with the current batch', () => {
      mockRoute.snapshot.queryParams = { batchId: 'b1' }
      component['navigateToCourseOverview']()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/toc/c1/overview'], {
        queryParams: { primaryCategory: 'Course', batchId: 'b1' },
      })
    })
  })

  describe('handleCourseCompletionOrNavigate', () => {
    it('should read the batch list for the signed-in user', () => {
      component['handleCourseCompletionOrNavigate']({ currentCompletionPercentage: 50 })
      expect(mockContentSvc.fetchUserBatchList).toHaveBeenCalledWith('u1')
    })

    it('should fall back to a blank user id when there is no profile', () => {
      mockConfigSvc.userProfile = null
      component['handleCourseCompletionOrNavigate']({ currentCompletionPercentage: 50 })
      expect(mockContentSvc.fetchUserBatchList).toHaveBeenCalledWith('')
    })

    it('should navigate to the overview when the batch list fails', () => {
      mockContentSvc.fetchUserBatchList.mockReturnValue(throwError(() => new Error('down')))
      component['handleCourseCompletionOrNavigate']({ currentCompletionPercentage: 50 })
      expect(mockLoggerSvc.error).toHaveBeenCalled()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/toc/c1/overview'], expect.anything())
    })
  })

  describe('handleBatchListForCourseCompletion', () => {
    it('should navigate to the overview for an incomplete course', () => {
      component['handleBatchListForCourseCompletion']([], { currentCompletionPercentage: 40 })
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/toc/c1/overview'], expect.anything())
      expect(component.showCompletionMsg).toBe(false)
    })

    it('should pick out the matching enrolment', () => {
      component['handleBatchListForCourseCompletion'](
        [{ courseId: 'other' }, { courseId: 'c1', completionPercentage: 40 }] as any,
        { currentCompletionPercentage: 40 },
      )
      expect(component.enrolledCourse.courseId).toBe('c1')
    })

    it('should flag a course completed within the last half minute', () => {
      component['handleBatchListForCourseCompletion'](
        [{ courseId: 'c1', completionPercentage: 40, completedOn: new Date().toISOString() }] as any,
        { currentCompletionPercentage: 40 },
      )
      expect(component.showCompletionMsg).toBe(true)
    })

    it('should not flag a course completed a while ago', () => {
      jest.spyOn(component as any, 'showCourseCompletionPopup').mockImplementation(() => { })
      const anHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      component['handleBatchListForCourseCompletion'](
        [{ courseId: 'c1', completionPercentage: 100, completedOn: anHourAgo }] as any,
        { currentCompletionPercentage: 40 },
      )
      expect(component.showCompletionMsg).toBe(false)
    })

    it('should open the completion popup when the enrolment reads 100%', () => {
      const popupSpy = jest.spyOn(component as any, 'showCourseCompletionPopup').mockImplementation(() => { })
      component['handleBatchListForCourseCompletion'](
        [{ courseId: 'c1', completionPercentage: 100 }] as any,
        { currentCompletionPercentage: 40 },
      )
      expect(popupSpy).toHaveBeenCalled()
    })

    it('should open the completion popup when the current attempt reaches 100%', () => {
      const popupSpy = jest.spyOn(component as any, 'showCourseCompletionPopup').mockImplementation(() => { })
      component['handleBatchListForCourseCompletion']([], { currentCompletionPercentage: 100 })
      expect(popupSpy).toHaveBeenCalled()
    })

    it('should skip the popup when confirmation is turned off', () => {
      mockContentSvc.showConformation = false
      const popupSpy = jest.spyOn(component as any, 'showCourseCompletionPopup').mockImplementation(() => { })
      component['handleBatchListForCourseCompletion']([], { currentCompletionPercentage: 100 })
      expect(popupSpy).not.toHaveBeenCalled()
      expect(mockRouter.navigate).toHaveBeenCalled()
    })

    it('should skip the popup when a dialog is already open', () => {
      mockDialog.openDialogs = [{}]
      const popupSpy = jest.spyOn(component as any, 'showCourseCompletionPopup').mockImplementation(() => { })
      component['handleBatchListForCourseCompletion']([], { currentCompletionPercentage: 100 })
      expect(popupSpy).not.toHaveBeenCalled()
    })
  })

  describe('showCourseCompletionPopup', () => {
    it('should navigate straight to the overview when the popup is dismissed', async () => {
      jest.spyOn(component, 'openCongratulationPopup').mockResolvedValue(false)
      await component['showCourseCompletionPopup']()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/toc/c1/overview'], expect.anything())
    })

    it('should navigate once the confirm dialog is confirmed', async () => {
      jest.spyOn(component, 'openCongratulationPopup').mockResolvedValue(true)
      mockDialog.open.mockReturnValue({ afterClosed: () => of({ event: 'CONFIRMED' }) })
      await component['showCourseCompletionPopup']()
      await Promise.resolve()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/toc/c1/overview'], expect.anything())
    })

    it('should navigate when the confirm dialog reports close-complete', async () => {
      jest.spyOn(component, 'openCongratulationPopup').mockResolvedValue(true)
      mockDialog.open.mockReturnValue({ afterClosed: () => of({ event: 'close-complete' }) })
      await component['showCourseCompletionPopup']()
      await Promise.resolve()
      expect(mockRouter.navigate).toHaveBeenCalled()
    })

    it('should stay put when the confirm dialog is dismissed', async () => {
      jest.spyOn(component, 'openCongratulationPopup').mockResolvedValue(true)
      mockDialog.open.mockReturnValue({ afterClosed: () => of(undefined) })
      await component['showCourseCompletionPopup']()
      await Promise.resolve()
      expect(mockRouter.navigate).not.toHaveBeenCalled()
    })
  })

  describe('processAssesmentResult', () => {
    it('should advance to the next competency', () => {
      const spy = jest.spyOn(component, 'nextCompetency').mockImplementation(() => { })
      component['processAssesmentResult']({ event: 'NEXT_COMPETENCY', competency: { id: 1 } })
      expect(spy).toHaveBeenCalled()
    })

    it('should ignore a next-competency event with no competency', () => {
      const spy = jest.spyOn(component, 'nextCompetency').mockImplementation(() => { })
      component['processAssesmentResult']({ event: 'NEXT_COMPETENCY' })
      expect(spy).not.toHaveBeenCalled()
    })

    it('should route to the competency page on a failed competency', () => {
      component['processAssesmentResult']({ event: 'FAILED_COMPETENCY' })
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/user/competency'])
    })

    it('should show the competency courses', () => {
      const spy = jest.spyOn(component, 'viewCompetencyCourses').mockImplementation(() => { })
      component['processAssesmentResult']({ event: 'VIEW_COURSES' })
      expect(spy).toHaveBeenCalled()
    })

    it('should route home on a failed ASHA assessment', () => {
      component['processAssesmentResult']({ event: 'FAILED_ASHA' })
      expect(mockRouter.navigate).toHaveBeenCalledWith(['page/home'])
    })

    it('should show the ASHA courses', () => {
      const spy = jest.spyOn(component, 'navigateToAshaCourses').mockImplementation(() => { })
      component['processAssesmentResult']({ event: 'VIEW_ASHA_COURSES' })
      expect(spy).toHaveBeenCalled()
    })

    it('should reopen the overview dialog on a retake', () => {
      const spy = jest.spyOn(component, 'openOverviewDialog').mockImplementation(() => { })
      component['processAssesmentResult']({ event: 'RETAKE_QUIZ' })
      expect(spy).toHaveBeenCalled()
    })

    it('should finish the assessment on done', () => {
      const spy = jest.spyOn(component as any, 'handleAssessmentDone').mockImplementation(() => { })
      component['processAssesmentResult']({ event: 'DONE' })
      expect(spy).toHaveBeenCalled()
    })

    it('should finish the assessment on an ASHA done', () => {
      const spy = jest.spyOn(component as any, 'handleAssessmentDone').mockImplementation(() => { })
      component['processAssesmentResult']({ event: 'DONE_ASHA' })
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('handleAssesmentCloseEvent', () => {
    it('should route to the competency page for a competency assessment', () => {
      component['handleAssesmentCloseEvent']({ competency: true })
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/user/competency'])
    })

    it('should route home for an ASHA assessment', () => {
      component['handleAssesmentCloseEvent']({ asha: true })
      expect(mockRouter.navigate).toHaveBeenCalledWith(['page/home'])
    })

    it('should just close the dialog otherwise', () => {
      const spy = jest.spyOn(component, 'closeBtnDialog').mockImplementation(() => { })
      component['handleAssesmentCloseEvent']({})
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('handleAssessmentDone', () => {
    it('should take the failed path when the score is below the pass mark', () => {
      const spy = jest.spyOn(component as any, 'handleAssessmentFailed').mockImplementation(() => { })
      component['handleAssessmentDone']({ result: 40, passPercentage: 60 })
      expect(spy).toHaveBeenCalledWith('id1', 'c1', undefined, 40)
    })

    it('should take the passed path when the score meets the pass mark', () => {
      const spy = jest.spyOn(component as any, 'handleAssessmentPassed').mockImplementation(() => { })
      component['handleAssessmentDone']({ result: 60, passPercentage: 60 })
      expect(spy).toHaveBeenCalledWith('id1', 'c1', undefined)
    })

    it('should treat missing scores as a pass at zero', () => {
      const spy = jest.spyOn(component as any, 'handleAssessmentPassed').mockImplementation(() => { })
      component['handleAssessmentDone']({})
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('handleAssessmentFailed', () => {
    it('should record a first attempt and navigate on', () => {
      const navSpy = jest.spyOn(component as any, 'navigateAfterAssessment').mockImplementation(() => { })
      component.assessmentCurrentProgress = null as any
      component['handleAssessmentFailed']('id1', 'c1', 'b1', 40)

      expect(mockViewerSvc.realTimeProgressUpdateV3).toHaveBeenCalledWith(
        'id1', expect.objectContaining({ completionPercentage: 40, status: 1 }), 'c1', 'b1',
      )
      expect(mockContentSvc.changeMessage).toHaveBeenCalled()
      expect(navSpy).toHaveBeenCalled()
    })

    it('should record an improved score', () => {
      jest.spyOn(component as any, 'navigateAfterAssessment').mockImplementation(() => { })
      component.assessmentCurrentProgress = { completionPercentage: 30 } as any
      component['handleAssessmentFailed']('id1', 'c1', 'b1', 40)
      expect(mockViewerSvc.realTimeProgressUpdateV3).toHaveBeenCalled()
    })

    it('should mark a perfect-but-failing score as complete', () => {
      jest.spyOn(component as any, 'navigateAfterAssessment').mockImplementation(() => { })
      component.assessmentCurrentProgress = null as any
      component['handleAssessmentFailed']('id1', 'c1', 'b1', 100)
      expect(mockViewerSvc.realTimeProgressUpdateV3).toHaveBeenCalledWith(
        'id1', expect.objectContaining({ status: 2 }), 'c1', 'b1',
      )
    })

    it('should skip the update when the new score is not an improvement', () => {
      const navSpy = jest.spyOn(component as any, 'navigateAfterAssessment').mockImplementation(() => { })
      component.assessmentCurrentProgress = { completionPercentage: 80 } as any
      component['handleAssessmentFailed']('id1', 'c1', 'b1', 40)

      expect(mockViewerSvc.realTimeProgressUpdateV3).not.toHaveBeenCalled()
      expect(navSpy).toHaveBeenCalled()
    })

    it('should default a missing batch id to a blank string in telemetry', () => {
      jest.spyOn(component as any, 'navigateAfterAssessment').mockImplementation(() => { })
      component.assessmentCurrentProgress = null as any
      component['handleAssessmentFailed']('id1', 'c1', undefined as any, 40)
      expect(mockViewerSvc.generateInteractTelemetry).toHaveBeenCalledWith(
        'progress-update-success', expect.objectContaining({ batchId: '' }),
      )
    })

    it('should warn without navigating when the update fails', () => {
      const navSpy = jest.spyOn(component as any, 'navigateAfterAssessment').mockImplementation(() => { })
      mockViewerSvc.realTimeProgressUpdateV3.mockReturnValue(throwError(() => new Error('down')))
      component.assessmentCurrentProgress = null as any
      component['handleAssessmentFailed']('id1', 'c1', 'b1', 40)

      expect(mockLoggerSvc.warn).toHaveBeenCalledWith('Progress update failed:', expect.any(Error))
      expect(navSpy).not.toHaveBeenCalled()
    })
  })

  describe('handleAssessmentPassed', () => {
    it('should record a full completion and navigate on', () => {
      const navSpy = jest.spyOn(component as any, 'navigateAfterAssessment').mockImplementation(() => { })
      component['handleAssessmentPassed']('id1', 'c1', 'b1')

      expect(mockViewerSvc.realTimeProgressUpdateV3).toHaveBeenCalledWith(
        'id1', expect.objectContaining({ completionPercentage: 100, status: 2 }), 'c1', 'b1',
      )
      expect(mockContentSvc.changeMessage).toHaveBeenCalledWith(expect.objectContaining({ type: 'assessment' }))
      expect(navSpy).toHaveBeenCalled()
    })

    it('should default a missing batch id to a blank string in telemetry', () => {
      jest.spyOn(component as any, 'navigateAfterAssessment').mockImplementation(() => { })
      component['handleAssessmentPassed']('id1', 'c1', undefined as any)
      expect(mockViewerSvc.generateInteractTelemetry).toHaveBeenCalledWith(
        'progress-update-success', expect.objectContaining({ batchId: '' }),
      )
    })

    it('should warn without navigating when the update fails', () => {
      const navSpy = jest.spyOn(component as any, 'navigateAfterAssessment').mockImplementation(() => { })
      mockViewerSvc.realTimeProgressUpdateV3.mockReturnValue(throwError(() => new Error('down')))
      component['handleAssessmentPassed']('id1', 'c1', 'b1')

      expect(mockLoggerSvc.warn).toHaveBeenCalledWith('Progress update failed:', expect.any(Error))
      expect(navSpy).not.toHaveBeenCalled()
    })
  })

  describe('handleAssesmentDialogClose', () => {
    it('should process the dialog result', () => {
      const spy = jest.spyOn(component as any, 'processAssesmentResult').mockImplementation(() => { })
      component.dialogAssesment = { afterClosed: () => of({ event: 'CLOSE' }) } as any
      component['handleAssesmentDialogClose']()
      expect(spy).toHaveBeenCalledWith({ event: 'CLOSE' })
    })
  })
})
