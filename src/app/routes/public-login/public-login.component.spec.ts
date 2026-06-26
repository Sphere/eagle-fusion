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
    it('should call seoSvc.update', () => {
      component.ngOnInit()
      expect(mockSeoSvc.update).toHaveBeenCalledWith(
        expect.objectContaining({ noindex: true }),
      )
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
})
