jest.mock('../../../library/ws-widget/utils/src/public-api', () => ({
  ConfigurationsService: class {
    userProfile = null
    unMappedUser = null
    instanceConfig = null
    userRoles = new Set()
    restrictedFeatures = new Set()
    orgHomeRedirectMap = new Map()
  },
  LoggerService: class { log = jest.fn(); warn = jest.fn(); error = jest.fn() },
}))

jest.mock('../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service', () => ({
  UserProfileService: class {
    getUserdetailsFromRegistry = jest.fn().mockReturnValue({ subscribe: jest.fn() })
  },
}))

jest.mock('../services/user-data-cache.service', () => ({
  UserDataCacheService: class {
    getCachedUserData = jest.fn().mockReturnValue(null)
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
    getUserIdFromProfile = jest.fn((userPidProfile: any) => {
      if (!userPidProfile) {
        return undefined
      }
      return userPidProfile.userId || userPidProfile.id || userPidProfile.identifier
    })
  },
}))

import { GeneralGuard } from './general.guard'
import { ConfigurationsService, LoggerService } from '../../../library/ws-widget/utils/src/public-api'
import { UserProfileService } from '../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { UserDataCacheService } from '../services/user-data-cache.service'

function makeRoute(params: Record<string, string> = {}, data: any = {}) {
  return { params, data } as any
}

