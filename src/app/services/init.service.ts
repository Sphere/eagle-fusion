import { APP_BASE_HREF } from '@angular/common'
// import { retry } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http'
import { Inject, Injectable } from '@angular/core'
import { MatIconRegistry } from '@angular/material/icon'
import { DomSanitizer } from '@angular/platform-browser'
// import { BtnSettingsService, WidgetContentService } from '@ws-widget/collection'
import { BtnSettingsService } from '@ws-widget/collection'
import {
  hasPermissions,
  hasUnitPermission,
  // LoginResolverService,
  // LoginResolverService,
  NsWidgetResolver,
  WidgetResolverService,
  // LoginResolverService,
} from '@ws-widget/resolver'
import {
  // AuthKeycloakService,
  // AuthKeycloakService,
  // AuthKeycloakService,
  ConfigurationsService,
  LoggerService,
  NsAppsConfig,
  NsInstanceConfig,
  // NsUser,
  UserPreferenceService,
} from '@ws-widget/utils'
import { environment } from '../../environments/environment'
/* tslint:disable */
// import _ from 'lodash'
import { isUndefined, get } from "lodash"

// import { map } from 'rxjs/operators'
import { v4 as uuid } from 'uuid'
// import { retry } from 'rxjs/operators'
import { AuthKeycloakService } from 'library/ws-widget/utils/src/lib/services/auth-keycloak.service'
import { UserDataCacheService } from './user-data-cache.service'
import { ConfigCacheService } from './config-cache.service'

// interface IDetailsResponse {
//   tncStatus: boolean
//   roles: string[]
//   group: string[]
//   profileDetailsStatus: boolean
// }

interface IFeaturePermissionConfigs {
  [id: string]: Omit<NsWidgetResolver.IPermissions, 'feature'>
}
// const PROXY_CREATE_V8 = '/apis/proxies/v8'
// const endpoint = {
//   profilePid: '/apis/proxies/v8/api/user/v2/read',
//   // details: `/apis/protected/v8/user/details?ts=${Date.now()}`,
//   CREATE_USER_API: `${PROXY_CREATE_V8}/discussion/user/v1/create`,
// }

@Injectable({
  providedIn: 'root',
})
export class InitService {
  private baseUrl = 'assets/configurations'
  private orgSelectiveConfig: any | null = null

  domain: string = ''
  constructor(
    private logger: LoggerService,
    private configSvc: ConfigurationsService,
    //private authSvc: AuthKeycloakService,
    private widgetResolverService: WidgetResolverService,
    private settingsSvc: BtnSettingsService,
    private userPreference: UserPreferenceService,
    private http: HttpClient,
    // private widgetContentSvc: WidgetContentService,
    //private loginResolverService: LoginResolverService,
    private readonly authSvc: AuthKeycloakService,
    @Inject(APP_BASE_HREF) private baseHref: string,
    //private router: Router,
    domSanitizer: DomSanitizer,
    iconRegistry: MatIconRegistry,
    private userDataCacheSvc: UserDataCacheService,
    private configCacheSvc: ConfigCacheService,
  ) {
    this.configSvc.isProduction = environment.production

    // Register pin icon for use in Knowledge Board
    // Usage: <mat-icon svgIcon="pin"></mat-icon>
    iconRegistry.addSvgIcon(
      'pin',
      domSanitizer.bypassSecurityTrustResourceUrl('fusion-assets/icons/pin.svg'),
    )
    iconRegistry.addSvgIcon(
      'facebook',
      domSanitizer.bypassSecurityTrustResourceUrl('fusion-assets/icons/facebook.svg'),
    )
    iconRegistry.addSvgIcon(
      'linked-in',
      domSanitizer.bypassSecurityTrustResourceUrl('fusion-assets/icons/linked-in.svg'),
    )
    iconRegistry.addSvgIcon(
      'twitter',
      domSanitizer.bypassSecurityTrustResourceUrl('fusion-assets/icons/twitter.svg'),
    )
  }

