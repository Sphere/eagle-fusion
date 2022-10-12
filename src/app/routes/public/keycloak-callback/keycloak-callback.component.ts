import { Component, OnInit } from '@angular/core'
import { OrgServiceService } from '../../../../../project/ws/app/src/lib/routes/org/org-service.service'
import { Router, NavigationStart } from '@angular/router'
@Component({
  selector: 'ws-keycloak-callback',
  templateUrl: './keycloak-callback.component.html',
  styleUrls: ['./keycloak-callback.component.scss']
})
export class KeycloakCallbackComponent implements OnInit {

  constructor(private orgService: OrgServiceService, private router: Router) { }

  ngOnInit() {
    this.checkKeycloakCallback()
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationStart) {
        console.log(event.url)
      }
    })
  }
  checkKeycloakCallback() {
    if ((window.location.href).indexOf('state') > 0) {
      const urlParams = new URLSearchParams(window.location.href)
      const authCode = urlParams.get('code')
      this.orgService.setConnectSid(authCode).pipe().subscribe((res: any) => {
        if (res) {
          if (localStorage.getItem('url_before_login')) {
            location.href = localStorage.getItem('url_before_login') || ''
          } else {
            location.href = '/page/home'
          }
        }
      })
    }
  }

}
