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
    public signupService: SignupService,
    public snackBar: MatSnackBar,
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
      OTPcode: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{4,6}$/)])
    })
  }

  ngOnInit() {

    sessionStorage.clear()
    localStorage.removeItem('preferedLanguage')
    localStorage.removeItem('loginbtn')
    localStorage.removeItem('userUUID')
    localStorage.clear()
  }
  submitDetails(form: any) {

    if (form.status === "VALID") {
      try {

        (window as any).fbq('track', 'SubmitApplication')
      }
      catch (e) {
        console.log("fb pixel error")
      }
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
        console.log(check)
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
      console.log(type, 'check')
      this.signupService.loginAPI(req).subscribe(res => {
        console.log(res.status)
        this.openSnackbar(res.msg || res.message)
        setTimeout(() => {
          this.signupService.fetchStartUpDetails().then(async (result: any) => {
            let res = await result
            console.log(res, 'res')
            localStorage.setItem('lang131', JSON.stringify(res))
          })
        }, 500)
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
    } else {
      console.log('alert')
    }
  }
  resendOTP(form?: any) {

    console.log(form)
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
        setTimeout(() => {
          this.signupService.fetchStartUpDetails().then(async (result: any) => {
            let res = await result
            console.log(res, 'res')
            if (res && res.status === 200) {
              if (res.language) {
                let lang = res.language
                let obj = {
                  lang: lang,
                  res: res.language,
                  line: 56
                }
                localStorage.setItem('lang123', JSON.stringify(obj))
              }
            }
            if (localStorage.getItem('url_before_login')) {
              const url = localStorage.getItem('url_before_login') || ''
              location.href = url
            } else {
              window.location.href = '/page/home'
            }
          })
        }, 500)
      }, err => {
        console.log(err.error)
        this.openSnackbar(err.error.msg || err.error.message)
      })
    }
  }
  otpClick(form: any) {
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
      console.log(req, 'res', type)
      this.signupService.sendOTP(req).subscribe(res => {
        console.log(res)
        this.userID = res.userId
        this.openSnackbar(res.msg || res.message)
        this.otpPage = true
        console.log(this.otpPage)
        // if (localStorage.getItem('url_before_login')) {
        //   const url = localStorage.getItem('url_before_login') || ''
        //   location.href = url
        // } else {
        //   window.location.href = '/page/home'
        // }
      }, err => {
        console.log(err.error.msg, err.error.message)
        this.openSnackbar(err.error.msg || err.error.message)
      })
    }
  }
  openSnackbar(primaryMsg: string, duration: number = 3000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }
  passwordOrOtp(text: any) {
    this.selectedField = text
  }
  checkMobileEmail() {
    this.loginForm.controls.emailOrMobile.setValidators([Validators.required, Validators.pattern(/^((([6-9][0-9]{9}))|([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))$/)])
  }
  checkMobileEmail2() {
    this.loginPwdForm.controls.emailOrMobile.setValidators([Validators.required, Validators.pattern(/^((([6-9][0-9]{9}))|([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))$/)])
  }
  checkPassword() {

    this.loginPwdForm.controls.password.setValidators([Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\ *])(?=.{8,})/g)])
  }

}
