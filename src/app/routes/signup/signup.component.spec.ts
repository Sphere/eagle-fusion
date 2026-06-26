jest.mock('./signup.service', () => ({
  SignupService: class {
    generateOtp = jest.fn()
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
})
