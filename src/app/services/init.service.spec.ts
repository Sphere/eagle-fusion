jest.mock('@ws-widget/collection', () => ({
  BtnSettingsService: class { initializePrefChanges = jest.fn() },
}))

jest.mock('@ws-widget/resolver', () => ({
  hasPermissions: jest.fn().mockReturnValue(true),
  hasUnitPermission: jest.fn().mockReturnValue(true),
  WidgetResolverService: class {
    initialize = jest.fn()
    static getWidgetKey = jest.fn((u: any) => `${u.widgetType}:${u.widgetSubType}`)
  },
}))

jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class {
    isProduction = false
    instanceConfig: any = null
    userProfile: any = null
    userProfileV2: any = null
    unMappedUser: any = undefined
    userPreference: any = null
    userRoles = new Set()
    userGroups = new Set()
    restrictedFeatures = new Set()
    restrictedWidgets = new Set()
    hasAcceptedTnc = false
    profileDetailsStatus = false
    isActive = true
    nodebbUserProfile: any = null
    appsConfig: any = null
    rootOrg: any = ''
    org: any = []
    activeOrg: any = ''
    appSetup: any = null
    orgSelectiveCourseConfig: any = null
    orgHomeRedirectMap = new Map()
    primaryNavBar: any = null
    pageNavBar: any = null
    primaryNavBarConfig: any = null
    bannerStats: any = null
  },
  LoggerService: class { log = jest.fn(); warn = jest.fn(); error = jest.fn(); info = jest.fn() },
  UserPreferenceService: class { initialize = jest.fn() },
}))

jest.mock('../../environments/environment', () => ({
  environment: { production: false },
}))

jest.mock('library/ws-widget/utils/src/lib/services/auth-keycloak.service', () => ({
  AuthKeycloakService: class { initAuth = jest.fn(); logout = jest.fn() },
}))

jest.mock('./user-data-cache.service', () => ({
  UserDataCacheService: class { getCachedUserData = jest.fn(); getUserData = jest.fn() },
}))

jest.mock('./config-cache.service', () => ({
  ConfigCacheService: class { getHostConfig = jest.fn() },
}))

jest.mock('../constants/apiConstants', () => ({
  S3_END_POINTS: { ORG_SELECTIVE_COURSE: '/s3/org-selective-course.json' },
  API_END_POINTS: { FORM_READ: '/api/form/read' },
}))

import { InitService } from './init.service'
import { ConfigurationsService, UserPreferenceService } from '@ws-widget/utils'
import { BtnSettingsService } from '@ws-widget/collection'
import { WidgetResolverService, hasPermissions, hasUnitPermission } from '@ws-widget/resolver'
import { UserDataCacheService } from './user-data-cache.service'
import { ConfigCacheService } from './config-cache.service'
import { AuthKeycloakService } from 'library/ws-widget/utils/src/lib/services/auth-keycloak.service'

const obsOf = (value: any) => ({ toPromise: () => Promise.resolve(value) })
const obsErr = (err: any) => ({ toPromise: () => Promise.reject(err) })

function makeService(baseHref = 'en') {
  const mockConfigSvc = new ConfigurationsService() as any
  const mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn(), info: jest.fn() }
  const mockIconRegistry = { addSvgIcon: jest.fn() }
  const mockDomSanitizer = { bypassSecurityTrustResourceUrl: jest.fn().mockImplementation(url => `safe:${url}`) }
  const mockHttp = { get: jest.fn(), post: jest.fn() }
  const mockWidgetResolver = new (WidgetResolverService as any)()
  const mockSettingsSvc = new (BtnSettingsService as any)()
  const mockUserPreference = new (UserPreferenceService as any)()
  const mockAuthSvc = new (AuthKeycloakService as any)()
  const mockUserDataCacheSvc = new (UserDataCacheService as any)()
  const mockConfigCacheSvc = new (ConfigCacheService as any)()

  const svc = new InitService(
    mockLogger as any,
    mockConfigSvc as any,
    mockWidgetResolver,
    mockSettingsSvc,
    mockUserPreference,
    mockHttp as any,
    mockAuthSvc,
    baseHref,
    mockDomSanitizer as any,
    mockIconRegistry as any,
    mockUserDataCacheSvc,
    mockConfigCacheSvc,
  )
  return {
    svc,
    mockIconRegistry,
    mockDomSanitizer,
    mockConfigSvc,
    mockLogger,
    mockHttp,
    mockWidgetResolver,
    mockSettingsSvc,
    mockUserPreference,
    mockAuthSvc,
    mockUserDataCacheSvc,
    mockConfigCacheSvc,
  }
}

function routeHttpGet(mockHttp: any, responses: { [url: string]: any }) {
  mockHttp.get.mockImplementation((url: string) =>
    Object.prototype.hasOwnProperty.call(responses, url)
      ? obsOf(responses[url])
      : obsErr(new Error(`no mock for ${url}`)))
}

const HOST_CONFIG = () => ({
  rootOrg: 'aastrika',
  org: ['aastrika-org'],
  appSetup: { done: true },
  backgrounds: {},
})

const SITE_CONFIG = () => ({
  rootOrg: 'site-root',
  org: ['site-org'],
  featuredApps: ['f1', 'f2'],
  backgrounds: { primaryNavBar: { color: '#fff' }, pageNavBar: { color: '#000' } },
  primaryNavBarConfig: { hamburger: true },
  bannerStats: { learners: 10 },
  indexHtmlMeta: {},
  logos: {},
})

const APPS_CONFIG = () => ({
  features: { f1: { id: 'f1', permission: {} } },
  groups: [
    { id: 'g1', featureIds: ['f1', 'f2'] },
    { id: 'g2', featureIds: ['f2'] },
  ],
  tourGuide: { steps: [] },
})

const WIDGETS_CONFIG = () => ([
  { widgetType: 'card', widgetSubType: 'basic', widgetPermission: {} },
])

const FEATURES_CONFIG = () => ({ featA: {}, featB: {} })

