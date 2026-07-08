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

  describe('redirect', () => {
    it('should set langPage true for lang val', () => {
      component.redirect('lang')
      jest.runAllTimers()
      expect(component.langPage).toBe(true)
    })

    it('should set langPage true for createAccount val', () => {
      component.redirect('createAccount')
      jest.runAllTimers()
      expect(component.langPage).toBe(true)
      expect(component.createAccount).toBe(false)
    })

    it('should set createAccount true for confirmPassword val', () => {
      component.redirect('confirmPassword')
      jest.runAllTimers()
      expect(component.createAccount).toBe(true)
    })

    it('should set createAccount true for unknown val (default)', () => {
      component.redirect('unknown')
      jest.runAllTimers()
      expect(component.createAccount).toBe(true)
    })
  })

  describe('help', () => {
    it('should open dialog with help selected', () => {
      component.help()
      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ data: expect.objectContaining({ selected: 'help' }) }),
      )
    })
  })

  describe('handleKeyDown', () => {
    it('should call help on Enter key', () => {
      const spy = jest.spyOn(component, 'help')
      const event = { key: 'Enter', preventDefault: jest.fn() } as any
      component.handleKeyDown(event)
      expect(spy).toHaveBeenCalled()
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should call help on Space key', () => {
      const spy = jest.spyOn(component, 'help')
      const event = { key: ' ', preventDefault: jest.fn() } as any
      component.handleKeyDown(event)
      expect(spy).toHaveBeenCalled()
    })

    it('should not call help for other keys', () => {
      const spy = jest.spyOn(component, 'help')
      const event = { key: 'Tab', preventDefault: jest.fn() } as any
      component.handleKeyDown(event)
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('selectedDistrict getter', () => {
    it('should return district form value', () => {
      component.createAccountForm.get('district')?.setValue('Delhi')
      expect(component.selectedDistrict).toBe('Delhi')
    })

    it('should return empty string when not set', () => {
      component.createAccountForm.get('district')?.setValue(null)
      expect(component.selectedDistrict).toBe('')
    })
  })

  describe('eventTrigger', () => {
    it('should return early when form is falsy', () => {
      expect(() => component.eventTrigger('Signup', 'user')).not.toThrow()
      expect(mockSignupService.plumb5SendEvent).not.toHaveBeenCalled()
    })

    it('should call plumb5SendEvent and plumb5SendForm when form is provided', () => {
      component.createAccountForm.patchValue({ firstname: 'John', lastname: 'Doe', emailOrMobile: 'test@test.com' })
      component.eventTrigger('Signup', 'user', component.createAccountForm)
      expect(mockSignupService.plumb5SendEvent).toHaveBeenCalled()
      expect(mockSignupService.plumb5SendForm).toHaveBeenCalled()
    })
  })

  describe('showParentForm', () => {
    it('should reinitialize form for "true" event', () => {
      component.showParentForm('true')
      expect(component.createAccountForm.get('firstname')).toBeTruthy()
    })

    it('should not change form for other events', () => {
      const originalForm = component.createAccountForm
      component.showParentForm('false')
      expect(component.createAccountForm).toBe(originalForm)
    })
  })

  describe('onSubmit', () => {
    it('should set emailPhoneType to phone for 10-digit number', () => {
      component.createAccountForm.patchValue({ firstname: 'John', lastname: 'Doe', emailOrMobile: '9876543210' })
      component.createAccountWithPasswordForm.patchValue({ password: 'Test@1234', confirmPassword: 'Test@1234' })
      component.onSubmit(component.createAccountWithPasswordForm, component.createAccountForm)
      expect(component.emailPhoneType).toBe('phone')
      expect(component.isMobile).toBe(true)
    })

    it('should set emailPhoneType to email for email input', () => {
      component.createAccountForm.patchValue({ firstname: 'John', lastname: 'Doe', emailOrMobile: 'test@example.com' })
      component.createAccountWithPasswordForm.patchValue({ password: 'Test@1234', confirmPassword: 'Test@1234' })
      component.onSubmit(component.createAccountWithPasswordForm, component.createAccountForm)
      expect(component.emailPhoneType).toBe('email')
    })

    it('should open snackbar for invalid input', () => {
      component.createAccountForm.patchValue({ emailOrMobile: 'invalid' })
      component.onSubmit(component.createAccountWithPasswordForm, component.createAccountForm)
      expect(mockSnackBar.open).toHaveBeenCalled()
    })
  })

  describe('ngOnDestroy', () => {
    it('should complete without error', () => {
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('ngOnInit', () => {
    it('should not throw and call requestGeolocation', () => {
      expect(() => component.ngOnInit()).not.toThrow()
      expect(mockUserAgentSvc.requestGeolocation).toHaveBeenCalled()
    })

    it('should load stored language from localStorage', () => {
      localStorage.setItem('preferedLanguage', JSON.stringify({ id: 'hi', lang: 'हिंदी' }))
      component.ngOnInit()
      expect(component.preferedLanguage.id).toBe('hi')
    })
  })

  describe('langChanged', () => {
    it('should set createAccount page state', () => {
      component.langChanged()
      jest.runAllTimers()
      expect(component.createAccount).toBe(true)
      expect(component.langPage).toBe(false)
    })
  })

  describe('homePage', () => {
    it('should navigate to /page/home when unMappedUser has id and isOrgSelectiveCourse is false', () => {
      localStorage.setItem('isOrgSelectiveCourse', 'false')
      mockConfigSvc.unMappedUser = { id: 'user-1' }
      component.homePage()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/page/home'])
    })

    it('should navigate to /public/home when unMappedUser has no id', () => {
      localStorage.setItem('isOrgSelectiveCourse', 'false')
      mockConfigSvc.unMappedUser = null
      component.homePage()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/public/home'])
    })

    it('should not navigate when isOrgSelectiveCourse is true', () => {
      localStorage.setItem('isOrgSelectiveCourse', 'true')
      component.homePage()
      expect(mockRouter.navigate).not.toHaveBeenCalled()
    })
  })

  describe('gotoHome', () => {
    it('should call router.navigate with /page/home', () => {
      mockRouter.navigate = jest.fn().mockReturnValue(Promise.resolve(true))
      component.gotoHome()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/page/home'])
    })
  })

  describe('userExist', () => {
    it('should open CreateAccountDialogComponent with userExist selected', () => {
      component.userExist()
      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ data: expect.objectContaining({ selected: 'userExist' }) }),
      )
    })

    it('should navigate to login when dialog returns "login"', () => {
      mockDialog.open = jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of('login')),
      })
      component.userExist()
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/public/login')
    })
  })

  describe('optionSelected', () => {
    it('should open dialog with name and firstname/lastname', () => {
      component.createAccountForm.patchValue({ firstname: 'Jane', lastname: 'Doe' })
      component.optionSelected()
      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ data: expect.objectContaining({ selected: 'name' }) }),
      )
    })

    it('should set confirmPassword page when loginSelected=password and dialog returns confirm', () => {
      mockDialog.open = jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of('confirm')),
      })
      component.loginSelected = 'password'
      component.optionSelected()
      jest.runAllTimers()
      expect(component.confirmPassword).toBe(true)
    })
  })

  describe('changeLanguage', () => {
    it('should open LanguageDialogComponent and update language on close', () => {
      mockDialog.open = jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of({ id: 'hi', lang: 'हिंदी' })),
      })
      component.changeLanguage()
      expect(mockLanguageService.setLanguage).toHaveBeenCalledWith('hi')
    })
  })

  describe('onSubmit success path', () => {
    it('should open snackbar on successful signup with mobile', () => {
      mockSignupService.ssoWithMobileEmail = jest.fn().mockReturnValue(
        of({ message: 'User successfully created', userId: 'u1' })
      )
      mockUserAgentSvc.getStoredGeolocation = jest.fn().mockReturnValue({ lat: 0 })
      component.createAccountForm.patchValue({ firstname: 'John', lastname: 'Doe', emailOrMobile: '9876543210' })
      component.createAccountWithPasswordForm.patchValue({ password: 'Test@1234', confirmPassword: 'Test@1234' })
      component.onSubmit(component.createAccountWithPasswordForm, component.createAccountForm)
      expect(mockSnackBar.open).toHaveBeenCalled()
    })

    it('should open snackbar for error status response', () => {
      mockSignupService.ssoWithMobileEmail = jest.fn().mockReturnValue(
        of({ status: 'error', message: 'User already exists' })
      )
      component.createAccountForm.patchValue({ firstname: 'John', lastname: 'Doe', emailOrMobile: 'test@example.com' })
      component.createAccountWithPasswordForm.patchValue({ password: 'Test@1234', confirmPassword: 'Test@1234' })
      component.onSubmit(component.createAccountWithPasswordForm, component.createAccountForm)
      expect(mockSnackBar.open).toHaveBeenCalled()
    })
  })

  describe('onSubmit error path', () => {
    it('should show snackbar but NOT the userExist dialog for a generic failure', () => {
      const { throwError } = require('rxjs')
      mockSignupService.ssoWithMobileEmail = jest.fn().mockReturnValue(
        throwError(() => ({ error: { message: 'Sorry ! User not created. Please try again in sometime.', status: 'failed' } }))
      )
      component.createAccountForm.patchValue({ firstname: 'John', lastname: 'Doe', emailOrMobile: 'test@example.com' })
      component.createAccountWithPasswordForm.patchValue({ password: 'Test@1234', confirmPassword: 'Test@1234' })
      component.onSubmit(component.createAccountWithPasswordForm, component.createAccountForm)
      expect(mockSnackBar.open).toHaveBeenCalled()
      expect(mockDialog.open).not.toHaveBeenCalled()
    })

    it('should open the userExist dialog when the API reports the user already exists', () => {
      const { throwError } = require('rxjs')
      mockSignupService.ssoWithMobileEmail = jest.fn().mockReturnValue(
        throwError(() => ({ error: { message: 'User already exists' } }))
      )
      component.createAccountForm.patchValue({ firstname: 'John', lastname: 'Doe', emailOrMobile: 'test@example.com' })
      component.createAccountWithPasswordForm.patchValue({ password: 'Test@1234', confirmPassword: 'Test@1234' })
      component.onSubmit(component.createAccountWithPasswordForm, component.createAccountForm)
      expect(mockSnackBar.open).toHaveBeenCalled()
      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ data: expect.objectContaining({ selected: 'userExist' }) }),
      )
    })
  })

  describe('isUserExistsError', () => {
    it('returns true for "already exists" and "already registered" messages', () => {
      expect((component as any).isUserExistsError('User already exists')).toBe(true)
      expect((component as any).isUserExistsError('This user is already registered')).toBe(true)
    })

    it('returns false for generic failures and empty input', () => {
      expect((component as any).isUserExistsError('Sorry ! User not created. Please try again in sometime.')).toBe(false)
      expect((component as any).isUserExistsError('')).toBe(false)
      expect((component as any).isUserExistsError(undefined)).toBe(false)
    })
  })
})
