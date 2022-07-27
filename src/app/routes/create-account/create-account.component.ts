import { Component, ElementRef, OnInit, ViewChild, HostListener } from '@angular/core'
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material'
import { mustMatch } from '../password-validator'
import { SignupService } from '../signup/signup.service'
import { Router } from '@angular/router'

@Component({
  selector: 'ws-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss'],
})

export class CreateAccountComponent implements OnInit {
  uploadSaveData = false
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  @ViewChild('toastError', { static: true }) toastError!: ElementRef<any>
  emailOrMobile: any
  phone = false
  email: any
  showAllFields = true
  isMobile = false
  isOtpValid = false
  emailPhoneType: any
  otpPage = false
  createAccountForm: FormGroup
  otpCodeForm: FormGroup
  hide1 = true
  hide2 = true
  iconChange1 = 'fas fa-eye-slash'
  iconChange2 = 'fas fa-eye-slash'
  constructor(
    private spherFormBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private signupService: SignupService,
    private router: Router,
  ) {
    // this.spherFormBuilder = spherFormBuilder
    this.createAccountForm = this.spherFormBuilder.group({
      firstname: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z '.-]*$/)]),
      lastname: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z '.-]*$/)]),
      // tslint:disable-next-line:max-line-length
      emailOrMobile: new FormControl('', [Validators.required, Validators.pattern(/^(([- ]*)[6-9][0-9]{9}([- ]*)|^[a-zA-Z0-9 .!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9 ]([- ]*))?)*$)$/)]),
      password: new FormControl('', [Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\ *])(?=.{8,})/g)]),
      confirmPassword: new FormControl('', [Validators.required]),
    },                                                   { validator: mustMatch('password', 'confirmPassword') })

    this.otpCodeForm = this.spherFormBuilder.group({
      otpCode: new FormControl('', [Validators.required]),
    })
    localStorage.removeItem(`userUUID`)
  }

  @HostListener('window:popstate', ['$event'])
  onPopState() {
     window.location.href = '/public/home'
  }

  toggle1() {
    this.hide1 = !this.hide1
    if (this.hide1) {
      this.iconChange1 = 'fas fa-eye-slash'
    } else {
      this.iconChange1 = 'fas fa-eye'
    }
  }
  toggle2() {
    this.hide2 = !this.hide2
    if (this.hide2) {
      this.iconChange2 = 'fas fa-eye-slash'
    } else {
      this.iconChange2 = 'fas fa-eye'
    }
  }

  initializeFormFields() {
    this.createAccountForm = this.spherFormBuilder.group({
      firstname: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z '.-]*$/)]),
      lastname: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z '.-]*$/)]),
      // tslint:disable-next-line:max-line-length
      emailOrMobile: new FormControl('', [Validators.required, Validators.pattern(/^(([- ]*)[6-9][0-9]{9}([- ]*)|^[a-zA-Z0-9 .!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9 ]([- ]*))?)*$)$/)]),
      password: new FormControl('', [Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\ *])(?=.{8,})/g)]),
      confirmPassword: new FormControl('', [Validators.required]),
    },                                                   { validator: mustMatch('password', 'confirmPassword') })

    this.otpCodeForm = this.spherFormBuilder.group({
      otpCode: new FormControl('', [Validators.required]),
    })
  }

  showParentForm(event: any) {
    if (event === 'true') {
      this.initializeFormFields()
    }
  }

  ngOnInit() {
  }

  onSubmit(form: any) {
    let phone = this.createAccountForm.controls.emailOrMobile.value
    // const validphone = /^[6-9]\d{9}$/.test(phone)
    phone = phone.replace(/[^0-9+#]/g, '')

    // if (!validphone) {
    //   this.otpPage = false
    //   this.openSnackbar('Enter valid Phone Number')
    // }
    // if (phone.length < 10) {
    //   this.otpPage = false
    //   this.openSnackbar('Enter 10 digits Phone Number')
    // }
    // // at least 10 in number
    if (phone.length >= 10) {
      // this.otpPage = true
      this.isMobile = true
      this.emailPhoneType = 'phone'
      this.email = false
      // Call OTP Api, show resend Button true
    } else {
      // this.otpPage = true
      this.email = /^[a-zA-Z0-9 .!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9- ]+)*$/.test(
        this.createAccountForm.controls.emailOrMobile.value
      )
      this.emailPhoneType = 'email'
    }
    this.uploadSaveData = true
    let reqObj

    if (this.email) {
      reqObj = {
        firstName: form.value.firstname.trim(),
        lastName: form.value.lastname.trim(),
        email: form.value.emailOrMobile.trim(),
        password: form.value.password.trim(),
      }

      this.signupService.signup(reqObj).subscribe(res => {
        if (res.status) {
          this.openSnackbar(res.msg)
          // this.generateOtp('email', form.value.emailOrMobile)
          this.showAllFields = false
          this.uploadSaveData = false
          this.otpPage = true
          // form.reset()
          localStorage.setItem(`userUUID`, res.userUUId)
        } else if (res.status === 'error') {
          this.openSnackbar(res.msg)
        }
      },
                                                  err => {
          this.openSnackbar(err.error.msg)
          this.uploadSaveData = false
          // form.reset()
        }
      )
    } else {
      const requestBody = {
        firstName: form.value.firstname.trim(),
        lastName: form.value.lastname.trim(),
        phone: form.value.emailOrMobile.trim(),
        password: form.value.password.trim(),
      }

      this.signupService.registerWithMobile(requestBody).subscribe((res: any) => {
        if (res.status === 'success') {
          this.openSnackbar(res.msg)
          // this.generateOtp('phone', form.value.emailOrMobile)
          this.showAllFields = false
          this.uploadSaveData = false
          this.otpPage = true
          // form.reset()
          localStorage.setItem(`userUUID`, res.userUUId)
        } else if (res.status === 'error') {
          this.openSnackbar(res.msg)
        }
      },
                                                                   err => {
          this.openSnackbar(err.error.msg)
          this.uploadSaveData = false
        }
      )
    }
  }

  gotoHome() {
    this.router.navigate(['/page/home'])
      .then(() => {
        window.location.reload()
      })
  }
  private openSnackbar(primaryMsg: string, duration: number = 3000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }
}
