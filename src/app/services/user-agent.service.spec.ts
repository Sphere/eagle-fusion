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

    it('sets unavailable when navigator.geolocation is absent', () => {
      const origGeo = (navigator as any).geolocation
      Object.defineProperty(navigator, 'geolocation', { value: undefined, configurable: true })
      sessionStorage.removeItem('telemetryGeoLocation')
      service.requestGeolocation()
      expect(sessionStorage.getItem('telemetryGeoLocation')).toBe('unavailable')
      Object.defineProperty(navigator, 'geolocation', { value: origGeo, configurable: true })
    })

    it('proceeds when existing value is "denied"', () => {
      sessionStorage.setItem('telemetryGeoLocation', 'denied')
      const origPerms = (navigator as any).permissions
      Object.defineProperty(navigator, 'permissions', { value: undefined, configurable: true })
      const origGeo = navigator.geolocation
      Object.defineProperty(navigator, 'geolocation', {
        value: { getCurrentPosition: jest.fn() },
        configurable: true,
      })
      expect(() => service.requestGeolocation()).not.toThrow()
      Object.defineProperty(navigator, 'geolocation', { value: origGeo, configurable: true })
      Object.defineProperty(navigator, 'permissions', { value: origPerms, configurable: true })
    })
  })

  describe('getCookie', () => {
    it('returns null when cookie is not set', () => {
      expect(service.getCookie('NONEXISTENT')).toBeNull()
    })
  })

  describe('isCookieExpired', () => {
    it('returns true when cookie does not exist', () => {
      expect(service.isCookieExpired('NONEXISTENT_COOKIE')).toBe(true)
    })
  })

  describe('generateCookie', () => {
    it('returns a cookie string', () => {
      const result = service.generateCookie()
      expect(typeof result).toBe('string')
    })
  })

  describe('getOsInfo', () => {
    const setUA = (ua: string) => Object.defineProperty(navigator, 'userAgent', { value: ua, configurable: true })
    const restoreUA = (ua: string) => Object.defineProperty(navigator, 'userAgent', { value: ua, configurable: true })

    it('returns null for unknown user agent', () => {
      const originalUA = navigator.userAgent
      setUA('Unknown Browser')
      const result = service.getOsInfo()
      expect(result).toBeNull()
      restoreUA(originalUA)
    })

    it('returns MacOS for Macintosh user agent', () => {
      const orig = navigator.userAgent
      setUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')
      expect(service.getOsInfo()).toBe('MacOS')
      restoreUA(orig)
    })

    it('returns iOS for iPhone user agent', () => {
      const orig = navigator.userAgent
      setUA('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)')
      expect(service.getOsInfo()).toBe('iOS')
      restoreUA(orig)
    })

    it('returns Windows for Windows NT user agent', () => {
      const orig = navigator.userAgent
      setUA('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
      expect(service.getOsInfo()).toBe('Windows')
      restoreUA(orig)
    })

    it('returns Android for Android user agent', () => {
      const orig = navigator.userAgent
      setUA('Mozilla/5.0 (Linux; android 11; SM-G991B)')
      expect(service.getOsInfo()).toBe('Android')
      restoreUA(orig)
    })

    it('returns Linux for Linux x86 user agent', () => {
      const orig = navigator.userAgent
      setUA('Mozilla/5.0 (X11; linux x86_64)')
      expect(service.getOsInfo()).toBe('Linux')
      restoreUA(orig)
    })
  })

  describe('getDeviceModel', () => {
    const setUA = (ua: string) => Object.defineProperty(navigator, 'userAgent', { value: ua, configurable: true })

    it('returns Android device model from UA', () => {
      const orig = navigator.userAgent
      setUA('Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36')
      expect(service.getDeviceModel()).toBe('SM-G991B')
      setUA(orig)
    })

    it('returns iPhone for iOS UA', () => {
      const orig = navigator.userAgent
      setUA('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)')
      expect(service.getDeviceModel()).toBe('iPhone')
      setUA(orig)
    })
  })

  describe('getCookie', () => {
    it('returns null when cookie is not set', () => {
      expect(service.getCookie('NONEXISTENT')).toBeNull()
    })

    it('returns decoded value when cookie is set', () => {
      document.cookie = 'MY_TEST_COOKIE=hello%20world'
      const result = service.getCookie('MY_TEST_COOKIE')
      expect(result).toBe('hello world')
    })
  })

  describe('isCookieExpired', () => {
    it('returns true when cookie does not exist', () => {
      expect(service.isCookieExpired('NONEXISTENT_COOKIE')).toBe(true)
    })

    it('returns false when cookie exists (no expires attribute in value)', () => {
      document.cookie = 'MY_VALID_COOKIE=validvalue'
      expect(service.isCookieExpired('MY_VALID_COOKIE')).toBe(false)
    })
  })

  describe('generateCookie', () => {
    it('returns a cookie string when USERUID is not set', () => {
      const result = service.generateCookie()
      expect(typeof result).toBe('string')
    })

    it('returns existing USERUID value when cookie already exists', () => {
      document.cookie = 'USERUID=existing-id-123'
      const result = service.generateCookie()
      expect(result).toBe('existing-id-123')
    })
  })

  describe('requestGeolocation permissions callbacks', () => {
    let origGeo: any
    let origPerms: any

    beforeEach(() => {
      origGeo = (navigator as any).geolocation
      origPerms = (navigator as any).permissions
      sessionStorage.removeItem('telemetryGeoLocation')
    })

    afterEach(() => {
      Object.defineProperty(navigator, 'geolocation', { value: origGeo, configurable: true })
      Object.defineProperty(navigator, 'permissions', { value: origPerms, configurable: true })
    })

    it('sets denied when permissions.query resolves with denied state', async () => {
      Object.defineProperty(navigator, 'geolocation', {
        value: { getCurrentPosition: jest.fn() },
        configurable: true,
      })
      Object.defineProperty(navigator, 'permissions', {
        value: { query: jest.fn().mockResolvedValue({ state: 'denied' }) },
        configurable: true,
      })
      service.requestGeolocation()
      await Promise.resolve(); await Promise.resolve()
      expect(sessionStorage.getItem('telemetryGeoLocation')).toBe('denied')
    })

    it('calls doGetCurrentPosition when permissions.query resolves with granted', async () => {
      const getCurrentPositionMock = jest.fn()
      Object.defineProperty(navigator, 'geolocation', {
        value: { getCurrentPosition: getCurrentPositionMock },
        configurable: true,
      })
      Object.defineProperty(navigator, 'permissions', {
        value: { query: jest.fn().mockResolvedValue({ state: 'granted' }) },
        configurable: true,
      })
      service.requestGeolocation()
      await Promise.resolve(); await Promise.resolve()
      expect(getCurrentPositionMock).toHaveBeenCalled()
    })

    it('calls doGetCurrentPosition on permissions.query catch', async () => {
      const getCurrentPositionMock = jest.fn()
      Object.defineProperty(navigator, 'geolocation', {
        value: { getCurrentPosition: getCurrentPositionMock },
        configurable: true,
      })
      Object.defineProperty(navigator, 'permissions', {
        value: { query: jest.fn().mockRejectedValue(new Error('denied')) },
        configurable: true,
      })
      service.requestGeolocation()
      await Promise.resolve(); await Promise.resolve()
      expect(getCurrentPositionMock).toHaveBeenCalled()
    })
  })

  describe('isInternalHost (private)', () => {
    it('returns true for exact internal host (localhost)', () => {
      expect((service as any).isInternalHost('localhost')).toBe(true)
    })

    it('returns true for subdomain of internal host', () => {
      expect((service as any).isInternalHost('sub.sphere.aastrika.org')).toBe(true)
    })

    it('returns false for external host', () => {
      expect((service as any).isInternalHost('google.com')).toBe(false)
    })
  })

  describe('getOrgIdFromReferrer (private)', () => {
    let origReferrer: string

    beforeEach(() => {
      origReferrer = document.referrer
    })

    afterEach(() => {
      Object.defineProperty(document, 'referrer', { value: origReferrer, configurable: true })
    })

    it('returns orgId when referrer has org-details path with orgId param', () => {
      Object.defineProperty(document, 'referrer', {
        value: 'https://sphere.aastrika.org/org-details?orgId=org-abc',
        configurable: true,
      })
      expect((service as any).getOrgIdFromReferrer()).toBe('org-abc')
    })

    it('returns null when referrer does not contain org-details', () => {
      Object.defineProperty(document, 'referrer', {
        value: 'https://example.com/home',
        configurable: true,
      })
      expect((service as any).getOrgIdFromReferrer()).toBeNull()
    })

    it('returns null when referrer is empty string', () => {
      Object.defineProperty(document, 'referrer', { value: '', configurable: true })
      expect((service as any).getOrgIdFromReferrer()).toBeNull()
    })
  })

  describe('getUserAgent browser branches', () => {
    const setUA = (ua: string) => Object.defineProperty(navigator, 'userAgent', { value: ua, configurable: true })

    it('returns firefox for Firefox UA', () => {
      const orig = navigator.userAgent
      setUA('Mozilla/5.0 Gecko/20100101 Firefox/109.0')
      expect(service.getUserAgent().browserName).toBe('firefox')
      setUA(orig)
    })

    it('returns safari for Safari-only UA', () => {
      const orig = navigator.userAgent
      setUA('Mozilla/5.0 (Macintosh) AppleWebKit/605 Version/16.1 Safari/604')
      expect(service.getUserAgent().browserName).toBe('safari')
      setUA(orig)
    })

    it('returns opera for OPR UA', () => {
      const orig = navigator.userAgent
      setUA('Mozilla/5.0 OPR/91.0')
      expect(service.getUserAgent().browserName).toBe('opera')
      setUA(orig)
    })

    it('returns edge for Edg UA', () => {
      const orig = navigator.userAgent
      setUA('Mozilla/5.0 Edg/109.0')
      expect(service.getUserAgent().browserName).toBe('edge')
      setUA(orig)
    })

    it('returns No browser detection for unknown UA', () => {
      const orig = navigator.userAgent
      setUA('UnknownBrowser/1.0')
      expect(service.getUserAgent().browserName).toBe('No browser detection')
      setUA(orig)
    })
  })

  describe('doGetCurrentPosition callbacks', () => {
    let origGeo: any

    beforeEach(() => {
      origGeo = (navigator as any).geolocation
      sessionStorage.removeItem('telemetryGeoLocation')
    })

    afterEach(() => {
      Object.defineProperty(navigator, 'geolocation', { value: origGeo, configurable: true })
    })

    it('stores geo data on success', () => {
      const mockPosition = { coords: { latitude: 12.9, longitude: 77.5, accuracy: 50 } }
      Object.defineProperty(navigator, 'geolocation', {
        value: { getCurrentPosition: jest.fn((success: any) => success(mockPosition)) },
        configurable: true,
      })
      ;(service as any).doGetCurrentPosition()
      const stored = JSON.parse(sessionStorage.getItem('telemetryGeoLocation')!)
      expect(stored.latitude).toBe(12.9)
      expect(stored.longitude).toBe(77.5)
    })

    it('stores denied on error', () => {
      Object.defineProperty(navigator, 'geolocation', {
        value: { getCurrentPosition: jest.fn((_success: any, error: any) => error()) },
        configurable: true,
      })
      ;(service as any).doGetCurrentPosition()
      expect(sessionStorage.getItem('telemetryGeoLocation')).toBe('denied')
    })
  })
})
