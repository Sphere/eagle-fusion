import { SignupService } from '../signup/signup.service'
import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core'
import { Router } from '@angular/router'
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms'
import { mustMatch } from '../password-validator'
import { MatSnackBar } from '@angular/material'
import { AuthKeycloakService } from '../../../../library/ws-widget/utils/src/public-api'
import { EmailMobileValidators } from '../emailMobile.validator'
@Component({
  selector: 'ws-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit, AfterViewChecked {
  forgotPasswordForm: FormGroup
  email: any
  emailOrMobile = ''
  otp = ''
  key = ''
  showOtpPwd = false
  showCheckEmailText = false
  emailForm: FormGroup
  @ViewChild('resend', { static: false }) resend!: ElementRef
  showResend = false
  constructor(private router: Router, private signupService: SignupService,
    private fb: FormBuilder, private snackBar: MatSnackBar, private authSvc: AuthKeycloakService) {
    this.forgotPasswordForm = this.fb.group({
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl(['']),
    }, { validator: mustMatch('password', 'confirmPassword') })
    this.emailForm = this.fb.group({
      userInput: new FormControl(['']),
    }, { validators: EmailMobileValidators.combinePattern })
  }
  ngOnInit() {
  }
  ngAfterViewChecked() {
    // To show the Resend button after 30s
    setTimeout(() => {
      this.showResend = true
    }, 30000)
  }
  forgotPassword() {
    let phone = ''
    this.emailOrMobile = this.emailForm.value.userInput
    phone = this.emailOrMobile
    // Allow only indian mobile numbers
    if (phone.length === 10 && (/^[6-9]\d{9}$/.test(phone))) {
      this.key = 'phone'
      const requestBody = {
        userName: this.emailOrMobile,
      }
      this.signupService.forgotPassword(requestBody).subscribe(
        (res: any) => {
          if (res.message === 'Success') {
            phone = this.emailOrMobile.replace(/^[6-9]\d{9}$/, '')
            // Allow only indian mobile numbers
            if (phone.length === 10) {
              this.showOtpPwd = true
            }
          }
        },
        (error: any) => {
          if (error.error.error === 'User Not Found') {
            this.openSnackbar('Mobile number doesnot exist')
          } else {
            this.openSnackbar(error.error.error)
          }
        })
      // tslint:disable-next-line: max-line-length
    } else if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this.emailOrMobile)) {
      this.key = 'email'
      const requestBody = {
        username: this.emailOrMobile,
      }
      this.signupService.forgotPassword(requestBody).subscribe(
        (res: any) => {
          if (res.message === 'Success') {
            this.showCheckEmailText = true
          }
        },
        (error: any) => {
          if (error.error.error === 'User Not Found') {
            this.openSnackbar('User data doesnot exist')
          } else {
            this.openSnackbar(error.error.error)
          }
        })
      this.emailForm.reset()
    }
  }
  resetForm() {
    this.router.navigate(['/home'])
  }
  onSubmit() {
    const requestBody = {
      key: this.emailOrMobile,
      type: this.key,
      otp: this.otp,
    }
    this.signupService.setPasswordWithOtp(requestBody).subscribe(
      res => {
        if (res) {
          this.openSnackbar('Password changed successfully')
          setTimeout(() => {
            this.authSvc.login('S', document.baseURI)
          }, 5000)
        }
      },
      (error: any) => {
        this.openSnackbar(error.error.error)
        this.otp = ''
      }
    )
  }
  private openSnackbar(primaryMsg: string, duration: number = 2000) {
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