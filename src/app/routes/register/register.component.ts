import { Component, OnDestroy, ViewChild, ElementRef, OnInit, AfterViewChecked } from '@angular/core'
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms'
import { Subscription } from 'rxjs'
import { MatSnackBar } from '@angular/material'
import { Router } from '@angular/router'
import { mustMatch } from '../password-validator'
import { TncPublicResolverService } from '../../services/tnc-public-resolver.service'
import { AuthKeycloakService } from './../../../../library/ws-widget/utils/src/lib/services/auth-keycloak.service'
import { EmailMobileValidators } from '../emailMobile.validator'

@Component({
  selector: 'ws-app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit, AfterViewChecked, OnDestroy {
  signupForm: FormGroup
  emailForm: FormGroup
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
  showResend = false
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
    },                              { validator: mustMatch('password', 'confirmPassword') })

    this.emailForm = this.fb.group({
      userInput: new FormControl(['']),
    },                             { validators: EmailMobileValidators.combinePattern })
  }

  ngOnInit() {
    if (this.authSvc.isAuthenticated) {
      this.router.navigate(['/page/home'])
    }
  }

  ngAfterViewChecked() {
    // To show the Resend button after 30s
    setTimeout(() => {
      this.showResend = true
    },         30000)
  }

  verifyEntry() {
    this.emailOrMobile = this.emailForm.value.userInput
    let phone = this.emailOrMobile
    if (phone) {
      if (phone.length === 10) {
        phone = /^[6-9]\d{9}$/.test(phone)
        // at least 10 in number
        if (phone) {
          // Call OTP Api, show resend Button true
          const request = {
            mobileNumber: phone,
          }
          this.tncService.registerWithMobile(request).subscribe(
            (res: any) => {
              if (res.message === 'Success') {
                this.openSnackbar('OTP is sent to your mobile successfully')
                this.isMobile = true
              }
            },
            (err: any) => {
              this.openSnackbar(err)

            }
          )
        }
      } else {
        // tslint:disable-next-line: max-line-length
        this.email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          this.emailOrMobile
        )
        if (this.email) {
          this.isMobile = false
          this.showAllFields = true
        }
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
            },         5000)
          }
        },
        (err: { error: { error: string } }) => {
          this.openSnackbar(err.error.error)
          this.uploadSaveData = false
          setTimeout(() => {
            this.emailForm.reset()
            this.signupForm.reset()
          },         3000)
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
            },         5000)
          }
        },
        (err: { error: { error: string } }) => {
          this.openSnackbar(err.error.error)
          this.uploadSaveData = false
          // form.reset()
        }
      )

    }

  }

  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }

  gotoHome() {
    this.router.navigate(['/login'])
      .then(() => {
        window.location.reload()
      })
  }
}
