import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  OnDestroy,
  Injector,
  effect,
} from '@angular/core'
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  ActivatedRoute,
  Event,
} from '@angular/router'
import { BtnPageBackService } from '@ws-widget/collection'
import {
  AuthKeycloakService,
  ConfigurationsService,
  TelemetryService,
  ValueService,
  WsEvents,
} from '@ws-widget/utils'
import { delay, filter, map, takeUntil } from 'rxjs/operators'
import { Subject } from 'rxjs'
import { MobileAppsService } from '../../services/mobile-apps.service'
import { UserDataCacheService } from '../../services/user-data-cache.service'
import { RootService } from './root.service'
import { LoginResolverService } from '../../../../library/ws-widget/resolver/src/public-api'
import { ExploreResolverService } from './../../../../library/ws-widget/resolver/src/lib/explore-resolver.service'
import { OrgServiceService } from '../../../../project/ws/app/src/lib/routes/org/org-service.service'
import { split } from 'lodash'
import { App } from '@capacitor/app'
import dayjs from 'dayjs'
import { Title } from '@angular/platform-browser'
import { mapTo } from 'rxjs/operators'
import { Observable, fromEvent, merge, of } from 'rxjs'
import { Subscription } from 'rxjs'
import { UserProfileService } from 'project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { WidgetContentService } from '../../../../library/ws-widget/collection/src/public-api'
import { ConfigService as CompetencyConfiService } from '../../routes/competency/services/config.service'
import { UserAgentResolverService } from 'src/app/services/user-agent.service'
import { WidgetUserService } from '../../../../library/ws-widget/collection/src/public-api'
import { ViewerUtilService } from 'project/ws/viewer/src/lib/viewer-util.service'
import { TranslateService } from '@ngx-translate/core'
import { PlaylistService } from '../../services/playlist.service'
import { CsModule } from '@project-sunbird/client-services'

