const jqueryMock = jest.fn(() => ({
  fadeOut: jest.fn((_speed: any, cb: () => void) => cb()),
  fadeIn: jest.fn((_speed: any, cb: () => void) => cb()),
  hide: jest.fn(),
  show: jest.fn(),
}));
(global as any).$ = jqueryMock

import { of, throwError } from 'rxjs'
import { QuizModalComponent } from './quiz-modal.component'

describe('QuizModalComponent', () => {
  let component: QuizModalComponent
  let mockDialogRef: any
  let mockQuizService: any
  let mockRoute: any
  let mockValueSvc: any
  let mockSnackBar: any
  let mockLogger: any
  let mockTranslate: any
  let mockNgZone: any
  let mockCdr: any
  let assesmentdata: any

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()

    assesmentdata = {
      questions: {
        timeLimit: 1000,
        questions: [
          { questionId: 'q1', questionType: 'mcq', multiSelection: false, options: [{ optionId: 'o1', isCorrect: true }] },
        ],
      },
      generalData: {
        identifier: 'id1',
        name: 'name1',
        artifactUrl: 'url1',
        collectionId: 'coll1',
      },
    }

    mockDialogRef = { close: jest.fn() }
    mockQuizService = {
      updateMtf: { next: jest.fn() },
      createAssessmentSubmitRequest: jest.fn().mockReturnValue({}),
      sanitizeAssessmentSubmitRequest: jest.fn(req => req),
      submitQuizV2: jest.fn().mockReturnValue(of({ correct: 1, inCorrect: 0, blank: 0, passPercent: 60, result: 100 })),
      checkAnswer: jest.fn().mockReturnValue({ questionId: 'q1', answer: [] }),
      checkMtfAnswer: jest.fn().mockReturnValue({ questionId: 'q1', answer: [] }),
      questionState: { slides: [{}, {}], active_slide_index: 0 },
    }
    mockRoute = { snapshot: { queryParams: { batchId: 'b1' } } }
    mockValueSvc = { isXSmall$: of(false) }
    mockSnackBar = { open: jest.fn() }
    mockLogger = { log: jest.fn() }
    mockTranslate = { instant: jest.fn(key => key) }
    mockNgZone = { runOutsideAngular: jest.fn(cb => cb()), run: jest.fn(cb => cb()) }
    mockCdr = { markForCheck: jest.fn(), detectChanges: jest.fn() }

    component = new QuizModalComponent(
      mockDialogRef,
      assesmentdata,
      mockQuizService,
      mockRoute,
      mockValueSvc,
      mockSnackBar,
      mockLogger,
      mockTranslate,
      mockNgZone,
      mockCdr,
    )

    jest.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    Object.defineProperty(window, 'localStorage', {
      value: { getItem: jest.fn().mockReturnValue('user-1') },
      writable: true,
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should initialize timer state and question counts', () => {
      component.ngOnInit()
      expect(component.timeLeft).toBe(1000)
      expect(component.totalQuestion).toBe(1)
      expect(component.questionAnswerHash).toEqual({})
    })
  })

  describe('ngAfterViewInit', () => {
    it('should update question type to mtf when first question is mtf', () => {
      assesmentdata.questions.questions[0].questionType = 'mtf'
      component.ngAfterViewInit()
      expect(mockQuizService.updateMtf.next).toHaveBeenCalledWith(true)
    })

    it('should not update question type for non-mtf first question', () => {
      component.ngAfterViewInit()
      expect(mockQuizService.updateMtf.next).not.toHaveBeenCalled()
    })
  })

  describe('closePopup / closeDone / retakeQuiz', () => {
    it('should close with CLOSE event', () => {
      component.closePopup()
      expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'CLOSE' })
    })

    it('should close with DONE event', () => {
      component.closeDone()
      expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'DONE' })
    })

    it('should close with RETAKE_QUIZ event', () => {
      component.retakeQuiz()
      expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'RETAKE_QUIZ' })
    })
  })

  describe('fillSelectedItems', () => {
    it('should set a single selected option for non-multi questions', () => {
      const question: any = { questionId: 'q1', multiSelection: false }
      component.fillSelectedItems(question, 'o1', 0)
      expect(component.questionAnswerHash['q1']).toEqual(['o1'])
      expect(component.disableSubmit).toBe(false)
    })

    it('should toggle option in multi-select questions', () => {
      const question: any = { questionId: 'q1', multiSelection: true }
      component.questionAnswerHash['q1'] = ['o1']
      component.fillSelectedItems(question, 'o2', 0)
      expect(component.questionAnswerHash['q1']).toEqual(['o1', 'o2'])
      component.fillSelectedItems(question, 'o1', 0)
      expect(component.questionAnswerHash['q1']).toEqual(['o2'])
    })

    it('should delete the entry when multi-select becomes empty', () => {
      const question: any = { questionId: 'q1', multiSelection: true }
      component.questionAnswerHash['q1'] = ['o1']
      component.fillSelectedItems(question, 'o1', 0)
      expect(component.questionAnswerHash['q1']).toBeUndefined()
    })
  })

  describe('submitQuiz', () => {
    it('should submit and populate results on success', () => {
      component.ngOnInit()
      component.submitQuiz()
      expect(mockQuizService.submitQuizV2).toHaveBeenCalled()
      expect(component.fetchingResultsStatus).toBe('done')
      expect(component.numCorrectAnswers).toBe(1)
      expect(component.tabIndex).toBe(1)
      expect(component.disableContinue).toBe(false)
    })

    it('should use fixed pass percentage for the NQOCN course', () => {
      component.ngOnInit()
      assesmentdata.generalData.collectionId = 'lex_auth_0131241730330624000'
      component.submitQuiz()
      expect(component.passPercentage).toBe(70)
    })

    it('should show a snackbar and set error status on failure', () => {
      mockQuizService.submitQuizV2.mockReturnValue(throwError(() => new Error('fail')))
      component.ngOnInit()
      component.submitQuiz()
      expect(mockSnackBar.open).toHaveBeenCalled()
      expect(component.fetchingResultsStatus).toBe('error')
    })
  })

  describe('calculateResults', () => {
    it('should count correct mcq answers', () => {
      component.questionAnswerHash = { q1: ['o1'] }
      component.calculateResults()
      expect(component.numCorrectAnswers).toBe(1)
    })

    it('should count incorrect mcq answers', () => {
      component.questionAnswerHash = { q1: ['o2'] }
      component.calculateResults()
      expect(component.numIncorrectAnswers).toBe(1)
    })

    it('should evaluate fitb answers correctly', () => {
      assesmentdata.questions.questions = [
        { questionId: 'q2', questionType: 'fitb', options: [{ optionId: 'o1', text: 'answer', isCorrect: true }] },
      ]
      component.questionAnswerHash = { q2: ['answer'] }
      component.calculateResults()
      expect(component.numCorrectAnswers).toBe(1)
    })
  })

  describe('checkAnswer', () => {
    it('should use checkMtfAnswer for mtf questions', () => {
      assesmentdata.questions.questions[0].questionType = 'mtf'
      component.questionAnswerHash['qslideIndex'] = 0
      component.checkAnswer()
      expect(mockQuizService.checkMtfAnswer).toHaveBeenCalled()
      expect(component.tabIndex).toBe(2)
    })

    it('should use checkAnswer for non-mtf questions', () => {
      component.questionAnswerHash['qslideIndex'] = 0
      component.checkAnswer()
      expect(mockQuizService.checkAnswer).toHaveBeenCalled()
      expect(component.tabIndex).toBe(2)
    })
  })

  describe('nextQuestion', () => {
    it('should submit when reaching the last slide', () => {
      component.totalQuestion = 1
      component.questionAnswerHash['qslideIndex'] = 1
      const submitSpy = jest.spyOn(component, 'proceedToSubmit').mockImplementation(() => undefined)
      component.nextQuestion()
      expect(submitSpy).toHaveBeenCalled()
    })

    it('should advance to the next slide otherwise', () => {
      component.totalQuestion = 2
      component.questionAnswerHash['qslideIndex'] = 0
      component.nextQuestion()
      jest.advanceTimersByTime(500)
      expect(component.activeSlideIndex).toBe(1)
    })
  })

  describe('previousQuestion', () => {
    it('should return early when already at the first slide', () => {
      mockQuizService.questionState.active_slide_index = 0
      component.previousQuestion()
      expect(mockQuizService.questionState.active_slide_index).toBe(0)
    })

    it('should move to the previous slide', () => {
      mockQuizService.questionState.active_slide_index = 1
      component.previousQuestion()
      expect(mockQuizService.questionState.active_slide_index).toBe(0)
    })
  })

  describe('timer', () => {
    it('does nothing when data is -1', () => {
      component.timer(-1)
      expect(component.timerSubscription).toBeNull()
    })

    it('sets up a timer subscription when data is positive', () => {
      assesmentdata.questions.timeLimit = 100000
      component.startTime = Date.now()
      component.timer(100000)
      expect(mockNgZone.runOutsideAngular).toHaveBeenCalled()
      expect(component.timerSubscription).toBeTruthy()
    })

    it('marks isIdeal and switches tab when time runs out', () => {
      assesmentdata.questions.timeLimit = 100
      component.timeLeft = 0.05
      component.startTime = Date.now()
      component.timer(100)
      jest.advanceTimersByTime(300)
      expect(component.isIdeal).toBe(true)
      expect(component.tabIndex).toBe(1)
      expect(component.tabActive).toBe(true)
    })
  })

  describe('submitQuiz - assessment branch', () => {
    it('sets isIdeal when questions.isAssessment is true', () => {
      assesmentdata.questions.isAssessment = true
      component.ngOnInit()
      component.submitQuiz()
      expect(component.isIdeal).toBe(true)
    })
  })

  describe('calculateResults - additional branches', () => {
    it('marks fitb answer incorrect on length mismatch', () => {
      assesmentdata.questions.questions = [
        { questionId: 'q2', questionType: 'fitb', options: [{ optionId: 'o1', text: 'answer', isCorrect: true }] },
      ]
      component.questionAnswerHash = { q2: ['a,b'] }
      component.calculateResults()
      expect(component.numIncorrectAnswers).toBe(1)
    })

    it('evaluates mtf answers as correct and incorrect', () => {
      const correctElement = {
        sourceId: 'x1',
        target: { innerHTML: 'MatchA' },
        setPaintStyle: jest.fn(),
      }
      const incorrectElement = {
        sourceId: 'x1',
        target: { innerHTML: 'Wrong' },
        setPaintStyle: jest.fn(),
      }
      assesmentdata.questions.questions = [
        {
          questionId: 'q3',
          questionType: 'mtf',
          options: [{ optionId: 'o1', isCorrect: true, match: 'MatchA' }],
        },
      ]
      component.questionAnswerHash = { q3: [[correctElement]] }
      component.calculateResults()
      expect(correctElement.setPaintStyle).toHaveBeenCalledWith({ stroke: '#357a38' })
      expect(component.numCorrectAnswers).toBe(1)

      component.questionAnswerHash = { q3: [[incorrectElement]] }
      component.calculateResults()
      expect(incorrectElement.setPaintStyle).toHaveBeenCalledWith({ stroke: '#f44336' })
      expect(component.numIncorrectAnswers).toBe(1)
    })

    it('treats mtf as untouched when selectedOptions is empty', () => {
      assesmentdata.questions.questions = [
        { questionId: 'q3', questionType: 'mtf', options: [{ optionId: 'o1', isCorrect: true, match: 'MatchA' }] },
      ]
      component.questionAnswerHash = { q3: [[]] }
      component.calculateResults()
      expect(component.numCorrectAnswers).toBe(0)
      expect(component.numIncorrectAnswers).toBe(0)
    })
  })

  describe('nextQuestion - mtf lookahead branch', () => {
    it('sets question type to mtf when next question is mtf', () => {
      component.totalQuestion = 3
      assesmentdata.questions.questions = [
        { questionId: 'q1', questionType: 'mcq' },
        { questionId: 'q2', questionType: 'mtf' },
      ]
      mockQuizService.questionState.slides = [{}, {}, {}]
      component.questionAnswerHash['qslideIndex'] = 0
      component.nextQuestion()
      jest.advanceTimersByTime(500)
      expect(mockQuizService.updateMtf.next).toHaveBeenCalledWith(true)
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe the timer and reset state', () => {
      component.ngOnInit()
      const unsubscribeSpy = jest.spyOn(component.timerSubscription as any, 'unsubscribe')
      component.ngOnDestroy()
      expect(unsubscribeSpy).toHaveBeenCalled()
      expect(component.startTime).toBe(0)
      expect(component.timeLeft).toBe(0)
    })
  })
})
