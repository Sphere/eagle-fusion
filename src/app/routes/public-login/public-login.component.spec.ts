jest.mock('src/app/routes/signup/signup.service', () => ({
  SignupService: class {
    loginAPI = jest.fn()
    sendOTP = jest.fn()
    resendOTP = jest.fn()
    fetchStartUpDetails = jest.fn()
    ssoValidateOTP = jest.fn()
    ssoValidateOrgOTP = jest.fn()
    generateOtp = jest.fn()
  },
}))

jest.mock('@ws-widget/utils/src/public-api', () => ({
  ConfigurationsService: class {
    userProfile = null
    unMappedUser = null
    orgSelectiveCourseConfig = null
  },
  ValueService: class {
    isXSmall$ = { subscribe: jest.fn() }
  },
  LoggerService: class { log = jest.fn(); error = jest.fn() },
  TelemetryService: class {
    interactForLogin = jest.fn()
    interact = jest.fn()
  },
}))

jest.mock('library/ws-widget/utils/src/public-api', () => ({
  ConfigurationsService: class {
    userProfile = null
    unMappedUser = null
    orgSelectiveCourseConfig = null
  },
  ValueService: class {
    isXSmall$ = { subscribe: jest.fn() }
  },
  LoggerService: class { log = jest.fn(); error = jest.fn() },
  TelemetryService: class {
    interactForLogin = jest.fn()
    interact = jest.fn()
  },
}))

jest.mock('../create-account-modal/create-account-dialog.component', () => ({
  CreateAccountDialogComponent: class {},
}))

jest.mock('../../services/seo.service', () => ({
  SeoService: class { update = jest.fn() },
}))

jest.mock('@ngx-translate/core', () => ({
  TranslateService: class { instant = jest.fn().mockImplementation((k: string) => k) },
}))

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-uuid-1234'),
}))

import { FormBuilder } from '@angular/forms'
import { PublicLoginComponent } from './public-login.component'

