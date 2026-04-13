import { Component, OnInit } from '@angular/core'
import {
  ConfigurationsService,
  LoggerService
} from '@ws-widget/utils'
@Component({
  selector: 'ws-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  constructor(
    public configSvc: ConfigurationsService,
    private logger: LoggerService
  ) { }

  async ngOnInit() {
    this.logger.log(this.configSvc)
  }
  homePage() {
    if (localStorage.getItem('isOrgSelectiveCourse') === 'false') {
      location.href = (this.configSvc!.unMappedUser! && this.configSvc!.unMappedUser!.id) ? '/page/home' : '/public/home'
    }
  }
}
