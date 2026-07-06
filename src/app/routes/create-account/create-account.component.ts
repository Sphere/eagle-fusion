import { Component, ElementRef, OnInit, ViewChild, HostListener, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms'
import { MatDialog, MatDialogRef } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router, ActivatedRoute } from '@angular/router'
import { Observable, Subject, forkJoin } from 'rxjs'
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { SignupService } from '../signup/signup.service'
import { LanguageDialogComponent } from '../language-dialog/language-dialog.component'
import { CreateAccountDialogComponent } from '../create-account-modal/create-account-dialog.component'
import { mustMatch } from '../password-validator'
import { LoaderService } from '@ws/author/src/public-api'
import { ConfigurationsService, LoggerService, TelemetryService, ValueService } from '../../../../library/ws-widget/utils/src/public-api'
import { HttpClient } from '@angular/common/http'
import { LanguageService } from '../../services/language.service'
import { TranslateService } from '@ngx-translate/core'
import { S3_END_POINTS } from '../../constants/apiConstants'
import { UserAgentResolverService } from '../../services/user-agent.service'
import { v4 as uuid } from 'uuid'

// Constants
const ASSET_PATHS = {
  languageIcon: '../../../fusion-assets/images/lang-icon.png',
  grayDot: '../../../fusion-assets/icons/gray_dot.pwd.png',
  pwdTick: '../../../fusion-assets/icons/pwd-tick.png',
  pwdCross: '../../../fusion-assets/icons/pwd-cross.png',
} as const

const REGEX_PATTERNS = {
  name: /^[a-zA-Z '.-]*$/,
  emailOrMobile: /^((([6-9][0-9]{9}))|([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))$/,
  email: /^[a-zA-Z0-9 .!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9- ]+)*$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\ *])(?=.{8,})/g,
  mobile: /^[6-9]\d{9}$/,
} as const

const STORAGE_KEYS = {
  preferredLanguage: 'preferedLanguage',
  userUUID: 'userUUID',
  loginUrl: 'login_url',
  urlBeforeLogin: 'url_before_login',
  loginBtn: 'login-btn',
} as const

interface Language {
  id: string
  lang: string
}

interface LoginOption {
  id: string
  val: string
}

interface PasswordValidation {
  length: string
  uppercase: string
  number: string
  specialChar: string
}

@Component({
  standalone: false,
  selector: 'ws-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss'],

})
export class CreateAccountComponent implements OnInit, OnDestroy {
  // ViewChild references
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef
  @ViewChild('toastError', { static: true }) toastError!: ElementRef

  // Form groups
  createAccountForm!: FormGroup
  createAccountWithPasswordForm!: FormGroup
  otpCodeForm!: FormGroup

  // UI state
  readonly languageIcon = ASSET_PATHS.languageIcon
  uploadSaveData = false
  showAllFields = true
  hide1 = true
  hide2 = true
  iconChange1 = 'fas fa-eye-slash'
  iconChange2 = 'fas fa-eye-slash'
  langPage = true
  createAccount = false
  confirmPassword = false
  otpPage = false
  emailDelaid = false
  districts: any
  districtInstituteMap: any
  showDistricts = false
  // Email/Phone state
  phone = false
  email = false
  isMobile = false
  isOtpValid = false
  emailPhoneType: 'email' | 'phone' | null = null
  institutes: any[] = []
  // Password validation images
  passwordValidation: PasswordValidation = {
    length: ASSET_PATHS.grayDot,
    uppercase: ASSET_PATHS.grayDot,
    number: ASSET_PATHS.grayDot,
    specialChar: ASSET_PATHS.grayDot,
  }

  // Language options
  preferredLanguage = ''
  preferedLanguage: Language = { id: 'en', lang: 'English' }
  readonly preferredLanguageList: Language[] = [
    { id: 'en', lang: 'English' },
    { id: 'hi', lang: 'हिंदी' },
  ]

  // Login options
  loginSelected = ''
  readonly loginSelection: LoginOption[] = [
    { id: 'otp', val: 'With OTP' },
    { id: 'password', val: 'With a password' },
  ]