  async init() {
    // this.logger.removeConsoleAccess()
    const authenticated = await this.authSvc.initAuth()
    const loginData = localStorage.getItem('loginDetailsWithToken')
    if (authenticated) {
      if (loginData) {
        const parsedData = JSON.parse(loginData)
        let token = parsedData.token?.access_token ? true : false
        if (!token)
          this.authSvc.logout()
      } else {
        this.authSvc.logout()
      }
    }



    await this.fetchDefaultConfig()
    // const authenticated = await this.authSvc.initAuth()

    // if (!authenticated) {
    //   this.settingsSvc.initializePrefChanges(environment.production)
    //   // TODO: use the rootOrg and org to fetch the instance
    //   const publicConfig = await this.http
    //     .get<NsInstanceConfig.IConfig>(`${this.configSvc.sitePath}/site.config.json`)
    //     .toPromise()
    //   this.configSvc.instanceConfig = publicConfig
    //   this.updateNavConfig()
    //   this.logger.info('Not Authenticated')
    //   this.loginResolverService.initialize()
    //   return false
    // }
    // Invalid User
    try {
      // Always attempt to load user data from cache or API, regardless of route
      // This ensures user data is available for all routes (public and private)

      // Only call fetchStartUpDetails for non-public routes to avoid redundant API calls
      if ((location.pathname.indexOf('/public') < 0) && (location.pathname.indexOf('/app/create-account') < 0)) {
        await this.loadUserDataIfAvailable()
        await this.fetchStartUpDetails() // detail: depends only on userID
        this.domain = window.location.hostname
        if (this.domain.includes('ekshamata')) {
          await this.fetchHostedConfig()
        }
      }

    } catch (e) {
      this.settingsSvc.initializePrefChanges(environment.production)
      this.updateNavConfig()
      this.logger.info('Not Authenticated')
      // window.location.reload() // can do this
      return false

    }
    try {
      // this.logger.info('User Authenticated', authenticated)
      // const userPrefPromise = await this.userPreference.fetchUserPreference() // pref: depends on rootOrg
      // this.configSvc.userPreference = userPrefPromise
      // this.configSvc.userPreference.selectedTheme = 'theme-igot'
      this.reloadAccordingToLocale()
      // if (this.configSvc.userPreference.pinnedApps) {
      //   const pinnedApps = this.configSvc.userPreference.pinnedApps.split(',')
      //   this.configSvc.pinnedApps.next(new Set(pinnedApps))
      // }
      // if (this.configSvc.userPreference.profileSettings) {
      //   this.configSvc.profileSettings = this.configSvc.userPreference.profileSettings
      // }
      // await this.fetchUserProfileV2()
      const appsConfigPromise = await this.fetchAppsConfig()
      const instanceConfigPromise = this.fetchInstanceConfig() // config: depends only on details
      const widgetStatusPromise = this.fetchWidgetStatus() // widget: depends only on details & feature
      await this.fetchFeaturesStatus() // feature: depends only on details
      /**
       * Wait for the widgets and get the list of restricted widgets
       */
      const widgetConfig = await widgetStatusPromise
      this.processWidgetStatus(widgetConfig)
      this.widgetResolverService.initialize(
        this.configSvc.restrictedWidgets,
        this.configSvc.userRoles,
        this.configSvc.userGroups,
        this.configSvc.restrictedFeatures,
      )
      /**
       * Wait for the instance config and after that
       */
      await instanceConfigPromise
      /*
       * Wait for the apps config and after that
       */
      const appsConfig = appsConfigPromise
      this.configSvc.appsConfig = this.processAppsConfig(appsConfig)
      if (this.configSvc.instanceConfig && appsConfig && appsConfig.features) {
        this.configSvc.instanceConfig.featuredApps = this.configSvc.instanceConfig.featuredApps.filter(
          id => appsConfig.features[id],
        )
      }

      // Apply the settings using settingsService
      this.settingsSvc.initializePrefChanges(environment.production)
      this.userPreference.initialize()

    } catch (e) {
      this.logger.warn(
        'Initialization process encountered some error. Application may not work as expected',
        e,
      )
      this.settingsSvc.initializePrefChanges(environment.production)
    }


    this.updateNavConfig()
    // await this.widgetContentSvc
    //   .setS3ImageCookie()
    //   .toPromise()
    //   .catch(() => {
    //     // throw new DataResponseError('COOKIE_SET_FAILURE')
    //   })
    return true
  }
  /** Fetches config once and caches it */
  private async fetchOrgSelectiveConfig(): Promise<void> {
    try {
      const s3Url = `https://aastar-assets.s3.ap-south-1.amazonaws.com/data/org-selective-course.json?cb=${Date.now()}`
      const orgSelectiveData = await this.http.get<any>(s3Url).toPromise()

      if (orgSelectiveData && Array.isArray(orgSelectiveData.states)) {
        let matchedOrg: any = null

        // 1. Try matching for logged-in user (rootOrgId)
        if (this.configSvc.userProfile?.rootOrgId) {
          const rootOrgId = this.configSvc.userProfile.rootOrgId
          console.log('Root Org ID:', rootOrgId)

          for (const state of orgSelectiveData.states) {
            const found = state.organisations?.find(
              (org: any) => org.orgId === rootOrgId
            )
            if (found) {
              matchedOrg = found
              break
            }
          }
        }

        // 2. If no match found, check ?org= param (public route)
        if (!matchedOrg) {
          const urlParams = new URLSearchParams(window.location.search)
          let orgNameFromUrl = urlParams.get('org')

          if (orgNameFromUrl) {
            // Decode + sanitize URL param
            orgNameFromUrl = decodeURIComponent(orgNameFromUrl)
              .replace(/\+/g, ' ')
              .trim()
              .toLowerCase()
              .replace(/&/g, 'and')

            console.log('Normalized Org from URL:', orgNameFromUrl)

            // Iterate over all orgs to find match
            for (const state of orgSelectiveData.states) {
              const found = state.organisations?.find((org: any) => {
                const orgNameNormalized = (org.orgName || '')
                  .toLowerCase()
                  .trim()
                  .replace(/&/g, 'and')
                return orgNameNormalized === orgNameFromUrl
              })
              if (found) {
                matchedOrg = found
                break
              }
            }
          }
        }

        // 🔹 3. Save matched config
        if (matchedOrg) {
          this.configSvc.orgSelectiveCourseConfig = matchedOrg
          console.log('Org Selective Config Found:', matchedOrg.orgName)
        } else {
          console.warn('No matching org found in org-selective-course.json')
          console.warn(
            'Available org names:',
            orgSelectiveData.states.flatMap((s: any) =>
              s.organisations.map((o: any) => o.orgName)
            )
          )
        }
      } else {
        console.warn('org-selective-course.json missing or invalid format')
      }
    } catch (error) {
      console.error('Failed to fetch org-selective-course.json:', error)
    }
  }





