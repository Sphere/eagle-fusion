import { Component, OnInit } from '@angular/core'
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms'
import { SignupService } from 'src/app/routes/signup/signup.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatDialog } from '@angular/material/dialog'
import { CreateAccountDialogComponent } from '../routes/create-account-modal/create-account-dialog.component'
import { ConfigurationsService, ValueService } from '../../../library/ws-widget/utils/src/public-api'

import { Observable } from 'rxjs'
import { ActivatedRoute, Router } from '@angular/router'

@Component({
  selector: 'ws-public-login',
  templateUrl: './public-login.component.html',
  styleUrls: ['./public-login.component.scss']
})
export class PublicLoginComponent implements OnInit {
  loginForm: UntypedFormGroup
  loginPwdForm: UntypedFormGroup
  OTPForm: UntypedFormGroup
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
  isEkshamtaLogin = false
  routerLink = 'public/home'
  constructor(
    private spherFormBuilder: UntypedFormBuilder,
    public signupService: SignupService,
    public snackBar: MatSnackBar,
    private readonly valueSvc: ValueService,
    public dialog: MatDialog,
    public configSvc: ConfigurationsService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.isXSmall$ = this.valueSvc.isXSmall$
    this.loginForm = this.spherFormBuilder.group({
      // firstName: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z '.-]*$/)]),
      // lastname: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z '.-]*$/)]),
      // tslint:disable-next-line:max-line-length
      emailOrMobile: new UntypedFormControl('', [Validators.required, Validators.pattern(/^((([6-9][0-9]{9}))|([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))$/)]),
      // password: new UntypedFormControl('', [Validators.required,
      // Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\ *])(?=.{8,})/g)]),
      // confirmPassword: new UntypedFormControl('', [Validators.required]),
    })
    this.loginPwdForm = this.spherFormBuilder.group({
      emailOrMobile: new UntypedFormControl('', [Validators.required, Validators.pattern(/^((([6-9][0-9]{9}))|([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))$/)]),
      password: new UntypedFormControl('', [Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\ *])(?=.{8,})/g)]),
      // confirmPassword: new UntypedFormControl('', [Validators.required]),
    })
    this.OTPForm = this.spherFormBuilder.group({
      OTPcode: new UntypedFormControl('', [Validators.required])
    })
    this.route.queryParams.subscribe(params => {
      if (params['ekshamtaLogin']) {
        this.isEkshamtaLogin = true
        //   this.routerLink = '/public/ekshamataHome'
        // } else {
        //   this.isEkshamtaLogin = false
        this.routerLink = '/public/home'
      } else {
        this.routerLink = '/public/home'
      }
    })
    this.initializeForm()
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
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.toggle2()
      event.preventDefault()
    }
  }
  handleKeyDowns(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.help()
      event.preventDefault()
    }
  }
  backSpaceEvent(event: KeyboardEvent, currentInput: any, previousInput: any) {
    if (event.key === 'Backspace' && !currentInput.value && previousInput) {
      previousInput.focus()
    }
    this.updateOtpCode()
  }
  initializeForm(): void {
    if (this.emailPhoneType === 'phone') {
      this.OTPForm = this.spherFormBuilder.group({
        otp1: new UntypedFormControl('', [Validators.required]),
        otp2: new UntypedFormControl('', [Validators.required]),
        otp3: new UntypedFormControl('', [Validators.required]),
        otp4: new UntypedFormControl('', [Validators.required]),
        OTPcode: new UntypedFormControl('', [Validators.required])
      })
    } else {
      console.log("email type")
      this.OTPForm = this.spherFormBuilder.group({
        OTPcode: ['', Validators.required]
      })
    }

  }
  updateOtpCode(): void {
    const otp1Control = this.OTPForm.get('otp1')
    const otp2Control = this.OTPForm.get('otp2')
    const otp3Control = this.OTPForm.get('otp3')
    const otp4Control = this.OTPForm.get('otp4')
    const code = this.OTPForm.get('OTPcode')
    console.log("yes here", otp4Control)
    if (otp1Control && otp2Control && otp3Control && otp4Control) {
      const otp1 = otp1Control.value
      const otp2 = otp2Control.value
      const otp3 = otp3Control.value
      const otp4 = otp4Control.value
      const code = otp1 + otp2 + otp3 + otp4
      if (this.OTPForm?.get('OTPcode')) {
        this.OTPForm.get('OTPcode')!.setValue(code)
      }
      console.error('1 One or more OTP controls are missing')

    } else {
      this.OTPForm.controls['OTPcode'].setValue(code)
      console.error('One or more OTP controls are missing')
    }
  }
  help() {
    let width = '345px'
    let height = '335px'
    this.isXSmall$.subscribe((data: any) => {
      console.log("data", data)
      if (data) {
        width = '345px'
        height = '335px'
      }
    })
    this.langDialog = this.dialog.open(CreateAccountDialogComponent, {
      panelClass: 'language-modal',
      width: width,
      height: height,
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
        selected: 'userNotExist',
        userNotExistEkshamta: this.isEkshamtaLogin
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
    location.href = this.configSvc?.unMappedUser?.id
      ? '/page/home'
      : '/public/home'
  }
  redirect(val: string) {
    console.log("val")
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
  handleKeyDown1(event: KeyboardEvent, type: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault() // Prevents scrolling when pressing space
      this.passwordOrOtp(type)
    }
  }


  submitDetails(form: any) {

    if (form.status === "VALID") {
      try {

        (window as any).fbq('track', 'SubmitApplication')
      }
      catch (e) {
        console.error("fb pixel error")
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
        localStorage.setItem('loginDetailsWithToken', JSON.stringify(res))
        console.log(res.status)
        this.openSnackbar(res.msg ?? res.message)
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
        this.openSnackbar(err.error.msg ?? err.error.error)
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
      this.OTPForm.reset({
        otp1: '',
        otp2: '',
        otp3: '',
        otp4: '',
        code: ''
      })
      console.log(req, type)
      this.signupService.resendOTP(req).subscribe(res => {
        console.log(res)
        this.openSnackbar(res.msg ?? res.message)
        // if (localStorage.getItem('url_before_login')) {
        //   const url = localStorage.getItem('url_before_login') || ''
        //   location.href = url
        // } else {
        //   window.location.href = '/page/home'
        // }
      }, err => {
        console.log(err)
        this.openSnackbar(err.error.msg ?? err.error.message)
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
        localStorage.setItem('loginDetailsWithToken', JSON.stringify(res))
        console.log(res)
        this.openSnackbar(res.msg ?? res.message)
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
      this.initializeForm()

      console.log(req, 'res', type)
      this.signupService.sendOTP(req).subscribe(res => {
        console.log(res)
        this.userID = res.userId
        this.openSnackbar(res.msg ?? res.message)
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
        this.openSnackbar(err.error.msg ?? err.error.message)
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
    console.log("fasdfasdf", text)
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
