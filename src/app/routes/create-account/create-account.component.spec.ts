jest.mock('uuid', () => ({ v4: jest.fn().mockReturnValue('test-uuid') }))

jest.mock('../password-validator', () => ({ mustMatch: jest.fn().mockReturnValue(null) }))

jest.mock('@ws/author/src/public-api', () => ({
  LoaderService: class { changeLoad = { next: jest.fn() } },
}))

jest.mock('../../../../library/ws-widget/utils/src/public-api', () => ({
  ConfigurationsService: class {
    userProfile = null
    unMappedUser = null
    instanceConfig = null
  },
  LoggerService: class { log = jest.fn(); error = jest.fn() },
  TelemetryService: class { registrationInteract = jest.fn() },
  ValueService: class { isXSmall$ = { pipe: jest.fn(), subscribe: jest.fn() } },
}))

jest.mock('../signup/signup.service', () => ({
  SignupService: class {
    ssoWithMobileEmail = jest.fn()
    ssoWithMobileEmailOrgForm = jest.fn()
    plumb5SendEvent = jest.fn()
    plumb5SendForm = jest.fn()
  },
}))

jest.mock('../language-dialog/language-dialog.component', () => ({
  LanguageDialogComponent: class {},
}))

jest.mock('../create-account-modal/create-account-dialog.component', () => ({
  CreateAccountDialogComponent: class {},
}))

jest.mock('src/app/services/language.service', () => ({
  LanguageService: class { setLanguage = jest.fn(); getCurrentLanguage = jest.fn().mockReturnValue('en') },
}))

jest.mock('src/app/services/user-agent.service', () => ({
  UserAgentResolverService: class {
    requestGeolocation = jest.fn()
    getUtmParams = jest.fn().mockReturnValue({})
    getStoredGeolocation = jest.fn().mockReturnValue(null)
    generateCookie = jest.fn()
    getUserAgent = jest.fn()
  },
}))

jest.mock('@ngx-translate/core', () => ({
  TranslateService: class { instant = jest.fn().mockImplementation((k: string) => k) },
}))

jest.mock('src/app/constants/apiConstants', () => ({
  S3_END_POINTS: { ORG_SELECTIVE_COURSE: '/mock-org-endpoint' },
  PROTECTED_SLAG_V8: '/apis/protected/v8',
  PROXY_SLAG_V8: '/apis/proxies/v8',
  PUBLIC_SLAG_V8: '/apis/public/v8',
}))

import { FormBuilder, Validators } from '@angular/forms'
import { of } from 'rxjs'
import { CreateAccountComponent } from './create-account.component'

