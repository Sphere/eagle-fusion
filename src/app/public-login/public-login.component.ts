import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms'
import { v4 as uuid } from 'uuid'
import { SignupService } from 'src/app/routes/signup/signup.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatDialog } from '@angular/material/dialog'
import { CreateAccountDialogComponent } from '../routes/create-account-modal/create-account-dialog.component'
import { ConfigurationsService, LoggerService, TelemetryService, ValueService } from '../../../library/ws-widget/utils/src/public-api'

import { Observable } from 'rxjs'
import { ActivatedRoute, Router } from '@angular/router'
import { Meta, Title } from '@angular/platform-browser'
import { TranslateService } from '@ngx-translate/core'

@Component({
  standalone: false,
  selector: 'ws-public-login',
  templateUrl: './public-login.component.html',
  styleUrls: ['./public-login.component.scss'],

})
export class PublicLoginComponent implements OnInit {
  loginForm: FormGroup
  loginPwdForm: FormGroup
  OTPForm: FormGroup
  selectedField = 'otp'
  otpPage = false
  userID = ''
  langDialog: any
  isXSmall$: Observable<boolean>
  hide2 = true
  resendTimer = 600 // Initialize with 600 seconds (10 minutes)
  resendTimerText = '10:00' // Initialize the display text
  interval: any
  otpInputs: string[] = ['', '', '', '']
  iconChange2 = 'fas fa-eye-slash'
  emailPhoneType: any = 'phone'
  isEkshamtaLogin = false
  routerLink = 'public/home'
  isOrgSelectiveCourse = false
  isLoginLoading = false
  telemetrySessionId = ''
  constructor(
    private spherFormBuilder: FormBuilder,
    public signupService: SignupService,
    public snackBar: MatSnackBar,
    private readonly valueSvc: ValueService,
    public dialog: MatDialog,
    public configSvc: ConfigurationsService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private meta: Meta,
    private title: Title,
    private telemetrySvc: TelemetryService,
    private logger: LoggerService,
    private translate: TranslateService
  ) {
    this.isXSmall$ = this.valueSvc.isXSmall$
    this.loginForm = this.spherFormBuilder.group({
      emailOrMobile: new FormControl('', [Validators.required, Validators.pattern(/^((([6-9][0-9]{9}))|([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))$/)]),
    })
    this.loginPwdForm = this.spherFormBuilder.group({
      emailOrMobile: new FormControl('', [Validators.required, Validators.pattern(/^((([6-9][0-9]{9}))|([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))$/)]),
      password: new FormControl('', [Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\ *])(?=.{8,})/g)]),
    })
    this.OTPForm = this.spherFormBuilder.group({
      OTPcode: new FormControl('', [Validators.required]),
    })
    this.route.queryParams.subscribe(params => {
      if (params['ekshamtaLogin']) {
        this.isEkshamtaLogin = true
        this.routerLink = '/public/home'
      } else {
        this.routerLink = '/public/home'
      }
    })
    if (localStorage.getItem('isOrgSelectiveCourse') === 'true') {
      this.isOrgSelectiveCourse = true
    }
    this.initializeForm()
  }

  ngOnInit() {
    // Initialize telemetry session ID if not present
    this.telemetrySessionId = this.getOrCreateSessionId()

    this.title.setTitle('Aastrika Sphere | Free Certified Courses for Healthcare Professionals')

    this.meta.updateTag({
      name: 'description',
      content: 'Access high-quality, self-paced certified courses with CNE points on the Aastrika Sphere digital platform. Designed for continuous learning and professional development in healthcare.',
    })

    this.meta.updateTag({
      name: 'keywords',
      content: 'Aastrika Sphere, healthcare courses, certified courses, CNE points, online training, midwifery, skilling, e-learning, professional development, competency gaps',
    })
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
        otp1: new FormControl('', [Validators.required]),
        otp2: new FormControl('', [Validators.required]),
        otp3: new FormControl('', [Validators.required]),
        otp4: new FormControl('', [Validators.required]),
        OTPcode: new FormControl('', [Validators.required]),
      })
    } else {
      this.logger.log("email type")
      this.OTPForm = this.spherFormBuilder.group({
        OTPcode: ['', Validators.required],
      })
    }

  }
  updateOtpCode(): void {
    const otp1Control = this.OTPForm.get('otp1')
    const otp2Control = this.OTPForm.get('otp2')
    const otp3Control = this.OTPForm.get('otp3')
    const otp4Control = this.OTPForm.get('otp4')
    const code = this.OTPForm.get('OTPcode')
    this.logger.log("yes here", otp4Control)
    if (otp1Control && otp2Control && otp3Control && otp4Control) {
      const otp1 = otp1Control.value
      const otp2 = otp2Control.value
      const otp3 = otp3Control.value
      const otp4 = otp4Control.value
      const code = otp1 + otp2 + otp3 + otp4
      if (this.OTPForm?.get('OTPcode')) {
        this.OTPForm.get('OTPcode')!.setValue(code)
      }
      this.logger.error('1 One or more OTP controls are missing')

    } else {
      this.OTPForm.controls['OTPcode'].setValue(code)
      this.logger.error('One or more OTP controls are missing')
    }
  }
  help() {
    let width = '345px'
    let height = '335px'
    this.isXSmall$.subscribe((data: any) => {
      this.logger.log("data", data)
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
      height: '30%',
      data: {
        selected: 'userNotExist',
        userNotExistEkshamta: this.isEkshamtaLogin,
      },
    })

    this.langDialog.afterClosed().subscribe((data: any) => {
      this.logger.log("data: ", data)

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
    this.logger.log("val")
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
        this.logger.error("fb pixel error")
      }
      let phone = this.loginPwdForm.controls.emailOrMobile.value
      let type = ''
      phone = phone.replace(/[^0-9+#]/g, '')
      if (phone.length >= 10) {
        type = 'phone'
      } else {
        const check = /^[a-zA-Z0-9 .!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9- ]+)*$/.test(
          this.loginForm.controls.emailOrMobile.value
        )
        type = 'email'
        this.logger.log(check)
      }
      let req = {}
      if (type === 'email') {
        req = {
          "userEmail": this.loginPwdForm.controls.emailOrMobile.value,
          "typeOfLogin": "password",
          "userPassword": this.loginPwdForm.controls.password.value,
        }
      }
      if (type === 'phone') {
        req = {
          "userPhone": this.loginPwdForm.controls.emailOrMobile.value,
          "typeOfLogin": "password",
          "userPassword": this.loginPwdForm.controls.password.value,
        }
      }

      // Prepare masked sensitive data for telemetry
      const userInput = this.loginPwdForm.controls.emailOrMobile.value
      const maskedPhone = type === 'phone' ? this.maskPhone(userInput) : ''
      const maskedEmail = type === 'email' ? this.maskEmail(userInput) : ''

      // Send telemetry for login submit
      this.sendLoginSubmitTelemetry(type, maskedPhone, maskedEmail, 'password')

      this.logger.log(type, 'check')
      this.isLoginLoading = true
      this.signupService.loginAPI(req).subscribe(res => {
        this.isLoginLoading = false
        localStorage.setItem('loginDetailsWithToken', JSON.stringify(res))
        this.logger.log(res.status)
        this.openSnackbar(this.translate.instant("USER_AUTH_SUCCESS"))

        setTimeout(() => {
          this.signupService.fetchStartUpDetails().then(async (result: any) => {
            const res = await result
            this.logger.log(res, 'res')
            localStorage.setItem('lang131', JSON.stringify(res))

            // Send login success telemetry after userProfile is populated
            this.sendLoginSuccessTelemetry(type, maskedPhone, maskedEmail, 'password', res?.msg || res?.message)

            if (localStorage.getItem('url_before_login')) {
              const url = localStorage.getItem('url_before_login') || ''
              location.href = url
            } else {
              const orgSelectiveConfig = this.configSvc.orgSelectiveCourseConfig
              const rootOrgId = this.configSvc.userProfile?.rootOrgId || ''
              if (orgSelectiveConfig && orgSelectiveConfig.orgId === rootOrgId) {
                const redirectUrl =
                  orgSelectiveConfig.redirectUrl || '/app/org-selective-course'
                this.logger.log(
                  `Redirecting to org-selective page: ${redirectUrl} for org ${rootOrgId}`
                )
                window.location.href = redirectUrl
              } else {
                window.location.href = '/page/home'
              }
            }
          })
        }, 500)

      }, err => {
        this.isLoginLoading = false
        this.logger.log(err)

        // Send login failure telemetry
        this.sendLoginFailureTelemetry(type, maskedPhone, maskedEmail, 'password', err?.error?.msg || err?.error?.message || 'Login failed')

        if (err?.error?.message === "User doesn't exists please signup and try again" || err?.error?.msg === "User doesn't exists please signup and try again") {
          this.userDoesnotExist()
        }
        this.openSnackbar(this.translate.instant(err?.error?.msg || err?.error?.error || "Login Failed"))
      })
    } else {
      this.logger.log('alert')
    }
  }
  resendOTP(form?: any) {

    this.logger.log(form)
    if ((this.loginForm.status === 'VALID')) {
      let phone = this.loginForm.controls.emailOrMobile.value
      let type = ''
      phone = phone.replace(/[^0-9+#]/g, '')
      if (phone.length >= 10) {
        type = 'phone'
      } else {
        const check = /^[a-zA-Z0-9 .!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9- ]+)*$/.test(
          this.loginForm.controls.emailOrMobile.value
        )
        type = 'email'
        this.logger.log(check, 'check')
      }
      let req = {}
      if (type === 'email') {
        req = {
          "userEmail": this.loginForm.controls.emailOrMobile.value,
          "userId": this.userID,
        }
      }
      if (type === 'phone') {
        req = {
          "userPhone": this.loginForm.controls.emailOrMobile.value,
          "userId": this.userID,
        }
      }
      this.startTimer()
      this.OTPForm.reset({
        otp1: '',
        otp2: '',
        otp3: '',
        otp4: '',
        code: '',
      })
      this.logger.log(req, type)
      this.signupService.resendOTP(req).subscribe(res => {
        this.logger.log(res)
        const str = res.msg ?? res.message
        const parts = str.split(" ")
        const lastValue = parts[parts.length - 1]
        const message = parts.slice(0, -1).join(" ")
        this.openSnackbar(this.translate.instant(message, { value: lastValue }))
      }, err => {
        this.logger.log(err)
        const str = err.error.msg ?? err.error.message
        const parts = str.split(" ")
        const lastValue = parts[parts.length - 1]
        const message = parts.slice(0, -1).join(" ")
        this.openSnackbar(this.translate.instant(message, { value: lastValue }))
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
        const check = /^[a-zA-Z0-9 .!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9- ]+)*$/.test(
          this.loginForm.controls.emailOrMobile.value
        )
        type = 'email'
        this.logger.log(check, 'check')
      }
      let req = {}
      if (type === 'email') {
        req = {
          "userEmail": this.loginForm.controls.emailOrMobile.value,
          "typeOfLogin": "otp",
          "otp": this.OTPForm.controls.OTPcode.value.trim(),
        }
      }
      if (type === 'phone') {
        req = {
          "userPhone": this.loginForm.controls.emailOrMobile.value,
          "typeOfLogin": "otp",
          "otp": this.OTPForm.controls.OTPcode.value.trim(),
        }
      }

      // Prepare masked sensitive data for telemetry
      const userInput = this.loginForm.controls.emailOrMobile.value
      const maskedPhone = type === 'phone' ? this.maskPhone(userInput) : ''
      const maskedEmail = type === 'email' ? this.maskEmail(userInput) : ''

      // Send telemetry for login submit
      this.sendLoginSubmitTelemetry(type, maskedPhone, maskedEmail, 'otp')

      this.logger.log(req, type)
      this.isLoginLoading = true
      this.signupService.loginAPI(req).subscribe(res => {
        this.isLoginLoading = false
        localStorage.setItem('loginDetailsWithToken', JSON.stringify(res))
        this.logger.log(res)
        this.openSnackbar(this.translate.instant(res.msg ?? res.message))
        setTimeout(() => {
          this.signupService.fetchStartUpDetails().then(async (result: any) => {
            const res = await result
            this.logger.log(res, 'res')
            // ✅ NO language prefix in URLs - ngx-translate handles language via localStorage
            localStorage.setItem('res123', JSON.stringify(res))
            if (res && res.status) {
              if (res.language) {
                const lang = res.language
                const obj = {
                  lang: lang,
                  res: res.language,
                  line: 56,
                }
                localStorage.setItem('lang123', JSON.stringify(obj))
              }

              // Send login success telemetry after userProfile is populated
              this.sendLoginSuccessTelemetry(type, maskedPhone, maskedEmail, 'otp', result?.msg || result?.message)

              localStorage.setItem('res', JSON.stringify(res))
              if (localStorage.getItem('url_before_login')) {
                const url = localStorage.getItem('url_before_login') || ''
                location.href = url
              } else {
                const orgSelectiveConfig = this.configSvc.orgSelectiveCourseConfig
                const rootOrgId = this.configSvc.userProfile?.rootOrgId || ''
                if (orgSelectiveConfig && orgSelectiveConfig.orgId === rootOrgId) {
                  const redirectUrl =
                    orgSelectiveConfig.redirectUrl || '/app/org-selective-course'
                  this.logger.log(
                    `Redirecting to org-selective page: ${redirectUrl} for org ${rootOrgId}`
                  )
                  window.location.href = redirectUrl
                } else {
                  window.location.href = '/page/home'
                }
              }
            }
          })
        }, 500)
      }, err => {
        this.isLoginLoading = false
        this.logger.log(err.error)

        // Send login failure telemetry
        this.sendLoginFailureTelemetry(type, maskedPhone, maskedEmail, 'otp', err?.error?.msg || err?.error?.message || 'Login failed')

        this.openSnackbar(this.translate.instant(err.error.msg || err.error.message))
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
        const check = /^[a-zA-Z0-9 .!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9- ]+)*$/.test(
          this.loginForm.controls.emailOrMobile.value
        )
        type = 'email'
        this.emailPhoneType = 'email'
        this.logger.log(check, 'check')
      }
      let req = {}
      if (type === 'email') {
        req = {
          "userEmail": this.loginForm.controls.emailOrMobile.value,
          "userPhone": "",
        }
      }
      if (type === 'phone') {
        req = {
          "userEmail": '',
          "userPhone": this.loginForm.controls.emailOrMobile.value,
        }
      }
      if (window.location.href.includes('email-otp')) {
        this.emailPhoneType = 'email'
      }
      this.initializeForm()

      this.logger.log(req, 'res', type)
      this.signupService.sendOTP(req).subscribe(res => {
        this.logger.log(res)
        this.userID = res.userId
        const str = res.msg ?? res.message
        const parts = str.split(" ")
        const lastValue = parts[parts.length - 1]
        const message = parts.slice(0, -1).join(" ")
        this.openSnackbar(this.translate.instant(message, { value: lastValue }))
        this.startTimer()
        this.otpPage = true
        this.logger.log(this.otpPage)
      }, err => {
        this.logger.log(err.error.msg, err.error.message)
        if (err.error.message === "User doesn't exists please signup and try again" || err.error.msg === "User doesn't exists please signup and try again") {
          this.userDoesnotExist()
          this.openSnackbar(this.translate.instant(err.error.msg ?? err.error.message))
        } else {
          const str = err.error.msg ?? err.error.message
          const parts = str.split(" ")
          const lastValue = parts[parts.length - 1]
          const message = parts.slice(0, -1).join(" ")
          this.openSnackbar(this.translate.instant(message, { value: lastValue }))
        }
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


  openSnackbar(primaryMsg: string, duration = 3000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }
  passwordOrOtp(text: any) {
    this.logger.log("fasdfasdf", text)
    this.selectedField = text
  }

  // Utility functions for masking sensitive data
  private maskEmail(email: string): string {
    if (!email || !email.includes('@')) return email
    const [name, domain] = email.split('@')
    const maskedName = name.length > 2
      ? name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
      : name
    return `${maskedName}@${domain}`
  }

  private maskPhone(phone: string): string {
    if (!phone || phone.length < 4) return phone
    const lastFour = phone.slice(-4)
    const masked = '*'.repeat(phone.length - 4) + lastFour
    return masked
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

  // Generate or retrieve telemetry session ID
  private getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem('telemetrySessionId')
    if (!sessionId) {
      sessionId = uuid()
      localStorage.setItem('telemetrySessionId', sessionId)
    }
    return sessionId
  }

  // Send login submit telemetry event
  private sendLoginSubmitTelemetry(type: string, maskedPhone: string, maskedEmail: string, method: string): void {
    const telemetryExtras: any = {
      type: 'CLICKED',
      subtype: 'Login-submitted',
      id: 'login',
      pageid: 'Login',
      extra: {
        pos: [],
        values: {
          phone: maskedPhone,
          email: maskedEmail,
          typeOfLogin: type === 'email' ? 'email' : 'phone',
          method: method,
        },
      },
    }

    const actor = {
      id: this.telemetrySessionId,
      type: 'Guest user',
    }

    this.telemetrySvc.interactForLogin('CLICKED', 'Login-submitted', 'login', actor, telemetryExtras)
  }

  // Send login success telemetry event (after fetchStartUpDetails)
  sendLoginSuccessTelemetry(type: string, maskedPhone: string, maskedEmail: string, method: string, message: string): void {
    const loginSuccessExtras: any = {
      type: 'CLICKED',
      subtype: 'Login-success',
      id: 'login',
      pageid: 'Login',
      extra: {
        pos: [],
        values: {
          phone: maskedPhone,
          email: maskedEmail,
          typeOfLogin: type === 'email' ? 'email' : 'phone',
          method: method,
          loginStatus: 'success',
          message: message,
        },
      },
    }

    const loginSuccessActor = {
      id: this.configSvc.userProfile?.userId || '',
      type: 'User',
    }
    this.telemetrySvc.interact('CLICKED', 'Login-success', 'login', undefined, loginSuccessActor, loginSuccessExtras)
  }

  // Send login failure telemetry event
  private sendLoginFailureTelemetry(type: string, maskedPhone: string, maskedEmail: string, method: string, message: string): void {
    const loginFailureExtras: any = {
      type: 'CLICKED',
      subtype: 'Login-failed',
      id: 'login',
      pageid: 'Login',
      extra: {
        pos: [],
        values: {
          phone: maskedPhone,
          email: maskedEmail,
          typeOfLogin: type === 'email' ? 'email' : 'phone',
          method: method,
          loginStatus: 'failed',
          message: message,
        },
      },
    }

    const loginFailureActor = {
      id: this.telemetrySessionId,
      type: 'Guest user',
    }

    this.telemetrySvc.interactForLogin('CLICKED', 'Login-failed', 'login', loginFailureActor, loginFailureExtras)
  }

}