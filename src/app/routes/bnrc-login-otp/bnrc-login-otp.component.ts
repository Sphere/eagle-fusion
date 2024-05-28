
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material'
//import { Router } from '@angular/router'
//import { v4 as uuid } from 'uuid'
import { UserProfileService } from 'project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
@Component({
  selector: 'ws-bnrc-login-otp',
  templateUrl: './bnrc-login-otp.component.html',
  styleUrls: ['./bnrc-login-otp.component.scss'],
})
export class BnrcLoginOtpComponent implements OnInit {
  [x: string]: any
  isLoading = false
  loginOtpForm: FormGroup
  @Input() signUpdata: any
  @Input() loginData: any
  @Output() redirectToParent = new EventEmitter()
  emailPhoneType: any = 'phone'
  loginVerification = false
  redirectUrl = ''
  constructor(
    //private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private userProfileSvc: UserProfileService,

  ) {
    this.loginOtpForm = this.fb.group({
      code: new FormControl('', [Validators.required]),
    })
  }

  ngOnInit() {
    console.log("this.loginData", this.loginData)
    if (this.loginData) {
      this.loginVerification = true
    }

  }



  async loginVerifyOtp() {
    let request: any = []
    request = {
      phone: this.loginData.value.phone || '9481966613',
      otp: this.loginOtpForm.value.code,
    }

    this.userProfileSvc.bnrcValidateOtp(request).subscribe(
      (res: any) => {
        if (res.status === 'success') {
          this.openSnackbar(res.message.message)
          this.redirectToParent.emit(res)
          return res
        }
      },
      (error: any) => {
        const errorMessage = error.error && error.error.message ? error.error.message : (error.message || 'An unexpected error occurred')
        this.openSnackbar(errorMessage)  // Handle error response
      }
    )

  }

  resendOTP() {
    this.isLoading = true

    const request = {
      phone: this.loginData.value.phone,
    }
    this.userProfileSvc.bnrcResendOtp(request).subscribe(
      async (res: any) => {
        this.loginOtpForm.patchValue({ code: '' })
        this.isLoading = false
        let res1 = res
        //this.openSnackbar(res.message)
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

        // this.openSnackbar(`OTP Error`, + err.error.message)
      }
    )
  }

  private openSnackbar(primaryMsg: string, duration: number = 3000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }

}
