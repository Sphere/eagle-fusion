jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class {
    userProfile = { email: 'user@example.com', userName: 'testuser' }
  },
}))

jest.mock('../../services/leadership.service', () => ({
  LeadershipService: class {
    shareTextMail = jest.fn()
  },
}))

import { of, throwError } from 'rxjs'
import { SendMailDialogComponent } from './send-mail-dialog.component'

describe('SendMailDialogComponent', () => {
  let component: SendMailDialogComponent
  let mockData: any
  let mockSnackBar: any
  let mockConfigSvc: any
  let mockLeadershipSvc: any

  beforeEach(() => {
    mockData = { emailTo: 'leader@example.com', subject: 'Hello Leader' }
    mockSnackBar = { open: jest.fn() }
    mockConfigSvc = { userProfile: { email: 'user@example.com', userName: 'testuser' } }
    mockLeadershipSvc = { shareTextMail: jest.fn().mockReturnValue(of({ invalidIds: [] })) }

    component = new SendMailDialogComponent(mockData, mockSnackBar, mockConfigSvc, mockLeadershipSvc)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize userEmail from configSvc.userProfile', () => {
    expect(component.userEmail).toBe('user@example.com')
  })

  it('should initialize userName from configSvc.userProfile', () => {
    expect(component.userName).toBe('testuser')
  })

  it('should not set userEmail when userProfile is null', () => {
    mockConfigSvc.userProfile = null
    component = new SendMailDialogComponent(mockData, mockSnackBar, mockConfigSvc, mockLeadershipSvc)
    expect(component.userEmail).toBeUndefined()
  })

  it('should default mailBodyText to empty string', () => {
    expect(component.mailBodyText).toBe('')
  })

  it('should default mailSendInProgress to false', () => {
    expect(component.mailSendInProgress).toBe(false)
  })

  it('should complete ngOnInit without error', () => {
    expect(() => component.ngOnInit()).not.toThrow()
  })

  describe('sendMail', () => {
    it('should call shareTextMail with correct emailTo', () => {
      const mockForm = { resetForm: jest.fn() }
      component.noValidIdsToast = { nativeElement: { value: 'Invalid IDs' } } as any
      component.successToast = { nativeElement: { value: 'Mail sent!' } } as any
      component.errorToast = { nativeElement: { value: 'Error!' } } as any
      component.mailBodyText = 'Hello there'
      component.sendMail(mockForm as any)
      expect(mockLeadershipSvc.shareTextMail).toHaveBeenCalledWith(
        expect.objectContaining({
          emailTo: [{ email: 'leader@example.com' }],
          subject: 'Hello Leader',
        }),
      )
    })

    it('should reset form and show success snackbar on success', () => {
      const mockForm = { resetForm: jest.fn() }
      component.successToast = { nativeElement: { value: 'Mail sent!' } } as any
      component.noValidIdsToast = { nativeElement: { value: 'No valid IDs' } } as any
      component.sendMail(mockForm as any)
      expect(mockForm.resetForm).toHaveBeenCalled()
      expect(mockSnackBar.open).toHaveBeenCalledWith('Mail sent!')
    })

    it('should show snackbar for invalid IDs', () => {
      mockLeadershipSvc.shareTextMail.mockReturnValue(of({ invalidIds: ['bad@email.com'] }))
      component.noValidIdsToast = { nativeElement: { value: 'No valid IDs' } } as any
      const mockForm = { resetForm: jest.fn() }
      component.sendMail(mockForm as any)
      expect(mockSnackBar.open).toHaveBeenCalledWith('No valid IDs')
    })

    it('should show error snackbar on failure', () => {
      mockLeadershipSvc.shareTextMail.mockReturnValue(throwError(() => new Error('Network error')))
      component.errorToast = { nativeElement: { value: 'Error sending mail' } } as any
      const mockForm = { resetForm: jest.fn() }
      component.sendMail(mockForm as any)
      expect(mockSnackBar.open).toHaveBeenCalledWith('Error sending mail')
      expect(component.mailSendInProgress).toBe(false)
    })
  })
})
