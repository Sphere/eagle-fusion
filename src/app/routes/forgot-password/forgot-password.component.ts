import { SignupService } from '../signup/signup.service'
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, NgZone } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormGroup } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { TranslateService } from '@ngx-translate/core'

@Component({
  standalone: false,
  selector: 'ws-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],

})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: UntypedFormGroup
  email: any
  emailOrMobile = ''
  showOtpPwd = false
  showCheckEmailText = false
  emailForm: UntypedFormGroup
  @ViewChild('resend', { static: false }) resend!: ElementRef
  showResend = false
  key = ''
  resendOTPbtn: any
  counter: any
  disableResendButton = false
  resendOtpCounter = 1
  maxResendTry = 4
  isEkshamtaLogin: any

  constructor(private readonly router: Router, private signupService: SignupService,
    private readonly fb: UntypedFormBuilder, private snackBar: MatSnackBar,
    private readonly route: ActivatedRoute,
    private readonly translate: TranslateService,
    private readonly cdr: ChangeDetectorRef,
    private readonly ngZone: NgZone
  ) {
    this.forgotPasswordForm = this.fb.group({
      otp: new UntypedFormControl('', [Validators.required, Validators.minLength(3)]),
    })

    this.emailForm = this.fb.group({
      // tslint:disable-next-line:max-line-length
      userInput: new UntypedFormControl('', [Validators.required, Validators.pattern(/^(([- ]*)[6-9][0-9]{9}([- ]*)|^[a-zA-Z0-9 .!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9 ]([- ]*))?)*$)$/)]),
    })
  }

  ngOnInit() {
    this.resendOtpEnablePostTimer()
  }

  forgotPassword(resendOTP?: string) {
    if (resendOTP) {
      this.resendOtpCounter = this.resendOtpCounter + 1
      if (this.resendOtpCounter >= this.maxResendTry) {
        this.disableResendButton = false
        this.openSnackbar(this.translate.instant("MAX_RETRY_LIMIT_EXCEEDED"))
        return
      }
    }
    let phone = ''
    this.emailOrMobile = this.emailForm.value.userInput

    phone = this.emailOrMobile
    phone = phone.replace(/[^0-9+#]/g, '')
    // Allow only indian mobile numbers
    if (phone.length >= 10) {
      this.key = 'phone'
      const requestBody = {
        userName: this.emailOrMobile.trim(),
      }

      this.signupService.forgotPassword(requestBody).subscribe(
        (res: any) => {
          this.ngZone.run(() => {
            if (res.message) {
              this.openSnackbar(this.translate.instant(res.message))
              this.resendOtpEnablePostTimer()
              this.showOtpPwd = true
              this.showResend = true
              this.cdr.detectChanges()
            }
          })
        },
        (error: any) => {
          this.ngZone.run(() => {
            const errMsg = error?.error?.message || error?.error || 'Oops! Something went wrong'
            this.openSnackbar(this.translate.instant(errMsg))
            this.cdr.detectChanges()
          })
        })
      // tslint:disable-next-line: max-line-length
    } else if (/^[a-zA-Z0-9 .!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9- ]+)*$/.test(this.emailOrMobile)) {

      const requestBody = {
        userName: this.emailOrMobile.trim(),
      }
      this.key = 'email'
      this.signupService.forgotPassword(requestBody).subscribe(
        (res: any) => {
          this.ngZone.run(() => {
            if (res.message) {
              this.openSnackbar(this.translate.instant(res.message))
              this.showOtpPwd = true
              this.showResend = true
              this.resendOtpEnablePostTimer()
              this.showCheckEmailText = true
              this.cdr.detectChanges()
            }
          })
        },
        (error: any) => {
          this.ngZone.run(() => {
            const errMsg = error?.error?.message || error?.error || 'Oops! Something went wrong'
            this.openSnackbar(this.translate.instant(errMsg))
            this.cdr.detectChanges()
          })
        })
    }
  }

  resetForm() {
    this.router.navigate(['/home'])
  }

  onSubmit() {
    const requestBody = {
      key: this.emailOrMobile,
      type: this.key,
      otp: this.forgotPasswordForm.value.otp,
    }
    this.signupService.setPasswordWithOtp(requestBody).subscribe(
      (res: any) => {
        this.ngZone.run(() => {
          if (res.response) {
            this.openSnackbar(this.translate.instant(res.response))
            this.cdr.detectChanges()
            setTimeout(() => {
              window.open(res.link, '_self')
            }, 2000)
          }
        })
      },
      (error: any) => {
        this.ngZone.run(() => {
          const errMsg = error?.error?.message || 'Oops! Something went wrong'
          this.openSnackbar(this.translate.instant(errMsg))
          this.cdr.detectChanges()
        })
      }
    )
  }

  resendOtpEnablePostTimer() {
    this.counter = 60
    this.disableResendButton = false
    setTimeout(() => {
      this.ngZone.run(() => {
        this.disableResendButton = true
        this.cdr.detectChanges()
      })
    }, 1000)
    const interval = setInterval(() => {
      this.ngZone.run(() => {
        this.resendOTPbtn = `Resend OTP(${(this.counter)})`
        this.counter = this.counter - 1
        if (this.counter < 0) {
          this.resendOTPbtn = 'Resend OTP'
          clearInterval(interval)
          this.disableResendButton = false
        }
        this.cdr.detectChanges()
      })
    }, 1000)
  }

  private openSnackbar(primaryMsg: string, duration = 2000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }

  gotoHome() {
    this.route.queryParams.subscribe(params => {
      this.isEkshamtaLogin = params['isEkshamataLogin']
      const queryParams = this.isEkshamtaLogin ? { ekshamtaLogin: 'true' } : {}
      this.router.navigate(['/public/login'], { queryParams })
    })
  }

}
