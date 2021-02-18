import { Component, OnDestroy, ViewChild, ElementRef, OnInit } from '@angular/core'
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms'
import { Subscription } from 'rxjs'
import { MatSnackBar } from '@angular/material'
import { Router } from '@angular/router'
import { mustMatch } from '../password-validator'
import { TncPublicResolverService } from '../../services/tnc-public-resolver.service'
import { AuthKeycloakService } from './../../../../library/ws-widget/utils/src/lib/services/auth-keycloak.service'

@Component({
  selector: 'ws-app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit, OnDestroy {
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
    private fb: FormBuilder, private router: Router,
    private tncService: TncPublicResolverService,
    private authSvc: AuthKeycloakService,
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
    if (this.authSvc.isAuthenticated) {
      this.router.navigate(['/page/home'])
    }
  }

  verifyEntry() {
    let phone = this.emailOrMobile

    phone = phone.replace(/[^0-9+#]/g, '')
    // at least 10 in number
    if (phone.length >= 10) {
      this.isMobile = true
      // Call OTP Api, show resend Button true
      const request = {
        mobileNumber: phone,
      }
      this.tncService.registerWithMobile(request).subscribe(
        (res: any) => {
          this.openSnackbar(res.message)
        },
        (err: any) => {
          this.openSnackbar(err)

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
    this.tncService.registerWithMobile(this.emailOrMobile).subscribe(
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
    this.uploadSaveData = true
    let reqObj

    if (this.email) {
      reqObj = {
        data: {
          firstname: form.value.firstName,
          lastname: form.value.lastName,
          username: this.emailOrMobile,
          email: this.emailOrMobile,
          password: form.value.password,
        },
        type: 'email',
      }
      this.tncService.signup(reqObj).subscribe(
        (res: { message: string }) => {
          if (res.message === 'Success') {
            form.reset()
            this.uploadSaveData = false
            this.openSnackbar(this.toastSuccess.nativeElement.value)
            setTimeout(() => {
              this.authSvc.login('S', document.baseURI)
            }, 5000)
          }
        },
        (err: { error: { error: string } }) => {
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
          otp: form.value.otp,
        },
        mobileNumber: this.emailOrMobile,

      }
      this.tncService.verifyUserMobile(requestBody).subscribe(
        (res: { message: string }) => {
          if (res.message === 'Success') {
            setTimeout(() => {
              this.authSvc.login('S', document.baseURI)
            }, 5000)
          }
        },
        (err: { error: { error: string } }) => {
          this.openSnackbar(err.error.error)
          this.uploadSaveData = false
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