describe('PublicLoginComponent', () => {
  let component: PublicLoginComponent
  let mockSignupService: any
  let mockSnackBar: any
  let mockDialog: any
  let mockRouter: any
  let mockRoute: any
  let mockSeoSvc: any
  let mockLogger: any
  let mockCdr: any
  let mockNgZone: any

  beforeEach(() => {
    mockSignupService = {
      loginAPI: jest.fn(),
      sendOTP: jest.fn(),
      resendOTP: jest.fn(),
      fetchStartUpDetails: jest.fn().mockResolvedValue({ status: 200 }),
    }
    mockSnackBar = { open: jest.fn() }
    mockDialog = { open: jest.fn().mockReturnValue({ afterClosed: jest.fn().mockReturnValue({ subscribe: jest.fn() }) }) }
    mockRouter = { navigate: jest.fn(), navigateByUrl: jest.fn(), url: '/public/login' }
    mockRoute = { queryParams: { subscribe: jest.fn((cb: any) => cb({})) } }
    mockSeoSvc = { update: jest.fn() }
    mockLogger = { log: jest.fn(), error: jest.fn() }
    mockCdr = { markForCheck: jest.fn(), detectChanges: jest.fn() }
    mockNgZone = { run: jest.fn((fn: any) => fn()), runOutsideAngular: jest.fn((fn: any) => fn()) }

    component = new PublicLoginComponent(
      new FormBuilder(),
      mockSignupService,
      mockSnackBar,
      { isXSmall$: { subscribe: jest.fn() } } as any,
      mockDialog,
      { userProfile: null, unMappedUser: null, orgSelectiveCourseConfig: null } as any,
      mockRouter,
      mockRoute,
      mockSeoSvc,
      { interactForLogin: jest.fn(), interact: jest.fn() } as any,
      mockLogger,
      { instant: jest.fn().mockImplementation((k: string) => k) } as any,
      mockCdr,
      mockNgZone,
    )
    localStorage.clear()
    sessionStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize loginForm with emailOrMobile control', () => {
    expect(component.loginForm.get('emailOrMobile')).toBeTruthy()
  })

  it('should initialize loginPwdForm with emailOrMobile and password', () => {
    expect(component.loginPwdForm.get('emailOrMobile')).toBeTruthy()
    expect(component.loginPwdForm.get('password')).toBeTruthy()
  })

  it('should default otpPage to false', () => {
    expect(component.otpPage).toBe(false)
  })

  it('should default hide2 to true', () => {
    expect(component.hide2).toBe(true)
  })

  it('should default emailPhoneType to "phone"', () => {
    expect(component.emailPhoneType).toBe('phone')
  })

  describe('toggle2', () => {
    it('should toggle hide2 on first call', () => {
      component.toggle2()
      expect(component.hide2).toBe(false)
      expect(component.iconChange2).toBe('fas fa-eye')
    })

    it('should toggle back on second call', () => {
      component.toggle2()
      component.toggle2()
      expect(component.hide2).toBe(true)
      expect(component.iconChange2).toBe('fas fa-eye-slash')
    })
  })

  describe('passwordOrOtp', () => {
    it('should set selectedField to given value', () => {
      component.passwordOrOtp('password')
      expect(component.selectedField).toBe('password')
    })

    it('should set selectedField to "otp"', () => {
      component.passwordOrOtp('otp')
      expect(component.selectedField).toBe('otp')
    })
  })

  describe('updateOtpCode', () => {
    it('should combine otp digits when all controls present', () => {
      component.initializeForm()
      component.OTPForm.patchValue({ otp1: '1', otp2: '2', otp3: '3', otp4: '4' })
      component.updateOtpCode()
      expect(component.OTPForm.get('OTPcode')?.value).toBe('1234')
    })
  })

  describe('ngOnDestroy', () => {
    it('should clear interval on destroy', () => {
      jest.useFakeTimers()
      component.startTimer()
      expect(component.interval).toBeTruthy()
      component.ngOnDestroy()
      expect(component.interval).toBeNull()
      jest.useRealTimers()
    })
  })

  describe('maskEmail (via reflection)', () => {
    it('should mask email name portion', () => {
      const result = (component as any).maskEmail('user@example.com')
      expect(result).toContain('@example.com')
      expect(result).toContain('*')
    })

    it('should return original if no @ symbol', () => {
      const result = (component as any).maskEmail('noatsymbol')
      expect(result).toBe('noatsymbol')
    })
  })

  describe('maskPhone (via reflection)', () => {
    it('should mask all but last 4 digits', () => {
      const result = (component as any).maskPhone('9876543210')
      expect(result).toMatch(/\*{6}3210/)
    })

    it('should return short phone as-is', () => {
      const result = (component as any).maskPhone('123')
      expect(result).toBe('123')
    })
  })

  describe('ngOnInit', () => {
    it('should call seoSvc.update with an indexable login title', () => {
      component.ngOnInit()
      const config = mockSeoSvc.update.mock.calls[0][0]
      expect(config.title).toContain('Login')
      expect(config.description).toBeTruthy()
      // The login page is the destination for the brand "…login" query cluster,
      // so it must stay indexable.
      expect(config.noindex).toBeFalsy()
    })

    it('should clear localStorage keys on init', () => {
      localStorage.setItem('loginbtn', 'true')
      localStorage.setItem('userUUID', 'some-uuid')
      component.ngOnInit()
      expect(localStorage.getItem('loginbtn')).toBeNull()
      expect(localStorage.getItem('userUUID')).toBeNull()
    })
  })

  describe('moveFocus', () => {
    it('should call next.focus() when current has 1 character', () => {
      const current = { value: '5' }
      const next = { focus: jest.fn() }
      component.moveFocus(current, next)
      expect(next.focus).toHaveBeenCalled()
    })

    it('should not focus next when current is empty', () => {
      const current = { value: '' }
      const next = { focus: jest.fn() }
      component.moveFocus(current, next)
      expect(next.focus).not.toHaveBeenCalled()
    })
  })

  describe('backSpaceEvent', () => {
    it('should call previous.focus() on Backspace with empty field', () => {
      const event = { key: 'Backspace' } as KeyboardEvent
      const current = { value: '' }
      const previous = { focus: jest.fn() }
      component.initializeForm()
      component.backSpaceEvent(event, current, previous)
      expect(previous.focus).toHaveBeenCalled()
    })

    it('should not focus previous when field has value', () => {
      const event = { key: 'Backspace' } as KeyboardEvent
      const current = { value: '1' }
      const previous = { focus: jest.fn() }
      component.initializeForm()
      component.backSpaceEvent(event, current, previous)
      expect(previous.focus).not.toHaveBeenCalled()
    })
  })

  describe('handleKeyDown', () => {
    it('should call toggle2 on Enter key', () => {
      const spy = jest.spyOn(component, 'toggle2')
      const event = { key: 'Enter', preventDefault: jest.fn() } as any
      component.handleKeyDown(event)
      expect(spy).toHaveBeenCalled()
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should not call toggle2 for other keys', () => {
      const spy = jest.spyOn(component, 'toggle2')
      const event = { key: 'Tab', preventDefault: jest.fn() } as any
      component.handleKeyDown(event)
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('handleKeyDowns', () => {
    it('should open dialog on Enter key', () => {
      const event = { key: 'Enter', preventDefault: jest.fn() } as any
      component.handleKeyDowns(event)
      expect(mockDialog.open).toHaveBeenCalled()
      expect(event.preventDefault).toHaveBeenCalled()
    })
  })

  describe('handleKeyDown1', () => {
    it('should call passwordOrOtp with type on Enter', () => {
      const spy = jest.spyOn(component, 'passwordOrOtp')
      const event = { key: 'Enter', preventDefault: jest.fn() } as any
      component.handleKeyDown1(event, 'password')
      expect(spy).toHaveBeenCalledWith('password')
      expect(event.preventDefault).toHaveBeenCalled()
    })
  })

  describe('redirect', () => {
    it('should set otpPage false when val is not createAccount', () => {
      component.otpPage = true
      component.redirect('other')
      expect(component.otpPage).toBe(false)
    })

    it('should set window.location.href for createAccount', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { ...window.location, href: '' },
      })
      component.redirect('createAccount')
      expect(window.location.href).toBe('/public/home')
    })
  })

  describe('initializeForm', () => {
    it('should create phone OTP form when emailPhoneType is phone', () => {
      component.emailPhoneType = 'phone'
      component.initializeForm()
      expect(component.OTPForm.get('otp1')).toBeTruthy()
      expect(component.OTPForm.get('otp4')).toBeTruthy()
    })

    it('should create email OTP form when emailPhoneType is email', () => {
      component.emailPhoneType = 'email'
      component.initializeForm()
      expect(component.OTPForm.get('OTPcode')).toBeTruthy()
      expect(component.OTPForm.get('otp1')).toBeNull()
    })
  })

  describe('startTimer', () => {
    it('should reset timer to 600', () => {
      jest.useFakeTimers()
      component.resendTimer = 0
      component.startTimer()
      expect(component.resendTimer).toBe(600)
      jest.useRealTimers()
    })

    it('should decrement timer on each interval tick', () => {
      jest.useFakeTimers()
      component.startTimer()
      jest.advanceTimersByTime(2000)
      expect(component.resendTimer).toBe(598)
      jest.useRealTimers()
    })
  })

  describe('openSnackbar', () => {
    it('should call snackBar.open with message', () => {
      component.openSnackbar('Test message')
      expect(mockSnackBar.open).toHaveBeenCalledWith('Test message', undefined, expect.objectContaining({ duration: 3000 }))
    })
  })

  describe('checkMobileEmail / checkMobileEmail2 / checkPassword', () => {
    it('checkMobileEmail should update validators without throwing', () => {
      expect(() => component.checkMobileEmail()).not.toThrow()
    })

    it('checkMobileEmail2 should update validators without throwing', () => {
      expect(() => component.checkMobileEmail2()).not.toThrow()
    })

    it('checkPassword should update validators without throwing', () => {
      expect(() => component.checkPassword()).not.toThrow()
    })
  })

  describe('homePage', () => {
    it('should set location.href to /page/home when unMappedUser.id is set', () => {
      Object.defineProperty(window, 'location', { writable: true, value: { href: '' } })
      component.configSvc = { unMappedUser: { id: 'user-1' }, userProfile: null, orgSelectiveCourseConfig: null } as any
      component.homePage()
      expect(window.location.href).toBe('/page/home')
    })

    it('should set location.href to /public/home when unMappedUser is null', () => {
      Object.defineProperty(window, 'location', { writable: true, value: { href: '' } })
      component.configSvc = { unMappedUser: null, userProfile: null, orgSelectiveCourseConfig: null } as any
      component.homePage()
      expect(window.location.href).toBe('/public/home')
    })
  })

  describe('userDoesnotExist', () => {
    it('should open dialog', () => {
      const closeSub = jest.fn()
      mockDialog.open = jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue({ subscribe: closeSub }),
      })
      component.userDoesnotExist()
      expect(mockDialog.open).toHaveBeenCalled()
    })
  })

  describe('submitDetails', () => {
    it('should log alert when form is invalid', () => {
      component.submitDetails({ status: 'INVALID' })
      expect(mockLogger.log).toHaveBeenCalledWith('alert')
    })

    it('should call loginAPI when form is VALID with phone input', () => {
      const { of: rxOf } = require('rxjs')
      mockSignupService.loginAPI = jest.fn().mockReturnValue(rxOf({ status: 200 }))
      mockSignupService.fetchStartUpDetails = jest.fn().mockResolvedValue({})
      component.loginPwdForm.patchValue({ emailOrMobile: '9876543210', password: 'Test@1234' })
      component.submitDetails({ status: 'VALID' })
      expect(mockSignupService.loginAPI).toHaveBeenCalled()
    })
  })

  describe('otpClick', () => {
    it('should not call sendOTP when form is invalid', () => {
      component.otpClick({ status: 'INVALID' })
      expect(mockSignupService.sendOTP).not.toHaveBeenCalled()
    })

    it('should call sendOTP with phone request when form is VALID', () => {
      const { of: rxOf } = require('rxjs')
      mockSignupService.sendOTP = jest.fn().mockReturnValue(rxOf({ userId: 'u1', msg: 'OTP sent to 9876' }))
      jest.useFakeTimers()
      component.loginForm.patchValue({ emailOrMobile: '9876543210' })
      component.otpClick({ status: 'VALID' })
      expect(mockSignupService.sendOTP).toHaveBeenCalled()
      jest.useRealTimers()
    })
  })

  describe('resendOTP', () => {
    it('should not call resendOTP service when loginForm is invalid', () => {
      component.resendOTP()
      expect(mockSignupService.resendOTP).not.toHaveBeenCalled()
    })

    it('should call resendOTP service when loginForm is valid', () => {
      const { of: rxOf } = require('rxjs')
      mockSignupService.resendOTP = jest.fn().mockReturnValue(rxOf({ msg: 'OTP resent to 3210' }))
      jest.useFakeTimers()
      component.loginForm.patchValue({ emailOrMobile: '9876543210' })
      component.resendOTP()
      expect(mockSignupService.resendOTP).toHaveBeenCalled()
      jest.useRealTimers()
    })
  })

  describe('sendLoginSuccessTelemetry', () => {
    it('should call telemetrySvc.interact', () => {
      const mockTelemetrySvc = { interact: jest.fn(), interactForLogin: jest.fn() }
      component['telemetrySvc'] = mockTelemetrySvc as any
      component.sendLoginSuccessTelemetry('phone', '****1234', '', 'otp', 'Success')
      expect(mockTelemetrySvc.interact).toHaveBeenCalled()
    })
  })

  describe('updateOtpCode email else branch', () => {
    it('should log error when email type and otp1-4 controls missing', () => {
      component.emailPhoneType = 'email'
      component.initializeForm()
      component.updateOtpCode()
      expect(mockLogger.error).toHaveBeenCalledWith('One or more OTP controls are missing')
    })
  })

  describe('getOrCreateSessionId', () => {
    it('should return existing telemetrySessionId from localStorage', () => {
      localStorage.setItem('telemetrySessionId', 'existing-session-id')
      const id = (component as any).getOrCreateSessionId()
      expect(id).toBe('existing-session-id')
    })

    it('should create new session id when not in localStorage', () => {
      localStorage.removeItem('telemetrySessionId')
      const id = (component as any).getOrCreateSessionId()
      expect(id).toBe('mock-uuid-1234')
    })
  })

  describe('constructor variants', () => {
    it('should set isEkshamtaLogin to true when ekshamtaLogin param present', () => {
      const route = { queryParams: { subscribe: jest.fn((cb: any) => cb({ ekshamtaLogin: 'true' })) } }
      const comp = new PublicLoginComponent(
        new FormBuilder(), mockSignupService, mockSnackBar,
        { isXSmall$: { subscribe: jest.fn() } } as any,
        mockDialog,
        { userProfile: null, unMappedUser: null, orgSelectiveCourseConfig: null } as any,
        mockRouter, route as any, mockSeoSvc,
        { interactForLogin: jest.fn(), interact: jest.fn() } as any,
        mockLogger,
        { instant: jest.fn().mockImplementation((k: string) => k) } as any,
        mockCdr, mockNgZone,
      )
      comp.ngOnInit()
      expect(comp.isEkshamtaLogin).toBe(true)
    })

    it('should set isOrgSelectiveCourse to true when localStorage flag is set', () => {
      localStorage.setItem('isOrgSelectiveCourse', 'true')
      const comp = new PublicLoginComponent(
        new FormBuilder(), mockSignupService, mockSnackBar,
        { isXSmall$: { subscribe: jest.fn() } } as any,
        mockDialog,
        { userProfile: null, unMappedUser: null, orgSelectiveCourseConfig: null } as any,
        mockRouter, mockRoute as any, mockSeoSvc,
        { interactForLogin: jest.fn(), interact: jest.fn() } as any,
        mockLogger,
        { instant: jest.fn().mockImplementation((k: string) => k) } as any,
        mockCdr, mockNgZone,
      )
      expect(comp.isOrgSelectiveCourse).toBe(true)
      localStorage.removeItem('isOrgSelectiveCourse')
    })
  })

  describe('userDoesnotExist afterClosed callback', () => {
    it('should navigate to createAccount when data is createAccount', () => {
      let afterClosedCb: any
      mockDialog.open = jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue({
          subscribe: jest.fn((cb: any) => { afterClosedCb = cb }),
        }),
      })
      component.userDoesnotExist()
      afterClosedCb('createAccount')
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/create-account')
    })

    it('should redirect to login_url when set and data is createAccount', () => {
      Object.defineProperty(window, 'location', { writable: true, value: { href: '' } })
      localStorage.setItem('login_url', '/org/special')
      let afterClosedCb: any
      mockDialog.open = jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue({
          subscribe: jest.fn((cb: any) => { afterClosedCb = cb }),
        }),
      })
      component.userDoesnotExist()
      afterClosedCb('createAccount')
      expect(window.location.href).toBe('/org/special')
    })
  })

  describe('submitDetails error path', () => {
    it('should call openSnackbar when loginAPI returns error', () => {
      const { throwError } = require('rxjs')
      mockSignupService.loginAPI = jest.fn().mockReturnValue(throwError(() => ({
        error: { msg: 'Login failed', error: 'Unauthorized' },
      })))
      component.loginPwdForm.patchValue({ emailOrMobile: '9876543210', password: 'Test@1234' })
      component.submitDetails({ status: 'VALID' })
      expect(mockSnackBar.open).toHaveBeenCalled()
    })

    it('should call userDoesnotExist when error message says user does not exist', () => {
      const { throwError } = require('rxjs')
      const spy = jest.spyOn(component, 'userDoesnotExist').mockImplementation(() => {})
      mockSignupService.loginAPI = jest.fn().mockReturnValue(throwError(() => ({
        error: { msg: "User doesn't exists please signup and try again" },
      })))
      component.loginPwdForm.patchValue({ emailOrMobile: '9876543210', password: 'Test@1234' })
      component.submitDetails({ status: 'VALID' })
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('submitDetails success redirect paths', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'location', { writable: true, value: { href: '' } })
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should redirect to url_before_login when set', async () => {
      const { of: rxOf } = require('rxjs')
      localStorage.setItem('url_before_login', '/saved/path')
      mockSignupService.loginAPI = jest.fn().mockReturnValue(rxOf({ status: 200 }))
      mockSignupService.fetchStartUpDetails = jest.fn().mockResolvedValue({ status: 200 })
      component.loginPwdForm.patchValue({ emailOrMobile: '9876543210', password: 'Test@1234' })
      component.submitDetails({ status: 'VALID' })
      jest.advanceTimersByTime(600)
      await Promise.resolve(); await Promise.resolve()
      expect(window.location.href).toBe('/saved/path')
    })

    it('should redirect to orgSelectiveConfig URL when org matches', async () => {
      const { of: rxOf } = require('rxjs')
      mockSignupService.loginAPI = jest.fn().mockReturnValue(rxOf({ status: 200 }))
      mockSignupService.fetchStartUpDetails = jest.fn().mockResolvedValue({ status: 200 })
      component.configSvc = {
        orgSelectiveCourseConfig: { orgId: 'org1', redirectUrl: '/org/course' },
        userProfile: { rootOrgId: 'org1' },
        unMappedUser: null,
      } as any
      component.loginPwdForm.patchValue({ emailOrMobile: 'user@test.com', password: 'Test@1234' })
      component.submitDetails({ status: 'VALID' })
      jest.advanceTimersByTime(600)
      await Promise.resolve(); await Promise.resolve()
      expect(window.location.href).toBe('/org/course')
    })

    it('should redirect to /page/home when no url_before_login and no orgConfig', async () => {
      const { of: rxOf } = require('rxjs')
      mockSignupService.loginAPI = jest.fn().mockReturnValue(rxOf({ status: 200 }))
      mockSignupService.fetchStartUpDetails = jest.fn().mockResolvedValue({ status: 200 })
      component.loginPwdForm.patchValue({ emailOrMobile: '9876543210', password: 'Test@1234' })
      component.submitDetails({ status: 'VALID' })
      jest.advanceTimersByTime(600)
      await Promise.resolve(); await Promise.resolve()
      expect(window.location.href).toBe('/page/home')
    })
  })

  describe('otpSubmit', () => {
    it('should call loginAPI for phone OTP on VALID forms', () => {
      const { of: rxOf } = require('rxjs')
      jest.useFakeTimers()
      mockSignupService.loginAPI = jest.fn().mockReturnValue(rxOf({ msg: 'OTP verified' }))
      mockSignupService.fetchStartUpDetails = jest.fn().mockResolvedValue({ status: 200 })
      component.loginForm.patchValue({ emailOrMobile: '9876543210' })
      component.initializeForm()
      component.OTPForm.patchValue({ otp1: '1', otp2: '2', otp3: '3', otp4: '4', OTPcode: '1234' })
      component.otpSubmit()
      expect(mockSignupService.loginAPI).toHaveBeenCalled()
      jest.useRealTimers()
    })

    it('should call loginAPI for email OTP on VALID forms', () => {
      const { of: rxOf } = require('rxjs')
      jest.useFakeTimers()
      component.emailPhoneType = 'email'
      component.initializeForm()
      mockSignupService.loginAPI = jest.fn().mockReturnValue(rxOf({ msg: 'ok' }))
      mockSignupService.fetchStartUpDetails = jest.fn().mockResolvedValue({ status: 200 })
      component.loginForm.patchValue({ emailOrMobile: 'user@test.com' })
      component.OTPForm.patchValue({ OTPcode: '123456' })
      component.otpSubmit()
      expect(mockSignupService.loginAPI).toHaveBeenCalled()
      jest.useRealTimers()
    })

    it('should call openSnackbar on loginAPI error in otpSubmit', () => {
      const { throwError } = require('rxjs')
      mockSignupService.loginAPI = jest.fn().mockReturnValue(throwError(() => ({
        error: { msg: 'Invalid OTP', message: 'Invalid OTP' },
      })))
      component.loginForm.patchValue({ emailOrMobile: '9876543210' })
      component.initializeForm()
      component.OTPForm.patchValue({ otp1: '9', otp2: '9', otp3: '9', otp4: '9', OTPcode: '9999' })
      component.otpSubmit()
      expect(mockSnackBar.open).toHaveBeenCalled()
    })

    it('should not call loginAPI when forms are invalid', () => {
      component.otpSubmit()
      expect(mockSignupService.loginAPI).not.toHaveBeenCalled()
    })

    it('should redirect to url_before_login on otpSubmit success', async () => {
      const { of: rxOf } = require('rxjs')
      jest.useFakeTimers()
      Object.defineProperty(window, 'location', { writable: true, value: { href: '' } })
      localStorage.setItem('url_before_login', '/post-login')
      mockSignupService.loginAPI = jest.fn().mockReturnValue(rxOf({ msg: 'ok' }))
      mockSignupService.fetchStartUpDetails = jest.fn().mockResolvedValue({ status: 200 })
      component.loginForm.patchValue({ emailOrMobile: '9876543210' })
      component.initializeForm()
      component.OTPForm.patchValue({ otp1: '1', otp2: '2', otp3: '3', otp4: '4', OTPcode: '1234' })
      component.otpSubmit()
      jest.advanceTimersByTime(600)
      await Promise.resolve(); await Promise.resolve()
      expect(window.location.href).toBe('/post-login')
      jest.useRealTimers()
    })
  })

  describe('resendOTP additional paths', () => {
    it('should call openSnackbar on resendOTP service error', () => {
      const { throwError } = require('rxjs')
      mockSignupService.resendOTP = jest.fn().mockReturnValue(throwError(() => ({
        error: { msg: 'Error occurred please try again' },
      })))
      component.loginForm.patchValue({ emailOrMobile: '9876543210' })
      component.resendOTP()
      expect(mockSnackBar.open).toHaveBeenCalled()
    })

    it('should handle email type in resendOTP', () => {
      const { of: rxOf } = require('rxjs')
      jest.useFakeTimers()
      mockSignupService.resendOTP = jest.fn().mockReturnValue(rxOf({ msg: 'OTP resent to user' }))
      component.loginForm.patchValue({ emailOrMobile: 'user@test.com' })
      component.resendOTP()
      expect(mockSignupService.resendOTP).toHaveBeenCalled()
      jest.useRealTimers()
    })
  })

  describe('help isXSmall subscribe branch', () => {
    it('should open dialog and run subscribe callback with truthy data', () => {
      const { of: rxOf } = require('rxjs')
      component.isXSmall$ = rxOf(true) as any
      component.help()
      expect(mockDialog.open).toHaveBeenCalled()
      expect(mockLogger.log).toHaveBeenCalledWith('data', true)
    })
  })

  describe('userDoesnotExist url_before_login branch', () => {
    it('should remove url_before_login when on /public/home', () => {
      localStorage.setItem('url_before_login', '/somewhere')
      mockRouter.url = '/public/home'
      let afterClosedCb: any
      mockDialog.open = jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue({
          subscribe: jest.fn((cb: any) => { afterClosedCb = cb }),
        }),
      })
      component.userDoesnotExist()
      afterClosedCb('createAccount')
      expect(localStorage.getItem('url_before_login')).toBeNull()
    })
  })

  describe('otpClick email-otp url branch', () => {
    it('should set emailPhoneType email when url includes email-otp', () => {
      const { of: rxOf } = require('rxjs')
      jest.useFakeTimers()
      Object.defineProperty(window, 'location', { writable: true, value: { href: 'https://x.com/email-otp', includes: (s: string) => 'https://x.com/email-otp'.includes(s) } })
      mockSignupService.sendOTP = jest.fn().mockReturnValue(rxOf({ userId: 'u1', msg: 'OTP sent to phone' }))
      component.loginForm.patchValue({ emailOrMobile: '9876543210' })
      component.otpClick({ status: 'VALID' })
      expect(component.emailPhoneType).toBe('email')
      jest.useRealTimers()
    })
  })

  describe('otpSubmit success language and org branches', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'location', { writable: true, value: { href: '' } })
      jest.useFakeTimers()
    })
    afterEach(() => jest.useRealTimers())

    it('should store lang and redirect to orgSelective url on otp success', async () => {
      const { of: rxOf } = require('rxjs')
      mockSignupService.loginAPI = jest.fn().mockReturnValue(rxOf({ msg: 'ok' }))
      mockSignupService.fetchStartUpDetails = jest.fn().mockResolvedValue({ status: 200, language: 'hi' })
      component.configSvc = {
        orgSelectiveCourseConfig: { orgId: 'org1', redirectUrl: '/org/course' },
        userProfile: { rootOrgId: 'org1' },
        unMappedUser: null,
      } as any
      component.loginForm.patchValue({ emailOrMobile: '9876543210' })
      component.initializeForm()
      component.OTPForm.patchValue({ otp1: '1', otp2: '2', otp3: '3', otp4: '4', OTPcode: '1234' })
      component.otpSubmit()
      jest.advanceTimersByTime(600)
      await Promise.resolve(); await Promise.resolve()
      expect(window.location.href).toBe('/org/course')
      expect(localStorage.getItem('lang123')).toContain('hi')
    })

    it('should redirect to /page/home on otp success without org config', async () => {
      const { of: rxOf } = require('rxjs')
      mockSignupService.loginAPI = jest.fn().mockReturnValue(rxOf({ msg: 'ok' }))
      mockSignupService.fetchStartUpDetails = jest.fn().mockResolvedValue({ status: 200 })
      component.loginForm.patchValue({ emailOrMobile: '9876543210' })
      component.initializeForm()
      component.OTPForm.patchValue({ otp1: '1', otp2: '2', otp3: '3', otp4: '4', OTPcode: '1234' })
      component.otpSubmit()
      jest.advanceTimersByTime(600)
      await Promise.resolve(); await Promise.resolve()
      expect(window.location.href).toBe('/page/home')
    })
  })

  describe('startTimer branches', () => {
    it('should clear existing interval before starting a new one', () => {
      jest.useFakeTimers()
      component.startTimer()
      const firstInterval = component.interval
      component.startTimer()
      expect(component.interval).not.toBe(firstInterval)
      jest.useRealTimers()
    })

    it('should clear interval when timer reaches 0', () => {
      jest.useFakeTimers()
      component.startTimer()
      jest.advanceTimersByTime(600 * 1000)
      expect(component.resendTimer).toBe(0)
      expect(component.interval).toBeNull()
      jest.useRealTimers()
    })
  })

  describe('otpClick additional paths', () => {
    it('should call userDoesnotExist on specific user-not-found error', () => {
      const { throwError } = require('rxjs')
      const spy = jest.spyOn(component, 'userDoesnotExist').mockImplementation(() => {})
      mockSignupService.sendOTP = jest.fn().mockReturnValue(throwError(() => ({
        error: { msg: "User doesn't exists please signup and try again", message: '' },
      })))
      component.loginForm.patchValue({ emailOrMobile: '9876543210' })
      component.otpClick({ status: 'VALID' })
      expect(spy).toHaveBeenCalled()
    })

    it('should call openSnackbar for generic otpClick error', () => {
      const { throwError } = require('rxjs')
      mockSignupService.sendOTP = jest.fn().mockReturnValue(throwError(() => ({
        error: { msg: 'Service unavailable at this time', message: '' },
      })))
      component.loginForm.patchValue({ emailOrMobile: '9876543210' })
      component.otpClick({ status: 'VALID' })
      expect(mockSnackBar.open).toHaveBeenCalled()
    })

    it('should set emailPhoneType to email for email input in otpClick', () => {
      const { of: rxOf } = require('rxjs')
      jest.useFakeTimers()
      mockSignupService.sendOTP = jest.fn().mockReturnValue(rxOf({ userId: 'u1', msg: 'OTP sent to user' }))
      component.loginForm.patchValue({ emailOrMobile: 'user@test.com' })
      component.otpClick({ status: 'VALID' })
      expect(component.emailPhoneType).toBe('email')
      jest.useRealTimers()
    })
  })
})
