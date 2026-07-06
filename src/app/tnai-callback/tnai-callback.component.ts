import { Component, OnInit } from '@angular/core'
import { OrgServiceService } from 'project/ws/app/src/lib/routes/org/org-service.service'
import { AuthKeycloakService } from 'library/ws-widget/utils/src/lib/services/auth-keycloak.service'
import { LoggerService } from '@ws-widget/utils'
@Component({
    standalone: false,
    selector: 'ws-tnai-callback',
    templateUrl: './tnai-callback.component.html',
    styleUrls: ['./tnai-callback.component.scss'],
    
})
export class TnaiCallbackComponent implements OnInit {
  isLoading = false
  constructor(
    private orgService: OrgServiceService,
    private authSvc: AuthKeycloakService,
    private logger: LoggerService,
  ) { }

  ngOnInit() {
    const tnai_token = sessionStorage.getItem('tnai_token') || null

    if (tnai_token) {
      this.isLoading = true
      this.checkTnaiCallback(tnai_token)
    }
  }
  checkTnaiCallback(token: any) {
    const data = {
      "token": token,
    }
    try {
      setTimeout(() => {
        this.orgService.setTnaiToken(data).subscribe(async (res: any) => {
          this.isLoading = false
          window.location = await res.resRedirectUrl
          // tslint:disable-next-line:no-console
          this.logger.log('tnai component.ts', res.resRedirectUrl)
        }, (err: any) => {
          // tslint:disable-next-line:no-console
          this.logger.log(err)
          if (err.status === 400 || err.status === 419 || err.status === 404) {
            this.isLoading = false
            // sessionStorage.clear()
            //this.authSvc.logout()
            location.href = '/public/home'
          }
        })
      }, 500)
    } catch (err) {
      // tslint:disable-next-line:no-console
      this.logger.log(err)
      this.authSvc.logout()
      // location.href = "/public/home"
    }
  }
}
