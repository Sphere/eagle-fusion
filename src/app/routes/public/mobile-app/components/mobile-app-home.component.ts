import { Platform } from '@angular/cdk/platform'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import { ActivatedRoute, Data } from '@angular/router'
import { ConfigurationsService, NsPage } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import { MobileAppsService } from 'src/app/services/mobile-apps.service'

interface IMobileAppLink {
  appsAndroid: string
  appsAndroidMirror?: string
  appsIos: string
  appsIosSanitized?: SafeUrl
  showQrCode?: boolean
  code?: string
  isClient?: boolean
  appName?: string
  nameProvidedByClient?: string
  instructions?: string
  androidQR?: string
  androidMirrorQR?: string
  iosQR?: string
}

@Component({
  selector: 'ws-app-mobile-app-home',
  templateUrl: './mobile-app-home.component.html',
  styleUrls: ['./mobile-app-home.component.scss'],
})
export class MobileAppHomeComponent implements OnInit, OnDestroy {
  selectedTabIndex = this.matPlatform.IOS ? 1 : 0
  mobileLinks: IMobileAppLink | null = null
  isAndroidPlayStoreLink = false
  isClient = false
  mobilePlatformCode: string | undefined
  androidVal: string | undefined = undefined
  androidMirrorVal: string | null = null
  iosVal: string | null = null
  iosSanitizedVal: string | null = null
  routeSubscription: Subscription | null = null
  isAndriod = true
  isIos = true
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar

  constructor(
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private matPlatform: Platform,
    private mobileService: MobileAppsService,
    private configSvc: ConfigurationsService,
  ) { }

  ngOnInit() {
    if (this.mobileService.iOsAppRef) {
      this.isAndriod = false
    }
    if (this.mobileService.isAndroidApp) {
      this.isIos = false
    }
    if (this.route) {
      this.routeSubscription = this.route.data.subscribe((data: Data) => {
        this.mobileLinks = data.pageData.data
        if (this.mobileLinks) {
          this.isClient = this.mobileLinks.isClient || false
          this.mobilePlatformCode = this.mobileLinks.code
          this.mobileLinks.appsIosSanitized = this.sanitizer.bypassSecurityTrustUrl(
            this.mobileLinks.appsIos,
          )
          if (this.mobileLinks.showQrCode) {
            this.isAndroidPlayStoreLink = true
          }
        }
      })
    }
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe()
    }
  }
}