describe('GeneralGuard', () => {
  let guard: GeneralGuard
  let mockRouter: any
  let mockConfigSvc: any
  let mockUserProfileSvc: any
  let mockUserDataCacheSvc: any
  let mockLogger: any

  beforeEach(() => {
    localStorage.clear()
    mockRouter = {
      parseUrl: jest.fn().mockImplementation(url => ({ redirectUrl: url })),
      navigate: jest.fn(),
    }
    mockConfigSvc = new ConfigurationsService()
    mockUserProfileSvc = new UserProfileService()
    mockUserDataCacheSvc = new UserDataCacheService()
    mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    guard = new GeneralGuard(mockRouter, mockConfigSvc as any, mockUserProfileSvc, mockUserDataCacheSvc, mockLogger)
  })

  afterEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('should create', () => {
    expect(guard).toBeTruthy()
  })

  it('dobFlag defaults to false', () => {
    expect(guard.dobFlag).toBe(false)
  })

  it('redirects from /page/home to org-specific URL when rootOrgId is in orgHomeRedirectMap', async () => {
    mockConfigSvc.userProfile = { rootOrgId: 'org-1', language: 'en' }
    mockConfigSvc.orgHomeRedirectMap = new Map([['org-1', '/app/organisations/org-1']])
    const route = makeRoute({ id: 'home' })
    await guard.canActivate(route)
    expect(mockRouter.parseUrl).toHaveBeenCalledWith('/app/organisations/org-1')
  })

  it('does not redirect when id is not "home"', async () => {
    mockConfigSvc.userProfile = { rootOrgId: 'org-1', language: 'en' }
    mockConfigSvc.orgHomeRedirectMap = new Map([['org-1', '/app/org']])
    const route = makeRoute({ id: 'search' })
    await guard.canActivate(route)
    expect(mockRouter.parseUrl).not.toHaveBeenCalledWith('/app/org')
  })

  it('does not redirect when rootOrgId is not in orgHomeRedirectMap', async () => {
    mockConfigSvc.userProfile = { rootOrgId: 'unknown-org', language: 'en' }
    mockConfigSvc.orgHomeRedirectMap = new Map([['org-1', '/app/org']])
    const route = makeRoute({ id: 'home' })
    await guard.canActivate(route)
    expect(mockRouter.parseUrl).not.toHaveBeenCalledWith('/app/org')
  })

  it('redirects to /public/home when userProfile is null and disablePidCheck is false', async () => {
    mockConfigSvc.userProfile = null
    mockConfigSvc.instanceConfig = { disablePidCheck: false }
    const result = await guard.canActivate(makeRoute())
    expect(mockRouter.parseUrl).toHaveBeenCalledWith('/public/home')
  })

  it('returns true when userProfile is set and no required roles/features', async () => {
    mockConfigSvc.userProfile = { language: 'en', userId: 'u1' }
    mockConfigSvc.unMappedUser = { id: 'u1' }
    mockUserProfileSvc.getUserdetailsFromRegistry.mockReturnValue({ subscribe: jest.fn() })
    const result = await guard.canActivate(makeRoute())
    expect(result).toBe(true)
  })

  it('redirects to /page/home when required role is missing', async () => {
    mockConfigSvc.userProfile = { language: 'en', userId: 'u1' }
    mockConfigSvc.userRoles = new Set(['public'])
    const route = makeRoute({}, { requiredRoles: ['admin'] })
    await guard.canActivate(route)
    expect(mockRouter.parseUrl).toHaveBeenCalledWith('/page/home')
  })

  it('allows access when user has required role', async () => {
    mockConfigSvc.userProfile = { language: 'en', userId: 'u1' }
    mockConfigSvc.userRoles = new Set(['admin'])
    mockUserProfileSvc.getUserdetailsFromRegistry.mockReturnValue({ subscribe: jest.fn() })
    const route = makeRoute({}, { requiredRoles: ['admin'] })
    const result = await guard.canActivate(route)
    expect(result).toBe(true)
  })

  it('redirects to /page/home when required feature is restricted', async () => {
    mockConfigSvc.userProfile = { language: 'en', userId: 'u1' }
    mockConfigSvc.restrictedFeatures = new Set(['featureX'])
    const route = makeRoute({}, { requiredFeatures: ['featureX'] })
    await guard.canActivate(route)
    expect(mockRouter.parseUrl).toHaveBeenCalledWith('/page/home')
  })

  it('allows access when required feature is not restricted', async () => {
    mockConfigSvc.userProfile = { language: 'en', userId: 'u1' }
    mockConfigSvc.restrictedFeatures = new Set()
    mockUserProfileSvc.getUserdetailsFromRegistry.mockReturnValue({ subscribe: jest.fn() })
    const route = makeRoute({}, { requiredFeatures: ['featureY'] })
    const result = await guard.canActivate(route)
    expect(result).toBe(true)
  })

  it('covers getUserdetailsFromRegistry success callback when unMappedUser is set', async () => {
    const { of } = require('rxjs')
    mockConfigSvc.userProfile = { language: 'en', userId: 'u1' }
    mockConfigSvc.unMappedUser = { id: 'u1' }
    mockUserProfileSvc.getUserdetailsFromRegistry = jest.fn().mockReturnValue(of({
      profileDetails: { profileReq: { personalDetails: { tncAccepted: 'true', dob: '1990-01-01' } } },
    }))
    await guard.canActivate(makeRoute())
    expect(mockLogger.log).toHaveBeenCalled()
  })

  it('covers getUserdetailsFromRegistry error callback when request fails', async () => {
    const { throwError } = require('rxjs')
    mockConfigSvc.userProfile = { language: 'en', userId: 'u1' }
    mockConfigSvc.unMappedUser = { id: 'u1' }
    mockUserProfileSvc.getUserdetailsFromRegistry = jest.fn().mockReturnValue(throwError(() => new Error('fail')))
    const result = await guard.canActivate(makeRoute())
    expect(result).toBe(true)
  })

  it('restores user from cache when userProfile is null and cache has data', async () => {
    mockConfigSvc.userProfile = null
    mockConfigSvc.instanceConfig = { disablePidCheck: true }
    const cachedUser = { userId: 'cached-1', firstName: 'Test', roles: ['PUBLIC'] }
    mockUserDataCacheSvc.getCachedUserData.mockReturnValue(cachedUser)
    mockUserProfileSvc.getUserdetailsFromRegistry.mockReturnValue({ subscribe: jest.fn() })
    await guard.canActivate(makeRoute())
    expect(mockConfigSvc.userProfile).not.toBeNull()
    expect(mockConfigSvc.userProfile.userId).toBe('cached-1')
  })

  it('restores roles from organisations[].roles when cached user has no top-level roles (Sunbird Spark shape)', async () => {
    mockConfigSvc.userProfile = null
    mockConfigSvc.instanceConfig = { disablePidCheck: true }
    const cachedUser = {
      userId: 'cached-2',
      firstName: 'Test',
      organisations: [{ organisationId: 'org-1', roles: ['PUBLIC'] }],
    }
    mockUserDataCacheSvc.getCachedUserData.mockReturnValue(cachedUser)
    mockUserProfileSvc.getUserdetailsFromRegistry.mockReturnValue({ subscribe: jest.fn() })
    await guard.canActivate(makeRoute())
    expect(mockConfigSvc.userProfile.userId).toBe('cached-2')
    expect(mockConfigSvc.userRoles).toEqual(new Set(['public']))
  })

  it('restores userProfile.userId from id when cached user has no top-level userId (real Sunbird Spark shape)', async () => {
    mockConfigSvc.userProfile = null
    mockConfigSvc.instanceConfig = { disablePidCheck: true }
    const cachedUser = {
      id: 'spark-cached-1',
      identifier: 'spark-cached-1',
      firstName: 'Test',
      organisations: [{ organisationId: 'org-1', roles: ['PUBLIC'] }],
    }
    mockUserDataCacheSvc.getCachedUserData.mockReturnValue(cachedUser)
    mockUserProfileSvc.getUserdetailsFromRegistry.mockReturnValue({ subscribe: jest.fn() })
    await guard.canActivate(makeRoute())
    expect(mockConfigSvc.userProfile.userId).toBe('spark-cached-1')
  })
})
