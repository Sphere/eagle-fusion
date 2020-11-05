import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { ConfigurationsService, NsPage, LogoutComponent } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import { ROOT_WIDGET_CONFIG } from '../collection.config'
import { IBtnAppsConfig } from './btn-apps.model'
import { Router, NavigationStart, NavigationEnd } from '@angular/router'
import { MatDialog } from '@angular/material'

@Component({
  selector: 'ws-widget-btn-apps',
  templateUrl: './btn-apps.component.html',
  styleUrls: ['./btn-apps.component.scss'],
})
export class BtnAppsComponent extends WidgetBaseComponent
  implements OnInit, OnDestroy, NsWidgetResolver.IWidgetData<IBtnAppsConfig> {
  @Input() widgetData!: IBtnAppsConfig
  isPinFeatureAvailable = true
  instanceVal = ''
  isUrlOpened = false
  pinnedApps: NsWidgetResolver.IRenderConfigWithTypedData<NsPage.INavLink>[] = []
  featuredApps: NsWidgetResolver.IRenderConfigWithTypedData<NsPage.INavLink>[] = []

  private pinnedAppsSubs?: Subscription
  constructor(
    private dialog: MatDialog,
    private configSvc: ConfigurationsService,
    private router: Router,
  ) {
    super()
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (this.router.url === '/app/features') {
          this.isUrlOpened = true
        } else {
          this.isUrlOpened = false
        }
      } else if (event instanceof NavigationEnd) {
        if (this.router.url === '/app/features') {
          this.isUrlOpened = true
        } else {
          this.isUrlOpened = false
        }
      }
    })
  }

  ngOnInit() {
    this.instanceVal = this.configSvc.rootOrg || ''
    if (this.configSvc.restrictedFeatures) {
      this.isPinFeatureAvailable = !this.configSvc.restrictedFeatures.has('pinFeatures')
    }
    this.setPinnedApps()
    this.setFeaturedApps()
  }
  ngOnDestroy() {
    if (this.pinnedAppsSubs) {
      this.pinnedAppsSubs.unsubscribe()
    }
  }

  setPinnedApps() {
    this.pinnedAppsSubs = this.configSvc.pinnedApps.subscribe(pinnedApps => {
      const appsConfig = this.configSvc.appsConfig
      if (!appsConfig) {
        return
      }
      this.pinnedApps = Array.from(pinnedApps)
        .filter(id => id in appsConfig.features)
        .map(id => ({
          widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
          widgetSubType: ROOT_WIDGET_CONFIG.actionButton.feature,
          widgetHostClass: 'w-1/3 px-2 py-3 box-sizing-box',
          widgetData: {
            config: {
              type: 'feature-item',
              useShortName: true,
            },
            actionBtn: appsConfig.features[id],
          },
        }))
    })
  }

  setFeaturedApps() {
    const instanceConfig = this.configSvc.instanceConfig
    const appsConfig = this.configSvc.appsConfig

    if (instanceConfig && instanceConfig.featuredApps && appsConfig) {
      this.featuredApps = instanceConfig.featuredApps
        .filter(id => id in appsConfig.features)
        .map(
          (id: string): NsWidgetResolver.IRenderConfigWithTypedData<NsPage.INavLink> => ({
            widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
            widgetSubType: ROOT_WIDGET_CONFIG.actionButton.feature,
            widgetHostClass: 'w-1/3 px-2 py-3 box-sizing-box',
            widgetData: {
              config: {
                type: 'feature-item',
                useShortName: true,
                hidePin: true,
              },
              actionBtn: appsConfig.features[id],
            },
          }),
        )
    }
  }

  logout() {
    this.dialog.open<LogoutComponent>(LogoutComponent)
  }
}
