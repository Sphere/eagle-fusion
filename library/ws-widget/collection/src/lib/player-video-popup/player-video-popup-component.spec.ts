import { of } from 'rxjs'
import { PlayerVideoPopupComponent } from './player-video-popup-component'

const mockSnackBar: any = { open: jest.fn() }
const mockDialogRef: any = { close: jest.fn() }
const mockLogger: any = { log: jest.fn() }

function createComponent(isXSmall = false, questions = [
  { text: 'Q1', options: [{ text: 'A', isCorrect: true }, { text: 'B', isCorrect: false }] },
  { text: 'Q2', options: [{ text: 'C', isCorrect: false }] },
]): PlayerVideoPopupComponent {
  const valueSvc: any = { isXSmall$: of(isXSmall) }
  return new PlayerVideoPopupComponent(valueSvc, mockSnackBar, mockDialogRef, { questions }, mockLogger)
}

describe('PlayerVideoPopupComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create and initialize answers array', () => {
    const component = createComponent()
    expect(component).toBeTruthy()
    expect(component.answers).toEqual([null, null])
    expect(component.questions.length).toBe(2)
  })

  it('should set columnView layout when isXSmall true', () => {
    const component = createComponent(true)
    component.ngOnInit()
    expect(component.layoutDirection).toBe('columnView')
  })

  it('should set rowView layout when isXSmall false', () => {
    const component = createComponent(false)
    component.ngOnInit()
    expect(component.layoutDirection).toBe('rowView')
  })

  it('should close popup on Enter key', () => {
    const component = createComponent()
    const event = { key: 'Enter', preventDefault: jest.fn() } as unknown as KeyboardEvent
    component.handleKeyDown(event)
    expect(mockDialogRef.close).toHaveBeenCalledWith('skip')
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('should close popup on space key', () => {
    const component = createComponent()
    const event = { key: ' ', preventDefault: jest.fn() } as unknown as KeyboardEvent
    component.handleKeyDown(event)
    expect(mockDialogRef.close).toHaveBeenCalledWith('skip')
  })

  it('should not close popup on other keys', () => {
    const component = createComponent()
    const event = { key: 'a', preventDefault: jest.fn() } as unknown as KeyboardEvent
    component.handleKeyDown(event)
    expect(mockDialogRef.close).not.toHaveBeenCalled()
  })

  it('should return currentQuestion based on currentIndex', () => {
    const component = createComponent()
    expect(component.currentQuestion.text).toBe('Q1')
    component.currentIndex = 1
    expect(component.currentQuestion.text).toBe('Q2')
  })

  it('should set resultMessage Correct when option isCorrect', () => {
    const component = createComponent()
    component.onOptionSelected({ text: 'A', isCorrect: true })
    expect(component.selectedOption).toEqual({ text: 'A', isCorrect: true })
    expect(component.resultMessage).toBe('Correct')
  })

  it('should set resultMessage Wrong when option not correct', () => {
    const component = createComponent()
    component.onOptionSelected({ text: 'B', isCorrect: false })
    expect(component.resultMessage).toBe('Wrong')
  })

  it('should move to previous question when currentIndex > 0', () => {
    const component = createComponent()
    component.currentIndex = 1
    component.showAnswerInfo = true
    component.moveToPrevious()
    expect(component.currentIndex).toBe(0)
    expect(component.showAnswerInfo).toBe(false)
  })

  it('should not decrement currentIndex below 0', () => {
    const component = createComponent()
    component.currentIndex = 0
    component.moveToPrevious()
    expect(component.currentIndex).toBe(0)
  })

  it('should move to next question when not at last question', () => {
    const component = createComponent()
    component.currentIndex = 0
    component.showAnswerInfo = true
    component.moveToNext()
    expect(component.currentIndex).toBe(1)
    expect(component.showAnswerInfo).toBe(false)
  })

  it('should not increment currentIndex beyond last question', () => {
    const component = createComponent()
    component.currentIndex = 1
    component.moveToNext()
    expect(component.currentIndex).toBe(1)
  })

  it('should show answer info and reset false when resultMessage Correct on submit', () => {
    const component = createComponent()
    component.resultMessage = 'Correct'
    component.submitQuiz()
    expect(component.showAnswerInfo).toBe(true)
    expect(component.showReset).toBe(false)
    expect(mockLogger.log).toHaveBeenCalled()
  })

  it('should show answer info and reset true when resultMessage Wrong on submit', () => {
    const component = createComponent()
    component.resultMessage = 'Wrong'
    component.submitQuiz()
    expect(component.showAnswerInfo).toBe(true)
    expect(component.showReset).toBe(true)
  })

  it('should not show answer info when no resultMessage on submit', () => {
    const component = createComponent()
    component.resultMessage = null
    component.submitQuiz()
    expect(component.showAnswerInfo).toBe(false)
  })

  it('should reset showReset and showAnswerInfo', () => {
    const component = createComponent()
    component.showReset = true
    component.showAnswerInfo = true
    component.reset()
    expect(component.showReset).toBe(false)
    expect(component.showAnswerInfo).toBe(false)
  })

  it('should close dialog with submit event and answers on continue', () => {
    const component = createComponent()
    component.answers = ['A', 'B']
    component.continue()
    expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'submit', answers: ['A', 'B'] })
  })

  it('should close dialog with given value on sendAction', () => {
    const component = createComponent()
    component.showAnswerInfo = true
    component.sendAction('next')
    expect(component.showAnswerInfo).toBe(false)
    expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'next' })
    expect(mockLogger.log).toHaveBeenCalledWith('value', 'next')
  })

  it('should close popup with skip on closePopup', () => {
    const component = createComponent()
    component.closePopup()
    expect(mockDialogRef.close).toHaveBeenCalledWith('skip')
  })
})
