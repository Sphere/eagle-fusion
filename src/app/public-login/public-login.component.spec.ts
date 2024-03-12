import { ComponentFixture, TestBed } from '@angular/core/testing'
import { PublicLoginComponent } from './public-login.component'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { MatSnackBar, MatSnackBarModule } from '@angular/material'
import { SignupService } from 'src/app/routes/signup/signup.service'
import { MatInputModule } from '@angular/material/input'
import { RouterModule } from '@angular/router'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterTestingModule } from '@angular/router/testing'

const mockSignupService: Partial<SignupService> = {}
const mockFormBuilder: Partial<FormBuilder> = {
  group: jest.fn()
}
const mockMatSnackBar: Partial<MatSnackBar> = {
  open: jest.fn()
}

describe('PublicLoginComponent', () => {
  let component: PublicLoginComponent
  let fixture: ComponentFixture<PublicLoginComponent>
  beforeAll(() => {
    component = new PublicLoginComponent(
      mockFormBuilder as FormBuilder,
      mockSignupService as SignupService,
      mockMatSnackBar as MatSnackBar

    )
  })
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PublicLoginComponent],
      imports: [RouterModule, MatInputModule, MatSnackBarModule, BrowserAnimationsModule, ReactiveFormsModule, RouterTestingModule],
      providers: [
        FormBuilder,
        { provide: SignupService, useValue: mockSignupService },
        { provide: MatSnackBar, useValue: jest.fn() }
      ],
    })
      .compileComponents()
  })
  beforeEach(() => {
    fixture = TestBed.createComponent(PublicLoginComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })



  it('should create the component', () => {
    expect(component).toBeTruthy()
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


  it('should call signupService.loginAPI on valid form submission', () => {
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


})