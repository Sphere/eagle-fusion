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

    it('should call googleAuthenticate when google token and isSignedIn are in localStorage', () => {
      localStorage.setItem('google_token', 'tok123')
      localStorage.setItem('google_isSignedIn', 'true')
      mockConfigCacheSvc.getHostConfig = jest.fn().mockReturnValue(of({ googleAuth: true }))
      component['signUpdata'] = null
      component.ngOnInit()
      expect(mockContentSvc.googleAuthenticate).toHaveBeenCalled()
    })
  })

  describe('signinChanged', () => {
    it('should remove and set google_isSignedIn in localStorage', () => {
      component.signinChanged(true)
      expect(localStorage.getItem('google_isSignedIn')).toBe('true')
    })
  })

  describe('ngAfterViewInit', () => {
    it('should not call googleInit when googleAuth is false', () => {
      const spy = jest.spyOn(component, 'googleInit').mockImplementation(() => {})
      component.googleAuth = false
      component.ngAfterViewInit()
      expect(spy).not.toHaveBeenCalled()
    })

    it('should call googleInit when googleAuth is true', () => {
      const spy = jest.spyOn(component, 'googleInit').mockImplementation(() => {})
      component.googleAuth = true
      component.ngAfterViewInit()
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('loginUser advanced paths', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { href: '' },
      })
    })

    it('should set localStorage loginbtn on status=200 with roles', async () => {
      mockContentSvc.loginAuth = jest.fn().mockReturnValue(of({ msg: 'ok' }))
      mockSignupService.fetchStartUpDetails = jest.fn().mockResolvedValue({
        status: 200, roles: ['PUBLIC'], userId: 'u1',
      })
      component.loginForm.get('username')?.setValue('user@test.com')
      component.loginForm.get('password')?.setValue('pass')
      component.loginUser()
      // Allow async resolution
      await Promise.resolve()
      expect(localStorage.getItem('loginbtn')).toBe('userLoggedIn')
    })

    it('should set otpPage=true on status=200 with no roles', async () => {
      mockContentSvc.loginAuth = jest.fn().mockReturnValue(of({ msg: 'ok' }))
      mockSignupService.fetchStartUpDetails = jest.fn().mockResolvedValue({
        status: 200, roles: [], userId: 'u1',
      })
      component.loginForm.get('username')?.setValue('user@test.com')
      component.loginForm.get('password')?.setValue('pass')
      component.loginUser()
      await Promise.resolve()
      expect(component.otpPage).toBe(true)
      expect(component.loginVerification).toBe(true)
    })

    it('should call openSnackbar on status=401', async () => {
      mockContentSvc.loginAuth = jest.fn().mockReturnValue(of({ msg: 'ok' }))
      mockSignupService.fetchStartUpDetails = jest.fn().mockResolvedValue({
        status: 401, error: { params: { errmsg: 'Unauthorized' } },
      })
      component.loginForm.get('username')?.setValue('9876543210')
      component.loginForm.get('password')?.setValue('pass')
      component.loginUser()
      await Promise.resolve()
      expect(mockSnackBar.open).toHaveBeenCalledWith('Unauthorized', undefined, expect.any(Object))
    })

    it('should call openSnackbar on status=419', async () => {
      mockContentSvc.loginAuth = jest.fn().mockReturnValue(of({ msg: 'ok' }))
      mockSignupService.fetchStartUpDetails = jest.fn().mockResolvedValue({
        status: 419, error: { params: { errmsg: 'Session expired' } },
      })
      component.loginForm.get('username')?.setValue('9876543210')
      component.loginForm.get('password')?.setValue('pass')
      component.loginUser()
      await Promise.resolve()
      expect(mockSnackBar.open).toHaveBeenCalledWith('Session expired', undefined, expect.any(Object))
    })
  })

  describe('generateOtp error path', () => {
    it('should call openSnackbar on generateOtp error', () => {
      const { throwError } = require('rxjs')
      mockSignupService.generateOtp = jest.fn().mockReturnValue(throwError(() => 'network error'))
      component.generateOtp('email', 'user@test.com')
      expect(mockSnackBar.open).toHaveBeenCalledWith('network error', undefined, expect.any(Object))
    })
  })

  describe('userChanged', () => {
    it('should set google_token in localStorage from user response', () => {
      Object.defineProperty(window, 'location', { writable: true, value: { href: '', reload: jest.fn() } })
      const mockUser = { getAuthResponse: jest.fn().mockReturnValue({ id_token: 'tok_abc' }) }
      component.userChanged(mockUser)
      expect(localStorage.getItem('google_token')).toBe('tok_abc')
    })
  })

  describe('attachSignin', () => {
    it('should call auth2.attachClickHandler', () => {
      component.auth2 = { attachClickHandler: jest.fn() }
      component.attachSignin({})
      expect(component.auth2.attachClickHandler).toHaveBeenCalled()
    })

    it('error callback should log the error', () => {
      component['logger'] = { log: jest.fn() }
      component.auth2 = {
        attachClickHandler: jest.fn((_el: any, _opts: any, _success: any, errCb: any) => {
          errCb({ message: 'test error' })
        }),
      }
      component.attachSignin({})
      expect(component['logger'].log).toHaveBeenCalled()
    })
  })

  describe('googleInit', () => {
    it('should load auth2 and call attachSignin', () => {
      const mockAuth2 = {
        attachClickHandler: jest.fn(),
        isSignedIn: { listen: jest.fn() },
        currentUser: { listen: jest.fn() },
      }
      ;(global as any).gapi = {
        load: jest.fn((_name: string, cb: any) => cb()),
        auth2: { init: jest.fn().mockReturnValue(mockAuth2) },
      }
      component.myDiv = { nativeElement: {} } as any
      const attachSpy = jest.spyOn(component, 'attachSignin').mockImplementation(() => {})
      component.googleInit()
      expect((global as any).gapi.load).toHaveBeenCalledWith('auth2', expect.any(Function))
      expect(attachSpy).toHaveBeenCalled()
      delete (global as any).gapi
    })
  })

  describe('googleAuthenticate subscribe callbacks', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'location', { writable: true, value: { href: '' } })
      localStorage.setItem('google_token', 'tok123')
      localStorage.setItem('google_isSignedIn', 'true')
      mockConfigCacheSvc.getHostConfig = jest.fn().mockReturnValue(of({ googleAuth: true }))
      component['signUpdata'] = null
    })

    it('should call openSnackbar on status 401 from fetchStartUpDetails', async () => {
      mockSignupService.fetchStartUpDetails = jest.fn().mockResolvedValue({
        status: 401, error: { params: { errmsg: 'Unauthorized' } },
      })
      component.ngOnInit()
      await Promise.resolve(); await Promise.resolve()
      expect(mockSnackBar.open).toHaveBeenCalledWith('Unauthorized', undefined, expect.any(Object))
    })

    it('should call openSnackbar on status 419 from fetchStartUpDetails', async () => {
      mockSignupService.fetchStartUpDetails = jest.fn().mockResolvedValue({
        status: 419, error: { params: { errmsg: 'Session expired' } },
      })
      component.ngOnInit()
      await Promise.resolve(); await Promise.resolve()
      expect(mockSnackBar.open).toHaveBeenCalledWith('Session expired', undefined, expect.any(Object))
    })

    it('should redirect to /page/home on status 200 with roles', async () => {
      mockSignupService.fetchStartUpDetails = jest.fn().mockResolvedValue({
        status: 200, roles: ['PUBLIC'],
      })
      mockContentSvc.googleAuthenticate = jest.fn().mockReturnValue(of({ msg: 'Welcome' }))
      component.ngOnInit()
      await Promise.resolve(); await Promise.resolve()
      expect(window.location.href).toBe('/page/home')
    })

    it('should redirect to url_before_login on status 200 with roles when set', async () => {
      localStorage.setItem('url_before_login', '/my/path')
      mockSignupService.fetchStartUpDetails = jest.fn().mockResolvedValue({
        status: 200, roles: ['PUBLIC'],
      })
      mockContentSvc.googleAuthenticate = jest.fn().mockReturnValue(of({ msg: 'ok' }))
      component.ngOnInit()
      await Promise.resolve(); await Promise.resolve()
      expect(window.location.href).toBe('/my/path')
    })

    it('should navigate to /app/login on googleAuthenticate error', () => {
      const { throwError } = require('rxjs')
      component['logger'] = { log: jest.fn() }
      mockContentSvc.googleAuthenticate = jest.fn().mockReturnValue(throwError(() => new Error('Auth failed')))
      component.ngOnInit()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/login'])
    })
  })

  describe('loginUser url_before_login redirect', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'location', { writable: true, value: { href: '' } })
    })

    it('should redirect to url_before_login on status 200 with roles', async () => {
      localStorage.setItem('url_before_login', '/saved/path')
      mockContentSvc.loginAuth = jest.fn().mockReturnValue(of({ msg: 'ok' }))
      mockSignupService.fetchStartUpDetails = jest.fn().mockResolvedValue({
        status: 200, roles: ['PUBLIC'], userId: 'u1',
      })
      component.loginForm.get('username')?.setValue('user@test.com')
      component.loginForm.get('password')?.setValue('pass')
      component.loginUser()
      await Promise.resolve()
      expect(window.location.href).toBe('/saved/path')
    })
  })
})
