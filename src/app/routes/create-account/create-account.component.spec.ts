import { ComponentFixture, TestBed } from '@angular/core/testing'
import { CreateAccountComponent } from './create-account.component'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { SignupService } from 'src/app/routes/signup/signup.service'
import { MatInputModule } from '@angular/material/input'
import { RouterModule } from '@angular/router'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterTestingModule } from '@angular/router/testing'
import { BehaviorSubject, of } from 'rxjs'
import { ConfigurationsService, ValueService } from '../../../../library/ws-widget/utils/src/public-api'
import { MatDialog } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { MatDialogModule } from '@angular/material/dialog'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatIconModule } from '@angular/material/icon'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatButtonModule } from '@angular/material/button'
import { LoaderService } from '@ws/author/src/public-api'
import { FormsModule } from '@angular/forms'
import { MatRadioModule } from '@angular/material/radio'
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core'
// import { mustMatch } from '../password-validator'
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
let loader: Partial<LoaderService> = {}

let mockConfigurationsService: Partial<ConfigurationsService> = {}
const mockDialogBar: Partial<MatDialog> = {
  open: jest.fn()
}
const mockRouterService: Partial<Router> = {
  navigate: jest.fn(), // Add this line
  navigateByUrl: jest.fn(),
}

describe('CreateAccountComponent', () => {
  let component: CreateAccountComponent
  let fixture: ComponentFixture<CreateAccountComponent>


  beforeAll(() => {
    component = new CreateAccountComponent(
      mockFormBuilder as FormBuilder,
      mockMatSnackBar as MatSnackBar,
      mockSignupService as SignupService,
      mockRouterService as Router,
      mockDialogBar as MatDialog,
      loader as LoaderService,
      mockConfigurationsService as ConfigurationsService,
      mockValueService as ValueService,

    )
  })

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateAccountComponent],
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
    fixture = TestBed.createComponent(CreateAccountComponent)
    component = fixture.componentInstance
    component.ngOnInit() // Ensure form groups are initialized
    jest.clearAllMocks()
  })


  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize createAccountForm with required fields', () => {
    expect(component.createAccountForm).toBeTruthy()
    expect(component.createAccountForm.get('firstname')).toBeTruthy()
    expect(component.createAccountForm.get('lastname')).toBeTruthy()
    expect(component.createAccountForm.get('emailOrMobile')).toBeTruthy()
  })

  it('should initialize createAccountWithPasswordForm with required fields', () => {
    expect(component.createAccountWithPasswordForm).toBeTruthy()
    expect(component.createAccountWithPasswordForm.get('password')).toBeTruthy()
    expect(component.createAccountWithPasswordForm.get('confirmPassword')).toBeTruthy()
  })

  // it('should set validators correctly for password fields', () => {
  //   const passwordControl = component.createAccountWithPasswordForm.get('password')
  //   const confirmPasswordControl = component.createAccountWithPasswordForm.get('confirmPassword')

  //   // Check if validators are set correctly
  //   expect(passwordControl?.validator).toBeTruthy()
  //   expect(confirmPasswordControl?.validator).toEqual(mustMatch('password', 'confirmPassword'))
  // })


  // it('should update password value and validation images', () => {
  //   // Set the password value
  //   component.createAccountWithPasswordForm.get('password')?.setValue('TestPassword1!')

  //   // Update validation images
  //   component.updatePasswordValidationImages()

  //   // Add expectations for validation images if applicable
  // })

  // it('should initialize firstname and lastname to empty strings', () => {
  //   // Check initial values of firstname and lastname fields
  //   expect(component.createAccountForm.get('firstname')?.value).toEqual('')
  //   expect(component.createAccountForm.get('lastname')?.value).toEqual('')
  // })


  it('should toggle password visibility on toggle1 method call', () => {
    const initialHide1 = component.hide1
    component.toggle1()
    expect(component.hide1).toBe(!initialHide1)
  })

  it('should toggle password visibility on toggle2 method call', () => {
    const initialHide2 = component.hide2
    component.toggle2()
    expect(component.hide2).toBe(!initialHide2)
  })

  // it('should update password validation images correctly on updatePasswordValidationImages method call', () => {
  //   component.createAccountWithPasswordForm.get('password')?.setValue('TestPassword1!')
  //   component.updatePasswordValidationImages()
  //   expect(component.passwordLengthImage).toContain('pwd-tick.png')
  //   expect(component.passwordUppercaseImage).toContain('pwd-tick.png')
  //   expect(component.passwordNumberImage).toContain('pwd-tick.png')
  //   expect(component.passwordSpecialCharImage).toContain('pwd-tick.png')
  // })

  it('should show parent form fields on showParentForm method call', () => {
    const event = 'true'
    component.showParentForm(event)
    expect(component.createAccountForm.get('firstname')).toBeTruthy()
    expect(component.createAccountForm.get('lastname')).toBeTruthy()
  })

  it('should update preferredLanguage on preferredLanguageChange method call', () => {
    const event = 'hi'
    component.preferredLanguageChange(event)
    expect(component.preferedLanguage).toEqual({ id: 'hi', lang: 'हिंदी' })
  })

  it('should call langChanged method and update createAccount and langPage flags', () => {
    component.langChanged()
    expect(component.createAccount).toBe(true)
    expect(component.langPage).toBe(false)
  })

  // it('should call emailOrMobileValueChange method and set emailDelaid flag to true', () => {
  //   component.emailOrMobileValueChange()
  //   expect(component.emailDelaid).toBe(true)
  // })

  // it('should initialize form fields on initializeFormFields method call', () => {
  //   component.initializeFormFields()
  //   expect(component.createAccountForm.get('firstname')?.value).toEqual('')
  //   expect(component.createAccountForm.get('lastname')?.value).toEqual('')
  // })

  // it('should call redirect method with "lang" parameter and navigate to "/public/home"', () => {
  //   const mockHref = jest.spyOn(window.location, 'href', 'get')
  //   mockHref.mockReturnValue('/public/home')

  //   component.redirect('lang')

  //   expect(mockHref).toHaveBeenCalled()
  //   expect(mockHref).toHaveBeenCalledWith('/public/home')
  // })



  it('should call redirect method with "createAccount" parameter and update component flags', () => {
    component.redirect('createAccount')
    expect(component.langPage).toBe(true)
    expect(component.createAccount).toBe(false)
    expect(component.confirmPassword).toBe(false)
    expect(component.otpPage).toBe(false)
  })

  it('should call redirect method with "confirmPassword" parameter and update component flags', () => {
    component.redirect('confirmPassword')
    expect(component.langPage).toBe(false)
    expect(component.createAccount).toBe(true)
    expect(component.confirmPassword).toBe(false)
    expect(component.otpPage).toBe(false)
  })

  it('should call redirect method with unknown parameter and update component flags', () => {
    component.redirect('unknown')
    expect(component.createAccount).toBe(true)
    expect(component.confirmPassword).toBe(false)
    expect(component.otpPage).toBe(false)
  })
  // it('should call help method and open a dialog with correct parameters', () => {
  //   const dialogRefSpyObj = { afterClosed: of({}) };
  //   (mockDialogBar.open as jest.Mock).mockReturnValue(dialogRefSpyObj)

  //   component.help()

  //   expect(mockDialogBar.open).toHaveBeenCalledWith(
  //     CreateAccountDialogComponent,
  //     {
  //       panelClass: 'language-modal',
  //       width: '345px',
  //       height: '335px',
  //       data: { selected: 'help' }
  //     }
  //   )
  // })



  // it('should call optionSelected method and open a dialog with correct parameters', () => {
  //   const dialogRefSpyObj = { afterClosed: of('login') };
  //   (mockDialogBar.open as jest.Mock).mockReturnValue(dialogRefSpyObj)

  //   component.optionSelected()

  //   expect(mockDialogBar.open).toHaveBeenCalledWith(
  //     CreateAccountDialogComponent,
  //     {
  //       panelClass: 'language-modal',
  //       width: '312px',
  //       height: '186px',
  //       data: { selected: 'name', details: { firstname: '', lastname: '' } }
  //     }
  //   )
  // })

  // it('should call userExist method and open a dialog with correct parameters', () => {
  //   const dialogRefSpyObj = { afterClosed: of('login') };
  //   (mockDialogBar.open as jest.Mock).mockReturnValue(dialogRefSpyObj)
  //   component.userExist()

  //   expect(mockDialogBar.open).toHaveBeenCalledWith(
  //     CreateAccountDialogComponent,
  //     {
  //       panelClass: 'language-modal',
  //       width: '312px',
  //       height: '186px',
  //       data: { selected: 'userExist' }
  //     }
  //   )

  // })

  // it('should call onSubmit method and show success snackbar on successful signup', async () => {
  //   // Mock response data
  //   const successResponse = { statusCode: 200, error: false, message: 'Success' }

  //   // Mock the service method and provide a mock implementation
  //   jest.spyOn(mockSignupService, 'ssoWithMobileEmail').mockResolvedValue(successResponse as never)

  //   // Set up the form data
  //   component.createAccountForm.setValue({
  //     firstname: 'John',
  //     lastname: 'Doe',
  //     emailOrMobile: 'john.doe@example.com'
  //   })

  //   // Call the method that triggers the service call (assuming onSubmit triggers signup)
  //   await component.onSubmit(component.createAccountForm, component.createAccountForm)

  //   // Assert that the success message is shown
  //   expect(mockMatSnackBar.open).toHaveBeenCalledWith('Success', 'close', { duration: 3000 })
  // })




  // it('should call saveUser method and show error snackbar on failed signup', async () => {
  //   const errorResponse = { statusCode: 400, error: true, message: 'Error' }
  //   jest.spyOn(mockSignupService, 'ssoWithMobileEmail').mockResolvedValue(errorResponse as never)
  //   component.createAccountForm.setValue({
  //     firstname: 'John',
  //     lastname: 'Doe',
  //     emailOrMobile: 'john.doe@example.com'
  //   })

  //   // Call the method that triggers the service call (assuming onSubmit triggers signup)
  //   await component.onSubmit(component.createAccountForm, component.createAccountForm)
  //   expect(mockMatSnackBar.open).toHaveBeenCalledWith('Error', 'close', { duration: 3000 })
  // })
  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    TestBed.resetTestingModule()
  })
})





