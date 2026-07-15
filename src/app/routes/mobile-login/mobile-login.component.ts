import {
  Component, OnInit, ElementRef, AfterViewInit,
  ViewChild,
} from '@angular/core'
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { WidgetContentService } from '@ws-widget/collection'
import { Location, PlatformLocation } from '@angular/common'
import { MatSnackBar } from '@angular/material/snack-bar'
import { SignupService } from '../signup/signup.service'
import { ConfigCacheService } from '../../services/config-cache.service'

declare const gapi: any

@Component({
    standalone: false,
    selector: 'ws-mobile-login',
    templateUrl: './mobile-login.component.html',
    styleUrls: ['./mobile-login.component.scss'],
    
})
export class MobileLoginComponent implements OnInit, AfterViewInit {
  [x: string]: any
  constructor(
    private readonly fb: UntypedFormBuilder,
    private readonly router: Router,
    private readonly contentSvc: WidgetContentService,
    location: Location,
    loc: PlatformLocation,
    private readonly snackBar: MatSnackBar,
    private readonly signupService: SignupService,
    private readonly configCacheSvc: ConfigCacheService,
    private readonly activeRoute: ActivatedRoute
  ) {
    this.route = location.path()
    this.loginForm = this.fb.group({
      // tslint:disable-next-line:max-line-length
      username: new UntypedFormControl('', [Validators.required, Validators.pattern(/^(([- ]*)[6-9][0-9]{9}([- ]*)|^[a-zA-Z0-9 .!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9 ]([- ]*))?)*$)$/)]),
      password: new UntypedFormControl('', [Validators.required]),
    })
    loc.onPopState(() => {
      window.location.href = '/public/home'
      // window.location.reload()
    })
  }
  @ViewChild('myDiv', { static: true }) myDiv!: ElementRef<any>
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  loginForm: UntypedFormGroup
  hide = true
  iconChange = 'fas fa-eye-slash'
  public route: string
  emailPhoneType: any
  errorMessage = ''
  googleAuth = false
  source = ''
  otpPage = false
  uploadSaveData = false
  showAllFields = true
  loginVerification = false
  redirectMsg = 'Please verify your account before logged in !!'

  public isSignedIn = false
  public signinURL = ''
  private clientId = '836909204939-r7u6cn00eprhv6ie7ota38ndp34m690l.apps.googleusercontent.com'
  private scope = [
    'profile',
    'email',
    'https://www.googleapis.com/auth/plus.me',
    'https://www.googleapis.com/auth/admin.directory.user.readonly',
  ].join(' ')
  elem: HTMLElement = document.getElementById('googleBtn') as HTMLElement
  public auth2: any

  checkGoogleAuth() {
    this.configCacheSvc.getHostConfig().subscribe((data: any) => {
      if (data) { this.googleAuth = data.googleAuth }
    })
  }

  public signinChanged(val: any) {
    localStorage.removeItem('google_isSignedIn')
    localStorage.setItem(`google_isSignedIn`, val)
  }

  public userChanged(user: any) {
    localStorage.removeItem('google_token')
    localStorage.setItem(`google_token`, user.getAuthResponse().id_token)
    location.reload()
  }

  public attachSignin(element: any) {
    this.auth2.attachClickHandler(element, {},
      (googleUser: any) => {
        // @ts-ignore
        const profile = googleUser.getBasicProfile()
        this.logger.log('Google user profile loaded:', profile.getEmail())
      },
      (error: any) => {
        // tslint:disable-next-line:no-console
        this.logger.log(JSON.stringify(error, undefined, 2))
      })
  }
  ngOnInit() {
    if (this.signUpdata) {
      let phone = this.signUpdata.value.emailOrMobile
      phone = phone.replace(/[^0-9+#]/g, '')
      if (phone.length >= 10) {
        this.emailPhoneType = 'phone'
      } else {
        this.emailPhoneType = 'email'
      }
    }
    if (window.location.href.includes('email-otp')) {
      this.emailPhoneType = 'email'
    }

    this.activeRoute.queryParams.subscribe(params => {
      this.source = params.source
    }
    )

    this.checkGoogleAuth()
    const storageItem1 = localStorage.getItem(`google_token`)
    const storageItem2 = localStorage.getItem(`google_isSignedIn`)
    if (storageItem1 && storageItem2 && this.googleAuth) {
      const req = {
        idToken: storageItem1,
      }
      this.contentSvc.googleAuthenticate(req).subscribe(
        async (results: any) => {
          const result = await this.signupService.fetchStartUpDetails()
          if (result.status === 401) {
            this.openSnackbar(result.error.params.errmsg)
          }
          if (result.status === 419) {
            this.openSnackbar(result.error.params.errmsg)
          }
          if (result.status === 200 && result.roles.length > 0) {
            this.openSnackbar(results.msg)
            if (localStorage.getItem('url_before_login')) {
              location.href = localStorage.getItem('url_before_login') || ''
            } else {
              location.href = '/page/home'
            }
          }
        },
        (err: any) => {
          this.logger.log(err)
          this.router.navigate(['/app/login'])
        }
      )
    }
  }

  public googleInit() {
    gapi.load('auth2', () => {
      this.auth2 = gapi.auth2.init({
        client_id: this.clientId,
        cookie_policy: 'single_host_origin',
        scope: this.scope,
        ux_mode: 'redirect',
        redirect_uri: `${location.origin}/google/callback`,
      })
      this.attachSignin(this.myDiv.nativeElement)
      this.auth2.isSignedIn.listen(this.signinChanged)
      this.auth2.currentUser.listen(this.userChanged)
    })
  }

  ngAfterViewInit() {
    if (this.googleAuth) {
      this.googleInit()
    }
  }

  toggle() {
    this.hide = !this.hide
    if (this.hide) {
      this.iconChange = 'fas fa-eye-slash'
    } else {
      this.iconChange = 'fas fa-eye'
    }
  }
  loginUser() {
    let phone = this.loginForm.value.username
    phone = phone.replace(/[^0-9+#]/g, '')
    // at least 10 in number
    if (phone.length >= 10) {
      this.emailPhoneType = 'phone'
    } else {
      if (/^[a-zA-Z0-9 .!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9- ]+)*$/.test(
        this.loginForm.value.username)) {
        this.emailPhoneType = 'email'
      }
    }
    let req
    if (this.emailPhoneType === 'email') {
      req = {
        email: this.loginForm.value.username.trim(),
        password: this.loginForm.value.password.trim(),
      }
    } else {
      req = {
        mobileNumber: this.loginForm.value.username.trim(),
        password: this.loginForm.value.password.trim(),
      }
    }
    this.contentSvc.loginAuth(req).subscribe(
      async (results: any) => {
        const result = await this.signupService.fetchStartUpDetails()
        if (result.status === 200) {
          // resendOTP();
          if (result.roles && result.roles.length > 0) {
            localStorage.setItem(`loginbtn`, `userLoggedIn`)
            this.openSnackbar(results.msg)
            if (localStorage.getItem('url_before_login')) {
              location.href = localStorage.getItem('url_before_login') || ''
            } else {
              location.href = '/page/home'
            }
          } else {
            this.openSnackbar(this.redirectMsg)
            this.otpPage = true
            this.loginVerification = true
            localStorage.setItem(`userUUID`, result.userId)
            this.generateOtp(this.emailPhoneType, this.loginForm.value.username.trim())
          }
        }
        if (result.status === 400) {
          this.openSnackbar(result.error.params.errmsg)
        }
        if (result.status === 401) {
          this.openSnackbar(result.error.params.errmsg)
        }
        if (result.status === 419) {
          this.openSnackbar(result.error.params.errmsg)
        }
      })
  }
  redirect(lang: string) {
    // Language switching via LanguageService instead of URL-based routing
    // No need to construct URLs with language prefix; ngx-translate handles it
    if (lang) {
      this.router.navigate(['/page/home'])
    }
  }

  private openSnackbar(primaryMsg: string, duration = 3000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }

  generateOtp(type: any, username: any) {
    let requestBody
    if (type === 'email') {
      requestBody = {
        email: username,
      }
    } else {
      requestBody = {
        mobileNumber: username,
      }
    }

    this.signupService.generateOtp(requestBody).subscribe(
      (res: any) => {
        if (res.message === 'Success') {
          this.logger.log('OTP generated successfully')
        }
      },
      (err: any) => {
        this.openSnackbar(err)
      }
    )
  }

  showParentForm(event: any) {
    if (event === 'true') {
      this.loginVerification = true
    }
  }

}
