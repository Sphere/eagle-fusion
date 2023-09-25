import { Component, OnInit } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { OrgServiceService } from '../../../../../project/ws/app/src/lib/routes/org/org-service.service'
import { SignupService } from 'src/app/routes/signup/signup.service'
import { AuthKeycloakService } from 'library/ws-widget/utils/src/lib/services/auth-keycloak.service'
import { ConfigurationsService } from '@ws-widget/utils'
import { UserProfileService } from 'project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
@Component({
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
    private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
  ) { }

  ngOnInit() {
    const loginBtn = sessionStorage.getItem('login-btn') || null
    const code = sessionStorage.getItem('code') || null
    if (loginBtn === 'clicked' || code) {
      this.isLoading = true
      this.checkKeycloakCallback()
    } else {
      console.log('ppp')
      this.signupService.fetchStartUpDetails().then(async result => {
        let res = await result
        console.log(res, '8800  88')
      })
    }
  }

  checkKeycloakCallback() {
    const code = sessionStorage.getItem('code') || null
    if (code !== null) {
      try {
        this.orgService.setConnectSid(code).subscribe(async (res: any) => {
          if (res) {
            debugger
            // console.log(res)
            // sessionStorage.clear()
            sessionStorage.removeItem('code')
            setTimeout(() => {
              this.signupService.fetchStartUpDetails().then(async result => {
                // tslint:disable-next-line:no-console
                console.log(result, 'keycloak')
                let res = await result
                console.log(res, '8888')
                if (result && result.status === 200 && result.roles.length > 0) {
                  if (this.configSvc.unMappedUser.profileDetails && this.configSvc.unMappedUser.profileDetails.preferences && this.configSvc.unMappedUser.profileDetails.preferences.language) {
                    let lang = this.configSvc.unMappedUser.profileDetails.preferences!.language
                    console.log(`${lang}`)
                    lang = lang !== 'en' ? lang : ''
                    let url = localStorage.getItem('url_before_login') || ''
                    if (localStorage.getItem('url_before_login')) {
                      console.log(`${lang}/${url}`, '1')
                      // location.href = `${lang}/${url}`
                    } else {
                      url = '/page/home'
                      console.log(`${url}`, '2')
                      //window.location.href = `${lang}${url}`
                    }
                  } else {
                    if (localStorage.getItem('preferedLanguage')) {
                      let data: any
                      let lang: any
                      data = localStorage.getItem('preferedLanguage')
                      lang = JSON.parse(data)
                      lang = lang.id !== 'en' ? lang.id : ''
                      let url = localStorage.getItem('url_before_login') || ''
                      if (localStorage.getItem('url_before_login')) {
                        console.log(`${lang}/${url}`, '3')
                        //location.href = `${lang}/${url}`
                      } else {
                        //url = '/page/home'
                        console.log(`${lang}/${url}`, '4')
                        //window.location.href = `${lang}${url}`
                      }
                    } else {
                      if (localStorage.getItem('url_before_login')) {
                        // window.location.href = localStorage.getItem('url_before_login') || ''

                        const url = localStorage.getItem('url_before_login') || ''
                        // localStorage.removeItem('url_before_login')
                        console.log(`${url}`, '5')
                        //location.href = url
                      } else {
                        console.log('6')
                        //window.location.href = '/page/home'
                      }
                    }
                  }
                  this.isLoading = false
                } else {
                  console.log(this.configSvc.unMappedUser, 'key')
                  if (result && result.status === 200 && result.roles.length === 0) {
                    this.userProfileSvc.getUserdetailsFromRegistry(result.userId).subscribe(
                      async (data: any) => {
                        let da = await data
                        console.log(da, '108-key')
                        if (data.profileDetails && data.profileDetails.preferences && data.profileDetails.preferences.language) {
                          let lang = await data.profileDetails.preferences.language
                          console.log(`${lang}`, '111')
                          lang = lang !== 'en' ? lang : ''
                          //let url = localStorage.getItem('url_before_login') || ''
                          if (localStorage.getItem('url_before_login')) {
                            console.log(lang, '7')
                            //location.href = `${lang}/${url}`
                          } else {
                            //url = '/page/home'
                            console.log('8')
                            //window.location.href = `${lang}${url}`
                          }
                        } else {
                          if (localStorage.getItem('preferedLanguage')) {
                            let data: any
                            let lang: any
                            data = localStorage.getItem('preferedLanguage')
                            lang = JSON.parse(data)
                            lang = lang.id !== 'en' ? lang.id : ''
                            //let url = localStorage.getItem('url_before_login') || ''
                            if (localStorage.getItem('url_before_login')) {
                              //location.href = `${lang}/${url}`
                              console.log(lang, '9')
                            } else {
                              //url = '/page/home'
                              console.log('10')
                              //window.location.href = `${lang}${url}`
                            }
                          } else {
                            if (localStorage.getItem('url_before_login')) {
                              // window.location.href = localStorage.getItem('url_before_login') || ''

                              //const url = localStorage.getItem('url_before_login') || ''

                              console.log('11')
                              // localStorage.removeItem('url_before_login')
                              //location.href = url
                            } else {
                              console.log('12')
                              //window.location.href = '/page/home'
                            }
                          }
                        }
                        this.isLoading = false
                      })
                  } else {
                    console.log('13', 'logout')
                    //this.authSvc.logout()
                  }
                  // window.location.href = '/public/home'
                }
                if (result.status === 419) {
                  this.authSvc.logout()
                  this.snackBarSvc.open(result.params.errmsg)
                  // window.location.href = '/public/home'
                }
                // if (localStorage.getItem('url_before_login')) {
                //   location.href = localStorage.getItem('url_before_login') || ''
                // } else {
                //   location.href = '/page/home'
                // }
              })
            }, 800)
          }
        }, (err: any) => {
          // console.log(err)
          // tslint:disable-next-line:no-console
          console.log(err)
          if (err.status === 400) {
            // sessionStorage.clear()
            this.authSvc.logout()
            // this.snackBarSvc.open(err.error.error)
            // ocation.href = '/public/home'
          }
        })
      } catch (err) {
        // tslint:disable-next-line:no-console
        console.log(err)
        //this.authSvc.logout()
        // alert('Error Occured while logging in')
        // location.href = "/public/home"
      }
    }
    // else {
    //   console.log(this.configSvc.unMappedUser.profileDetails)
    //   //console.log(this.configSvc.unMappedUser.profileDetails.preferences)
    //   if (this.configSvc.unMappedUser.profileDetails && this.configSvc.unMappedUser.profileDetails.preferences) {
    //     let lang = this.configSvc.unMappedUser.profileDetails.preferences!.language
    //     //console.log(this.configSvc.unMappedUser)
    //     console.log(`${lang}`)
    //   }
    //   this.signupService.fetchStartUpDetails().then(result => {
    //     // tslint:disable-next-line:no-console
    //     console.log(result)
    //   })
    // }
  }
  // private openSnackbar(primaryMsg: string, duration: number = 3000) {
  //   this.snackBar.open(primaryMsg, undefined, {
  //     duration,
  //   })
  // }

}