describe('CreateAccountComponent', () => {
  let component: CreateAccountComponent
  let mockSnackBar: any
  let mockSignupService: any
  let mockRouter: any
  let mockDialog: any
  let mockLoader: any
  let mockConfigSvc: any
  let mockValueSvc: any
  let mockRoute: any
  let mockHttp: any
  let mockLanguageService: any
  let mockLogger: any
  let mockTranslate: any
  let mockCdr: any
  let mockUserAgentSvc: any
  let mockTelemetrySvc: any

  beforeEach(() => {
    jest.useFakeTimers()
    mockSnackBar = { open: jest.fn() }
    mockSignupService = {
      ssoWithMobileEmail: jest.fn().mockReturnValue(of({})),
      ssoWithMobileEmailOrgForm: jest.fn().mockReturnValue(of({})),
      plumb5SendEvent: jest.fn().mockReturnValue(of({})),
      plumb5SendForm: jest.fn().mockReturnValue(of({})),
    }
    mockRouter = { navigate: jest.fn(), navigateByUrl: jest.fn(), url: '/some/path' }
    mockDialog = { open: jest.fn().mockReturnValue({ afterClosed: jest.fn().mockReturnValue(of(null)) }) }
    mockLoader = { changeLoad: { next: jest.fn() } }
    mockConfigSvc = { userProfile: null, unMappedUser: null, instanceConfig: null }
    mockValueSvc = { isXSmall$: of(false) }
    mockRoute = {
      paramMap: {
        pipe: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
      },
    }
    mockHttp = { get: jest.fn().mockReturnValue(of({})) }
    mockLanguageService = { setLanguage: jest.fn(), getCurrentLanguage: jest.fn().mockReturnValue('en') }
    mockLogger = { log: jest.fn(), error: jest.fn() }
    mockTranslate = { instant: jest.fn().mockImplementation((k: string) => k) }
    mockCdr = { detectChanges: jest.fn() }
    mockUserAgentSvc = {
      requestGeolocation: jest.fn(),
      getUtmParams: jest.fn().mockReturnValue({}),
      getStoredGeolocation: jest.fn().mockReturnValue(null),
    }
    mockTelemetrySvc = { registrationInteract: jest.fn() }

    localStorage.clear()
    sessionStorage.clear()

    component = new CreateAccountComponent(
      new FormBuilder(),
      mockSnackBar,
      mockSignupService,
      mockRouter,
      mockDialog,
      mockLoader,
      mockConfigSvc,
      mockValueSvc,
      mockRoute,
      mockHttp,
      mockLanguageService,
      mockLogger,
      mockTranslate,
      mockCdr,
      mockUserAgentSvc,
      mockTelemetrySvc,
    )
  })

  afterEach(() => {
    jest.useRealTimers()
    localStorage.clear()
    sessionStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize createAccountForm with required controls', () => {
    expect(component.createAccountForm.get('firstname')).toBeTruthy()
    expect(component.createAccountForm.get('lastname')).toBeTruthy()
    expect(component.createAccountForm.get('emailOrMobile')).toBeTruthy()
    expect(component.createAccountForm.get('district')).toBeTruthy()
  })

  it('should initialize createAccountWithPasswordForm with password and confirmPassword', () => {
    expect(component.createAccountWithPasswordForm.get('password')).toBeTruthy()
    expect(component.createAccountWithPasswordForm.get('confirmPassword')).toBeTruthy()
  })

  it('should initialize otpCodeForm with otpCode control', () => {
    expect(component.otpCodeForm.get('otpCode')).toBeTruthy()
  })

  it('should default langPage to true and createAccount to false', () => {
    expect(component.langPage).toBe(true)
    expect(component.createAccount).toBe(false)
  })

  describe('toggle1', () => {
    it('should toggle hide1', () => {
      expect(component.hide1).toBe(true)
      component.toggle1()
      expect(component.hide1).toBe(false)
      component.toggle1()
      expect(component.hide1).toBe(true)
    })

    it('should update iconChange1', () => {
      component.toggle1()
      expect(component.iconChange1).toBe('fas fa-eye')
    })
  })

  describe('toggle2', () => {
    it('should toggle hide2', () => {
      expect(component.hide2).toBe(true)
      component.toggle2()
      expect(component.hide2).toBe(false)
    })
  })

  describe('emailOrMobileErrorStatus', () => {
    it('should return empty string when control is pristine', () => {
      expect(component.emailOrMobileErrorStatus).toBe('')
    })

    it('should return "required" when control is dirty and empty', () => {
      const ctrl = component.createAccountForm.get('emailOrMobile')
      ctrl?.markAsDirty()
      ctrl?.setValue('')
      expect(component.emailOrMobileErrorStatus).toBe('required')
    })
  })

  describe('preferredLanguageChange', () => {
    it('should set preferedLanguage to Hindi when "hi"', () => {
      component.preferredLanguageChange('hi')
      expect(component.preferedLanguage.id).toBe('hi')
    })

    it('should set preferedLanguage to English when "en"', () => {
      component.preferredLanguageChange('en')
      expect(component.preferedLanguage.id).toBe('en')
    })
  })

  describe('onDistrictChange', () => {
    it('should set institutes from districtInstituteMap', () => {
      component.districtInstituteMap = { Delhi: ['Apollo', 'AIIMS'] }
      component.onDistrictChange('Delhi')
      expect(component.institutes).toEqual(['Apollo', 'AIIMS'])
    })

    it('should set empty institutes for unknown district', () => {
      component.districtInstituteMap = {}
      component.onDistrictChange('Unknown')
      expect(component.institutes).toEqual([])
    })
  })
})
