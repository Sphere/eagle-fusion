jest.mock('../../services/tnc-public-resolver.service', () => ({
  TncPublicResolverService: class {
    registerWithMobile = jest.fn()
    signup = jest.fn()
    assignAdminToDepartment = jest.fn()
    verifyUserMobile = jest.fn()
  },
}))

jest.mock('./../../../../library/ws-widget/utils/src/lib/services/auth-keycloak.service', () => ({
  AuthKeycloakService: class {
    login = jest.fn()
  },
}))

jest.mock('../../../../library/ws-widget/utils/src/public-api', () => ({
  LoggerService: class {
    log = jest.fn()
  },
}))

import { UntypedFormBuilder } from '@angular/forms'
import { of, throwError } from 'rxjs'
import { RegisterComponent } from './register.component'

describe('RegisterComponent', () => {
  let component: RegisterComponent
  let mockSnackBar: any
  let mockRouter: any
  let mockTncService: any
  let mockAuthSvc: any
  let mockLogger: any
  const fb = new UntypedFormBuilder()

  beforeEach(() => {
    jest.useFakeTimers()
    mockSnackBar = { open: jest.fn() }
    mockRouter = { navigate: jest.fn() }
    mockTncService = {
      registerWithMobile: jest.fn().mockReturnValue(of({ message: 'Success' })),
      signup: jest.fn().mockReturnValue(of({ userId: 'u1' })),
      assignAdminToDepartment: jest.fn().mockReturnValue(of({ result: { response: 'SUCCESS' } })),
      verifyUserMobile: jest.fn().mockReturnValue(of({ message: 'Success' })),
    }
    mockAuthSvc = { login: jest.fn() }
    mockLogger = { log: jest.fn() }
    component = new RegisterComponent(mockSnackBar, fb, mockRouter, mockTncService, mockAuthSvc, mockLogger)
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('default values', () => {
    it('should default uploadSaveData to false', () => {
      expect(component.uploadSaveData).toBe(false)
    })

    it('should default phone to false', () => {
      expect(component.phone).toBe(false)
    })

    it('should default showAllFields to false', () => {
      expect(component.showAllFields).toBe(false)
    })

    it('should default isMobile to false', () => {
      expect(component.isMobile).toBe(false)
    })

    it('should default hide1 and hide2 to true', () => {
      expect(component.hide1).toBe(true)
      expect(component.hide2).toBe(true)
    })
  })

  describe('forms', () => {
    it('should initialize signupForm with required fields', () => {
      expect(component.signupForm).toBeDefined()
      expect(component.signupForm.get('firstName')).toBeTruthy()
      expect(component.signupForm.get('lastName')).toBeTruthy()
      expect(component.signupForm.get('password')).toBeTruthy()
    })

    it('should initialize emailForm with userInput', () => {
      expect(component.emailForm).toBeDefined()
      expect(component.emailForm.get('userInput')).toBeTruthy()
    })

    it('signupForm should be invalid when empty', () => {
      expect(component.signupForm.invalid).toBe(true)
    })

    it('emailForm should be invalid when empty', () => {
      expect(component.emailForm.invalid).toBe(true)
    })
  })

  describe('ngOnInit', () => {
    it('should not throw', () => {
      expect(() => component.ngOnInit()).not.toThrow()
    })
  })

  describe('ngAfterViewChecked', () => {
    it('should set showResend after 30 seconds', () => {
      expect(component.showResend).toBe(false)
      component.ngAfterViewChecked()
      jest.advanceTimersByTime(30001)
      expect(component.showResend).toBe(true)
    })
  })

  describe('verifyEntry', () => {
    it('should set showAllFields when a valid email is entered', () => {
      component.emailForm.patchValue({ userInput: 'test@example.com' })
      component.verifyEntry()
      expect(component.showAllFields).toBe(true)
      expect(component.isMobile).toBe(false)
    })

    it('should call registerWithMobile for a valid 10-digit mobile number', () => {
      component.emailForm.patchValue({ userInput: '9876543210' })
      component.verifyEntry()
      expect(mockTncService.registerWithMobile).toHaveBeenCalled()
    })

    it('should not call registerWithMobile for an invalid mobile number starting with < 6', () => {
      component.emailForm.patchValue({ userInput: '1234567890' })
      component.verifyEntry()
      expect(mockTncService.registerWithMobile).not.toHaveBeenCalled()
    })

    it('should do nothing when userInput is empty', () => {
      component.emailForm.patchValue({ userInput: '' })
      component.verifyEntry()
      expect(mockTncService.registerWithMobile).not.toHaveBeenCalled()
      expect(component.showAllFields).toBe(false)
    })
  })

  describe('gotoHome', () => {
    it('should navigate to /page/home', () => {
      component.gotoHome()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/page/home'])
    })
  })

  describe('ngOnDestroy', () => {
    it('should not throw when unseenCtrlSub is not set', () => {
      expect(() => component.ngOnDestroy()).not.toThrow()
    })

    it('should unsubscribe unseenCtrlSub when it is open', () => {
      const fakeSub = { closed: false, unsubscribe: jest.fn() }
      component['unseenCtrlSub'] = fakeSub as any
      component.ngOnDestroy()
      expect(fakeSub.unsubscribe).toHaveBeenCalled()
    })
  })

  describe('resendOTP', () => {
    it('should call snackBar.open with response message on success', () => {
      mockTncService.registerWithMobile = jest.fn().mockReturnValue(of({ message: 'OTP Sent' }))
      component.emailOrMobile = '9876543210'
      component.resendOTP()
      expect(mockSnackBar.open).toHaveBeenCalledWith('OTP Sent', undefined, expect.any(Object))
    })

    it('should call snackBar.open with error on failure', () => {
      mockTncService.registerWithMobile = jest.fn().mockReturnValue(throwError(() => 'network error'))
      component.emailOrMobile = '9876543210'
      component.resendOTP()
      expect(mockSnackBar.open).toHaveBeenCalledWith('network error', undefined, expect.any(Object))
    })
  })

  describe('onSubmit (email path)', () => {
    beforeEach(() => {
      component.email = true
    })

    it('should navigate to /app/profile/dashboard on full success', () => {
      mockTncService.signup = jest.fn().mockReturnValue(of({ userId: 'u1' }))
      mockTncService.assignAdminToDepartment = jest.fn().mockReturnValue(of({ result: { response: 'SUCCESS' } }))
      component.signupForm.patchValue({ firstName: 'John', lastName: 'Doe', password: 'pass123' })
      component.onSubmit(component.signupForm)
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/profile/dashboard'])
    })

    it('should navigate to /public/register when assignAdminToDepartment fails', () => {
      mockTncService.signup = jest.fn().mockReturnValue(of({ userId: 'u1' }))
      mockTncService.assignAdminToDepartment = jest.fn().mockReturnValue(throwError(() => 'assign error'))
      component.signupForm.patchValue({ firstName: 'John', lastName: 'Doe', password: 'pass123' })
      component.onSubmit(component.signupForm)
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/public/register'])
    })

    it('should call openSnackbar with error when signup fails', () => {
      mockTncService.signup = jest.fn().mockReturnValue(throwError(() => 'signup error'))
      component.signupForm.patchValue({ firstName: 'John', lastName: 'Doe', password: 'pass123' })
      component.onSubmit(component.signupForm)
      expect(mockSnackBar.open).toHaveBeenCalledWith(expect.stringContaining('User Creation'), undefined, expect.any(Object))
    })
  })

  describe('onSubmit (mobile path)', () => {
    beforeEach(() => {
      component.email = false
      component.emailOrMobile = '9876543210'
    })

    it('should call authSvc.login after 5000ms when verifyUserMobile returns Success', () => {
      mockTncService.verifyUserMobile = jest.fn().mockReturnValue(of({ message: 'Success' }))
      component.signupForm.patchValue({ firstName: 'John', lastName: 'Doe', password: 'pass123', otp: '123456' })
      component.onSubmit(component.signupForm)
      jest.advanceTimersByTime(5001)
      expect(mockAuthSvc.login).toHaveBeenCalledWith('S', expect.any(String))
    })

    it('should call openSnackbar on verifyUserMobile error', () => {
      mockTncService.verifyUserMobile = jest.fn().mockReturnValue(
        throwError(() => ({ error: { error: 'OTP mismatch' } }))
      )
      component.signupForm.patchValue({ firstName: 'John', lastName: 'Doe', password: 'pass123', otp: '000000' })
      component.onSubmit(component.signupForm)
      expect(mockSnackBar.open).toHaveBeenCalledWith('OTP mismatch', undefined, expect.any(Object))
    })
  })
})
