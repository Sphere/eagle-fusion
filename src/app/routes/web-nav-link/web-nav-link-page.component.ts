import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material'
import { ConfigurationsService, LogoutComponent } from '@ws-widget/utils'
@Component({
  selector: 'ws-web-nav-link-page',
  templateUrl: './web-nav-link-page.component.html',
  styleUrls: ['./web-nav-link-page.component.scss'],
})
export class WebNavLinkPageComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    private configSvc: ConfigurationsService,
  ) { }
  linksData: any
  data: any

  ngOnInit() {
    this.data = this.configSvc.unMappedUser!
    this.linksData = [
      {
        linkName: 'Home',
        title: 'Home',
        url: 'page/home',
      },
      {
        linkName: 'Competency',
        tootTip: 'Competency',
        url: '/app/user/competency',
      },
      {
        linkName: 'Account',
        title: 'Account',
        url: '/app/profile-view',
      },
    ]
  }
  logout() {
    this.dialog.open<LogoutComponent>(LogoutComponent)
  }
}
