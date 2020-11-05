import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { ConfigurationsService, NsPage } from '../../../../../../../../../library/ws-widget/utils/src/public-api'

@Component({
  selector: 'ws-app-my-rewards-home',
  templateUrl: './my-rewards-home.component.html',
  styleUrls: ['./my-rewards-home.component.scss'],
})
export class MyRewardsHomeComponent implements OnInit {

  constructor(private router: Router, private configSvc: ConfigurationsService) { }
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar

  ngOnInit() {
  }

  backToHome() {
    this.router.navigate(['page', 'home'])
  }

}
