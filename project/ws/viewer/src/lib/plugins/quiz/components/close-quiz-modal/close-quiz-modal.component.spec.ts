import { CloseQuizModalComponent } from './close-quiz-modal.component'

describe('CloseQuizModalComponent', () => {
  let component: CloseQuizModalComponent
  const mockDialogRef = { close: jest.fn() } as any
  const mockData = { type: 'quiz' } as any

  beforeEach(() => {
    jest.clearAllMocks()
    component = new CloseQuizModalComponent(mockDialogRef, mockData)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set modelType on ngOnInit', () => {
    component.ngOnInit()
    expect(component.modelType).toBe('quiz')
  })

  it('should close with NO event', () => {
    component.closeNo()
    expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'NO' })
  })

  it('should close with CLOSE event', () => {
    component.closeYes()
    expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'CLOSE' })
  })

  it('should close with RETAKE_QUIZ event', () => {
    component.restart()
    expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'RETAKE_QUIZ' })
  })
})
