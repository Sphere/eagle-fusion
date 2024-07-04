import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms'
import { SignupService } from 'src/app/routes/signup/signup.service'
import { MatDialog, MatSnackBar } from '@angular/material'
import { CreateAccountDialogComponent } from '../routes/create-account-modal/create-account-dialog.component'
import {
  ConfigurationsService,
  ValueService
} from '@ws-widget/utils'
import { Observable } from 'rxjs'
import { Router } from '@angular/router'
@Component({
  selector: 'ws-public-login',
  templateUrl: './public-login.component.html',
  styleUrls: ['./public-login.component.scss']
})
export class PublicLoginComponent implements OnInit {
  loginForm: FormGroup
  loginOtpForm!: FormGroup
  loginPwdForm: FormGroup
  OTPForm: FormGroup
  selectedField = 'otp'
  otpPage = false
  userID = ''
  langDialog: any
  isXSmall$: Observable<boolean>
  hide2 = true
  resendTimer: number = 600; // Initialize with 600 seconds (10 minutes)
  resendTimerText: string = '10:00'; // Initialize the display text
  interval: any
  otpInputs: string[] = ['', '', '', '']
  iconChange2 = 'fas fa-eye-slash'
  emailPhoneType: any = 'phone'

  constructor(
    private spherFormBuilder: FormBuilder,
    public signupService: SignupService,
    public snackBar: MatSnackBar,
    private valueSvc: ValueService,
    public dialog: MatDialog,
    public configSvc: ConfigurationsService,
    private router: Router,
  ) {
    this.isXSmall$ = this.valueSvc.isXSmall$
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
    //localStorage.clear()
    this.initializeForm()
  }
  moveFocus(currentInput: any, nextInput: any) {
    if (currentInput.value && currentInput.value.length === 1 && nextInput) {
      nextInput.focus()
    }
    this.updateOtpCode()
  }

