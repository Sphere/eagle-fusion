jest.mock('@ws-widget/collection', () => ({
  WidgetContentService: class {},
}))

import { ConfirmmodalComponent } from './confirm-modal-component'

describe('ConfirmmodalComponent', () => {
  let component: ConfirmmodalComponent
  let mockSnackBar: any
  let mockDialogRef: any
  let mockFormBuilder: any
  let mockConfigSvc: any
  let mockValueSvc: any
  let mockContentSvc: any
  let mockLogger: any
  let mockTranslate: any
  let data: any

  beforeEach(() => {
    mockSnackBar = { open: jest.fn() }
    mockDialogRef = { close: jest.fn(), disableClose: false }
    mockFormBuilder = {
      group: jest.fn().mockReturnValue({
        controls: { review: { setValue: jest.fn(), value: '' } },
      }),
    }
    mockConfigSvc = { userProfile: { userId: 'u1' } }
    mockValueSvc = { isXSmall$: { subscribe: (fn: any) => fn(true) } }
    mockContentSvc = {
      submitCourseRating: jest.fn().mockResolvedValue({ params: { status: 'Successful' } }),
    }
    mockLogger = { log: jest.fn(), error: jest.fn(), warn: jest.fn() }
    mockTranslate = { instant: jest.fn((k: string) => k) }
    data = { request: { courseId: 'c1' } }

    component = new ConfirmmodalComponent(
      mockSnackBar,
      mockDialogRef,
      data,
      mockFormBuilder,
      mockConfigSvc,
      mockValueSvc,
      mockContentSvc,
      mockLogger,
      mockTranslate
    )
  })

  it('should create and disable dialog close', () => {
    expect(component).toBeTruthy()
    expect(mockDialogRef.disableClose).toBe(true)
  })

  it('ngOnInit should set isMobile and build form when no rating content', () => {
    component.ngOnInit()
    expect(component.isMobile).toBe(true)
    expect(mockFormBuilder.group).toHaveBeenCalled()
  })

  it('ngOnInit should populate rating and mark mandatory when rating <= 3 and no review', () => {
    component.data = {
      request: {
        courseRating: { content: [{ rating: 2, review: '' }] },
      },
    }
    component.ngOnInit()
    expect(component.selectedRating).toBe(2)
    expect(component.isMandatory).toBe(true)
  })

  it('ngOnInit should log error when content missing rating', () => {
    component.data = {
      request: {
        courseRating: { content: [{}] },
      },
    }
    component.ngOnInit()
    expect(mockLogger.error).toHaveBeenCalled()
  })

  it('redirect should close dialog with CONFIRMED event', () => {
    component.redirect()
    expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'CONFIRMED' })
  })

  it('setRating should mark mandatory when rating <=3 and review empty', () => {
    component.ratingsForm = { controls: { review: { value: '' } } } as any
    component.setRating(2)
    expect(component.selectedRating).toBe(2)
    expect(component.isMandatory).toBe(true)
  })

  it('setRating should clear mandatory when rating > 3', () => {
    component.ratingsForm = { controls: { review: { value: 'great' } } } as any
    component.setRating(5)
    expect(component.isMandatory).toBe(false)
  })

  it('submitData should call submitRating when not mandatory and rating set', () => {
    component.isMandatory = false
    component.selectedRating = 5
    component.ratingsForm = { value: { review: 'nice' } } as any
    const spy = jest.spyOn(component, 'submitRating')
    component.submitData()
    expect(spy).toHaveBeenCalled()
  })

  it('submitData should not call submitRating when mandatory', () => {
    component.isMandatory = true
    component.selectedRating = 2
    const spy = jest.spyOn(component, 'submitRating')
    component.submitData()
    expect(spy).not.toHaveBeenCalled()
  })

  it('submitRating should submit and close dialog on success', async () => {
    component.selectedRating = 5
    await component.submitRating({ value: { review: 'nice' } })
    expect(mockContentSvc.submitCourseRating).toHaveBeenCalled()
    await Promise.resolve()
    expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'CONFIRMED' })
  })

  it('submitRating should show error snackbar on non-success status', async () => {
    mockContentSvc.submitCourseRating.mockResolvedValueOnce({ params: { status: 'Failed' } })
    component.selectedRating = 5
    await component.submitRating({ value: { review: 'nice' } })
    await Promise.resolve()
    expect(mockSnackBar.open).toHaveBeenCalled()
  })

  it('submitRating should handle catch with error message', async () => {
    mockContentSvc.submitCourseRating.mockRejectedValueOnce({ error: { message: 'ERR_KEY' } })
    component.selectedRating = 5
    await component.submitRating({ value: { review: 'nice' } })
    await Promise.resolve()
    expect(mockTranslate.instant).toHaveBeenCalledWith('ERR_KEY')
  })

  it('submitRating should handle catch without error message', async () => {
    mockContentSvc.submitCourseRating.mockRejectedValueOnce({})
    component.selectedRating = 5
    await component.submitRating({ value: { review: 'nice' } })
    await Promise.resolve()
    expect(mockTranslate.instant).toHaveBeenCalledWith('ERROR_MSG1')
  })

  it('submitRating should do nothing when selectedRating not set', () => {
    component.selectedRating = undefined as any
    component.submitRating({ value: { review: '' } })
    expect(mockContentSvc.submitCourseRating).not.toHaveBeenCalled()
  })

  it('openSnackbar should open snack bar with message', () => {
    component.openSnackbar('hello')
    expect(mockSnackBar.open).toHaveBeenCalledWith('hello', 'X', { duration: 5000 })
  })
})
