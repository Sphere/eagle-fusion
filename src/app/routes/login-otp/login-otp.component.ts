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

  async verifyOtp() {
    let request: any = []
    let phone = this.signUpdata.value.emailOrMobile
    phone = phone.replace(/[^0-9+#]/g, '')
    // at least 10 in number
    if (phone.length >= 10) {
      request = {
        mobileNumber: this.signUpdata.value.emailOrMobile,
        password: this.signUpdata.value.password,
        otp: this.loginOtpForm.value.code,
        userUUID: localStorage.getItem(`userUUID`),
      }

    } else if (/^[a-zA-Z0-9.!#$%&'+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)$/.test(
      this.signUpdata.value.emailOrMobile)) {
      request = {
        email: this.signUpdata.value.emailOrMobile,
        password: this.signUpdata.value.password,
        otp: this.loginOtpForm.value.code,
        userUUID: localStorage.getItem(`userUUID`),
      }
    }
    this.signupService.validateOtp(request).subscribe(
      async (res: any) => {
        if (res.message) {
          await this.signupService.fetchStartUpDetails()
          this.openSnackbar(res.message)
          this.router.navigate(['/page/home'])

        }
      },
      (err: any) => {
        this.openSnackbar(err.error.error || err.error.msg)
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
    this.signupService.generateOtp(requestBody).subscribe(
      (res: any) => {
        this.openSnackbar(res.message)
      },
      (err: any) => {
        this.openSnackbar(`OTP Error`, + err.msg)
      }
    )
  }

  private openSnackbar(primaryMsg: string, duration: number = 3000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }

}
