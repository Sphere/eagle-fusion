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
import { ViewQuizQuestionComponent } from './view-quiz-question.component'

describe('ViewQuizQuestionComponent', () => {
  let component: ViewQuizQuestionComponent
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
    component = new ViewQuizQuestionComponent(mockDomSanitizer, mockElementRef, mockQuizService)
    component.artifactUrl = 'http://host/path/artifact.zip'
    component.question = buildQuestion()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should rewrite embedded image src', () => {
      component.question = buildQuestion({ question: '<img src="/img.png">' })
      component.ngOnInit()
      expect(component.question.question).toContain('src=')
    })

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

    it('should reset connections when updateMtf$ emits false', () => {
      component.ngOnInit()
      component.jsPlumbInstance = mockJsPlumbInstance
      updateMtf$.next(false)
      expect(mockJsPlumbInstance.reset).toHaveBeenCalled()
      expect(mockJsPlumbInstance.deleteEveryConnection).toHaveBeenCalled()
    })
  })

  describe('initFitb', () => {
    it('should attach change listeners', () => {
      const addEventListener = jest.fn()
      nativeElement.querySelector.mockReturnValue({ addEventListener })
      component.question = buildQuestion({ questionType: 'fitb', question: '<input/>' })
      component.initFitb()
      expect(addEventListener).toHaveBeenCalled()
    })
  })

  describe('initJsPlump', () => {
    it('should set up bindings when answers exist for mtf', () => {
      mockJsPlumbInstance.getSelector.mockReturnValue(['a'])
      component.question = buildQuestion({ questionType: 'mtf' })
      component.initJsPlump()
      expect(mockJsPlumbInstance.makeSource).toHaveBeenCalled()
    })

    it('should skip bindings when no answers', () => {
      mockJsPlumbInstance.getSelector.mockReturnValue([])
      component.question = buildQuestion({ questionType: 'mtf' })
      component.initJsPlump()
      expect(mockJsPlumbInstance.makeSource).not.toHaveBeenCalled()
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

  describe('isSelected / markQuestion', () => {
    it('should detect selection', () => {
      component.itemSelectedList = ['o1']
      expect(component.isSelected({ optionId: 'o1' } as any)).toBe(true)
    })

    it('should toggle marked question', () => {
      component.markedQuestions = new Set()
      component.markQuestion()
      expect(component.isQuestionMarked()).toBe(true)
      component.markQuestion()
      expect(component.isQuestionMarked()).toBe(false)
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
    it('should connect matching options with extra Top anchor', () => {
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
  })

  describe('initJsPlump bind callbacks', () => {
    it('emits itemSelected on connection bind', () => {
      mockJsPlumbInstance.getSelector.mockReturnValue(['a'])
      component.question = buildQuestion({ questionType: 'mtf' })
      const emitSpy = jest.spyOn(component.itemSelected, 'emit')
      component.initJsPlump()
      const connectionCb = mockJsPlumbInstance.bind.mock.calls.find((c: any) => c[0] === 'connection')[1]
      connectionCb({}, {})
      expect(emitSpy).toHaveBeenCalled()
    })

    it('resets border color on connectionDetached', () => {
      mockJsPlumbInstance.getSelector.mockReturnValue(['a'])
      component.question = buildQuestion({ questionType: 'mtf' })
      mockJsPlumbInstance.getAllConnections.mockReturnValue([])
      component.initJsPlump()
      const detachedCb = mockJsPlumbInstance.bind.mock.calls.find((c: any) => c[0] === 'connectionDetached')[1]
      expect(() => detachedCb({ sourceId: 's1', targetId: 't1' }, {})).not.toThrow()
    })

    it('resets border colors on connectionMoved', () => {
      mockJsPlumbInstance.getSelector.mockReturnValue(['a'])
      component.question = buildQuestion({ questionType: 'mtf' })
      mockJsPlumbInstance.getAllConnections.mockReturnValue([])
      component.initJsPlump()
      const movedCb = mockJsPlumbInstance.bind.mock.calls.find((c: any) => c[0] === 'connectionMoved')[1]
      expect(() => movedCb({ originalSourceId: 's1', newSourceId: 's2', originalTargetId: 't1' }, {})).not.toThrow()
    })
  })

  describe('numConnections', () => {
    it('returns 0 when jsPlumbInstance is not set', () => {
      component.jsPlumbInstance = null
      expect(component.numConnections).toBe(0)
    })

    it('returns the number of connections when jsPlumbInstance is set', () => {
      component.jsPlumbInstance = mockJsPlumbInstance
      mockJsPlumbInstance.getAllConnections.mockReturnValue([{}, {}])
      expect(component.numConnections).toBe(2)
    })
  })

  describe('setBorderColorById / setBorderColor', () => {
    it('sets border color on an existing element by id', () => {
      const el = document.createElement('div')
      el.id = 'elem1'
      document.body.appendChild(el)
      component.setBorderColorById('elem1', 'red')
      expect(el.style.borderColor).toBe('red')
      document.body.removeChild(el)
    })

    it('does nothing when element or color is missing', () => {
      expect(() => component.setBorderColorById('missing', 'red')).not.toThrow()
      const el = document.createElement('div')
      el.id = 'elem2'
      document.body.appendChild(el)
      component.setBorderColorById('elem2', null)
      document.body.removeChild(el)
    })

    it('sets border color on source and target elements', () => {
      const source = document.createElement('div')
      source.id = 'src1'
      const target = document.createElement('div')
      target.id = 'tgt1'
      document.body.appendChild(source)
      document.body.appendChild(target)
      component.setBorderColor({ sourceId: 'src1', targetId: 'tgt1' } as any, 'blue')
      expect(source.style.borderColor).toBe('blue')
      expect(target.style.borderColor).toBe('blue')
      document.body.removeChild(source)
      document.body.removeChild(target)
    })
  })

  describe('onResize / repaintEveryThing', () => {
    it('repaints jsPlumb for mtf questions', () => {
      component.question = buildQuestion({ questionType: 'mtf' })
      component.jsPlumbInstance = mockJsPlumbInstance
      component.onResize()
      component.repaintEveryThing()
      expect(mockJsPlumbInstance.repaintEverything).toHaveBeenCalledTimes(2)
    })

    it('does nothing for non-mtf questions', () => {
      component.question = buildQuestion({ questionType: 'mcq' })
      component.jsPlumbInstance = mockJsPlumbInstance
      component.onResize()
      expect(mockJsPlumbInstance.repaintEverything).not.toHaveBeenCalled()
    })
  })

  describe('ifFillInTheBlankCorrect', () => {
    it('marks correctOption true and unTouchedBlank false for a matching answer', () => {
      const input = document.createElement('input')
      input.id = 'q10'
      input.value = 'answer'
      document.body.appendChild(input)
      component.question = buildQuestion({ options: [{ optionId: 'o1', text: 'answer', isCorrect: false }] })
      component.ifFillInTheBlankCorrect('q10')
      expect(component.correctOption[0]).toBe(true)
      expect(component.unTouchedBlank[0]).toBe(false)
      document.body.removeChild(input)
    })

    it('marks correctOption false for a non-matching answer', () => {
      const input = document.createElement('input')
      input.id = 'q10'
      input.value = 'wrong'
      document.body.appendChild(input)
      component.question = buildQuestion({ options: [{ optionId: 'o1', text: 'answer', isCorrect: false }] })
      component.ifFillInTheBlankCorrect('q10')
      expect(component.correctOption[0]).toBe(false)
      document.body.removeChild(input)
    })

    it('marks unTouchedBlank true for an empty answer', () => {
      const input = document.createElement('input')
      input.id = 'q10'
      input.value = ''
      document.body.appendChild(input)
      component.question = buildQuestion({ options: [{ optionId: 'o1', text: 'answer', isCorrect: false }] })
      component.ifFillInTheBlankCorrect('q10')
      expect(component.unTouchedBlank[0]).toBe(true)
      document.body.removeChild(input)
    })
  })

  describe('functionChangeBlankBorder / resetBlankBorder', () => {
    it('applies green border for correct touched blanks', () => {
      const setAttribute = jest.fn()
      nativeElement.querySelector.mockReturnValue({ setAttribute })
      component.question = buildQuestion({ questionType: 'fitb', question: '<input/>' })
      component.correctOption = [true]
      component.unTouchedBlank = [false]
      component.functionChangeBlankBorder()
      expect(setAttribute).toHaveBeenCalledWith('style', expect.stringContaining('#357a38'))
    })

    it('applies red border for incorrect touched blanks', () => {
      const setAttribute = jest.fn()
      nativeElement.querySelector.mockReturnValue({ setAttribute })
      component.question = buildQuestion({ questionType: 'fitb', question: '<input/>' })
      component.correctOption = [false]
      component.unTouchedBlank = [false]
      component.functionChangeBlankBorder()
      expect(setAttribute).toHaveBeenCalledWith('style', expect.stringContaining('#f44336'))
    })

    it('applies default border for untouched blanks', () => {
      const setAttribute = jest.fn()
      nativeElement.querySelector.mockReturnValue({ setAttribute })
      component.question = buildQuestion({ questionType: 'fitb', question: '<input/>' })
      component.correctOption = [false]
      component.unTouchedBlank = [true]
      component.functionChangeBlankBorder()
      expect(setAttribute).toHaveBeenCalled()
    })

    it('resets blank borders for all inputs', () => {
      const setAttribute = jest.fn()
      nativeElement.querySelector.mockReturnValue({ setAttribute })
      component.question = buildQuestion({ question: '<input/>' })
      component.resetBlankBorder()
      expect(setAttribute).toHaveBeenCalled()
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
