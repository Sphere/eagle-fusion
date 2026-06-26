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
    mockCdr = { detectChanges: jest.fn() }
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
})