  // Observables
  isXSmall$: Observable<boolean>
  isOrgSelectiveCourse = false

  // Cleanup
  private destroy$ = new Subject<void>()
  private dialogRef?: MatDialogRef<any>
  organisationId = '0132317968766894088'
  channelName!: string
  state!: string
  userRole!: string
  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private signupService: SignupService,
    private router: Router,
    private dialog: MatDialog,
    private loader: LoaderService,
    public configSvc: ConfigurationsService,
    private valueSvc: ValueService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private languageService: LanguageService,
    private logger: LoggerService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private userAgentSvc: UserAgentResolverService,
    private telemetrySvc: TelemetryService,
  ) {
    this.isXSmall$ = this.valueSvc.isXSmall$
    this.initializeForms()
    this.loadPreferredLanguage()
  }

  ngOnInit(): void {
    this.initializeFromRoute()
    this.setupPasswordValidation()
    this.setupEmailOrMobileValidation()
    this.loadStoredLanguage()
    if (!localStorage.getItem('telemetrySessionId')) {
      localStorage.setItem('telemetrySessionId', uuid())
    }
    this.userAgentSvc.requestGeolocation()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.dialogRef?.close()
  }

  @HostListener('window:popstate', [])
  onPopState(): void {
    this.navigateToHome(true)
  }

  private initializeFromRoute(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const stateCode = params.get('stateCode') || ''
        const orgName = params.get('orgName') || ''
        const roleParam = params.get('role') || ''
        this.userRole = '' // reset for safety

        // If no state code or org name, show language page
        if (!stateCode || !orgName) {
          this.setPageState(true, false, false, false)
          localStorage.setItem('isOrgSelectiveCourse', 'false')
          return
        }

        // Organization-specific signup flow
        this.setPageState(false, true, false, false)
        this.http.get<any>(S3_END_POINTS.ORG_SELECTIVE_COURSE)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => {
            localStorage.setItem('isOrgSelectiveCourse', 'true')
            this.isOrgSelectiveCourse = true
            // Find state
            const stateObj = data.states.find(
              (s: any) => s.code.toLowerCase() === stateCode.toLowerCase()
            )
            if (!stateObj) return

            // Find org
            const matchedOrg = stateObj.organisations.find(
              (o: any) => o.orgName.toLowerCase() === decodeURIComponent(orgName).toLowerCase()
            )
            if (!matchedOrg) return

            const matchedRole = matchedOrg.roles.find(
              (r: string) => r.toLowerCase() === roleParam.toLowerCase()
            )

            this.districts = (stateObj.districts || []).map((d: any) => d.name)
            this.districtInstituteMap = (stateObj.districts || []).reduce((acc: any, d: any) => {
              acc[d.name] = d.institutes || []
              return acc
            }, {})

            this.showDistricts = !!this.districts.length
            if (this.showDistricts) {
              this.createAccountForm.get('district')?.setValidators([Validators.required])
            } else {
              this.createAccountForm.get('district')?.clearValidators()
            }
            this.createAccountForm.get('district')?.updateValueAndValidity()
            this.organisationId = matchedOrg.orgId
            this.channelName = matchedOrg.orgName
            this.userRole = matchedRole || roleParam // fallback if no match
            this.state = stateObj.name
            localStorage.setItem('showDistricts', this.showDistricts ? 'true' : 'false')

            this.logger.log('State:', stateObj.name, 'Org:', matchedOrg.orgName, 'Role:', this.userRole, 'OrgId:', this.organisationId)
          })
      })
  }
  onDistrictChange(district: string) {
    this.institutes = this.districtInstituteMap[district] || []
    this.createAccountForm.get('instituteName')?.setValue('')
    this.createAccountForm.get('instituteName')?.setValidators([Validators.required])
  }

  private initializeForms(): void {
    this.createAccountForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.pattern(REGEX_PATTERNS.name)]],
      lastname: ['', [Validators.required, Validators.pattern(REGEX_PATTERNS.name)]],
      emailOrMobile: ['', [Validators.required, Validators.pattern(REGEX_PATTERNS.emailOrMobile)]],
      district: [''],
      instituteName: [''],
    })

    this.createAccountWithPasswordForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.pattern(REGEX_PATTERNS.password)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validator: mustMatch('password', 'confirmPassword') }
    )

    this.otpCodeForm = this.fb.group({
      otpCode: ['', [Validators.required]],
    })
  }

  private loadPreferredLanguage(): void {
    const storedLanguage = localStorage.getItem(STORAGE_KEYS.preferredLanguage)
    if (storedLanguage) {
      try {
        const lang = JSON.parse(storedLanguage)
        if (lang?.id) {
          this.preferredLanguage = lang.id
          this.preferedLanguage = lang
        }
      } catch (error) {
        this.logger.error('Error parsing stored language:', error)
      }
    }
  }

  private loadStoredLanguage(): void {
    if (localStorage.getItem(STORAGE_KEYS.preferredLanguage) || location.href.includes('/hi/')) {
      const reqObj = localStorage.getItem(STORAGE_KEYS.preferredLanguage) ?? ''
      try {
        this.preferedLanguage = JSON.parse(reqObj)
      } catch (error) {
        this.logger.error('Error parsing language:', error)
      }
    }
  }

  // Form validation setup
  private setupPasswordValidation(): void {
    this.passwordControl?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updatePasswordValidationImages())

    this.updatePasswordValidationImages()
  }

  private setupEmailOrMobileValidation(): void {
    this.emailOrMobileControl?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.emailDelaid = false
      })
  }

  private updatePasswordValidationImages(): void {
    const password = this.passwordControl?.value || ''

    if (!password) {
      this.resetPasswordValidation()
      return
    }

    this.passwordValidation = {
      length: password.length >= 8 ? ASSET_PATHS.pwdTick : ASSET_PATHS.pwdCross,
      uppercase: /[A-Z]/.test(password) ? ASSET_PATHS.pwdTick : ASSET_PATHS.pwdCross,
      number: /\d/.test(password) ? ASSET_PATHS.pwdTick : ASSET_PATHS.pwdCross,
      specialChar: /[\W_]/.test(password) ? ASSET_PATHS.pwdTick : ASSET_PATHS.pwdCross,
    }
  }

  private resetPasswordValidation(): void {
    this.passwordValidation = {
      length: ASSET_PATHS.grayDot,
      uppercase: ASSET_PATHS.grayDot,
      number: ASSET_PATHS.grayDot,
      specialChar: ASSET_PATHS.grayDot,
    }
  }

  // Navigation methods
  redirect(val: string): void {
    const states = {
      lang: () => this.navigateToHome(true),
      createAccount: () => this.setPageState(true, false, false, false),
      confirmPassword: () => this.setPageState(false, true, false, false),
      default: () => this.setPageState(false, true, false, false),
    };

    (states[val as keyof typeof states] || states.default)()
  }

  private setPageState(
    langPage: boolean,
    createAccount: boolean,
    confirmPassword: boolean,
    otpPage: boolean
  ): void {
    setTimeout(() => {
      this.langPage = langPage
      this.createAccount = createAccount
      this.confirmPassword = confirmPassword
      this.otpPage = otpPage
      this.cdr.detectChanges()
    })
  }

  homePage() {
    if (localStorage.getItem('isOrgSelectiveCourse') === 'false') {
      this.router.navigate([(this.configSvc!.unMappedUser! && this.configSvc!.unMappedUser!.id) ? '/page/home' : '/public/home'])
    }
  }


  private navigateToHome(force = false): void {
    if (force) {
      window.location.href = '/public/home'
    } else {
      this.router.navigate(['/public/home'])
    }
  }

  gotoHome(): void {
    this.router.navigate(['/page/home']).then(() => window.location.reload())
  }

  // UI interaction methods
  toggle1(): void {
    this.hide1 = !this.hide1
    this.iconChange1 = this.hide1 ? 'fas fa-eye-slash' : 'fas fa-eye'
  }

  toggle2(): void {
    this.hide2 = !this.hide2
    this.iconChange2 = this.hide2 ? 'fas fa-eye-slash' : 'fas fa-eye'
  }

  langChanged(): void {
    this.setPageState(false, true, false, false)
  }

  // Dialog methods
  help(): void {
    this.openDialog(CreateAccountDialogComponent, { selected: 'help' }, '345px', '335px')
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      this.help()
      event.preventDefault()
    }
  }

  optionSelected(): void {
    const { firstname, lastname } = this.createAccountForm.value

    this.dialogRef = this.openDialog(
      CreateAccountDialogComponent,
      { selected: 'name', details: { firstname, lastname } },
      '312px',
      'auto'
    )

    this.dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: string) => this.handleOptionDialogClose(data))
  }

  private handleOptionDialogClose(data: string): void {
    if (data === 'confirm') {
      if (this.loginSelected === 'password') {
        this.setPageState(false, false, true, false)
      } else if (this.loginSelected === 'otp') {
        this.setPageState(false, false, false, true)
        this.onSubmit(this.createAccountWithPasswordForm, this.createAccountForm)
      }
    } else if (data === 'login') {
      this.navigateToLogin()
    }
  }

  userExist(): void {
    this.dialogRef = this.openDialog(
      CreateAccountDialogComponent,
      { selected: 'userExist' },
      '312px',
      'auto'
    )

    this.dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: string) => {
        if (data === 'login') {
          this.navigateToLogin()
        }
      })
  }

  changeLanguage(): void {
    this.dialogRef = this.openDialog(LanguageDialogComponent, {
      selected: this.preferedLanguage,
    })

    this.dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: Language) => {
        if (result) {
          this.updateLanguagePreference(result)
        }
      })
  }

  private openDialog(
    component: any,
    data: any,
    width = '312px',
    height = 'auto'
  ): MatDialogRef<any> {
    return this.dialog.open(component, {
      panelClass: 'language-modal',
      width,
      height,
      data,
    })
  }

  // Form submission
  onSubmit(passwordForm: FormGroup, accountForm: FormGroup): void {
    sessionStorage.setItem(STORAGE_KEYS.loginBtn, 'clicked')

    const emailOrMobile = accountForm.value.emailOrMobile.trim()
    const sanitizedPhone = emailOrMobile.replace(/[^0-9+#]/g, '')

    this.loader.changeLoad.next(true)

    if (sanitizedPhone.length >= 10) {
      this.setEmailPhoneType('phone')
      this.submitWithPhone(passwordForm, accountForm, sanitizedPhone)
    } else if (REGEX_PATTERNS.email.test(emailOrMobile)) {
      this.setEmailPhoneType('email')
      this.submitWithEmail(passwordForm, accountForm)
    } else {
      this.loader.changeLoad.next(false)
      this.openSnackbar(this.translate.instant('ENTER_VALID_MAIL_PHONE'))
    }
  }
  get selectedDistrict(): string {
    return this.createAccountForm.get('district')?.value || ''
  }

  private setEmailPhoneType(type: 'email' | 'phone'): void {
    this.emailPhoneType = type
    this.isMobile = type === 'phone'
    this.email = type === 'email'
  }

  private submitWithEmail(passwordForm: FormGroup, accountForm: FormGroup): void {
    const reqObj: any = {
      firstName: accountForm.value.firstname.trim(),
      lastName: accountForm.value.lastname.trim(),
      email: accountForm.value.emailOrMobile.trim(),
      password: passwordForm.value.password.trim(),
      language: this.preferedLanguage.id,
    }
    if (this.organisationId) reqObj.organisationId = this.organisationId
    if (this.userRole) reqObj.role = this.userRole
    if (this.channelName) reqObj.channelName = this.channelName
    if (this.selectedDistrict) reqObj.district = this.selectedDistrict
    if (this.state) reqObj.state = this.state
    if (this.selectedDistrict) reqObj.instituteName = this.createAccountForm.get('instituteName')?.value

    this.uploadSaveData = true

    if (this.isOrgSelectiveCourse) {
      this.signupService
        .ssoWithMobileEmailOrgForm(reqObj)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          res => this.handleSignupSuccess(res, 'email'),
          err => this.handleSignupError(err)
        )
    } else {
      this.signupService
        .ssoWithMobileEmail(reqObj)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          res => this.handleSignupSuccess(res, 'email'),
          err => this.handleSignupError(err)
        )
    }
  }

  private submitWithPhone(
    passwordForm: FormGroup,
    accountForm: FormGroup,
    phone: string
  ): void {
    const reqObj: any = {
      firstName: accountForm.value.firstname.trim(),
      lastName: accountForm.value.lastname.trim(),
      phone,
      password: passwordForm.value.password.trim(),
      language: this.preferedLanguage.id,
    }

    if (this.organisationId) reqObj.organisationId = this.organisationId
    if (this.userRole) reqObj.role = this.userRole
    if (this.channelName) reqObj.channelName = this.channelName
    if (this.selectedDistrict) reqObj.district = this.selectedDistrict
    if (this.state) reqObj.state = this.state
    if (this.selectedDistrict) reqObj.instituteName = this.createAccountForm.get('instituteName')?.value

    this.uploadSaveData = true


    if (this.isOrgSelectiveCourse) {
      this.signupService
        .ssoWithMobileEmailOrgForm(reqObj)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          res => this.handleSignupSuccess(res, 'mobile'),
          err => this.handleSignupError(err)
        )
    } else {
      this.signupService
        .ssoWithMobileEmail(reqObj)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          res => this.handleSignupSuccess(res, 'mobile'),
          err => this.handleSignupError(err)
        )
    }
  }


  private fireAccountCreatedTelemetry(type: 'email' | 'mobile'): void {
    this.telemetrySvc.registrationInteract(
      { id: localStorage.getItem('telemetrySessionId') || '', type: 'Guest user' },
      'create-account',
      { type: 'TOUCH', subtype: 'CONFIRMED-clicked', id: 'create-account', pageid: 'create-account', extra: { pos: [], values: [{ option: type }] } },
      undefined,
      {
        referrer: document.referrer || undefined,
        screenWidth: screen.width,
        screenHeight: screen.height,
        language: navigator.language,
        utmParams: this.userAgentSvc.getUtmParams(),
      },
    )
  }

  private handleSignupSuccess(res: any, type: 'email' | 'mobile'): void {
    if (res.message === 'User successfully created') {
      const geo = this.userAgentSvc.getStoredGeolocation()
      if (geo) {
        this.fireAccountCreatedTelemetry(type)
      } else {
        // Geo permission just granted but callback hasn't fired yet — wait up to 3s
        const waited = { done: false }
        const interval = setInterval(() => {
          if (this.userAgentSvc.getStoredGeolocation() || waited.done) {
            clearInterval(interval)
            waited.done = true
            this.fireAccountCreatedTelemetry(type)
          }
        }, 300)
        setTimeout(() => {
          if (!waited.done) {
            clearInterval(interval)
            waited.done = true
            this.fireAccountCreatedTelemetry(type)
          }
        }, 3000)
      }
      this.trackFacebookPixel(type)
      this.openSnackbar(this.translate.instant(res.message))
      this.navigateToOtpPage()
      localStorage.setItem(STORAGE_KEYS.userUUID, res.userId)
    } else if (res.status === 'error') {
      this.openSnackbar(this.translate.instant(res.message))
    }

    this.loader.changeLoad.next(false)
    this.uploadSaveData = false
  }

  private handleSignupError(err: any): void {
    this.setPageState(false, true, false, false)
    this.loader.changeLoad.next(false)
    this.uploadSaveData = false

    const errorMsg = err.error?.msg || err.error?.message || 'An error occurred'
    this.openSnackbar(this.translate.instant(errorMsg))
    this.userExist()
  }

  private navigateToOtpPage(): void {
    this.showAllFields = false
    this.setPageState(false, false, false, true)
  }

  // Helper methods
  private trackFacebookPixel(type: 'email' | 'mobile'): void {
    try {
      (window as any).fbq?.('track', 'CompleteRegistration', { content_category: type })
    } catch (error) {
      this.logger.error('Facebook pixel error:', error)
    }
  }

  private openSnackbar(message: string, duration = 3000): void {
    this.snackBar.open(message, undefined, { duration })
  }

  private navigateToLogin(): void {
    const loginUrl = localStorage.getItem(STORAGE_KEYS.loginUrl)

    if (loginUrl) {
      window.location.href = loginUrl
      return
    }

    if (
      localStorage.getItem(STORAGE_KEYS.urlBeforeLogin) &&
      this.router.url === '/public/home'
    ) {
      localStorage.removeItem(STORAGE_KEYS.urlBeforeLogin)
    }

    this.router.navigateByUrl('/public/login')
  }

  // Language management
  preferredLanguageChange(event: string): void {
    const language: Language = event === 'hi'
      ? { id: 'hi', lang: 'हिंदी' }
      : { id: 'en', lang: 'English' }

    this.updateLanguagePreference(language)
  }

  private updateLanguagePreference(language: Language): void {
    localStorage.removeItem(STORAGE_KEYS.preferredLanguage)
    this.preferedLanguage = language
    this.preferredLanguage = language.id
    localStorage.setItem(STORAGE_KEYS.preferredLanguage, JSON.stringify(language))

    // Use LanguageService to set the language instead of reloading the page
    this.languageService.setLanguage(language.id)
  }

  // Form control getters
  private get passwordControl(): AbstractControl | null {
    return this.createAccountWithPasswordForm.get('password')
  }

  private get emailOrMobileControl(): AbstractControl | null {
    return this.createAccountForm.get('emailOrMobile')
  }

  get emailOrMobileErrorStatus(): string {
    const control = this.emailOrMobileControl

    if (!control || control.valid || this.emailDelaid) {
      return ''
    }

    if (control.hasError('required') && (control.dirty || control.touched)) {
      return 'required'
    }

    if (control.hasError('pattern')) {
      return 'pattern'
    }

    return ''
  }

  // Event tracking (kept for compatibility)
  eventTrigger(p1: string, p2: string, form?: any): void {
    if (!form) return

    const eventData = {
      EventDetails: {
        EventName: p1,
        Name: p2,
      },
    }

    try {
      const mainVisitorDetails = (window as any).MainVisitorDetails || {}
      const userdata = { ...mainVisitorDetails, ...eventData }

      const formData = {
        FormInfoDetails: {
          FormId: 7,
          OTPFormId: 0,
          FormType: 1,
          BannerId: 0,
          RedirectUrl: '',
          Name: '',
          EmailId: '',
        },
        answerDetails: [
          form.value.firstname.trim(),
          form.value.lastname.trim(),
          this.emailPhoneType === 'email' ? form.value.emailOrMobile.trim() : '',
          this.emailPhoneType === 'phone' ? form.value.emailOrMobile.trim() : '',
        ],
        MainVisitorDetails: userdata,
      }

      forkJoin([
        this.signupService.plumb5SendEvent(userdata),
        this.signupService.plumb5SendForm(formData),
      ])
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          res => this.logger.log('Event tracking success:', res),
          err => this.logger.error('Event tracking error:', err)
        )
    } catch (error) {
      this.logger.error('Error in event tracking:', error)
    }
  }

  // Form reinitialization (for parent form visibility)
  showParentForm(event: string): void {
    if (event === 'true') {
      this.initializeFormFields()
    }
  }

  private initializeFormFields(): void {
    this.createAccountForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.pattern(REGEX_PATTERNS.name)]],
      lastname: ['', [Validators.required, Validators.pattern(REGEX_PATTERNS.name)]],
    })

    this.otpCodeForm = this.fb.group({
      otpCode: ['', [Validators.required]],
    })
  }
}