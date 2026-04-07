import { Component, OnInit } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { OrgServiceService } from '../../../../../project/ws/app/src/lib/routes/org/org-service.service'
import { SignupService } from 'src/app/routes/signup/signup.service'
import { AuthKeycloakService } from 'library/ws-widget/utils/src/lib/services/auth-keycloak.service'
import { LoggerService } from '../../../../../library/ws-widget/utils/src/public-api'
//import { ConfigurationsService } from '@ws-widget/utils'
@Component({
    standalone: false,
    selector: 'ws-keycloak-callback',
    templateUrl: './keycloak-callback.component.html',
    styleUrls: ['./keycloak-callback.component.scss'],
    
})
export class KeycloakCallbackComponent implements OnInit {
  isLoading = false
  constructor(private orgService: OrgServiceService,
    private snackBarSvc: MatSnackBar,
    private signupService: SignupService,
    private authSvc: AuthKeycloakService,
    private logger: LoggerService
    //private configSvc: ConfigurationsService,
  ) { }

  ngOnInit() {
    const loginBtn = sessionStorage.getItem('login-btn') || null
    const code = sessionStorage.getItem('code') || null
    if (loginBtn === 'clicked' || code) {
      this.isLoading = true
      this.checkKeycloakCallback()
    } else {
      this.signupService.fetchStartUpDetails().then(result => {
        this.logger.log(result)
      })
    }
  }

  checkKeycloakCallback() {
    const code = sessionStorage.getItem('code') || null
    if (code !== null) {
      try {
        this.orgService.setConnectSid(code).subscribe(async (res: any) => {
          if (res) {
            // this.logger.log(res)
            // sessionStorage.clear()
            sessionStorage.removeItem('code')
            setTimeout(() => {
              this.signupService.fetchStartUpDetails().then(async result => {
                // tslint:disable-next-line:no-console
                this.logger.log(result)
                const res = await result
                if (res && res.status === 200
                  //&& res.roles.length > 0
                ) {
                  // ✅ NO language prefix in URLs - ngx-translate handles language via localStorage
                  if (res.language) {
                    const lang = res.language
                    const obj = {
                      lang: lang,
                      res: res.language,
                      line: 56,
                    }
                    sessionStorage.setItem('lang1', JSON.stringify(obj))
                    const url = localStorage.getItem('url_before_login') || '/page/home'
                    location.href = url
                  } else {
                    if (localStorage.getItem('preferedLanguage')) {
                      let data: any
                      let lang: any
                      data = localStorage.getItem('preferedLanguage')
                      lang = JSON.parse(data)
                      const obj = {
                        lang: lang.id,
                        line: 79,
                      }
                      sessionStorage.setItem('lang2', JSON.stringify(obj))

                      const url = localStorage.getItem('url_before_login') || '/page/home'
                      location.href = url
                    } else {
                      if (localStorage.getItem('url_before_login')) {
                        // window.location.href = localStorage.getItem('url_before_login') || ''

                        const url = localStorage.getItem('url_before_login') || ''
                        // localStorage.removeItem('url_before_login')
                        location.href = url
                      } else {
                        window.location.href = '/page/home'
                      }
                    }
                  }
                  // if (localStorage.getItem('url_before_login')) {
                  //   // window.location.href = localStorage.getItem('url_before_login') || ''
                  //   const url = localStorage.getItem('url_before_login') || ''
                  //   // localStorage.removeItem('url_before_login')
                  //   let lang = this.configSvc.unMappedUser.profileDetails.preferences!.language
                  //   this.logger.log(this.configSvc.unMappedUser)
                  //   this.logger.log(`${lang}/${url}`)
                  //   sessionStorage.setItem('r-url', `${lang}/${url}`)
                  //   // if (this.configSvc.unMappedUser.profileDetails.preferences!.language) {
                  //   //   let lang = this.configSvc.unMappedUser.profileDetails.preferences.language
                  //   //   location.href = `${lang}/${url}`
                  //   // } else {
                  //   //location.href = url
                  //   //}
                  // } else {
                  //   //window.location.href = '/page/home'
                  // }
                  this.isLoading = false
                } else {
                  this.authSvc.logout()
                  // window.location.href = '/public/home'
                }
                if (result.status === 419) {
                  this.snackBarSvc.open(result.params.errmsg)
                  this.authSvc.logout()
                  // window.location.href = '/public/home'
                }
                // if (localStorage.getItem('url_before_login')) {
                //   location.href = localStorage.getItem('url_before_login') || ''
                // } else {
                //   location.href = '/page/home'
                // }
              })
            }, 1000)
          }
        }, (err: any) => {
          // this.logger.log(err)
          // tslint:disable-next-line:no-console
          this.logger.log(err)
          if (err.status === 400) {
            // sessionStorage.clear()
            this.authSvc.logout()
            // this.snackBarSvc.open(err.error.error)
            // ocation.href = '/public/home'
          }
        })
      } catch (err) {
        // tslint:disable-next-line:no-console
        this.logger.log(err)
        this.authSvc.logout()
        // alert('Error Occured while logging in')
        // location.href = "/public/home"
      }
    }
    // else {
    //   this.logger.log(this.configSvc.unMappedUser.profileDetails)
    //   //this.logger.log(this.configSvc.unMappedUser.profileDetails.preferences)
    //   if (this.configSvc.unMappedUser.profileDetails && this.configSvc.unMappedUser.profileDetails.preferences) {
    //     let lang = this.configSvc.unMappedUser.profileDetails.preferences!.language
    //     //this.logger.log(this.configSvc.unMappedUser)
    //     this.logger.log(`${lang}`)
    //   }
    //   this.signupService.fetchStartUpDetails().then(result => {
    //     // tslint:disable-next-line:no-console
    //     this.logger.log(result)
    //   })
    // }
  }
  // private openSnackbar(primaryMsg: string, duration: number = 3000) {
  //   this.snackBar.open(primaryMsg, undefined, {
  //     duration,
  //   })
  // }

}