const USER = () => ({
  userId: 'u1',
  firstName: 'Asha',
  lastName: 'Worker',
  email: 'asha@example.org',
  rootOrgId: 'org-1',
  channel: 'Aastrika',
  userName: 'asha.w',
  thumbnail: 'thumb.png',
  roles: ['PUBLIC'],
  isDeleted: false,
  phone: '999',
  profileDetails: {
    mandatoryFieldsExists: true,
    preferences: { language: 'en' },
    profileReq: {
      personalDetails: {
        countryCode: 'IN',
        firstname: 'Asha',
        surname: 'Worker',
        officialEmail: 'official@example.org',
      },
    },
  },
})

const ORG_SELECTIVE = () => ({
  states: [
    { organisations: [{ orgId: 'org-x', orgName: 'Other Org' }] },
    { organisations: [{ orgId: 'org-1', orgName: 'Health & Care Org' }] },
  ],
})

const FORM_READ_RESP = () => ({
  result: { form: { data: { homeRedirectOrgs: [{ orgId: 'org-1', redirectUrl: '/app/org-details' }] } } },
})

const ALL_HTTP_ROUTES = () => ({
  '/s3/org-selective-course.json': ORG_SELECTIVE(),
  'fusion-assets/files/apps.json': APPS_CONFIG(),
  'fusion-assets/files/apps.hi.json': APPS_CONFIG(),
  'fusion-assets/files/site.config.json': SITE_CONFIG(),
  'fusion-assets/files/widgets.config.json': WIDGETS_CONFIG(),
  'fusion-assets/files/features.config.json': FEATURES_CONFIG(),
})

function setupHappyPath(httpOverrides: { [url: string]: any } = {}) {
  const ctx = makeService()
  ctx.mockAuthSvc.initAuth.mockResolvedValue(true)
  localStorage.setItem('loginDetailsWithToken', JSON.stringify({ status: 'success' }))
  ctx.mockConfigCacheSvc.getHostConfig.mockReturnValue(obsOf(HOST_CONFIG()))
  ctx.mockUserDataCacheSvc.getCachedUserData.mockReturnValue(null)
  ctx.mockUserDataCacheSvc.getUserData.mockReturnValue(obsOf(USER()))
  routeHttpGet(ctx.mockHttp, { ...ALL_HTTP_ROUTES(), ...httpOverrides })
  ctx.mockHttp.post.mockReturnValue(obsOf(FORM_READ_RESP()))
  return ctx
}

function setupMinimal(authenticated: boolean) {
  const ctx = makeService()
  ctx.mockAuthSvc.initAuth.mockResolvedValue(authenticated)
  ctx.mockConfigCacheSvc.getHostConfig.mockReturnValue(obsErr(new Error('no host config')))
  ctx.mockUserDataCacheSvc.getCachedUserData.mockReturnValue(null)
  ctx.mockUserDataCacheSvc.getUserData.mockReturnValue(obsOf(null))
  routeHttpGet(ctx.mockHttp, {})
  ctx.mockHttp.post.mockReturnValue(obsErr(new Error('no post mock')))
  return ctx
}

