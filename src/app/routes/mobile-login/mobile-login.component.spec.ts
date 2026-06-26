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
  })
})
