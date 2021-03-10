import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import { IBtnAppsConfig, CustomTourService } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ConfigurationsService, NsInstanceConfig, NsPage } from '@ws-widget/utils'
import { Router, NavigationStart, NavigationEnd, Event } from '@angular/router'
import { CREATE_ROLE } from './../../../../project/ws/author/src/lib/constants/content-role'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'

@Component({
  selector: 'ws-app-nav-bar',
  templateUrl: './app-nav-bar.component.html',
  styleUrls: ['./app-nav-bar.component.scss'],
})
export class AppNavBarComponent implements OnInit, OnChanges {
  allowAuthor = false
  @Input() mode: 'top' | 'bottom' = 'top'
  @Input() authorised = false
  // @Input()
  // @HostBinding('id')
  // public id!: string
  basicBtnAppsConfig: NsWidgetResolver.IRenderConfigWithTypedData<IBtnAppsConfig> = {
    widgetType: 'actionButton',
    widgetSubType: 'actionButtonApps',
    widgetData: { allListingUrl: '/app/features' },
  }
  instanceVal = ''
  btnAppsConfig!: NsWidgetResolver.IRenderConfigWithTypedData<IBtnAppsConfig>
  appIcon: SafeUrl | null = null
  appBottomIcon?: SafeUrl
  primaryNavbarBackground: Partial<NsPage.INavBackground> | null = null
  primaryNavbarConfig: NsInstanceConfig.IPrimaryNavbarConfig | null = null
  pageNavbar: Partial<NsPage.INavBackground> | null = null
  featureApps: string[] = []
  isHelpMenuRestricted = false
  isTourGuideAvailable = false
  isTourGuideClosed = false
  showAppNavBar = false
  popupTour: any
  courseNameHeader: any

  constructor(
    private domSanitizer: DomSanitizer,
    private configSvc: ConfigurationsService,
    private tourService: CustomTourService,
    private router: Router,
    private accessService: AccessControlService
  ) {
    this.btnAppsConfig = { ...this.basicBtnAppsConfig }
    if (this.configSvc.restrictedFeatures) {
      this.isHelpMenuRestricted = this.configSvc.restrictedFeatures.has('helpNavBarMenu')
    }
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.cancelTour()
      } else if (event instanceof NavigationEnd) {
        this.cancelTour()
      }
    })

    // Header view

  }

  ngOnInit() {
    this.allowAuthor = this.accessService.hasRole(CREATE_ROLE)
    this.router.events.subscribe((e: Event) => {
      if (e instanceof NavigationEnd) {
        if ((e.url.includes('/app/setup') && this.configSvc.instanceConfig && !this.configSvc.instanceConfig.showNavBarInSetup)) {
          this.showAppNavBar = false
        } else {
          this.showAppNavBar = true
        }

      }
    })

    if (this.configSvc.instanceConfig) {
      this.appIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
        this.configSvc.instanceConfig.logos.app,
      )
      this.instanceVal = this.configSvc.rootOrg || ''
      if (this.configSvc.instanceConfig.logos.appBottomNav) {
        this.appBottomIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
          this.configSvc.instanceConfig.logos.appBottomNav,
        )
      }
      this.primaryNavbarBackground = this.configSvc.primaryNavBar
      this.pageNavbar = this.configSvc.pageNavBar
      this.primaryNavbarConfig = this.configSvc.primaryNavBarConfig
    }
    if (this.configSvc.appsConfig) {
      this.featureApps = Object.keys(this.configSvc.appsConfig.features)
    }
    this.configSvc.tourGuideNotifier.subscribe(canShow => {
      if (
        this.configSvc.restrictedFeatures &&
        !this.configSvc.restrictedFeatures.has('tourGuide')
      ) {
        this.isTourGuideAvailable = canShow
        this.popupTour = this.tourService.createPopupTour()
      }
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const property in changes) {
      if (property === 'mode') {
        if (this.mode === 'bottom') {
          this.btnAppsConfig = {
            ...this.basicBtnAppsConfig,
            widgetData: {
              ...this.basicBtnAppsConfig.widgetData,
              showTitle: true,
            },
          }
        } else {
          this.btnAppsConfig = {
            ...this.basicBtnAppsConfig,
          }
        }
      }
    }
  }

  startTour() {
    this.tourService.startTour()
    this.tourService.isTourComplete.subscribe((result: boolean) => {
      if ((result)) {
        this.tourService.startPopupTour()
        this.configSvc.completedTour = true
        this.configSvc.prefChangeNotifier.next({ completedTour: this.configSvc.completedTour })
        // this.tour = tour
        setTimeout(
          () => {
            this.tourService.cancelPopupTour()
          },
          3000,
        )
      }
    })
  }
  cancelTour() {
    if (this.popupTour) {
      this.tourService.cancelPopupTour()
      this.isTourGuideClosed = false
    }

  }
}
