import { AssesmentCloseModalComponent } from './assesment-close-modal.component'

describe('AssesmentCloseModalComponent', () => {
  let component: AssesmentCloseModalComponent
  let mockDialogRef: any

  beforeEach(() => {
    mockDialogRef = { close: jest.fn() }
    component = new AssesmentCloseModalComponent(mockDialogRef, { type: 'CLOSE' })
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('closeNo should close dialog with NO event', () => {
    component.closeNo()
    expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'NO' })
  })

  it('closeYes should close dialog with CLOSE event', () => {
    component.closeYes()
    expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'CLOSE' })
  })
})