  /** ✅ Public getter for components/services */
  getOrgSelectiveConfig(): any {
    return this.orgSelectiveConfig
  }
  private async fetchHostedConfig(): Promise<any> {
    // use the rootOrg and org to fetch the instance
    const hostConfig = await this.http
      .get<any>(`https://aastar-app-assets.s3.ap-south-1.amazonaws.com/ekshamataOrgConfig.json`)
      .toPromise()
    if (hostConfig) {
      if (this.configSvc.userProfile) {
        let rootOrgId = this.configSvc.userProfile.rootOrgId
        console.log("rootOrgId: ", rootOrgId, hostConfig)
        const orgDetails = hostConfig.orgNames
        // Find the matching object
        const result = orgDetails.find(item => item.channelId === rootOrgId)

        if (result) {
          this.configSvc.hostedInfo = result
          console.log('Channel found:', result)
        } else {
          console.log('Channel not found')
        }
      }
    }
    console.log("hostConfig", hostConfig)
  }

  private reloadAccordingToLocale() {
    if (window.location.origin.indexOf('http://localhost:') > -1) {
      return
    }
    let pathName = window.location.href.replace(window.location.origin, '')
    const runningAppLang = this.locale
    if (pathName.startsWith(`//${runningAppLang}//`)) {
      pathName = pathName.replace(`//${runningAppLang}//`, '/')
    }
    const instanceLocales = this.configSvc.instanceConfig && this.configSvc.instanceConfig.locals
    if (Array.isArray(instanceLocales) && instanceLocales.length) {
      const foundInLocales = instanceLocales.some(locale => {
        return locale.path !== runningAppLang
      })
      if (foundInLocales) {
        if (
          this.configSvc.userPreference &&
          this.configSvc.userPreference.selectedLocale &&
          runningAppLang !== this.configSvc.userPreference.selectedLocale
        ) {
          let languageToLoad = this.configSvc.userPreference.selectedLocale
          languageToLoad = `\\${languageToLoad}`
          if (this.configSvc.userPreference.selectedLocale === 'en') {
            languageToLoad = ''
          }
          location.assign(`${location.origin}${languageToLoad}${pathName}`)
        }
      }
    }
  }

