import {
  Component, OnInit, ElementRef, AfterViewInit,
  ViewChild,
} from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { WidgetContentService } from '@ws-widget/collection'
import { Location } from '@angular/common'
import { MatSnackBar } from '@angular/material'
import { SignupService } from '../signup/signup.service'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
declare const gapi: any

@Component({
  selector: 'ws-mobile-login',
  templateUrl: './mobile-login.component.html',
  styleUrls: ['./mobile-login.component.scss'],
})
export class MobileLoginComponent implements OnInit, AfterViewInit {
  @ViewChild('myDiv', { static: true }) myDiv!: ElementRef<any>
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  loginForm: FormGroup
  hide = true
  iconChange = faEyeSlash
  public route: string
  emailPhoneType: any
  constructor(
    private fb: FormBuilder,
    // private element: ElementRef,
    private router: Router,
    private contentSvc: WidgetContentService,
    location: Location,
    private snackBar: MatSnackBar,
    private signupService: SignupService
  ) {
    this.route = location.path()
    this.loginForm = this.fb.group({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    })
  }
  public isSignedIn = false
  public signinURL = ''
  private clientId = '770679530323-dla42fvs5g7ilep9912q3aj67678kabv.apps.googleusercontent.com'
  private scope = [
    'profile',
    'email',
    'https://www.googleapis.com/auth/plus.me',
    'https://www.googleapis.com/auth/contacts.readonly',
    'https://www.googleapis.com/auth/admin.directory.user.readonly',
  ].join(' ')
  elem: HTMLElement = document.getElementById('googleBtn') as HTMLElement
  public auth2: any
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

  public signinChanged(val: any) {
    sessionStorage.setItem(`google_isSignedIn`, val)
  }

  public userChanged(user: any) {
    sessionStorage.setItem(`google_token`, user.getAuthResponse().id_token)
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
    const storageItem1 = sessionStorage.getItem(`google_token`)
    const storageItem2 = sessionStorage.getItem(`google_isSignedIn`)
    if (storageItem2 === 'true' && this.route === '/google/callback') {
      this.signinURL = `https://oauth2.googleapis.com/tokeninfo?id_token=${storageItem1}`
      this.isSignedIn = true
      const req = {
        idToken: storageItem1,
      }
      this.contentSvc.googleAuthenticate(req).subscribe(
        async (results: any) => {
          this.openSnackbar(results.msg)
          await this.signupService.fetchStartUpDetails()
          this.router.navigate(['/page/home'])
        },
        (err: any) => {
          this.openSnackbar(err.error)
          this.router.navigate(['/app/login'])
        }
      )
    }
  }

  ngAfterViewInit() {
    this.googleInit()
  }

  toggle() {
    this.hide = !this.hide
    if (this.hide) {
      this.iconChange = faEyeSlash
    } else {
      this.iconChange = faEye
    }
  }
  loginUser() {
    let phone = this.loginForm.value.username
    const validphone = /^[6-9]\d{9}$/.test(phone)
    const alphaNumeric = /^[a-zA-Z0-9] +$/i.test(phone)
    phone = phone.replace(/[^0-9+#]/g, '')
    const email = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
      this.loginForm.value.username)
    if (!validphone && phone !== '') {
      this.openSnackbar('Enter valid Phone Number')
    }
    if (!email && !validphone) {
      this.openSnackbar('Enter valid email address')
    }
    if (phone.length < 10 && phone !== '' && alphaNumeric) {
      this.openSnackbar('Enter 10 digits Phone Number')
    }
    // at least 10 in number
    if (phone.length >= 10) {
      this.emailPhoneType = 'phone'
    } else {
      if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
        this.loginForm.value.username)) {
        this.emailPhoneType = 'email'
      }
    }
    let req
    if (this.emailPhoneType === 'email') {
      req = {
        email: this.loginForm.value.username,
        password: this.loginForm.value.password,
      }
    } else {
      req = {
        email: this.loginForm.value.username,
        mobileNumber: this.loginForm.value.password,
      }
    }
    this.contentSvc.loginAuth(req).subscribe(
      async (results: any) => {
        this.openSnackbar(results.msg)
        await this.signupService.fetchStartUpDetails()
        this.router.navigate(['/page/home'])
      },
      (err: any) => {
        this.openSnackbar(err.error.error)
      }
    )
  }
  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }
}
