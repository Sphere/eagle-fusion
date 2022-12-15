import { IBtnAppsConfig } from './../../../../library/ws-widget/collection/src/lib/btn-apps/btn-apps.model'

import { Component, OnInit, OnDestroy, Input, SimpleChanges, OnChanges, HostListener } from '@angular/core'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import { ConfigurationsService, NsPage, NsInstanceConfig, ValueService } from '@ws-widget/utils'
import { Observable, Subscription } from 'rxjs'
import { ActivatedRoute, Router } from '@angular/router'
import { IWSPublicLoginConfig } from '../login/login.model'
import { NsWidgetResolver } from '../../../../library/ws-widget/resolver/src/public-api'
import { AuthKeycloakService } from './../../../../library/ws-widget/utils/src/lib/services/auth-keycloak.service'
// import { HttpClient } from '@angular/common/http'
import { SignupService } from '../../routes/signup/signup.service'
@Component({
  selector: 'ws-app-public-nav-bar',
  templateUrl: './app-public-nav-bar.component.html',
  styleUrls: ['./app-public-nav-bar.component.scss'],
})
export class AppPublicNavBarComponent implements OnInit, OnChanges, OnDestroy {
  @Input() mode: 'top' | 'bottom' = 'top'
  appIcon: SafeUrl | null = null
  logo = ''
  appName = ''
  navBar: Partial<NsPage.INavBackground> | null = null
  isClientLogin = false
  private subscriptionLogin: Subscription | null = null
  loginConfig: IWSPublicLoginConfig | null = null
  redirectUrl = ''
  primaryNavbarConfig: NsInstanceConfig.IPrimaryNavbarConfig | null = null
  pageNavbar: Partial<NsPage.INavBackground> | null = null
  featureApps: string[] = []
  appBottomIcon?: SafeUrl
  showCreateBtn = false
  hideCreateButton = false

  basicBtnAppsConfig: NsWidgetResolver.IRenderConfigWithTypedData<IBtnAppsConfig> = {
    widgetType: 'actionButton',
    widgetSubType: 'actionButtonApps',
    widgetData: { allListingUrl: '/app/features' },
  }
  instanceVal = ''
  btnAppsConfig!: NsWidgetResolver.IRenderConfigWithTypedData<IBtnAppsConfig>
  isXSmall$: Observable<boolean>

  constructor(
    private domSanitizer: DomSanitizer,
    private configSvc: ConfigurationsService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private valueSvc: ValueService,
    private signUpSvc: SignupService,
    // private http: HttpClient,
    private authSvc: AuthKeycloakService) {
    this.isXSmall$ = this.valueSvc.isXSmall$
    this.btnAppsConfig = { ...this.basicBtnAppsConfig }
  }

  public get showPublicNavbar(): boolean {
    return true
  }

  async ngOnInit() {
    if (localStorage.getItem('orgValue') === 'nhsrc') {
      this.hideCreateButton = true
    }
    if (this.configSvc.instanceConfig) {
      // try {
      //   await this.http.get('/apis/proxies/v8/logout/user').subscribe(
      //     (res: any) => {
      //       // tslint:disable-next-line:no-console
      //       console.log(res)
      //       localStorage.setItem('loggedout', JSON.stringify(res))
      //     },
      //     (err: any) => {
      //       console.log(this.router.url)
      //       // tslint:disable-next-line:no-console
      //       console.log(err)
      //     }
      //   )
      //   localStorage.removeItem('telemetrySessionId')
      //   localStorage.removeItem('loginbtn')
      //   localStorage.removeItem('tocData')
      //   localStorage.removeItem(`userUUID`)
      //   // const url = `${document.baseURI}public/home`
      //   // const Keycloakurl = `${document.baseURI}auth/
      // realms/sunbird/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent(url)}`
      //   // window.location.href = Keycloakurl
      // } catch (error) { }

      this.appIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
        this.configSvc.instanceConfig.logos.app,
      )
      this.appName = this.configSvc.instanceConfig.details.appName
      this.navBar = this.configSvc.pageNavBar
      this.primaryNavbarConfig = this.configSvc.primaryNavBarConfig
    }

    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      if (isXSmall && (this.configSvc.userProfile === null)) {
        this.showCreateBtn = false
      } else {
        this.showCreateBtn = true
      }
    })

    // this.subscriptionLogin = this.activateRoute.data.subscribe(data => {
    //   // todo
    //   this.loginConfig = data.pageData.data
    //   this.isClientLogin = data.pageData.data.isClient
    // })

    const paramsMap = this.activateRoute.snapshot.queryParamMap
    const href = window.location.href
    if (paramsMap.has('ref')) {
      this.redirectUrl = document.baseURI + paramsMap.get('ref')
    } else if (href.indexOf('org-details') > 0) {
      this.redirectUrl = href
    } else {
      this.redirectUrl = `${document.baseURI}openid/keycloak`
    }

    // added from app nav
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
      this.pageNavbar = this.configSvc.pageNavBar
      this.primaryNavbarConfig = this.configSvc.primaryNavBarConfig
    }
    if (this.configSvc.appsConfig) {
      this.featureApps = Object.keys(this.configSvc.appsConfig.features)
    }
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

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      if (isXSmall && (this.configSvc.userProfile === null)) {
        this.showCreateBtn = false
      } else {
        this.showCreateBtn = true
      }
    })
  }

  createAcct() {
    this.router.navigateByUrl('app/create-account')
  }
  login(key: 'E' | 'N' | 'S') {
    if (localStorage.getItem('login_url')) {
      const url: any = localStorage.getItem('login_url')
      window.location.href = url
    }
    // localStorage.removeItem('url_before_login')
    // this.router.navigateByUrl('app/login')
    this.signUpSvc.keyClockLogin()
    // const state = uuid()
    // const nonce = uuid()
    // sessionStorage.setItem('login-btn', 'clicked')
    // tslint:disable-next-line:max-line-length
    // const Keycloakurl = `${document.baseURI}auth/realms/sunbird/protocol/openid-connect/auth?client_id=portal&redirect_uri=${encodeURIComponent(this.redirectUrl)}&state=${state}&response_mode=fragment&response_type=code&scope=openid&nonce=${nonce}`
    // window.location.href = Keycloakurl
    this.authSvc.login(key, this.redirectUrl)
  }

  ngOnDestroy() {
    if (this.subscriptionLogin) {
      this.subscriptionLogin.unsubscribe()
    }
  }
}
