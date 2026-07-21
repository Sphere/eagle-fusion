const mockJsPlumbInstance = {
  bind: jest.fn(),
  getSelector: jest.fn().mockReturnValue([]),
  batch: jest.fn((cb: () => void) => cb()),
  makeSource: jest.fn(),
  makeTarget: jest.fn(),
  getAllConnections: jest.fn().mockReturnValue([]),
  repaintEverything: jest.fn(),
  deleteEveryConnection: jest.fn(),
  reset: jest.fn(),
  connect: jest.fn(),
}

jest.mock('jsplumb', () => ({
  jsPlumb: {
    getInstance: jest.fn(() => mockJsPlumbInstance),
  },
}))

import { Subject } from 'rxjs'
import { ViewAssesmentQuestionsComponent } from './view-assesment-questions.component'

describe('ViewAssesmentQuestionsComponent', () => {
  let component: ViewAssesmentQuestionsComponent
  const mockDomSanitizer = { trustHtml: jest.fn((v: string) => v) } as any
  let nativeElement: any
  let mockElementRef: any
  let updateMtf$: Subject<any>
  let mockQuizService: any

  const buildQuestion = (overrides: any = {}) => ({
    multiSelection: false,
    question: '<p>Q</p>',
    questionId: 'q1',
    options: [{ optionId: 'o1', text: 'opt', isCorrect: false }],
    ...overrides,
  })

  beforeEach(() => {
    jest.clearAllMocks()
    nativeElement = { querySelector: jest.fn() }
    mockElementRef = { nativeElement }
    updateMtf$ = new Subject<any>()
    mockQuizService = { updateMtf$ }
    component = new ViewAssesmentQuestionsComponent(mockDomSanitizer, mockElementRef, mockQuizService)
    component.question = buildQuestion()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should prepare fitb inputs', () => {
      component.question = buildQuestion({ questionType: 'fitb', question: '<input/>' })
      component.ngOnInit()
      expect(mockDomSanitizer.trustHtml).toHaveBeenCalled()
      expect(component.correctOption.length).toBe(1)
    })

    it('should build matchHintDisplay for mtf', () => {
      component.question = buildQuestion({
        questionType: 'mtf',
        options: [{ optionId: 'o1', text: '', isCorrect: false, match: 'm1', hint: 'h1' }],
      })
      component.ngOnInit()
      expect(component.matchHintDisplay.length).toBe(1)
    })

    it('should init jsPlumb when updateMtf$ emits true', () => {
      component.question = buildQuestion({ questionType: 'mtf' })
      component.ngOnInit()
      updateMtf$.next(true)
      expect(component.jsPlumbInstance).toBe(mockJsPlumbInstance)
    })

    it('should reset jsPlumb connections when updateMtf$ emits false', () => {
      component.ngOnInit()
      component.jsPlumbInstance = mockJsPlumbInstance
      updateMtf$.next(false)
      expect(mockJsPlumbInstance.reset).toHaveBeenCalled()
      expect(mockJsPlumbInstance.deleteEveryConnection).toHaveBeenCalled()
    })

    it('should ignore undefined emissions', () => {
      component.ngOnInit()
      expect(() => updateMtf$.next(undefined)).not.toThrow()
    })
  })

  describe('initFitb', () => {
    it('should attach change listeners for fitb inputs', () => {
      const addEventListener = jest.fn()
      nativeElement.querySelector.mockReturnValue({ addEventListener })
      component.question = buildQuestion({ questionType: 'fitb', question: '<input/>' })
      component.initFitb()
      expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('should do nothing for non-fitb questions', () => {
      component.question = buildQuestion({ questionType: 'mcq' })
      expect(() => component.initFitb()).not.toThrow()
    })
  })

  describe('initJsPlump', () => {
    it('should set up bindings when answers exist for mtf', () => {
      mockJsPlumbInstance.getSelector.mockReturnValue(['a'])
      component.question = buildQuestion({ questionType: 'mtf' })
      component.initJsPlump()
      expect(mockJsPlumbInstance.makeSource).toHaveBeenCalled()
    })

    it('should skip bindings when no answers exist for mtf', () => {
      mockJsPlumbInstance.getSelector.mockReturnValue([])
      component.question = buildQuestion({ questionType: 'mtf' })
      component.initJsPlump()
      expect(mockJsPlumbInstance.makeSource).not.toHaveBeenCalled()
    })

    it('should attach change listener for fitb', () => {
      const addEventListener = jest.fn()
      nativeElement.querySelector.mockReturnValue({ addEventListener })
      component.question = buildQuestion({ questionType: 'fitb', question: '<input/>' })
      component.initJsPlump()
      expect(addEventListener).toHaveBeenCalled()
    })
  })

  describe('ngAfterViewInit', () => {
    it('should create jsPlumb instance and attach fitb listeners', () => {
      const addEventListener = jest.fn()
      nativeElement.querySelector.mockReturnValue({ addEventListener })
      component.question = buildQuestion({ questionType: 'fitb', question: '<input/>' })
      component.ngAfterViewInit()
      expect(component.jsPlumbInstance).toBe(mockJsPlumbInstance)
      expect(addEventListener).toHaveBeenCalled()
    })
  })

  describe('numConnections', () => {
    it('should return 0 without jsPlumbInstance', () => {
      expect(component.numConnections).toBe(0)
    })
  })

  describe('isSelected / markQuestion', () => {
    it('should detect selection', () => {
      component.itemSelectedList = ['o1']
      expect(component.isSelected({ optionId: 'o1' } as any)).toBe(true)
    })

    it('should toggle marked question', () => {
      component.markedQuestions = new Set()
      component.markQuestion()
      expect(component.isQuestionMarked()).toBe(true)
    })
  })

  describe('onEntryInBlank', () => {
    it('should emit lower-cased joined values', () => {
      const input = document.createElement('input')
      input.id = 'q10'
      input.value = 'ANSWER'
      document.body.appendChild(input)
      nativeElement.querySelector.mockReturnValue(input)
      component.question = buildQuestion({ question: '<input/>', options: [{ optionId: 'o1', text: 'answer', isCorrect: false }] })
      const emitSpy = jest.spyOn(component.itemSelected, 'emit')
      component.onEntryInBlank('q10')
      expect(emitSpy).toHaveBeenCalledWith('answer')
      document.body.removeChild(input)
    })
  })

  describe('changeColor', () => {
    it('should alert when connections are insufficient', () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => undefined)
      component.question = buildQuestion({ options: [{ optionId: 'o1', text: '', isCorrect: false }, { optionId: 'o2', text: '', isCorrect: false }] })
      component.jsPlumbInstance = mockJsPlumbInstance
      mockJsPlumbInstance.getAllConnections.mockReturnValue([])
      component.changeColor()
      expect(alertSpy).toHaveBeenCalled()
      alertSpy.mockRestore()
    })
  })

  describe('matchShowAnswer', () => {
    it('should connect matching options', () => {
      component.question = buildQuestion({ questionType: 'mtf', options: [{ optionId: 'o1', match: 'm1', text: '', isCorrect: false }] })
      mockJsPlumbInstance.getSelector.mockReturnValue([{ innerText: 'm1' }])
      mockJsPlumbInstance.getAllConnections.mockReturnValue([
        { sourceId: 'c11', target: { innerHTML: 'm1' }, setPaintStyle: jest.fn() },
      ])
      component.jsPlumbInstance = mockJsPlumbInstance
      component.matchShowAnswer()
      expect(mockJsPlumbInstance.connect).toHaveBeenCalled()
    })
  })

  describe('reset', () => {
    it('should reset color and mtf state', () => {
      component.jsPlumbInstance = mockJsPlumbInstance
      mockJsPlumbInstance.getAllConnections.mockReturnValue([{ setPaintStyle: jest.fn() }])
      component.question = buildQuestion({ questionType: 'mtf' })
      component.reset()
      expect(mockJsPlumbInstance.deleteEveryConnection).toHaveBeenCalled()
    })

    it('should reset blank borders for fitb', () => {
      nativeElement.querySelector.mockReturnValue({ setAttribute: jest.fn() })
      component.jsPlumbInstance = mockJsPlumbInstance
      mockJsPlumbInstance.getAllConnections.mockReturnValue([])
      component.question = buildQuestion({ questionType: 'fitb', question: '<input/>' })
      component.reset()
      expect(mockJsPlumbInstance.deleteEveryConnection).toHaveBeenCalled()
    })
  })

  describe('ngOnDestroy', () => {
    it('should complete the unsubscribe subject', () => {
      const nextSpy = jest.spyOn(component.unsubscribe, 'next')
      const completeSpy = jest.spyOn(component.unsubscribe, 'complete')
      component.ngOnDestroy()
      expect(nextSpy).toHaveBeenCalled()
      expect(completeSpy).toHaveBeenCalled()
    })
  })
})
