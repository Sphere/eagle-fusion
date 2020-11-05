import { AuthNavBarToggleService } from '@ws/author/src/lib/services/auth-nav-bar-toggle.service'
import { NsPage, ConfigurationsService } from '@ws-widget/utils'
import { Component, OnInit } from '@angular/core'
import { SafeUrl, DomSanitizer } from '@angular/platform-browser'

@Component({
  selector: 'ws-auth-root-navigation',
  templateUrl: './auth-navigation.component.html',
  styleUrls: ['./auth-navigation.component.scss'],
})
export class AuthNavigationComponent implements OnInit {

  appIcon: SafeUrl | null = null
  search = false
  primaryNavbar: Partial<NsPage.INavBackground> | null = null
  pageNavbar: Partial<NsPage.INavBackground> | null = null
  backData: any = { url: 'back' }
  canShow = true
  constructor(
    private domSanitizer: DomSanitizer,
    private configSvc: ConfigurationsService,
    private authNavBarSvc: AuthNavBarToggleService,
  ) { }

  ngOnInit() {
    this.authNavBarSvc.toggleNavBar.subscribe(
      data => this.canShow = data,
    )
    if (this.configSvc.instanceConfig) {
      this.appIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
        this.configSvc.instanceConfig.logos.app,
      )
      this.primaryNavbar = this.configSvc.primaryNavBar
      this.pageNavbar = this.configSvc.pageNavBar
    }
  }

  back() {
    window.history.back()
  }

}
