
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { SignupService } from '../signup/signup.service'
import { Observable } from 'rxjs'
import { ValueService, LoggerService } from '../../../../library/ws-widget/utils/src/public-api'
import { CreateAccountDialogComponent } from '../create-account-modal/create-account-dialog.component'
import { MatDialog } from '@angular/material/dialog'
import { TranslateService } from '@ngx-translate/core'
@Component({
    selector: 'ws-login-otp',
    templateUrl: './login-otp.component.html',
    styleUrls: ['./login-otp.component.scss'],
    
})
export class LoginOtpComponent implements OnInit {
  [x: string]: any

  isLoading = false
  loginOtpForm!: UntypedFormGroup
  @Input() signUpdata: any
  @Input() loginData: any
  @Input() organisationId = '0132317968766894088'
  @Output() redirectToParent = new EventEmitter()
  @Output() backToCreate = new EventEmitter<string>()
  emailPhoneType: any = 'phone'
  loginVerification = false
  redirectUrl = ''
  resendTimer = 600 // Initialize with 600 seconds (10 minutes)
  resendTimerText = '10:00' // Initialize the display text
  interval: any
  otpInputs: string[] = ['', '', '', '']
  isXSmall$: Observable<boolean>
  isBelowOneMinute = false
  langDialog: any

