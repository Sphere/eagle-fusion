import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewContainerRef,
  Renderer2,
  Inject,
} from '@angular/core'
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  ActivatedRoute,
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
import { delay, filter, map } from 'rxjs/operators'
import { MobileAppsService } from '../../services/mobile-apps.service'
import { RootService } from './root.service'
import { LoginResolverService } from '../../../../library/ws-widget/resolver/src/public-api'
import { ExploreResolverService } from './../../../../library/ws-widget/resolver/src/lib/explore-resolver.service'
import { OrgServiceService } from '../../../../project/ws/app/src/lib/routes/org/org-service.service'
import * as _ from 'lodash'
import { Plugins } from '@capacitor/core'
import { v4 as uuid } from 'uuid'
const { App } = Plugins
import { SignupService } from 'src/app/routes/signup/signup.service'
// import { SwUpdate } from '@angular/service-worker'
// import { environment } from '../../../environments/environment'
// import { MatDialog } from '@angular/material'
// import { DialogConfirmComponent } from '../dialog-confirm/dialog-confirm.component'
import { CsModule } from '@project-sunbird/client-services'
import { Title } from '@angular/platform-browser'
import { DOCUMENT } from '@angular/common'
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
  isLoggedIn = false
  mobileView = true
  showMobileDashboard = true
  isCommonChatEnabled = true
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
    private signupService: SignupService,
    private titleService: Title,
    private activatedRoute: ActivatedRoute,
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document
  ) {

    this.mobileAppsSvc.init()
    const locationOrigin = location.origin
    CsModule.instance.init({
      core: {
        httpAdapter: 'HttpClientBrowserAdapter',
        global: {
          channelId: '', // required
          producerId: '', // required
          deviceId: '', // required
          sessionId: '',
        },
        api: {
          host: `${locationOrigin}/apis/proxies/v8`, // default host
          // host: 'http://localhost:3004/proxies/v8', // default host
          // host: 'http://localhost:3002', // default host
          authentication: {
            // bearerToken: "", // optional
            // userToken: "5574b3c5-16ca-49d8-8059-705304f2c7fb"
            // bearerToken: this.loginToken,
            // optional
          },
        },
      },
      services: {
        groupServiceConfig: {
          apiPath: '/learner/group/v1',
          dataApiPath: '/learner/data/v1/group',
          updateGroupGuidelinesApiPath: '/learner/group/membership/v1',
        },
        userServiceConfig: {
          apiPath: '/learner/user/v2',
        },
        formServiceConfig: {
          apiPath: '/learner/data/v1/form',
        },
        courseServiceConfig: {
          apiPath: '/learner/course/v1',
          certRegistrationApiPath: '/learner/certreg/v2/certs',
        },
        discussionServiceConfig: {
          apiPath: '/discussion',
        },
      },
    })
  }

  ngOnInit() {
    this.setPageTitle()
    this.fcSettingsFunc()

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
    App.addListener('backButton', () => {

      window.history.go(-1)

    })

    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        if (event.url.includes('/setup/')) {
          this.isSetupPage = true
        }
      }

      if (this.configSvc.userProfile === null) {
        this.isNavBarRequired = false
      }
      if (event instanceof NavigationStart) {
        // tslint:disable-next-line: max-line-length
        if (event.url.includes('preview') || event.url.includes('embed') || event.url.includes('/public/register') || event.url.includes('/app/org-details')) {
          this.isNavBarRequired = false
          this.hideHeaderFooter = true
        } else if (event.url.includes('author/') && this.isInIframe) {
          this.isNavBarRequired = false
          // tslint:disable-next-line: max-line-length
        } else if (event.url.includes('app/toc')) {
          if (this.configSvc.userProfile !== null) {
            this.mobileView = false
          }
          this.hideHeaderFooter = false
          this.isNavBarRequired = true
          // this.showNavigation = true
          this.isLoggedIn = true
          localStorage.setItem(`url_before_login`, `app/toc/` + `${_.split(event.url, '/')[3]
            }` + `/overview`)
          sessionStorage.setItem('login-btn', 'clicked')
          setTimeout(() => {
            this.signupService.fetchStartUpDetails().then(result => {
              if (result && result.status !== 200) {

                const redirectUrl = `${document.baseURI}openid/keycloak`
                const state = uuid()
                const nonce = uuid()
                // tslint:disable-next-line:max-line-length
                const keycloakurl = `${document.baseURI}auth/realms/sunbird/protocol/openid-connect/auth?client_id=portal&redirect_uri=${encodeURIComponent(redirectUrl)}&state=${state}&response_mode=fragment&response_type=code&scope=openid&nonce=${nonce}`
                window.location.href = keycloakurl
              }
            })

          }, 10)
          // if (this.configSvc.userProfile === null) {
          //   localStorage.setItem(`url_before_login`, `app/toc/` + `${_.split(event.url, '/')[3]
          //     }` + `/overview`)
          //   sessionStorage.setItem('login-btn', 'clicked')
          //   const redirectUrl = document.baseURI + 'openid/keycloak'
          //   const state = uuid()
          //   const nonce = uuid()
          // tslint:disable-next-line:max-line-length
          //   window.location.assign(`${document.baseURI}auth/realms/sunbird/protocol/openid-connect/auth?client_id=portal&redirect_uri=${encodeURIComponent(redirectUrl)}&state=${state}&response_mode=fragment&response_type=code&scope=openid&nonce=${nonce}`)
          //   // this.router.navigateByUrl('app/login')
          // }

        } else if (event.url.includes('page/home')) {
          this.hideHeaderFooter = false
          this.isNavBarRequired = true
          this.mobileView = true
          // if (this.configSvc.userProfile === null) {
          //   this.isNavBarRequired = false
          // }
          // tslint:disable-next-line: max-line-length
        } else if (event.url.includes('/app/login') || event.url.includes('/app/mobile-otp') ||
          event.url.includes('/app/email-otp') || event.url.includes('/public/forgot-password') ||
          event.url.includes('/app/create-account')) {
          this.hideHeaderFooter = true
          this.isNavBarRequired = false
          this.showMobileDashboard = false
          this.mobileView = false
        } else if (event.url.includes('/app/about-you') || event.url.includes('/app/new-tnc')) {
          this.isNavBarRequired = true
          this.hideHeaderFooter = true
          this.mobileView = false
        } else if (event.url.includes('/app/search/learning') || event.url.includes('/app/video-player') ||
          event.url.includes('/app/profile/dashboard')) {
          this.mobileView = false
          this.isNavBarRequired = true
          this.showNavbar = true
        } else {
          this.isNavBarRequired = true
          this.mobileView = false
        }
        // this.valueSvc.isXSmall$.subscribe(isXSmall => {
        //   if (event.url.includes('/app/profile/dashboard')) {
        //     if (isXSmall) {
        //       this.router.navigate(['/app/profile-view'])
        //     }
        //   } else if (event.url.includes('/app/profile-view') || event.url.includes('/workinfo-list') ||
        //     event.url.includes('/workinfo-edit') || event.url.includes('/education-list')) {
        //     if (!isXSmall) {
        //       this.router.navigate(['/app/profile/dashboard'])
        //     }
        //   } else if (!isXSmall && event.url.includes('/app/video-player') &&
        //     this.configSvc.userProfile === null) {
        //     this.router.navigate(['/public/home'])
        //   }
        // })
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

      // if (localStorage.getItem('loginbtn') || (localStorage.getItem('url_before_login'))) {
      //   this.isNavBarRequired = true
      //   this.showNavigation = false
      // } else {
      //   this.isNavBarRequired = false
      //   this.showNavigation = true
      // }

      // if (this.configSvc.unMappedUser) {
      //   this.isNavBarRequired = true
      //   //this.showNavbar = true
      // }
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

    // if (localStorage.getItem('url_before_login')) {
    //   const url = localStorage.getItem(`url_before_login`) || ''
    //   // this.router.navigate([`app/toc/`+`${data.identifier}`+`/overview`])
    //   // this.location.replaceState(url)
    //   this.router.navigateByUrl(url)
    // }

    if (localStorage.getItem('orgValue') === 'nhsrc') {
      if (localStorage.getItem('url_before_login')) {
        const url = localStorage.getItem(`url_before_login`) || ''
        this.router.navigateByUrl(url)
      }
    }
    if (this.configSvc.userProfile) {
      this.isLoggedIn = true
    } else {
      this.isLoggedIn = false
    }
  }

  ngAfterViewInit() {
    // this.initAppUpdateCheck()
    try {
      if (window.fcWidget) {
        window.fcWidget.hide()
        window.fcWidget.on('widget:closed', () => {
          // this.backToChatIcon()
        })
      }
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(error)
    }

  }

  // freshChat functionality
  fcSettingsFunc() {
    try {
      if (window.fcWidget) {
        window.fcWidget.setConfig({ headerProperty: { hideChatButton: true } })
        // window.fcWidget.setConfig({ headerProperty: { direction: 'ltr' } })
        window.fcWidget.init()
        if (this.configSvc.userProfile) {
          window.fcWidget.user.setFirstName(this.configSvc.userProfile.firstName)
          window.fcWidget.user.setLastName(this.configSvc.userProfile.lastName)
          window.fcWidget.user.setPhone(this.configSvc.userProfile.phone)
          window.fcWidget.user.setMeta({ userId: this.configSvc.userProfile.userId, username: this.configSvc.userProfile.userName })
        }
      }
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(error)
    }
  }

  showSocialChats() {
    try {
      setTimeout(() => {
        this.isCommonChatEnabled = false
        window.fcWidget.init()
        window.fcWidget.setConfig({ headerProperty: { hideChatButton: false } })
        window.fcWidget.setConfig({ headerProperty: { direction: 'ltr' } })
      }, 300)
      // window.fcWidget.show()
      //this.isCommonChatEnabled = false
      const script = this._renderer2.createElement('script')
      script.src = '//in.fw-cdn.com/30492305/271953.js'
      this._renderer2.appendChild(this._document.body, script)
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(error)
    }
  }

  backToChatIcon() {
    try {
      this.isCommonChatEnabled = true
      window.fcWidget.setConfig({ headerProperty: { hideChatButton: true } })
      window.fcWidget.init()
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(error)
    }
  }

  // set page title
  setPageTitle() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        const appTitle = this.titleService.getTitle()
        const child = this.activatedRoute.firstChild
        if ((child !== null)) {
          if (child.snapshot.data['title']) {
            return child.snapshot.data['title']
          }
          return appTitle
        }
        return appTitle
      })
    ).subscribe((title: string) => {
      this.titleService.setTitle(title)
    })
  }
}
