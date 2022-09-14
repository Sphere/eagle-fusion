import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core'
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms'
import { Subscription } from 'rxjs'
import { MatSnackBar } from '@angular/material'
import { SignupService } from './signup.service'
// import { mustMatch } from './password-validator'
import { Router } from '@angular/router'

@Component({
  selector: 'ws-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit, OnDestroy {
  signupForm: FormGroup
  unseenCtrl!: FormControl
  unseenCtrlSub!: Subscription
  uploadSaveData = false
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  @ViewChild('toastError', { static: true }) toastError!: ElementRef<any>
  emailOrMobile: any
  phone = false
  email: any
  showAllFields = true
  isMobile = false
  isOtpValid = false
  constructor(
    private snackBar: MatSnackBar,
    private signupService: SignupService,
    private fb: FormBuilder, private router: Router,
  ) {
    this.signupForm = this.fb.group({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      otp: new FormControl(''),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl(['']),
      emailOrMobile: new FormControl('', [Validators.required]),
    },                              {})
  }

  ngOnInit() {
    // this.unseenCtrlSub = this.signupForm.valueChanges.subscribe(value => {
    //   console.log('ngOnInit - value', value);
    // })
  }

  // generate otp

  generateOtp() {
    let phone = this.signupForm.controls.emailOrMobile.value

    phone = phone.replace(/[^0-9+#]/g, '')
    // at least 10 in number
    if (phone.length >= 10) {
      // Call OTP valiate  Api, show resend Button true
      const request = {
        mobileNumber: phone,
      }
      this.signupService.generateOtp(request).subscribe(
        (res: any) => {
          if (res.message === 'Success') {
            // this.isMobile = true
          }
          // this.openSnackbar(res.message)
        },
        (err: any) => {
          this.openSnackbar(err)

        }
      )
    }
  }

  verifyOtp() {
    let phone = this.signupForm.controls.emailOrMobile.value

    phone = phone.replace(/[^0-9+#]/g, '')
    // at least 10 in number
    if (phone.length >= 10) {
      this.isMobile = false
      // Call OTP Api, show resend Button true
      const request = {
        mobileNumber: phone,
        otp: this.signupForm.controls.otp.value,
      }

      this.signupService.validateOtp(request).subscribe(
        (res: any) => {
          if (res.message === 'Success') {
            this.router.navigate(['/page/home'])
          }
          // this.openSnackbar(res.message)
        },
        (err: any) => {
          this.openSnackbar(err)

        }
      )
    }
  }

  resendOTP() {
    // call resend OTP function
    this.signupService.registerWithMobile(this.emailOrMobile).subscribe(
      (res: any) => {
        this.openSnackbar(res.message)
      },
      (err: any) => {
        this.openSnackbar(err)
      }
    )
  }

  ngOnDestroy() {
    if (this.unseenCtrlSub && !this.unseenCtrlSub.closed) {
      this.unseenCtrlSub.unsubscribe()
    }
  }

  onSubmit(form: any) {
    let phone = this.signupForm.controls.emailOrMobile.value

    phone = phone.replace(/[^0-9+#]/g, '')
    // at least 10 in number
    if (phone.length >= 10) {
      this.isMobile = true
      // Call OTP Api, show resend Button true
    } else {
      this.email = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
        this.signupForm.controls.emailOrMobile.value
      )
    }
    this.uploadSaveData = true
    let reqObj

    if (this.email) {
      reqObj = {
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        email: form.value.emailOrMobile,
        password: form.value.password,
      }
      this.signupService.signup(reqObj).subscribe(res => {
        if (res.message === 'Success') {
          form.reset()
          this.showAllFields = false
          this.uploadSaveData = false
          this.openSnackbar(this.toastSuccess.nativeElement.value)
        }
      },
                                                  err => {
          this.openSnackbar(err.error.msg)
          this.uploadSaveData = false
          form.reset()
        }
      )
    } else {
      const requestBody = {
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        phone: form.value.emailOrMobile,
        password: form.value.password,
      }
      this.signupService.registerWithMobile(requestBody).subscribe(res => {
        if (res.status === 'success') {
          this.showAllFields = false
          this.generateOtp()
          // this.router.navigate(['/page/home'])
        }
      },
                                                                   err => {
          this.openSnackbar(err.error.msg)
          form.reset()
        }
      )

    }

  }

  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }

}