  constructor(
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    public signupService: SignupService,
    private readonly valueSvc: ValueService,
    public dialog: MatDialog,
    private logger: LoggerService,
    private translate: TranslateService
  ) {
    this.isXSmall$ = this.valueSvc.isXSmall$
    this.initializeForm()

  }
  ngOnInit() {
    this.startTimer()
    if (this.signUpdata || this.loginData) {
      sessionStorage.setItem('fromOTPpage', 'true')
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
    this.initializeForm()

  }

  initializeForm(): void {
    if (this.emailPhoneType === 'email') {
      this.loginOtpForm = this.fb.group({
        code: ['', Validators.required], // This control will store the combined OTP code
      })
    } else {
      this.loginOtpForm = this.fb.group({
        otp1: ['', Validators.required],
        otp2: ['', Validators.required],
        otp3: ['', Validators.required],
        otp4: ['', Validators.required],
        code: [''], // This control will store the combined OTP code
      })
    }

  }
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.help()
      event.preventDefault()
    }
  }

  moveFocus(currentInput: any, nextInput: any) {
    if (currentInput.value.length === 1 && nextInput) {
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

  updateOtpCode(): void {
    const otp1Control = this.loginOtpForm.get('otp1')
    const otp2Control = this.loginOtpForm.get('otp2')
    const otp3Control = this.loginOtpForm.get('otp3')
    const otp4Control = this.loginOtpForm.get('otp4')
    if (otp1Control && otp2Control && otp3Control && otp4Control) {
      const otp1 = otp1Control.value
      const otp2 = otp2Control.value
      const otp3 = otp3Control.value
      const otp4 = otp4Control.value
      const code = otp1 + otp2 + otp3 + otp4
      this.loginOtpForm.controls['code'].setValue(code)
    } else {
      this.logger.error('One or more OTP controls are missing')
    }
  }

  startTimer() {
    if (this.interval) {
      clearInterval(this.interval)
    }

    this.resendTimer = 600 // Reset the timer value to 10 minutes
    this.resendTimerText = '10:00' // Reset the display text to 10:00
    this.isBelowOneMinute = false
    this.interval = setInterval(() => {
      this.resendTimer--
      if (this.resendTimer === 0) {
        clearInterval(this.interval)
        this.interval = null
      }
      const minutes: string = Math.floor(this.resendTimer / 60).toString().padStart(2, '0')
      const seconds: string = (this.resendTimer % 60).toString().padStart(2, '0')
      this.resendTimerText = `${minutes}:${seconds}`
      this.isBelowOneMinute = this.resendTimer < 60
    }, 1000)
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
    this.logger.log(this.signUpdata.value)
    phone = phone.replace(/[^0-9+#]/g, '')
    const organisationId = this.organisationId
    // at least 10 in number
    if (phone.length >= 10) {
      request = {
        phone: this.signUpdata.value.emailOrMobile,
        password: this.signUpdata.value.password,
        otp: this.loginOtpForm.value.code,
        userId: localStorage.getItem(`userUUID`),
        organisationId,
      }

    } else if (/^[a-zA-Z0-9.!#$%&'+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)$/.test(
      this.signUpdata.value.emailOrMobile)) {
      request = {
        email: this.signUpdata.value.emailOrMobile,
        password: this.signUpdata.value.password,
        otp: this.loginOtpForm.value.code,
        userId: localStorage.getItem(`userUUID`),
        organisationId,
      }
    }
    this.isLoading = true
    const isOrgSelectiveCourse = localStorage.getItem('isOrgSelectiveCourse') === 'true'
    const otpService$ = isOrgSelectiveCourse
      ? this.signupService.ssoValidateOrgOTP(request)
      : this.signupService.ssoValidateOTP(request)

    //this.signupService.validateOtp(request).subscribe(
    otpService$.subscribe(
      (res: any) => {
        const url = `${document.baseURI}`
        sessionStorage.setItem('login-btn', 'clicked')
        this.openSnackbar(this.translate.instant(res.msg))
        window.location.href = `${url}app/new-tnc`
        this.isLoading = false
      },
      (err: any) => {
        this.isLoading = false
        const errMsg = err.error.error || err.error.message || 'VERIFY_OTP'
        this.openSnackbar(this.translate.instant(errMsg))
      })
  }

  async loginVerifyOtp() {
    let request: any = []
    const username = this.loginData.value.username
    const organisationId = this.organisationId
    if (!username.includes('@')) {
      request = {
        phone: this.loginData.value.username,
        password: this.loginData.value.password,
        otp: this.loginOtpForm.value.code,
        userId: localStorage.getItem(`userUUID`),
        organisationId,
      }

    } else {
      request = {
        email: this.loginData.value.username,
        password: this.loginData.value.password,
        otp: this.loginOtpForm.value.code,
        userId: localStorage.getItem(`userUUID`),
        organisationId,
      }
    }
    const isOrgSelectiveCourse = localStorage.getItem('isOrgSelectiveCourse') === 'true'
    const otpService$ = isOrgSelectiveCourse
      ? this.signupService.ssoValidateOrgOTP(request)
      : this.signupService.ssoValidateOTP(request)

    //this.signupService.validateOtp(request).subscribe(
    otpService$.subscribe(
      async (res: any) => {
        this.logger.log(res, '2')
        this.openSnackbar(this.translate.instant(res.message))
        // localStorage.removeItem('preferedLanguage')
        //location.href = '/page/home'
        return res
      },
      (err: any) => {
        this.openSnackbar(this.translate.instant(err.error.error || err.error.message))
      })

  }

  resendOTP(emailPhoneType: string) {
    this.isLoading = true
    let requestBody
    if (emailPhoneType === 'email') {
      requestBody = {
        email: this.signUpdata ? this.signUpdata.value.emailOrMobile : this.loginData.value.username,
      }
    } else {
      requestBody = {
        phone: this.signUpdata ? this.signUpdata.value.emailOrMobile : this.loginData.value.username,
      }
    }
    this.startTimer()
    this.loginOtpForm.reset({
      otp1: '',
      otp2: '',
      otp3: '',
      otp4: '',
      code: '',
    })
    this.signupService.generateOtp(requestBody).subscribe(
      async (res: any) => {
        this.loginOtpForm.patchValue({ code: '' })
        this.isLoading = false
        const str = res.msg ?? res.message
        const parts = str.split(" ")
        const lastValue = parts[parts.length - 1]
        const message = parts.slice(0, -1).join(" ")
        this.openSnackbar(this.translate.instant(message, { value: lastValue }))
      },
      (err: any) => {
        this.isLoading = false
        this.openSnackbar(this.translate.instant(err.error.error || err.error.message))
      }
    )
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
  private openSnackbar(primaryMsg: string, duration = 3000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }
  redirect() {
    this.backToCreate.emit('otp')
  }
}
