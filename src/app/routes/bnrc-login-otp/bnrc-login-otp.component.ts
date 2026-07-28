
import { ChangeDetectorRef, Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import { UserProfileService } from 'project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { LoggerService } from '../../../../library/ws-widget/utils/src/public-api'
@Component({
    standalone: false,
    selector: 'ws-bnrc-login-otp',
    templateUrl: './bnrc-login-otp.component.html',
    styleUrls: ['./bnrc-login-otp.component.scss'],
    
})
export class BnrcLoginOtpComponent implements OnInit {
  [x: string]: any
  isLoading = false
  loginOtpForm: UntypedFormGroup
  @Input() signUpdata: any
  @Input() loginData: any
  @Output() redirectToParent = new EventEmitter()
  emailPhoneType: any = 'phone'
  loginVerification = false
  redirectUrl = ''
  disableSubmit = false
  constructor(
    public router: Router,
    private readonly fb: UntypedFormBuilder,
    private readonly snackBar: MatSnackBar,
    private readonly userProfileSvc: UserProfileService,
    private readonly logger: LoggerService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.loginOtpForm = this.fb.group({
      code: new UntypedFormControl('', [Validators.required]),
    })
  }

  ngOnInit() {
    this.logger.log("this.loginData", this.loginData)
    if (this.loginData) {
      this.loginVerification = true
    }

  }



  loginVerifyOtp() {
    if (!this.loginData) {
      return
    }
    let request: any = []
    request = {
      phone: this.loginData.value.phone,
      otp: this.loginOtpForm.value.code,
    }
    const currentUrl = this.router.url
    this.logger.log("url", currentUrl.includes('uttarpradesh/register'))

    const validateOtpMethod = currentUrl.includes('uttarpradesh/register')
      ? this.userProfileSvc.upsmfValidateOtp.bind(this.userProfileSvc)
      : currentUrl.includes('madhyapradesh/register')
        ? this.userProfileSvc.mpValidateOtp.bind(this.userProfileSvc)
        : this.userProfileSvc.bnrcValidateOtp.bind(this.userProfileSvc)

    if (!this.disableSubmit) {
      this.disableSubmit = true
      this.isLoading = true
      validateOtpMethod(request).subscribe(
        (res: any) => {
          this.isLoading = false
          this.disableSubmit = false
          this.cdr.detectChanges()
          if (res.status === 'success') {
            this.openSnackbar(res.message.message)
            this.redirectToParent.emit(res)
          } else {
            this.openSnackbar(res.message || 'OTP verification failed. Please try again.')
          }
        },
        (error: any) => {
          this.disableSubmit = false
          this.isLoading = false
          this.cdr.detectChanges()
          const errorMessage = error.error && error.error.message ? error.error.message : (error.message || 'An unexpected error occurred')
          this.openSnackbar(errorMessage)
        }
      )
    }

  }

  resendOTP() {
    this.isLoading = true
    this.disableSubmit = false
    const request = {
      phone: this.loginData.value.phone,
    }
    const currentUrl = this.router.url
    this.logger.log("url", currentUrl.includes('uttarpradesh/register'))

    const resendOtpMethod = currentUrl.includes('uttarpradesh/register')
      ? this.userProfileSvc.upsmfResendOtp.bind(this.userProfileSvc)
      : currentUrl.includes('madhyapradesh/register')
        ? this.userProfileSvc.mpResendOtp.bind(this.userProfileSvc)
        : this.userProfileSvc.bnrcResendOtp.bind(this.userProfileSvc)

    resendOtpMethod(request).subscribe(
      (res: any) => {
        this.loginOtpForm.patchValue({ code: '' })
        this.isLoading = false
        this.cdr.detectChanges()
        const res1 = res
        if (this.preferedLanguage || localStorage.getItem('preferedLanguage')) {
          const reqObj = this.preferedLanguage || localStorage.getItem('preferedLanguage')
          const lang = JSON.parse(reqObj) || ''
          if (lang.id === 'hi') {
            if (res1.message === 'Success ! Please verify the OTP .') {
              const msg = 'सफलता ! कृपया ओटीपी सत्यापित करें।'
              this.openSnackbar(msg)
            }
          } else {
            this.openSnackbar(res1.message)
          }
        } else {
          this.openSnackbar(res1.message)
        }
        // localStorage.removeItem('preferedLanguage')
      },
      (err: any) => {
        this.isLoading = false
        this.cdr.detectChanges()
        if (localStorage.getItem(`preferedLanguage`)) {
          const reqObj = localStorage.getItem(`preferedLanguage`) || ''
          const lang = JSON.parse(reqObj) || ''
          if (lang.id === 'hi') {
            if (err.error.message === 'Please provide correct otp and try again.') {
              const err = 'कृपया सही ओटीपी प्रदान करें और पुनः प्रयास करें।'
              this.openSnackbar(err)
            }
          } else {
            this.openSnackbar(err.error.error || err.error.message)
          }
        } else {
          this.openSnackbar(err.error.error || err.error.message)
        }
      }
    )
  }

  openSnackbar(primaryMsg: string, duration = 3000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }

}
