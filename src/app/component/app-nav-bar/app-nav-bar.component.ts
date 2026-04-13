import { ChangeDetectorRef, Component, HostListener, Input, OnChanges, OnInit, SimpleChanges, effect } from '@angular/core'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import { IBtnAppsConfig } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ConfigurationsService, LoggerService, NsInstanceConfig, NsPage, ValueService } from '@ws-widget/utils'
import { Router, NavigationStart, NavigationEnd, Event } from '@angular/router'
import { CREATE_ROLE } from './../../../../project/ws/author/src/lib/constants/content-role'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { LanguageDialogComponent } from '../../routes/language-dialog/language-dialog.component'
import { MatDialog } from '@angular/material/dialog'
import { appNavBarService } from './app-nav-bar.service'
import { PlaylistService } from '../../services/playlist.service'
import { LanguageService } from '../../services/language.service'

@Component({
    standalone: false,
    selector: 'ws-app-nav-bar',
    templateUrl: './app-nav-bar.component.html',
    styleUrls: ['./app-nav-bar.component.scss'],
    
})
export class AppNavBarComponent implements OnInit, OnChanges {
  allowAuthor = false
  @Input() mode: 'top' | 'bottom' = 'top'
  @Input() authorised = false
  basicBtnAppsConfig: NsWidgetResolver.IRenderConfigWithTypedData<IBtnAppsConfig> = {
    widgetType: 'actionButton',
    widgetSubType: 'actionButtonApps',
    widgetData: { allListingUrl: '/app/features' },
  }
  instanceVal = ''
  btnAppsConfig!: NsWidgetResolver.IRenderConfigWithTypedData<IBtnAppsConfig>
  appIcon: SafeUrl | null = null
  orgLogo: SafeUrl | null = null
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
  showCreateBtn = false
  isXSmall!: boolean
  showSearchIcon = true
  langDialog: any
  preferedLanguage: any = ['english']
  hideCreateButton = true
  hideSearch = false
  showNavLinkPage = true
  langPresent = false
  domain!: string
  orgData: any
  menuItems: any[] = []
  config: any
  constructor(
    private domSanitizer: DomSanitizer,
    public configSvc: ConfigurationsService,
    private router: Router,
    private accessService: AccessControlService,
    private valueSvc: ValueService,
    public dialog: MatDialog,
    public navOption: appNavBarService,
    private playlistSvc: PlaylistService,
    private languageSvc: LanguageService,
    private cdr: ChangeDetectorRef,
    private logger: LoggerService
  ) {
    this.btnAppsConfig = { ...this.basicBtnAppsConfig }
    if (this.configSvc.unMappedUser && !this.configSvc.unMappedUser.profileDetails) {
      this.showNavLinkPage = false
    }
    this.logger.log(location.href)
    this.langPresent = this.languageSvc.isHindi()
    if (location.href.includes('/app/new-tnc')) {
      this.showNavLinkPage = false
    } else {
      this.showNavLinkPage = true
    }
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

    effect(() => {
      if (this.valueSvc.isMobile()) {
        this.isXSmall = true
        this.showCreateBtn = this.configSvc.userProfile === null
      } else {
        this.isXSmall = false
        this.showCreateBtn = false
      }
      // trigger async safely
      queueMicrotask(() => this.setUIData())
    })
  }

  async setUIData() {
    this.orgData = this.playlistSvc.orgDetails()
    if (this.orgData === "") {
      await this.playlistSvc.loadPlaylistData().then(() => {
        this.orgData = this.playlistSvc.orgDetails()
      })
    }
    this.config = this.playlistSvc.headerConfig()
    if (this.config) {
      const menuItem = this.config.menuItems
      this.menuItems = this.isXSmall
        ? menuItem?.filter(item => this.config.mobileMenuItems.includes(item.id))
        : menuItem?.filter(item => this.config.webMenuItems.includes(item.id))
    }
    this.appIcon = this.orgData?.appLogo
    this.orgLogo = this.orgData?.foundationLogo
    this.cdr.detectChanges()
  }

  async ngOnInit() {
    await this.setUIData()
    if (localStorage.getItem('orgValue') === 'nhsrc') {
      this.hideCreateButton = false
    }
    this.hideSearch = false
    this.allowAuthor = this.accessService.hasRole(CREATE_ROLE)
    this.router.events.subscribe((e: Event) => {
      if (e instanceof NavigationEnd) {
        if ((e.url.includes('/app/setup') && this.configSvc.instanceConfig && !this.configSvc.instanceConfig.showNavBarInSetup)) {
          this.showAppNavBar = false
        } else {
          this.showAppNavBar = true
          if (e.url.includes('new-tnc')) {
            this.hideSearch = true
          }
          if (e.url.includes('/search/home') || (e.url.includes('/app/new-tnc'))) {
            this.showSearchIcon = false
          } else {
            this.navOption.changeNavBarActive('search')
            this.showSearchIcon = true
          }
        }
      }
    })

    if (this.configSvc.instanceConfig) {
      this.instanceVal = this.configSvc.rootOrg || ''
      if (this.configSvc.instanceConfig.logos.appBottomNav) {
        this.appBottomIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
          this.configSvc.instanceConfig.logos.appBottomNav,
        )
      }
      this.primaryNavbarBackground = this.configSvc.primaryNavBar
      this.pageNavbar = this.configSvc.pageNavBar
      this.primaryNavbarConfig = this.configSvc.primaryNavBarConfig
      this.cdr.detectChanges()
    }
    if (this.configSvc.appsConfig) {
      this.featureApps = Object.keys(this.configSvc.appsConfig.features)
    }
    this.domain = window.location.hostname
  }

  createAcct() {
    this.router.navigateByUrl('app/create-account')
  }
  navigate() {
    // Use LanguageService instead of checking location.href
    // ✅ NO language prefix in URLs - ngx-translate handles language via localStorage
    this.menuItems?.forEach(item => {
      item.active = false
    })
    if (this.configSvc?.unMappedUser?.profileDetails?.profileReq?.personalDetails?.dob) {
      this.router.navigate(['/app/profile-view'])
    } else {
      this.router.navigate(['/app/about-you'], { queryParams: { redirect: '/page/home' } })
    }

  }

  goHomePage() {
    // ✅ Check if orgSelectiveConfig matches and redirect accordingly
    const rootOrgId = this.configSvc.userProfile?.rootOrgId || ''
    const orgSelectiveConfig = this.configSvc.orgSelectiveCourseConfig

    let url = 'page/home'
    if (orgSelectiveConfig && orgSelectiveConfig.orgId === rootOrgId) {
      url = orgSelectiveConfig.redirectUrl || 'page/home'
      this.logger.log('Redirecting to selective org page:', url)
    }

    this.router.navigateByUrl(url)
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

  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    this.logger.log('Back button pressed', event)
    location.href = '/page/home'
  }

  cancelTour() {
    if (this.popupTour) {
      this.isTourGuideClosed = false
    }

  }

  changeLanguage() {
    this.langDialog = this.dialog.open(LanguageDialogComponent, {
      panelClass: 'language-modal',
      data: {
        selected: this.preferedLanguage,
        checkbox: true,
      },
    })
    this.langDialog.afterClosed().subscribe((result: any) => {
      this.preferedLanguage = result
      this.logger.log(this.preferedLanguage)
    })
  }
}
