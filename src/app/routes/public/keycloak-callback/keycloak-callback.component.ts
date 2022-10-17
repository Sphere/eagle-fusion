import { Component, OnInit } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { OrgServiceService } from '../../../../../project/ws/app/src/lib/routes/org/org-service.service'

@Component({
  selector: 'ws-keycloak-callback',
  templateUrl: './keycloak-callback.component.html',
  styleUrls: ['./keycloak-callback.component.scss']
})
export class KeycloakCallbackComponent implements OnInit {

  constructor(private orgService: OrgServiceService, private snackBarSvc: MatSnackBar,) { }



  ngOnInit() {
    // console.log(s
    // sessionStorage.getItem('code'))

    this.checkKeycloakCallback()

  }
  checkKeycloakCallback() {
    const code = sessionStorage.getItem('code') || null
    // console.log(code)
    try {
      this.orgService.setConnectSid(code).subscribe((res: any) => {
        if (res) {
          // console.log(res)
          sessionStorage.clear()
          if (localStorage.getItem('url_before_login')) {
            location.href = localStorage.getItem('url_before_login') || ''
          } else {
            location.href = '/page/home'
          }
        }
      }, (err: any) => {
        // console.log(err)
        if (err.status === 400) {
          sessionStorage.clear()
          this.snackBarSvc.open(err.error.error)
          location.href = "/public/home"
        }
      })
    } catch (err) {
      // alert('Error Occured while logging in')
      location.href = "/public/home"
    }
  }

}
