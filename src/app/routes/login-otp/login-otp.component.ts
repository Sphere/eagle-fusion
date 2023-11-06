
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material'
import { SignupService } from '../signup/signup.service'
//import { Router } from '@angular/router'
//import { v4 as uuid } from 'uuid'
//import { UserProfileService } from 'project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
@Component({
  selector: 'ws-login-otp',
  templateUrl: './login-otp.component.html',
  styleUrls: ['./login-otp.component.scss'],
})
export class LoginOtpComponent implements OnInit {
  [x: string]: any
  isLoading = false
  loginOtpForm: FormGroup
  @Input() signUpdata: any
  @Input() loginData: any
  @Output() redirectToParent = new EventEmitter()
  emailPhoneType: any = 'phone'
  loginVerification = false
  redirectUrl = ''
  constructor(
    //private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private signupService: SignupService,
    //private userProfileSvc: UserProfileService,

  ) {
    this.loginOtpForm = this.fb.group({
      code: new FormControl('', [Validators.required]),
    })
  }

  ngOnInit() {
    // let x = localStorage.getItem(`userUUID`) || ''
    // console.log(x)
    // setTimeout(() => {
    //   this.userProfileSvc.getUserdetailsFromRegistry(x).subscribe((result: any) => {
    //     console.log(result)
    //   })
    // }, 2000)
    if (this.signUpdata || this.loginData) {
      sessionStorage.setItem('fromOTPpage', 'true')
      let phone = this.signUpdata ? this.signUpdata.value.emailOrMobile : this.loginData.value.username
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
    if (this.loginData) {
      this.loginVerification = true
    }

  }

  redirectToSignUp() {
    this.redirectToParent.emit('true')
  }

  redirectToMobileLogin() {
    this.redirectToParent.emit('true')
  }

  async verifyOtp() {
    let request: any = []
    let phone = this.signUpdata.value.emailOrMobile
    console.log(this.signUpdata.value)
    phone = phone.replace(/[^0-9+#]/g, '')
    // at least 10 in number
    if (phone.length >= 10) {
      request = {
        phone: this.signUpdata.value.emailOrMobile,
        password: this.signUpdata.value.password,
        otp: this.loginOtpForm.value.code,
        userId: localStorage.getItem(`userUUID`),
      }

    } else if (/^[a-zA-Z0-9.!#$%&'+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)$/.test(
      this.signUpdata.value.emailOrMobile)) {
      request = {
        email: this.signUpdata.value.emailOrMobile,
        password: this.signUpdata.value.password,
        otp: this.loginOtpForm.value.code,
        userId: localStorage.getItem(`userUUID`),
      }
    }
    this.isLoading = true
    //this.signupService.validateOtp(request).subscribe(
    this.signupService.ssoValidateOTP(request).subscribe(
      async (res: any) => {
        let res1 = await res
        console.log(res1)
        let url = `${document.baseURI}`
        //   await this.signupService.fetchStartUpDetails()
        //this.openSnackbar(res.msg)
        // this.router.navigate(['app/login'], { queryParams: { source: 'register' } })
        //const state = uuid()
        //const nonce = uuid()
        sessionStorage.setItem('login-btn', 'clicked')
        // if (url.includes('hi')) {
        //   url = url.replace('hi/', '')
        //   this.redirectUrl = `${url}openid/keycloak`
        //   sessionStorage.setItem('lang', 'hi')
        // } else {
        //   this.redirectUrl = `${url}openid/keycloak`
        // }
        if (localStorage.getItem('preferedLanguage')) {
          let data: any
          let lang: any
          data = localStorage.getItem('preferedLanguage')
          lang = JSON.parse(data)
          if (lang.id) {
            lang = lang.id !== 'en' ? lang.id : ''
            if (url.includes('hi')) {
              url = url.replace('hi/', '')
            }
            url = `${url}${lang}/app/new-tnc`
            console.log(this.preferedLanguage, data)
            if (lang) {

              console.log(lang)
              if (lang === 'hi') {
                console.log('enb')
                if (res1.msg === 'Success ! User is sucessfully authenticated.') {
                  const msg = 'सफलता! उपयोगकर्ता सफलतापूर्वक प्रमाणित हो गया है.'
                  this.openSnackbar(msg)
                }
              } else {
                this.openSnackbar(res1.msg)
              }
            } else {
              this.openSnackbar(res1.msg)
            }
            this.isLoading = false
            window.location.href = url
            //this.router.navigate([url, 'new-tnc'])
          }
        } else {
          this.openSnackbar(res1.msg)
          //this.router.navigate(['app', 'new-tnc'])
          window.location.href = `${url}app/new-tnc`
          this.isLoading = false
        }
        // this.signupService.fetchStartUpDetails().then(result => {
        //   console.log(result)
        //   if (result.userId) {
        //     console.log(result.userID)
        //     setTimeout(() => {
        //       this.userProfileSvc.getUserdetailsFromRegistry(result.userId).subscribe(
        //         (data: any) => {
        //           console.log(data, data.profileDetails!.profileReq!.personalDetails!.dob)
        //           if (data.profileDetails!.profileReq!.personalDetails!.dob === undefined) {
        //             if (localStorage.getItem('preferedLanguage')) {
        //               let data: any
        //               let lang: any
        //               data = localStorage.getItem('preferedLanguage')
        //               lang = JSON.parse(data)
        //               if (lang.id) {
        //                 lang = lang.id !== 'en' ? lang.id : ''
        //                 if (url.includes('hi')) {
        //                   url = url.replace('hi/', '')
        //                 }
        //                 url = `${url}${lang.id}/app/new-tnc`
        //                 this.isLoading = false
        //                 window.location.href = url
        //                 //this.router.navigate([url, 'new-tnc'])
        //               }
        //             } else {
        //               this.isLoading = false
        //               this.router.navigate(['app', 'new-tnc'])
        //             }
        //           }
        //         })
        //     }, 1000)
        //   }
        // })
        // tslint:disable-next-line:max-line-length
        //const keycloakurl = `${url}auth/realms/sunbird/protocol/openid-connect/auth?client_id=portal&redirect_uri=${encodeURIComponent(this.redirectUrl)}&state=${state}&response_mode=fragment&response_type=code&scope=openid&nonce=${nonce}`
        //window.location.href = keycloakurl
      },
      (err: any) => {
        this.isLoading = false
        if (localStorage.getItem(`preferedLanguage`)) {
          const reqObj = localStorage.getItem(`preferedLanguage`) || ''
          const lang = JSON.parse(reqObj) || ''
          if (lang.id === 'hi') {
            if (err.error.message === 'Please provide correct otp and try again.') {
              const err = 'कृपया सही ओटीपी प्रदान करें और पुनः प्रयास करें।'
              this.openSnackbar(err)
            }
          } else {
            this.openSnackbar(err.error.error || err.error.message)
          }
        } else {
          this.openSnackbar(err.error.error || err.error.message)
        }
      })
  }

  async loginVerifyOtp() {
    let request: any = []
    const username = this.loginData.value.username
    if (!username.includes('@')) {
      request = {
        phone: this.loginData.value.username,
        password: this.loginData.value.password,
        otp: this.loginOtpForm.value.code,
        userId: localStorage.getItem(`userUUID`),
      }

    } else {
      request = {
        email: this.loginData.value.username,
        password: this.loginData.value.password,
        otp: this.loginOtpForm.value.code,
        userId: localStorage.getItem(`userUUID`),
      }
    }
    //this.signupService.validateOtp(request).subscribe(
    this.signupService.ssoValidateOTP(request).subscribe(
      async (res: any) => {
        console.log(res, '2')
        this.openSnackbar(res.message)
        // localStorage.removeItem('preferedLanguage')
        //location.href = '/page/home'
        return res
      },
      (err: any) => {
        this.openSnackbar(err.error.error || err.error.message)
      })

  }

  resendOTP(emailPhoneType: string) {
    this.isLoading = true
    let requestBody
    if (emailPhoneType === 'email') {
      requestBody = {
        email: this.signUpdata ? this.signUpdata.value.emailOrMobile : this.loginData.value.username,
      }
    } else {
      requestBody = {
        phone: this.signUpdata ? this.signUpdata.value.emailOrMobile : this.loginData.value.username,
      }
    }
    this.signupService.generateOtp(requestBody).subscribe(
      async (res: any) => {
        this.isLoading = false
        let res1 = res
        //this.openSnackbar(res.message)
        if (this.preferedLanguage || localStorage.getItem('preferedLanguage')) {
          const reqObj = this.preferedLanguage || localStorage.getItem('preferedLanguage')
          const lang = JSON.parse(reqObj) || ''
          if (lang.id === 'hi') {
            if (res1.message === 'Success ! Please verify the OTP .') {
              const msg = 'सफलता ! कृपया ओटीपी सत्यापित करें।'
              this.openSnackbar(msg)
            }
          } else {
            this.openSnackbar(res1.message)
          }
        } else {
          this.openSnackbar(res1.message)
        }
        // localStorage.removeItem('preferedLanguage')
      },
      (err: any) => {
        this.isLoading = false
        if (localStorage.getItem(`preferedLanguage`)) {
          const reqObj = localStorage.getItem(`preferedLanguage`) || ''
          const lang = JSON.parse(reqObj) || ''
          if (lang.id === 'hi') {
            if (err.error.message === 'Please provide correct otp and try again.') {
              const err = 'कृपया सही ओटीपी प्रदान करें और पुनः प्रयास करें।'
              this.openSnackbar(err)
            }
          } else {
            this.openSnackbar(err.error.error || err.error.message)
          }
        } else {
          this.openSnackbar(err.error.error || err.error.message)
        }

        // this.openSnackbar(`OTP Error`, + err.error.message)
      }
    )
  }

  private openSnackbar(primaryMsg: string, duration: number = 3000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }

}
