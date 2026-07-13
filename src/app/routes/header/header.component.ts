import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import {
  ConfigurationsService,
  LoggerService,
} from '@ws-widget/utils'
@Component({
  standalone: false,
  selector: 'ws-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],

})
export class HeaderComponent implements OnInit {
  constructor(
    private router: Router,
    public configSvc: ConfigurationsService,
    private logger: LoggerService
  ) { }

  ngOnInit() {
    this.logger.log(this.configSvc)
  }
  homePage() {
    if (localStorage.getItem('isOrgSelectiveCourse') === 'false') {
      const path = (this.configSvc!.unMappedUser! && this.configSvc!.unMappedUser!.id) ? '/page/home' : '/public/home'
      this.router.navigateByUrl(path)
    }
  }
}
