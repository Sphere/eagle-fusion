import { Component, OnInit } from '@angular/core'
import { OrgServiceService } from 'project/ws/app/src/lib/routes/org/org-service.service'
import { TnnmcConfirmComponent } from '../component/tnnmc-dialog-confirm/tnnmc-confirm.component'
//import { AuthKeycloakService } from 'library/ws-widget/utils/src/lib/services/auth-keycloak.service'
import { MatDialog } from '@angular/material/dialog'
import { Router } from '@angular/router'
@Component({
  selector: 'ws-tnnmc-callback',
  templateUrl: './tnnmc-callback.component.html',
  styleUrls: ['./tnnmc-callback.component.scss']
})
export class TnnmcCallbackComponent implements OnInit {
  isLoading = false
  constructor(
    private orgService: OrgServiceService,
    //private authSvc: AuthKeycloakService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit() {
    const tnnmc_token = sessionStorage.getItem('tnnmc_token') || null
    //const maternity_moduleId = sessionStorage.getItem('maternity_moduleId') || null
    if (tnnmc_token) {
      this.isLoading = true
      //this.checkTnnmcCallback(maternity_token, maternity_moduleId)
      this.checkTnnmcCallback(tnnmc_token)
    }
  }
  //checkTnnmcCallback(token: any, id?: any) {
  checkTnnmcCallback(token: any) {
    console.log('su')
    let data = {
      "token": token,
      //"moduleId": id
    }
    try {
      //setTimeout(() => {
      this.orgService.setTnnmcToken(data).subscribe(async (res: any) => {
        let loc = await res
        console.log(loc, 'oo')
        localStorage.setItem('loc', JSON.stringify(loc))
        if (loc.message === 'success') {
          this.router.navigate(['/app/org-details'], {
            queryParams: {
              orgId: 'Tamil Nadu Nurses and Midwives Council (TNNMC)'
            }
          })
          //window.location = loc.resRedirectUrl
        }
      }, (err: any) => {
        // tslint:disable-next-line:no-console
        console.log(err)
        if (err.status === 400 || err.status === 419) {
          if (err.error.status === 'FAILURE') {
            this.isLoading = false
            this.router.navigate(['/app/org-details'], {
              queryParams: {
                orgId: 'Tamil Nadu Nurses and Midwives Council (TNNMC)'
              }
            })
            this.dialog.open(TnnmcConfirmComponent, {
              width: '300px',
              data: { 'body': err.error.message }
            })
          } else {
            this.router.navigate(['/public/home'])
          }
          // sessionStorage.clear()
          //this.authSvc.logout()
          // location.href = '/public/home'
        }
      })
      //}, 500)
    } catch (err: any) {
      // tslint:disable-next-line:no-console
      console.log(err)
      //this.authSvc.logout()
      if (err.error.status === 'FAILURE') {
        this.isLoading = false
        this.router.navigate(['/app/org-details'], {
          queryParams: {
            orgId: 'Tamil Nadu Nurses and Midwives Council (TNNMC)'
          }
        })
        this.dialog.open(TnnmcConfirmComponent, {
          width: '300px',
          data: { 'body': err.error.message }
        })
      } else {
        this.router.navigate(['/public/home'])
      }
    }
  }
}
