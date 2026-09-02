const mockJsPlumbInstance = {
  bind: jest.fn(),
  getSelector: jest.fn().mockReturnValue([]),
  batch: jest.fn((cb: () => void) => cb()),
  makeSource: jest.fn(),
  makeTarget: jest.fn(),
  getAllConnections: jest.fn().mockReturnValue([]),
  repaintEverything: jest.fn(),
  deleteEveryConnection: jest.fn(),
  connect: jest.fn(),
}

jest.mock('jsplumb', () => ({
  jsPlumb: {
    getInstance: jest.fn(() => mockJsPlumbInstance),
  },
}))

import { QuestionComponent } from './question.component'

describe('QuestionComponent', () => {
  let component: QuestionComponent
  const mockDomSanitizer = { trustHtml: jest.fn((v: string) => v) } as any
  let nativeElement: any
  let mockElementRef: any

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
    component = new QuestionComponent(mockDomSanitizer, mockElementRef)
    component.artifactUrl = 'http://host/path/artifact.zip'
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should handle plain question with no image tags', () => {
      component.question = buildQuestion()
      expect(() => component.ngOnInit()).not.toThrow()
    })

    it('should rewrite image src for embedded images', () => {
      component.question = buildQuestion({ question: '<img src="/img.png">' })
      component.ngOnInit()
      expect(component.question.question).toContain('src=')
    })

    it('should prepare fitb inputs and mark safeQuestion', () => {
      component.question = buildQuestion({ questionType: 'fitb', question: '<input/> blank' })
      component.ngOnInit()
      expect(mockDomSanitizer.trustHtml).toHaveBeenCalled()
      expect(component.correctOption.length).toBe(1)
      expect(component.unTouchedBlank).toEqual([true])
    })

    it('should shuffle options and build matchHintDisplay for mtf', () => {
      component.question = buildQuestion({
        questionType: 'mtf',
        options: [
          { optionId: 'o1', text: 'a', isCorrect: false, match: 'm1', hint: 'h1' },
          { optionId: 'o2', text: 'b', isCorrect: false, match: 'm2' },
        ],
      })
      component.ngOnInit()
      expect(component.matchHintDisplay.length).toBe(1)
    })
  })

  describe('ngAfterViewInit', () => {
    it('should set up jsPlumb bindings for mtf questions', () => {
      component.question = buildQuestion({ questionType: 'mtf' })
      component.ngAfterViewInit()
      expect(component.jsPlumbInstance).toBe(mockJsPlumbInstance)
      expect(mockJsPlumbInstance.bind).toHaveBeenCalledWith('connection', expect.any(Function))
    })

    it('should attach change listeners for fitb questions', () => {
      const addEventListener = jest.fn()
      nativeElement.querySelector.mockReturnValue({ addEventListener })
      component.question = buildQuestion({ questionType: 'fitb', question: '<input/>' })
      component.ngAfterViewInit()
      expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('should do nothing for other question types', () => {
      component.question = buildQuestion({ questionType: 'mcq' })
      expect(() => component.ngAfterViewInit()).not.toThrow()
    })
  })

  describe('numConnections', () => {
    it('should return 0 when no jsPlumbInstance', () => {
      expect(component.numConnections).toBe(0)
    })

    it('should return connection count when jsPlumbInstance exists', () => {
      component.jsPlumbInstance = mockJsPlumbInstance
      mockJsPlumbInstance.getAllConnections.mockReturnValue([1, 2])
      expect(component.numConnections).toBe(2)
    })
  })

  describe('isSelected', () => {
    it('should return true when option is in itemSelectedList', () => {
      component.itemSelectedList = ['o1']
      expect(component.isSelected({ optionId: 'o1' } as any)).toBe(true)
    })

    it('should return false when option is not selected', () => {
      component.itemSelectedList = []
      expect(component.isSelected({ optionId: 'o1' } as any)).toBe(false)
    })
  })

  describe('markQuestion / isQuestionMarked', () => {
    it('should mark and unmark a question', () => {
      component.question = buildQuestion()
      component.markedQuestions = new Set()
      component.markQuestion()
      expect(component.isQuestionMarked()).toBe(true)
      component.markQuestion()
      expect(component.isQuestionMarked()).toBe(false)
    })
  })

  describe('setBorderColorById / setBorderColor', () => {
    it('should set border color by id when element and color exist', () => {
      const el = document.createElement('div')
      el.id = 'el1'
      document.body.appendChild(el)
      component.setBorderColorById('el1', 'red')
      expect(el.style.borderColor).toBe('red')
      document.body.removeChild(el)
    })

    it('should not throw when element missing', () => {
      expect(() => component.setBorderColorById('missing', 'red')).not.toThrow()
    })

    it('should set border color on source/target elements', () => {
      const source = document.createElement('div')
      source.id = 'src'
      const target = document.createElement('div')
      target.id = 'tgt'
      document.body.appendChild(source)
      document.body.appendChild(target)
      component.setBorderColor({ sourceId: 'src', targetId: 'tgt' } as any, 'blue')
      expect(source.style.borderColor).toBe('blue')
      expect(target.style.borderColor).toBe('blue')
      document.body.removeChild(source)
      document.body.removeChild(target)
    })
  })

  describe('onResize / repaintEveryThing', () => {
    it('should repaint jsPlumb for mtf questions on resize', () => {
      component.question = buildQuestion({ questionType: 'mtf' })
      component.jsPlumbInstance = mockJsPlumbInstance
      component.onResize()
      expect(mockJsPlumbInstance.repaintEverything).toHaveBeenCalled()
    })

    it('should not repaint for non-mtf questions', () => {
      component.question = buildQuestion({ questionType: 'mcq' })
      component.jsPlumbInstance = mockJsPlumbInstance
      component.repaintEveryThing()
      expect(mockJsPlumbInstance.repaintEverything).not.toHaveBeenCalled()
    })
  })

  describe('ifFillInTheBlankCorrect', () => {
    it('should mark correct option when values match', () => {
      component.question = buildQuestion({ options: [{ optionId: 'o1', text: 'answer', isCorrect: false }] })
      const input = document.createElement('input')
      input.id = 'q10'
      input.value = 'Answer'
      document.body.appendChild(input)
      component.ifFillInTheBlankCorrect('q10')
      expect(component.correctOption[0]).toBe(true)
      expect(component.unTouchedBlank[0]).toBe(false)
      document.body.removeChild(input)
    })

    it('should mark untouched when value is empty', () => {
      component.question = buildQuestion({ options: [{ optionId: 'o1', text: 'answer', isCorrect: false }] })
      const input = document.createElement('input')
      input.id = 'q10'
      input.value = ''
      document.body.appendChild(input)
      component.ifFillInTheBlankCorrect('q10')
      expect(component.unTouchedBlank[0]).toBe(true)
      document.body.removeChild(input)
    })
  })

  describe('shuffle', () => {
    it('should return an array of the same length', () => {
      const arr = [1, 2, 3, 4]
      const result = component.shuffle([...arr])
      expect(result.length).toBe(arr.length)
      expect(result.sort()).toEqual(arr.sort())
    })
  })

  describe('reset', () => {
    it('should reset blank borders for fitb', () => {
      component.question = buildQuestion({ questionType: 'fitb', question: '<input/>' })
      nativeElement.querySelector.mockReturnValue({ setAttribute: jest.fn() })
      expect(() => component.reset()).not.toThrow()
    })

    it('should reset color and mtf state for mtf', () => {
      component.question = buildQuestion({ questionType: 'mtf' })
      component.jsPlumbInstance = mockJsPlumbInstance
      mockJsPlumbInstance.getAllConnections.mockReturnValue([{ setPaintStyle: jest.fn() }])
      component.reset()
      expect(mockJsPlumbInstance.deleteEveryConnection).toHaveBeenCalled()
    })
  })

  describe('changeColor', () => {
    it('should alert when not all answers are selected', () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => undefined)
      component.question = buildQuestion({ options: [{ optionId: 'o1', text: '', isCorrect: false }, { optionId: 'o2', text: '', isCorrect: false }] })
      component.jsPlumbInstance = mockJsPlumbInstance
      mockJsPlumbInstance.getAllConnections.mockReturnValue([])
      component.changeColor()
      expect(alertSpy).toHaveBeenCalled()
      alertSpy.mockRestore()
    })

    it('should set paint style based on match correctness', () => {
      component.question = buildQuestion({ options: [{ optionId: 'o1', match: 'm1', text: '', isCorrect: false }] })
      const setPaintStyle = jest.fn()
      mockJsPlumbInstance.getAllConnections.mockReturnValue([
        { sourceId: 'q1', target: { innerHTML: 'm1' }, setPaintStyle, sourceId2: undefined },
      ])
      component.jsPlumbInstance = mockJsPlumbInstance
      component.changeColor()
      expect(setPaintStyle).toHaveBeenCalled()
    })
  })

  describe('matchShowAnswer', () => {
    it('should connect matching options for mtf', () => {
      component.question = buildQuestion({
        questionType: 'mtf',
        options: [{ optionId: 'o1', match: 'm1', text: '', isCorrect: false }],
      })
      mockJsPlumbInstance.getSelector.mockReturnValue([{ innerText: 'm1' }])
      mockJsPlumbInstance.getAllConnections.mockReturnValue([])
      component.jsPlumbInstance = mockJsPlumbInstance
      component.matchShowAnswer()
      expect(mockJsPlumbInstance.connect).toHaveBeenCalled()
    })

    it('should do nothing for non-mtf questions', () => {
      component.question = buildQuestion({ questionType: 'mcq' })
      component.jsPlumbInstance = mockJsPlumbInstance
      component.matchShowAnswer()
      expect(mockJsPlumbInstance.connect).not.toHaveBeenCalled()
    })
  })

  describe('functionChangeBlankBorder / resetBlankBorder', () => {
    it('should style blank inputs based on correctness state', () => {
      const setAttribute = jest.fn()
      nativeElement.querySelector.mockReturnValue({ setAttribute })
      component.question = buildQuestion({ questionType: 'fitb', question: '<input/>' })
      component.correctOption = [true]
      component.unTouchedBlank = [false]
      component.functionChangeBlankBorder()
      expect(setAttribute).toHaveBeenCalled()
    })

    it('should reset blank border styles', () => {
      const setAttribute = jest.fn()
      nativeElement.querySelector.mockReturnValue({ setAttribute })
      component.question = buildQuestion({ question: '<input/>' })
      component.resetBlankBorder()
      expect(setAttribute).toHaveBeenCalledWith('style', expect.any(String))
    })
  })

  describe('onEntryInBlank / onChange', () => {
    it('should emit joined blank values and check correctness', () => {
      const input = document.createElement('input')
      input.id = 'q10'
      input.value = 'answer'
      document.body.appendChild(input)
      nativeElement.querySelector.mockReturnValue(input)
      component.question = buildQuestion({ question: '<input/>', options: [{ optionId: 'o1', text: 'answer', isCorrect: false }] })
      const emitSpy = jest.spyOn(component.itemSelected, 'emit')
      component.onEntryInBlank('q10')
      expect(emitSpy).toHaveBeenCalled()
      document.body.removeChild(input)
    })

    it('onChange should delegate to onEntryInBlank', () => {
      const spy = jest.spyOn(component, 'onEntryInBlank').mockImplementation(() => undefined)
      component.onChange('id1', {})
      expect(spy).toHaveBeenCalledWith('id1')
    })
  })
})
