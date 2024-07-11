import { ComponentFixture, TestBed } from '@angular/core/testing'
import { PublicLoginComponent } from './public-login.component'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { MatSnackBar, MatSnackBarModule } from '@angular/material'
import { SignupService } from 'src/app/routes/signup/signup.service'
import { MatInputModule } from '@angular/material/input'
import { RouterModule } from '@angular/router'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterTestingModule } from '@angular/router/testing'
import { of } from 'rxjs'
import { ConfigurationsService, ValueService } from '../../../library/ws-widget/utils/src/public-api'

import { MatDialog } from '@angular/material/dialog'
import { Router } from '@angular/router'


import { MatDialogModule } from '@angular/material'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatIconModule } from '@angular/material/icon'
import { MatFormFieldModule } from '@angular/material/form-field'

import { MatButtonModule } from '@angular/material/button'


let mockSignupService: Partial<SignupService> = {
  sendOTP: jest.fn(),
  loginAPI: jest.fn().mockReturnValue(of({ status: 200, message: 'Login successful' }))
} as jest.Mocked<Partial<SignupService>>
const mockFormBuilder: Partial<FormBuilder> = {
  group: jest.fn()
}
const mockMatSnackBar: Partial<MatSnackBar> = {
  open: jest.fn()
}
let mockValueService: Partial<ValueService> = {}
let mockConfigurationsService: Partial<ConfigurationsService> = {}
const mockDialogBar: Partial<MatDialog> = {
  open: jest.fn()
}
const mockRouterService: Partial<Router> = {
  navigate: jest.fn(), // Add this line
  navigateByUrl: jest.fn(),
}