@Component({
  selector: 'ws-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
})
export class RootComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>()
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
  isProfile: any = false
  isXSmall$: boolean = false
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
  disableChatForBnrc = false
  showMobileDashboard = true
  isCommonChatEnabled = true
  online$: Observable<boolean> = of(true)
  appOnline: boolean = true
  paramsJSON!: string
  videoData: any = []
  configData: any
  orgDetails: any
  private routerEventsSubscription: Subscription
  isEkshamata: boolean = false
  domain: string
  bodyConfig: any
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
    private titleService: Title,
    private activatedRoute: ActivatedRoute,
    private userProfileSvc: UserProfileService,
    private userDataCacheSvc: UserDataCacheService,
    private contentSvc: WidgetContentService,
    private CompetencyConfiService: CompetencyConfiService,
    private UserAgentResolverService: UserAgentResolverService,
    private userSvc: WidgetUserService,
    private viewerSvc: ViewerUtilService,
    private injector: Injector,
    private playlistSvc: PlaylistService,
  ) {
    const t = this.injector.get(TranslateService, null as any)
    console.log('[DEBUG] TranslateService present?', !!t, t ? t.currentLang : 'no service')
    this.domain = window.location.hostname
    if (this.domain.includes('ekshamata')) {
      this.isEkshamata = true
    }
    this.routerEventsSubscription = this.router.events.subscribe((event: Event) => {
      if (
        event instanceof NavigationEnd &&
        !event.url.toLowerCase().includes('/app/user/competency')
      ) {
        this.navigationInterceptor(event)
      }
    })

    // Subscribe to profile updates and clear cache when profile is modified
    this.userProfileSvc.updateuser$.subscribe((updatedProfile: any) => {
      if (updatedProfile) {
        console.log('[RootComponent] Profile updated, refreshing user data cache', updatedProfile)
        this.userDataCacheSvc.clearUserData()
        this.userProfileSvc.clearUserDetailsCache()
        // Set the updated profile data to session storage and subject
        if (updatedProfile.request && updatedProfile.request.profileDetails) {
          // Extract the full profile with the updated details
          const userData = this.configSvc.unMappedUser || {}
          if (updatedProfile.request.profileDetails.profileReq) {
            userData.profileDetails = updatedProfile.request.profileDetails
          }
          console.log('[RootComponent] Setting updated user data to cache')
          this.userDataCacheSvc.setUserData(userData)
        }
      }
    })

    this.online$ = merge(
      of(navigator.onLine),
      fromEvent(window, 'online').pipe(mapTo(true)),
      fromEvent(window, 'offline').pipe(mapTo(false)),
    )
    this.networkStatus()
    this.mobileAppsSvc.init()
    window.addEventListener('resize', () => {
      this.valueSvc.updateWidth(window.innerWidth)
    })

    effect(() => {
      this.isXSmall$ = this.valueSvc.isMobile()
    })
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
  ngOnDestroy() {
    if (this.routerEventsSubscription) {
      this.routerEventsSubscription.unsubscribe()
    }
    this.destroy$.next()
    this.destroy$.complete()
  }

  public networkStatus() {
    this.online$.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.appOnline = value
    })
  }
  openFreshChat() {
    window.fcWidget.open()
    window.fcWidget.show()
  }
  mergeProgressDetails(obj1: any, obj2: any) {
    // Create a new object to store the merged results
    let mergedObj = { ...obj1 }

    // Loop through the keys in obj2
    for (const key in obj2) {
      if (obj2.hasOwnProperty(key)) {
        // If the key exists in obj1, accept the latest value from obj2
        if (mergedObj.hasOwnProperty(key)) {
          mergedObj[key] = obj2[key]
        } else {
          // If the key doesn't exist in obj1, add it from obj2
          mergedObj[key] = obj2[key]
        }
      }
    }

    return mergedObj
  }

  private navigationInterceptor(event: Event): void {
    if (event instanceof NavigationStart) {
      console.log('Navigation started to URL:', event.url)
    }

    if (event instanceof NavigationEnd) {
      console.log('Navigation ended to URL:', event.url)
      let contentURL = localStorage.getItem('contentId')
      console.log(contentURL)
      if (contentURL) {
        const url: any = contentURL
        const path = url.split('?')[0] // Get the part before the query string
        const match = path.match(/do_[\w\d]+/) // Match the do_ identifier pattern
        let doId: any
        if (match) {
          doId = match[0] // Extract the first match
        }
        const urlParams = new URLSearchParams(url.split('?')[1])
        let collectionId: any = urlParams.get('collectionId')
        let batchId = urlParams.get('batchId')
        let storedData: any
        let userId
        if (this.configSvc.userProfile) {
          userId = this.configSvc.userProfile.userId || ''
        }
        const req: any = {
          request: {
            userId,
            batchId: batchId,
            courseId: collectionId,
            contentIds: [],
            fields: ['progressdetails'],
          },
        }
        // console.log(req)
        this.contentSvc
          .fetchContentHistoryV2(req)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            (data: any) => {
              let contentData: any
              contentData = data['result']['contentList']?.find(
                (obj: any) => obj.contentId === doId,
              )
              if (
                contentData &&
                (event.url.includes('/chapters') || event.url.includes('/app/toc')) &&
                event.url.includes(collectionId)
              ) {
                storedData = localStorage.getItem(doId)
                if (storedData) {
                  let dat = JSON.parse(storedData)
                  let mergedProgressDetails: any = this.mergeProgressDetails(
                    contentData.progressdetails,
                    dat,
                  )
                  delete mergedProgressDetails['errors']
                  if (this.configSvc.userProfile && Object.keys(dat).length > 0) {
                    const updateReq = {
                      request: {
                        userId: this.configSvc.userProfile.userId || '',
                        contents: [
                          {
                            contentId: doId,
                            batchId: batchId,
                            courseId: collectionId,
                            status: contentData.status,
                            lastAccessTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss:SSSZZ'),
                            progressdetails: mergedProgressDetails,
                            completionPercentage: contentData.completionPercentage,
                          },
                        ],
                        url: contentURL,
                      },
                    }
                    this.viewerSvc
                      .initUpdate(updateReq)
                      .pipe(takeUntil(this.destroy$))
                      .subscribe(
                        () => {
                          localStorage.removeItem('contentId')
                        },
                        err => {
                          console.error('Error updating progress:', err)
                        },
                      )
                  }
                }
              } else {
                console.warn('No data found for ID:', doId)
              }
            },
            err => {
              console.error('Error fetching content history:', err)
            },
          )
      }
    }

    if (event instanceof NavigationCancel) {
      console.log('Navigation canceled to URL:', event.url)
    }

    if (event instanceof NavigationError) {
      console.log('Navigation error to URL:', event.url)
    }
  }

  async ngOnInit() {
    this.handleRouterSubscription()
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
      this.userSvc
        .fetchUserBatchList(this.userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res: any) => {
            this.formatmyCourseResponse(res)
          },
          err => {
            console.error('Error fetching user batch list:', err)
          },
        )
      localStorage.setItem(`userUUID`, this.configSvc.unMappedUser.userId)
      if (sessionStorage.getItem('cURL')) {
        sessionStorage.removeItem('cURL')
      }
      this.isLoggedIn = true
    } else {
      this.isLoggedIn = false
    }
    if (this.configSvc.isAuthenticated) {
      this.appStartRaised = true
    } else {
      if (
        window.location.href.indexOf('register') > 0 ||
        window.location.href.indexOf('forgot-password') > 0 ||
        window.location.href.indexOf('scrom-player') > 0
      ) {
        this.showNavigation = false
      } else if (window.location.href.indexOf('login') > 0) {
        this.showNavigation = true
      }
    }
    this.setUpFormData()

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
      console.warn('Error determining if in iframe:', _ex)
      this.isInIframe = false
    }
    this.btnBackSvc.initialize()
    // Application start telemetry
    this.telemetrySvc.getTelemetryConfig()
    this.telemetrySvc.impression('page-loaded', 'init', 'static-home')
    App.addListener('backButton', () => {
      window.history.go(-1)
    })
    this.rootSvc.showNavbarDisplay$.pipe(delay(500)).subscribe(display => {
      this.showNavbar = display
    })
    this.orgService.hideHeaderFooter.subscribe(show => {
      this.router.events.subscribe((e: Event) => {
        if (e instanceof NavigationStart) {
          console.log(e)
        } else if (e instanceof NavigationEnd) {
          console.log(e)
          this.isHomePage = (e.url == '/page/home' || e.url == '/public/home') ? true : false
        }
      })
      if (window.location.pathname !== '/app/new-tnc')
        this.hideHeaderFooter = show
    })

    if (localStorage.getItem('orgValue') === 'nhsrc') {
      if (localStorage.getItem('url_before_login')) {
        const url = localStorage.getItem(`url_before_login`) || ''
        this.router.navigateByUrl(url)
      }
    }

    if (this.configSvc.userProfile) {
      this.userProfileSvc
        .getUserdetailsFromRegistry(this.configSvc.unMappedUser.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res: any) => {
            this.setCompetencyConfig(res)
          },
          err => {
            console.error('Error fetching user details:', err)
          },
        )
    }
  }

  async setUpFormData() {
    if (!this.orgDetails) {
      await this.playlistSvc.loadPlaylistData()
    }
    this.orgDetails = { ...this.playlistSvc.orgDetails(), ...this.playlistSvc.headerConfig() }
    this.configData = this.isLoggedIn ? this.playlistSvc.selectedTabConfig() : this.playlistSvc.config()
    this.bodyConfig = this.isLoggedIn ? this.playlistSvc.bodyConfig().homeTab : this.playlistSvc.config()
    if (this.playlistSvc.getSelectedTab() === 'homeTab') {
      this.showNavbar = true
      this.videoData = this.configData?.[this.configData?.length - 1]
      localStorage.setItem('videoData', JSON.stringify(this.videoData))
    }
  }

  handleRouterSubscription() {
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        if (this.router.url === '/page/home' && !this.configSvc.unMappedUser) {
          window.location.href = 'public/home'
        }
        if (this.router.url === 'profile-view') {
          this.isProfile = true
        }
        if (this.router.url === '/public/home' && this.configSvc.unMappedUser) {
          window.location.href = 'page/home'
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
        if (
          this.router.url.includes('/page/home') ||
          this.router.url.includes('/public/home') ||
          this.router.url === '/'
        ) {
          this.isHomePage = true
          this.isNavBarRequired = this.router.url.includes('/page/home') ?? true
        } else {
          this.isHomePage = false
        }
      }

      if (this.configSvc.userProfile === null) {
        this.isNavBarRequired = false
      }
      if (event instanceof NavigationStart) {
        if (this.router.url === 'profile-view') {
          this.isProfile = true
        }
        if (event.url.includes('/public/scrom-player')) {
          this.showmobileFooter = false
        }
        if (event.url.includes('/app/create-account')) {
          this.showmobileFooter = false
        }
        if (event.url.includes('/public/login') || event.url.includes('app/new-tnc')) {
          this.hideHeaderFooter = true
          this.showmobileFooter = false
        }
        if (
          event.url.includes('/bnrc/register') ||
          event.url.includes('/uttarpradesh/register') ||
          event.url.includes('/madhyapradesh/register')
        ) {
          this.showmobileFooter = false
          this.disableChatForBnrc = true
        }
        // tslint:disable-next-line: max-line-length
        if (
          event.url.includes('preview') ||
          event.url.includes('embed') ||
          event.url.includes('/public/register')
        ) {
          this.isNavBarRequired = false
          this.hideHeaderFooter = true
        } else if (event.url.includes('author/') && this.isInIframe) {
          this.isNavBarRequired = false
          // tslint:disable-next-line: max-line-length
        } else if (event.url.includes('/app/org-selective-course')) {
          this.isNavBarRequired = false
          this.showmobileFooter = false
        } else if (event.url.includes('app/toc')) {
          if (this.configSvc.userProfile !== null) {
            this.mobileView = false
          }
          this.hideHeaderFooter = false
          this.isNavBarRequired = true
          // this.showNavigation = true
          this.isLoggedIn = true
          localStorage.setItem(
            `url_before_login`,
            `app/toc/` + `${split(event.url, '/')[3]}` + `/overview`,
          )
          sessionStorage.setItem('login-btn', 'clicked')
          if (!localStorage.getItem('userUUID')) {
            location.href = '/public/login'
          }
        } else if (event.url.includes('login')) {
          if (localStorage.getItem('userUUID')) {
            if (localStorage.getItem('url_before_login')) {
              const url = localStorage.getItem('url_before_login') || ''
              location.href = url
            } else if (this.configSvc.unMappedUser) {
              window.location.href = '/page/home'
            }
          }
        } else if (event.url.includes('page/home')) {
          this.hideHeaderFooter = false
          this.isNavBarRequired = true
          this.mobileView = true
          // tslint:disable-next-line: max-line-length
        } else if (event.url.includes('/public/home')) {
          this.showNavigation = true
        } else if (
          event.url.includes('/app/login') ||
          event.url.includes('/app/mobile-otp') ||
          event.url.includes('/app/email-otp') ||
          event.url.includes('/public/forgot-password') ||
          event.url.includes('/app/create-account')
        ) {
          this.hideHeaderFooter = true
          this.isNavBarRequired = false
          this.showMobileDashboard = false
          this.mobileView = false
        } else if (event.url.includes('public/tnc')) {
          this.isNavBarRequired = false
          this.hideHeaderFooter = true
        } else if (event.url.includes('/app/about-you') || event.url.includes('/app/new-tnc')) {
          this.isNavBarRequired = true
          this.hideHeaderFooter = true
          this.mobileView = false
          this.showNavigation = false
        } else if (
          event.url.includes('/app/search/learning') ||
          event.url.includes('/app/video-player') ||
          event.url.includes('/app/profile/dashboard')
        ) {
          this.mobileView = false
          this.isNavBarRequired = true
          this.showNavbar = true
        } else {
          this.isNavBarRequired = true
          this.mobileView = false
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
      if (this.router.url === 'profile-view') {
        this.isProfile = true
      }
      if (event instanceof NavigationEnd) {
        // this.telemetrySvc.impression()
        const paramMap = this.activatedRoute.snapshot.queryParamMap
        const params: any = {}

        paramMap.keys.forEach((key: any) => {
          const paramValue = paramMap.get(key)
          params[key] = paramValue
        })

        this.paramsJSON = JSON.stringify(params)
        const userAgent = this.UserAgentResolverService.getUserAgent()

        if (this.appStartRaised) {
          this.telemetrySvc.audit(WsEvents.WsAuditTypes.Created, 'Login', {})
          this.appStartRaised = false
        }
        if (!this.configSvc.userProfile) {
          if (this.paramsJSON && this.paramsJSON !== '{}') {
            this.UserAgentResolverService.setSource(params)
          }
          console.log('this.paramsJSON', this.paramsJSON)
          this.telemetrySvc.publicImpression(this.paramsJSON, userAgent.browserName, userAgent.OS)
        }
      }
    })
  }

  async getAccessToken() {
    const loginData = localStorage.getItem('loginDetailsWithToken')
    if (loginData) {
      const parsedData = JSON.parse(loginData)
      let token = parsedData.token?.access_token
      // console.log("token", token)
      return token
      // return 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJkelFFNjdiRmxRN0V2eUF3Tktndmk1X2ZQR0dsVUVKOGEyMnFlZ1R0TFU0In0.eyJqdGkiOiJmYzE1ZDg1Mi02NmUxLTRjYTUtYWM1YS1mYjA1Y2Q5NmQ0OTQiLCJleHAiOjE3NDMxNDY1NDksIm5iZiI6MCwiaWF0IjoxNzQwNTU0NTQ5LCJpc3MiOiJodHRwczovL2Fhc3RyaWthLXN0YWdlLnRhcmVudG8uY29tL2F1dGgvcmVhbG1zL3N1bmJpcmQiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiZjo5MDdiNWM2NC0xZDc5LTQ0ZGItYjNiNS1lYzEyOWQ1N2Y0MjE6OGVhYjM5NWQtNDZmNC00N2ZmLTkwYWYtOWQ1MWQ1MTI2ZmMzIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoicG9ydGFsIiwiYXV0aF90aW1lIjowLCJzZXNzaW9uX3N0YXRlIjoiY2E4NjU0MzktMjgwZS00MzkxLTgyZGItYTUwMGE0MDBhM2ZjIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL2FkbWluLWFhc3RyaWthLXN0YWdlLnRhcmVudG8uY29tIiwiaHR0cDovLzEyNy4wLjAuMTozMDAwIiwiaHR0cHM6Ly9hYXN0cmlrYS1zdGFnZS50YXJlbnRvLmNvbS8qIiwiaHR0cHM6L2NicC1hYXN0cmlrYS1zdGFnZS50YXJlbnRvLmNvbSIsImh0dHBzOi8vb3JnLWFhc3RyaWthLXN0YWdlLnRhcmVudG8uY29tIiwiaHR0cDovL2xvY2FsaG9zdDozMDAwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiIiLCJuYW1lIjoiUHVibGlzaGVyIFVzZXIiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJwdWJsaXNoZXJ1c2VyX201cXMiLCJnaXZlbl9uYW1lIjoiUHVibGlzaGVyIiwiZmFtaWx5X25hbWUiOiJVc2VyIiwiZW1haWwiOiJwdSoqKioqKioqKipAeW9wbWFpbC5jb20ifQ.fL1p9vJetVOK4DRGPo8wJtrzJcJf5MVmatcUGdVMSEu0IZ2zfr5X-kVk4RSqqmLG00ApY5_fcYb6EWrUVScU9BwWBJdfPl0Xbhk4eQwRnfoM13_ab64v02rAcUL-U3yuwyaMnBn9Cfbij1kb0M2wnWjW0EAyV9lSuQ65yzShIVXjaRmfGhqVkuq_TyoKrnr2xKlzCUPfeQcDIApD-pqxa6DSuhS1Gu1qgIKoAvZx6MPtQoLiauMa-s_I51_2c2Gmo960G0HCy3EluE62ulUXqUVpfyLFvzSIgWD545bXBd6fycVzNenbIeNDTAdI_hwKM9ixKQB6PCy-NZdV2gfdRQ'
    }
    return ''
  }

  formatmyCourseResponse(res: any) {
    const myCourse: any = []
    let myCourseObject = {}

    res.forEach((key: any) => {
      if (key?.content?.identifier) {
        if (key.completionPercentage !== 100) {
          myCourseObject = {
            identifier: key.content.identifier,
            appIcon: key.content.appIcon,
            thumbnail: key.content.thumbnail,
            name: key.content.name,
            dateTime: key.dateTime,
            completionPercentage: key.completionPercentage,
            sourceName: key.content.sourceName,
            issueCertification: key.content.issueCertification,
            averageRating: key.content.averageRating,
            posterImage: key.content.posterImage,
          }
        } else {
          myCourseObject = {
            identifier: key.content.identifier,
            appIcon: key.content.appIcon,
            thumbnail: key.content.thumbnail,
            name: key.content.name,
            dateTime: key.dateTime,
            completionPercentage: key.completionPercentage,
            sourceName: key.content.sourceName,
            issueCertification: key.content.issueCertification,
            averageRating: key.content.averageRating,
            posterImage: key.content.posterImage,
          }
        }
        myCourse.push(myCourseObject)
      }
    })
    this.userEnrollCourse = myCourse
  }

  ngAfterViewInit() {
    try {
      if (window.fcWidget) {
        window.fcWidget.hide()
        window.fcWidget.on('widget:closed', () => { })
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
        window.fcWidget.init()
        if (this.configSvc.userProfile) {
          window.fcWidget.user.setFirstName(this.configSvc.userProfile.firstName)
          window.fcWidget.user.setLastName(this.configSvc.userProfile.lastName)
          window.fcWidget.user.setPhone(this.configSvc.userProfile.phone)
          window.fcWidget.user.setMeta({
            userId: this.configSvc.userProfile.userId,
            username: this.configSvc.userProfile.userName,
          })
        }
      }
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
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      this.backToChatIcon()
    }
  }
  // set page title
  setPageTitle() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => {
          const appTitle = this.titleService.getTitle()
          const child = this.activatedRoute.firstChild
          if (child !== null) {
            if (child.snapshot.data['title']) {
              return child.snapshot.data['title']
            }
            return appTitle
          }
          return appTitle
        }),
      )
      .subscribe((title: string) => {
        this.titleService.setTitle(title)
      })
  }
}
