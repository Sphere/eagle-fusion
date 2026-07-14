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
  UserDataCacheService: class {
    getCachedUserData = jest.fn()
    getUserData = jest.fn()
    getRolesFromProfile = jest.fn((userPidProfile: any) => {
      const normalizeRoleEntries = (entries: any[]): string[] =>
        entries
          .map((entry: any) => (typeof entry === 'string' ? entry : entry?.role))
          .filter((role: any): role is string => typeof role === 'string' && role.length > 0)
      if (userPidProfile && Array.isArray(userPidProfile.roles) && userPidProfile.roles.length) {
        const roles = normalizeRoleEntries(userPidProfile.roles)
        if (roles.length) {
          return roles
        }
      }
      const organisations = (userPidProfile && userPidProfile.organisations) || []
      const roles = new Set<string>()
      organisations.forEach((org: any) => {
        (org.roles || []).forEach((role: string) => roles.add(role))
      })
      return Array.from(roles)
    })
  },
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
  const mockUserDataCacheSvc = new (UserDataCacheService as any)()

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
    mockUserDataCacheSvc,
    new (ConfigCacheService as any)(),
  )
  return { svc, mockIconRegistry, mockDomSanitizer, mockConfigSvc, mockUserDataCacheSvc }
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

  describe('updateConfigWithUserData (Sunbird Spark response shape)', () => {
    it('derives userRoles from organisations[].roles when top-level roles is absent', () => {
      const { svc, mockConfigSvc } = makeService()
      const userPidProfile = {
        userId: 'u1',
        firstName: 'Likhith',
        organisations: [{ organisationId: 'org-1', roles: ['PUBLIC'] }],
      }
      ;(svc as any).updateConfigWithUserData(userPidProfile)
      expect(mockConfigSvc.userRoles).toEqual(new Set(['public']))
      expect(mockConfigSvc.userProfile.userId).toBe('u1')
    })

    it('prefers top-level roles when present (old Sunbird / V5 shape)', () => {
      const { svc, mockConfigSvc } = makeService()
      const userPidProfile = {
        userId: 'u1',
        roles: ['CONTENT_CREATOR', 'PUBLIC'],
        organisations: [{ organisationId: 'org-1', roles: ['CONTENT_CREATOR', 'PUBLIC'] }],
      }
      ;(svc as any).updateConfigWithUserData(userPidProfile)
      expect(mockConfigSvc.userRoles).toEqual(new Set(['content_creator', 'public']))
    })

    it('does nothing when userPidProfile has no userId', () => {
      const { svc, mockConfigSvc } = makeService()
      ;(svc as any).updateConfigWithUserData({ organisations: [{ roles: ['PUBLIC'] }] })
      expect(mockConfigSvc.userProfile).toBeNull()
    })
  })

  describe('fetchStartUpDetails (Sunbird Spark response shape)', () => {
    it('sets userProfile from a PUBLIC-only user whose roles only exist under organisations[]', async () => {
      const { svc, mockConfigSvc, mockUserDataCacheSvc } = makeService()
      mockConfigSvc.instanceConfig = { disablePidCheck: false }
      const userPidProfile = {
        userId: 'u1',
        firstName: 'Likhith',
        isDeleted: false,
        organisations: [{ organisationId: 'org-1', roles: ['PUBLIC'] }],
      }
      mockUserDataCacheSvc.getUserData.mockReturnValue({ toPromise: () => Promise.resolve(userPidProfile) })

      const details = await (svc as any).fetchStartUpDetails()

      expect(mockConfigSvc.userProfile).not.toBeNull()
      expect(mockConfigSvc.unMappedUser).toBe(userPidProfile)
      expect(details.roles).toEqual(['public'])
      expect(mockConfigSvc.userRoles).toEqual(new Set(['public']))
    })

    it('leaves userProfile unset when organisations[] carries no PUBLIC/known role', async () => {
      const { svc, mockConfigSvc, mockUserDataCacheSvc } = makeService()
      mockConfigSvc.instanceConfig = { disablePidCheck: false }
      const userPidProfile = {
        userId: 'u1',
        isDeleted: false,
        organisations: [{ organisationId: 'org-1', roles: ['ADMIN'] }],
      }
      mockUserDataCacheSvc.getUserData.mockReturnValue({ toPromise: () => Promise.resolve(userPidProfile) })

      await (svc as any).fetchStartUpDetails()

      expect(mockConfigSvc.userProfile).toBeNull()
    })
  })
})