describe('PublicLoginComponent', () => {
  let component: PublicLoginComponent
  let fixture: ComponentFixture<PublicLoginComponent>

  beforeAll(() => {
    component = new PublicLoginComponent(
      mockFormBuilder as FormBuilder,
      mockSignupService as SignupService,
      mockMatSnackBar as MatSnackBar,
      mockValueService as ValueService,
      mockDialogBar as MatDialog,
      mockConfigurationsService as ConfigurationsService,
      mockRouterService as Router,

    )
  })

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PublicLoginComponent],
      imports: [
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        HttpClientTestingModule,
        MatDialogModule,
        RouterModule,
        MatInputModule,
        MatSnackBarModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        RouterTestingModule],
      providers: [
        FormBuilder,
        { provide: SignupService, useValue: { mockSignupService } },
        { provide: MatSnackBar, useValue: mockMatSnackBar }
      ],
    })
      .compileComponents()
    mockSignupService = TestBed.get(SignupService)
  })
  beforeEach(() => {
    fixture = TestBed.createComponent(PublicLoginComponent)
    component = fixture.componentInstance
    component.ngOnInit() // Ensure form groups are initialized
    jest.clearAllMocks()
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should mark login form as invalid when email is empty', () => {
    const emailControl: any = component.loginForm.get('emailOrMobile')
    emailControl.setValue('')
    expect(emailControl.errors['required']).toBeTruthy()
  })

  it('should mark login form as invalid when email format is incorrect', () => {
    const emailControl: any = component.loginForm.get('emailOrMobile')
    emailControl.setValue('invalid_email')
    expect(emailControl.errors['pattern']).toBeTruthy()
  })

  it('should mark login form as invalid when password is empty', () => {
    const passwordControl: any = component.loginPwdForm.get('password')
    passwordControl.setValue('')
    expect(passwordControl.errors['required']).toBeTruthy()
  })

  it('should mark login form as invalid when password does not meet complexity requirements', () => {
    const passwordControl: any = component.loginPwdForm.get('password')
    passwordControl.setValue('weakPassword')
    expect(passwordControl.errors['pattern']).toBeTruthy()
  })

  it('should set email validation error on invalid email format', () => {
    const emailControl: any = component.loginForm.get('emailOrMobile')
    emailControl.setValue('invalid_email')
    emailControl.updateValueAndValidity()
    expect(emailControl.errors['pattern']).toBeTruthy()
  })

  it('should set phone number validation error on invalid phone format', () => {
    const phoneControl: any = component.loginForm.get('emailOrMobile')
    phoneControl.setValue('123')
    phoneControl.updateValueAndValidity()
    expect(phoneControl.errors['pattern']).toBeTruthy()
  })


  it('should call mockSignupService.loginAPI on valid form submission', () => {
    const form: any = component.loginPwdForm

    form.controls['emailOrMobile'].setValue('valid@email.com')
    form.controls['password'].setValue('Sunbird@123')

    const req = {
      "userEmail": form.controls.emailOrMobile.value,
      "typeOfLogin": "password",
      "userPassword": form.controls.password.value
    }
    component.submitDetails(req)
  })

  it('should submit phone login details and call loginAPI on form validation', () => {
    component.loginPwdForm.controls.emailOrMobile.setValue('9986250780')
    component.loginPwdForm.controls.password.setValue('password123')

    component.loginPwdForm.controls.emailOrMobile.setErrors(null)
    component.loginPwdForm.controls.password.setErrors(null)
    mockSignupService.loginAPI = jest.fn().mockImplementation(() => ({
      subscribe: jest.fn() // Mocking the subscribe method
    }))
    component.submitDetails({ status: 'VALID' })
    expect(mockSignupService.loginAPI).toHaveBeenCalled()
  })

  it('should submit email login details and call loginAPI on form validation', () => {
    component.loginPwdForm.controls.emailOrMobile.setValue('spra@yopmail.com')
    component.loginPwdForm.controls.password.setValue('password123')

    component.loginPwdForm.controls.emailOrMobile.setErrors(null)
    component.loginPwdForm.controls.password.setErrors(null)
    mockSignupService.loginAPI = jest.fn().mockImplementation(() => ({
      subscribe: jest.fn() // Mocking the subscribe method
    }))
    component.submitDetails({ status: 'VALID' })
    expect(mockSignupService.loginAPI).toHaveBeenCalled()
  })

  it('should not call loginAPI for invalid form status', () => {
    const consoleLogSpy = jest.spyOn(console, 'log')
    // Mock loginPwdForm with invalid status (not 'VALID')
    component.loginPwdForm.controls.emailOrMobile.setValue('9986250738')
    component.loginPwdForm.controls.password.setValue('password123')
    component.loginPwdForm.controls.emailOrMobile.setErrors(null)
    component.loginPwdForm.controls.password.setErrors(null)
    mockSignupService.loginAPI = jest.fn().mockImplementation(() => ({
      subscribe: jest.fn() // Mocking the subscribe method
    }))
    component.submitDetails({ status: 'INVALID' })
    // Verify that loginAPI method was not called
    expect(mockSignupService.loginAPI).not.toHaveBeenCalled()
    expect(consoleLogSpy).toHaveBeenCalledWith('alert')
  })

  it('should submit phone details and call resendOTP on form validation', () => {
    component.loginForm.controls.emailOrMobile.setValue('9986250739')
    component.loginForm.controls.emailOrMobile.setErrors(null)
    mockSignupService.resendOTP = jest.fn().mockImplementation(() => ({
      subscribe: jest.fn() // Mocking the subscribe method
    }))
    component.resendOTP({ status: 'VALID' })
    expect(mockSignupService.resendOTP).toHaveBeenCalled()
  })

  it('should submit email details and call resendOTP on form validation', () => {
    component.loginForm.controls.emailOrMobile.setValue('spra@yopmail.com')
    component.loginForm.controls.emailOrMobile.setErrors(null)
    mockSignupService.resendOTP = jest.fn().mockImplementation(() => ({
      subscribe: jest.fn() // Mocking the subscribe method
    }))
    component.resendOTP({ status: 'VALID' })
    expect(mockSignupService.resendOTP).toHaveBeenCalled()
  })

  it('should submit email details and call otpClick on form validation', () => {
    component.loginForm.controls.emailOrMobile.setValue('creator@yopmail.com')
    component.loginForm.controls.emailOrMobile.setErrors(null)

    mockSignupService.sendOTP = jest.fn().mockImplementation(() => ({
      subscribe: jest.fn() // Mocking the subscribe method
    }))
    component.otpClick({ status: 'VALID' })
    expect(mockSignupService.sendOTP).toHaveBeenCalled()

  })

  it('should submit phone details and call otpClick on form validation', () => {
    component.loginForm.controls.emailOrMobile.setValue('9986350738')
    component.loginForm.controls.emailOrMobile.setErrors(null)

    mockSignupService.sendOTP = jest.fn().mockImplementation(() => ({
      subscribe: jest.fn() // Mocking the subscribe method
    }))
    component.otpClick({ status: 'VALID' })
    expect(mockSignupService.sendOTP).toHaveBeenCalled()

  })

  it('should submit email details and call otpSubmit on form validation', () => {
    component.loginForm.controls.emailOrMobile.setValue('creator@yopmail.com')
    component.OTPForm.controls.OTPcode.setValue('123456')
    component.loginForm.controls.emailOrMobile.setErrors(null)
    component.OTPForm.controls.OTPcode.setErrors(null)
    mockSignupService.loginAPI = jest.fn().mockImplementation(() => ({
      subscribe: jest.fn() // Mocking the subscribe method
    }))
    component.otpSubmit()
    expect(mockSignupService.loginAPI).toHaveBeenCalled()
  })

  it('should submit phone details and call otpSubmit on form validation', () => {
    component.loginForm.controls.emailOrMobile.setValue('9986350738')
    component.OTPForm.controls.OTPcode.setValue('123456')
    component.loginForm.controls.emailOrMobile.setErrors(null)
    component.OTPForm.controls.OTPcode.setErrors(null)
    mockSignupService.loginAPI = jest.fn().mockImplementation(() => ({
      subscribe: jest.fn() // Mocking the subscribe method
    }))
    component.otpSubmit()
    expect(mockSignupService.loginAPI).toHaveBeenCalled()
  })

  it('should send OTP for valid phone number and handle response', () => {
    // Simulate VALID form status with a phone number input
    component.loginForm.controls.emailOrMobile.setValue('0845678901')

    mockSignupService.sendOTP = jest.fn().mockImplementation(() => ({
      subscribe: jest.fn() // Mocking the subscribe method
    }))

    component.otpClick({ status: 'VALID' })

    // Verify that sendOTP was called with the correct request
    expect(mockSignupService.sendOTP).toHaveBeenCalledWith({ userPhone: '0845678901', userEmail: '' })

    // Verify the sendOTP method was called
    expect(mockSignupService.sendOTP).toHaveBeenCalled()
  })
  it('should send OTP for valid email address and handle response', () => {
    // Simulate VALID form status with a email address input
    component.loginForm.controls.emailOrMobile.setValue('yahoo@yopmail.com')

    mockSignupService.sendOTP = jest.fn().mockImplementation(() => ({
      subscribe: jest.fn() // Mocking the subscribe method
    }))

    component.otpClick({ status: 'VALID' })

    // Verify that sendOTP was called with the correct request
    expect(mockSignupService.sendOTP).toHaveBeenCalledWith({ userPhone: '', userEmail: 'yahoo@yopmail.com' })

    // Verify the sendOTP method was called
    expect(mockSignupService.sendOTP).toHaveBeenCalled()
  })


  it('should validate mobile pattern in loginForm', () => {
    const control = component.loginForm.controls.emailOrMobile
    control.setValue('9876543210')
    expect(control.valid).toBeTruthy()
  })

  it('should validate email pattern in loginForm', () => {
    const control = component.loginForm.controls.emailOrMobile
    control.setValue('test@example.com')
    expect(control.valid).toBeTruthy()
  })

  it('should open snackbar with message', () => {
    const spy = jest.spyOn(mockMatSnackBar, 'open')
    component.openSnackbar('Test Message')
    expect(spy).toHaveBeenCalledWith('Test Message', undefined, { duration: 3000 })
  })

  it('should set selectedField to given value', () => {
    component.passwordOrOtp('password')
    expect(component.selectedField).toBe('password')
  })

  // User can toggle password visibility
  it('should toggle password visibility when the toggle2 method is called', () => {

    component.toggle2()
    expect(component.hide2).toBe(false)
    expect(component.iconChange2).toBe('fas fa-eye')
  })

})





