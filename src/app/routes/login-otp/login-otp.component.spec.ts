import { ComponentFixture, TestBed } from '@angular/core/testing'
import { LoginOtpComponent } from './login-otp.component'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { MatSnackBar, MatSnackBarModule } from '@angular/material'
import { SignupService } from 'src/app/routes/signup/signup.service'
import { MatInputModule } from '@angular/material/input'
import { RouterModule } from '@angular/router'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterTestingModule } from '@angular/router/testing'
import { BehaviorSubject, of } from 'rxjs'
import { ValueService } from '../../../../library/ws-widget/utils/src/public-api'
import { MatDialog } from '@angular/material/dialog'
import { MatDialogModule } from '@angular/material'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatIconModule } from '@angular/material/icon'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatButtonModule } from '@angular/material/button'
import { LoaderService } from '@ws/author/src/public-api'
import { FormsModule } from '@angular/forms'
import { MatRadioModule } from '@angular/material/radio'
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core'
// import { CreateAccountDialogComponent } from '../create-account-modal/create-account-dialog.component'


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

const mockDialogBar: Partial<MatDialog> = {
  open: jest.fn()
}


describe('LoginOtpComponent', () => {
  let component: LoginOtpComponent
  let fixture: ComponentFixture<LoginOtpComponent>

  beforeAll(() => {
    component = new LoginOtpComponent(
      mockFormBuilder as FormBuilder,
      mockMatSnackBar as MatSnackBar,
      mockSignupService as SignupService,
      mockValueService as ValueService,
      mockDialogBar as MatDialog,

    )
  })

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginOtpComponent],
      imports: [
        FormsModule,
        MatRadioModule,
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
        { provide: MatSnackBar, useValue: mockMatSnackBar },
        { provide: LoaderService, useValue: { changeLoad: new BehaviorSubject<boolean>(false) } },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
      .compileComponents()
    mockSignupService = TestBed.get(SignupService)
  })
  beforeEach(() => {
    fixture = TestBed.createComponent(LoginOtpComponent)
    component = fixture.componentInstance
    component.ngOnInit() // Ensure form groups are initialized
    jest.clearAllMocks()
  })
  it('should create the component', () => {
    expect(component).toBeTruthy()
  })
  it('should initialize form for email type', () => {
    component.emailPhoneType = 'email'
    component.initializeForm()
    expect(component.loginOtpForm.get('code')).toBeDefined()
  })

  it('should initialize form for phone type', () => {
    component.emailPhoneType = 'phone'
    component.initializeForm()
    expect(component.loginOtpForm.get('otp1')).toBeDefined()
    expect(component.loginOtpForm.get('otp2')).toBeDefined()
    expect(component.loginOtpForm.get('otp3')).toBeDefined()
    expect(component.loginOtpForm.get('otp4')).toBeDefined()
    expect(component.loginOtpForm.get('code')).toBeDefined()
  })

  // it('should update OTP code when OTP digits are set', () => {
  //   // Set OTP digits in the form
  //   component.loginOtpForm.setValue({ otp1: '1', otp2: '2', otp3: '3', otp4: '4' })

  //   // Call updateOtpCode method to update 'code' form control
  //   component.updateOtpCode()

  //   // Check if 'code' form control's value is updated correctly
  //   const val = component.loginOtpForm.get('code')
  //   if (val) {
  //     expect(val.value).toEqual('1234')
  //   } else {
  //     fail('Form control "code" not found')
  //   }
  // })


  it('should start timer', () => {
    component.startTimer()
    expect(component.resendTimer).toEqual(600)
    expect(component.resendTimerText).toEqual('10:00')
    expect(component.isBelowOneMinute).toBeFalsy()
  })

  it('should redirect to sign up', () => {
    spyOn(component.redirectToParent, 'emit')
    component.redirectToSignUp()
    expect(component.redirectToParent.emit).toHaveBeenCalledWith('true')
  })

  it('should redirect to mobile login', () => {
    spyOn(component.redirectToParent, 'emit')
    component.redirectToMobileLogin()
    expect(component.redirectToParent.emit).toHaveBeenCalledWith('true')
  })

  // it('should verify OTP for sign up', () => {
  //   spyOn(component.signupService, 'ssoValidateOTP').and.returnValue(of({ msg: 'Success' }))
  //   component.verifyOtp()
  //   expect(component.isLoading).toBeTruthy()
  //   expect(component.signupService.ssoValidateOTP).toHaveBeenCalled()
  // })

  // it('should verify OTP for login', () => {
  //   spyOn(component.signupService, 'ssoValidateOTP').and.returnValue(of({ message: 'Verification successful' }))
  //   component.loginData = { value: { username: 'test@example.com', password: 'password' } }
  //   component.loginVerification = true
  //   component.verifyOtp()
  //   expect(component.isLoading).toBeTruthy()
  //   expect(component.signupService.ssoValidateOTP).toHaveBeenCalled()
  //   // Add more expectations based on your application flow
  // })

  // it('should resend OTP', () => {
  //   spyOn(component.signupService, 'generateOtp').and.returnValue(of({ message: 'OTP sent successfully' }))
  //   component.resendOTP('phone')
  //   expect(component.isLoading).toBeTruthy()
  //   expect(component.signupService.generateOtp).toHaveBeenCalled()
  //   // Add more expectations based on your application flow
  // })

  // it('should open help dialog', () => {
  //   spyOn(component.dialog, 'open').and.callThrough()
  //   component.help()
  //   expect(component.dialog.open).toHaveBeenCalledWith(CreateAccountDialogComponent, {
  //     panelClass: 'language-modal',
  //     width: '345px',
  //     height: '335px',
  //     data: {
  //       selected: 'help',
  //     },
  //   })
  // })
  // it('should handle backSpaceEvent', () => {
  //   const event = { key: 'Backspace' } as KeyboardEvent
  //   const currentInput = { value: '1' }
  //   const previousInput = { focus: jest.fn() }
  //   spyOn(previousInput, 'focus')
  //   component.backSpaceEvent(event, currentInput, previousInput)
  //   expect(previousInput.focus).toHaveBeenCalled()
  // })

  it('should move focus to next input', () => {
    const currentInput = { value: '1' }
    const nextInput = { focus: jest.fn() }
    spyOn(nextInput, 'focus')
    component.moveFocus(currentInput, nextInput)
    expect(nextInput.focus).toHaveBeenCalled()
  })

  // it('should handle OTP update when inputs are filled', () => {
  //   component.loginOtpForm.setValue({ otp1: '1', otp2: '2', otp3: '3', otp4: '4' })
  //   component.updateOtpCode()
  //   expect(component.loginOtpForm.get('code')!.value).toEqual('1234')
  // })

  // it('should handle OTP update when inputs are not filled', () => {
  //   component.loginOtpForm.setValue({ otp1: '', otp2: '', otp3: '', otp4: '' })
  //   component.updateOtpCode()
  //   expect(component.loginOtpForm.get('code')!.value).toEqual('')
  // })

  // it('should handle OTP update when some inputs are empty', () => {
  //   component.loginOtpForm.setValue({ otp1: '1', otp2: '', otp3: '', otp4: '4' })
  //   component.updateOtpCode()
  //   expect(component.loginOtpForm.get('code')!.value).toEqual('1  4')
  // })

  // it('should handle OTP update when one input is filled and others are not', () => {
  //   component.loginOtpForm.setValue({ otp1: '1', otp2: '', otp3: '', otp4: '' })
  //   component.updateOtpCode()
  //   expect(component.loginOtpForm.get('code')!.value).toEqual('1   ')
  // })

  // it('should handle OTP update when all inputs are empty', () => {
  //   component.loginOtpForm.setValue({ otp1: '', otp2: '', otp3: '', otp4: '' })
  //   component.updateOtpCode()
  //   expect(component.loginOtpForm.get('code')!.value).toEqual('')
  // })

  // it('should handle OTP update when control is undefined', () => {
  //   component.loginOtpForm = undefined as any
  //   component.updateOtpCode()
  //   // Ideally, you would handle this case with appropriate error checking in your application.
  //   // For the test, this ensures the method does not throw errors with undefined controls.
  //   expect(true).toBeTruthy()
  // })

  it('should handle OTP update when controls are missing', () => {
    spyOn(console, 'error') // Mock console.error to suppress output during the test
    component.loginOtpForm.removeControl('otp1')
    component.updateOtpCode()
    expect(console.error).toHaveBeenCalled()
  })

  it('should handle OTP update when form is invalid', () => {
    component.loginOtpForm.setErrors({ invalid: true })
    component.updateOtpCode()
    expect(component.loginOtpForm.get('code')!.value).toEqual('')
  })

  it('should handle OTP update when form is disabled', () => {
    component.loginOtpForm.disable()
    component.updateOtpCode()
    expect(component.loginOtpForm.get('code')!.value).toEqual('')
  })

  it('should handle OTP update when form controls are missing', () => {
    spyOn(console, 'error') // Mock console.error to suppress output during the test
    component.loginOtpForm.removeControl('otp1')
    component.updateOtpCode()
    expect(console.error).toHaveBeenCalled()
  })
  it('should handle OTP update when OTP form is pristine', () => {
    component.loginOtpForm.markAsPristine()
    component.updateOtpCode()
    expect(component.loginOtpForm.get('code')!.value).toEqual('')
  })

  it('should handle OTP update when OTP form is touched', () => {
    component.loginOtpForm.markAsTouched()
    component.updateOtpCode()
    expect(component.loginOtpForm.get('code')!.value).toEqual('')
  })

})
