import { SubmitQuizDialogComponent } from './submit-quiz-dialog.component'

describe('SubmitQuizDialogComponent', () => {
  let component: SubmitQuizDialogComponent
  const mockDialogRef = { close: jest.fn() } as any
  const mockSubmissionState = { status: 'submitted' } as any

  beforeEach(() => {
    jest.clearAllMocks()
    component = new SubmitQuizDialogComponent(mockDialogRef, mockSubmissionState)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should expose the injected submission state', () => {
    expect(component.submissionState).toEqual(mockSubmissionState)
  })

  it('should expose the dialog ref', () => {
    expect(component.dialogRef).toBe(mockDialogRef)
  })
})
