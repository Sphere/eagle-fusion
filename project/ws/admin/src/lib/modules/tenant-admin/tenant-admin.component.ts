import { Component, OnDestroy, OnInit } from '@angular/core'
import { ConfigurationsService, NsPage, ValueService } from '@ws-widget/utils'
import { Subscription } from 'rxjs'

@Component({
  selector: 'ws-admin-tenant-admin',
  templateUrl: './tenant-admin.component.html',
  styleUrls: ['./tenant-admin.component.scss'],
})
export class TenantAdminComponent implements OnInit, OnDestroy {
  sideNavSubscription: Subscription | null = null
  isLtMedium = false
  sideNavBarOpened = !this.isLtMedium
  showText = true
  objectKeys = Object.keys
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  userRoles = Array.from(this.configSvc.userRoles || new Set<string>())
  restrictedFeatures: Set<string> | null = null

  constructor(
    private valueSvc: ValueService,
    private configSvc: ConfigurationsService,
  ) {
    this.restrictedFeatures = this.configSvc.restrictedFeatures
  }

  ngOnInit() {
    this.sideNavSubscription = this.valueSvc.isLtMedium$.subscribe(isLtMedium => {
      this.isLtMedium = isLtMedium
      this.sideNavBarOpened = !this.isLtMedium
    })
  }

  ngOnDestroy() {
    if (this.sideNavSubscription) {
      this.sideNavSubscription.unsubscribe()
    }
  }
}
