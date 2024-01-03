import { Component, OnInit } from '@angular/core'
import { OrgServiceService } from 'project/ws/app/src/lib/routes/org/org-service.service'
import { AuthKeycloakService } from 'library/ws-widget/utils/src/lib/services/auth-keycloak.service'
@Component({
  selector: 'ws-sashakt-callback',
  templateUrl: './sashakt-callback.component.html',
  styleUrls: ['./sashakt-callback.component.scss'],
})
export class SashaktCallbackComponent implements OnInit {
  isLoading = false
  constructor(
    private orgService: OrgServiceService,
    private authSvc: AuthKeycloakService,
  ) { }

  ngOnInit() {
    const sashakt_token = sessionStorage.getItem('sashakt_token') || null
    const sashakt_moduleId = sessionStorage.getItem('sashakt_moduleId') || null
    if (sashakt_token && sashakt_moduleId) {
      this.isLoading = true
      this.checkSashaktCallback(sashakt_token, sashakt_moduleId)
    }
  }
  checkSashaktCallback(token: any, id: any) {
    try {
      setTimeout(() => {
        this.orgService.setSashaktId(token, id).subscribe((res: any) => {
          window.location = res.resRedirectUrl
          // tslint:disable-next-line:no-console
          console.log('sashakt component.ts', res.resRedirectUrl)
        },                                                (err: any) => {
          // tslint:disable-next-line:no-console
          console.log(err)
          if (err.status === 400 || err.status === 419) {
            // sessionStorage.clear()
            this.authSvc.logout()
            // location.href = '/public/home'
          }
        })
      },         500)
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.log(err)
      this.authSvc.logout()
      // location.href = "/public/home"
    }
  }
}
