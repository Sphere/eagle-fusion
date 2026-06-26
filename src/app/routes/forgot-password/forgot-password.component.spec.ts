jest.mock('../signup/signup.service', () => ({
  SignupService: class {
    forgotPassword = jest.fn()
    resetPassword = jest.fn()
    resendOTP = jest.fn()
  },
}))

jest.mock('@ngx-translate/core', () => ({
  TranslateService: class {
    instant = jest.fn().mockImplementation((k: string) => k)
  },
}))

import { UntypedFormBuilder } from '@angular/forms'
import { of, throwError } from 'rxjs'
import { ForgotPasswordComponent } from './forgot-password.component'

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent
  let mockRouter: any
  let mockSignupService: any
  let mockSnackBar: any
  let mockRoute: any
  let mockTranslate: any
  let mockCdr: any
  let mockNgZone: any

  beforeEach(() => {
    mockRouter = { navigate: jest.fn() }
    mockSignupService = {
      forgotPassword: jest.fn().mockReturnValue(of({ message: 'OTP sent' })),
      resetPassword: jest.fn().mockReturnValue(of({ message: 'Success' })),
      resendOTP: jest.fn().mockReturnValue(of({ message: 'Resent' })),
    }
    mockSnackBar = { open: jest.fn() }
    mockRoute = { queryParams: { subscribe: jest.fn() } }
    mockTranslate = { instant: jest.fn().mockImplementation((k: string) => k) }
    mockCdr = { detectChanges: jest.fn() }
    mockNgZone = { run: jest.fn((fn: any) => fn()) }

    component = new ForgotPasswordComponent(
      mockRouter,
      mockSignupService,
      new UntypedFormBuilder(),
      mockSnackBar,
      mockRoute,
      mockTranslate,
      mockCdr,
      mockNgZone,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize forgotPasswordForm with otp control', () => {
    expect(component.forgotPasswordForm.get('otp')).toBeTruthy()
  })

  it('should initialize emailForm with userInput control', () => {
    expect(component.emailForm.get('userInput')).toBeTruthy()
  })

  it('should default showOtpPwd to false', () => {
    expect(component.showOtpPwd).toBe(false)
  })

  it('should default disableResendButton to false', () => {
    expect(component.disableResendButton).toBe(false)
  })

  it('should default resendOtpCounter to 1', () => {
    expect(component.resendOtpCounter).toBe(1)
  })

  it('should not call forgotPassword API when phone < 10 digits', () => {
    component.emailForm.get('userInput')?.setValue('12345')
    component.forgotPassword()
    expect(mockSignupService.forgotPassword).not.toHaveBeenCalled()
  })

  it('should call forgotPassword API for phone >= 10 digits', () => {
    component.emailForm.get('userInput')?.setValue('9876543210')
    component.forgotPassword()
    expect(mockSignupService.forgotPassword).toHaveBeenCalledWith(
      expect.objectContaining({ userName: '9876543210' }),
    )
  })

  it('should increment resendOtpCounter on forgotPassword with resend flag', () => {
    expect(component.resendOtpCounter).toBe(1)
    component.emailForm.get('userInput')?.setValue('9876543210')
    component.forgotPassword('resend')
    expect(component.resendOtpCounter).toBe(2)
  })

  it('should return early when resendOtpCounter reaches maxResendTry', () => {
    component.resendOtpCounter = component.maxResendTry - 1
    component.forgotPassword('resend')
    expect(mockSignupService.forgotPassword).not.toHaveBeenCalled()
  })
})
