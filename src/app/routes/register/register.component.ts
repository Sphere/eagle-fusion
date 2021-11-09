import { Component, OnDestroy, ViewChild, ElementRef, OnInit, AfterViewChecked } from '@angular/core'
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms'
import { Subscription } from 'rxjs'
import { MatSnackBar } from '@angular/material'
import { Router } from '@angular/router'
import { mustMatch } from '../password-validator'
import { TncPublicResolverService } from '../../services/tnc-public-resolver.service'
import { AuthKeycloakService } from './../../../../library/ws-widget/utils/src/lib/services/auth-keycloak.service'
import { EmailMobileValidators } from '../emailMobile.validator'
import { HttpErrorResponse } from '@angular/common/http'
import { AwsAnalyticsService } from '../../../../project/ws/viewer/src/lib/aws-analytics.service'

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
  hide = true
  hideConfirm = true
  validEmail = false

  constructor(
    private snackBar: MatSnackBar,
    private fb: FormBuilder, private router: Router,
    private tncService: TncPublicResolverService,
    private authSvc: AuthKeycloakService,
    private awsAnalyticsService: AwsAnalyticsService
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
    this.eventTrack('G2_RegisterPage')
  }

  // signupFormField() {
  //   return new FormGroup({
  //     firstName: new FormControl(''),
  //     lastName: new FormControl(''),
  //     otp: new FormControl(''),
  //     password: new FormControl(''),
  //     confirmPassword: new FormControl('')
  //   })
  // }

  // emailFormField() {
  //   return new FormGroup({
  //     userInput: new FormControl(''),
  //   })
  // }

  ngAfterViewChecked() {
    // To show the Resend button after 30s
    setTimeout(() => {
      this.showResend = true
    },         30000)
  }

  verifyEntry() {
    this.emailOrMobile = this.emailForm.value.userInput
    const phone = this.emailOrMobile
    if (phone) {
      if (phone.length === 10) {
        // at least 10 in number
        if (/^[6-9]\d{9}$/.test(phone)) {
          // Call OTP Api, show resend Button true
          const request = {
            mobileNumber: phone,
          }
          this.tncService.registerWithMobile(request).subscribe(
            (res: any) => {
              if (res.message === 'Success') {
                this.openSnackbar('OTP is sent to your mobile successfully')
                this.isMobile = true
                this.validEmail = false
              }
            },
            (err: any) => {
              this.openSnackbar(err)

            }
          )
        } else {
          this.validEmail = true
        }
      } else {
        // tslint:disable-next-line: max-line-length
        this.email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          this.emailOrMobile)
        this.validEmail = true

        if (this.email) {
          this.isMobile = false
          this.showAllFields = true
          this.validEmail = false
        }
      }
    }
  }

  resendOTP() {
    // call resend OTP function
    this.tncService.registerWithMobile({ mobileNumber: this.emailOrMobile }).subscribe(
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
            let url = ''
            setTimeout(() => {
              if (localStorage.getItem('selectedCourse')) {
                url = document.baseURI + localStorage.getItem('selectedCourse')
              } else {
                url = document.baseURI
              }
              this.authSvc.login('S', url)
            },         5000)
          }
        },

        (err: HttpErrorResponse) => {

          const errorMsg = err.error.error ? err.error.error : err
          this.openSnackbar(errorMsg)
          form.reset()
          this.uploadSaveData = false
          setTimeout(() => {
            this.emailForm.reset()
            this.signupForm.reset()
            this.showAllFields = false
            this.email = false
          },         2000)
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
        (err: any) => {
          this.openSnackbar(err.error.error)
          form.reset()
          this.uploadSaveData = false
          setTimeout(() => {
            this.emailForm.reset()
            this.signupForm.controls['otp'].setValidators([])
            this.signupForm.reset()
            this.showAllFields = false
            this.email = false
            this.isMobile = false
          },         2000)

          setTimeout(() => {
            if (err.status === 500) {
              this.router.navigate(['/register'])
            }
          },         5000)
          form.reset()
        }
      )
    }
  }

  private openSnackbar(primaryMsg: string, duration: number = 1500) {
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
  eventTrack(str: string) {
    const attr = {
      name: str,
      attributes: {},
    }
    this.awsAnalyticsService.callAnalyticsEndpointServiceWithoutAttribute(attr)
  }
}
