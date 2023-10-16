import { Component, OnInit } from '@angular/core'
import { Location } from '@angular/common'
import {
  ConfigurationsService
} from '@ws-widget/utils'
import { SignupService } from '../signup/signup.service'
@Component({
  selector: 'ws-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  result: any
  constructor(
    private location: Location,
    public configSvc: ConfigurationsService,
    private signupService: SignupService,
  ) { }

  async ngOnInit() {
    console.log(this.location.path())
    console.log(this.configSvc)
    this.result = await this.signupService.fetchStartUpDetails()
    console.log(this.result)
  }
  homePage() {
    location.href = '/public/home'
  }
}
