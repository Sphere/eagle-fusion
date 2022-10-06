
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
  [x: string]: any
  loginOtpForm: FormGroup
  @Input() signUpdata: any
  @Input() loginData: any
  @Output() redirectToParent = new EventEmitter()
  emailPhoneType: any = 'phone'
  loginVerification = false

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
    if (this.signUpdata || this.loginData) {
      let phone = this.signUpdata ? this.signUpdata.value.emailOrMobile : this.loginData.value.username
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
    if (this.loginData) {
      this.loginVerification = true
    }

  }

  redirectToSignUp() {
    this.redirectToParent.emit('true')
  }

  redirectToMobileLogin() {
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
        //   await this.signupService.fetchStartUpDetails()
        if (localStorage.getItem(`preferedLanguage`)) {
          let reqObj = localStorage.getItem(`preferedLanguage`) || ''
          let lang = JSON.parse(reqObj) || ''
          if (lang.id === 'hi') {
            if (res.message === "Otp is successfully validated.") {
              let msg = "ओटीपी सफलतापूर्वक सत्यापित हो गया है।"
              this.openSnackbar(msg)
            }
          } else {
            this.openSnackbar(res.message)
          }
        } else {
          this.openSnackbar(res.message)
        }
        //localStorage.removeItem('preferedLanguage')
        this.router.navigate(['app/login'], { queryParams: { source: 'register' } })
      },
      (err: any) => {
        if (localStorage.getItem(`preferedLanguage`)) {
          let reqObj = localStorage.getItem(`preferedLanguage`) || ''
          let lang = JSON.parse(reqObj) || ''
          if (lang.id === 'hi') {
            if (err.error.message === "Please provide correct otp and try again.") {
              let err = "कृपया सही ओटीपी प्रदान करें और पुनः प्रयास करें।"
              this.openSnackbar(err)
            }
          } else {
            this.openSnackbar(err.error.error || err.error.message)
          }
        } else {
          this.openSnackbar(err.error.error || err.error.message)
        }
      })
  }

  async loginVerifyOtp() {
    let request: any = []
    const username = this.loginData.value.username
    if (!username.includes('@')) {
      request = {
        mobileNumber: this.loginData.value.username,
        password: this.loginData.value.password,
        otp: this.loginOtpForm.value.code,
        userUUID: localStorage.getItem(`userUUID`),
      }

    } else {
      request = {
        email: this.loginData.value.username,
        password: this.loginData.value.password,
        otp: this.loginOtpForm.value.code,
        userUUID: localStorage.getItem(`userUUID`),
      }
    }
    this.signupService.validateOtp(request).subscribe(
      async (res: any) => {
        this.openSnackbar(res.message)
        //localStorage.removeItem('preferedLanguage')
        location.href = '/page/home'
        return res
      },
      (err: any) => {
        this.openSnackbar(err.error.error || err.error.message)
      })

  }

  resendOTP(emailPhoneType: string) {
    let requestBody
    if (emailPhoneType === 'email') {
      requestBody = {
        email: this.signUpdata ? this.signUpdata.value.emailOrMobile : this.loginData.value.username,
      }
    } else {
      requestBody = {
        mobileNumber: this.signUpdata ? this.signUpdata.value.emailOrMobile : this.loginData.value.username,
      }
    }
    this.signupService.generateOtp(requestBody).subscribe(
      (res: any) => {
        this.openSnackbar(res.message)
        //localStorage.removeItem('preferedLanguage')
      },
      (err: any) => {
        this.openSnackbar(`OTP Error`, + err.error.message)
      }
    )
  }

  private openSnackbar(primaryMsg: string, duration: number = 3000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }

}
