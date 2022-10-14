import { Component, OnInit } from '@angular/core'
import { OrgServiceService } from '../../../../../project/ws/app/src/lib/routes/org/org-service.service'
import { ActivatedRoute } from '@angular/router'
@Component({
  selector: 'ws-keycloak-callback',
  templateUrl: './keycloak-callback.component.html',
  styleUrls: ['./keycloak-callback.component.scss']
})
export class KeycloakCallbackComponent implements OnInit {

  constructor(private orgService: OrgServiceService, private activatedroute: ActivatedRoute) {}



  ngOnInit() {
    this.checkKeycloakCallback()

  }
  checkKeycloakCallback() {
    const code = this.activatedroute.snapshot.paramMap.get("code");
   // console.log(code)
   try{
      this.orgService.setConnectSid(code).pipe().subscribe((res: any) => {
        if (res) {
          console.log(res)
          if (localStorage.getItem('url_before_login')) {
            location.href = localStorage.getItem('url_before_login') || ''
          } else {
            location.href = '/page/home'
          }
        }
      })
    } catch(err){
      alert('Error Occured while logging in')
     location.href = "/public/home"
    }
  }

}
