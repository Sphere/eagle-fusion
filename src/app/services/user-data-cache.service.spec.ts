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

  it('getUserData fetches from API when cache is empty', (done) => {
    service.getUserData().subscribe(data => {
      expect(data).toEqual({ userId: 'user-1', name: 'Test' })
      done()
    })
  })

  it('getUserData returns cached data on second call without extra API call', (done) => {
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
})
