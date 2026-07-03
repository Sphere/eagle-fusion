jest.mock('@ws-widget/collection', () => ({
  BtnSettingsService: class { initializePrefChanges = jest.fn() },
}))

jest.mock('@ws-widget/resolver', () => ({
  hasPermissions: jest.fn().mockReturnValue(true),
  hasUnitPermission: jest.fn().mockReturnValue(true),
  WidgetResolverService: class { initialize = jest.fn() },
}))

jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class {
    isProduction = false
    instanceConfig = null
    userProfile = null
    unMappedUser = undefined
    userRoles = new Set()
    userGroups = new Set()
    restrictedFeatures = new Set()
    restrictedWidgets = new Set()
    hasAcceptedTnc = false
    profileDetailsStatus = false
    isActive = true
    nodebbUserProfile = null
    appsConfig = null
    rootOrg = ''
    org = []
    activeOrg = ''
    appSetup = null
    orgSelectiveCourseConfig = null
    orgHomeRedirectMap = new Map()
    primaryNavBar = null
    pageNavBar = null
    primaryNavBarConfig = null
    bannerStats = null
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
import { WidgetResolverService } from '@ws-widget/resolver'
import { UserDataCacheService } from './user-data-cache.service'
import { ConfigCacheService } from './config-cache.service'
import { AuthKeycloakService } from 'library/ws-widget/utils/src/lib/services/auth-keycloak.service'

function makeService(baseHref = 'en') {
  const mockConfigSvc = new ConfigurationsService()
  const mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn(), info: jest.fn() }
  const mockIconRegistry = { addSvgIcon: jest.fn() }
  const mockDomSanitizer = { bypassSecurityTrustResourceUrl: jest.fn().mockImplementation(url => `safe:${url}`) }
  const mockHttp = { get: jest.fn(), post: jest.fn() }

  const svc = new InitService(
    mockLogger as any,
    mockConfigSvc as any,
    new (WidgetResolverService as any)(),
    new (BtnSettingsService as any)(),
    new (UserPreferenceService as any)(),
    mockHttp as any,
    new (AuthKeycloakService as any)(),
    baseHref,
    mockDomSanitizer as any,
    mockIconRegistry as any,
    new (UserDataCacheService as any)(),
    new (ConfigCacheService as any)(),
  )
  return { svc, mockIconRegistry, mockDomSanitizer, mockConfigSvc }
}

describe('InitService', () => {
  afterEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('should create', () => {
    const { svc } = makeService()
    expect(svc).toBeTruthy()
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
})
