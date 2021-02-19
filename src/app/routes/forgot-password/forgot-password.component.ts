import { SignupService } from '../signup/signup.service'
import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms'
import { mustMatch } from '../password-validator'
import { MatSnackBar } from '@angular/material'
import { AuthKeycloakService } from '../../../../library/ws-widget/utils/src/public-api'

@Component({
  selector: 'ws-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup
  emailOrMobile = ''
  otp = ''
  public emailPattern = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/
  showOtpPwd = false
  showCheckEmailText = false
  constructor(private router: Router, private signupService: SignupService,
    private fb: FormBuilder, private snackBar: MatSnackBar, private authSvc: AuthKeycloakService, ) {
    this.forgotPasswordForm = this.fb.group({
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl(['']),
    }, { validator: mustMatch('password', 'confirmPassword') })
  }

  ngOnInit() {

  }

  forgotPassword() {
    const requestBody = {
      username: this.emailOrMobile,
    }

    this.signupService.forgotPassword(requestBody).subscribe(
      (res: any) => {
        // console.log('res of forgot pwd', res)
        if (res.message === 'Success') {
          let phone = this.emailOrMobile
          phone = phone.replace(/[^0-9+#]/g, '')
          // at least 10 in number
          if (phone.length >= 10) {
            this.showOtpPwd = true
          } else {
            this.showCheckEmailText = true
          }
        }
      },
      (error: any) => {
        if (error === 404) {
        }
      })
  }

  resetForm() {
    this.router.navigate(['/home'])
  }

  onSubmit() {
    const requestBody = {
      username: this.emailOrMobile,
      password: this.forgotPasswordForm.value.password,
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

}
