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
  constructor(private readonly orgService: OrgServiceService,
    private readonly snackBarSvc: MatSnackBar,
    private readonly signupService: SignupService,
    private readonly authSvc: AuthKeycloakService,
    private readonly logger: LoggerService
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
    if (code === null) {
      return
    }
    try {
      this.orgService.setConnectSid(code).subscribe(
        (res: any) => this.handleConnectSidSuccess(res),
        (err: any) => this.handleConnectSidError(err),
      )
    } catch (err) {
      this.logger.log(err)
      this.authSvc.logout()
    }
  }

  private handleConnectSidSuccess(res: any) {
    if (!res) {
      return
    }
    sessionStorage.removeItem('code')
    setTimeout(() => {
      this.signupService.fetchStartUpDetails().then(result => this.handleStartUpResult(result))
    }, 1000)
  }

  private handleConnectSidError(err: any) {
    this.logger.log(err)
    if (err.status === 400) {
      this.authSvc.logout()
    }
  }

  private async handleStartUpResult(result: any) {
    this.logger.log(result)
    const res = await result
    if (res && res.status === 200) {
      // ✅ NO language prefix in URLs - ngx-translate handles language via localStorage
      location.href = this.resolveRedirectUrl(res)
      this.isLoading = false
    } else {
      this.authSvc.logout()
    }
    if (result.status === 419) {
      this.snackBarSvc.open(result.params.errmsg)
      this.authSvc.logout()
    }
  }

  private resolveRedirectUrl(res: any): string {
    if (res.language) {
      const obj = {
        lang: res.language,
        res: res.language,
        line: 56,
      }
      sessionStorage.setItem('lang1', JSON.stringify(obj))
      return localStorage.getItem('url_before_login') || '/page/home'
    }
    if (localStorage.getItem('preferedLanguage')) {
      const data = localStorage.getItem('preferedLanguage')
      const lang = JSON.parse(data as any)
      const obj = {
        lang: lang.id,
        line: 79,
      }
      sessionStorage.setItem('lang2', JSON.stringify(obj))
      return localStorage.getItem('url_before_login') || '/page/home'
    }
    if (localStorage.getItem('url_before_login')) {
      return localStorage.getItem('url_before_login') || ''
    }
    return '/page/home'
  }
  // private openSnackbar(primaryMsg: string, duration: number = 3000) {
  //   this.snackBar.open(primaryMsg, undefined, {
  //     duration,
  //   })
  // }

}