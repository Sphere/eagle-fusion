import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialogModule, MatSnackBarModule } from '@angular/material'
import { RouterTestingModule } from '@angular/router/testing'
import { SignupService } from '../signup/signup.service'
import { LoaderService } from '@ws/author/src/public-api'
import { CreateAccountComponent } from './create-account.component'
import { of } from 'rxjs'
import { Router } from '@angular/router'
import { MatRadioModule } from '@angular/material/radio'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { LanguageDialogComponent } from '../language-dialog/language-dialog.component'

describe('CreateAccountComponent', () => {
  let component: CreateAccountComponent
  let fixture: ComponentFixture<CreateAccountComponent>
  let signupServiceMock: jest.Mocked<SignupService>
  let loaderServiceMock: jest.Mocked<LoaderService>
  let mockRouter = { navigate: jest.fn() }
  let originalLocation: Location
  const mockSignupService = {
    ssoWithMobileEmail: jest.fn().mockReturnValue(of({ message: 'User successfully created' })),
    // Other mocked methods if necessary
  }
  beforeEach(async () => {
    signupServiceMock = {
      ssoWithMobileEmail: jest.fn(),
      plumb5SendEvent: jest.fn(),
      plumb5SendForm: jest.fn(),
    } as unknown as jest.Mocked<SignupService>

    loaderServiceMock = {
      changeLoad: { next: jest.fn() } as any,
    } as unknown as jest.Mocked<LoaderService>

    originalLocation = window.location
    delete (window as any).location
    window.location = {
      ...originalLocation,
      assign: jest.fn(),
    }

    await TestBed.configureTestingModule({
      declarations: [CreateAccountComponent, LanguageDialogComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatSnackBarModule,
        RouterTestingModule.withRoutes([]),
        ReactiveFormsModule,
        MatRadioModule,
        MatInputModule,
        MatFormFieldModule,
        NoopAnimationsModule,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: SignupService, useValue: signupServiceMock },
        { provide: LoaderService, useValue: loaderServiceMock },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: {} },
        { provide: SignupService, useValue: mockSignupService }
      ],
    }).compileComponents()
  })

  afterAll(() => {
    window.location = originalLocation
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAccountComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize createAccountForm', () => {
    expect(component.createAccountForm).toBeTruthy()
  })

  it('should initialize createAccountWithPasswordForm', () => {
    expect(component.createAccountWithPasswordForm).toBeTruthy()
  })

  it('should initialize otpCodeForm', () => {
    expect(component.otpCodeForm).toBeTruthy()
  })

  it('should set preferred language from localStorage on init', () => {
    localStorage.setItem('preferedLanguage', JSON.stringify({ id: 'en', lang: 'English' }))
    component.ngOnInit()
    expect(component.preferedLanguage).toEqual({ id: 'en', lang: 'English' })
  })

  // it('should handle window popstate event', () => {
  //   spyOn(window.location, 'assign') // Spy on window.location.assign
  //   component.onPopState() // Trigger the event handler

  //   expect(window.location.assign).toHaveBeenCalledWith('/public/home')
  // })


  it('should toggle hide1 property', () => {
    component.hide1 = false
    component.toggle1()
    expect(component.hide1).toBeTruthy()
    expect(component.iconChange1).toBe('fas fa-eye-slash')
    component.toggle1()
    expect(component.hide1).toBeFalsy()
    expect(component.iconChange1).toBe('fas fa-eye')
  })

  it('should toggle hide2 property', () => {
    component.hide2 = false
    component.toggle2()
    expect(component.hide2).toBeTruthy()
    expect(component.iconChange2).toBe('fas fa-eye-slash')
    component.toggle2()
    expect(component.hide2).toBeFalsy()
    expect(component.iconChange2).toBe('fas fa-eye')
  })

  it('should initialize form fields', () => {
    component.initializeFormFields()
    expect(component.createAccountForm.get('firstname')).toBeTruthy()
    expect(component.createAccountForm.get('lastname')).toBeTruthy()
    expect(component.otpCodeForm.get('otpCode')).toBeTruthy()
  })

  it('should show parent form', () => {
    const spy = jest.spyOn(component, 'initializeFormFields')
    component.showParentForm('true')
    expect(spy).toHaveBeenCalled()
  })

  // it('should change language and navigate', () => {
  //   const result = { id: 'hi', lang: 'हिंदी' }
  //   component.preferedLanguage = result
  //   component.changeLanguage()
  //   component.langDialog.afterClosed().next(result)
  //   expect(localStorage.getItem('preferedLanguage')).toBe(JSON.stringify(result))
  // })

  it('should handle emailOrMobile value change', () => {
    component.emailOrMobileValueChange()
    component.createAccountForm.get('emailOrMobile')!.setValue('test@example.com')
    expect(component.emailDelaid).toBeTruthy()
  })

  // it('should return error type for emailOrMobile', () => {
  //   component.createAccountForm.get('emailOrMobile')!.setValue('')
  //   component.createAccountForm.get('emailOrMobile')!.markAsTouched()
  //   fixture.detectChanges() // Ensure the change detection is run
  //   expect(component.emailOrMobileErrorStatus).toBe('required')

  //   component.createAccountForm.get('emailOrMobile')!.setValue('invalid email')
  //   fixture.detectChanges()
  //   expect(component.emailOrMobileErrorStatus).toBe('pattern')
  // })


  // it('should call ssoWithMobileEmail on form submit', () => {
  //   signupServiceMock.ssoWithMobileEmail.mockReturnValue(of({ message: 'User successfully created', userId: '12345' }))
  //   component.createAccountForm.get('emailOrMobile')!.setValue('test@example.com')
  //   component.createAccountForm.get('firstname')!.setValue('John')
  //   component.createAccountForm.get('lastname')!.setValue('Doe')
  //   component.createAccountWithPasswordForm.get('password')!.setValue('Password123!')
  //   component.createAccountWithPasswordForm.get('confirmPassword')!.setValue('Password123!')
  //   component.onSubmit(component.createAccountWithPasswordForm, component.createAccountForm)
  //   expect(signupServiceMock.ssoWithMobileEmail).toHaveBeenCalled()
  // })

  // it('should handle form submission error', () => {
  //   signupServiceMock.ssoWithMobileEmail.mockReturnValue(throwError({ error: { msg: 'User already exists' } }))
  //   component.createAccountForm.get('emailOrMobile')!.setValue('test@example.com')
  //   component.createAccountForm.get('firstname')!.setValue('John')
  //   component.createAccountForm.get('lastname')!.setValue('Doe')
  //   component.createAccountWithPasswordForm.get('password')!.setValue('Password123!')
  //   component.createAccountWithPasswordForm.get('confirmPassword')!.setValue('Password123!')

  //   // Mark all form controls as touched to trigger validation
  //   component.createAccountForm.markAllAsTouched()
  //   component.createAccountWithPasswordForm.markAllAsTouched()

  //   fixture.detectChanges()

  //   component.onSubmit(component.createAccountWithPasswordForm, component.createAccountForm)

  //   expect(component.createAccount).toBeTruthy()
  //   expect(component.confirmPassword).toBeFalsy()
  // })

  it('should set phone-related properties on form submit with valid phone', () => {
    component.createAccountForm.get('emailOrMobile')!.setValue('9876543210')
    component.onSubmit(component.createAccountWithPasswordForm, component.createAccountForm)
    expect(component.isMobile).toBeTruthy()
    expect(component.emailPhoneType).toBe('phone')
    expect(component.email).toBeFalsy()
  })

  it('should set email-related properties on form submit with valid email', () => {
    component.createAccountForm.get('emailOrMobile')!.setValue('test@example.com')
    component.onSubmit(component.createAccountWithPasswordForm, component.createAccountForm)
    expect(component.email).toBeTruthy()
    expect(component.emailPhoneType).toBe('email')
  })

  // it('should trigger event on form submission', () => {
  //   const eventTriggerSpy = jest.spyOn(component, 'eventTrigger')
  //   component.createAccountForm.get('emailOrMobile')!.setValue('test@example.com')
  //   component.createAccountForm.get('firstname')!.setValue('John')
  //   component.createAccountForm.get('lastname')!.setValue('Doe')
  //   component.createAccountWithPasswordForm.get('password')!.setValue('Password123!')
  //   component.createAccountWithPasswordForm.get('confirmPassword')!.setValue('Password123!')

  //   // Mark all form controls as touched to trigger validation
  //   component.createAccountForm.markAllAsTouched()
  //   component.createAccountWithPasswordForm.markAllAsTouched()

  //   fixture.detectChanges()

  //   // Simulate the button click
  //   const button = fixture.debugElement.nativeElement.querySelector('#next-btn')
  //   button.click()

  //   expect(eventTriggerSpy).toHaveBeenCalled()
  // })

  it('should open snackbar with correct message', () => {
    const snackBarSpy = jest.spyOn(component.snackBar, 'open')
    component['openSnackbar']('Test message')
    expect(snackBarSpy).toHaveBeenCalledWith('Test message', undefined, { duration: 3000 })
  })
})
