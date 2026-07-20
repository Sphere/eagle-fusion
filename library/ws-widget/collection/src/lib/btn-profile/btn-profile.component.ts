import {
  Component, Input, OnInit, OnDestroy, HostBinding,
} from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { ConfigurationsService, LogoutComponent, NsPage, NsAppsConfig, ValueService, LoggerService } from '@ws-widget/utils'
import { MatDialog, MatDialogConfig } from '@angular/material/dialog'
import { Subscription } from 'rxjs'
import { ROOT_WIDGET_CONFIG } from '../collection.config'
import { Location } from '@angular/common'
/* tslint:disable*/
import { compact, get } from 'lodash'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { IBtnAppsConfig } from '../btn-apps/btn-apps.model'
import { Router } from '@angular/router'
import { UserProfileService } from 'project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
/* tslint:enable*/

interface IGroupWithFeatureWidgets extends NsAppsConfig.IGroup {
  featureWidgets: NsWidgetResolver.IRenderConfigWithTypedData<NsPage.INavLink>[]
}
@Component({
    standalone: false,
    selector: 'ws-widget-btn-profile',
    templateUrl: './btn-profile.component.html',
    styleUrls: ['./btn-profile.component.scss'],
    
})

export class BtnProfileComponent extends WidgetBaseComponent
  implements OnInit, OnDestroy,
  NsWidgetResolver.IWidgetData<NsPage.INavLink> {
  public route: string
  public locale = ''
  isXSmall$ = this.valueSvc.isXSmall$
  userData: any
  constructor(
    private configSvc: ConfigurationsService,
    private dialog: MatDialog,
    private accessService: AccessControlService,
    private valueSvc: ValueService,
    private router: Router,
    location: Location,
    private userProfileSvc: UserProfileService,
    private logger: LoggerService
  ) {
    super()
    this.route = location.path()
    this.btnAppsConfig = { ...this.basicBtnAppsConfig }
    this.btnSettingsConfig = { ... this.settingBtnConfig }
    if (this.configSvc.userProfile) {
      this.givenName = `${this.configSvc.userProfile.firstName} ${this.configSvc.userProfile.lastName}`
      this.profileImage = this.configSvc.userProfile.profileImage ||
        (this.configSvc.userProfileV2 ? this.configSvc.userProfileV2.profileImage : null) || null
      if (!this.profileImage && localStorage.getItem(this.configSvc.userProfile.userId)) {
        this.profileImage = localStorage.getItem(this.configSvc.userProfile.userId)
      }
    }

    if (this.configSvc.appsConfig) {
      const appsConfig: any = this.configSvc.appsConfig
      const availGroups: NsAppsConfig.IGroup[] = []
      appsConfig.groups.forEach((group: any) => {
        if (group.hasRole.length === 0 || this.accessService.hasRole(group.hasRole)) {
          availGroups.push(group)
        }
      })
      this.featuresConfig = availGroups.map(
        (group: NsAppsConfig.IGroup): IGroupWithFeatureWidgets => (
          {
            ...group,
            featureWidgets: compact(group.featureIds.map(
              (id: string): NsWidgetResolver.IRenderConfigWithTypedData<NsPage.INavLink> | undefined => {
                const permissions = get(appsConfig, `features[${id}].permission`)
                if (!permissions || permissions.length === 0 || this.accessService.hasRole(permissions)) {
                  return ({
                    widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
                    widgetSubType: ROOT_WIDGET_CONFIG.actionButton.feature,
                    widgetHostClass: 'my-2 px-2 w-1/2 sm:w-1/3 md:w-1/6 w-lg-1-8 box-sizing-box',
                    widgetData: {
                      config: {
                        type: 'feature-item',
                        useShortName: false,
                        treatAsCard: true,
                      },
                      actionBtn: appsConfig.features[id],
                    },
                  })
                }
                return undefined
              },
            )),
          }),
      )

    }
  }
  @HostBinding('id')
  public id = 'Profile_link'
  @Input() widgetData!: any
  @HostBinding('class')
  public class = 'profile-link'
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
  givenName = 'Guest'
  profileImage!: string | null
  private readonly featuresConfig: IGroupWithFeatureWidgets[] = []
  portalLinks: any[] = []

  ngOnInit() {
    this.setPinnedApps()
    if (this.widgetData && this.widgetData.actionBtnId) {
      this.id = this.widgetData.actionBtnId
    }

    if (this.featuresConfig && this.featuresConfig.length > 0) {
      this.getPortalLinks()
    }
  }

  ngOnDestroy() {
    if (this.pinnedAppsSubs) {
      this.pinnedAppsSubs.unsubscribe()
    }
  }

  logout() {
    this.dialog.open<LogoutComponent, MatDialogConfig>(LogoutComponent, {
      panelClass: 'logout-dialog-container',
    })
  }
  redirect() {
    if (this.configSvc.unMappedUser) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(async (data: any) => {
        this.logger.log(data && data.profileDetails!.profileReq!.personalDetails!.dob, 'btn')
        this.userData = await data
        if (data && data.profileDetails!.profileReq!.personalDetails!.dob) {
          this.router.navigate(['/app/profile-view'])
        } else {
          const url = `/page/home`
          this.router.navigate(['/app/about-you'], { queryParams: { redirect: url } })
        }
      })
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

  getPortalLinks() {
    this.featuresConfig.forEach((feature: any) => {
      if (feature.id === 'portal_admin' && feature.featureWidgets.length > 0) {
        feature.featureWidgets.forEach((fw: any) => {
          this.portalLinks.push(fw)
        })
      }
    })
  }
}
