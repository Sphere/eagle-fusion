import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material'
import { mustMatch } from '../password-validator'
import { SignupService } from '../signup/signup.service'
import { Router } from '@angular/router'

@Component({
  selector: 'ws-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss'],
})
export class CreateAccountComponent implements OnInit {
  hide1 = true
  hide2 = true
  uploadSaveData = false
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  @ViewChild('toastError', { static: true }) toastError!: ElementRef<any>
  emailOrMobile: any
  phone = false
  email: any
  showAllFields = true
  isMobile = false
  isOtpValid = false
  emailPhoneType: any
  otpPage = false
  errors: any
  spherFormBuilder: FormBuilder
  public createAccountForm: FormGroup
  public otpCodeForm: FormGroup

  constructor(
    spherFormBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private signupService: SignupService,
    private router: Router
  ) {
    this.spherFormBuilder = spherFormBuilder
  }

  initializeFormFields() {
    this.createAccountForm = this.spherFormBuilder.group({
      firstname: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z]*$/)]),
      lastname: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z]*$/)]),
      emailOrMobile: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/g)]),
      confirmPassword: new FormControl('', [Validators.required]),
    }, { validator: mustMatch('password', 'confirmPassword') })

    this.otpCodeForm = this.spherFormBuilder.group({
      otpCode: new FormControl('', [Validators.required]),
    })
  }

  showParentForm(event: any) {
    if (event === 'true') {
      this.initializeFormFields()
    }
  }

  ngOnInit() {
    this.initializeFormFields()
  }

  // generate otp
  generateOtp(type: string, phoneEmail: any) {
    // Call OTP valiate  Api, show resend Button true
    let request: any = []
    if (type === 'phone') {
      request = {
        mobileNumber: phoneEmail,
      }
    } else {
      request = {
        email: phoneEmail,
      }
    }
    //this.otpPage = true
    this.signupService.generateOtp(request).subscribe(
      (res: any) => {
        if (res.message === 'Success') {
          this.openSnackbar(res.msg)
          //this.openSnackbar(`${res.result.response}`)
          this.otpPage = true
        }
      },
      (err: any) => {
        this.openSnackbar("OTP Error," + err)
      })
  }

  onSubmit(form: any) {
    let phone = this.createAccountForm.controls.emailOrMobile.value
    let validphone = /^[6-9]\d{9}$/.test(phone)
    phone = phone.replace(/[^0-9+#]/g, '')
 
    if (!validphone) {
      this.openSnackbar('Enter valid Phone Number')
    }
    if (phone.length < 10) {
      this.openSnackbar('Enter 10 digits Phone Number')
    }
    // at least 10 in number
    if (phone.length >= 10) {
      this.isMobile = true
      this.emailPhoneType = 'phone'
      this.email = false
      // Call OTP Api, show resend Button true
    } else {
      this.email = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
        this.createAccountForm.controls.emailOrMobile.value
      )
      this.emailPhoneType = 'email'
    }
    this.uploadSaveData = true
    let reqObj

    if (this.email) {
      reqObj = {
        firstName: form.value.firstname,
        lastName: form.value.lastname,
        email: form.value.emailOrMobile,
        password: form.value.password,
      }
      this.generateOtp('email', form.value.emailOrMobile)
      this.signupService.signup(reqObj).subscribe(res => {
        if (res.status === 'success') {
          this.openSnackbar(res.msg)
          this.generateOtp('email', form.value.emailOrMobile)
          this.showAllFields = false
          this.uploadSaveData = false
          // form.reset()
        } else if (res.status === 'error') {
          this.openSnackbar(res.msg)
        }
      },
        err => {
          this.openSnackbar(err.msg)
          this.uploadSaveData = false
          // form.reset()
        }
      )
    } else {
      const requestBody = {
        firstName: form.value.firstname,
        lastName: form.value.lastname,
        phone: form.value.emailOrMobile,
        password: form.value.password,
      }
      this.signupService.registerWithMobile(requestBody).subscribe((res: any) => {
        console.log(res)
        if (res.status === 'success') {
          this.openSnackbar(res.msg)
          this.generateOtp('phone', form.value.emailOrMobile)
          this.showAllFields = false
          this.uploadSaveData = false
          // form.reset()
        } else if (res.status === 'error') {
          this.openSnackbar(res.msg)
        }
      },
        err => {




          this.errors = err
          this.openSnackbar(this.errors.msg || ('Registration',+err))
          this.uploadSaveData = false
        }
      )
    }
  }

  gotoHome() {
    this.router.navigate(['/page/home'])
      .then(() => {
        window.location.reload()
      })
  }
  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }
}
