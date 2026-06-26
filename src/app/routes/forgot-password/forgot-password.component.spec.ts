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

  it('should call forgotPassword for email input', () => {
    component.emailForm.get('userInput')?.setValue('test@example.com')
    component.forgotPassword()
    expect(mockSignupService.forgotPassword).toHaveBeenCalledWith(
      expect.objectContaining({ userName: 'test@example.com' }),
    )
  })

  it('should set showOtpPwd true after successful phone forgotPassword', () => {
    component.emailForm.get('userInput')?.setValue('9876543210')
    component.forgotPassword()
    expect(component.showOtpPwd).toBe(true)
  })

  it('should set showCheckEmailText true after successful email forgotPassword', () => {
    component.emailForm.get('userInput')?.setValue('user@test.com')
    component.forgotPassword()
    expect(component.showCheckEmailText).toBe(true)
  })

  it('should open snackbar on forgotPassword error', () => {
    mockSignupService.forgotPassword = jest.fn().mockReturnValue(
      throwError(() => ({ error: { message: 'User not found' } })),
    )
    component.emailForm.get('userInput')?.setValue('9876543210')
    component.forgotPassword()
    expect(mockSnackBar.open).toHaveBeenCalled()
  })

  it('should navigate to /home on resetForm', () => {
    component.resetForm()
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home'])
  })

  it('should subscribe to queryParams in gotoHome', () => {
    const subSpy = jest.fn((cb: any) => cb({}))
    mockRoute.queryParams = { subscribe: subSpy }
    component.gotoHome()
    expect(subSpy).toHaveBeenCalled()
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/public/login'], { queryParams: {} })
  })

  it('should set isEkshamtaLogin when param present in gotoHome', () => {
    mockRoute.queryParams = { subscribe: jest.fn((cb: any) => cb({ isEkshamataLogin: 'true' })) }
    component.gotoHome()
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/public/login'], { queryParams: { ekshamtaLogin: 'true' } })
  })

  it('onSubmit should call setPasswordWithOtp', () => {
    mockSignupService.setPasswordWithOtp = jest.fn().mockReturnValue(of({ response: 'OK', link: '/home' }))
    component.forgotPasswordForm.patchValue({ otp: '123456' })
    component.onSubmit()
    expect(mockSignupService.setPasswordWithOtp).toHaveBeenCalled()
  })

  it('resendOtpEnablePostTimer should set counter to 60', () => {
    jest.useFakeTimers()
    component.resendOtpEnablePostTimer()
    expect(component.counter).toBe(60)
    jest.useRealTimers()
  })

  it('ngOnInit should call resendOtpEnablePostTimer', () => {
    jest.useFakeTimers()
    const spy = jest.spyOn(component, 'resendOtpEnablePostTimer')
    component.ngOnInit()
    expect(spy).toHaveBeenCalled()
    jest.useRealTimers()
  })

  it('should open snackbar on email forgotPassword error', () => {
    mockSignupService.forgotPassword = jest.fn().mockReturnValue(
      throwError(() => ({ error: { message: 'Email not found' } })),
    )
    component.emailForm.get('userInput')?.setValue('user@test.com')
    component.forgotPassword()
    expect(mockSnackBar.open).toHaveBeenCalled()
  })

  it('onSubmit should open snackbar on error', () => {
    mockSignupService.setPasswordWithOtp = jest.fn().mockReturnValue(
      throwError(() => ({ error: { message: 'OTP invalid' } })),
    )
    component.forgotPasswordForm.patchValue({ otp: '000000' })
    component.onSubmit()
    expect(mockSnackBar.open).toHaveBeenCalled()
  })

  it('onSubmit should call window.open after 2 seconds when response.link exists', () => {
    jest.useFakeTimers()
    const openSpy = jest.fn()
    Object.defineProperty(window, 'open', { writable: true, value: openSpy })
    mockSignupService.setPasswordWithOtp = jest.fn().mockReturnValue(of({ response: 'OK', link: '/home' }))
    component.forgotPasswordForm.patchValue({ otp: '123456' })
    component.onSubmit()
    jest.advanceTimersByTime(2500)
    expect(openSpy).toHaveBeenCalledWith('/home', '_self')
    jest.useRealTimers()
  })

  it('resendOtpEnablePostTimer setTimeout should set disableResendButton true', () => {
    jest.useFakeTimers()
    component.resendOtpEnablePostTimer()
    jest.advanceTimersByTime(1100)
    expect(component.disableResendButton).toBe(true)
    jest.useRealTimers()
  })

  it('resendOtpEnablePostTimer setInterval should decrement counter and set resendOTPbtn text', () => {
    jest.useFakeTimers()
    component.resendOtpEnablePostTimer()
    jest.advanceTimersByTime(2100) // advance 2 ticks past counter start of 60
    expect(component.counter).toBeLessThan(60)
    jest.useRealTimers()
  })

  it('resendOtpEnablePostTimer should clearInterval when counter < 0', () => {
    jest.useFakeTimers()
    component.resendOtpEnablePostTimer()
    jest.advanceTimersByTime(65000) // advance 65 seconds to let counter go below 0
    expect(component.disableResendButton).toBe(false)
    expect(component.resendOTPbtn).toBe('Resend OTP')
    jest.useRealTimers()
  })
})
