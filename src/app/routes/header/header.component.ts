import { Component, OnInit } from '@angular/core'
//import { Location } from '@angular/common'
import {
  ConfigurationsService,
  LoggerService
} from '@ws-widget/utils'
//import { SignupService } from '../signup/signup.service'
@Component({
  selector: 'ws-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  //result: any
  constructor(
    //private location: Location,
    public configSvc: ConfigurationsService,
    //private signupService: SignupService,
    private logger: LoggerService
  ) { }

  async ngOnInit() {
    this.logger.log(this.configSvc)
    //this.result = await this.signupService.fetchStartUpDetails()
    //this.logger.log(this.result)
  }
  homePage() {
    if (localStorage.getItem('isOrgSelectiveCourse') === 'false') {
      location.href = (this.configSvc!.unMappedUser! && this.configSvc!.unMappedUser!.id) ? '/page/home' : '/public/home'
    }
  }
}
