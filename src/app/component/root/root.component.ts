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
import split from 'lodash/split'
import { Plugins } from '@capacitor/core'
//import { v4 as uuid } from 'uuid'
const { App } = Plugins
//import { SignupService } from 'src/app/routes/signup/signup.service'
// import { SwUpdate } from '@angular/service-worker'
// import { environment } from '../../../environments/environment'
// import { MatDialog } from '@angular/material'
// import { DialogConfirmComponent } from '../dialog-confirm/dialog-confirm.component'
import { CsModule } from '@project-sunbird/client-services'
import { Title } from '@angular/platform-browser'
import { DOCUMENT } from '@angular/common'
import { mapTo } from 'rxjs/operators'
import { Observable, fromEvent, merge, of } from 'rxjs'
import { DomSanitizer } from '@angular/platform-browser'
import { forkJoin } from 'rxjs'
import { UserProfileService } from 'project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { WidgetContentService } from '../../../../library/ws-widget/collection/src/public-api'
import { ConfigService as CompetencyConfiService } from '../../routes/competency/services/config.service'
import { UserAgentResolverService } from 'src/app/services/user-agent.service'
import forEach from 'lodash/forEach'
import { WidgetUserService } from '../../../../library/ws-widget/collection/src/public-api'

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
  featuredCourse: any = []
  userId: any
  preferedLanguage: any = { id: 'en', lang: 'English' }
  homeFeature: any
  topCertifiedCourseIdentifier: any = []
  featuredCourseIdentifier: any = []
  topCertifiedCourse: any = []
  userEnrollCourse: any

  isXSmall$ = this.valueSvc.isXSmall$
  routeChangeInProgress = false
  showNavbar = false
  currentUrl!: string
  isNavBarRequired = false
  isInIframe = false
  appStartRaised = false
  isSetupPage = false
  createAcc = false
  isHomePage = false
  showNavigation = true
  hideHeaderFooter = false
  isLoggedIn = false
  mobileView = true
  showmobileFooter = true
  showMobileDashboard = true
  isCommonChatEnabled = true
  online$: Observable<boolean>
  appOnline: boolean | undefined
  paramsJSON!: string
  videoData: any

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
    //private signupService: SignupService,
    private titleService: Title,
    private activatedRoute: ActivatedRoute,
    private _renderer2: Renderer2,
    private sanitizer: DomSanitizer,
    private userProfileSvc: UserProfileService,
    private contentSvc: WidgetContentService,
    private CompetencyConfiService: CompetencyConfiService,
    private UserAgentResolverService: UserAgentResolverService,
    private userSvc: WidgetUserService,
    @Inject(DOCUMENT) private _document: Document
  ) {
    this.online$ = merge(
      of(navigator.onLine),
      fromEvent(window, 'online').pipe(mapTo(true)),
      fromEvent(window, 'offline').pipe(mapTo(false))
    )
    this.networkStatus()

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

  public networkStatus() {
    this.online$.subscribe(value => {
      this.appOnline = value
    })
  }

  ngOnInit() {
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
      forkJoin([this.userSvc.fetchUserBatchList(this.userId)]).pipe().subscribe((res: any) => {
        this.formatmyCourseResponse(res[0])
      })
      localStorage.setItem(`userUUID`, this.configSvc.unMappedUser.userId)
    }

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
      if ((window.location.href).indexOf('register') > 0 ||
        (window.location.href).indexOf('forgot-password') > 0 || window.location.href.indexOf('scrom-player') > 0) {
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
        if (this.router.url === '/page/home' && !this.configSvc.unMappedUser) {
          window.location.href = "public/home"
        }
        if (this.router.url === '/public/home' && this.configSvc.unMappedUser) {
          window.location.href = "page/home"
        }
        if (event.url.includes('/setup/')) {
          this.isSetupPage = true
        }
        if (event.url.includes('/app/create-account')) {
          this.showNavigation = false
          this.createAcc = true
        }

        if (event.url.includes('/public/login')) {
          this.showNavigation = false
        }
        if (this.router.url === '/page/home' || this.router.url === '/public/home' || this.router.url === '/') {
          this.isHomePage = true
        } else {
          this.isHomePage = false
        }
      }

      if (this.configSvc.userProfile === null) {
        this.isNavBarRequired = false
      }
      if (event instanceof NavigationStart) {

        if (event.url.includes('/public/scrom-player')) {
          this.showmobileFooter = false
        }
        if (event.url.includes('/app/create-account')) {
          this.showmobileFooter = false
        }
        if (event.url.includes('/public/login')) {
          this.showmobileFooter = false
        }
        // if (window.location.href.indexOf('scrom-player') > 0) {
        //   this.showmobileFooter = false
        // }
        // tslint:disable-next-line: max-line-length
        if (event.url.includes('preview') || event.url.includes('embed') || event.url.includes('/public/register')) {
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
          let lang = `${document.baseURI}`
          lang = lang.includes('hi') ? 'hi/' : ''
          if (lang === 'hi') {
            localStorage.setItem(`url_before_login`, `hi/app/toc/` + `${split(event.url, '/')[3]
              }` + `/overview`)
          } else {
            localStorage.setItem(`url_before_login`, `app/toc/` + `${split(event.url, '/')[3]
              }` + `/overview`)
          }
          sessionStorage.setItem('login-btn', 'clicked')
          if (!localStorage.getItem('userUUID')) {
            location.href = '/public/login'
          }
          // setTimeout(() => {
          // this.signupService.fetchStartUpDetails().then(result => {
          //     if (result && result.status !== 200) {
          //       this.authSvc.logout()
          //       //this.router.navigate(['/public/login'])
          //       // let url = `${document.baseURI}`
          //       // let redirectUrl = `${document.baseURI}openid/keycloak`
          //       // const state = uuid()
          //       // const nonce = uuid()
          //       // if (url.includes('hi')) {
          //       //   url = url.replace('hi/', '')
          //       //   redirectUrl = `${url}openid/keycloak`
          //       //   sessionStorage.setItem('lang', 'hi')
          //       // } else {
          //       //   redirectUrl = `${url}openid/keycloak`
          //       // }
          //       // // tslint:disable-next-line:max-line-length
          //       // const keycloakurl = `${url}auth/realms/sunbird/protocol/openid-connect/auth?client_id=portal&redirect_uri=${encodeURIComponent(redirectUrl)}&state=${state}&response_mode=fragment&response_type=code&scope=openid&nonce=${nonce}`
          //       // window.location.href = keycloakurl
          //     }
          //   })

          // }, 100)
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

        }
        else if (event.url.includes('login')) {
          if (localStorage.getItem('userUUID')) {
            if (localStorage.getItem('url_before_login')) {
              const url = localStorage.getItem('url_before_login') || ''
              location.href = url
            } else if (this.configSvc.unMappedUser) {
              window.location.href = '/page/home'
            }
          }

          // setTimeout(() => {
          //   this.signupService.fetchStartUpDetails().then(result => {
          //     if (result && result.status !== 200) {
          //       //this.router.navigate(['/public/login'])
          //       this.authSvc.logout()
          //       // const redirectUrl = `${document.baseURI}openid/keycloak`
          //       // const state = uuid()
          //       // const nonce = uuid()
          //       // // tslint:disable-next-line:max-line-length
          //       // const keycloakurl = `${document.baseURI}auth/realms/sunbird/protocol/openid-connect/auth?client_id=portal&redirect_uri=${encodeURIComponent(redirectUrl)}&state=${state}&response_mode=fragment&response_type=code&scope=openid&nonce=${nonce}`
          //       // window.location.href = keycloakurl
          //     } else {
          //       this.router.navigateByUrl('/page/home')
          //     }
          //   }, (err: any) => {
          //     console.log(err)
          //     if (err.status === 419) {
          //       this.router.navigate(['/public/login'])
          //     }
          //   })

          // }, 10)
        }
        else if (event.url.includes('page/home')) {
          this.hideHeaderFooter = false
          this.isNavBarRequired = true
          this.mobileView = true
          // if (this.configSvc.userProfile === null) {
          //   this.isNavBarRequired = false
          // }
          // tslint:disable-next-line: max-line-length
        } else if (event.url.includes('/public/home')) {
          this.showNavigation = true
        } else if (event.url.includes('/app/login') || event.url.includes('/app/mobile-otp') ||
          event.url.includes('/app/email-otp') || event.url.includes('/public/forgot-password') ||
          event.url.includes('/app/create-account')) {
          this.hideHeaderFooter = true
          this.isNavBarRequired = false
          this.showMobileDashboard = false
          this.mobileView = false
        } else if (event.url.includes('public/tnc')) {
          this.isNavBarRequired = false
          this.hideHeaderFooter = true
        }

        else if (event.url.includes('/app/about-you') || event.url.includes('/app/new-tnc')) {
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
        const paramMap = this.activatedRoute.snapshot.queryParamMap
        const params = {}

        paramMap.keys.forEach((key: any) => {
          const paramValue = paramMap.get(key)
          params[key] = paramValue
        })

        this.paramsJSON = JSON.stringify(params)
        const userAgent = this.UserAgentResolverService.getUserAgent()

        this.telemetrySvc.paramTriggerImpression(this.paramsJSON, userAgent.browserName, userAgent.OS)
        if (this.appStartRaised) {
          this.telemetrySvc.audit(WsEvents.WsAuditTypes.Created, 'Login', {})
          this.appStartRaised = false
        }
        if (!this.configSvc.userProfile) {
          this.telemetrySvc.publicImpression(this.paramsJSON, userAgent.browserName, userAgent.OS)
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
    this.videoData = [
      {
        url: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/1fqlys8mkHg'),
        title: 'Register for a course',
        description: 'Explore various courses and pick the ones you like',
      },
      {
        url: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/Kl28R7m2k50'),
        title: 'Take the course',
        description: 'Access the course anytime, at your convinience',
      },
      {
        url: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/JTGzCkEXlmU'),
        title: 'Get certified',
        description: 'Receive downloadable and shareable certificates',
      },
    ]
    if (this.configSvc.userProfile) {
      forkJoin([this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id),
      this.contentSvc.fetchUserBatchList(this.configSvc.unMappedUser.id)]).pipe().subscribe((res: any) => {
        this.setCompetencyConfig(res[0])
      })
    }
  }
  formatmyCourseResponse(res: any) {
    const myCourse: any = []
    let myCourseObject = {}
    forEach(res, (key: { content: { identifier: any; appIcon: any; thumbnail: any; name: any; sourceName: any } }) => {
      if (res.completionPercentage !== 100) {
        myCourseObject = {
          identifier: key.content.identifier,
          appIcon: key.content.appIcon,
          thumbnail: key.content.thumbnail,
          name: key.content.name,
          sourceName: key.content.sourceName,
        }
        myCourse.push(myCourseObject)
      }
    })
    this.userEnrollCourse = myCourse
  }
  getReferrerUrl(): string {
    return this._renderer2 && this._renderer2['data'].referrer || ''
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
      // this.isCommonChatEnabled = false
      const script = this._renderer2.createElement('script')
      script.src = '//in.fw-cdn.com/30492305/271953.js'
      this._renderer2.appendChild(this._document.body, script)
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(error)
    }
  }
  setCompetencyConfig(data: any) {
    if (data.profileDetails) {
      this.CompetencyConfiService.setConfig(data.profileDetails.profileReq, data.profileDetails)
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
