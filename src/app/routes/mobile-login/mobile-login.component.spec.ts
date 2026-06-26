jest.mock('@ws-widget/collection', () => ({
  WidgetContentService: class {
    googleAuthenticate = jest.fn()
    loginAuth = jest.fn()
  },
}))

jest.mock('../signup/signup.service', () => ({
  SignupService: class {
    fetchStartUpDetails = jest.fn()
    generateOtp = jest.fn()
  },
}))

jest.mock('../../services/config-cache.service', () => ({
  ConfigCacheService: class {
    getHostConfig = jest.fn()
  },
}))

import { UntypedFormBuilder } from '@angular/forms'
import { of } from 'rxjs'
import { MobileLoginComponent } from './mobile-login.component'

describe('MobileLoginComponent', () => {
  let component: MobileLoginComponent
  let mockRouter: any
  let mockContentSvc: any
  let mockLocation: any
  let mockPlatformLocation: any
  let mockSnackBar: any
  let mockSignupService: any
  let mockConfigCacheSvc: any
  let mockRoute: any

  beforeEach(() => {
    mockRouter = { navigate: jest.fn() }
    mockContentSvc = {
      googleAuthenticate: jest.fn().mockReturnValue(of({})),
      loginAuth: jest.fn().mockReturnValue(of({ msg: 'ok' })),
    }
    mockLocation = { path: jest.fn().mockReturnValue('/mobile/login') }
    mockPlatformLocation = { onPopState: jest.fn() }
    mockSnackBar = { open: jest.fn() }
    mockSignupService = {
      fetchStartUpDetails: jest.fn().mockResolvedValue({ status: 200, roles: [] }),
      generateOtp: jest.fn().mockReturnValue(of({ message: 'Success' })),
    }
    mockConfigCacheSvc = { getHostConfig: jest.fn().mockReturnValue(of({ googleAuth: false })) }
    mockRoute = { queryParams: { subscribe: jest.fn((cb: any) => cb({ source: '' })) } }

    component = new MobileLoginComponent(
      new UntypedFormBuilder(),
      mockRouter,
      mockContentSvc,
      mockLocation,
      mockPlatformLocation,
      mockSnackBar,
      mockSignupService,
      mockConfigCacheSvc,
      mockRoute,
    )
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize loginForm with username and password', () => {
    expect(component.loginForm.get('username')).toBeTruthy()
    expect(component.loginForm.get('password')).toBeTruthy()
  })

  it('should default hide to true', () => {
    expect(component.hide).toBe(true)
  })

  it('should default otpPage to false', () => {
    expect(component.otpPage).toBe(false)
  })

  describe('toggle', () => {
    it('should toggle hide on first call', () => {
      component.toggle()
      expect(component.hide).toBe(false)
      expect(component.iconChange).toBe('fas fa-eye')
    })

    it('should toggle back to hidden on second call', () => {
      component.toggle()
      component.toggle()
      expect(component.hide).toBe(true)
      expect(component.iconChange).toBe('fas fa-eye-slash')
    })
  })

  describe('redirect', () => {
    it('should navigate to /page/home for any truthy lang', () => {
      component.redirect('en')
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/page/home'])
    })

    it('should not navigate when lang is empty', () => {
      component.redirect('')
      expect(mockRouter.navigate).not.toHaveBeenCalled()
    })
  })

  describe('showParentForm', () => {
    it('should set loginVerification to true when event is "true"', () => {
      component.showParentForm('true')
      expect(component.loginVerification).toBe(true)
    })

    it('should not set loginVerification for other values', () => {
      component.showParentForm('false')
      expect(component.loginVerification).toBeFalsy()
    })
  })

  describe('checkGoogleAuth', () => {
    it('should set googleAuth from config', () => {
      mockConfigCacheSvc.getHostConfig.mockReturnValue(of({ googleAuth: true }))
      component.checkGoogleAuth()
      expect(component.googleAuth).toBe(true)
    })

    it('should not change googleAuth when config data is falsy', () => {
      mockConfigCacheSvc.getHostConfig.mockReturnValue(of(null))
      component.googleAuth = false
      component.checkGoogleAuth()
      expect(component.googleAuth).toBe(false)
    })
  })

  describe('generateOtp', () => {
    it('should call signupService.generateOtp with email request when type is email', () => {
      mockSignupService.generateOtp.mockReturnValue(of({ message: 'Success' }))
      component.generateOtp('email', 'user@test.com')
      expect(mockSignupService.generateOtp).toHaveBeenCalledWith({ email: 'user@test.com' })
    })

    it('should call signupService.generateOtp with mobileNumber when type is phone', () => {
      mockSignupService.generateOtp.mockReturnValue(of({ message: 'Success' }))
      component.generateOtp('phone', '9876543210')
      expect(mockSignupService.generateOtp).toHaveBeenCalledWith({ mobileNumber: '9876543210' })
    })
  })

  describe('loginUser', () => {
    it('should set emailPhoneType to phone when username has >= 10 digits', () => {
      component.loginForm.get('username')?.setValue('9876543210')
      component.loginForm.get('password')?.setValue('password')
      mockContentSvc.loginAuth.mockReturnValue(of({ msg: 'ok' }))
      mockSignupService.fetchStartUpDetails.mockResolvedValue({ status: 400, error: { params: { errmsg: 'bad request' } } })
      component.loginUser()
      expect(component.emailPhoneType).toBe('phone')
    })

    it('should set emailPhoneType to email when username is valid email', () => {
      component.loginForm.get('username')?.setValue('user@test.com')
      component.loginForm.get('password')?.setValue('password')
      mockContentSvc.loginAuth.mockReturnValue(of({ msg: 'ok' }))
      mockSignupService.fetchStartUpDetails.mockResolvedValue({ status: 400, error: { params: { errmsg: 'bad' } } })
      component.loginUser()
      expect(component.emailPhoneType).toBe('email')
    })
  })

  describe('ngOnInit', () => {
    it('should set emailPhoneType to phone when signUpdata has phone number', () => {
      component['signUpdata'] = {
        value: { emailOrMobile: '9876543210' },
      }
      component.ngOnInit()
      expect(component.emailPhoneType).toBe('phone')
    })

    it('should set emailPhoneType to email when signUpdata has email', () => {
      component['signUpdata'] = {
        value: { emailOrMobile: 'test@example.com' },
      }
      component.ngOnInit()
      expect(component.emailPhoneType).toBe('email')
    })

    it('should set emailPhoneType to email when URL includes email-otp', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { ...window.location, href: 'http://localhost/email-otp' },
      })
      component['signUpdata'] = null
      component.ngOnInit()
      expect(component.emailPhoneType).toBe('email')
    })
  })
})
