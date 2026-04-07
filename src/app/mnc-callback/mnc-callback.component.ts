import { Component, OnInit } from '@angular/core'
import { OrgServiceService } from 'project/ws/app/src/lib/routes/org/org-service.service'
import { LoggerService } from '../../../library/ws-widget/utils/src/public-api'
@Component({
    standalone: false,
    selector: 'ws-mnc-callback',
    templateUrl: './mnc-callback.component.html',
    styleUrls: ['./mnc-callback.component.scss'],
    
})
export class MNCCallbackComponent implements OnInit {
  isLoading = false
  constructor(
    private orgService: OrgServiceService,
    private logger: LoggerService
  ) { }

  ngOnInit() {
    const mnc_token = sessionStorage.getItem('mnc_token') || null
    if (mnc_token) {
      this.isLoading = true
      this.checkMNCCallback(mnc_token)
    }
  }
  //checkMNCCallback(token: any, id?: any) {
  checkMNCCallback(token: any) {
    this.logger.log('su')
    const data = {
      "token": token,
      //"moduleId": id
    }
    try {
      //setTimeout(() => {
      this.orgService.setMNCId(data).subscribe(async (res: any) => {
        const loc = await res
        this.logger.log(loc, 'oo')
        localStorage.setItem('loc', JSON.stringify(loc))
        if (loc.message === 'success') {
          location.href = '/app/org-details?orgId=Maharashtra%20Nursing%20Council'
          //window.location = loc.resRedirectUrl
        }
        // tslint:disable-next-line:no-console
        this.logger.log('mnc component.ts', res)
      }, (err: any) => {
        // tslint:disable-next-line:no-console
        this.logger.log(err)
        if (err.status === 400 || err.status === 419) {
          // sessionStorage.clear()
          //this.authSvc.logout()
          location.href = '/public/home'
        }
      })
      //}, 500)
    } catch (err) {
      // tslint:disable-next-line:no-console
      this.logger.log(err)
      //this.authSvc.logout()
      location.href = "/public/home"
    }
  }
}
