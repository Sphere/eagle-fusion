import { ViewAnswerComponent } from './view-answer.component'

describe('ViewAnswerComponent', () => {
  let component: ViewAnswerComponent
  const mockDialogRef = { close: jest.fn() } as any

  const buildComponent = (data: any) => new ViewAnswerComponent(data, mockDialogRef)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    component = buildComponent({ questions: [], userInput: {} })
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should populate questions and userInput from data', () => {
      const data = { questions: [{ questionId: 'q1' }], userInput: { q1: ['o1'] } }
      component = buildComponent(data)
      component.ngOnInit()
      expect(component.questions).toEqual(data.questions)
      expect(component.userInput).toEqual(data.userInput)
    })

    it('should default to empty questions/userInput when data has none', () => {
      component = buildComponent({})
      component.ngOnInit()
      expect(component.questions).toEqual([])
      expect(component.userInput).toEqual({})
    })

    it('should do nothing when data is falsy', () => {
      component = buildComponent(null)
      component.ngOnInit()
      expect(component.questions).toBeUndefined()
      expect(component.userInput).toBeUndefined()
    })
  })

  describe('userSelectedWrong', () => {
    beforeEach(() => {
      component = buildComponent({ questions: [], userInput: { q1: ['o1'] } })
      component.ngOnInit()
    })

    it('should return false when there are no selected options for the question', () => {
      expect(component.userSelectedWrong('q2', { optionId: 'o1', isCorrect: false })).toBe(false)
    })

    it('should return true when the selected option is incorrect', () => {
      expect(component.userSelectedWrong('q1', { optionId: 'o1', isCorrect: false })).toBe(true)
    })

    it('should return false when the selected option is correct', () => {
      expect(component.userSelectedWrong('q1', { optionId: 'o1', isCorrect: true })).toBe(false)
    })
  })

  describe('isUserAnswerCorrect', () => {
    it('should return false when no options are selected', () => {
      component = buildComponent({ questions: [], userInput: {} })
      component.ngOnInit()
      const question = { questionId: 'q1', options: [{ optionId: 'o1', isCorrect: true }], multiSelection: false }
      expect(component.isUserAnswerCorrect(question)).toBe(false)
    })

    it('should validate single-select correct answer', () => {
      component = buildComponent({ questions: [], userInput: { q1: ['o1'] } })
      component.ngOnInit()
      const question = { questionId: 'q1', options: [{ optionId: 'o1', isCorrect: true }], multiSelection: false }
      expect(component.isUserAnswerCorrect(question)).toBe(true)
    })

    it('should return false for single-select with more than one selection', () => {
      component = buildComponent({ questions: [], userInput: { q1: ['o1', 'o2'] } })
      component.ngOnInit()
      const question = { questionId: 'q1', options: [{ optionId: 'o1', isCorrect: true }], multiSelection: false }
      expect(component.isUserAnswerCorrect(question)).toBe(false)
    })

    it('should validate multi-select when all correct options are selected', () => {
      component = buildComponent({ questions: [], userInput: { q1: ['o1', 'o2'] } })
      component.ngOnInit()
      const question = {
        questionId: 'q1',
        multiSelection: true,
        options: [{ optionId: 'o1', isCorrect: true }, { optionId: 'o2', isCorrect: true }],
      }
      expect(component.isUserAnswerCorrect(question)).toBe(true)
    })

    it('should return false for multi-select when counts mismatch', () => {
      component = buildComponent({ questions: [], userInput: { q1: ['o1'] } })
      component.ngOnInit()
      const question = {
        questionId: 'q1',
        multiSelection: true,
        options: [{ optionId: 'o1', isCorrect: true }, { optionId: 'o2', isCorrect: true }],
      }
      expect(component.isUserAnswerCorrect(question)).toBe(false)
    })
  })

  describe('closePopup', () => {
    it('should close the dialog', () => {
      component = buildComponent({ questions: [], userInput: {} })
      component.closePopup()
      expect(mockDialogRef.close).toHaveBeenCalled()
    })
  })
})
