import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms'
import { SignupService } from 'src/app/routes/signup/signup.service'
import { MatSnackBar } from '@angular/material'
@Component({
  selector: 'ws-public-login',
  templateUrl: './public-login.component.html',
  styleUrls: ['./public-login.component.scss']
})
export class PublicLoginComponent implements OnInit {
  loginForm: FormGroup
  loginPwdForm: FormGroup
  OTPForm: FormGroup
  selectedField = 'otp'
  otpPage = false
  userID = ''
  constructor(
    private spherFormBuilder: FormBuilder,
    private signupService: SignupService,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.spherFormBuilder.group({
      // firstName: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z '.-]*$/)]),
      // lastname: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z '.-]*$/)]),
      // tslint:disable-next-line:max-line-length
      emailOrMobile: new FormControl('', [Validators.required, Validators.pattern(/^((([6-9][0-9]{9}))|([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))$/)]),
      // password: new FormControl('', [Validators.required,
      // Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\ *])(?=.{8,})/g)]),
      // confirmPassword: new FormControl('', [Validators.required]),
    })
    this.loginPwdForm = this.spherFormBuilder.group({
      emailOrMobile: new FormControl('', [Validators.required, Validators.pattern(/^((([6-9][0-9]{9}))|([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))$/)]),
      password: new FormControl('', [Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\ *])(?=.{8,})/g)]),
      // confirmPassword: new FormControl('', [Validators.required]),
    })
    this.OTPForm = this.spherFormBuilder.group({
      OTPcode: new FormControl('', [Validators.required, Validators.pattern(/^\s*(\d{6}\s*,\s*)*\d{6}\s*$/)]),
    })
  }

  ngOnInit() {
  }
  submitDetails(form: any) {
    console.log(form)
    if (form.status === "VALID") {
      let phone = this.loginPwdForm.controls.emailOrMobile.value
      let type = ''
      // const validphone = /^[6-9]\d{9}$/.test(phone)
      phone = phone.replace(/[^0-9+#]/g, '')
      if (phone.length >= 10) {
        // this.otpPage = true
        type = 'phone'
      } else {
        // this.otpPage = true
        let check = /^[a-zA-Z0-9 .!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9- ]+)*$/.test(
          this.loginForm.controls.emailOrMobile.value
        )
        type = 'email'
        console.log(check, 'check')
      }
      let req = {}
      if (type === 'email') {
        req = {
          "userEmail": this.loginPwdForm.controls.emailOrMobile.value,
          "typeOfLogin": "password",
          "userPassword": this.loginPwdForm.controls.password.value
        }
      }
      if (type === 'phone') {
        req = {
          "userPhone": this.loginPwdForm.controls.emailOrMobile.value,
          "typeOfLogin": "password",
          "userPassword": this.loginPwdForm.controls.password.value
        }
      }
      this.signupService.loginAPI(req).subscribe(res => {
        console.log(res)
        this.openSnackbar(res.msg || res.message)
        if (localStorage.getItem('url_before_login')) {
          const url = localStorage.getItem('url_before_login') || ''
          location.href = url
        } else {
          window.location.href = '/page/home'
        }
      }, err => {
        console.log(err)
        this.openSnackbar(err.error.msg || err.error.error)
      })
    }
  }
  resendOTP() {
    if ((this.loginForm.status === 'VALID')) {
      let phone = this.loginForm.controls.emailOrMobile.value
      let type = ''
      phone = phone.replace(/[^0-9+#]/g, '')
      if (phone.length >= 10) {
        type = 'phone'
      } else {
        let check = /^[a-zA-Z0-9 .!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9- ]+)*$/.test(
          this.loginForm.controls.emailOrMobile.value
        )
        type = 'email'
        console.log(check, 'check')
      }
      let req = {}
      if (type === 'email') {
        req = {
          "userEmail": this.loginForm.controls.emailOrMobile.value,
          "userId": this.userID
        }
      }
      if (type === 'phone') {
        req = {
          "userPhone": this.loginForm.controls.emailOrMobile.value,
          "userId": this.userID
        }
      }
      console.log(req, type)
      this.signupService.resendOTP(req).subscribe(res => {
        console.log(res)
        this.openSnackbar(res.msg || res.message)
        // if (localStorage.getItem('url_before_login')) {
        //   const url = localStorage.getItem('url_before_login') || ''
        //   location.href = url
        // } else {
        //   window.location.href = '/page/home'
        // }
      }, err => {
        console.log(err)
        this.openSnackbar(err.error.msg || err.error.message)
      })
    }
  }
  otpSubmit() {
    console.log('otp', this.loginForm.controls.emailOrMobile.value, this.OTPForm.controls.OTPcode.value)
    if ((this.loginForm.status === 'VALID') && this.OTPForm.status === 'VALID') {
      let phone = this.loginForm.controls.emailOrMobile.value
      let type = ''
      phone = phone.replace(/[^0-9+#]/g, '')
      if (phone.length >= 10) {
        type = 'phone'
      } else {
        let check = /^[a-zA-Z0-9 .!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9- ]+)*$/.test(
          this.loginForm.controls.emailOrMobile.value
        )
        type = 'email'
        console.log(check, 'check')
      }
      let req = {}
      if (type === 'email') {
        req = {
          "userEmail": this.loginForm.controls.emailOrMobile.value,
          "typeOfLogin": "otp",
          "otp": this.OTPForm.controls.OTPcode.value.trim()
        }
      }
      if (type === 'phone') {
        req = {
          "userPhone": this.loginForm.controls.emailOrMobile.value,
          "typeOfLogin": "otp",
          "otp": this.OTPForm.controls.OTPcode.value.trim()
        }
      }
      console.log(req, type)
      this.signupService.loginAPI(req).subscribe(res => {
        console.log(res)
        this.openSnackbar(res.msg || res.message)
        if (localStorage.getItem('url_before_login')) {
          const url = localStorage.getItem('url_before_login') || ''
          location.href = url
        } else {
          window.location.href = '/page/home'
        }
      }, err => {
        console.log(err.error)
        this.openSnackbar(err.error.msg || err.error.message)
      })
    }
  }
  otpClick(form: any) {
    console.log(form)
    if (form.status === "VALID") {
      let phone = this.loginForm.controls.emailOrMobile.value
      let type = ''
      // const validphone = /^[6-9]\d{9}$/.test(phone)
      phone = phone.replace(/[^0-9+#]/g, '')
      if (phone.length >= 10) {
        // this.otpPage = true
        type = 'phone'
      } else {
        // this.otpPage = true
        let check = /^[a-zA-Z0-9 .!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9- ]+)*$/.test(
          this.loginForm.controls.emailOrMobile.value
        )
        type = 'email'
        console.log(check, 'check')
      }
      let req = {}
      if (type === 'email') {
        req = {
          "userEmail": this.loginForm.controls.emailOrMobile.value,
          "userPhone": ""
        }
      }
      if (type === 'phone') {
        req = {
          "userEmail": '',
          "userPhone": this.loginForm.controls.emailOrMobile.value
        }
      }
      this.signupService.sendOTP(req).subscribe(res => {
        console.log(res)
        this.userID = res.userId
        this.openSnackbar(res.msg || res.message)
        this.otpPage = true
        // if (localStorage.getItem('url_before_login')) {
        //   const url = localStorage.getItem('url_before_login') || ''
        //   location.href = url
        // } else {
        //   window.location.href = '/page/home'
        // }
      }, err => {
        console.log(err)
        this.openSnackbar(err.error.msg || err.error.message)
      })
    }
  }
  private openSnackbar(primaryMsg: string, duration: number = 3000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }
  passwordOrOtp(text: any) {
    console.log('p', text)
    this.selectedField = text
  }
  checkMobileEmail(val: any) {
    console.log(val)
    this.loginForm.controls.emailOrMobile.setValidators([Validators.required, Validators.pattern(/^((([6-9][0-9]{9}))|([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))$/)])
  }
  checkMobileEmail2(val: any) {
    console.log(val)
    this.loginPwdForm.controls.emailOrMobile.setValidators([Validators.required, Validators.pattern(/^((([6-9][0-9]{9}))|([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))$/)])
  }
  checkPassword(val: any) {
    console.log(val)
    this.loginPwdForm.controls.password.setValidators([Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\ *])(?=.{8,})/g)])
  }

}
