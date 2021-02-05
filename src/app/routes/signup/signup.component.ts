import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core'
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms'
import { Subscription } from 'rxjs'
import { MatSnackBar } from '@angular/material'
import { SignupService } from './signup.service'
import { mustMatch } from './password-validator'
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
  showAllFields = false
  isMobile = false
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
    }, { validator: mustMatch('password', 'confirmPassword') })
  }

  ngOnInit() {
    // this.unseenCtrlSub = this.signupForm.valueChanges.subscribe(value => {
    //   console.log('ngOnInit - value', value);
    // })
  }

  verifyEntry() {
    let phone = this.emailOrMobile

    phone = phone.replace(/[^0-9+#]/g, '')
    // at least 10 in number
    if (phone.length >= 10) {
      // console.log('Its valid mobile number')
      this.isMobile = true
      // Call OTP Api, show resend Button true
      const request = {
        mobileNumber: phone
      }
      this.signupService.registerWithMobile(request).subscribe(
        (res) => {
          console.log('res phone', res) //remove
        },
        err => {
          console.log('err phone', err) //remove

        }
      )
    } else {
      this.email = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
        this.emailOrMobile
      )
      if (this.email) {
        this.isMobile = false
        this.showAllFields = true
      }
    }
  }

  resendOTP() {
    // call resend OTP function
    this.signupService.registerWithMobile(this.emailOrMobile).subscribe(
      (res) => {
        console.log('res phone', res)

      },
      err => {
        console.log('err phone', err)//remove
      }
    )
  }



  ngOnDestroy() {
    if (this.unseenCtrlSub && !this.unseenCtrlSub.closed) {
      this.unseenCtrlSub.unsubscribe()
    }
  }

  onSubmit(form: any) {
    this.uploadSaveData = true
    let reqObj

    if (this.email) {
      reqObj = {
        data: {
          firstname: form.value.firstName,
          lastname: form.value.lastName,
          username: this.emailOrMobile,
          email: this.emailOrMobile,
          password: form.value.password
        },
        'type': 'email'
      }
      this.signupService.signup(reqObj).subscribe(
        (res) => {
          if (res.message === 'Success') {
            form.reset()
            this.uploadSaveData = false
            this.openSnackbar(this.toastSuccess.nativeElement.value)
          }
        },
        err => {
          this.openSnackbar(err.error.error)
          this.uploadSaveData = false
          form.reset()
        }
      )
    } else {
      const requestBody = {

        data: {
          firstname: form.value.firstName,
          lastname: form.value.lastName,
          username: this.emailOrMobile,
          password: form.value.password,
          otp: form.value.otp
        },
        mobileNumber: this.emailOrMobile

      }
      this.signupService.verifyUserMobile(requestBody).subscribe(
        (res) => {
          if (res.message === 'Success') {
            this.router.navigate(['/page/home'])
          }
        },
        err => {
          this.openSnackbar(err.error.error)
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
