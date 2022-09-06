import {
  Component, Input, OnInit, OnDestroy, HostBinding,
  // ElementRef, AfterViewInit
} from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { ConfigurationsService, LogoutComponent, NsPage, NsAppsConfig, ValueService } from '@ws-widget/utils'
import { MatDialog } from '@angular/material'
import { Subscription } from 'rxjs'
import { ROOT_WIDGET_CONFIG } from '../collection.config'
// import { Router } from '@angular/router'
import { Location } from '@angular/common'
// declare const gapi: any
/* tslint:disable*/
import _ from 'lodash'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
//import { WidgetContentService } from '../_services/widget-content.service'
import { IBtnAppsConfig } from '../btn-apps/btn-apps.model'
// import { Router } from '@angular/router'
/* tslint:enable*/

interface IGroupWithFeatureWidgets extends NsAppsConfig.IGroup {
  featureWidgets: NsWidgetResolver.IRenderConfigWithTypedData<NsPage.INavLink>[]
}
@Component({
  selector: 'ws-widget-btn-profile',
  templateUrl: './btn-profile.component.html',
  styleUrls: ['./btn-profile.component.scss'],
})

export class BtnProfileComponent extends WidgetBaseComponent
  implements OnInit, OnDestroy,
  // AfterViewInit,
  NsWidgetResolver.IWidgetData<NsPage.INavLink> {
  public route: string
  public locale = ''
  isXSmall$ = this.valueSvc.isXSmall$

  constructor(
    private configSvc: ConfigurationsService,
    private dialog: MatDialog,
    private accessService: AccessControlService,
    private valueSvc: ValueService,
    // private element: ElementRef,
    // private router: Router,
    // private contentSvc: WidgetContentService,
    location: Location
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
      // appsConfig.groups[7].hasRole = []
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
            featureWidgets: _.compact(group.featureIds.map(
              (id: string): NsWidgetResolver.IRenderConfigWithTypedData<NsPage.INavLink> | undefined => {
                const permissions = _.get(appsConfig, `features[${id}].permission`)
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
  // public isSignedIn = false
  // public signinURL = ''
  // private clientId = '770679530323-dla42fvs5g7ilep9912q3aj67678kabv.apps.googleusercontent.com'
  // private scope = [
  //   'profile',
  //   'email',
  //   'https://www.googleapis.com/auth/plus.me',
  //   'https://www.googleapis.com/auth/contacts.readonly',
  //   'https://www.googleapis.com/auth/admin.directory.user.readonly',
  // ].join(' ')

  // public auth2: any
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

  // public googleInit() {
  //   gapi.load('auth2', () => {
  //     this.auth2 = gapi.auth2.init({
  //       client_id: this.clientId,
  //       cookie_policy: 'single_host_origin',
  //       scope: this.scope,
  //       ux_mode: 'redirect',
  //       redirect_uri: `${location.origin}/google/callback`,
  //     })
  //     this.attachSignin(this.element.nativeElement.firstChild)
  //     this.auth2.isSignedIn.listen(this.signinChanged)
  //     this.auth2.currentUser.listen(this.userChanged)
  //   })
  // }

  // public signinChanged(val: any) {
  //   localStorage.setItem(`google_isSignedIn`, val)
  // }

  // public userChanged(user: any) {
  //   localStorage.setItem(`google_token`, user.getAuthResponse().id_token)
  // }

  // public attachSignin(element: any) {
  //   this.auth2.attachClickHandler(element, {},
  //                                 (googleUser: any) => {
  // @ts-ignore
  // const profile = googleUser.getBasicProfile()
  // console.log('Token || ' + googleUser.getAuthResponse().id_token)
  // console.log(`'ID: ' + profile.getId()`)
  // console.log('Name: ' + profile.getName())
  // console.log('Image URL: ' + profile.getImageUrl())
  // console.log('Email: ' + profile.getEmail())
  // },
  // (error: any) => {
  // tslint:disable-next-line:no-console
  // console.log(JSON.stringify(error, undefined, 2))
  // })
  // }

  ngOnInit() {
    this.setPinnedApps()
    if (this.widgetData && this.widgetData.actionBtnId) {
      this.id = this.widgetData.actionBtnId
    }

    if (this.featuresConfig && this.featuresConfig.length > 0) {
      this.getPortalLinks()
    }
    // const storageItem1 = localStorage.getItem(`google_token`)
    // const storageItem2 = localStorage.getItem(`google_isSignedIn`)
    // if (storageItem2 === 'true' && this.route === '/google/callback') {
    //   this.signinURL = `https://oauth2.googleapis.com/tokeninfo?id_token=${storageItem1}`
    //   this.isSignedIn = true
    //   const req = {
    //     idToken: storageItem1,
    //   }
    //   this.contentSvc.googleAuthenticate(req).subscribe(
    //     (results: any) => {
    //       // tslint:disable-next-line:no-console
    //       console.log(results)
    //     },
    //     (err: any) => {
    //       // tslint:disable-next-line:no-console
    //       console.log(err)
    //     }
    //   )
    //   this.router.navigate(['/page/home'])
    // }
  }

  // ngAfterViewInit() {
  //   this.googleInit()
  // }

  ngOnDestroy() {
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

  getPortalLinks() {
    this.featuresConfig.forEach((feature: any) => {
      if (feature.id === 'portal_admin' && feature.featureWidgets.length > 0) {
        feature.featureWidgets.forEach((fw: any) => {
          this.portalLinks.push(fw)
        })
      }
      // else if (feature.id === 'portal_frac' && feature.featureWidgets.length > 0) {
      //   feature.featureWidgets.forEach((fw: any) => {
      //     this.portalLinks.push(fw)
      //   })
      // }
    })
  }
}