describe('InitService', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/')
    const hp = hasPermissions as jest.Mock
    hp.mockReturnValue(true)
    const hup = hasUnitPermission as jest.Mock
    hup.mockReturnValue(true)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
    localStorage.clear()
  })

  it('should create', () => {
    const { svc } = makeService()
    expect(svc).toBeTruthy()
  })

  it('sets isProduction on config service from environment', () => {
    const { mockConfigSvc } = makeService()
    expect(mockConfigSvc.isProduction).toBe(false)
  })

  it('registers pin, facebook, linked-in and twitter SVG icons in constructor', () => {
    const { mockIconRegistry } = makeService()
    expect(mockIconRegistry.addSvgIcon).toHaveBeenCalledTimes(4)
    expect(mockIconRegistry.addSvgIcon).toHaveBeenCalledWith('pin', expect.anything())
    expect(mockIconRegistry.addSvgIcon).toHaveBeenCalledWith('facebook', expect.anything())
    expect(mockIconRegistry.addSvgIcon).toHaveBeenCalledWith('linked-in', expect.anything())
    expect(mockIconRegistry.addSvgIcon).toHaveBeenCalledWith('twitter', expect.anything())
  })

  it('bypassSecurityTrustResourceUrl is called for each icon asset', () => {
    const { mockDomSanitizer } = makeService()
    expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('fusion-assets/icons/pin.svg')
    expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('fusion-assets/icons/facebook.svg')
  })

  describe('locale getter', () => {
    it('returns baseHref without slashes', () => {
      const { svc } = makeService('en')
      expect(svc.locale).toBe('en')
    })

    it('returns baseHref for hindi locale', () => {
      const { svc } = makeService('hi')
      expect(svc.locale).toBe('hi')
    })

    it('returns "en" when baseHref is only slashes', () => {
      const { svc } = makeService('/')
      expect(svc.locale).toBe('en')
    })

    it('returns "en" when baseHref is empty string', () => {
      const { svc } = makeService('')
      expect(svc.locale).toBe('en')
    })
  })

  it('getOrgSelectiveConfig returns null initially', () => {
    const { svc } = makeService()
    expect(svc.getOrgSelectiveConfig()).toBeNull()
  })

  describe('hasRole', () => {
    it('returns true when PUBLIC is in roles', () => {
      const { svc } = makeService()
      expect(svc.hasRole(['PUBLIC'])).toBe(true)
    })

    it('returns false when PUBLIC is not in roles', () => {
      const { svc } = makeService()
      expect(svc.hasRole(['ADMIN', 'USER'])).toBe(false)
    })

    it('returns false for empty roles array', () => {
      const { svc } = makeService()
      expect(svc.hasRole([])).toBe(false)
    })

    it('returns true when PUBLIC is among multiple roles', () => {
      const { svc } = makeService()
      expect(svc.hasRole(['ADMIN', 'PUBLIC', 'USER'])).toBe(true)
    })

    it('is case-sensitive — lowercase public does not match', () => {
      const { svc } = makeService()
      expect(svc.hasRole(['public'])).toBe(false)
    })
  })

  describe('init orchestration', () => {
    it('runs the full authenticated flow and returns true', async () => {
      const ctx = setupHappyPath()
      const result = await ctx.svc.init()

      expect(result).toBe(true)
      expect(ctx.mockAuthSvc.logout).not.toHaveBeenCalled()

      expect(ctx.mockConfigSvc.userProfile).toBeTruthy()
      expect(ctx.mockConfigSvc.userProfile.userId).toBe('u1')
      expect(ctx.mockConfigSvc.userProfile.email).toBe('asha@example.org')
      expect(ctx.mockConfigSvc.userProfile.rootOrgId).toBe('org-1')
      expect(ctx.mockConfigSvc.userProfileV2.email).toBe('official@example.org')
      expect(ctx.mockConfigSvc.userProfileV2.userName).toBe('AshaWorker')
      expect(localStorage.getItem('telemetrySessionId')).toBeTruthy()

      expect(ctx.mockConfigSvc.hasAcceptedTnc).toBe(true)
      expect(ctx.mockConfigSvc.profileDetailsStatus).toBe(true)
      expect(ctx.mockConfigSvc.isActive).toBe(true)
      expect(ctx.mockConfigSvc.userRoles.has('public')).toBe(true)

      expect(ctx.mockConfigSvc.orgSelectiveCourseConfig).toEqual({ orgId: 'org-1', orgName: 'Health & Care Org' })
      expect(ctx.mockConfigSvc.orgHomeRedirectMap.get('org-1')).toBe('/app/org-details')

      expect(ctx.mockWidgetResolver.initialize).toHaveBeenCalledTimes(1)
      expect(ctx.mockConfigSvc.restrictedWidgets.has('card:basic')).toBe(true)
      expect(ctx.mockConfigSvc.restrictedFeatures.size).toBe(0)

      expect(ctx.mockConfigSvc.instanceConfig.featuredApps).toEqual(['f1'])
      expect(Object.keys(ctx.mockConfigSvc.appsConfig.features)).toEqual(['f1'])
      expect(ctx.mockConfigSvc.appsConfig.groups).toEqual([{ id: 'g1', featureIds: ['f1'] }])

      expect(ctx.mockConfigSvc.primaryNavBar).toEqual({ color: '#fff' })
      expect(ctx.mockConfigSvc.pageNavBar).toEqual({ color: '#000' })
      expect(ctx.mockConfigSvc.primaryNavBarConfig).toEqual({ hamburger: true })
      expect(ctx.mockConfigSvc.bannerStats).toEqual({ learners: 10 })

      expect(ctx.mockSettingsSvc.initializePrefChanges).toHaveBeenCalledWith(false)
      expect(ctx.mockUserPreference.initialize).toHaveBeenCalled()
    })

    it('logs out when authenticated but no stored login details exist', async () => {
      const ctx = setupMinimal(true)
      const result = await ctx.svc.init()
      expect(ctx.mockAuthSvc.logout).toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('logs out when stored login status is not success', async () => {
      const ctx = setupMinimal(true)
      localStorage.setItem('loginDetailsWithToken', JSON.stringify({ status: 'failed' }))
      await ctx.svc.init()
      expect(ctx.mockAuthSvc.logout).toHaveBeenCalled()
    })

    it('does not log out when stored login status is success', async () => {
      const ctx = setupMinimal(true)
      localStorage.setItem('loginDetailsWithToken', JSON.stringify({ status: 'success' }))
      await ctx.svc.init()
      expect(ctx.mockAuthSvc.logout).not.toHaveBeenCalled()
    })

    it('skips the logout checks entirely when unauthenticated', async () => {
      const ctx = setupMinimal(false)
      localStorage.setItem('loginDetailsWithToken', JSON.stringify({ status: 'failed' }))
      const result = await ctx.svc.init()
      expect(ctx.mockAuthSvc.logout).not.toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('warns but still returns true when a later config fetch fails', async () => {
      const ctx = setupMinimal(false)
      const result = await ctx.svc.init()
      expect(result).toBe(true)
      expect(ctx.mockLogger.warn).toHaveBeenCalledWith(
        'Initialization process encountered some error. Application may not work as expected',
        expect.anything(),
      )
      expect(ctx.mockSettingsSvc.initializePrefChanges).toHaveBeenCalled()
    })

    it('does not load user data or startup details on /public routes', async () => {
      window.history.pushState({}, '', '/public/home')
      const ctx = setupHappyPath()
      const result = await ctx.svc.init()
      expect(result).toBe(true)
      expect(ctx.mockUserDataCacheSvc.getCachedUserData).not.toHaveBeenCalled()
      expect(ctx.mockUserDataCacheSvc.getUserData).not.toHaveBeenCalled()
      expect(ctx.mockHttp.post).not.toHaveBeenCalled()
    })

    it('does not load user data or startup details on /app/create-account', async () => {
      window.history.pushState({}, '', '/app/create-account')
      const ctx = setupHappyPath()
      await ctx.svc.init()
      expect(ctx.mockUserDataCacheSvc.getUserData).not.toHaveBeenCalled()
    })

    it('returns false when startup details fetch throws', async () => {
      const ctx = setupHappyPath()
      jest.spyOn(ctx.svc as any, 'fetchStartUpDetails').mockRejectedValue(new Error('boom'))
      const result = await ctx.svc.init()
      expect(result).toBe(false)
      expect(ctx.mockLogger.info).toHaveBeenCalledWith('Not Authenticated')
      expect(ctx.mockSettingsSvc.initializePrefChanges).toHaveBeenCalledWith(false)
      expect(ctx.mockUserPreference.initialize).not.toHaveBeenCalled()
    })

    it('recovers when site instance config fetch fails mid-flight', async () => {
      const ctx = setupHappyPath()
      routeHttpGet(ctx.mockHttp, {
        ...ALL_HTTP_ROUTES(),
        'fusion-assets/files/site.config.json': undefined,
      })
      ctx.mockHttp.get.mockImplementation((url: string) =>
        url === 'fusion-assets/files/site.config.json'
          ? obsErr(new Error('site config down'))
          : obsOf((ALL_HTTP_ROUTES() as any)[url]))
      const result = await ctx.svc.init()
      expect(result).toBe(true)
      expect(ctx.mockLogger.warn).toHaveBeenCalledWith(
        'Initialization process encountered some error. Application may not work as expected',
        expect.anything(),
      )
    })
  })

  describe('fetchDefaultConfig', () => {
    it('stores the host config on the configurations service', async () => {
      const { svc, mockConfigSvc, mockConfigCacheSvc } = makeService()
      mockConfigCacheSvc.getHostConfig.mockReturnValue(obsOf(HOST_CONFIG()))
      const result = await (svc as any).fetchDefaultConfig()
      expect(mockConfigCacheSvc.getHostConfig).toHaveBeenCalledWith('en')
      expect(result).toEqual(HOST_CONFIG())
      expect(mockConfigSvc.instanceConfig).toEqual(HOST_CONFIG())
      expect(mockConfigSvc.rootOrg).toBe('aastrika')
      expect(mockConfigSvc.org).toEqual(['aastrika-org'])
      expect(mockConfigSvc.activeOrg).toBe('aastrika-org')
      expect(mockConfigSvc.appSetup).toEqual({ done: true })
    })

    it('requests the hindi host config when baseHref is hi', async () => {
      const { svc, mockConfigCacheSvc } = makeService('hi')
      mockConfigCacheSvc.getHostConfig.mockReturnValue(obsOf(HOST_CONFIG()))
      await (svc as any).fetchDefaultConfig()
      expect(mockConfigCacheSvc.getHostConfig).toHaveBeenCalledWith('hi')
    })

    it('returns null and warns when host config fetch fails', async () => {
      const { svc, mockConfigSvc, mockConfigCacheSvc, mockLogger } = makeService()
      mockConfigCacheSvc.getHostConfig.mockReturnValue(obsErr(new Error('offline')))
      const result = await (svc as any).fetchDefaultConfig()
      expect(result).toBeNull()
      expect(mockLogger.warn).toHaveBeenCalledWith(
        '[InitService] fetchDefaultConfig failed (SSR/prerender context):',
        expect.anything(),
      )
      expect(mockConfigSvc.instanceConfig).toBeNull()
    })
  })

  describe('loadUserDataIfAvailable', () => {
    it('uses in-memory cached data and skips the API', async () => {
      const { svc, mockConfigSvc, mockUserDataCacheSvc } = makeService()
      const cached = USER()
      mockUserDataCacheSvc.getCachedUserData.mockReturnValue(cached)
      await (svc as any).loadUserDataIfAvailable()
      expect(mockUserDataCacheSvc.getUserData).not.toHaveBeenCalled()
      expect(mockConfigSvc.unMappedUser).toBe(cached)
      expect(mockConfigSvc.userProfile.userId).toBe('u1')
    })

    it('falls back to the API when no in-memory cache exists', async () => {
      const { svc, mockConfigSvc, mockUserDataCacheSvc } = makeService()
      mockUserDataCacheSvc.getCachedUserData.mockReturnValue(null)
      mockUserDataCacheSvc.getUserData.mockReturnValue(obsOf(USER()))
      await (svc as any).loadUserDataIfAvailable()
      expect(mockUserDataCacheSvc.getUserData).toHaveBeenCalled()
      expect(mockConfigSvc.userProfile.userId).toBe('u1')
    })

    it('logs when neither cache nor API return user data', async () => {
      const { svc, mockConfigSvc, mockUserDataCacheSvc, mockLogger } = makeService()
      mockUserDataCacheSvc.getCachedUserData.mockReturnValue(null)
      mockUserDataCacheSvc.getUserData.mockReturnValue(obsOf(null))
      await (svc as any).loadUserDataIfAvailable()
      expect(mockLogger.log).toHaveBeenCalledWith('[InitService] No user data available in cache or API')
      expect(mockConfigSvc.userProfile).toBeNull()
    })

    it('warns without throwing when the user data API fails', async () => {
      const { svc, mockUserDataCacheSvc, mockLogger } = makeService()
      mockUserDataCacheSvc.getCachedUserData.mockReturnValue(null)
      mockUserDataCacheSvc.getUserData.mockReturnValue(obsErr(new Error('401')))
      await expect((svc as any).loadUserDataIfAvailable()).resolves.toBeUndefined()
      expect(mockLogger.warn).toHaveBeenCalledWith('[InitService] Unable to load user data:', expect.anything())
    })
  })

  describe('updateConfigWithUserData', () => {
    it('returns early for null profile', () => {
      const { svc, mockConfigSvc } = makeService()
      const target = svc as any
      target.updateConfigWithUserData(null)
      expect(mockConfigSvc.userProfile).toBeNull()
    })

    it('returns early when profile has no userId', () => {
      const { svc, mockConfigSvc } = makeService()
      const target = svc as any
      target.updateConfigWithUserData({ firstName: 'NoId' })
      expect(mockConfigSvc.userProfile).toBeNull()
    })

    it('maps user data onto userProfile with roles and groups', () => {
      const { svc, mockConfigSvc } = makeService()
      const user = { ...USER(), roles: ['PUBLIC', 'ADMIN'], group: ['g1', 'g2'] }
      const target = svc as any
      target.updateConfigWithUserData(user)
      expect(mockConfigSvc.userProfile).toMatchObject({
        userId: 'u1',
        firstName: 'Asha',
        lastName: 'Worker',
        rootOrgId: 'org-1',
        rootOrgName: 'Aastrika',
        departmentName: 'Aastrika',
        country: 'IN',
        email: 'asha@example.org',
        phone: '999',
        language: 'en',
      })
      expect(mockConfigSvc.userRoles.has('public')).toBe(true)
      expect(mockConfigSvc.userRoles.has('admin')).toBe(true)
      expect(mockConfigSvc.userGroups.has('g1')).toBe(true)
    })

    it('defaults language to en when preferences are missing', () => {
      const { svc, mockConfigSvc } = makeService()
      const user = { userId: 'u2', firstName: 'X', lastName: 'Y', email: 'x@y.z' }
      const target = svc as any
      target.updateConfigWithUserData(user)
      expect(mockConfigSvc.userProfile.language).toBe('en')
      expect(mockConfigSvc.userProfile.country).toBeNull()
    })

    it('uses preferred language from profile details', () => {
      const { svc, mockConfigSvc } = makeService()
      const user = { ...USER(), profileDetails: { preferences: { language: 'hi' } } }
      const target = svc as any
      target.updateConfigWithUserData(user)
      expect(mockConfigSvc.userProfile.language).toBe('hi')
    })

    it('warns when mapping throws', () => {
      const { svc, mockLogger } = makeService()
      const user = {
        userId: 'u3',
        get roles() {
          throw new Error('boom')
        },
      }
      const target = svc as any
      target.updateConfigWithUserData(user)
      expect(mockLogger.warn).toHaveBeenCalledWith('[InitService] Error updating config with user data:', expect.anything())
    })
  })

  describe('fetchAppsConfig', () => {
    it('loads hindi apps config when user preference language is hi', async () => {
      const { svc, mockConfigSvc, mockHttp } = makeService()
      mockConfigSvc.unMappedUser = { profileDetails: { preferences: { language: 'hi' } } }
      routeHttpGet(mockHttp, ALL_HTTP_ROUTES())
      const result = await (svc as any).fetchAppsConfig()
      expect(mockHttp.get).toHaveBeenCalledWith('fusion-assets/files/apps.hi.json', { responseType: 'json' })
      expect(result).toEqual(APPS_CONFIG())
    })

    it('loads english apps config when user preference language is en', async () => {
      const { svc, mockConfigSvc, mockHttp } = makeService()
      mockConfigSvc.unMappedUser = { profileDetails: { preferences: { language: 'en' } } }
      routeHttpGet(mockHttp, ALL_HTTP_ROUTES())
      await (svc as any).fetchAppsConfig()
      expect(mockHttp.get).toHaveBeenCalledWith('fusion-assets/files/apps.json', { responseType: 'json' })
    })

    it('reads language from localStorage when user has no preferences', async () => {
      const { svc, mockHttp } = makeService()
      localStorage.setItem('language', 'hi')
      routeHttpGet(mockHttp, ALL_HTTP_ROUTES())
      await (svc as any).fetchAppsConfig()
      expect(mockHttp.get).toHaveBeenCalledWith('fusion-assets/files/apps.hi.json', { responseType: 'json' })
    })

    it('defaults to english apps config with no user and no localStorage', async () => {
      const { svc, mockHttp } = makeService()
      routeHttpGet(mockHttp, ALL_HTTP_ROUTES())
      await (svc as any).fetchAppsConfig()
      expect(mockHttp.get).toHaveBeenCalledWith('fusion-assets/files/apps.json', { responseType: 'json' })
    })

    it('returns an empty config when the request rejects', async () => {
      const { svc, mockHttp } = makeService()
      routeHttpGet(mockHttp, {})
      const result = await (svc as any).fetchAppsConfig()
      expect(result).toEqual({ features: {}, groups: [], tourGuide: {} })
    })

    it('returns an empty config and logs when the request throws synchronously', async () => {
      const { svc, mockHttp, mockLogger } = makeService()
      mockHttp.get.mockImplementation(() => {
        throw new Error('sync failure')
      })
      const result = await (svc as any).fetchAppsConfig()
      expect(result).toEqual({ features: {}, groups: [], tourGuide: {} })
      expect(mockLogger.error).toHaveBeenCalledWith('Error fetching apps config:', expect.anything())
    })
  })

  describe('fetchStartUpDetails', () => {
    function setupStartUp(user: any) {
      const ctx = makeService()
      ctx.mockConfigSvc.instanceConfig = {}
      ctx.mockUserDataCacheSvc.getUserData.mockReturnValue(obsOf(user))
      routeHttpGet(ctx.mockHttp, ALL_HTTP_ROUTES())
      ctx.mockHttp.post.mockReturnValue(obsOf(FORM_READ_RESP()))
      return ctx
    }

    it('returns public defaults when pid check is disabled', async () => {
      const { svc, mockConfigSvc, mockUserDataCacheSvc } = makeService()
      mockConfigSvc.instanceConfig = { disablePidCheck: true }
      const details = await (svc as any).fetchStartUpDetails()
      expect(details.profileDetailsStatus).toBe(true)
      expect(details.tncStatus).toBe(true)
      expect(details.isActive).toBe(true)
      expect(mockUserDataCacheSvc.getUserData).not.toHaveBeenCalled()
    })

    it('returns public defaults when there is no instance config', async () => {
      const { svc, mockUserDataCacheSvc } = makeService()
      const details = await (svc as any).fetchStartUpDetails()
      expect(details.profileDetailsStatus).toBe(true)
      expect(mockUserDataCacheSvc.getUserData).not.toHaveBeenCalled()
    })

    it('populates profiles and rotates the telemetry session for a PUBLIC user', async () => {
      localStorage.setItem('telemetrySessionId', 'stale-session')
      const ctx = setupStartUp(USER())
      const details = await (ctx.svc as any).fetchStartUpDetails()
      expect(localStorage.getItem('telemetrySessionId')).toBeTruthy()
      expect(localStorage.getItem('telemetrySessionId')).not.toBe('stale-session')
      expect(ctx.mockConfigSvc.unMappedUser).toEqual(USER())
      expect(ctx.mockConfigSvc.userProfile.userId).toBe('u1')
      expect(ctx.mockConfigSvc.userProfileV2.firstName).toBe('Asha')
      expect(ctx.mockConfigSvc.nodebbUserProfile).toEqual({ username: 'asha.w', email: 'null' })
      expect(details).toEqual({
        group: [],
        profileDetailsStatus: true,
        roles: ['public'],
        tncStatus: true,
        isActive: true,
      })
      expect(ctx.mockConfigSvc.hasAcceptedTnc).toBe(true)
      expect(ctx.mockConfigSvc.isActive).toBe(true)
    })

    it('does not overwrite an existing nodebb profile', async () => {
      const ctx = setupStartUp(USER())
      ctx.mockConfigSvc.nodebbUserProfile = { username: 'existing', email: 'e@x.y' }
      await (ctx.svc as any).fetchStartUpDetails()
      expect(ctx.mockConfigSvc.nodebbUserProfile).toEqual({ username: 'existing', email: 'e@x.y' })
    })

    it('skips profile mapping for users without an allowed role', async () => {
      const ctx = setupStartUp({ ...USER(), roles: ['ADMIN'] })
      const details = await (ctx.svc as any).fetchStartUpDetails()
      expect(ctx.mockConfigSvc.userProfile).toBeNull()
      expect(localStorage.getItem('telemetrySessionId')).toBeNull()
      expect(details.roles).toEqual(['admin'])
      expect(details.tncStatus).toBe(false)
      expect(ctx.mockConfigSvc.userRoles.has('admin')).toBe(true)
    })

    it('marks user inactive when the profile is deleted', async () => {
      const ctx = setupStartUp({ ...USER(), isDeleted: true })
      const details = await (ctx.svc as any).fetchStartUpDetails()
      expect(details.isActive).toBe(false)
      expect(ctx.mockConfigSvc.isActive).toBe(false)
    })

    it('returns the error and clears userProfile when the user API fails', async () => {
      const ctx = makeService()
      ctx.mockConfigSvc.instanceConfig = {}
      ctx.mockConfigSvc.userProfile = { userId: 'stale' }
      const apiError = { status: 419 }
      ctx.mockUserDataCacheSvc.getUserData.mockReturnValue(obsErr(apiError))
      const result = await (ctx.svc as any).fetchStartUpDetails()
      expect(result).toBe(apiError)
      expect(ctx.mockConfigSvc.userProfile).toBeNull()
      expect(ctx.mockLogger.log).toHaveBeenCalledWith(apiError)
    })

    it('returns the thrown error when the user payload is null', async () => {
      const ctx = setupStartUp(null)
      const result = await (ctx.svc as any).fetchStartUpDetails()
      expect(result).toBeInstanceOf(TypeError)
      expect(ctx.mockConfigSvc.userProfile).toBeNull()
    })

    it('treats org selective and home redirect failures as non-fatal', async () => {
      const ctx = setupStartUp(USER())
      jest.spyOn(ctx.svc as any, 'fetchOrgSelectiveConfig').mockRejectedValue(new Error('s3 down'))
      jest.spyOn(ctx.svc as any, 'fetchOrgHomeRedirectConfig').mockRejectedValue(new Error('form down'))
      const details = await (ctx.svc as any).fetchStartUpDetails()
      expect(details.roles).toEqual(['public'])
      expect(ctx.mockLogger.warn).toHaveBeenCalledWith('fetchOrgSelectiveConfig failed (non-fatal):', expect.anything())
      expect(ctx.mockLogger.warn).toHaveBeenCalledWith('fetchOrgHomeRedirectConfig failed (non-fatal):', expect.anything())
    })
  })

  describe('fetchOrgSelectiveConfig', () => {
    it('matches an org by the logged-in user rootOrgId', async () => {
      const { svc, mockConfigSvc, mockHttp } = makeService()
      mockConfigSvc.userProfile = { rootOrgId: 'org-1' }
      routeHttpGet(mockHttp, ALL_HTTP_ROUTES())
      await (svc as any).fetchOrgSelectiveConfig()
      expect(mockHttp.get).toHaveBeenCalledWith('/s3/org-selective-course.json')
      expect(mockConfigSvc.orgSelectiveCourseConfig).toEqual({ orgId: 'org-1', orgName: 'Health & Care Org' })
    })

    it('matches an org from the ?org= URL parameter with normalization', async () => {
      window.history.pushState({}, '', '/?org=Health+%26+Care+Org')
      const { svc, mockConfigSvc, mockHttp } = makeService()
      routeHttpGet(mockHttp, ALL_HTTP_ROUTES())
      await (svc as any).fetchOrgSelectiveConfig()
      expect(mockConfigSvc.orgSelectiveCourseConfig).toEqual({ orgId: 'org-1', orgName: 'Health & Care Org' })
    })

    it('warns when no org matches', async () => {
      const { svc, mockConfigSvc, mockHttp, mockLogger } = makeService()
      mockConfigSvc.userProfile = { rootOrgId: 'org-unknown' }
      routeHttpGet(mockHttp, ALL_HTTP_ROUTES())
      await (svc as any).fetchOrgSelectiveConfig()
      expect(mockConfigSvc.orgSelectiveCourseConfig).toBeNull()
      expect(mockLogger.warn).toHaveBeenCalledWith('No matching org found in org-selective-course.json')
      expect(mockLogger.warn).toHaveBeenCalledWith('Available org names:', ['Other Org', 'Health & Care Org'])
    })

    it('warns when the payload has no states array', async () => {
      const { svc, mockHttp, mockLogger } = makeService()
      routeHttpGet(mockHttp, { '/s3/org-selective-course.json': {} })
      await (svc as any).fetchOrgSelectiveConfig()
      expect(mockLogger.warn).toHaveBeenCalledWith('org-selective-course.json missing or invalid format')
    })

    it('logs an error when the S3 fetch fails', async () => {
      const { svc, mockHttp, mockLogger } = makeService()
      routeHttpGet(mockHttp, {})
      await (svc as any).fetchOrgSelectiveConfig()
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to fetch org-selective-course.json:', expect.anything())
    })
  })

  describe('fetchOrgHomeRedirectConfig', () => {
    it('builds the redirect map from the form read response', async () => {
      const { svc, mockConfigSvc, mockHttp } = makeService()
      mockHttp.post.mockReturnValue(obsOf(FORM_READ_RESP()))
      await (svc as any).fetchOrgHomeRedirectConfig()
      expect(mockHttp.post).toHaveBeenCalledWith('/api/form/read', {
        request: {
          type: 'org_config',
          subtype: '*',
          action: 'get',
          component: 'web',
          framework: '*',
          rootOrgId: '*',
        },
      })
      expect(mockConfigSvc.orgHomeRedirectMap.get('org-1')).toBe('/app/org-details')
    })

    it('leaves the map untouched when no redirect orgs are configured', async () => {
      const { svc, mockConfigSvc, mockHttp } = makeService()
      mockHttp.post.mockReturnValue(obsOf({}))
      await (svc as any).fetchOrgHomeRedirectConfig()
      expect(mockConfigSvc.orgHomeRedirectMap.size).toBe(0)
    })
  })

  describe('reloadAccordingToLocale', () => {
    const originalLocation = Object.getOwnPropertyDescriptor(window, 'location') as PropertyDescriptor

    const stubLocation = (props: any) => {
      Object.defineProperty(window, 'location', {
        value: {
          origin: 'http://sphere.example.org',
          href: 'http://sphere.example.org/page/home',
          pathname: '/page/home',
          search: '',
          assign: jest.fn(),
          ...props,
        },
        writable: true,
        configurable: true,
      })
      return window.location as any
    }

    afterEach(() => {
      Object.defineProperty(window, 'location', originalLocation)
    })

    it('returns early on localhost with a port', () => {
      const loc = stubLocation({ origin: 'http://localhost:3000', href: 'http://localhost:3000/page/home' })
      const { svc, mockConfigSvc } = makeService()
      mockConfigSvc.instanceConfig = { locals: [{ path: 'hi' }] }
      mockConfigSvc.userPreference = { selectedLocale: 'hi' }
      const target = svc as any
      target.reloadAccordingToLocale()
      expect(loc.assign).not.toHaveBeenCalled()
    })

    it('redirects to the preferred non-english locale', () => {
      const loc = stubLocation({})
      const { svc, mockConfigSvc } = makeService('en')
      mockConfigSvc.instanceConfig = { locals: [{ path: 'hi' }] }
      mockConfigSvc.userPreference = { selectedLocale: 'hi' }
      const target = svc as any
      target.reloadAccordingToLocale()
      expect(loc.assign).toHaveBeenCalledWith('http://sphere.example.org\\hi/page/home')
    })

    it('redirects to origin root path when preferred locale is english', () => {
      const loc = stubLocation({})
      const { svc, mockConfigSvc } = makeService('hi')
      mockConfigSvc.instanceConfig = { locals: [{ path: 'en' }] }
      mockConfigSvc.userPreference = { selectedLocale: 'en' }
      const target = svc as any
      target.reloadAccordingToLocale()
      expect(loc.assign).toHaveBeenCalledWith('http://sphere.example.org/page/home')
    })

    it('strips a doubled locale prefix from the path before redirecting', () => {
      const loc = stubLocation({ href: 'http://sphere.example.org//en//page/home' })
      const { svc, mockConfigSvc } = makeService('en')
      mockConfigSvc.instanceConfig = { locals: [{ path: 'hi' }] }
      mockConfigSvc.userPreference = { selectedLocale: 'hi' }
      const target = svc as any
      target.reloadAccordingToLocale()
      expect(loc.assign).toHaveBeenCalledWith('http://sphere.example.org\\hi/page/home')
    })

    it('does nothing when the running locale matches the preference', () => {
      const loc = stubLocation({})
      const { svc, mockConfigSvc } = makeService('en')
      mockConfigSvc.instanceConfig = { locals: [{ path: 'hi' }] }
      mockConfigSvc.userPreference = { selectedLocale: 'en' }
      const target = svc as any
      target.reloadAccordingToLocale()
      expect(loc.assign).not.toHaveBeenCalled()
    })

    it('does nothing when instance config has no locales', () => {
      const loc = stubLocation({})
      const { svc, mockConfigSvc } = makeService('en')
      mockConfigSvc.instanceConfig = {}
      mockConfigSvc.userPreference = { selectedLocale: 'hi' }
      const target = svc as any
      target.reloadAccordingToLocale()
      expect(loc.assign).not.toHaveBeenCalled()
    })
  })

  describe('fetchInstanceConfig', () => {
    it('returns null when the site config is empty', async () => {
      const { svc, mockConfigSvc, mockHttp } = makeService()
      routeHttpGet(mockHttp, { 'fusion-assets/files/site.config.json': null })
      const result = await (svc as any).fetchInstanceConfig()
      expect(result).toBeNull()
      expect(mockConfigSvc.instanceConfig).toBeNull()
    })

    it('stores the site config and refreshes index meta', async () => {
      const { svc, mockConfigSvc, mockHttp } = makeService()
      const metaSpy = jest.spyOn(svc as any, 'updateAppIndexMeta')
      routeHttpGet(mockHttp, ALL_HTTP_ROUTES())
      const result = await (svc as any).fetchInstanceConfig()
      expect(result).toEqual(SITE_CONFIG())
      expect(mockConfigSvc.instanceConfig).toEqual(SITE_CONFIG())
      expect(mockConfigSvc.rootOrg).toBe('site-root')
      expect(mockConfigSvc.org).toEqual(['site-org'])
      expect(mockConfigSvc.activeOrg).toBe('site-org')
      expect(metaSpy).toHaveBeenCalled()
    })
  })

  describe('fetchFeaturesStatus', () => {
    it('returns an empty set when the config payload is missing', async () => {
      const { svc, mockHttp } = makeService()
      routeHttpGet(mockHttp, { 'fusion-assets/files/features.config.json': null })
      const result = await (svc as any).fetchFeaturesStatus()
      expect(result.size).toBe(0)
    })

    it('keeps no features restricted when permissions allow all', async () => {
      const { svc, mockConfigSvc, mockHttp } = makeService()
      routeHttpGet(mockHttp, ALL_HTTP_ROUTES())
      const result = await (svc as any).fetchFeaturesStatus()
      expect(result.size).toBe(0)
      expect(mockConfigSvc.restrictedFeatures.size).toBe(0)
    })

    it('restricts features that fail the permission check', async () => {
      const { svc, mockConfigSvc, mockHttp } = makeService()
      const hp = hasPermissions as jest.Mock
      hp.mockReturnValue(false)
      routeHttpGet(mockHttp, ALL_HTTP_ROUTES())
      await (svc as any).fetchFeaturesStatus()
      expect(mockConfigSvc.restrictedFeatures.has('featA')).toBe(true)
      expect(mockConfigSvc.restrictedFeatures.has('featB')).toBe(true)
    })
  })

  describe('fetchWidgetStatus', () => {
    it('returns the widget configs from the server', async () => {
      const { svc, mockHttp } = makeService()
      routeHttpGet(mockHttp, ALL_HTTP_ROUTES())
      const result = await (svc as any).fetchWidgetStatus()
      expect(result).toEqual(WIDGETS_CONFIG())
    })

    it('returns an empty array when the payload is falsy', async () => {
      const { svc, mockHttp } = makeService()
      routeHttpGet(mockHttp, { 'fusion-assets/files/widgets.config.json': null })
      const result = await (svc as any).fetchWidgetStatus()
      expect(result).toEqual([])
    })
  })

  describe('processWidgetStatus', () => {
    it('resets restricted widgets for a null payload', () => {
      const { svc, mockConfigSvc } = makeService()
      mockConfigSvc.restrictedWidgets = new Set(['old'])
      const target = svc as any
      const result = target.processWidgetStatus(null)
      expect(result.size).toBe(0)
      expect(mockConfigSvc.restrictedWidgets.size).toBe(0)
    })

    it('collects widget keys for widgets whose permissions match', () => {
      const { svc, mockConfigSvc } = makeService()
      const target = svc as any
      target.processWidgetStatus(WIDGETS_CONFIG())
      expect(mockConfigSvc.restrictedWidgets.has('card:basic')).toBe(true)
    })

    it('collects nothing when permissions do not match', () => {
      const { svc, mockConfigSvc } = makeService()
      const hp = hasPermissions as jest.Mock
      hp.mockReturnValue(false)
      const target = svc as any
      target.processWidgetStatus(WIDGETS_CONFIG())
      expect(mockConfigSvc.restrictedWidgets.size).toBe(0)
    })
  })

  describe('processAppsConfig', () => {
    it('returns an empty config for a null payload', () => {
      const { svc } = makeService()
      const target = svc as any
      expect(target.processAppsConfig(null)).toEqual({ features: {}, groups: [], tourGuide: {} })
    })

    it('returns an empty config when features are missing', () => {
      const { svc } = makeService()
      const target = svc as any
      expect(target.processAppsConfig({ groups: [] })).toEqual({ features: {}, groups: [], tourGuide: {} })
    })

    it('keeps permitted features and prunes empty groups', () => {
      const { svc } = makeService()
      const target = svc as any
      const result = target.processAppsConfig(APPS_CONFIG())
      expect(Object.keys(result.features)).toEqual(['f1'])
      expect(result.groups).toEqual([{ id: 'g1', featureIds: ['f1'] }])
      expect(result.tourGuide).toEqual({ steps: [] })
    })

    it('drops all features and groups when unit permission fails', () => {
      const { svc } = makeService()
      const hup = hasUnitPermission as jest.Mock
      hup.mockReturnValue(false)
      const target = svc as any
      const result = target.processAppsConfig(APPS_CONFIG())
      expect(result.features).toEqual({})
      expect(result.groups).toEqual([])
    })
  })

  describe('updateNavConfig', () => {
    it('does nothing without an instance config', () => {
      const { svc, mockConfigSvc } = makeService()
      const target = svc as any
      target.updateNavConfig()
      expect(mockConfigSvc.primaryNavBar).toBeNull()
      expect(mockConfigSvc.pageNavBar).toBeNull()
    })

    it('copies nav bars, nav config and banner stats from instance config', () => {
      const { svc, mockConfigSvc } = makeService()
      mockConfigSvc.instanceConfig = SITE_CONFIG()
      const target = svc as any
      target.updateNavConfig()
      expect(mockConfigSvc.primaryNavBar).toEqual({ color: '#fff' })
      expect(mockConfigSvc.pageNavBar).toEqual({ color: '#000' })
      expect(mockConfigSvc.primaryNavBarConfig).toEqual({ hamburger: true })
      expect(mockConfigSvc.bannerStats).toEqual({ learners: 10 })
    })

    it('skips fields that are absent in instance config', () => {
      const { svc, mockConfigSvc } = makeService()
      mockConfigSvc.instanceConfig = { backgrounds: {} }
      const target = svc as any
      target.updateNavConfig()
      expect(mockConfigSvc.primaryNavBar).toBeNull()
      expect(mockConfigSvc.pageNavBar).toBeNull()
      expect(mockConfigSvc.primaryNavBarConfig).toBeNull()
      expect(mockConfigSvc.bannerStats).toBeNull()
    })
  })

  describe('updateAppIndexMeta', () => {
    afterEach(() => {
      document.body.innerHTML = ''
    })

    it('updates description, share icon and favicons in the document', () => {
      document.body.innerHTML = [
        '<meta id="id-app-description">',
        '<meta id="id-app-share-icon">',
        '<link id="id-app-fav-icon">',
        '<link id="id-app-x-icon">',
      ].join('')
      const { svc, mockConfigSvc } = makeService()
      mockConfigSvc.instanceConfig = {
        indexHtmlMeta: { description: 'Sphere LMS', pngIcon: 'fav.png', xIcon: 'fav.ico' },
        logos: { app: 'app.png', appBottomNav: 'bottom-nav.png' },
      }
      const target = svc as any
      target.updateAppIndexMeta()
      const description = document.getElementById('id-app-description') as HTMLMetaElement
      const shareIcon = document.getElementById('id-app-share-icon') as HTMLMetaElement
      const favIcon = document.getElementById('id-app-fav-icon') as HTMLLinkElement
      const xIcon = document.getElementById('id-app-x-icon') as HTMLLinkElement
      expect(description.getAttribute('content')).toBe('Sphere LMS')
      expect(shareIcon.getAttribute('content')).toBe('bottom-nav.png')
      expect(favIcon.getAttribute('href')).toBe('fav.png')
      expect(xIcon.getAttribute('href')).toBe('fav.ico')
    })

    it('does not throw when the target elements are absent', () => {
      const { svc, mockConfigSvc, mockLogger } = makeService()
      mockConfigSvc.instanceConfig = {
        indexHtmlMeta: { description: 'Sphere LMS', pngIcon: 'fav.png', xIcon: 'fav.ico' },
        logos: { app: 'app.png', appBottomNav: 'bottom-nav.png' },
      }
      const target = svc as any
      expect(() => target.updateAppIndexMeta()).not.toThrow()
      expect(mockLogger.error).not.toHaveBeenCalled()
    })

    it('logs an error when the instance config shape is broken', () => {
      const { svc, mockConfigSvc, mockLogger } = makeService()
      mockConfigSvc.instanceConfig = {}
      const target = svc as any
      target.updateAppIndexMeta()
      expect(mockLogger.error).toHaveBeenCalledWith('Error updating index html meta >', expect.anything())
    })

    it('does nothing without an instance config', () => {
      const { svc, mockLogger } = makeService()
      const target = svc as any
      target.updateAppIndexMeta()
      expect(mockLogger.error).not.toHaveBeenCalled()
    })
  })
})
