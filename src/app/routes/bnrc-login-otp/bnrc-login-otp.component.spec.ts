import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatSnackBarModule } from '@angular/material/snack-bar' // Import MatSnackBarModule
import { RouterTestingModule } from '@angular/router/testing'
import { MatSnackBar } from '@angular/material'

import { BnrcLoginOtpComponent } from './bnrc-login-otp.component'
import { UserProfileService } from 'project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms'

describe('BnrcLoginOtpComponent', () => {
  let component: BnrcLoginOtpComponent
  let fixture: ComponentFixture<BnrcLoginOtpComponent>
  // let userProfileService: UserProfileService
  // let snackBar: MatSnackBar

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BnrcLoginOtpComponent],
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        FormsModule,
        MatSnackBarModule, // Add MatSnackBarModule to imports
      ],
      providers: [
        FormBuilder,
        { provide: MatSnackBar, useValue: { open: jest.fn() } },
        // { provide: MatSnackBar, useValue: jest.fn() },
        { provide: UserProfileService, useValue: {} }, // Mock UserProfileService
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(BnrcLoginOtpComponent)
    component = fixture.componentInstance
    // userProfileService = TestBed.get(UserProfileService)
    // snackBar = TestBed.get(MatSnackBar)
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })


  it('should open snackbar when calling openSnackbar method', () => {
    const snackBar = TestBed.get(MatSnackBar)
    spyOn(snackBar, 'open')

    component.openSnackbar('Test message')

    expect(snackBar.open).toHaveBeenCalledWith('Test message', undefined, { duration: 3000 })
  })



  // loginVerifyOtp successfully validates OTP and emits event on success
  it('should emit event and show success message when OTP is validated successfully', () => {
    const mockRouter = { url: 'upsmf/register' }
    const mockFormBuilder = new FormBuilder()
    const mockSnackBar = { open: jest.fn() }
    const mockUserProfileSvc = {
      upsmfValidateOtp: jest.fn().mockReturnValue({
        subscribe: (success: Function) => success({ status: 'success', message: { message: 'OTP validated' } })
      }),
      bnrcValidateOtp: jest.fn()
    }
    const component = new BnrcLoginOtpComponent(mockRouter as any, mockFormBuilder, mockSnackBar as any, mockUserProfileSvc as any)
    component.loginData = { value: { phone: '1234567890' } }
    component.loginOtpForm.setValue({ code: '1234' })
    component.redirectToParent.emit = jest.fn()

    component.loginVerifyOtp()

    expect(mockSnackBar.open).toHaveBeenCalledWith('OTP validated', undefined, { duration: 3000 })
    expect(component.redirectToParent.emit).toHaveBeenCalledWith({ status: 'success', message: { message: 'OTP validated' } })
  })

  // loginVerifyOtp handles error response and shows appropriate error message
  it('should show error message when OTP validation fails', () => {
    const mockRouter = { url: 'upsmf/register' }
    const mockFormBuilder = new FormBuilder()
    const mockSnackBar = { open: jest.fn() }
    const mockUserProfileSvc = {
      upsmfValidateOtp: jest.fn().mockReturnValue({
        subscribe: (_success: Function, error: Function) => error({ error: { message: 'Invalid OTP' } })
      }),
      bnrcValidateOtp: jest.fn()
    }
    const component = new BnrcLoginOtpComponent(mockRouter as any, mockFormBuilder, mockSnackBar as any, mockUserProfileSvc as any)
    component.loginData = { value: { phone: '1234567890' } }
    component.loginOtpForm.setValue({ code: '1234' })

    component.loginVerifyOtp()

    expect(mockSnackBar.open).toHaveBeenCalledWith('Invalid OTP', undefined, { duration: 3000 })
  })

  // resendOTP successfully resends OTP and shows success message
  it('should resend OTP successfully and show success message', () => {
    const mockRouter = { url: 'upsmf/register' }
    const mockFormBuilder = new FormBuilder()
    const mockSnackBar = { open: jest.fn() }
    const mockUserProfileSvc = {
      upsmfResendOtp: jest.fn().mockReturnValue({
        subscribe: (success: Function) => success({ message: 'OTP resent' })
      }),
      bnrcResendOtp: jest.fn()
    }
    const component = new BnrcLoginOtpComponent(mockRouter as any, mockFormBuilder, mockSnackBar as any, mockUserProfileSvc as any)
    component.loginData = { value: { phone: '1234567890' } }
    component.loginOtpForm.patchValue({ code: '1234' })

    component.resendOTP()

    expect(mockSnackBar.open).toHaveBeenCalledWith('OTP resent', undefined, { duration: 3000 })
  })

  // loginVerifyOtp uses correct validation method based on URL
  it('should use upsmfValidateOtp method when URL includes "upsmf/register"', () => {
    const mockRouter = { url: 'upsmf/register' }
    const mockFormBuilder = new FormBuilder()
    const mockSnackBar = { open: jest.fn() }
    const mockUserProfileSvc = {
      upsmfValidateOtp: jest.fn(),
      bnrcValidateOtp: jest.fn()
    }
    const component = new BnrcLoginOtpComponent(mockRouter as any, mockFormBuilder, mockSnackBar as any, mockUserProfileSvc as any)
    component.loginData = { value: { phone: '1234567890' } }
    component.loginOtpForm.setValue({ code: '1234' })

    component.loginVerifyOtp()

    expect(mockUserProfileSvc.upsmfValidateOtp).toHaveBeenCalledWith({ phone: '1234567890', otp: '1234' })
  })

  // loginVerifyOtp handles case when loginData is null or undefined
  it('should handle case when loginData is null or undefined', () => {
    const mockRouter = { url: 'upsmf/register' }
    const mockFormBuilder = new FormBuilder()
    const mockSnackBar = { open: jest.fn() }
    const mockUserProfileSvc = {
      upsmfValidateOtp: jest.fn(),
      bnrcValidateOtp: jest.fn()
    }
    const component = new BnrcLoginOtpComponent(mockRouter as any, mockFormBuilder, mockSnackBar as any, mockUserProfileSvc as any)
    component.loginData = null
    component.loginOtpForm.setValue({ code: '1234' })
    component.redirectToParent.emit = jest.fn()

    component.loginVerifyOtp()

    expect(mockSnackBar.open).not.toHaveBeenCalled()
    expect(component.redirectToParent.emit).not.toHaveBeenCalled()
  })





  // openSnackbar handles case when primaryMsg is empty or null
  it('should handle empty primaryMsg in openSnackbar', () => {
    const mockRouter = { url: 'upsmf/register' }
    const mockFormBuilder = new FormBuilder()
    const mockSnackBar = { open: jest.fn() }
    const mockUserProfileSvc = {
      upsmfValidateOtp: jest.fn(),
      bnrcValidateOtp: jest.fn()
    }
    const component = new BnrcLoginOtpComponent(mockRouter as any, mockFormBuilder, mockSnackBar as any, mockUserProfileSvc as any)

    component.openSnackbar('')

    expect(mockSnackBar.open).toHaveBeenCalledWith('', undefined, { duration: 3000 })
  })

  // loginVerifyOtp should log the current URL for debugging
  // loginVerifyOtp should handle unexpected response structures gracefully
  it('should handle unexpected response structures gracefully', () => {
    const mockRouter = { url: 'upsmf/register' }
    const mockFormBuilder = new FormBuilder()
    const mockSnackBar = { open: jest.fn() }
    const mockUserProfileSvc = {
      upsmfValidateOtp: jest.fn().mockReturnValue({
        subscribe: (_success: Function, error: Function) => error({ message: 'An unexpected error occurred' })
      }),
      bnrcValidateOtp: jest.fn()
    }
    const component = new BnrcLoginOtpComponent(mockRouter as any, mockFormBuilder, mockSnackBar as any, mockUserProfileSvc as any)
    component.loginData = { value: { phone: '1234567890' } }
    component.loginOtpForm.setValue({ code: '1234' })
    component.redirectToParent.emit = jest.fn()

    component.loginVerifyOtp()

    expect(mockSnackBar.open).toHaveBeenCalledWith('An unexpected error occurred', undefined, { duration: 3000 })
  })


})
