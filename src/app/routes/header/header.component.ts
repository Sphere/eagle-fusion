import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import {
  ConfigurationsService,
  LoggerService,
} from '@ws-widget/utils'
//import { SignupService } from '../signup/signup.service'
@Component({
    standalone: false,
    selector: 'ws-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    
})
export class HeaderComponent implements OnInit {
  //result: any
  constructor(
    private router: Router,
    public configSvc: ConfigurationsService,
    private logger: LoggerService
  ) { }

  async ngOnInit() {
    this.logger.log(this.configSvc)
    //this.result = await this.signupService.fetchStartUpDetails()
    //this.logger.log(this.result)
  }
  homePage() {
    if (localStorage.getItem('isOrgSelectiveCourse') === 'false') {
      const path = (this.configSvc!.unMappedUser! && this.configSvc!.unMappedUser!.id) ? '/page/home' : '/public/home'
      this.router.navigateByUrl(path)
    }
  }
}
