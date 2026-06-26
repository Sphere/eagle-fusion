jest.mock('src/app/routes/signup/signup.service', () => ({
  SignupService: class {
    loginAPI = jest.fn()
    sendOTP = jest.fn()
    resendOTP = jest.fn()
    fetchStartUpDetails = jest.fn()
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
})
