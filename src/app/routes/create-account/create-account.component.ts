import { Component, ElementRef, OnInit, ViewChild, HostListener } from '@angular/core'
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { SignupService } from '../signup/signup.service'
import { Router } from '@angular/router'
import { LanguageDialogComponent } from '../language-dialog/language-dialog.component'
import { forkJoin } from 'rxjs/internal/observable/forkJoin'
import { mustMatch } from '../password-validator'
import { LoaderService } from '@ws/author/src/public-api'
import { ConfigurationsService, ValueService } from '../../../../library/ws-widget/utils/src/public-api'
import { CreateAccountDialogComponent } from '../create-account-modal/create-account-dialog.component'
import { Observable } from 'rxjs'

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
  createAccountForm: UntypedFormGroup
  createAccountWithPasswordForm: UntypedFormGroup
  otpCodeForm: UntypedFormGroup
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
  passwordLengthImage: string = '../../../fusion-assets/icons/gray_dot.pwd.png'
  passwordUppercaseImage: string = '../../../fusion-assets/icons/gray_dot.pwd.png'
  passwordNumberImage: string = '../../../fusion-assets/icons/gray_dot.pwd.png'
  passwordSpecialCharImage: string = '../../../fusion-assets/icons/gray_dot.pwd.png'
  isXSmall$: Observable<boolean>
  constructor(
    private spherFormBuilder: UntypedFormBuilder,
    public snackBar: MatSnackBar,
    private signupService: SignupService,
    private router: Router,
    public dialog: MatDialog,
    private loader: LoaderService,
    public configSvc: ConfigurationsService,
    private readonly valueSvc: ValueService,

  ) {
    this.isXSmall$ = this.valueSvc.isXSmall$
    if (localStorage.getItem('preferedLanguage')) {
      let storedLanguage: any = localStorage.getItem('preferedLanguage')
      // localStorage.removeItem('preferedLanguage')
      let lang = JSON.parse(storedLanguage)
      if (lang) {
        this.preferredLanguage = lang.id
      }
    }
    // this.spherFormBuilder = spherFormBuilder
    this.createAccountForm = this.spherFormBuilder.group({
      firstname: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z '.-]*$/)]),
      lastname: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z '.-]*$/)]),
      // tslint:disable-next-line:max-line-length
      emailOrMobile: new UntypedFormControl('', [Validators.required, Validators.pattern(/^((([6-9][0-9]{9}))|([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))$/)]),
      // password: new UntypedFormControl('', [Validators.required,
      // Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\ *])(?=.{8,})/g)]),
      // confirmPassword: new UntypedFormControl('', [Validators.required]),
    },
      // { validator: mustMatch('password', 'confirmPassword') }
    )

    this.createAccountWithPasswordForm = this.spherFormBuilder.group({
      password: new UntypedFormControl('', [Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\ *])(?=.{8,})/g)]),
      confirmPassword: new UntypedFormControl('', [Validators.required]),
    }, { validator: mustMatch('password', 'confirmPassword') }
    )
    this.otpCodeForm = this.spherFormBuilder.group({
      otpCode: new UntypedFormControl('', [Validators.required]),
    })
    //localStorage.removeItem(`userUUID`)
  }

  @HostListener('window:popstate', ['$event'])
  onPopState() {
    window.location.href = '/public/home'
  }
  redirect(val: string) {
    if (val === 'lang') {
      window.location.href = '/public/home'
    } else if (val === 'createAccount') {
      this.langPage = true
      this.createAccount = false
      this.confirmPassword = false
      this.otpPage = false
    } else if (val === 'confirmPassword') {
      this.langPage = false
      this.createAccount = true
      this.confirmPassword = false
      this.otpPage = false
    } else {
      this.createAccount = true
      this.confirmPassword = false
      this.otpPage = false

    }
  }
  homePage() {
    location.href = this.configSvc?.unMappedUser?.id
      ? '/page/home'
      : '/public/home'
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
      firstname: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z '.-]*$/)]),
      lastname: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z '.-]*$/)])
    })

    this.otpCodeForm = this.spherFormBuilder.group({
      otpCode: new UntypedFormControl('', [Validators.required]),
    })
  }

  showParentForm(event: any) {
    if (event === 'true') {
      this.initializeFormFields()
    }
  }

  ngOnInit() {
    this.updatePasswordValidationImages()
    let pwd = this.createAccountWithPasswordForm.get('password')
    if (pwd) {
      pwd.valueChanges.subscribe(() => {
        this.updatePasswordValidationImages()
      })
    }
    if (localStorage.getItem('preferedLanguage') || location.href.includes('/hi/')) {
      const reqObj = localStorage.getItem('preferedLanguage') ?? ''
      this.preferedLanguage = JSON.parse(reqObj)
    }

    this.emailOrMobileValueChange()
  }

  updatePasswordValidationImages() {
    let pwd = this.createAccountWithPasswordForm.get('password')
    let password = pwd ? pwd.value : ''
    if (password) {
      this.passwordLengthImage = password.length >= 8 ? '../../../fusion-assets/icons/pwd-tick.png' : '../../../fusion-assets/icons/pwd-cross.png'
      this.passwordUppercaseImage = /[A-Z]/.test(password) ? '../../../fusion-assets/icons/pwd-tick.png' : '../../../fusion-assets/icons/pwd-cross.png'
      this.passwordNumberImage = /\d/.test(password) ? '../../../fusion-assets/icons/pwd-tick.png' : '../../../fusion-assets/icons/pwd-cross.png'
      this.passwordSpecialCharImage = /[\W_]/.test(password) ? '../../../fusion-assets/icons/pwd-tick.png' : '../../../fusion-assets/icons/pwd-cross.png'
    }

  }

  langChanged() {
    this.createAccount = true
    this.langPage = false
  }
  help() {
    this.langDialog = this.dialog.open(CreateAccountDialogComponent, {
      panelClass: 'language-modal',
      width: '345px',
      height: '335px',
      data: {
        selected: "help",
      },
    })
  }
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.help()
      event.preventDefault()
    }
  }
  optionSelected() {
    let firstname = this.createAccountForm.controls.firstname.value
    let lastname = this.createAccountForm.controls.lastname.value
    this.langDialog = this.dialog.open(CreateAccountDialogComponent, {
      panelClass: 'language-modal',
      width: '312px',
      height: '186px',
      data: {
        selected: "name",
        details: {
          firstname,
          lastname,
        }
      }
    })




    this.langDialog.afterClosed().subscribe((data: any) => {
      if (data === "confirm") {
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
      if (data === 'login') {
        if (localStorage.getItem('login_url')) {
          const url: any = localStorage.getItem('login_url')
          window.location.href = url
        }
        if (localStorage.getItem('url_before_login') && this.router.url === '/public/home') {
          localStorage.removeItem('url_before_login')
        }
        this.router.navigateByUrl('/public/login')
      }
    })
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
    if (localStorage.getItem(`preferedLanguage`) || location.href.includes('/hi/')) {
      const local = localStorage.getItem(`preferedLanguage`) || ''
      this.preferedLanguage = JSON.parse(local)
    }
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
          try {

            (window as any).fbq('track', 'CompleteRegistration', { content_category: 'email' })
          }
          catch (e) {
            console.log("fb pixel error")
          }
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
            this.userExist()
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
          try {

            (window as any).fbq('track', 'CompleteRegistration', { content_category: 'mobile' })
          }
          catch (e) {
            console.log("fb pixel error")
          }
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
          // if (this.createAccount) {
          this.createAccount = true
          this.confirmPassword = false
          // }
          this.loader.changeLoad.next(false)
          this.userExist()
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

  userExist() {
    this.langDialog = this.dialog.open(CreateAccountDialogComponent, {
      panelClass: 'language-modal',
      width: '312px',
      height: '186px',
      data: {
        selected: "userExist",
      },
    })

    this.langDialog.afterClosed().subscribe((data: any) => {
      if (data === 'login') {
        if (localStorage.getItem('login_url')) {
          const url: any = localStorage.getItem('login_url')
          window.location.href = url
        }
        if (localStorage.getItem('url_before_login') && this.router.url === '/public/home') {
          localStorage.removeItem('url_before_login')
        }
        this.router.navigateByUrl('/public/login')
      }
    })
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
    let value
    if (event === 'hi') {
      value = { id: 'hi', lang: 'हिंदी' }
    } else {
      value = { id: 'en', lang: 'English' }
    }
    this.preferredLanguage = value
    if (value) {
      if (localStorage.getItem('preferedLanguage')) {
        localStorage.removeItem('preferedLanguage')
      }
      this.preferedLanguage = value
      localStorage.setItem(`preferedLanguage`, JSON.stringify(this.preferedLanguage))
      const lang = value.id === 'hi' ? value.id : ''
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
