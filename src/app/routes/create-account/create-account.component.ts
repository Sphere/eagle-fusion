import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material'
import { Router } from '@angular/router'
import { mustMatch } from '../password-validator'
import { SignupService } from '../signup/signup.service'

@Component({
  selector: 'ws-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss'],
})
export class CreateAccountComponent implements OnInit {
  createAccountForm: FormGroup
  otpCodeForm: FormGroup
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

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private signupService: SignupService,
    private router: Router) {
    this.createAccountForm = this.fb.group({
      username: new FormControl('', Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z]+ [a-zA-Z]+$/g)])),
      emailOrMobile: new FormControl('', [Validators.required]),
      password: new FormControl('', Validators.compose([Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/g)])),
      confirmPassword: new FormControl('', [Validators.required]),
    },                                     { validator: mustMatch('password', 'confirmPassword') })

    this.otpCodeForm = this.fb.group({
      otpCode: new FormControl('', [Validators.required]),
    })
  }

  ngOnInit() {
  }

  // generate otp
  generateOtp(type: string, phoneEmail: any) {
    // Call OTP valiate  Api, show resend Button true
    if (type === 'phone') {
      const request = {
        mobileNumber: phoneEmail,
      }
      this.signupService.generateOtp(request).subscribe(
        (res: any) => {
          if (res.message === 'Success') {
            this.otpPage = true
          }
        },
        (err: any) => {
          this.openSnackbar(err)
        }
      )
    } else {
      const request = {
        email: phoneEmail,
      }
      this.signupService.generateOtp(request).subscribe(
        (res: any) => {
          if (res.message === 'Success') {
            this.otpPage = true
          }
        },
        (err: any) => {
          this.openSnackbar(err)
        }
      )
    }
  }

  verifyOtp() {
    let phone = this.createAccountForm.controls.emailOrMobile.value

    phone = phone.replace(/[^0-9+#]/g, '')
    // at least 10 in number
    if (phone.length >= 10) {
      this.isMobile = false
      // Call OTP Api, show resend Button true
      const request = {
        mobileNumber: phone,
        otp: this.otpCodeForm.controls.otpCode.value,
      }

      this.signupService.validateOtp(request).subscribe(
        (res: any) => {
          if (res.message === 'Success') {
            this.router.navigate(['/page/home'])
          }
        },
        (err: any) => {
          this.openSnackbar(err)

        }
      )
    }
  }

  resendOTP() {
    // call resend OTP function
    this.signupService.registerWithMobile(this.emailOrMobile).subscribe(
      (res: any) => {
        this.openSnackbar(res.message)
      },
      (err: any) => {
        this.openSnackbar(err)
      }
    )
  }

  onSubmit(form: any) {
    const name = this.createAccountForm.controls.username.value.split(' ')
    let phone = this.createAccountForm.controls.emailOrMobile.value

    phone = phone.replace(/[^0-9+#]/g, '')
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
        firstName: name[0],
        lastName: name[1],
        email: form.value.emailOrMobile,
        password: form.value.password,
      }
      this.signupService.signup(reqObj).subscribe(res => {
        if (res.status === 'success') {
          this.generateOtp('email', form.value.emailOrMobile)
          this.showAllFields = false
          this.uploadSaveData = false
          form.reset()
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
        firstName: name[0],
        lastName: name[1],
        phone: form.value.emailOrMobile,
        password: form.value.password,
      }
      this.signupService.registerWithMobile(requestBody).subscribe((res: any) => {
        if (res.status === 'success') {
          this.generateOtp('phone', form.value.emailOrMobile)
          this.showAllFields = false
          this.uploadSaveData = false
          form.reset()
        } else if (res.status === 'error') {
          this.openSnackbar(res.msg)
        }
      },
                                                                   err => {
          this.errors = err
          this.openSnackbar(this.errors.msg)
          this.uploadSaveData = false
        }
      )

    }

  }

  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }

}
