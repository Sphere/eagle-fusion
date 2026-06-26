jest.mock('../../../library/ws-widget/utils/src/public-api', () => ({
  LoggerService: class {
    log = jest.fn()
    warn = jest.fn()
    error = jest.fn()
  },
}))

import { UserAgentResolverService } from './user-agent.service'

describe('UserAgentResolverService', () => {
  let service: UserAgentResolverService
  let mockLogger: any

  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    service = new UserAgentResolverService(mockLogger)
  })

  afterEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('getUserAgent', () => {
    it('returns an object with OS and browserName properties', () => {
      const result = service.getUserAgent()
      expect(result).toHaveProperty('OS')
      expect(result).toHaveProperty('browserName')
    })
  })

  describe('getStoredGeolocation', () => {
    it('returns null when no geolocation stored', () => {
      expect(service.getStoredGeolocation()).toBeNull()
    })

    it('returns null when stored value is "denied"', () => {
      sessionStorage.setItem('telemetryGeoLocation', 'denied')
      expect(service.getStoredGeolocation()).toBeNull()
    })

    it('returns null when stored value is "unavailable"', () => {
      sessionStorage.setItem('telemetryGeoLocation', 'unavailable')
      expect(service.getStoredGeolocation()).toBeNull()
    })

    it('returns parsed geo data when valid JSON is stored', () => {
      const geoData = { latitude: 12.9716, longitude: 77.5946, accuracy: 100, timestamp: 12345 }
      sessionStorage.setItem('telemetryGeoLocation', JSON.stringify(geoData))
      expect(service.getStoredGeolocation()).toEqual(geoData)
    })
  })

  describe('getDeviceModel', () => {
    it('returns null for standard desktop UA', () => {
      expect(service.getDeviceModel()).toBeNull()
    })
  })

  describe('setSource', () => {
    it('does nothing when source is null', () => {
      service.setSource(null)
      expect(localStorage.getItem('utm_source')).toBeNull()
    })

    it('does nothing when source is a string', () => {
      service.setSource('not-an-object')
      expect(localStorage.getItem('utm_source')).toBeNull()
    })

    it('stores utm_source to localStorage when utm_source key is present', () => {
      service.setSource({ utm_source: 'google', utm_medium: 'cpc' })
      expect(localStorage.getItem('utm_source')).toBeTruthy()
    })

    it('does not overwrite a stronger existing source', () => {
      localStorage.setItem('utm_source', JSON.stringify({ utm_source: 'google' }))
      service.setSource({ orgid: 'org-1' })
      const stored = JSON.parse(localStorage.getItem('utm_source') || '{}')
      expect(stored.utm_source).toBe('google')
    })
  })

  describe('getSource', () => {
    it('returns falsy when no utm_source stored', () => {
      const result = service.getSource()
      expect(result === '' || result === undefined || result === null).toBeTruthy()
    })

    it('returns stored value when utm_source is present', () => {
      localStorage.setItem('utm_source', JSON.stringify({ utm_source: 'google' }))
      expect(service.getSource()).toBeTruthy()
    })
  })

  describe('getUtmParams', () => {
    it('returns empty params when no source stored', () => {
      const result = service.getUtmParams()
      expect(result.utm_source).toBeNull()
    })

    it('returns utm_source when present', () => {
      localStorage.setItem('utm_source', JSON.stringify({ utm_source: 'google' }))
      const result = service.getUtmParams()
      expect(result.utm_source).toBe('google')
    })

    it('returns orgid as utm_source when no utm_source key', () => {
      localStorage.setItem('utm_source', JSON.stringify({ orgid: 'org-1' }))
      const result = service.getUtmParams()
      expect(result.utm_source).toBe('org-1')
    })
  })

  describe('requestGeolocation', () => {
    it('skips if valid geo data already stored', () => {
      const geoData = { latitude: 12.9, longitude: 77.5, accuracy: 50, timestamp: 1000 }
      sessionStorage.setItem('telemetryGeoLocation', JSON.stringify(geoData))
      service.requestGeolocation()
      expect(JSON.parse(sessionStorage.getItem('telemetryGeoLocation')!)).toEqual(geoData)
    })
  })
})
