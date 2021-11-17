import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core'
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router'
// import { Location } from '@angular/common'

// import { interval, concat, timer } from 'rxjs'
import { BtnPageBackService } from '@ws-widget/collection'
import {
  AuthKeycloakService,
  // AuthKeycloakService,
  ConfigurationsService,
  TelemetryService,
  ValueService,
  WsEvents,
} from '@ws-widget/utils'
import { delay } from 'rxjs/operators'
import { MobileAppsService } from '../../services/mobile-apps.service'
import { RootService } from './root.service'
import { LoginResolverService } from '../../../../library/ws-widget/resolver/src/public-api'
import { ExploreResolverService } from './../../../../library/ws-widget/resolver/src/lib/explore-resolver.service'
import { OrgServiceService } from '../../../../project/ws/app/src/lib/routes/org/org-service.service'
// import { SwUpdate } from '@angular/service-worker'
// import { environment } from '../../../environments/environment'
// import { MatDialog } from '@angular/material'
// import { DialogConfirmComponent } from '../dialog-confirm/dialog-confirm.component'

@Component({
  selector: 'ws-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
})
export class RootComponent implements OnInit, AfterViewInit {
  @ViewChild('previewContainer', { read: ViewContainerRef, static: true })
  previewContainerViewRef: ViewContainerRef | null = null
  @ViewChild('appUpdateTitle', { static: true })
  appUpdateTitleRef: ElementRef | null = null
  @ViewChild('appUpdateBody', { static: true })
  appUpdateBodyRef: ElementRef | null = null

  isXSmall$ = this.valueSvc.isXSmall$
  routeChangeInProgress = false
  showNavbar = false
  currentUrl!: string
  isNavBarRequired = false
  isInIframe = false
  appStartRaised = false
  isSetupPage = false
  showNavigation = true
  hideHeaderFooter = false
  constructor(
    private router: Router,
    public authSvc: AuthKeycloakService,
    public configSvc: ConfigurationsService,
    private valueSvc: ValueService,
    private telemetrySvc: TelemetryService,
    private mobileAppsSvc: MobileAppsService,
    private rootSvc: RootService,
    private btnBackSvc: BtnPageBackService,
    private changeDetector: ChangeDetectorRef,
    private loginServ: LoginResolverService,
    private exploreService: ExploreResolverService,
    private orgService: OrgServiceService,
    // private location: Location
  ) {
    this.mobileAppsSvc.init()
  }

  ngOnInit() {
    if (!this.loginServ.isInitialized) {
      this.loginServ.initialize()
    }
    if (!this.exploreService.isInitialized) {
      this.exploreService.initialize()
    }
    try {
      this.isInIframe = window.self !== window.top
    } catch (_ex) {
      this.isInIframe = false
    }

    this.btnBackSvc.initialize()
    // Application start telemetry

    if (this.configSvc.isAuthenticated) {
      this.telemetrySvc.start('app', 'view', '')
      this.appStartRaised = true

    } else {
      if ((window.location.href).indexOf('register') > 0 || (window.location.href).indexOf('forgot-password') > 0) {
        this.showNavigation = false
      } else if ((window.location.href).indexOf('login') > 0) {
        this.showNavigation = true
      }
    }
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        if (event.url.includes('/setup/')) {
          this.isSetupPage = true
        }
      }
      if (event instanceof NavigationStart) {
        if (event.url.includes('preview') || event.url.includes('embed') || event.url.includes('/public/register')
          || event.url.includes('/app/org-details')) {
          this.isNavBarRequired = false
        } else if (event.url.includes('author/') && this.isInIframe) {
          this.isNavBarRequired = false
        } else {
          this.isNavBarRequired = true
        }
        this.routeChangeInProgress = true
        this.changeDetector.detectChanges()
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.routeChangeInProgress = false
        this.currentUrl = event.url
        this.changeDetector.detectChanges()
      }

      if (sessionStorage.getItem('loginbtn') || (sessionStorage.getItem('url_before_login'))) {
        this.isNavBarRequired = true
        this.showNavigation = false
      } else {
        this.isNavBarRequired = false
        this.showNavigation = true
        // this.authSvc.logout();
        // window.location.href = `${redirectUrl}apis/reset`
      }

      if (event instanceof NavigationEnd) {
        this.telemetrySvc.impression()
        if (this.appStartRaised) {
          this.telemetrySvc.audit(WsEvents.WsAuditTypes.Created, 'Login', {})
          this.appStartRaised = false
        }
      }
    })

    this.rootSvc.showNavbarDisplay$.pipe(delay(500)).subscribe(display => {
      this.showNavbar = display
    })
    this.orgService.hideHeaderFooter.subscribe(show => {
      this.hideHeaderFooter = show
    })
    if (sessionStorage.getItem('url_before_login')) {
      const url = sessionStorage.getItem(`url_before_login`) || ''

      // this.router.navigate([`app/toc/`+`${data.identifier}`+`/overview`])
      // this.location.replaceState(url)
      this.router.navigateByUrl(url)
    }

  }

  ngAfterViewInit() {
    // this.initAppUpdateCheck()
  }

}
