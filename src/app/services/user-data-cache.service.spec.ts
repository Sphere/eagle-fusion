jest.mock('@ws-widget/utils', () => ({
  LoggerService: class {
    log = jest.fn()
    warn = jest.fn()
    error = jest.fn()
  },
}))

jest.mock('../constants/apiConstants', () => ({
  API_END_POINTS: { getUserdetailsFromRegistry: '/apis/user/registry' },
}))

import { of } from 'rxjs'
import { UserDataCacheService } from './user-data-cache.service'

describe('UserDataCacheService', () => {
  let service: UserDataCacheService
  let mockHttp: any
  let mockLogger: any

  beforeEach(() => {
    jest.useFakeTimers()
    sessionStorage.clear()
    mockHttp = {
      get: jest.fn().mockReturnValue(of({ result: { response: { userId: 'user-1', name: 'Test' } } })),
    }
    mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    service = new UserDataCacheService(mockHttp, mockLogger)
  })

  afterEach(() => {
    service.ngOnDestroy()
    jest.useRealTimers()
    sessionStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('isDataLoaded returns false initially', () => {
    expect(service.isDataLoaded()).toBe(false)
  })

  it('getCachedUserData returns null initially', () => {
    expect(service.getCachedUserData()).toBeNull()
  })

  it('setUserData caches the provided data', () => {
    service.setUserData({ userId: 'u-1' })
    expect(service.getCachedUserData()).toEqual({ userId: 'u-1' })
  })

  it('isDataLoaded returns true after setUserData', () => {
    service.setUserData({ userId: 'u-1' })
    expect(service.isDataLoaded()).toBe(true)
  })

  it('clearUserData removes cached data', () => {
    service.setUserData({ userId: 'u-1' })
    service.clearUserData()
    expect(service.getCachedUserData()).toBeNull()
    expect(service.isDataLoaded()).toBe(false)
  })

  it('clearUserData removes userDataCache from sessionStorage', () => {
    service.setUserData({ userId: 'u-1' })
    service.clearUserData()
    expect(sessionStorage.getItem('userDataCache')).toBeNull()
  })

  it('getUserData fetches from API when cache is empty', done => {
    service.getUserData().subscribe(data => {
      expect(data).toEqual({ userId: 'user-1', name: 'Test' })
      done()
    })
  })

  it('getUserData returns cached data on second call without extra API call', done => {
    service.getUserData().subscribe(() => {
      service.getUserData().subscribe(data => {
        expect(data).toEqual({ userId: 'user-1', name: 'Test' })
        expect(mockHttp.get).toHaveBeenCalledTimes(1)
        done()
      })
    })
  })

  it('restores data from sessionStorage on init when userId is present', () => {
    sessionStorage.setItem('userDataCache', JSON.stringify({ userId: 'cached-user' }))
    const svc2 = new UserDataCacheService(mockHttp, mockLogger)
    expect(svc2.getCachedUserData()).toEqual({ userId: 'cached-user' })
    svc2.ngOnDestroy()
  })

  it('ignores invalid sessionStorage data gracefully', () => {
    sessionStorage.setItem('userDataCache', 'not-valid-json')
    expect(() => new UserDataCacheService(mockHttp, mockLogger)).not.toThrow()
  })

  it('ngOnDestroy does not throw', () => {
    expect(() => service.ngOnDestroy()).not.toThrow()
  })

  describe('window debug methods', () => {
    it('window.clearUserCache clears data', () => {
      service.setUserData({ userId: 'u-1' })
      ;(window as any).clearUserCache()
      expect(service.getCachedUserData()).toBeNull()
    })

    it('window.getUserCached returns current cached data', () => {
      service.setUserData({ userId: 'u-2' })
      const result = (window as any).getUserCached()
      expect(result).toEqual({ userId: 'u-2' })
    })

    it('window.getCacheExpirationTime returns null when no cacheTimestamp', () => {
      const result = (window as any).getCacheExpirationTime()
      expect(result).toBeNull()
    })

    it('window.getCacheExpirationTime returns Date when cacheTimestamp is set', () => {
      service.setUserData({ userId: 'u-3' })
      const result = (window as any).getCacheExpirationTime()
      expect(result).toBeInstanceOf(Date)
    })
  })

  describe('setupCacheExpiration timeout callback', () => {
    it('should call clearUserData when 6-hour timeout fires', () => {
      service.setUserData({ userId: 'u-1' })
      expect(service.isDataLoaded()).toBe(true)
      jest.advanceTimersByTime(6 * 60 * 60 * 1000)
      expect(service.getCachedUserData()).toBeNull()
    })
  })

  describe('getUserData catchError', () => {
    it('should set apiCall$ to null and rethrow error on http failure', done => {
      const { throwError } = require('rxjs')
      mockHttp.get = jest.fn().mockReturnValue(throwError(() => new Error('Network error')))
      service.getUserData().subscribe({
        error: () => {
          expect(service['apiCall$']).toBeNull()
          done()
        },
      })
    })
  })

  describe('restoreFromCache without userId', () => {
    it('should clear sessionStorage when cached JSON has no userId', () => {
      sessionStorage.setItem('userDataCache', JSON.stringify({ name: 'no-uid' }))
      const svc = new UserDataCacheService(mockHttp, mockLogger)
      expect(sessionStorage.getItem('userDataCache')).toBeNull()
      svc.ngOnDestroy()
    })
  })

  describe('getRolesFromProfile', () => {
    it('returns the top-level roles array when present (old Sunbird / V5 shape)', () => {
      const roles = service.getRolesFromProfile({ roles: ['CONTENT_CREATOR', 'PUBLIC'], organisations: [] })
      expect(roles).toEqual(['CONTENT_CREATOR', 'PUBLIC'])
    })

    it('flattens organisations[].roles when top-level roles is absent (Sunbird Spark V3 shape)', () => {
      const roles = service.getRolesFromProfile({
        organisations: [{ organisationId: 'org-1', roles: ['PUBLIC'] }],
      })
      expect(roles).toEqual(['PUBLIC'])
    })

    it('dedupes roles across multiple organisations', () => {
      const roles = service.getRolesFromProfile({
        organisations: [
          { organisationId: 'org-1', roles: ['PUBLIC'] },
          { organisationId: 'org-2', roles: ['PUBLIC', 'ADMIN'] },
        ],
      })
      expect(roles.sort()).toEqual(['ADMIN', 'PUBLIC'])
    })

    it('returns an empty array when there are no roles anywhere', () => {
      expect(service.getRolesFromProfile({ organisations: [] })).toEqual([])
      expect(service.getRolesFromProfile({})).toEqual([])
      expect(service.getRolesFromProfile(null)).toEqual([])
    })

    it('ignores an empty top-level roles array and falls back to organisations', () => {
      const roles = service.getRolesFromProfile({
        roles: [],
        organisations: [{ organisationId: 'org-1', roles: ['PUBLIC'] }],
      })
      expect(roles).toEqual(['PUBLIC'])
    })

    it('normalizes Spark V5-style role records ({role, scope, ...}) into plain role-name strings', () => {
      const roles = service.getRolesFromProfile({
        roles: [
          { role: 'PUBLIC', scope: [{ organisationId: 'org-1' }], createdby: null, createddate: '2026-07-10' },
          { role: 'CONTENT_CREATOR', scope: [{ organisationId: 'org-1' }], createdby: null, createddate: '2026-07-10' },
        ],
      })
      expect(roles).toEqual(['PUBLIC', 'CONTENT_CREATOR'])
    })

    it('falls back to organisations when top-level role records have no usable role field', () => {
      const roles = service.getRolesFromProfile({
        roles: [{ scope: [{ organisationId: 'org-1' }] }],
        organisations: [{ organisationId: 'org-1', roles: ['PUBLIC'] }],
      })
      expect(roles).toEqual(['PUBLIC'])
    })
  })

  describe('getUserIdFromProfile', () => {
    it('prefers userId when present (old Sunbird shape)', () => {
      expect(service.getUserIdFromProfile({ userId: 'u-1', id: 'id-1', identifier: 'ident-1' })).toBe('u-1')
    })

    it('falls back to id when userId is absent (Sunbird Spark shape)', () => {
      expect(service.getUserIdFromProfile({ id: 'id-1', identifier: 'ident-1' })).toBe('id-1')
    })

    it('falls back to identifier when neither userId nor id is present', () => {
      expect(service.getUserIdFromProfile({ identifier: 'ident-1' })).toBe('ident-1')
    })

    it('returns undefined when no identifying field is present', () => {
      expect(service.getUserIdFromProfile({ name: 'no-id' })).toBeUndefined()
      expect(service.getUserIdFromProfile(null)).toBeUndefined()
    })
  })

  describe('Sunbird Spark shape (id/identifier, no userId) end-to-end', () => {
    it('caches Spark-shaped data (id only) to sessionStorage', () => {
      service.setUserData({ id: 'spark-user-1', identifier: 'spark-user-1', name: 'Test' })
      expect(sessionStorage.getItem('userDataCache')).not.toBeNull()
      expect(JSON.parse(sessionStorage.getItem('userDataCache') as string).id).toBe('spark-user-1')
    })

    it('restores Spark-shaped data (id only) from sessionStorage on init', () => {
      sessionStorage.setItem('userDataCache', JSON.stringify({ id: 'spark-user-1', identifier: 'spark-user-1' }))
      const svc = new UserDataCacheService(mockHttp, mockLogger)
      expect(svc.getCachedUserData()).toEqual({ id: 'spark-user-1', identifier: 'spark-user-1' })
      svc.ngOnDestroy()
    })

    it('getUserData caches Spark-shaped API response (id only, no userId) to sessionStorage', done => {
      mockHttp.get = jest.fn().mockReturnValue(of({ result: { response: { id: 'spark-user-2', identifier: 'spark-user-2' } } }))
      service.getUserData().subscribe(() => {
        expect(sessionStorage.getItem('userDataCache')).not.toBeNull()
        done()
      })
    })
  })
})
