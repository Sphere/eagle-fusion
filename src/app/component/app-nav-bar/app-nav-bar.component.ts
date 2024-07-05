import { Component, Input, OnChanges, OnInit, SimpleChanges, HostListener } from '@angular/core'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import {
  IBtnAppsConfig,
  // CustomTourService
} from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ConfigurationsService, NsInstanceConfig, NsPage, ValueService } from '@ws-widget/utils'
import { Router, NavigationStart, NavigationEnd, Event } from '@angular/router'
import { CREATE_ROLE } from './../../../../project/ws/author/src/lib/constants/content-role'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { Observable } from 'rxjs'
import { LanguageDialogComponent } from '../../routes/language-dialog/language-dialog.component'
import { MatDialog } from '@angular/material'
import { appNavBarService } from './app-nav-bar.service'

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
  showCreateBtn = false
  isXSmall$: Observable<boolean>
  isXSmall!: boolean
  showSearchIcon = true
  langDialog: any
  preferedLanguage: any = ['english']
  hideCreateButton = true
  hideSearch = false
  showNavLinkPage = true
  langPresent: boolean = false

  constructor(
    private domSanitizer: DomSanitizer,
    public configSvc: ConfigurationsService,
    // private tourService: CustomTourService,
    private router: Router,
    private accessService: AccessControlService,
    private valueSvc: ValueService,
    public dialog: MatDialog,
    //location: Location,
    public navOption: appNavBarService
  ) {
    this.isXSmall$ = this.valueSvc.isXSmall$
    this.btnAppsConfig = { ...this.basicBtnAppsConfig }
    if (this.configSvc.unMappedUser && !this.configSvc.unMappedUser.profileDetails) {
      this.showNavLinkPage = false
    }
    console.log(location.href)
    if (location.href.includes('/hi/')) {
      this.langPresent = true
    }
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
    // Header view
  }

  ngOnInit() {
    if (localStorage.getItem('orgValue') === 'nhsrc') {
      this.hideCreateButton = false
    }
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

    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      this.isXSmall = isXSmall
      if (isXSmall && (this.configSvc.userProfile === null)) {
        this.showCreateBtn = true
      } else {
        this.showCreateBtn = false
      }
    })

    if (this.configSvc.instanceConfig) {
      if (localStorage.getItem('orgValue') === 'nhsrc') {
        this.appIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
          '/fusion-assets/images/sphere-new-logo.svg',
        )
      } else {
        this.appIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
          '/fusion-assets/images/sphere-new-logo.svg',
        )
      }
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
        // this.popupTour = this.tourService.createPopupTour()
      }
    })
  }

  createAcct() {
    this.router.navigateByUrl('app/create-account')
  }
  navigate() {
    let local = (this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails!.preferences && this.configSvc.unMappedUser!.profileDetails!.preferences!.language !== undefined) ? this.configSvc.unMappedUser.profileDetails.preferences.language : location.href.includes('/hi/') === true ? 'hi' : 'en'
    let url1 = local === 'hi' ? 'hi' : ""
    // let url3 = `${document.baseURI}`
    // if (url3.includes('hi')) {
    //   url3 = url3.replace(/hi\//g, '')
    // }

    if (this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails.profileReq!.personalDetails!.dob) {
      let url = url1 === 'hi' ? '/app/profile-view' : 'app/profile-view'
      this.router.navigateByUrl(`${url}`)
    } else {
      let url = url1 === 'hi' ? '/app/profile-view' : 'app/profile-view'
      this.router.navigate(['/app/about-you'], { queryParams: { redirect: `${url1}${url}` } })
    }

  }

  goHomePage() {
    // localStorage.setItem('url_before_login', '/page/home')
    //if (this.showNavLinkPage) {
    let local = (this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails!.preferences && this.configSvc.unMappedUser!.profileDetails!.preferences!.language !== undefined) ? this.configSvc.unMappedUser.profileDetails.preferences.language : location.href.includes('/hi/') === true ? 'hi' : 'en'
    let url1 = local === 'hi' ? 'hi' : ""
    console.log(url1)
    let url2 = `${document.baseURI}`
    if (url2.includes('hi')) {
      url2 = url2.replace(/hi\//g, '')
    }
    let url = url1 === 'hi' ? '/page/home' : 'page/home'
    location.href = `${url2}${url1}${url}`
    //location.href = '/page/home'
    //}
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
    console.log('Back button pressed', event)
    location.href = '/page/home'
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      if (isXSmall && (this.configSvc.userProfile === null)) {
        this.showCreateBtn = true
      } else {
        this.showCreateBtn = false
      }
    })
  }

  // startTour() {
  //   this.tourService.startTour()
  //   this.tourService.isTourComplete.subscribe((result: boolean) => {
  //     if ((result)) {
  //       this.tourService.startPopupTour()
  //       this.configSvc.completedTour = true
  //       this.configSvc.prefChangeNotifier.next({ completedTour: this.configSvc.completedTour })
  //       // this.tour = tour
  //       setTimeout(
  //         () => {
  //           this.tourService.cancelPopupTour()
  //         },
  //         3000,
  //       )
  //     }
  //   })
  // }
  cancelTour() {
    if (this.popupTour) {
      // this.tourService.cancelPopupTour()
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
      // tslint:disable-next-line:no-console
      console.log(this.preferedLanguage)
    })
  }
}