  /**
   * Load user data from cache or API if available
   * This runs early in initialization to restore user session across page reloads
   */
  private async loadUserDataIfAvailable(): Promise<void> {
    try {
      // First, check if data is already cached in memory from UserDataCacheService
      const cachedData = this.userDataCacheSvc.getCachedUserData()
      if (cachedData && cachedData.userId) {
        console.log('[InitService] User data already loaded in cache for userId:', cachedData.userId)
        this.configSvc.unMappedUser = cachedData
        this.updateConfigWithUserData(cachedData)
        return
      }

      // If no in-memory cache, try to fetch from API (UserDataCacheService will restore from sessionStorage first)
      const userData = await this.userDataCacheSvc.getUserData().toPromise()
      if (userData && userData.userId) {
        console.log('[InitService] Successfully loaded user data from cache/API for userId:', userData.userId)
        this.configSvc.unMappedUser = userData
        this.updateConfigWithUserData(userData)
      } else {
        console.log('[InitService] No user data available in cache or API')
      }
    } catch (error) {
      console.warn('[InitService] Unable to load user data:', error)
      // This is not fatal - user can still access public routes
    }
  }

  /**
   * Update ConfigService with user data
   */
  private updateConfigWithUserData(userPidProfile: any): void {
    if (!userPidProfile || !userPidProfile.userId) {
      return
    }

    try {
      const profileV2 = get(userPidProfile, 'profileDetails.profileReq')
      this.configSvc.userProfile = {
        country: get(profileV2, 'personalDetails.countryCode') || null,
        email: get(profileV2, 'profileDetails.officialEmail') || userPidProfile.email,
        givenName: userPidProfile.firstName,
        userId: userPidProfile.userId,
        firstName: userPidProfile.firstName,
        lastName: userPidProfile.lastName,
        rootOrgId: userPidProfile.rootOrgId,
        rootOrgName: userPidProfile.channel,
        userName: userPidProfile.userName,
        profileImage: userPidProfile.thumbnail,
        departmentName: userPidProfile.channel,
        dealerCode: null,
        isManager: false,
        phone: get(userPidProfile, 'phone'),
        language: (userPidProfile.profileDetails && userPidProfile.profileDetails.preferences && userPidProfile.profileDetails.preferences.language !== undefined) ? userPidProfile.profileDetails.preferences.language : 'en',
      }

      // Update roles and groups
      if (userPidProfile.roles && Array.isArray(userPidProfile.roles)) {
        this.configSvc.userRoles = new Set((userPidProfile.roles || []).map((v: string) => v.toLowerCase()))
      }
      if (userPidProfile.group && Array.isArray(userPidProfile.group)) {
        this.configSvc.userGroups = new Set(userPidProfile.group)
      }

      console.log('[InitService] User data updated in ConfigService')
    } catch (error) {
      console.warn('[InitService] Error updating config with user data:', error)
    }
  }

  private async fetchDefaultConfig(): Promise<NsInstanceConfig.IConfig> {
    // Load language-specific host config: host.config.json for en, host.config.hi.json for hi
    const locale = this.locale || 'en'
    const publicConfig: NsInstanceConfig.IConfig = await this.configCacheSvc.getHostConfig(locale).toPromise()
    this.configSvc.instanceConfig = publicConfig
    this.configSvc.rootOrg = publicConfig.rootOrg
    this.configSvc.org = publicConfig.org
    // TODO: set one org as default org :: use user preference
    this.configSvc.activeOrg = publicConfig.org[0]
    this.configSvc.appSetup = publicConfig.appSetup
    return publicConfig
  }

