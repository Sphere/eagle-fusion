import { Component, ElementRef, OnInit, ViewChild, HostListener } from '@angular/core'
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms'
import { MatDialog, MatSnackBar } from '@angular/material'
import { SignupService } from '../signup/signup.service'
import { Router } from '@angular/router'
import { LanguageDialogComponent } from '../language-dialog/language-dialog.component'
import { forkJoin } from 'rxjs/internal/observable/forkJoin'
import { mustMatch } from '../password-validator'
import { LoaderService } from '@ws/author/src/public-api'

@Component({
  selector: 'ws-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss'],
})

export class CreateAccountComponent implements OnInit {
  uploadSaveData = false
  languageIcon = '../../../fusion-assets/images/lang-icon.png'
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
  languageDialog = false
  createAccountForm: FormGroup
  createAccountWithPasswordForm: FormGroup
  otpCodeForm: FormGroup
  hide1 = true
  hide2 = true
  iconChange1 = 'fas fa-eye-slash'
  iconChange2 = 'fas fa-eye-slash'
  langDialog: any
  preferedLanguage: any = { id: 'en', lang: 'English' }
  timerSubscription: any
  emailDelaid = false
  preferredLanguage: any = ''
  preferredLanguageList: any[] = [{ id: 'en', lang: 'English' }, { id: 'hi', lang: 'हिंदी' }]
  loginSelection: any[] = [{ id: 'otp', val: 'With OTP' }, { id: 'password', val: 'With a password' }]
  loginSelected: any = ''
  langPage: boolean = true
  createAccount: boolean = false
  confirmPassword: boolean = false
  constructor(
    private spherFormBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private signupService: SignupService,
    private router: Router,
    public dialog: MatDialog,
    private loader: LoaderService,

  ) {
    if (localStorage.getItem('preferredLanguage')) {
      const storedLanguage = localStorage.getItem('preferredLanguage')
      // localStorage.removeItem('preferedLanguage')
      this.preferredLanguage = storedLanguage

    }
    // this.spherFormBuilder = spherFormBuilder
    this.createAccountForm = this.spherFormBuilder.group({
      firstname: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z '.-]*$/)]),
      lastname: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z '.-]*$/)]),
      // tslint:disable-next-line:max-line-length
      emailOrMobile: new FormControl('', [Validators.required, Validators.pattern(/^([6-9][0-9]{9})|([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/)]),
      // password: new FormControl('', [Validators.required,
      // Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\ *])(?=.{8,})/g)]),
      // confirmPassword: new FormControl('', [Validators.required]),
    },
      // { validator: mustMatch('password', 'confirmPassword') }
    )

    this.createAccountWithPasswordForm = this.spherFormBuilder.group({
      password: new FormControl('', [Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\ *])(?=.{8,})/g)]),
      confirmPassword: new FormControl('', [Validators.required]),
    }, { validator: mustMatch('password', 'confirmPassword') }
    )
    this.otpCodeForm = this.spherFormBuilder.group({
      otpCode: new FormControl('', [Validators.required]),
    })
    //localStorage.removeItem(`userUUID`)
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
      emailOrMobile: new FormControl('', [Validators.required, Validators.pattern(/^([6-9][0-9]{9})|([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/)]),
      password: new FormControl('', [Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\ *])(?=.{8,})/g)]),
      confirmPassword: new FormControl('', [Validators.required]),
    }, { validator: mustMatch('password', 'confirmPassword') })

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
    if (localStorage.getItem(`preferedLanguage`) || location.href.includes('/hi/')) {
      const reqObj = localStorage.getItem(`preferedLanguage`) || ''
      this.preferedLanguage = JSON.parse(reqObj)
    }
    this.emailOrMobileValueChange()
  }
  langChanged() {
    this.createAccount = true
    this.langPage = false
  }
  optionSelected() {
    let selectedOption = this.loginSelected
    if (selectedOption && selectedOption === "password") {
      this.createAccount = false
      this.confirmPassword = true
    } else {
      this.createAccount = false
      this.confirmPassword = false
      this.onSubmit(this.createAccountWithPasswordForm, this.createAccountForm)
    }

  }

  onSubmit(form: any, createAccount: any) {
    sessionStorage.setItem('login-btn', 'clicked')
    let phone = this.createAccountForm.controls.emailOrMobile.value
    // const validphone = /^[6-9]\d{9}$/.test(phone)
    phone = phone.replace(/[^0-9+#]/g, '')
    this.loader.changeLoad.next(true)
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
        firstName: createAccount.value.firstname.trim(),
        lastName: createAccount.value.lastname.trim(),
        email: createAccount.value.emailOrMobile.trim(),
        password: form.value.password.trim(),
      }

      //this.signupService.signup(reqObj).subscribe(res => {
      this.signupService.ssoWithMobileEmail(reqObj).subscribe(res => {
        console.log(res)
        console.log(res.status)
        if (res.message = "User successfully created") {
          if (this.preferedLanguage) {
            const lang = this.preferedLanguage || ''
            if (lang.id === 'hi') {
              if (res.message = "User successfully created") {
                const msg = 'उपयोगकर्ता सफलतापूर्वक बनाया गया'
                this.openSnackbar(msg)
              }
            } else {
              this.openSnackbar(res.message)
            }
          } else {
            this.openSnackbar(res.message)
          }
          // this.generateOtp('email', form.value.emailOrMobile)
          this.showAllFields = false
          this.uploadSaveData = false
          this.otpPage = true
          this.confirmPassword = false
          // form.reset()
          this.loader.changeLoad.next(false)
          localStorage.setItem(`userUUID`, res.userId)
        } else if (res.status === 'error') {
          this.openSnackbar(res.message)
          this.loader.changeLoad.next(false)
        }
      },
        err => {
          console.log(err, err.error.message, err.error.msg)

          this.createAccount = true
          this.confirmPassword = false
          this.loader.changeLoad.next(false)
          if (this.preferedLanguage) {
            const lang = this.preferedLanguage || ''
            console.log(lang.id)
            if (lang.id === 'hi') {
              if (err.error.msg === 'User already exists') {
                const err = 'उपयोगकर्ता पहले से मौजूद है।'
                this.openSnackbar(err)
                this.uploadSaveData = false
              }
            } else {
              this.openSnackbar(err.error.msg || err.error.message)
              this.uploadSaveData = false
            }
          } else {
            this.openSnackbar(err.error.msg || err.error.message)
            this.uploadSaveData = false
            // form.reset()
          }
        }
      )
    } else {
      const requestBody = {
        firstName: createAccount.value.firstname.trim(),
        lastName: createAccount.value.lastname.trim(),
        phone: createAccount.value.emailOrMobile.trim(),
        password: form.value.password.trim(),
      }

      //this.signupService.registerWithMobile(requestBody).subscribe((res: any) => {
      this.signupService.ssoWithMobileEmail(requestBody).subscribe(res => {
        if (res.message === 'User successfully created') {
          if (this.preferedLanguage) {
            const lang = this.preferedLanguage || ''
            if (lang.id === 'hi') {
              if (res.message === 'user created successfully') {
                const msg = 'उपयोगकर्ता सफलतापूर्वक बनाया गया'
                this.openSnackbar(msg)
              }
            } else {
              this.openSnackbar(res.message)
            }
          } else {
            this.openSnackbar(res.message)
          }
          // this.generateOtp('phone', form.value.emailOrMobile)
          this.showAllFields = false
          this.uploadSaveData = false
          this.otpPage = true
          this.confirmPassword = false
          this.loader.changeLoad.next(false)
          // form.reset()
          // localStorage.removeItem(`preferedLanguage`)
          localStorage.setItem(`userUUID`, res.userId)
        } else if (res.status === 'error') {
          this.openSnackbar(res.message)
          this.loader.changeLoad.next(false)
        }
      },
        err => {
          if (this.createAccount) {
            this.createAccount = true
            this.confirmPassword = false
          }
          this.loader.changeLoad.next(false)
          if (this.preferedLanguage) {
            const lang = this.preferedLanguage || ''
            if (lang.id === 'hi') {
              if (err.error.msg === 'User already exists') {
                const err = 'उपयोगकर्ता पहले से मौजूद है।'
                this.openSnackbar(err)
                this.uploadSaveData = false
              }
            } else {
              this.openSnackbar(err.error.msg || err.error.message)
              this.uploadSaveData = false
            }
          } else {
            this.openSnackbar(err.error.msg || err.error.message)
            this.uploadSaveData = false
          }
        }
      )
    }
  }
  eventTrigger(p1: string, p2: string, form?: any) {
    console.log(form)
    const obj = {
      EventDetails: {
        EventName: p1,
        Name: p2,
      },
    }
    // @ts-ignore: Unreachable code error
    console.log(MainVisitorDetails)
    // @ts-ignore: Unreachable code error
    console.log('-------', FormInfoDetails)
    // @ts-ignore: Unreachable code error
    const userdata = Object.assign(MainVisitorDetails, obj)
    console.log(userdata)
    // let obj2 = {
    //   "answerDetails": [form.value.firstname.trim(), form.value.lastname.trim(), this.emailPhoneType === "email" ? form.value.emailOrMobile.trim() : "", this.emailPhoneType === "phone" ? form.value.emailOrMobile.trim() : ""]
    // }
    // const userInfo = Object.assign(userdata, obj2)
    // console.log(userInfo)
    const obj3 = {
      FormInfoDetails: {
        FormId: 7,
        OTPFormId: 0,
        FormType: 1,
        BannerId: 0,
        RedirectUrl: '',
        Name: '',
        EmailId: '',
      },
      answerDetails: [form.value.firstname.trim(), form.value.lastname.trim(), this.emailPhoneType === 'email' ? form.value.emailOrMobile.trim() : '', this.emailPhoneType === 'phone' ? form.value.emailOrMobile.trim() : ''],
      MainVisitorDetails: userdata,
    }
    // const data = Object.assign(obj3, userInfo)
    console.log(obj3)
    // this.signupService.plumb5SendEvent(userInfo).subscribe((res: any) => {
    //   // @ts-ignore: Unreachable code error
    //   // tslint:disable-next-line
    //   console.log(res)
    // })
    console.log(this.emailPhoneType)
    forkJoin([this.signupService.plumb5SendEvent(userdata), this.signupService.plumb5SendForm(obj3)]).pipe().subscribe((res: any) => {
      console.log(res)
    })
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

  changeLanguage() {
    this.langDialog = this.dialog.open(LanguageDialogComponent, {
      panelClass: 'language-modal',
      data: {
        selected: this.preferedLanguage,
      },
    })
    this.langDialog.afterClosed().subscribe((result: any) => {
      console.log(result)
      if (result) {
        if (localStorage.getItem('preferedLanguage')) {
          localStorage.removeItem('preferedLanguage')
        }
        this.preferedLanguage = result
        localStorage.setItem(`preferedLanguage`, JSON.stringify(this.preferedLanguage))
        const lang = result.id === 'hi' ? result.id : ''
        if (this.router.url.includes('hi')) {
          const lan = this.router.url.split('hi/').join('')
          if (lang === 'hi') {
            window.location.assign(`${location.origin}/${lang}${lan}`)
          } else {
            window.location.assign(`${location.origin}${lang}${lan}`)
          }
        } else {
          if (lang === 'hi') {
            window.location.assign(`${location.origin}/${lang}${this.router.url}`)
          } else {
            window.location.assign(`${location.origin}${lang}${this.router.url}`)
          }
        }
      }
    })
  }

  emailOrMobileValueChange() {
    this.createAccountForm.get('emailOrMobile')!.valueChanges
      .subscribe(() => {
        this.emailDelaid = true
        if (this.timerSubscription) {
          clearTimeout(this.timerSubscription)
          this.timerSubscription = null
        }
        this.timerSubscription = setTimeout(() => {
          this.emailDelaid = false
        }, 300)
      })
  }
  preferredLanguageChange(event: any) {
    console.log("value: ", this.preferredLanguage)
    let value = event
    this.preferredLanguage = value
    if (value) {
      if (localStorage.getItem('preferredLanguage')) {
        localStorage.removeItem('preferredLanguage')
      }
      this.preferredLanguage = value
      localStorage.setItem(`preferredLanguage`, this.preferredLanguage)
      const lang = value === 'hi' ? value : ''
      if (this.router.url.includes('hi')) {
        const lan = this.router.url.split('hi/').join('')
        if (lang === 'hi') {
          window.location.assign(`${location.origin}/${lang}${lan}`)
        } else {
          window.location.assign(`${location.origin}${lang}${lan}`)
        }
      } else {
        if (lang === 'hi') {
          window.location.assign(`${location.origin}/${lang}${this.router.url}`)
        } else {
          window.location.assign(`${location.origin}${lang}${this.router.url}`)
        }
      }
    }
  }
  get emailOrMobileErrorStatus() {
    let errorType = ''
    const controll = this.createAccountForm.get('emailOrMobile')

    if (controll!.valid) {
      return errorType
    } else if (!this.emailDelaid) {
      if (controll!.hasError('required') && (controll!.dirty || controll!.touched)) {
        errorType = 'required'
      } else if (controll!.hasError('pattern')) {
        errorType = 'pattern'
      }
    }
    return errorType
  }
}
