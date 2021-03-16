import { Component, Input, OnInit, OnDestroy } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { ConfigurationsService, LogoutComponent, NsPage } from '@ws-widget/utils/src/public-api'
import { IBtnAppsConfig } from '../btn-apps/btn-apps.model'
import { MatDialog } from '@angular/material'
import { Subscription } from 'rxjs'
import { ROOT_WIDGET_CONFIG } from '../collection.config'
import { UserProfileService } from './../../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { BtnProfileService } from "./btn-profile.service"
@Component({
  selector: 'ws-widget-btn-profile',
  templateUrl: './btn-profile.component.html',
  styleUrls: ['./btn-profile.component.scss'],
})
export class BtnProfileComponent extends WidgetBaseComponent
  implements OnInit, OnDestroy, NsWidgetResolver.IWidgetData<any> {

  @Input() widgetData!: any
  basicBtnAppsConfig: NsWidgetResolver.IRenderConfigWithTypedData<IBtnAppsConfig> = {
    widgetType: 'actionButton',
    widgetSubType: 'actionButtonApps',
    widgetData: { allListingUrl: '/app/features' },
  }
  settingBtnConfig: NsWidgetResolver.IRenderConfigWithTypedData<IBtnAppsConfig> = {
    widgetType: 'actionButton',
    widgetSubType: 'actionButtonSetting',
    widgetData: { allListingUrl: '/app/features' },
  }
  isPinFeatureAvailable = true
  pinnedApps: NsWidgetResolver.IRenderConfigWithTypedData<NsPage.INavLink>[] = []

  btnAppsConfig!: NsWidgetResolver.IRenderConfigWithTypedData<IBtnAppsConfig>
  btnSettingsConfig!: NsWidgetResolver.IRenderConfigWithTypedData<IBtnAppsConfig>
  private pinnedAppsSubs?: Subscription
  givenName = ''

  subscription!: Subscription


  constructor(
    private configSvc: ConfigurationsService,
    private dialog: MatDialog,
    private userProfileSvc: UserProfileService,
    private btnservice: BtnProfileService
  ) {
    super()
    this.btnAppsConfig = { ...this.basicBtnAppsConfig }
    this.btnSettingsConfig = { ... this.settingBtnConfig }
  }

  updateName() {
    if (this.configSvc && this.configSvc.userProfile && this.configSvc.userProfile.givenName) {
      this.userProfileSvc.getUserdetailsFromRegistry().subscribe(
        data => {
          if (data && data.length) {
            this.givenName = data[0].personalDetails.firstname || ''
            this.btnservice.changeName(this.givenName)
          }
        })
    }
  }


  ngOnInit() {
    this.subscription = this.btnservice.currentName.subscribe((name: string) => this.givenName = name)
    this.updateName()
    this.setPinnedApps()
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
    if (this.pinnedAppsSubs) {
      this.pinnedAppsSubs.unsubscribe()
    }
  }

  logout() {
    this.dialog.open<LogoutComponent>(LogoutComponent)
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
}
