import { Component, OnInit } from '@angular/core'

import { NsPage, ConfigurationsService } from '@ws-widget/utils'

@Component({
  selector: 'ws-app-certification-home',
  templateUrl: './certification-home.component.html',
  styleUrls: ['./certification-home.component.scss'],
})
export class CertificationHomeComponent implements OnInit {
  pageNavbar: Partial<NsPage.INavBackground>

  constructor(private configSvc: ConfigurationsService) {
    this.pageNavbar = this.configSvc.pageNavBar
  }

  ngOnInit() {}
}
