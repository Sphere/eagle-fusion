import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar'
import { RouterTestingModule } from '@angular/router/testing'

import { BnrcLoginOtpComponent } from './bnrc-login-otp.component'
import { UserProfileService } from 'project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms'

describe('BnrcLoginOtpComponent', () => {
  let component: BnrcLoginOtpComponent
  let fixture: ComponentFixture<BnrcLoginOtpComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BnrcLoginOtpComponent],
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        FormsModule,
        MatSnackBarModule,
      ],
      providers: [
        FormBuilder,
        { provide: MatSnackBar, useValue: { open: jest.fn() } },
        { provide: UserProfileService, useValue: {} },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(BnrcLoginOtpComponent)
    component = fixture.componentInstance
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should open snackbar when calling openSnackbar method', () => {
    const snackBar = TestBed.inject(MatSnackBar)
    jest.spyOn(snackBar, 'open')

    component.openSnackbar('Test message')

    expect(snackBar.open).toHaveBeenCalledWith('Test message', undefined, { duration: 3000 })
  })

  it('should emit event and show success message when OTP is validated successfully', () => {
    const mockRouter = { url: 'uttarpradesh/register' }
    const mockFormBuilder = new FormBuilder()
    const mockSnackBar = { open: jest.fn() }
    const mockUserProfileSvc = {
      upsmfValidateOtp: jest.fn().mockReturnValue({
        subscribe: (success: Function) => success({ status: 'success', message: { message: 'OTP validated' } }),
      }),
      bnrcValidateOtp: jest.fn(),
      mpValidateOtp: jest.fn(),
    }
    const mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    const component = new BnrcLoginOtpComponent(mockRouter as any, mockFormBuilder, mockSnackBar as any, mockUserProfileSvc as any, mockLogger as any, { detectChanges: jest.fn() } as any)
    component.loginData = { value: { phone: '1234567890' } }
    component.loginOtpForm.setValue({ code: '1234' })
    component.redirectToParent.emit = jest.fn()

    component.loginVerifyOtp()

    expect(mockSnackBar.open).toHaveBeenCalledWith('OTP validated', undefined, { duration: 3000 })
    expect(component.redirectToParent.emit).toHaveBeenCalledWith({ status: 'success', message: { message: 'OTP validated' } })
  })

  it('should show error message when OTP validation fails', () => {
    const mockRouter = { url: 'uttarpradesh/register' }
    const mockFormBuilder = new FormBuilder()
    const mockSnackBar = { open: jest.fn() }
    const mockUserProfileSvc = {
      upsmfValidateOtp: jest.fn().mockReturnValue({
        subscribe: (_success: Function, error: Function) => error({ error: { message: 'Invalid OTP' } }),
      }),
      bnrcValidateOtp: jest.fn(),
      mpValidateOtp: jest.fn(),
    }
    const mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    const component = new BnrcLoginOtpComponent(mockRouter as any, mockFormBuilder, mockSnackBar as any, mockUserProfileSvc as any, mockLogger as any, { detectChanges: jest.fn() } as any)
    component.loginData = { value: { phone: '1234567890' } }
    component.loginOtpForm.setValue({ code: '1234' })

    component.loginVerifyOtp()

    expect(mockSnackBar.open).toHaveBeenCalledWith('Invalid OTP', undefined, { duration: 3000 })
  })

  it('should resend OTP successfully and show success message', () => {
    const mockRouter = { url: 'uttarpradesh/register' }
    const mockFormBuilder = new FormBuilder()
    const mockSnackBar = { open: jest.fn() }
    const mockUserProfileSvc = {
      upsmfResendOtp: jest.fn().mockReturnValue({
        subscribe: (success: Function) => success({ message: 'OTP resent' }),
      }),
      bnrcResendOtp: jest.fn(),
      mpResendOtp: jest.fn(),
    }
    const mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    const component = new BnrcLoginOtpComponent(mockRouter as any, mockFormBuilder, mockSnackBar as any, mockUserProfileSvc as any, mockLogger as any, { detectChanges: jest.fn() } as any)
    component.loginData = { value: { phone: '1234567890' } }
    component.loginOtpForm.patchValue({ code: '1234' })

    component.resendOTP()

    expect(mockSnackBar.open).toHaveBeenCalledWith('OTP resent', undefined, { duration: 3000 })
  })

  it('should use upsmfValidateOtp method when URL includes "uttarpradesh/register"', () => {
    const mockRouter = { url: 'uttarpradesh/register' }
    const mockFormBuilder = new FormBuilder()
    const mockSnackBar = { open: jest.fn() }
    const mockUserProfileSvc = {
      upsmfValidateOtp: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
      bnrcValidateOtp: jest.fn(),
      mpValidateOtp: jest.fn(),
    }
    const mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    const component = new BnrcLoginOtpComponent(mockRouter as any, mockFormBuilder, mockSnackBar as any, mockUserProfileSvc as any, mockLogger as any, { detectChanges: jest.fn() } as any)
    component.loginData = { value: { phone: '1234567890' } }
    component.loginOtpForm.setValue({ code: '1234' })

    component.loginVerifyOtp()

    expect(mockUserProfileSvc.upsmfValidateOtp).toHaveBeenCalledWith({ phone: '1234567890', otp: '1234' })
  })

  it('should not call snackBar or emit when loginData is null', () => {
    const mockRouter = { url: 'uttarpradesh/register' }
    const mockFormBuilder = new FormBuilder()
    const mockSnackBar = { open: jest.fn() }
    const mockUserProfileSvc = {
      upsmfValidateOtp: jest.fn(),
      bnrcValidateOtp: jest.fn(),
      mpValidateOtp: jest.fn(),
    }
    const mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    const component = new BnrcLoginOtpComponent(mockRouter as any, mockFormBuilder, mockSnackBar as any, mockUserProfileSvc as any, mockLogger as any, { detectChanges: jest.fn() } as any)
    component.loginData = null
    component.loginOtpForm.setValue({ code: '1234' })
    component.redirectToParent.emit = jest.fn()

    try { component.loginVerifyOtp() } catch (_) { /* expected when loginData is null */ }

    expect(mockSnackBar.open).not.toHaveBeenCalled()
    expect(component.redirectToParent.emit).not.toHaveBeenCalled()
  })

  it('should handle empty primaryMsg in openSnackbar', () => {
    const mockRouter = { url: 'uttarpradesh/register' }
    const mockFormBuilder = new FormBuilder()
    const mockSnackBar = { open: jest.fn() }
    const mockUserProfileSvc = {
      upsmfValidateOtp: jest.fn(),
      bnrcValidateOtp: jest.fn(),
      mpValidateOtp: jest.fn(),
    }
    const mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    const component = new BnrcLoginOtpComponent(mockRouter as any, mockFormBuilder, mockSnackBar as any, mockUserProfileSvc as any, mockLogger as any, { detectChanges: jest.fn() } as any)

    component.openSnackbar('')

    expect(mockSnackBar.open).toHaveBeenCalledWith('', undefined, { duration: 3000 })
  })

  it('ngOnInit sets loginVerification true when loginData is set', () => {
    const mockRouter = { url: 'uttarpradesh/register' }
    const mockFormBuilder = new FormBuilder()
    const mockSnackBar = { open: jest.fn() }
    const mockUserProfileSvc = { upsmfValidateOtp: jest.fn(), bnrcValidateOtp: jest.fn(), mpValidateOtp: jest.fn() }
    const mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    const comp = new BnrcLoginOtpComponent(mockRouter as any, mockFormBuilder, mockSnackBar as any, mockUserProfileSvc as any, mockLogger as any, { detectChanges: jest.fn() } as any)
    comp.loginData = { value: { phone: '9876543210' } }
    comp.ngOnInit()
    expect(comp.loginVerification).toBe(true)
  })

  it('resendOTP error callback shows snackbar when no preferedLanguage', () => {
    const mockRouter = { url: 'uttarpradesh/register' }
    const mockFormBuilder = new FormBuilder()
    const mockSnackBar = { open: jest.fn() }
    const mockUserProfileSvc = {
      upsmfResendOtp: jest.fn().mockReturnValue({
        subscribe: (_s: Function, error: Function) => error({ error: { error: 'OTP error', message: 'Bad OTP' } }),
      }),
      bnrcResendOtp: jest.fn(),
      mpResendOtp: jest.fn(),
    }
    const mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    const comp = new BnrcLoginOtpComponent(mockRouter as any, mockFormBuilder, mockSnackBar as any, mockUserProfileSvc as any, mockLogger as any, { detectChanges: jest.fn() } as any)
    comp.loginData = { value: { phone: '9876543210' } }
    localStorage.removeItem('preferedLanguage')
    comp.resendOTP()
    expect(mockSnackBar.open).toHaveBeenCalledWith('OTP error', undefined, { duration: 3000 })
  })

  it('should handle unexpected response structures gracefully', () => {
    const mockRouter = { url: 'uttarpradesh/register' }
    const mockFormBuilder = new FormBuilder()
    const mockSnackBar = { open: jest.fn() }
    const mockUserProfileSvc = {
      upsmfValidateOtp: jest.fn().mockReturnValue({
        subscribe: (_success: Function, error: Function) => error({ message: 'An unexpected error occurred' }),
      }),
      bnrcValidateOtp: jest.fn(),
      mpValidateOtp: jest.fn(),
    }
    const mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    const component = new BnrcLoginOtpComponent(mockRouter as any, mockFormBuilder, mockSnackBar as any, mockUserProfileSvc as any, mockLogger as any, { detectChanges: jest.fn() } as any)
    component.loginData = { value: { phone: '1234567890' } }
    component.loginOtpForm.setValue({ code: '1234' })
    component.redirectToParent.emit = jest.fn()

    component.loginVerifyOtp()

    expect(mockSnackBar.open).toHaveBeenCalledWith('An unexpected error occurred', undefined, { duration: 3000 })
  })

  it('shows the response message when validation succeeds but status is not "success"', () => {
    const mockRouter = { url: 'uttarpradesh/register' }
    const mockSnackBar = { open: jest.fn() }
    const mockUserProfileSvc = {
      upsmfValidateOtp: jest.fn().mockReturnValue({
        subscribe: (success: Function) => success({ status: 'failed', message: 'OTP expired' }),
      }),
      bnrcValidateOtp: jest.fn(),
      mpValidateOtp: jest.fn(),
    }
    const mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    const comp = new BnrcLoginOtpComponent(mockRouter as any, new FormBuilder(), mockSnackBar as any, mockUserProfileSvc as any, mockLogger as any, { detectChanges: jest.fn() } as any)
    comp.loginData = { value: { phone: '1234567890' } }
    comp.loginOtpForm.setValue({ code: '1234' })
    comp.loginVerifyOtp()
    expect(mockSnackBar.open).toHaveBeenCalledWith('OTP expired', undefined, { duration: 3000 })
  })

  it('falls back to a default message when a non-success validation has no message', () => {
    const mockRouter = { url: 'madhyapradesh/register' }
    const mockSnackBar = { open: jest.fn() }
    const mockUserProfileSvc = {
      upsmfValidateOtp: jest.fn(),
      bnrcValidateOtp: jest.fn(),
      mpValidateOtp: jest.fn().mockReturnValue({
        subscribe: (success: Function) => success({ status: 'failed' }),
      }),
    }
    const mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    const comp = new BnrcLoginOtpComponent(mockRouter as any, new FormBuilder(), mockSnackBar as any, mockUserProfileSvc as any, mockLogger as any, { detectChanges: jest.fn() } as any)
    comp.loginData = { value: { phone: '1234567890' } }
    comp.loginOtpForm.setValue({ code: '1234' })
    comp.loginVerifyOtp()
    expect(mockSnackBar.open).toHaveBeenCalledWith('OTP verification failed. Please try again.', undefined, { duration: 3000 })
  })

  it('shows the Hindi resend-success message when the stored language is hi', () => {
    const mockRouter = { url: 'bnrc/register' }
    const mockSnackBar = { open: jest.fn() }
    const mockUserProfileSvc = {
      upsmfResendOtp: jest.fn(),
      mpResendOtp: jest.fn(),
      bnrcResendOtp: jest.fn().mockReturnValue({
        subscribe: (success: Function) => success({ message: 'Success ! Please verify the OTP .' }),
      }),
    }
    const mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    const comp = new BnrcLoginOtpComponent(mockRouter as any, new FormBuilder(), mockSnackBar as any, mockUserProfileSvc as any, mockLogger as any, { detectChanges: jest.fn() } as any)
    comp.loginData = { value: { phone: '9876543210' } }
    localStorage.setItem('preferedLanguage', JSON.stringify({ id: 'hi' }))
    comp.resendOTP()
    expect(mockSnackBar.open).toHaveBeenCalledWith('सफलता ! कृपया ओटीपी सत्यापित करें।', undefined, { duration: 3000 })
    localStorage.removeItem('preferedLanguage')
  })

  it('shows the raw resend-success message when the stored language is not hi', () => {
    const mockRouter = { url: 'bnrc/register' }
    const mockSnackBar = { open: jest.fn() }
    const mockUserProfileSvc = {
      upsmfResendOtp: jest.fn(),
      mpResendOtp: jest.fn(),
      bnrcResendOtp: jest.fn().mockReturnValue({
        subscribe: (success: Function) => success({ message: 'OTP resent' }),
      }),
    }
    const mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    const comp = new BnrcLoginOtpComponent(mockRouter as any, new FormBuilder(), mockSnackBar as any, mockUserProfileSvc as any, mockLogger as any, { detectChanges: jest.fn() } as any)
    comp.loginData = { value: { phone: '9876543210' } }
    localStorage.setItem('preferedLanguage', JSON.stringify({ id: 'en' }))
    comp.resendOTP()
    expect(mockSnackBar.open).toHaveBeenCalledWith('OTP resent', undefined, { duration: 3000 })
    localStorage.removeItem('preferedLanguage')
  })

  it('shows the Hindi resend-error message when the stored language is hi', () => {
    const mockRouter = { url: 'bnrc/register' }
    const mockSnackBar = { open: jest.fn() }
    const mockUserProfileSvc = {
      upsmfResendOtp: jest.fn(),
      mpResendOtp: jest.fn(),
      bnrcResendOtp: jest.fn().mockReturnValue({
        subscribe: (_s: Function, error: Function) => error({ error: { message: 'Please provide correct otp and try again.' } }),
      }),
    }
    const mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    const comp = new BnrcLoginOtpComponent(mockRouter as any, new FormBuilder(), mockSnackBar as any, mockUserProfileSvc as any, mockLogger as any, { detectChanges: jest.fn() } as any)
    comp.loginData = { value: { phone: '9876543210' } }
    localStorage.setItem('preferedLanguage', JSON.stringify({ id: 'hi' }))
    comp.resendOTP()
    expect(mockSnackBar.open).toHaveBeenCalledWith('कृपया सही ओटीपी प्रदान करें और पुनः प्रयास करें।', undefined, { duration: 3000 })
    localStorage.removeItem('preferedLanguage')
  })

  it('shows the raw resend-error message when stored language is not hi', () => {
    const mockRouter = { url: 'bnrc/register' }
    const mockSnackBar = { open: jest.fn() }
    const mockUserProfileSvc = {
      upsmfResendOtp: jest.fn(),
      mpResendOtp: jest.fn(),
      bnrcResendOtp: jest.fn().mockReturnValue({
        subscribe: (_s: Function, error: Function) => error({ error: { error: 'raw error', message: 'msg' } }),
      }),
    }
    const mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    const comp = new BnrcLoginOtpComponent(mockRouter as any, new FormBuilder(), mockSnackBar as any, mockUserProfileSvc as any, mockLogger as any, { detectChanges: jest.fn() } as any)
    comp.loginData = { value: { phone: '9876543210' } }
    localStorage.setItem('preferedLanguage', JSON.stringify({ id: 'en' }))
    comp.resendOTP()
    expect(mockSnackBar.open).toHaveBeenCalledWith('raw error', undefined, { duration: 3000 })
    localStorage.removeItem('preferedLanguage')
  })
})
