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
  HostListener,
  Signal,
  computed,
  Inject,
  PLATFORM_ID,
} from '@angular/core'
import { isPlatformBrowser } from '@angular/common'
import { toSignal } from '@angular/core/rxjs-interop'
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
  LoggerService,
  TelemetryService,
  ValueService,
  WsEvents,
} from '@ws-widget/utils'
import { delay, filter, map, takeUntil, mapTo } from 'rxjs/operators'
import { Subject, Subscription } from 'rxjs'
import {
  FeaturedCourse,
  PreferedLanguage,
  OrgDetails,
  BodyConfig,
  FooterConfig,
  ProgramConfig,
  VideoData,
  ConfigData,
  ContentHistory,
  UpdateProgressRequest,
} from './root.model'
import { MobileAppsService } from '../../services/mobile-apps.service'
import { UserDataCacheService } from '../../services/user-data-cache.service'
import { RootService } from './root.service'
import { LoginResolverService } from '../../../../library/ws-widget/resolver/src/public-api'
import { ExploreResolverService } from './../../../../library/ws-widget/resolver/src/lib/explore-resolver.service'
import { OrgServiceService } from '../../../../project/ws/app/src/lib/routes/org/org-service.service'
import { split } from 'lodash'
import { App } from '@capacitor/app'
import dayjs from 'dayjs'
import { SeoService } from '../../services/seo.service'
import { Observable, fromEvent, merge, of } from 'rxjs'
import { UserProfileService } from 'project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { WidgetContentService } from '../../../../library/ws-widget/collection/src/public-api'
import { ConfigService as CompetencyConfiService } from '../../routes/competency/services/config.service'
import { UserAgentResolverService } from 'src/app/services/user-agent.service'
import { WidgetUserService } from '../../../../library/ws-widget/collection/src/public-api'
import { ViewerUtilService } from 'project/ws/viewer/src/lib/viewer-util.service'
import { TranslateService } from '@ngx-translate/core'
import { PlaylistService } from '../../services/playlist.service'
import { DowntimeConfigService } from '../../services/downtime-config.service'
import { ThemeService } from '../../services/theme.service'

