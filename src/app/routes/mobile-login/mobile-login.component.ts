import {
  Component, OnInit, ElementRef, AfterViewInit,
  ViewChild,
} from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { WidgetContentService } from '@ws-widget/collection'
import { Location, PlatformLocation } from '@angular/common'
import { MatSnackBar } from '@angular/material'
import { SignupService } from '../signup/signup.service'
import { HttpClient } from '@angular/common/http'

declare const gapi: any

@Component({
  selector: 'ws-mobile-login',
  templateUrl: './mobile-login.component.html',
  styleUrls: ['./mobile-login.component.scss'],
})
export class MobileLoginComponent implements OnInit, AfterViewInit {
  constructor(
    private fb: FormBuilder,
    // private element: ElementRef,
    private router: Router,
    private contentSvc: WidgetContentService,
    location: Location,
    loc: PlatformLocation,
    private snackBar: MatSnackBar,
    private signupService: SignupService,
    private http: HttpClient,
    private activeRoute: ActivatedRoute
  ) {
    this.route = location.path()
    this.loginForm = this.fb.group({
      // tslint:disable-next-line:max-line-length
      username: new FormControl('', [Validators.required, Validators.pattern(/^(([- ]*)[6-9][0-9]{9}([- ]*)|^[a-zA-Z0-9 .!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9 ]([- ]*))?)*$)$/)]),
      password: new FormControl('', [Validators.required]),
    })
    loc.onPopState(() => {
      window.location.href = '/public/home'
      // window.location.reload()
    })
  }
  @ViewChild('myDiv', { static: true }) myDiv!: ElementRef<any>
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  loginForm: FormGroup
  hide = true
  iconChange = 'fas fa-eye-slash'
  public route: string
  emailPhoneType: any
  errorMessage = ''
  googleAuth = false
  private baseUrl = 'assets/configurations'
  source = ''
  public isSignedIn = false
  public signinURL = ''
  private clientId = '836909204939-r7u6cn00eprhv6ie7ota38ndp34m690l.apps.googleusercontent.com'
  // private clientId = '770679530323-dla42fvs5g7ilep9912q3aj67678kabv.apps.googleusercontent.com'
  private scope = [
    'profile',
    'email',
    'https://www.googleapis.com/auth/plus.me',
    'https://www.googleapis.com/auth/admin.directory.user.readonly',
  ].join(' ')
  elem: HTMLElement = document.getElementById('googleBtn') as HTMLElement
  public auth2: any

  checkGoogleAuth() {
    this.http.get(`${this.baseUrl}/host.config.json`).subscribe((data: any) => {
      this.googleAuth = data.googleAuth
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
        // tslint:disable-next-line:no-console
        // console.log(`Token || ` + googleUser.getAuthResponse().id_token)
        // tslint:disable-next-line:no-console
        // console.log(`ID: ` + profile.getId())
        // tslint:disable-next-line:no-console
        // console.log(`Name: ` + profile.getName())
        // tslint:disable-next-line:no-console
        // console.log(`Image URL: ` + profile.getImageUrl())
        // tslint:disable-next-line:no-console
        // console.log(`Email: ` + profile.getEmail())
      },
                                  (error: any) => {
        // tslint:disable-next-line:no-console
        console.log(JSON.stringify(error, undefined, 2))
      })
  }
  ngOnInit() {
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
          // tslint:disable-next-line:no-console
          console.log(err)
          // this.errorMessage = err.error
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
    // const validphone = /^([- ]*)[6-9]\d{9}([- ]*)$/.test(phone)
    // const alphaNumeric = /^[a-zA-Z0-9 ] +$/i.test(phone)
    phone = phone.replace(/[^0-9+#]/g, '')
    // const email = /^[a-zA-Z0-9 .!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9- ]+)*$/.test(
    //   this.loginForm.value.username)
    // if (!validphone && phone !== '') {
    //   this.openSnackbar('Enter valid Phone Number')
    // }
    // if (!email && !validphone) {
    //   // this.openSnackbar('Enter valid email address')
    //   this.errorMessage = 'Enter valid email address'
    // }
    // if (phone.length < 10 && phone !== '' && alphaNumeric) {
    //   // this.openSnackbar('Enter 10 digits Phone Number')
    //   this.errorMessage = 'Enter 10 digits Phone Number'
    // }
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

        if (result.status === 400) {
          this.openSnackbar(result.error.params.errmsg)
        }
        if (result.status === 401) {
          this.openSnackbar(result.error.params.errmsg)
        }
        if (result.status === 419) {
          this.openSnackbar(result.error.params.errmsg)
        }
        if (result.roles && result.roles.length > 0) {
          localStorage.setItem(`loginbtn`, `userLoggedIn`)
          this.openSnackbar(results.msg)
          if (localStorage.getItem('url_before_login')) {
            location.href = localStorage.getItem('url_before_login') || ''
          } else {
            location.href = '/page/home'
          }
        }
      },
      (err: any) => {
        // this.openSnackbar(err.error.error)
        // tslint:disable-next-line:no-console
        console.log(err.error.error)
        // this.errorMessage = 'Invalid username or password.'
        this.errorMessage = err.error.error
      }
    )
  }
  private openSnackbar(primaryMsg: string, duration: number = 3000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }
}
