import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material'
import { Router } from '@angular/router'
import { SignupService } from '../signup/signup.service'

@Component({
  selector: 'ws-login-otp',
  templateUrl: './login-otp.component.html',
  styleUrls: ['./login-otp.component.scss'],
})
export class LoginOtpComponent implements OnInit {
  loginOtpForm: FormGroup
  @Input() signUpdata: any
  @Output() redirectToParent = new EventEmitter()
  emailPhoneType: any = 'phone'

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private signupService: SignupService,
    private router: Router
  ) {
    this.loginOtpForm = this.fb.group({
      code: new FormControl('', [Validators.required]),
    })
  }

  ngOnInit() {
    if (this.signUpdata) {
      let phone = this.signUpdata.value.emailOrMobile
      phone = phone.replace(/[^0-9+#]/g, '')
      if (phone.length >= 10) {
        this.emailPhoneType = 'phone'
      } else {
        this.emailPhoneType = 'email'
      }
    }
    if (window.location.href.includes('email-otp')) {
      this.emailPhoneType = 'email'
    }
  }

  redirectToSignUp() {
    this.redirectToParent.emit('true')
  }

  verifyOtp() {
    let request: any = []
    let phone = this.signUpdata.value.emailOrMobile
    phone = phone.replace(/[^0-9+#]/g, '')
    // at least 10 in number
    if (phone.length >= 10) {
      request = {
        mobileNumber: this.signUpdata.value.emailOrMobile,
        password: this.signUpdata.value.password,
        otp: this.loginOtpForm.value.code,
      }

    } else if (/^[a-zA-Z0-9.!#$%&'+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)$/.test(
      this.signUpdata.value.emailOrMobile)) {
      request = {
        email: this.signUpdata.value.emailOrMobile,
        password: this.signUpdata.value.password,
        otp: this.loginOtpForm.value.code,
      }
    }
    this.signupService.validateOtp(request).subscribe(
      (res: any) => {
        if (res.message === 'Success ! OTP is verified .') {
          this.openSnackbar(res.message)
          this.router.navigate(['app/new-tnc'])
        }
      },
      (err: any) => {
        this.openSnackbar(err)

      })
  }

  resendOTP(emailPhoneType: string) {
    let requestBody
    if (emailPhoneType === 'email') {
      requestBody = {
        email: this.signUpdata.value.emailOrMobile,
      }
    } else {
      requestBody = {
        mobileNumber: this.signUpdata.value.emailOrMobile,
      }
    }
    // call resend OTP function
<<<<<<< HEAD
    this.signupService.generateOtp(requestBody).subscribe(
=======
    let request: any = []
    const phone = this.signUpdata.value.emailOrMobile
    if (phone.length >= 10) {

      request = {
        firstName: this.signUpdata.value.firstname,
        lastName: this.signUpdata.value.lastname,
        phone: this.signUpdata.value.emailOrMobile,
        password: this.signUpdata.value.password,
      }

    } else if (/^[a-zA-Z0-9.!#$%&'+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)$/.test(
      this.signUpdata.value.emailOrMobile)) {
      request = {
        firstName: this.signUpdata.value.firstname,
        lastName: this.signUpdata.value.lastname,
        email: this.signUpdata.value.emailOrMobile,
        password: this.signUpdata.value.password,
      }
    }

    this.signupService.registerWithMobile(request).subscribe(
>>>>>>> 34dba0ff9a58b0ac4d7a9278e3dc52bd08d1b6ac
      (res: any) => {
        this.openSnackbar(res.msg)
      },
      (err: any) => {
        this.openSnackbar(`OTP Error`, + err.msg)
      }
    )
  }

  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }

}
