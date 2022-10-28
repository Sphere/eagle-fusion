import { Component, OnInit } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { OrgServiceService } from '../../../../../project/ws/app/src/lib/routes/org/org-service.service'
import { SignupService } from 'src/app/routes/signup/signup.service'
@Component({
  selector: 'ws-keycloak-callback',
  templateUrl: './keycloak-callback.component.html',
  styleUrls: ['./keycloak-callback.component.scss']
})
export class KeycloakCallbackComponent implements OnInit {
  isLoading = false
  constructor(private orgService: OrgServiceService, private snackBarSvc: MatSnackBar,
    private signupService: SignupService,
  ) { }



  async ngOnInit() {
    const loginBtn = sessionStorage.getItem('login-btn') || null
    if (loginBtn === 'clicked') {
      this.isLoading = true
      this.checkKeycloakCallback()
    }
  }
  checkKeycloakCallback() {
    const code = sessionStorage.getItem('code') || null
    // console.log(code)
    if (code !== null) {
      try {
        this.orgService.setConnectSid(code).subscribe(async (res: any) => {
          if (res) {
            // console.log(res)
            sessionStorage.clear()
            const result = await this.signupService.fetchStartUpDetails()
            // tslint:disable-next-line:no-console
            console.log(result)
            if (result.status === 200 && result.roles.length > 0) {
              //this.openSnackbar('logged in')
              if (localStorage.getItem('url_before_login')) {
                window.location.href = localStorage.getItem('url_before_login') || ''
                localStorage.removeItem('url_before_login')
              } else {
                window.location.href = '/page/home'
              }
              this.isLoading = false
            } else {
              window.location.href = "/public/home"
            }
            if (result.status === 419) {
              this.snackBarSvc.open(result.params.errmsg)
              window.location.href = "/public/home"
            }
            // if (localStorage.getItem('url_before_login')) {
            //   location.href = localStorage.getItem('url_before_login') || ''
            // } else {
            //   location.href = '/page/home'
            // }
          }
        }, (err: any) => {
          // console.log(err)
          // tslint:disable-next-line:no-console
          console.log(err)
          if (err.status === 400) {
            sessionStorage.clear()
            this.snackBarSvc.open(err.error.error)
            //location.href = "/public/home"
          }
        })
      } catch (err) {
        // tslint:disable-next-line:no-console
        console.log(err)
        // alert('Error Occured while logging in')
        //location.href = "/public/home"
      }
    }
  }
  // private openSnackbar(primaryMsg: string, duration: number = 3000) {
  //   this.snackBar.open(primaryMsg, undefined, {
  //     duration,
  //   })
  // }

}