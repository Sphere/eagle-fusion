jest.mock('../../../../library/ws-widget/utils/src/public-api', () => ({
  ValueService: class {
    isXSmall$ = { subscribe: jest.fn() }
  },
  LoggerService: class { log = jest.fn(); error = jest.fn() },
}))

jest.mock('../signup/signup.service', () => ({
  SignupService: class {
    loginAPI = jest.fn()
    verifyOTP = jest.fn()
    resendOTP = jest.fn()
    fetchStartUpDetails = jest.fn()
    ssoValidateOTP = jest.fn()
    ssoValidateOrgOTP = jest.fn()
    generateOtp = jest.fn()
  },
}))

jest.mock('../create-account-modal/create-account-dialog.component', () => ({
  CreateAccountDialogComponent: class {},
}))

jest.mock('@ngx-translate/core', () => ({
  TranslateService: class { instant = jest.fn().mockImplementation((k: string) => k) },
}))

import { UntypedFormBuilder } from '@angular/forms'
import { LoginOtpComponent } from './login-otp.component'

describe('LoginOtpComponent', () => {
  let component: LoginOtpComponent
  let mockSnackBar: any
  let mockSignupService: any
  let mockDialog: any
  let mockLogger: any
  let mockCdr: any
  let mockNgZone: any

  beforeEach(() => {
    jest.useFakeTimers()
    mockSnackBar = { open: jest.fn() }
    mockSignupService = {
      loginAPI: jest.fn(),
      verifyOTP: jest.fn(),
      resendOTP: jest.fn(),
      fetchStartUpDetails: jest.fn().mockResolvedValue({ status: 200 }),
    }
    mockDialog = { open: jest.fn().mockReturnValue({ afterClosed: jest.fn().mockReturnValue({ subscribe: jest.fn() }) }) }
    mockLogger = { log: jest.fn(), error: jest.fn() }
    mockCdr = { detectChanges: jest.fn(), markForCheck: jest.fn() }
    mockNgZone = { run: jest.fn((fn: any) => fn()), runOutsideAngular: jest.fn((fn: any) => fn()) }

    component = new LoginOtpComponent(
      new UntypedFormBuilder(),
      mockSnackBar,
      mockSignupService,
      { isXSmall$: { subscribe: jest.fn() } } as any,
      mockDialog,
      mockLogger,
      { instant: jest.fn().mockImplementation((k: string) => k) } as any,
      mockCdr,
      mockNgZone,
    )
    sessionStorage.clear()
    localStorage.clear()
  })

  afterEach(() => {
    jest.useRealTimers()
    sessionStorage.clear()
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default isLoading to false', () => {
    expect(component.isLoading).toBe(false)
  })

  it('should default emailPhoneType to "phone"', () => {
    expect(component.emailPhoneType).toBe('phone')
  })

  it('should default resendTimer to 600', () => {
    expect(component.resendTimer).toBe(600)
  })

  it('should initialize form with phone OTP controls when emailPhoneType is phone', () => {
    component.emailPhoneType = 'phone'
    component.initializeForm()
    expect(component.loginOtpForm.get('otp1')).toBeTruthy()
    expect(component.loginOtpForm.get('otp2')).toBeTruthy()
    expect(component.loginOtpForm.get('otp3')).toBeTruthy()
    expect(component.loginOtpForm.get('otp4')).toBeTruthy()
  })

  it('should initialize form with code-only for email type', () => {
    component.emailPhoneType = 'email'
    component.initializeForm()
    expect(component.loginOtpForm.get('code')).toBeTruthy()
    expect(component.loginOtpForm.get('otp1')).toBeNull()
  })

  it('should set emailPhoneType from signUpdata phone (>= 10 digits)', () => {
    component.signUpdata = { value: { emailOrMobile: '9876543210' } }
    component.ngOnInit()
    expect(component.emailPhoneType).toBe('phone')
  })

  it('should set emailPhoneType from signUpdata email (< 10 digit)', () => {
    component.signUpdata = { value: { emailOrMobile: 'user@example.com' } }
    component.ngOnInit()
    expect(component.emailPhoneType).toBe('email')
  })

  it('should set loginVerification true when loginData is provided', () => {
    component.loginData = { value: { username: '9876543210' } }
    component.ngOnInit()
    expect(component.loginVerification).toBe(true)
  })

  describe('ngOnDestroy', () => {
    it('should clear timer interval on destroy', () => {
      component.startTimer()
      expect(component.interval).toBeTruthy()
      component.ngOnDestroy()
      expect(component.interval).toBeNull()
    })
  })

  describe('startTimer', () => {
    it('should reset resendTimer to 600', () => {
      component.resendTimer = 0
      component.startTimer()
      expect(component.resendTimer).toBe(600)
    })

    it('should reset resendTimerText to 10:00', () => {
      component.resendTimerText = '00:00'
      component.startTimer()
      expect(component.resendTimerText).toBe('10:00')
    })

    it('should decrement timer on each tick', () => {
      component.startTimer()
      jest.advanceTimersByTime(1000)
      expect(component.resendTimer).toBe(599)
    })

    it('should clear interval when timer reaches zero', () => {
      component.startTimer()
      jest.advanceTimersByTime(600 * 1000)
      expect(component.interval).toBeNull()
    })

    it('should set isBelowOneMinute true when resendTimer < 60', () => {
      component.startTimer()
      jest.advanceTimersByTime((600 - 59) * 1000)
      expect(component.isBelowOneMinute).toBe(true)
    })
  })

  describe('updateOtpCode', () => {
    it('should combine otp1-4 into code control', () => {
      component.emailPhoneType = 'phone'
      component.initializeForm()
      component.loginOtpForm.patchValue({ otp1: '1', otp2: '2', otp3: '3', otp4: '4' })
      component.updateOtpCode()
      expect(component.loginOtpForm.get('code')?.value).toBe('1234')
    })

    it('should log error when controls missing (email form)', () => {
      component.emailPhoneType = 'email'
      component.initializeForm()
      component.updateOtpCode()
      expect(mockLogger.error).toHaveBeenCalled()
    })
  })

  describe('moveFocus', () => {
    it('should focus next input when current has a value', () => {
      const current = { value: '1' }
      const next = { focus: jest.fn() }
      component.moveFocus(current, next)
      expect(next.focus).toHaveBeenCalled()
    })

    it('should not focus next input when current is empty', () => {
      const current = { value: '' }
      const next = { focus: jest.fn() }
      component.emailPhoneType = 'phone'
      component.initializeForm()
      component.moveFocus(current, next)
      expect(next.focus).not.toHaveBeenCalled()
    })
  })

  describe('backSpaceEvent', () => {
    it('should focus previous when Backspace on empty field', () => {
      const event = { key: 'Backspace' } as KeyboardEvent
      const current = { value: '' }
      const previous = { focus: jest.fn() }
      component.emailPhoneType = 'phone'
      component.initializeForm()
      component.backSpaceEvent(event, current, previous)
      expect(previous.focus).toHaveBeenCalled()
    })

    it('should not focus previous when field has value', () => {
      const event = { key: 'Backspace' } as KeyboardEvent
      const current = { value: '5' }
      const previous = { focus: jest.fn() }
      component.emailPhoneType = 'phone'
      component.initializeForm()
      component.backSpaceEvent(event, current, previous)
      expect(previous.focus).not.toHaveBeenCalled()
    })
  })

  describe('redirectToSignUp', () => {
    it('should emit true to redirectToParent', () => {
      const spy = jest.spyOn(component.redirectToParent, 'emit')
      component.redirectToSignUp()
      expect(spy).toHaveBeenCalledWith('true')
    })
  })

  describe('redirectToMobileLogin', () => {
    it('should emit true to redirectToParent', () => {
      const spy = jest.spyOn(component.redirectToParent, 'emit')
      component.redirectToMobileLogin()
      expect(spy).toHaveBeenCalledWith('true')
    })
  })

  describe('redirect', () => {
    it('should emit "otp" to backToCreate', () => {
      const spy = jest.spyOn(component.backToCreate, 'emit')
      component.redirect()
      expect(spy).toHaveBeenCalledWith('otp')
    })
  })

  describe('help', () => {
    it('should open dialog', () => {
      component.help()
      expect(mockDialog.open).toHaveBeenCalled()
    })
  })

  describe('handleKeyDown', () => {
    it('should open dialog on Enter key', () => {
      const event = { key: 'Enter', preventDefault: jest.fn() } as any
      component.handleKeyDown(event)
      expect(mockDialog.open).toHaveBeenCalled()
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should not open dialog for other keys', () => {
      const event = { key: 'Tab', preventDefault: jest.fn() } as any
      component.handleKeyDown(event)
      expect(mockDialog.open).not.toHaveBeenCalled()
    })
  })

  describe('resendOTP', () => {
    it('should call generateOtp with email when emailPhoneType is email', () => {
      const { of } = require('rxjs')
      mockSignupService.generateOtp = jest.fn().mockReturnValue(of({ msg: 'OTP sent 123456' }))
      component.signUpdata = { value: { emailOrMobile: 'user@test.com' } }
      component.emailPhoneType = 'email'
      component.initializeForm()
      component.resendOTP('email')
      expect(mockSignupService.generateOtp).toHaveBeenCalledWith({ email: 'user@test.com' })
    })

    it('should call generateOtp with phone when emailPhoneType is phone', () => {
      const { of } = require('rxjs')
      mockSignupService.generateOtp = jest.fn().mockReturnValue(of({ message: 'OTP sent' }))
      component.signUpdata = { value: { emailOrMobile: '9876543210' } }
      component.emailPhoneType = 'phone'
      component.initializeForm()
      component.resendOTP('phone')
      expect(mockSignupService.generateOtp).toHaveBeenCalledWith({ phone: '9876543210' })
    })

    it('should use loginData username when signUpdata is not provided', () => {
      const { of } = require('rxjs')
      mockSignupService.generateOtp = jest.fn().mockReturnValue(of({ message: 'OTP sent' }))
      component.signUpdata = null
      component.loginData = { value: { username: '9876543210' } }
      component.emailPhoneType = 'phone'
      component.initializeForm()
      component.resendOTP('phone')
      expect(mockSignupService.generateOtp).toHaveBeenCalledWith({ phone: '9876543210' })
    })
  })

  describe('verifyOtp', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'location', { writable: true, value: { href: '' } })
      component.emailPhoneType = 'phone'
      component.initializeForm()
      component.loginOtpForm.patchValue({ otp1: '1', otp2: '2', otp3: '3', otp4: '4' })
      component.updateOtpCode()
    })

    it('should call ssoValidateOTP with phone request when emailOrMobile >= 10 digits', () => {
      const { of } = require('rxjs')
      component.signUpdata = { value: { emailOrMobile: '9876543210', password: 'pass' } }
      mockSignupService.ssoValidateOTP = jest.fn().mockReturnValue(of({ msg: 'Success' }))
      component.verifyOtp()
      expect(mockSignupService.ssoValidateOTP).toHaveBeenCalledWith(expect.objectContaining({ phone: '9876543210' }))
    })

    it('should call ssoValidateOTP with email request when emailOrMobile is an email', () => {
      const { of } = require('rxjs')
      component.emailPhoneType = 'email'
      component.initializeForm()
      component.loginOtpForm.patchValue({ code: '1234' })
      component.signUpdata = { value: { emailOrMobile: 'user@test.com', password: 'pass' } }
      mockSignupService.ssoValidateOTP = jest.fn().mockReturnValue(of({ msg: 'Success' }))
      component.verifyOtp()
      expect(mockSignupService.ssoValidateOTP).toHaveBeenCalledWith(expect.objectContaining({ email: 'user@test.com' }))
    })

    it('should call ssoValidateOrgOTP when isOrgSelectiveCourse is true', () => {
      const { of } = require('rxjs')
      localStorage.setItem('isOrgSelectiveCourse', 'true')
      component.signUpdata = { value: { emailOrMobile: '9876543210', password: 'pass' } }
      mockSignupService.ssoValidateOrgOTP = jest.fn().mockReturnValue(of({ msg: 'Success' }))
      component.verifyOtp()
      expect(mockSignupService.ssoValidateOrgOTP).toHaveBeenCalled()
    })

    it('should set sessionStorage login-btn and set isLoading=false on success', () => {
      const { of } = require('rxjs')
      component.signUpdata = { value: { emailOrMobile: '9876543210', password: 'pass' } }
      mockSignupService.ssoValidateOTP = jest.fn().mockReturnValue(of({ msg: 'OTP verified' }))
      component.verifyOtp()
      expect(sessionStorage.getItem('login-btn')).toBe('clicked')
      expect(component.isLoading).toBe(false)
    })

    it('should call openSnackbar and set isLoading=false on error', () => {
      const { throwError } = require('rxjs')
      component.signUpdata = { value: { emailOrMobile: '9876543210', password: 'pass' } }
      mockSignupService.ssoValidateOTP = jest.fn().mockReturnValue(
        throwError(() => ({ error: { error: 'Invalid OTP' } }))
      )
      component.verifyOtp()
      expect(component.isLoading).toBe(false)
      expect(mockSnackBar.open).toHaveBeenCalled()
    })
  })

  describe('loginVerifyOtp', () => {
    beforeEach(() => {
      component.emailPhoneType = 'phone'
      component.initializeForm()
      component.loginOtpForm.patchValue({ otp1: '1', otp2: '2', otp3: '3', otp4: '4' })
      component.updateOtpCode()
    })

    it('should call ssoValidateOTP with phone request when username has no @', () => {
      const { of } = require('rxjs')
      component.loginData = { value: { username: '9876543210', password: 'pass' } }
      mockSignupService.ssoValidateOTP = jest.fn().mockReturnValue(of({ message: 'Success' }))
      component.loginVerifyOtp()
      expect(mockSignupService.ssoValidateOTP).toHaveBeenCalledWith(expect.objectContaining({ phone: '9876543210' }))
    })

    it('should call ssoValidateOTP with email request when username has @', () => {
      const { of } = require('rxjs')
      component.loginData = { value: { username: 'user@test.com', password: 'pass' } }
      mockSignupService.ssoValidateOTP = jest.fn().mockReturnValue(of({ message: 'Success' }))
      component.loginVerifyOtp()
      expect(mockSignupService.ssoValidateOTP).toHaveBeenCalledWith(expect.objectContaining({ email: 'user@test.com' }))
    })

    it('should call ssoValidateOrgOTP when isOrgSelectiveCourse is true', () => {
      const { of } = require('rxjs')
      localStorage.setItem('isOrgSelectiveCourse', 'true')
      component.loginData = { value: { username: '9876543210', password: 'pass' } }
      mockSignupService.ssoValidateOrgOTP = jest.fn().mockReturnValue(of({ message: 'Success' }))
      component.loginVerifyOtp()
      expect(mockSignupService.ssoValidateOrgOTP).toHaveBeenCalled()
    })

    it('should open snackbar on success', () => {
      const { of } = require('rxjs')
      component.loginData = { value: { username: '9876543210', password: 'pass' } }
      mockSignupService.ssoValidateOTP = jest.fn().mockReturnValue(of({ message: 'Verified' }))
      component.loginVerifyOtp()
      expect(mockSnackBar.open).toHaveBeenCalled()
    })

    it('should call openSnackbar on error', () => {
      const { throwError } = require('rxjs')
      component.loginData = { value: { username: 'user@test.com', password: 'pass' } }
      mockSignupService.ssoValidateOTP = jest.fn().mockReturnValue(
        throwError(() => ({ error: { error: 'OTP error', message: '' } }))
      )
      component.loginVerifyOtp()
      expect(mockSnackBar.open).toHaveBeenCalled()
    })
  })

  describe('resendOTP error path', () => {
    it('should open snackbar on generateOtp error', () => {
      const { throwError } = require('rxjs')
      mockSignupService.generateOtp = jest.fn().mockReturnValue(
        throwError(() => ({ error: { error: 'Failed to resend' } }))
      )
      component.signUpdata = { value: { emailOrMobile: 'user@test.com' } }
      component.emailPhoneType = 'email'
      component.initializeForm()
      component.resendOTP('email')
      expect(mockSnackBar.open).toHaveBeenCalled()
    })
  })
})
