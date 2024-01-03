import { Component, OnInit } from '@angular/core'
import { OrgServiceService } from 'project/ws/app/src/lib/routes/org/org-service.service'
//import { AuthKeycloakService } from 'library/ws-widget/utils/src/lib/services/auth-keycloak.service'
@Component({
  selector: 'ws-maternity-callback',
  templateUrl: './maternity-callback.component.html',
  styleUrls: ['./maternity-callback.component.scss']
})
export class MaternityCallbackComponent implements OnInit {
  isLoading = false
  constructor(
    private orgService: OrgServiceService,
    //private authSvc: AuthKeycloakService,
  ) { }

  ngOnInit() {
    const maternity_token = sessionStorage.getItem('maternity_token') || null
    const maternity_moduleId = sessionStorage.getItem('maternity_moduleId') || null
    if (maternity_token && maternity_moduleId) {
      this.isLoading = true
      //this.checkMaternityCallback(maternity_token, maternity_moduleId)
      this.checkMaternityCallback(maternity_token)
    }
  }
  //checkMaternityCallback(token: any, id?: any) {
  checkMaternityCallback(token: any) {
    console.log('su')
    let data = {
      "token": token,
      //"moduleId": id
    }
    try {
      //setTimeout(() => {
      this.orgService.setMaternyId(data).subscribe(async (res: any) => {
        let loc = await res
        console.log(loc, 'oo')
        localStorage.setItem('loc', JSON.stringify(loc))
        if (loc.message === 'success') {
          location.href = '/app/org-details?orgId=Maternity%20Foundation'
          //window.location = loc.resRedirectUrl
        }
        // tslint:disable-next-line:no-console
        console.log('maternity component.ts', res.resRedirectUrl)
      }, (err: any) => {
        // tslint:disable-next-line:no-console
        console.log(err)
        if (err.status === 400 || err.status === 419) {
          // sessionStorage.clear()
          //this.authSvc.logout()
          location.href = '/public/home'
        }
      })
      //}, 500)
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.log(err)
      //this.authSvc.logout()
      location.href = "/public/home"
    }
  }
}
