jest.mock('@ws-widget/collection', () => ({
  NsContent: { EMimeTypes: { APPLICATION_JSON: 'application/json' } },
  WidgetContentService: class {},
}))

import { of, throwError, Subject } from 'rxjs'
import { AssesmentModalComponent } from './assesment-modal.component'

;(global as any).$ = jest.fn().mockReturnValue({
  hide: jest.fn(),
  show: jest.fn(),
  fadeOut: (_speed: any, cb: any) => cb && cb(),
  fadeIn: (_speed: any, cb: any) => cb && cb(),
})

describe('AssesmentModalComponent', () => {
  let component: AssesmentModalComponent
  let mockDialogRef: any
  let mockAssesmentdata: any
  let mockQuizService: any
  let mockRoute: any
  let mockValueSvc: any
  let mockSnackBar: any
  let mockViewerDataSvc: any
  let mockConfigSvc: any
  let mockTelemetrySvc: any
  let mockViewerSvc: any
  let mockPlayerStateService: any
  let mockContentSvc: any
  let mockEvents: any
  let mockDialog: any
  let mockLogger: any
  let mockPlylsSvc: any
  let mockTranslate: any
  let mockNgZone: any
  let mockCdr: any
  let mockHttp: any

  beforeEach(() => {
    mockDialogRef = { close: jest.fn() }
    mockAssesmentdata = {
      generalData: { identifier: 'id1', collectionId: 'c1', name: 'Proficiency Level 1', artifactUrl: '' },
      questions: {
        timeLimit: 5,
        isAssessment: true,
        questions: [
          { questionId: 'q1', questionType: 'mcq-sca', options: [{ optionId: 'o1', isCorrect: true }], multiSelection: false },
          { questionId: 'q2', questionType: 'mcq-sca', options: [{ optionId: 'o2', isCorrect: true }], multiSelection: false },
        ],
      },
      currentProgress: null,
    }
    mockQuizService = {
      questionState: { slides: [{}, {}], active_slide_index: 0 },
      createAssessmentSubmitRequest: jest.fn().mockReturnValue({}),
      sanitizeAssessmentSubmitRequest: jest.fn().mockReturnValue({}),
      submitQuizV2: jest.fn().mockReturnValue(of({ correct: 1, inCorrect: 0, blank: 0, passPercent: 60, result: 100 })),
      competencySubmitQuizV2: jest.fn().mockReturnValue(of({ correct: 1, inCorrect: 0, blank: 0, passPercent: 60, result: 100 })),
      updatePassbook: jest.fn().mockReturnValue(of({})),
      updateAshaAssessment: jest.fn().mockReturnValue(of({})),
      checkMtfAnswer: jest.fn().mockReturnValue({ questionId: 'q1', answer: [] }),
      updateMtf: { next: jest.fn() },
    }
    mockRoute = { snapshot: { queryParams: {} } }
    mockValueSvc = { isXSmall$: of(false) }
    mockSnackBar = { open: jest.fn() }
    mockViewerDataSvc = { resource: { parent: undefined }, gatingEnabled: false }
    mockConfigSvc = { userProfile: { userId: 'u1', rootOrgName: 'org1' } }
    mockTelemetrySvc = {
      getTelemetryConfig: jest.fn(),
      impression: jest.fn(),
      start: jest.fn(),
      end: jest.fn(),
    }
    mockViewerSvc = { realTimeProgressUpdateV3: jest.fn().mockReturnValue(of({})) }
    mockPlayerStateService = { playerState: new Subject() }
    mockContentSvc = {
      fetchContentHistoryV2: jest.fn().mockReturnValue(of({ result: { contentList: [] } })),
      changeMessage: jest.fn(),
    }
    mockEvents = { raiseInteractTelemetry: jest.fn() }
    mockDialog = { open: jest.fn() }
    mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    mockPlylsSvc = { orgDetails: jest.fn().mockReturnValue({ assessmentConfig: { isCorrectAnswerPopUp: false } }) }
    mockTranslate = { instant: jest.fn((k: string) => k) }
    mockNgZone = { runOutsideAngular: (fn: any) => fn(), run: (fn: any) => fn() }
    mockCdr = { markForCheck: jest.fn(), detectChanges: jest.fn() }
    mockHttp = { get: jest.fn().mockReturnValue({ toPromise: jest.fn().mockResolvedValue({ questions: [] }) }) }

    component = new AssesmentModalComponent(
      mockDialogRef,
      mockAssesmentdata,
      mockQuizService,
      mockRoute,
      mockValueSvc,
      mockSnackBar,
      mockViewerDataSvc,
      mockConfigSvc,
      mockTelemetrySvc,
      mockViewerSvc,
      mockPlayerStateService,
      mockContentSvc,
      mockEvents,
      mockDialog,
      mockLogger,
      mockPlylsSvc,
      mockTranslate,
      mockNgZone,
      mockCdr,
      mockHttp
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('ngOnInit should set timer, totalQuestion, proficiencyLevel and call updateProgress', () => {
    const spy = jest.spyOn(component, 'updateProgress').mockImplementation()
    component.ngOnInit()
    expect(component.timeLeft).toBe(5)
    expect(component.totalQuestion).toBe(2)
    expect(spy).toHaveBeenCalled()
  })

  it('updateProgress should skip update when parent progress already > 0', () => {
    component.assesmentdata.currentProgress = { completionPercentage: 50 }
    component.updateProgress()
    expect(mockContentSvc.fetchContentHistoryV2).not.toHaveBeenCalled()
  })

  it('updateProgress should fetch and send 0 progress when no current progress', () => {
    mockContentSvc.fetchContentHistoryV2.mockReturnValue(of({ result: { contentList: [] } }))
    component.updateProgress()
    expect(mockViewerSvc.realTimeProgressUpdateV3).toHaveBeenCalled()
  })

  it('updateProgress should skip sending when contentList already has progress', () => {
    mockContentSvc.fetchContentHistoryV2.mockReturnValue(of({
      result: { contentList: [{ contentId: 'id1', completionPercentage: 40 }] },
    }))
    component.updateProgress()
    expect(mockViewerSvc.realTimeProgressUpdateV3).not.toHaveBeenCalled()
  })

  it('updateProgress should warn on fetch error', () => {
    mockContentSvc.fetchContentHistoryV2.mockReturnValue(throwError(() => new Error('fail')))
    component.updateProgress()
    expect(mockLogger.warn).toHaveBeenCalled()
  })

  it('ngAfterViewInit should start telemetry and update question type for mtf first question', () => {
    component.assesmentdata.questions.questions[0].questionType = 'mtf'
    component.ngAfterViewInit()
    expect(mockTelemetrySvc.start).toHaveBeenCalled()
    expect(mockQuizService.updateMtf.next).toHaveBeenCalledWith(true)
  })

  it('canShowViewAnswers should return false when isCorrectAnswerPopUp explicitly false', () => {
    mockViewerDataSvc.resource = { isCorrectAnswerPopUp: false }
    expect(component.canShowViewAnswers()).toBe(false)
  })

  it('canShowViewAnswers should return true when isCorrectAnswerPopUp explicitly true', () => {
    mockViewerDataSvc.resource = { isCorrectAnswerPopUp: true }
    mockAssesmentdata.generalData.isCorrectAnswerPopUp = true
    expect(component.canShowViewAnswers()).toBe(true)
  })

  it('canShowViewAnswers should return false for restricted org when flag absent', () => {
    mockViewerDataSvc.resource = {}
    mockPlylsSvc.orgDetails.mockReturnValue({ assessmentConfig: { isCorrectAnswerPopUp: false } })
    expect(component.canShowViewAnswers()).toBe(false)
  })

  it('canShowViewAnswers should return true for other orgs when flag absent and display allowed', () => {
    mockViewerDataSvc.resource = {}
    mockPlylsSvc.orgDetails.mockReturnValue({ assessmentConfig: { isCorrectAnswerPopUp: true } })
    expect(component.canShowViewAnswers()).toBe(true)
  })

  it('closePopup should close with competency data when isCompetency and not asha', () => {
    component.isCompetency = true
    component.isAshaHome = false
    mockRoute.snapshot.queryParams = { competency: 'true' }
    component.closePopup()
    expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'CLOSE', competency: 'true' })
  })

  it('closePopup should close with asha data when isCompetency and isAshaHome', () => {
    component.isCompetency = true
    component.isAshaHome = true
    mockRoute.snapshot.queryParams = { isAsha: 'true' }
    component.closePopup()
    expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'CLOSE', asha: 'true' })
  })

  it('closePopup should close DONE when completed and progress above pass', () => {
    component.isCompetency = false
    component.isCompleted = true
    component.progress = 80
    component.passPercentage = 60
    component.closePopup()
    expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'DONE' })
  })

  it('closePopup should close CLOSE when not completed', () => {
    component.isCompetency = false
    component.isCompleted = false
    component.closePopup()
    expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'CLOSE' })
  })

  it('closeDone should close with DONE_ASHA when isAsha query param present', () => {
    mockRoute.snapshot.queryParams = { isAsha: 'true' }
    component.closeDone()
    expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'DONE_ASHA', asha: 'true' })
  })

  it('closeDone should close with DONE when no isAsha param', () => {
    mockRoute.snapshot.queryParams = {}
    component.isAshaHome = false
    component.closeDone()
    expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'DONE', asha: false })
  })

  it('retakeQuiz should close with RETAKE_QUIZ when result is 100', async () => {
    component.result = 100
    await component.retakeQuiz()
    expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'RETAKE_QUIZ' })
  })

  it('retakeQuiz should open ViewAnswerComponent dialog when passed', async () => {
    mockViewerDataSvc.resource = { isCorrectAnswerPopUp: true }
    mockAssesmentdata.generalData.isCorrectAnswerPopUp = true
    component.result = 80
    component.passPercentage = 60
    await component.retakeQuiz()
    expect(mockDialog.open).toHaveBeenCalled()
  })

  it('CompetencyDashboard should close with FAILED_COMPETENCY', () => {
    mockRoute.snapshot.queryParams = { competency: 'c1' }
    component.CompetencyDashboard()
    expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'FAILED_COMPETENCY', competency: 'c1' })
  })

  it('viewCourses should close with VIEW_COURSES data', () => {
    mockRoute.snapshot.queryParams = { competency: 'c1' }
    component.competencyId = 'comp1'
    component.competencyLevelId = 'lvl1'
    component.viewCourses()
    expect(mockDialogRef.close).toHaveBeenCalledWith({
      event: 'VIEW_COURSES', competency: 'c1', competencyId: 'comp1', competencyLevel: 'lvl1',
    })
  })

  it('nextCompetency should close with NEXT_COMPETENCY', () => {
    mockRoute.snapshot.queryParams = { competency: 'c1' }
    component.nextCompetency()
    expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'NEXT_COMPETENCY', competency: 'c1' })
  })

  it('goToAshaHome should close with FAILED_ASHA', () => {
    mockRoute.snapshot.queryParams = { isAsha: 'true' }
    component.goToAshaHome()
    expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'FAILED_ASHA', asha: 'true' })
  })

  it('viewAshaCourses should close with VIEW_ASHA_COURSES data', () => {
    mockRoute.snapshot.queryParams = { isAsha: 'true', lang: 'en' }
    component.competencyId = 'comp1'
    component.competencyLevelId = 'lvl1'
    component.courseID = 'course1'
    component.viewAshaCourses()
    expect(mockDialogRef.close).toHaveBeenCalledWith({
      event: 'VIEW_ASHA_COURSES', asha: 'true', competencyId: 'comp1', competencyLevel: 'lvl1',
      courseid: 'course1', lang: 'en',
    })
  })

  it('getConicGradient should return gradient string containing value', () => {
    const result = component.getConicGradient(50)
    expect(result).toContain('50%')
  })

  it('timer should auto-submit and set isIdeal when time elapses', () => {
    jest.useFakeTimers()
    component.startTime = Date.now() - 1000
    component.timer(0)
    jest.advanceTimersByTime(500)
    expect(component.isIdeal).toBe(true)
    jest.useRealTimers()
  })

  it('timer should not start when data is -1 or less', () => {
    component.timer(-1)
    expect(component.timerSubscription).toBeNull()
  })

  it('fillSelectedItems should add optionId for multiSelection question', () => {
    const question: any = { questionId: 'q1', multiSelection: true }
    component.questionAnswerHash = {}
    component.fillSelectedItems(question, 'o1', 0)
    expect(component.questionAnswerHash['q1']).toEqual(['o1'])
  })

  it('fillSelectedItems should remove optionId when toggled off for multiSelection', () => {
    const question: any = { questionId: 'q1', multiSelection: true }
    component.questionAnswerHash = { q1: ['o1'] }
    component.fillSelectedItems(question, 'o1', 0)
    expect(component.questionAnswerHash['q1']).toBeUndefined()
  })

  it('fillSelectedItems should set single selection for non multiSelection question', () => {
    const question: any = { questionId: 'q1', multiSelection: false }
    component.fillSelectedItems(question, 'o2', 0)
    expect(component.questionAnswerHash['q1']).toEqual(['o2'])
  })

  it('generateInteractTelemetry should raise telemetry with next status', () => {
    component.generateInteractTelemetry('next', component.assesmentdata.questions.questions[0], 0)
    expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalled()
  })

  it('proceedToSubmit should call submitQuiz', () => {
    const spy = jest.spyOn(component, 'submitQuiz').mockImplementation()
    component.proceedToSubmit()
    expect(spy).toHaveBeenCalled()
  })

  it('submitQuiz should submit non-competency quiz via submitQuizV2', () => {
    mockRoute.snapshot.queryParams = {}
    const spy = jest.spyOn(component, 'submitQuizV2').mockImplementation()
    component.submitQuiz()
    expect(spy).toHaveBeenCalled()
  })

  it('submitQuiz should submit competency quiz via submitCompetencyQuizV2', () => {
    mockRoute.snapshot.queryParams = { competency: 'true' }
    const spy = jest.spyOn(component, 'submitCompetencyQuizV2').mockImplementation()
    component.submitQuiz()
    expect(spy).toHaveBeenCalled()
  })

  it('submitQuizV2 should process response and mark completed when passed', () => {
    component.submitQuizV2({})
    expect(component.numCorrectAnswers).toBe(1)
    expect(component.isCompleted).toBe(true)
  })

  it('submitQuizV2 should show error snackbar on failure', () => {
    mockQuizService.submitQuizV2.mockReturnValue(throwError(() => new Error('fail')))
    component.submitQuizV2({})
    expect(component.fetchingResultsStatus).toBe('error')
  })

  it('submitCompetencyQuizV2 should mark completed and call updatePassbook when result passes', () => {
    localStorage.setItem('competency_meta_data', JSON.stringify([{ competencyId: 'comp1', competencyName: 'Comp', competencyIds: [{ identifier: 'id1', competencyId: 1 }] }]))
    jest.useFakeTimers()
    component.submitCompetencyQuizV2({ courseId: 'c1', batchId: 'b1', contentId: 'id1' })
    expect(component.isCompleted).toBe(true)
    expect(mockQuizService.updatePassbook).toHaveBeenCalled()
    jest.advanceTimersByTime(4000)
    jest.useRealTimers()
    localStorage.removeItem('competency_meta_data')
  })

  it('submitCompetencyQuizV2 should disableNext when result below pass', () => {
    mockQuizService.competencySubmitQuizV2.mockReturnValue(of({ correct: 0, inCorrect: 1, blank: 0, passPercent: 90, result: 10 }))
    localStorage.setItem('competency_meta_data', JSON.stringify([{ competencyId: 'comp1', competencyName: 'Comp' }]))
    component.submitCompetencyQuizV2({ courseId: 'c1', batchId: 'b1', contentId: 'id1' })
    expect(component.disableNext).toBe(true)
    localStorage.removeItem('competency_meta_data')
  })

  it('submitCompetencyQuizV2 should call updateAshaAssessment when isAshaHome true', () => {
    component.isAshaHome = true
    mockRoute.snapshot.queryParams = { isAsha: 'true' }
    localStorage.setItem('competency_meta_data', JSON.stringify([{ competencyId: 'comp1', competencyName: 'Comp' }]))
    component.submitCompetencyQuizV2({ courseId: 'c1', batchId: 'b1', contentId: 'id1' })
    expect(mockQuizService.updateAshaAssessment).toHaveBeenCalled()
    localStorage.removeItem('competency_meta_data')
  })

  it('submitCompetencyQuizV2 should show error snackbar on failure', () => {
    mockQuizService.competencySubmitQuizV2.mockReturnValue(throwError(() => new Error('fail')))
    component.submitCompetencyQuizV2({})
    expect(component.fetchingResultsStatus).toBe('error')
  })

  it('getCompetencyId should return id and set nextCompetencyLevel when matched', () => {
    const data = [{ identifier: 'id1', competencyId: 5 }]
    const result = component.getCompetencyId(data)
    expect(result).toBe('5')
    expect(component.nextCompetencyLevel).toBe(6)
  })

  it('calculateResults should count correct and incorrect mcq answers', () => {
    component.assesmentdata.questions = component.assesmentdata.questions.questions
    component.questionAnswerHash = { q1: ['o1'], q2: ['wrong'] }
    component.calculateResults()
    expect(component.numCorrectAnswers).toBe(1)
    expect(component.numIncorrectAnswers).toBe(1)
  })

  it('updateNextResourses should update progress when nextResource present', () => {
    component.updateNextResourses()
    mockPlayerStateService.playerState.next({ nextResource: '/some/route', nextContentId: 'nc1' })
    expect(mockViewerSvc.realTimeProgressUpdateV3).toHaveBeenCalled()
  })

  it('nextQuestion should advance slide index and disable next temporarily', () => {
    mockQuizService.questionState.slides = [{}, {}, {}]
    component.assesmentdata.questions.questions.push({ questionId: 'q3', questionType: 'mcq-sca', options: [{ optionId: 'o3', isCorrect: true }] })
    component.questionAnswerHash = { qslideIndex: 0 }
    component.nextQuestion()
    expect(mockQuizService.questionState.active_slide_index).toBe(1)
  })

  it('nextQuestion should submit when at last slide', () => {
    mockQuizService.questionState.active_slide_index = 1
    component.questionAnswerHash = { qslideIndex: 1 }
    const spy = jest.spyOn(component, 'proceedToSubmit').mockImplementation()
    component.nextQuestion()
    expect(spy).toHaveBeenCalled()
    expect(component.showSubmit).toBe(true)
  })

  it('updateQuestionType should call quizService updateMtf.next', () => {
    component.updateQuestionType(true)
    expect(mockQuizService.updateMtf.next).toHaveBeenCalledWith(true)
  })

  it('previousQuestion should return early when at first slide', () => {
    mockQuizService.questionState.active_slide_index = 0
    component.previousQuestion()
    expect(component.diablePrevious).toBe(true)
  })

  it('previousQuestion should go back a slide when not at first', () => {
    mockQuizService.questionState.slides = [{}, {}, {}]
    mockQuizService.questionState.active_slide_index = 2
    component.assesmentdata.questions.questions.push({ questionId: 'q3', questionType: 'mcq-sca', options: [{ optionId: 'o3', isCorrect: true }] })
    component.previousQuestion()
    expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalled()
  })

  it('ngOnDestroy should unsubscribe timer and reset time', () => {
    component.timerSubscription = { unsubscribe: jest.fn() } as any
    component.ngOnDestroy()
    expect(component.timeLeft).toBe(0)
    expect(component.startTime).toBe(0)
  })

  it('getCorrectAnswerPopUp should return false when config disables popup', () => {
    localStorage.setItem('private', JSON.stringify({ orgData: { assessmentConfig: { isCorrectAnswerPopUp: false } } }))
    component.assesmentdata.generalData.isCorrectAnswerPopUp = undefined
    expect(component.getCorrectAnswerPopUp()).toBe(false)
    localStorage.removeItem('private')
  })

  it('getCorrectAnswerPopUp should return false when result is 100', () => {
    localStorage.setItem('private', JSON.stringify({ orgData: { assessmentConfig: { isCorrectAnswerPopUp: true } } }))
    component.assesmentdata.generalData.isCorrectAnswerPopUp = true
    component.result = 100
    expect(component.getCorrectAnswerPopUp()).toBe(false)
    localStorage.removeItem('private')
  })

  it('getCorrectAnswerPopUp should return true when eligible and result passes threshold', () => {
    localStorage.setItem('private', JSON.stringify({}))
    component.assesmentdata.generalData.isCorrectAnswerPopUp = true
    component.result = 80
    component.passPercentage = 60
    expect(component.getCorrectAnswerPopUp()).toBe(true)
    localStorage.removeItem('private')
  })

  describe('canShowViewAnswers', () => {
    it('should hide answers when the resource opts out explicitly', () => {
      mockViewerDataSvc.resource = { isCorrectAnswerPopUp: false }
      expect(component.canShowViewAnswers()).toBe(false)
    })

    it('should show answers when the resource opts in explicitly', () => {
      mockViewerDataSvc.resource = { isCorrectAnswerPopUp: true }
      mockAssesmentdata.generalData.isCorrectAnswerPopUp = true
      mockPlylsSvc.orgDetails.mockReturnValue({ assessmentConfig: { isCorrectAnswerPopUp: false } })
      expect(component.canShowViewAnswers()).toBe(true)
    })

    it('should hide answers for an organisation that has not opted in', () => {
      mockViewerDataSvc.resource = {}
      mockPlylsSvc.orgDetails.mockReturnValue({ assessmentConfig: { isCorrectAnswerPopUp: false } })
      expect(component.canShowViewAnswers()).toBe(false)
    })

    it('should show answers for an organisation that has opted in', () => {
      mockViewerDataSvc.resource = {}
      mockPlylsSvc.orgDetails.mockReturnValue({ assessmentConfig: { isCorrectAnswerPopUp: true } })
      expect(component.canShowViewAnswers()).toBe(true)
    })

    it('should show answers when the user has no organisation', () => {
      mockViewerDataSvc.resource = {}
      mockConfigSvc.userProfile = { userId: 'u1' }
      mockAssesmentdata.generalData.isCorrectAnswerPopUp = true
      mockPlylsSvc.orgDetails.mockReturnValue({ assessmentConfig: { isCorrectAnswerPopUp: false } })
      expect(component.canShowViewAnswers()).toBe(true)
    })

    it('should tolerate missing org details and resource', () => {
      mockViewerDataSvc.resource = null
      mockPlylsSvc.orgDetails.mockReturnValue(null)
      mockConfigSvc.userProfile = null
      mockAssesmentdata.generalData.isCorrectAnswerPopUp = true
      expect(component.canShowViewAnswers()).toBe(true)
    })
  })

  describe('closePopup', () => {
    beforeEach(() => {
      component.assesmentdata = mockAssesmentdata
      mockViewerDataSvc.resource = { parent: 'module-1' }
    })

    it('should report DONE when a passing standard assessment is closed', () => {
      component.isCompetency = false
      component.isCompleted = true
      component.progress = 80
      component.passPercentage = 60

      component.closePopup()
      expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'DONE' })
    })

    it('should report CLOSE when a failing standard assessment is closed', () => {
      component.isCompetency = false
      component.isCompleted = true
      component.progress = 40
      component.passPercentage = 60

      component.closePopup()
      expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'CLOSE' })
    })

    it('should report CLOSE when an unfinished assessment is closed', () => {
      component.isCompetency = false
      component.isCompleted = false

      component.closePopup()
      expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'CLOSE' })
    })

    it('should tag a competency close with the competency flag', () => {
      component.isCompetency = true
      component.isAshaHome = false
      mockRoute.snapshot.queryParams = { competency: 'comp-1' }

      component.closePopup()
      expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'CLOSE', competency: 'comp-1' })
    })

    it('should tag an ASHA close with the asha flag', () => {
      component.isCompetency = true
      component.isAshaHome = true
      mockRoute.snapshot.queryParams = { isAsha: 'true' }

      component.closePopup()
      expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'CLOSE', asha: 'true' })
    })

    it('should bracket the close with start and end telemetry', () => {
      component.isCompetency = false
      component.closePopup()

      expect(mockTelemetrySvc.start).toHaveBeenCalledWith('assessment', 'assessment-close-start', 'id1')
      expect(mockTelemetrySvc.end).toHaveBeenCalledWith(
        'assessment', 'assessment-close-end', 'id1',
        expect.objectContaining({ courseID: 'c1', contentId: 'id1', moduleId: 'module-1' }),
      )
    })

    it('should leave the module id undefined when the resource has no parent', () => {
      mockViewerDataSvc.resource = { parent: undefined }
      component.isCompetency = false
      component.closePopup()
      expect(mockTelemetrySvc.end.mock.calls[0][3].moduleId).toBeUndefined()
    })
  })

  describe('closeDone', () => {
    it('should report DONE for a standard assessment', () => {
      mockRoute.snapshot.queryParams = {}
      component.isAshaHome = false
      component.closeDone()
      expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'DONE', asha: false })
    })

    it('should report DONE_ASHA for an ASHA assessment', () => {
      mockRoute.snapshot.queryParams = { isAsha: 'true' }
      component.closeDone()
      expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'DONE_ASHA', asha: 'true' })
    })

    it('should still tag the ASHA flag from the home context', () => {
      mockRoute.snapshot.queryParams = {}
      component.isAshaHome = true
      component.closeDone()
      expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'DONE', asha: true })
    })
  })

  describe('retakeQuiz', () => {
    beforeEach(() => {
      component.assesmentdata = mockAssesmentdata
      component.passPercentage = 60
      mockViewerDataSvc.resource = { isCorrectAnswerPopUp: true }
      mockAssesmentdata.generalData.isCorrectAnswerPopUp = true
    })

    it('should request a retake when the learner failed', async () => {
      component.result = 40
      await component.retakeQuiz()
      expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'RETAKE_QUIZ' })
      expect(mockDialog.open).not.toHaveBeenCalled()
    })

    it('should request a retake on a perfect score', async () => {
      component.result = 100
      await component.retakeQuiz()
      expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'RETAKE_QUIZ' })
    })

    it('should open the answer review for a passing, imperfect score', async () => {
      component.result = 80
      component.questionAnswerHash = { q1: ['o1'] }
      await component.retakeQuiz()

      expect(mockDialogRef.close).not.toHaveBeenCalled()
      expect(mockDialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        data: { questions: mockAssesmentdata.questions.questions, userInput: { q1: ['o1'] } },
      }))
    })

    it('should not fetch the answer key when the org/resource does not allow it', async () => {
      mockViewerDataSvc.resource = { isCorrectAnswerPopUp: false }
      component.result = 80
      await component.retakeQuiz()

      expect(mockHttp.get).not.toHaveBeenCalled()
      expect(mockDialog.open).not.toHaveBeenCalled()
    })

    it('should map fetched options onto the matching questionId and leave unmatched questions untouched', async () => {
      // q1's user-side options carry isCorrect: false; the fetched quizJSON has the real answer for q1
      // only — q2 has no match in the fetched set and must keep its original options unchanged.
      component.assesmentdata.questions.questions = [
        { questionId: 'q1', questionType: 'mcq-sca', options: [{ optionId: 'o1', isCorrect: false }] },
        { questionId: 'q2', questionType: 'mcq-sca', options: [{ optionId: 'o2', isCorrect: false }] },
      ]
      mockHttp.get.mockReturnValue({
        toPromise: jest.fn().mockResolvedValue({
          questions: [
            { questionId: 'q1', options: [{ optionId: 'o1', isCorrect: true }] },
          ],
        }),
      })
      component.result = 80

      await component.retakeQuiz()

      expect(component.assesmentdata.questions.questions).toEqual([
        { questionId: 'q1', questionType: 'mcq-sca', options: [{ optionId: 'o1', isCorrect: true }] },
        { questionId: 'q2', questionType: 'mcq-sca', options: [{ optionId: 'o2', isCorrect: false }] },
      ])
    })

    it('should leave the questions unchanged when the fetch fails', async () => {
      const originalQuestions = JSON.parse(JSON.stringify(mockAssesmentdata.questions.questions))
      mockHttp.get.mockReturnValue({ toPromise: jest.fn().mockRejectedValue(new Error('network error')) })
      component.result = 80

      await component.retakeQuiz()

      expect(component.assesmentdata.questions.questions).toEqual(originalQuestions)
      expect(mockDialog.open).toHaveBeenCalled()
    })
  })

  describe('competency and ASHA navigation', () => {
    beforeEach(() => {
      component.competencyId = 'comp-1'
      component.competencyLevelId = 2
      component.courseID = 'course-1'
    })

    it('should close to the competency dashboard on failure', () => {
      mockRoute.snapshot.queryParams = { competency: 'comp-1' }
      component.CompetencyDashboard()
      expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'FAILED_COMPETENCY', competency: 'comp-1' })
    })

    it('should close to the competency course list', () => {
      mockRoute.snapshot.queryParams = { competency: 'comp-1' }
      component.viewCourses()
      expect(mockDialogRef.close).toHaveBeenCalledWith({
        event: 'VIEW_COURSES', competency: 'comp-1', competencyId: 'comp-1', competencyLevel: 2,
      })
    })

    it('should close to the next competency', () => {
      mockRoute.snapshot.queryParams = { competency: 'comp-1' }
      component.nextCompetency()
      expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'NEXT_COMPETENCY', competency: 'comp-1' })
    })

    it('should close to the ASHA home on failure', () => {
      mockRoute.snapshot.queryParams = { isAsha: 'true' }
      component.goToAshaHome()
      expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'FAILED_ASHA', asha: 'true' })
    })

    it('should close to the ASHA course list carrying the language', () => {
      mockRoute.snapshot.queryParams = { isAsha: 'true', lang: 'hi' }
      component.viewAshaCourses()
      expect(mockDialogRef.close).toHaveBeenCalledWith({
        event: 'VIEW_ASHA_COURSES', asha: 'true', competencyId: 'comp-1',
        competencyLevel: 2, courseid: 'course-1', lang: 'hi',
      })
    })
  })

  describe('getConicGradient', () => {
    it('should place the sweep at the supplied percentage', () => {
      expect(component.getConicGradient(75)).toContain('75%')
    })

    it('should render a zero-progress ring', () => {
      expect(component.getConicGradient(0)).toContain('0%')
    })
  })
})
