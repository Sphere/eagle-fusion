import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core'
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms'
import { Subscription } from 'rxjs'
import { MatSnackBar } from '@angular/material'
import { SignupService } from './signup.service'
import { mustMatch } from './password-validator'

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
    private fb: FormBuilder
  ) {
    this.signupForm = this.fb.group({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      otp: new FormControl(''),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl(['']),
    },                              { validator: mustMatch('password', 'confirmPassword') })
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
  }

  verifyOTP() {
    this.showAllFields = true
  }
  ngOnDestroy() {
    if (this.unseenCtrlSub && !this.unseenCtrlSub.closed) {
      this.unseenCtrlSub.unsubscribe()
    }
  }

  onSubmit(form: any) {
    this.uploadSaveData = true
    // console.log('form val', form.value)
    this.signupService.signup(form.value).subscribe(
      () => {
        form.reset()
        this.uploadSaveData = false
        this.openSnackbar(this.toastSuccess.nativeElement.value)
      },
      err => {
        this.openSnackbar(err.error.split(':')[1])
        this.uploadSaveData = false
      })
  }

  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }

}
