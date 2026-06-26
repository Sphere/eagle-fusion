jest.mock('./signup.service', () => ({
  SignupService: class {
    generateOtp = jest.fn()
    validateOtp = jest.fn()
    signup = jest.fn()
    registerWithMobile = jest.fn()
    verifyOtp = jest.fn()
    registerUser = jest.fn()
    resendOTP = jest.fn()
  },
}))

import { UntypedFormBuilder } from '@angular/forms'
import { of, throwError } from 'rxjs'
import { SignupComponent } from './signup.component'

describe('SignupComponent', () => {
  let component: SignupComponent
  let mockSnackBar: any
  let mockSignupService: any
  let mockRouter: any

  beforeEach(() => {
    mockSnackBar = { open: jest.fn() }
    mockSignupService = {
      generateOtp: jest.fn().mockReturnValue(of({ message: 'Success' })),
      validateOtp: jest.fn().mockReturnValue(of({ message: 'Success' })),
      signup: jest.fn().mockReturnValue(of({ message: 'Success' })),
      registerWithMobile: jest.fn().mockReturnValue(of({ message: 'done', status: 'success' })),
      verifyOtp: jest.fn().mockReturnValue(of({ message: 'Success' })),
      registerUser: jest.fn().mockReturnValue(of({ message: 'Success' })),
      resendOTP: jest.fn().mockReturnValue(of({ message: 'Success' })),
    }
    mockRouter = { navigate: jest.fn() }

    component = new SignupComponent(
      mockSnackBar,
      mockSignupService,
      new UntypedFormBuilder(),
      mockRouter,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize signupForm with expected controls', () => {
    expect(component.signupForm.get('firstName')).toBeTruthy()
    expect(component.signupForm.get('lastName')).toBeTruthy()
    expect(component.signupForm.get('emailOrMobile')).toBeTruthy()
    expect(component.signupForm.get('password')).toBeTruthy()
    expect(component.signupForm.get('otp')).toBeTruthy()
  })

  it('should default uploadSaveData to false', () => {
    expect(component.uploadSaveData).toBe(false)
  })

  it('should default phone to false', () => {
    expect(component.phone).toBe(false)
  })

  it('should complete ngOnInit without error', () => {
    expect(() => component.ngOnInit()).not.toThrow()
  })

  it('should complete ngOnDestroy without error', () => {
    expect(() => component.ngOnDestroy()).not.toThrow()
  })

  describe('generateOtp', () => {
    it('should call signupService.generateOtp when phone length >= 10', () => {
      component.signupForm.get('emailOrMobile')?.setValue('9876543210')
      component.generateOtp()
      expect(mockSignupService.generateOtp).toHaveBeenCalledWith(
        expect.objectContaining({ mobileNumber: '9876543210' }),
      )
    })

    it('should not call signupService.generateOtp when phone < 10 digits', () => {
      component.signupForm.get('emailOrMobile')?.setValue('12345')
      component.generateOtp()
      expect(mockSignupService.generateOtp).not.toHaveBeenCalled()
    })
  })

  describe('verifyOtp', () => {
    it('should call validateOtp and navigate to /page/home on Success', () => {
      component.signupForm.get('emailOrMobile')?.setValue('9876543210')
      component.signupForm.get('otp')?.setValue('123456')
      mockSignupService.validateOtp.mockReturnValue(of({ message: 'Success' }))
      component.verifyOtp()
      expect(mockSignupService.validateOtp).toHaveBeenCalledWith(
        expect.objectContaining({ mobileNumber: '9876543210', otp: '123456' }),
      )
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/page/home'])
    })

    it('should call openSnackbar on validateOtp error', () => {
      component.signupForm.get('emailOrMobile')?.setValue('9876543210')
      mockSignupService.validateOtp.mockReturnValue(throwError(() => 'OTP invalid'))
      component.verifyOtp()
      expect(mockSnackBar.open).toHaveBeenCalled()
    })

    it('should not call validateOtp when phone < 10 digits', () => {
      component.signupForm.get('emailOrMobile')?.setValue('12345')
      component.verifyOtp()
      expect(mockSignupService.validateOtp).not.toHaveBeenCalled()
    })
  })

  describe('resendOTP', () => {
    it('should call registerWithMobile with emailOrMobile', () => {
      component.emailOrMobile = '9876543210'
      component.resendOTP()
      expect(mockSignupService.registerWithMobile).toHaveBeenCalledWith('9876543210')
    })

    it('should open snackbar with response message on success', () => {
      mockSignupService.registerWithMobile.mockReturnValue(of({ message: 'OTP sent' }))
      component.resendOTP()
      expect(mockSnackBar.open).toHaveBeenCalledWith('OTP sent', undefined, expect.any(Object))
    })

    it('should open snackbar on error', () => {
      mockSignupService.registerWithMobile.mockReturnValue(throwError(() => 'error'))
      component.resendOTP()
      expect(mockSnackBar.open).toHaveBeenCalled()
    })
  })

  describe('onSubmit', () => {
    it('should set isMobile true when emailOrMobile has >= 10 digits', () => {
      component.signupForm.get('emailOrMobile')?.setValue('9876543210')
      const mockForm = { value: { firstName: 'A', lastName: 'B', emailOrMobile: '9876543210', password: 'pass' }, reset: jest.fn() }
      component.onSubmit(mockForm)
      expect(component.isMobile).toBe(true)
    })

    it('should call signup when email is valid and phone < 10 digits', () => {
      component.signupForm.get('emailOrMobile')?.setValue('test@email.com')
      mockSignupService.signup.mockReturnValue(of({ message: 'Success' }))
      const mockForm = {
        value: { firstName: 'A', lastName: 'B', emailOrMobile: 'test@email.com', password: 'pass' },
        reset: jest.fn(),
      }
      component.onSubmit(mockForm)
      expect(mockSignupService.signup).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@email.com' }),
      )
    })

    it('should call registerWithMobile when phone number >= 10 digits', () => {
      component.signupForm.get('emailOrMobile')?.setValue('9876543210')
      mockSignupService.registerWithMobile.mockReturnValue(of({ status: 'success' }))
      const mockForm = {
        value: { firstName: 'A', lastName: 'B', emailOrMobile: '9876543210', password: 'pass' },
        reset: jest.fn(),
      }
      component.onSubmit(mockForm)
      expect(mockSignupService.registerWithMobile).toHaveBeenCalled()
    })
  })
})