  get locale(): string {
    return this.baseHref && this.baseHref.replace(/\//g, '')
      ? this.baseHref.replace(/\//g, '')
      : 'en'
  }

  private async fetchAppsConfig(): Promise<NsAppsConfig.IAppsConfig> {
    try {
      let local: any
      // Language is managed via LanguageService and ngx-translate
      // Get language from user preferences or localStorage
      if (this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails!.preferences && this.configSvc.unMappedUser!.profileDetails!.preferences!.language !== undefined) {
        local = this.configSvc.unMappedUser.profileDetails.preferences.language === 'hi' ? 'hi' : ''
      } else {
        local = localStorage.getItem('language') === 'hi' ? 'hi' : ''
      }

      const url = local === 'hi' ? `/feature/apps.${'hi'}.json` : `/feature/apps.json`
      console.log(local, 'local', url)
      const appsConfig = await this.http
        .get<NsAppsConfig.IAppsConfig>(`${this.baseUrl}${url}`, { responseType: 'json' })
        .toPromise()
        .catch(() => ({ features: {}, groups: [], tourGuide: {} } as NsAppsConfig.IAppsConfig))
      return appsConfig
    } catch (err) {
      this.logger.error('Error fetching apps config:', err)
      return { features: {}, groups: [], tourGuide: {} } as NsAppsConfig.IAppsConfig
    }
  }

  private async fetchStartUpDetails(): Promise<any> {
    // const userRoles: string[] = []
    if (this.configSvc.instanceConfig && !Boolean(this.configSvc.instanceConfig.disablePidCheck)) {
      let userPidProfile: any | null = null
      try {
        // Use cached user data service to prevent repeated API calls
        userPidProfile = await this.userDataCacheSvc.getUserData().toPromise()

        if (userPidProfile && userPidProfile.roles && userPidProfile.roles.length > 0 &&
          this.hasRole(userPidProfile.roles)) {
          // if (userPidProfile.result.response.organisations.length > 0) {
          //   const organisationData = userPidProfile.result.response.organisations
          //   userRoles = (organisationData[0].roles.length > 0) ? organisationData[0].roles : []
          // }
          if (localStorage.getItem('telemetrySessionId')) {
            localStorage.removeItem('telemetrySessionId')
          }
          localStorage.setItem('telemetrySessionId', uuid())
          this.configSvc.unMappedUser = userPidProfile
          const profileV2 = get(userPidProfile, 'profileDetails.profileReq')
          this.configSvc.userProfile = {
            country: get(profileV2, 'personalDetails.countryCode') || null,
            email: get(profileV2, 'profileDetails.officialEmail') || userPidProfile.email,
            givenName: userPidProfile.firstName,
            userId: userPidProfile.userId,
            firstName: userPidProfile.firstName,
            lastName: userPidProfile.lastName,
            rootOrgId: userPidProfile.rootOrgId,
            rootOrgName: userPidProfile.channel,
            // tslint:disable-next-line: max-line-length
            // userName: `${userPidProfile.firstName ? userPidProfile.firstName : ' '}${userPidProfile.lastName ? userPidProfile.lastName : ' '}`,
            userName: userPidProfile.userName,
            profileImage: userPidProfile.thumbnail,
            departmentName: userPidProfile.channel,
            dealerCode: null,
            isManager: false,
            phone: get(userPidProfile, 'phone'),
            language: (userPidProfile.profileDetails && userPidProfile.profileDetails.preferences && userPidProfile.profileDetails.preferences.language !== undefined) ? userPidProfile.profileDetails.preferences.language : 'en',
          }
          this.configSvc.userProfileV2 = {
            userId: get(profileV2, 'userId') || userPidProfile.userId,
            email: get(profileV2, 'personalDetails.officialEmail') || userPidProfile.email,
            firstName: get(profileV2, 'personalDetails.firstname') || userPidProfile.firstName,
            surName: get(profileV2, 'personalDetails.surname') || userPidProfile.lastName,
            middleName: get(profileV2, 'personalDetails.middlename') || '',
            departmentName: get(profileV2, 'employmentDetails.departmentName') || userPidProfile.channel,
            givenName: get(userPidProfile, 'userName'),
            // tslint:disable-next-line: max-line-length
            userName: `${get(profileV2, 'personalDetails.firstname') ? get(profileV2, 'personalDetails.firstname') : ''}${get(profileV2, 'personalDetails.surname') ? get(profileV2, 'personalDetails.surname') : ''}`,
            profileImage: get(profileV2, 'photo') || userPidProfile.thumbnail,
            dealerCode: null,
            isManager: false,
            language: (userPidProfile.profileDetails && userPidProfile.profileDetails.preferences && userPidProfile.profileDetails.preferences.language !== undefined) ? userPidProfile.profileDetails.preferences.language : 'en',
          }
          if (!this.configSvc.nodebbUserProfile) {
            this.configSvc.nodebbUserProfile = {
              username: userPidProfile.userName,
              email: 'null',
            }
          }
        } else {
          //this.authSvc.logout()
        }
        // 🔹 Now that we have userProfile.rootOrgId, fetch org-selective config
        try {
          await this.fetchOrgSelectiveConfig()
        } catch (err) {
          console.warn('fetchOrgSelectiveConfig failed (non-fatal):', err)
        }
        const details = {
          group: [],
          profileDetailsStatus: !!get(userPidProfile, 'profileDetails.mandatoryFieldsExists'),
          roles: (userPidProfile.roles || []).map((v: { toLowerCase: () => void }) => v.toLowerCase()),
          tncStatus: !(isUndefined(this.configSvc.unMappedUser)),
          isActive: !!!userPidProfile.isDeleted,
        }
        this.configSvc.hasAcceptedTnc = details.tncStatus
        this.configSvc.profileDetailsStatus = details.profileDetailsStatus
        // this.configSvc.userRoles = new Set((userRoles || []).map(v => v.toLowerCase()))
        // const detailsV: IDetailsResponse = await this.http
        // .get<IDetailsResponse>(endpoint.details).pipe(retry(3))
        // .toPromise()
        this.configSvc.userGroups = new Set(details.group)
        this.configSvc.userRoles = new Set((details.roles || []).map((v: string) => v.toLowerCase()))
        this.configSvc.isActive = details.isActive
        return details
      } catch (e: any) {
        // tslint:disable-next-line:no-console
        console.log(e)
        this.configSvc.userProfile = null
        if (e.status === 419) {
          //this.authSvc.logout()
        }
        return e
      }
    } else {
      return { group: [], profileDetailsStatus: true, roles: new Set(['Public']), tncStatus: true, isActive: true }
      // const details: IDetailsResponse = await this.http
      //   .get<IDetailsResponse>(endpoint.details).pipe(retry(3))
      //   .toPromise()
      // this.configSvc.userGroups = new Set(details.group)
      // this.configSvc.userRoles = new Set((details.roles || []).map(v => v.toLowerCase()))
      // if (this.configSvc.userProfile && this.configSvc.userProfile.isManager) {
      //   this.configSvc.userRoles.add('is_manager')
    }
  }

  private async fetchInstanceConfig(): Promise<NsInstanceConfig.IConfig> {
    // TODO: use the rootOrg and org to fetch the instance
    const publicConfig = await this.http
      .get<NsInstanceConfig.IConfig>(`${this.configSvc.sitePath}/site.config.json`)
      .toPromise()
    this.configSvc.instanceConfig = publicConfig
    this.configSvc.rootOrg = publicConfig.rootOrg
    this.configSvc.org = publicConfig.org
    this.configSvc.activeOrg = publicConfig.org[0]
    this.updateAppIndexMeta()
    return publicConfig
  }

  private async fetchFeaturesStatus(): Promise<Set<string>> {
    // TODO: use the rootOrg and org to fetch the features
    const featureConfigs = await this.http
      .get<IFeaturePermissionConfigs>(`fusion-assets/files/features.config.json`)
      .toPromise()
    this.configSvc.restrictedFeatures = new Set(
      Object.entries(featureConfigs)
        .filter(
          ([_k, v]) => !hasPermissions(v, this.configSvc.userRoles, this.configSvc.userGroups),
        )
        .map(([k]) => k),
    )
    return this.configSvc.restrictedFeatures
  }
  private async fetchWidgetStatus(): Promise<NsWidgetResolver.IRegistrationsPermissionConfig[]> {
    const widgetConfigs = await this.http
      .get<NsWidgetResolver.IRegistrationsPermissionConfig[]>(`fusion-assets/files/widgets.config.json`)
      .toPromise()
    return widgetConfigs
  }

  private processWidgetStatus(widgetConfigs: NsWidgetResolver.IRegistrationsPermissionConfig[]) {
    this.configSvc.restrictedWidgets = new Set(
      widgetConfigs
        .filter(u =>
          hasPermissions(
            u.widgetPermission,
            this.configSvc.userRoles,
            this.configSvc.userGroups,
            this.configSvc.restrictedFeatures,
          ),
        )
        .map(u => WidgetResolverService.getWidgetKey(u)),
    )
    return this.configSvc.restrictedWidgets
  }

  private processAppsConfig(appsConfig: NsAppsConfig.IAppsConfig): NsAppsConfig.IAppsConfig {
    if (!appsConfig || !appsConfig.features || !appsConfig.groups) {
      return { features: {}, groups: [], tourGuide: {} } as NsAppsConfig.IAppsConfig
    }
    const tourGuide = appsConfig.tourGuide
    const features: { [id: string]: NsAppsConfig.IFeature } = Object.values(
      appsConfig.features,
    ).reduce((map: { [id: string]: NsAppsConfig.IFeature }, feature: NsAppsConfig.IFeature) => {
      if (hasUnitPermission(feature.permission, this.configSvc.restrictedFeatures, true)) {
        map[feature.id] = feature
      }
      return map
      // tslint:disable-next-line: align
    }, {})
    const groups = appsConfig.groups
      .map((group: NsAppsConfig.IGroup) => ({
        ...group,
        featureIds: group.featureIds.filter(id => Boolean(features[id])),
      }))
      .filter(group => group.featureIds.length)
    return { features, groups, tourGuide }
  }
  private updateNavConfig() {
    if (this.configSvc.instanceConfig) {
      const background = this.configSvc.instanceConfig.backgrounds
      if (background.primaryNavBar) {
        this.configSvc.primaryNavBar = background.primaryNavBar
      }
      if (background.pageNavBar) {
        this.configSvc.pageNavBar = background.pageNavBar
      }

      if (this.configSvc.instanceConfig.primaryNavBarConfig) {
        this.configSvc.primaryNavBarConfig = this.configSvc.instanceConfig.primaryNavBarConfig
      }
      if (this.configSvc.instanceConfig.bannerStats) {
        this.configSvc.bannerStats = this.configSvc.instanceConfig.bannerStats
      }
    }
  }

  private updateAppIndexMeta() {
    if (this.configSvc.instanceConfig) {
      //document.title = this.configSvc.instanceConfig.details.appName
      try {
        if (this.configSvc.instanceConfig.indexHtmlMeta.description) {
          const manifestElem = document.getElementById('id-app-description')
          if (manifestElem) {
            // tslint:disable-next-line: semicolon // tslint:disable-next-line: whitespace
            ; (manifestElem as HTMLMetaElement).setAttribute(
              'content',
              this.configSvc.instanceConfig.indexHtmlMeta.description,
            )
          }
        }
        // if (this.configSvc.instanceConfig.indexHtmlMeta.webmanifest) {
        //   const manifestElem = document.getElementById('id-app-webmanifest')
        //   if (manifestElem) {
        //     // tslint:disable-next-line: semicolon // tslint:disable-next-line: whitespace
        //     ; (manifestElem as HTMLLinkElement).setAttribute(
        //       'href',
        //       this.configSvc.instanceConfig.indexHtmlMeta.webmanifest,
        //     )
        //   }
        // }
        if (this.configSvc.instanceConfig.logos.app) {
          const shareIcon = document.getElementById('id-app-share-icon')
          if (shareIcon) {
            // tslint:disable-next-line: semicolon // tslint:disable-next-line: whitespace
            ; (shareIcon as HTMLMetaElement).setAttribute(
              'content',
              this.configSvc.instanceConfig.logos.appBottomNav,
            )
          }
        }
        if (this.configSvc.instanceConfig.indexHtmlMeta.pngIcon) {
          const pngIconElem = document.getElementById('id-app-fav-icon')
          if (pngIconElem) {
            // tslint:disable-next-line: semicolon // tslint:disable-next-line: whitespace
            ; (pngIconElem as HTMLLinkElement).href = this.configSvc.instanceConfig.indexHtmlMeta.pngIcon
          }
        }
        if (this.configSvc.instanceConfig.indexHtmlMeta.xIcon) {
          const xIconElem = document.getElementById('id-app-x-icon')
          if (xIconElem) {
            // tslint:disable-next-line: semicolon // tslint:disable-next-line: whitespace
            ; (xIconElem as HTMLLinkElement).href = this.configSvc.instanceConfig.indexHtmlMeta.xIcon
          }
        }
      } catch (error) {
        this.logger.error('Error updating index html meta >', error)
      }
    }
  }
  hasRole(role: string[]): boolean {
    let returnValue = false
    // const rolesForCBP = environment.portalRoles
    const rolesForCBP: any = ['PUBLIC']
    role.forEach(v => {
      if ((rolesForCBP).includes(v)) {
        returnValue = true
      }
    })
    return returnValue
  }
}