  backSpaceEvent(event: KeyboardEvent, currentInput: any, previousInput: any) {
    if (event.key === 'Backspace' && !currentInput.value && previousInput) {
      previousInput.focus()
    }
    this.updateOtpCode()
  }
  initializeForm(): void {
    if (this.emailPhoneType === 'email') {
      this.loginOtpForm = this.spherFormBuilder.group({
        otp1: ['', Validators.required],
        otp2: ['', Validators.required],
        otp3: ['', Validators.required],
        otp4: ['', Validators.required],
        otp5: ['', Validators.required],
        otp6: ['', Validators.required],
      })
    } else {
      this.loginOtpForm = this.spherFormBuilder.group({
        otp1: ['', Validators.required],
        otp2: ['', Validators.required],
        otp3: ['', Validators.required],
        otp4: ['', Validators.required]
      })
    }

  }
  updateOtpCode(): void {
    const otp1Control = this.loginOtpForm.get('otp1')
    const otp2Control = this.loginOtpForm.get('otp2')
    const otp3Control = this.loginOtpForm.get('otp3')
    const otp4Control = this.loginOtpForm.get('otp4')
    const otp5Control = this.emailPhoneType !== 'phone' ? this.loginOtpForm.get('otp5') : null
    const otp6Control = this.emailPhoneType !== 'phone' ? this.loginOtpForm.get('otp6') : null
    console.log("yes here", otp4Control, otp5Control)
    if (otp1Control && otp2Control && otp3Control && otp4Control && (this.emailPhoneType === 'phone' || otp5Control || otp6Control)) {
      const otp1 = otp1Control.value
      const otp2 = otp2Control.value
      const otp3 = otp3Control.value
      const otp4 = otp4Control.value
      const otp5 = otp5Control ? otp5Control.value : ''
      const otp6 = otp6Control ? otp6Control.value : ''
      const code = otp1 + otp2 + otp3 + otp4 + otp5 + otp6
      this.OTPForm.controls['OTPcode'].setValue(code)
    } else {
      console.error('One or more OTP controls are missing')
    }
  }
  help() {
    this.langDialog = this.dialog.open(CreateAccountDialogComponent, {
      panelClass: 'language-modal',
      width: '345px',
      height: '335px',
      data: {
        selected: "help",
      },
    })
  }
  userDoesnotExist() {
    this.langDialog = this.dialog.open(CreateAccountDialogComponent, {
      panelClass: 'language-modal',
      width: '312px',
      height: '186px',
      data: {
        selected: "userNotExist",
      },
    })

    this.langDialog.afterClosed().subscribe((data: any) => {
      console.log("data: ", data)

      if (data === 'createAccount') {
        if (localStorage.getItem('login_url')) {
          const url: any = localStorage.getItem('login_url')
          window.location.href = url
        }
        if (localStorage.getItem('url_before_login') && this.router.url === '/public/home') {
          localStorage.removeItem('url_before_login')
        }
        this.router.navigateByUrl('/app/create-account')
      }
    })
  }
  homePage() {
    location.href = (this.configSvc!.unMappedUser! && this.configSvc!.unMappedUser!.id) ? '/page/home' : '/public/home'
  }
  redirect(val: string) {
    if (val === 'createAccount') {
      window.location.href = '/public/home'
    } else {
      this.otpPage = false
    }
  }
  toggle2() {
    this.hide2 = !this.hide2
    if (this.hide2) {
      this.iconChange2 = 'fas fa-eye-slash'
    } else {
      this.iconChange2 = 'fas fa-eye'
    }
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
            let lang = (result && result.language !== undefined) ? result.language : 'en'
            lang = lang === 'en' ? '' : 'hi'
            console.log(res, 'res')
            localStorage.setItem('lang131', JSON.stringify(res))

            if (localStorage.getItem('url_before_login')) {
              let url = localStorage.getItem('url_before_login') || ''
              url = lang === 'hi' ? `${lang}/${url}` : `${lang}${url}`
              location.href = url
            } else {
              let url = '/page/home'
              url = lang === 'hi' ? `${lang}/${url}` : `${lang}${url}`
              window.location.href = url
            }
          })
        }, 500)

      }, err => {
        console.log(err)
        if (err.error.message === "User doesn't exists please signup and try again" || err.error.msg === "User doesn't exists please signup and try again") {
          this.userDoesnotExist()
        }
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
      this.startTimer()
      this.loginOtpForm.reset({
        otp1: '',
        otp2: '',
        otp3: '',
        otp4: '',
        otp5: '',
        otp6: '',
        code: ''
      })
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
            let lang = (result && result.language !== undefined) ? result.language : 'en'
            lang = lang === 'en' ? '' : 'hi'
            localStorage.setItem('res123', JSON.stringify(res))
            if (res && res.status) {
              if (res.language) {
                let lang = res.language
                let obj = {
                  lang: lang,
                  res: res.language,
                  line: 56
                }
                localStorage.setItem('lang123', JSON.stringify(obj))
              }

              localStorage.setItem('res', JSON.stringify(res))
              if (localStorage.getItem('url_before_login')) {
                let url = localStorage.getItem('url_before_login') || ''
                url = lang === 'hi' ? `${lang}/${url}` : `${lang}${url}`
                location.href = url
              } else {
                let url = '/page/home'
                url = lang === 'hi' ? `${lang}/${url}` : `${lang}${url}`
                window.location.href = url
              }
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
        this.emailPhoneType = 'phone'
      } else {
        // this.otpPage = true
        let check = /^[a-zA-Z0-9 .!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9- ]+)*$/.test(
          this.loginForm.controls.emailOrMobile.value
        )
        type = 'email'
        this.emailPhoneType = 'email'
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
      if (window.location.href.includes('email-otp')) {
        this.emailPhoneType = 'email'
      }
      console.log(req, 'res', type)
      this.signupService.sendOTP(req).subscribe(res => {
        console.log(res)
        this.userID = res.userId
        this.openSnackbar(res.msg || res.message)
        this.startTimer()
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
        if (err.error.message === "User doesn't exists please signup and try again" || err.error.msg === "User doesn't exists please signup and try again") {
          this.userDoesnotExist()
        }
        this.openSnackbar(err.error.msg || err.error.message)
      })
    }
  }
  startTimer() {
    if (this.interval) {
      clearInterval(this.interval)
    }

    this.resendTimer = 600 // Reset the timer value to 10 minutes
    this.resendTimerText = '10:00' // Reset the display text to 10:00

    this.interval = setInterval(() => {
      this.resendTimer--
      if (this.resendTimer === 0) {
        clearInterval(this.interval)
        this.interval = null
      }
      const minutes: string = Math.floor(this.resendTimer / 60).toString().padStart(2, '0')
      const seconds: string = (this.resendTimer % 60).toString().padStart(2, '0')
      this.resendTimerText = `${minutes}:${seconds}`
    }, 1000)
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