@Component({
  standalone: false,
  selector: 'ws-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],

})
export class RootComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()
  @ViewChild('appUpdateTitle', { static: true })
  readonly appUpdateTitleRef: ElementRef | null = null
  @ViewChild('appUpdateBody', { static: true })
  readonly appUpdateBodyRef: ElementRef | null = null
  featuredCourse: FeaturedCourse[] = []
  userId: string | null = null
  preferedLanguage: PreferedLanguage = { id: 'en', lang: 'English' }
  homeFeature: any
  topCertifiedCourseIdentifier: string[] = []
  featuredCourseIdentifier: string[] = []
  topCertifiedCourse: FeaturedCourse[] = []
  userEnrollCourse!: Signal<any[]>
  isProfile = false
  isXSmall$ = false
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
  hideFooter = false
  isLoggedIn = false
  mobileView = true
  showmobileFooter = true
  disableChatForBnrc = false
  showMobileDashboard = true
  isCommonChatEnabled = true
  online$: Observable<boolean> = of(true)
  appOnline = true
  paramsJSON!: string
  videoData: VideoData = {}
  configData: ConfigData | null = null
  orgDetails!: OrgDetails
  private routerEventsSubscription!: Subscription
  isEkshamata = false
  domain!: string
  bodyConfig!: BodyConfig
  footerConfig!: FooterConfig
  programConfig!: ProgramConfig
  // programSec: boolean = false
  showProgramDet = computed(() => this.playlistSvc.showDetails())
  hasProgramConfig = false
  hasCompetencyConfig = false
  competencyConfig: any = {}
  constructor(
    private readonly router: Router,
    public readonly authSvc: AuthKeycloakService,
    public readonly configSvc: ConfigurationsService,
    private readonly valueSvc: ValueService,
    private readonly telemetrySvc: TelemetryService,
    private readonly mobileAppsSvc: MobileAppsService,
    private readonly rootSvc: RootService,
    private readonly btnBackSvc: BtnPageBackService,
    private readonly changeDetector: ChangeDetectorRef,
    private readonly loginServ: LoginResolverService,
    private readonly exploreService: ExploreResolverService,
    private readonly orgService: OrgServiceService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly userProfileSvc: UserProfileService,
    private readonly userDataCacheSvc: UserDataCacheService,
    private readonly contentSvc: WidgetContentService,
    private readonly CompetencyConfiService: CompetencyConfiService,
    private readonly UserAgentResolverService: UserAgentResolverService,
    private readonly userSvc: WidgetUserService,
    private readonly viewerSvc: ViewerUtilService,
    private readonly injector: Injector,
    private readonly playlistSvc: PlaylistService,
    private readonly logger: LoggerService,
    private readonly downtimeService: DowntimeConfigService,
    private readonly themeSvc: ThemeService,
    private readonly seoSvc: SeoService,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {
    const isBrowser = isPlatformBrowser(this.platformId)
    this.userEnrollCourse = toSignal(
      this.configSvc.userProfile
        ? this.userSvc.fetchUserBatchList(this.configSvc.userProfile.userId || '').pipe(
          map(res => this.buildEnrolledCourses(res))
        )
        : of([]),
      { initialValue: [] }
    )
    const t = this.injector.get(TranslateService, null as any)
    this.logger.log('[DEBUG] TranslateService present?', !!t, t ? t.currentLang : 'no service')
    if (isBrowser) {
      this.domain = window.location.hostname
      if (this.domain.includes('ekshamata')) {
        this.isEkshamata = true
      }
    }

    // Online/offline tracking and resize listener are browser-only
    if (isBrowser) {
      this.online$ = merge(
        of(true),
        fromEvent(window, 'online').pipe(mapTo(true)),
        fromEvent(window, 'offline').pipe(mapTo(false)),
      )
      fromEvent(window, 'resize').pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.valueSvc.updateWidth(window.innerWidth)
      })
    }
    this.networkStatus()
    this.mobileAppsSvc.init()

    effect(() => {
      this.isXSmall$ = this.valueSvc.isMobile()
    })
  }

  ngOnDestroy(): void {
    if (this.routerEventsSubscription) {
      this.routerEventsSubscription.unsubscribe()
    }
    this.destroy$.next()
    this.destroy$.complete()
  }

  public networkStatus(): void {
    this.online$.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.appOnline = value
    })
  }
  openFreshChat(): void {
    window.fcWidget.open()
    window.fcWidget.show()
  }
  mergeProgressDetails(obj1: Record<string, any>, obj2: Record<string, any>): Record<string, any> {
    // Create a new object to store the merged results
    const mergedObj = { ...obj1 }

    // Loop through the keys in obj2
    for (const key in obj2) {
      if (obj2.hasOwnProperty(key)) {
        // Whether the key exists in obj1 or not, take the latest value from obj2
        mergedObj[key] = obj2[key]
      }
    }
    return mergedObj
  }

  private navigationInterceptor(event: Event): void {
    if (event instanceof NavigationStart) {
      this.logger.log('Navigation started to URL:', event.url)
    }

    if (event instanceof NavigationEnd) {
      this.logger.log('Navigation ended to URL:', event.url)
      const contentURL = isPlatformBrowser(this.platformId) ? localStorage.getItem('contentId') : null
      this.logger.log(contentURL)
      if (contentURL) {
        const url: string = contentURL
        const path = url?.split('?')[0] // Get the part before the query string
        const match = path.match(/do_[\w\d]+/) // Match the do_ identifier pattern
        let doId: string | undefined
        if (match) {
          doId = match[0] // Extract the first match
        }
        const urlParams = new URLSearchParams(url.split('?')[1])
        const collectionId: string | null = urlParams.get('collectionId')
        const batchId = urlParams.get('batchId')
        let storedData: string | null
        let userId: string | undefined
        if (this.configSvc.userProfile) {
          userId = this.configSvc.userProfile.userId || ''
        }
        const req: ContentHistory = {
          request: {
            userId,
            batchId: batchId,
            courseId: collectionId,
            contentIds: [],
            fields: ['progressdetails'],
          },
        }
        this.contentSvc
          .fetchContentHistoryV2(req)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            (data: any) => {
              let contentData: any
              contentData = data?.['result']?.['contentList']?.find(
                (obj: any) => obj.contentId === doId,
              )
              if (
                contentData &&
                (event.url.includes('/chapters') || event.url.includes('/app/toc')) &&
                event.url.includes(collectionId)
              ) {
                storedData = localStorage.getItem(doId)
                if (storedData) {
                  const dat = JSON.parse(storedData)
                  const mergedProgressDetails: Record<string, any> = this.mergeProgressDetails(
                    contentData.progressdetails,
                    dat,
                  )
                  delete mergedProgressDetails['errors']
                  if (this.configSvc.userProfile && Object.keys(dat).length > 0) {
                    const updateReq: UpdateProgressRequest = {
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
                          this.logger.error('Error updating progress:', err)
                        },
                      )
                  }
                }
              } else {
                this.logger.warn('No data found for ID:', doId)
              }
            },
            err => {
              this.logger.error('Error fetching content history:', err)
            },
          )
      }
    }

    if (event instanceof NavigationCancel) {
      this.logger.log('Navigation canceled to URL:', event.url)
    }

    if (event instanceof NavigationError) {
      this.logger.log('Navigation error to URL:', event.url)
    }
  }

  @HostListener('window:resize', [])
  onResize(): void {
    if (this.router.url.includes('/app/search'))
      if (window.innerWidth <= 767) {
        this.router.navigate(['/app/search/home'])
      } else {
        this.router.navigate(['/app/search/learning'])
      }
    this.valueSvc.updateWidth(window.innerWidth)
  }
  ngOnInit(): void {
    this.handleRouterSubscription()

    this.routerEventsSubscription = this.router.events.subscribe((event: Event) => {
      if (
        event instanceof NavigationEnd &&
        !event.url.toLowerCase().includes('/app/user/competency')
      ) {
        this.navigationInterceptor(event)
      }
    })

    // Subscribe to profile updates and clear cache when profile is modified
    this.userProfileSvc.updateuser$.pipe(takeUntil(this.destroy$)).subscribe((updatedProfile: any) => {
      if (updatedProfile) {
        this.logger.log('[RootComponent] Profile updated, refreshing user data cache', updatedProfile)
        this.userDataCacheSvc.clearUserData()
        this.userProfileSvc.clearUserDetailsCache()
        // Set the updated profile data to session storage and subject
        if (updatedProfile.request && updatedProfile.request.profileDetails) {
          // Extract the full profile with the updated details
          const userData = this.configSvc.unMappedUser || {}
          if (updatedProfile.request.profileDetails.profileReq) {
            userData.profileDetails = updatedProfile.request.profileDetails
          }
          this.logger.log('[RootComponent] Setting updated user data to cache')
          this.userDataCacheSvc.setUserData(userData)
        }
      }
    })

    // Initialize downtime configuration
    this.downtimeService.initializeDowntimeConfig()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        state => {
          this.logger.log('[RootComponent] Downtime config initialized:', state)
        },
        error => {
          this.logger.warn('[RootComponent] Error initializing downtime config, continuing normally:', error)
        }
      )

    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
      // Pre-warm playlist config cache so home page ngOnInit doesn't block on it
      this.playlistSvc.getPlaylistConfig().catch(err => {
        this.logger.warn('Failed to pre-warm playlist config cache:', err)
      })
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(`userUUID`, this.configSvc.unMappedUser.userId)
        if (sessionStorage.getItem('cURL')) {
          sessionStorage.removeItem('cURL')
        }
      }
      this.isLoggedIn = true
    } else {
      this.isLoggedIn = false
    }

    // Load form data in background without blocking UI rendering
    // Use a timeout to prevent hanging on slow/failed requests
    Promise.race([
      this.setUpFormData(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000)),
    ]).catch(err => {
      this.logger.warn('Form data load timeout/failed, using defaults:', err)
      this.orgDetails = {}
      this.footerConfig = {}
      this.changeDetector.markForCheck()
    })

    if (this.configSvc.isAuthenticated) {
      this.appStartRaised = true
    } else if (isPlatformBrowser(this.platformId)) {
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
      this.logger.warn('Error determining if in iframe:', _ex)
      this.isInIframe = false
    }
    this.btnBackSvc.initialize()
    // Application start telemetry
    this.telemetrySvc.getTelemetryConfig()
    this.telemetrySvc.impression('page-loaded', 'init', 'static-home')
    if (isPlatformBrowser(this.platformId)) {
      App.addListener('backButton', () => {
        window.history.go(-1)
      })
    }
    this.rootSvc.showNavbarDisplay$.pipe(delay(500), takeUntil(this.destroy$)).subscribe(display => {
      this.showNavbar = display
      this.changeDetector.detectChanges()
    })
    // Track home-page state on navigation in a single subscription. Previously this
    // router.events subscription was created inside the hideHeaderFooter callback, so a
    // new (never-cleaned) router subscription leaked on every hideHeaderFooter emission.
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((e: Event) => {
      if (e instanceof NavigationEnd) {
        this.isHomePage = (e.url === '/page/home' || e.url === '/public/home' || e.url === '/')
      }
    })
    this.orgService.hideHeaderFooter.pipe(takeUntil(this.destroy$)).subscribe(show => {
      if (!isPlatformBrowser(this.platformId) || window.location.pathname !== '/app/new-tnc') {
        this.hideHeaderFooter = show
      }
      this.changeDetector.detectChanges()
    })

    if (isPlatformBrowser(this.platformId) && localStorage.getItem('orgValue') === 'nhsrc') {
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
            this.logger.error('Error fetching user details:', err)
          },
        )
    }
  }

  async setUpFormData(): Promise<void> {
    try {
      if (!this.orgDetails) {
        const playlistData = await this.playlistSvc.loadPlaylistData()
        if (!playlistData) {
          this.logger.warn('No playlist data loaded')
          this.orgDetails = {}
          this.footerConfig = {}
          this.changeDetector.markForCheck()
          return
        }
      }
      this.orgDetails = { ...this.playlistSvc.orgDetails(), ...this.playlistSvc.headerConfig() }
      const homeTabConfig = this.playlistSvc.sections()?.['homeTab']
      this.programConfig = this.playlistSvc.programs()
      this.hasProgramConfig = !!this.programConfig && Object.keys(this.programConfig).length > 0
      // Reset details page only when program config exists
      if (this.hasProgramConfig) {
        this.playlistSvc?.showDetails.set(false)
      }
      this.configData = this.isLoggedIn ? (homeTabConfig || this.playlistSvc.selectedTabConfig()) : this.playlistSvc.config()
      this.bodyConfig = this.configData
      this.footerConfig = { ...this.playlistSvc.orgDetails(), ...this.playlistSvc.footerConfig() }
      this.showNavbar = true
      this.videoData = this.configData?.[this.configData?.length - 1]
      localStorage.setItem('videoData', JSON.stringify(this.videoData))
      this.checkCompetencyConfig(homeTabConfig)
      if (!this.themeSvc.hasStoredPreference() && this.orgDetails?.themeConfig?.isDark === false) {
        this.themeSvc.setTheme(false)
      }
      const themeConfig = this.downtimeService.themeConfig()
      const theme = themeConfig?.[this.orgDetails?.themeConfig?.theme] || themeConfig?.['defaultTheme']
      this.themeSvc.applyOrgTheme(theme)
      // Trigger change detection to ensure template updates with new data
      this.changeDetector.markForCheck()
    } catch (error) {
      this.logger.error('Error setting up form data:', error)
      // Set safe defaults - page can still render with router-outlet
      // this.orgDetails = {}
      this.footerConfig = {}
    }
  }

  handleRouterSubscription(): void {
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.hideFooter = event.url.includes('/app/org-selective-course')
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
          if (this.playlistSvc.showDetails()) {
            this.playlistSvc.showDetails.set(false)
          }
        }
        if (this.router.url.includes('/public/home')) {
          this.showNavigation = true
          this.hideHeaderFooter = false
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
        if (
          event.url.includes('preview') ||
          event.url.includes('embed') ||
          event.url.includes('/certs') ||
          event.url.includes('/public/register')
        ) {
          this.isNavBarRequired = false
          this.hideHeaderFooter = true
        } else if (event.url.includes('author/') && this.isInIframe) {
          this.isNavBarRequired = false
        } else if (event.url.includes('/app/org-selective-course')) {
          this.isNavBarRequired = false
          this.hideFooter = true
        } else if (event.url.includes('app/toc')) {
          if (this.configSvc.userProfile !== null) {
            this.mobileView = false
          }
          this.hideHeaderFooter = false
          this.isNavBarRequired = true
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
        } else if (event.url.includes('/public/home')) {
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
          event.url.includes('/app/profile/dashboard') ||
          event.url.includes('app/profile-view')
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
        this.changeDetector.markForCheck()
      }
      if (this.router.url === 'profile-view') {
        this.isProfile = true
      }
      if (event instanceof NavigationEnd) {
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
          this.UserAgentResolverService.setSource(params)
          this.logger.log('this.paramsJSON', this.paramsJSON)
          this.telemetrySvc.publicImpression(this.paramsJSON, userAgent.browserName, userAgent.OS)
        }
      }
    })
  }

  private buildEnrolledCourses(res: any[]): any[] {
    const myCourse: any[] = []
    console.log('[RootComponent] Raw API response sample:', res?.[0])
    res.forEach((key: any) => {
      if (key?.content?.identifier) {
        myCourse.push({
          identifier: key.content.identifier,
          courseId: key.content.courseId || key.courseId,
          contentId: key.content.contentId || key.contentId,
          appIcon: key.content.appIcon,
          thumbnail: key.content.thumbnail,
          name: key.content.name,
          dateTime: key.dateTime,
          completionPercentage: key.completionPercentage,
          sourceName: key.content.sourceName,
          issueCertification: key.content.issueCertification,
          averageRating: key.content.averageRating,
          posterImage: key.content.posterImage,
        })
      }
    })
    console.log('[RootComponent] Built enrolled courses:', myCourse.length, 'courses')
    return myCourse
  }

  ngAfterViewInit(): void {
    try {
      if (window.fcWidget) {
        window.fcWidget.hide()
        window.fcWidget.on('widget:closed', () => { })
      }
    } catch (error) {
      this.logger.error('Error initializing FreshChat widget:', error)
    }
  }

  // freshChat functionality
  fcSettingsFunc(): void {
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
      this.logger.error('Error configuring FreshChat settings:', error)
    }
  }

  setCompetencyConfig(data: any): void {
    if (data.profileDetails) {
      this.CompetencyConfiService.setConfig(data.profileDetails.profileReq, data.profileDetails)
    }
  }

  private checkCompetencyConfig(homeTabConfig: any): void {
    if (!homeTabConfig || !Array.isArray(homeTabConfig)) {
      this.hasCompetencyConfig = false
      return
    }

    const userProfile: any = this.configSvc.userProfile || {}
    const userRole = (userProfile.profileDetails?.profileReq?.professionalDetails?.[0]?.designation || (this.configSvc.unMappedUser as any)?.profileDetails?.profileReq?.professionalDetails?.[0]?.designation || '').toLowerCase()

    if (!userRole) {
      this.hasCompetencyConfig = false
      return
    }

    this.hasCompetencyConfig = homeTabConfig.some((item: any) => {
      if (item.sectionId !== 'COMPETENCY_PLAYLIST') {
        return false
      }
      if (item.role && Array.isArray(item.role)) {
        return item.role.some((role: string) => role.toLowerCase() === userRole)
      }
      return false
    })
  }
  backToChatIcon() {
    try {
      this.isCommonChatEnabled = true
      window.fcWidget.setConfig({ headerProperty: { hideChatButton: true } })
      window.fcWidget.init()
    } catch (error) {
      this.logger.error('Error resetting FreshChat:', error)
    }
  }
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      this.backToChatIcon()
    }
  }
  // set page title and SEO meta tags on every navigation
  setPageTitle(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.getDeepestRouteData()),
      )
      .subscribe(data => {
        this.seoSvc.update({
          title: data['title'],
          description: data['seoDescription'],
          keywords: data['seoKeywords'],
          ogImage: data['seoOgImage'],
        })
      })
  }

  private getDeepestRouteData(): Record<string, any> {
    let route = this.activatedRoute
    while (route.firstChild) {
      route = route.firstChild
    }
    return route.snapshot.data || {}
  }
}
