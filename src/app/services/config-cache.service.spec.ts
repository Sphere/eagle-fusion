jest.mock('@ws-widget/utils', () => ({
  LoggerService: class {
    log = jest.fn()
    warn = jest.fn()
    error = jest.fn()
  },
}))

import { of, throwError } from 'rxjs'
import { ConfigCacheService } from './config-cache.service'

describe('ConfigCacheService', () => {
  let service: ConfigCacheService
  let mockHttp: any
  let mockLogger: any

  beforeEach(() => {
    sessionStorage.clear()
    mockHttp = { get: jest.fn().mockReturnValue(of({ rootOrg: 'test-org' })) }
    mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    service = new ConfigCacheService(mockHttp, mockLogger)
  })

  afterEach(() => {
    sessionStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('getHostConfig makes HTTP call and returns data', (done) => {
    service.getHostConfig('en').subscribe(data => {
      expect(data).toEqual({ rootOrg: 'test-org' })
      done()
    })
  })

  it('getHostConfig caches and returns same data on second call', (done) => {
    service.getHostConfig('en').subscribe(() => {
      service.getHostConfig('en').subscribe(data => {
        expect(data).toEqual({ rootOrg: 'test-org' })
        expect(mockHttp.get).toHaveBeenCalledTimes(1)
        done()
      })
    })
  })

  it('getHostConfig for hi locale fetches host.config.hi.json', () => {
    service.getHostConfig('hi').subscribe()
    expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('host.config.hi.json'))
  })

  it('getHostConfig for en locale fetches host.config.json', () => {
    service.getHostConfig('en').subscribe()
    expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('host.config.json'))
    expect(mockHttp.get).not.toHaveBeenCalledWith(expect.stringContaining('host.config.hi.json'))
  })

  it('restores cached data from sessionStorage on init', (done) => {
    const cached = { rootOrg: 'from-session' }
    sessionStorage.setItem('config_hostConfig_en', JSON.stringify(cached))
    const svc2 = new ConfigCacheService(mockHttp, mockLogger)
    svc2.getHostConfig('en').subscribe(data => {
      expect(data).toEqual(cached)
      done()
    })
  })

  it('getHostConfig catchError clears call$ and rethrows when http fails', (done) => {
    mockHttp.get = jest.fn().mockReturnValue(throwError(() => new Error('Network error')))
    service.getHostConfig('en').subscribe({
      error: () => done(),
    })
  })

  it('handles invalid sessionStorage data gracefully', () => {
    sessionStorage.setItem('config_hostConfig_en', 'not-json')
    expect(() => new ConfigCacheService(mockHttp, mockLogger)).not.toThrow()
  })
})
