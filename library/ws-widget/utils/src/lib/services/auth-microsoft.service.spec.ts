import { of, throwError } from 'rxjs'
import { AuthMicrosoftService } from './auth-microsoft.service'
import { API_END_POINTS } from '../../../../../../src/app/constants/apiConstants'

describe('AuthMicrosoftService', () => {
  let service: AuthMicrosoftService
  let logger: any
  let mockHttp: any
  let assignSpy: jest.Mock

  const msConfig = (overrides: any = {}) => ({
    microsoft: {
      clientId: 'client-1',
      tenant: 'tenant-1',
      defaultEmailId: 'svc@corp.com',
      validEmailExtensions: ['@corp.com'],
      isConfigured: true,
      ...overrides,
    },
  })

  const tokenResponse = (overrides: any = {}) => ({
    accessToken: 'tok-1',
    expiresOn: '2026-12-31',
    resource: 'graph',
    tokenType: 'Bearer',
    ...overrides,
  })

  const realLocation = window.location

  // jsdom marks location.assign non-configurable, so the whole location object is swapped
  // for a plain stand-in that mirrors the parts the service reads.
  const setLocation = (url: string) => {
    const parsed = new URL(url, 'http://localhost')
    Object.defineProperty(window, 'location', {
      value: {
        href: parsed.href,
        origin: parsed.origin,
        pathname: parsed.pathname,
        search: parsed.search,
        hash: parsed.hash,
        assign: assignSpy,
      },
      configurable: true,
      writable: true,
    })
  }

  beforeEach(() => {
    logger = { warn: jest.fn(), info: jest.fn(), error: jest.fn(), log: jest.fn() }
    mockHttp = { get: jest.fn().mockReturnValue(of(tokenResponse())) }
    service = new AuthMicrosoftService(logger, mockHttp)

    assignSpy = jest.fn()
    localStorage.clear()
    setLocation('/app/home')
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', { value: realLocation, configurable: true, writable: true })
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should create with an unconfigured default', () => {
    expect(service).toBeTruthy()
    expect(service.isLogoutRequired).toBe(false)
    expect(service.loginUrl).toBeNull()
  })

  describe('init', () => {
    it('should warn when no configuration is passed', async () => {
      await service.init({ microsoft: { isConfigured: false } } as any)
      expect(logger.warn).toHaveBeenCalledWith('Empty/No Configuration passed, ignoring Microsoft Authentication')
    })

    it('should warn when the config object is empty', async () => {
      await service.init({} as any)
      expect(logger.warn).toHaveBeenCalled()
    })

    it('should store the configuration without warning when configured', async () => {
      await service.init(msConfig() as any)
      expect(logger.warn).not.toHaveBeenCalled()
      expect(service.loginUrl).toContain('client_id=client-1')
    })

    it('should exchange an oauth code and scrub it from the url', async () => {
      const replaceState = jest.spyOn(window.history, 'replaceState').mockImplementation(() => undefined)
      setLocation('/app/home?code=abc&session_state=xyz')
      await service.init(msConfig() as any)

      expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('code=abc'))
      expect(replaceState).toHaveBeenCalledWith(null, '', 'http://localhost/app/home')
      replaceState.mockRestore()
    })

    it('should preserve the hash when scrubbing the code', async () => {
      const replaceState = jest.spyOn(window.history, 'replaceState').mockImplementation(() => undefined)
      setLocation('/app/home?code=abc&session_state=xyz#/section')
      await service.init(msConfig() as any)

      expect(replaceState.mock.calls[0][2]).toContain('/section')
      replaceState.mockRestore()
    })

    it('should ignore a code with no session state', async () => {
      setLocation('/app/home?code=abc')
      await service.init(msConfig() as any)
      expect(mockHttp.get).not.toHaveBeenCalled()
    })

    it('should bail out on an empty code value', async () => {
      setLocation('/app/home?code=&session_state=xyz')
      await service.init(msConfig() as any)
      expect(mockHttp.get).not.toHaveBeenCalled()
    })
  })

  describe('loginUrl', () => {
    it('should build the authorize url with the current href as the redirect', async () => {
      await service.init(msConfig() as any)
      const url = service.loginUrl!
      expect(url).toContain('https://login.windows.net/common/oauth2/authorize')
      expect(url).toContain('response_type=code')
      expect(url).toContain('client_id=client-1')
    })

    it('should append the existing query string as a fragment', async () => {
      setLocation('/app/home?foo=bar')
      await service.init(msConfig() as any)
      expect(service.loginUrl).toContain('#foo=bar')
    })

    it('should return null when there is no client id', async () => {
      await service.init(msConfig({ clientId: '' }) as any)
      expect(service.loginUrl).toBeNull()
    })

    it('should return null when microsoft auth is not configured', async () => {
      await service.init(msConfig({ isConfigured: false }) as any)
      expect(service.loginUrl).toBeNull()
    })
  })

  describe('isValidEmail', () => {
    beforeEach(async () => {
      await service.init(msConfig() as any)
    })

    it('should accept an email with a configured extension', () => {
      expect(service.isValidEmail('ada@corp.com')).toBe(true)
    })

    it('should reject an email with any other extension', () => {
      expect(service.isValidEmail('ada@other.com')).toBe(false)
    })

    it('should reject every email when no extensions are configured', async () => {
      await service.init(msConfig({ validEmailExtensions: [] }) as any)
      expect(service.isValidEmail('ada@corp.com')).toBe(false)
    })
  })

  describe('isValid', () => {
    it('should treat a token with an expiry as valid', () => {
      expect(service.isValid('tok', '2026-12-31')).toBe(true)
    })

    it('should treat a missing token or expiry as invalid', () => {
      expect(service.isValid('', '2026-12-31')).toBe(false)
      expect(service.isValid('tok', '')).toBe(false)
      expect(service.isValid(undefined, undefined)).toBe(false)
    })
  })

  describe('login', () => {
    beforeEach(async () => {
      await service.init(msConfig() as any)
    })

    it('should redirect to the authorize url for a valid email', async () => {
      await service.login('ada@corp.com')
      expect(assignSpy).toHaveBeenCalledWith(expect.stringContaining('login.windows.net'))
    })

    it('should warn and skip the redirect for an invalid email', async () => {
      await service.login('ada@other.com')
      expect(logger.warn).toHaveBeenCalledWith('Microsoft Login is not allowed for your emailId (ada@other.com)')
      expect(assignSpy).not.toHaveBeenCalled()
    })

    it('should warn when the login url cannot be built', async () => {
      await service.init(msConfig({ clientId: '' }) as any)
      await service.login('ada@corp.com')
      expect(logger.warn).toHaveBeenCalledWith('Unable to identify Office Login URL, Ignoring login request')
    })
  })

  describe('getToken', () => {
    beforeEach(async () => {
      await service.init(msConfig() as any)
    })

    it('should fetch a token for the requested email', async () => {
      await expect(service.getToken('ada@corp.com')).resolves.toBe('tok-1')
      expect(mockHttp.get).toHaveBeenCalledWith(`${API_END_POINTS.sharePointToken}?email=ada@corp.com`)
      expect(service.isLogoutRequired).toBe(true)
    })

    it('should return the cached token on a second call', async () => {
      await service.getToken('ada@corp.com')
      mockHttp.get.mockClear()
      await expect(service.getToken('ada@corp.com')).resolves.toBe('tok-1')
      expect(mockHttp.get).not.toHaveBeenCalled()
    })

    it('should fall back to the default service account for an invalid email', async () => {
      await expect(service.getToken('ada@other.com')).resolves.toBe('tok-1')
      expect(mockHttp.get).toHaveBeenCalledWith(`${API_END_POINTS.sharePointToken}?email=svc@corp.com`)
    })

    it('should throw when neither email yields a token', async () => {
      mockHttp.get.mockReturnValue(of(tokenResponse({ accessToken: '' })))
      await expect(service.getToken('ada@corp.com')).rejects.toThrow('UNABLE TO FETCH MS AUTH TOKEN')
    })

    it('should throw when there is no default email to fall back to', async () => {
      await service.init(msConfig({ defaultEmailId: '' }) as any)
      mockHttp.get.mockReturnValue(of(tokenResponse({ accessToken: '' })))
      await expect(service.getToken('ada@other.com')).rejects.toThrow('UNABLE TO FETCH MS AUTH TOKEN')
    })

    it('should trigger a login when the token request fails and no code is held', async () => {
      mockHttp.get.mockReturnValue(throwError(() => new Error('401')))
      await expect(service.getToken('ada@corp.com')).rejects.toThrow('UNABLE TO FETCH MS AUTH TOKEN')
      expect(assignSpy).toHaveBeenCalled()
    })

    it('should not re-trigger a login when a code is already held', async () => {
      setLocation('/app/home?code=abc&session_state=xyz')
      await service.init(msConfig() as any)
      assignSpy.mockClear()
      mockHttp.get.mockReturnValue(throwError(() => new Error('401')))

      await expect(service.getToken('ada@corp.com')).rejects.toThrow('UNABLE TO FETCH MS AUTH TOKEN')
      expect(assignSpy).not.toHaveBeenCalled()
    })
  })

  describe('logoutUrl', () => {
    beforeEach(async () => {
      await service.init(msConfig() as any)
    })

    it('should return the plain redirect url before any login', () => {
      expect(service.logoutUrl('/public/home')).toBe('/public/home')
    })

    it('should return the microsoft logout url once an email has been used', async () => {
      await service.getToken('ada@corp.com')
      expect(service.logoutUrl('/public/home'))
        .toBe('https://login.microsoftonline.com/common/oauth2/logout?post_logout_redirect_uri=/public/home')
    })
  })

  describe('loginForSSOEnabledEmbed', () => {
    beforeEach(async () => {
      await service.init(msConfig() as any)
    })

    it('should warn for an invalid email', () => {
      service.loginForSSOEnabledEmbed('ada@other.com')
      expect(logger.warn).toHaveBeenCalledWith('SSO Login request Ignored. Invalid Email Id for SSO Enabled Content')
    })

    it('should log in and stamp the attempt when none is recorded', () => {
      service.loginForSSOEnabledEmbed('ada@corp.com')
      expect(logger.info).toHaveBeenCalled()
      expect(localStorage.getItem('msLoginRequested')).not.toBeNull()
      expect(assignSpy).toHaveBeenCalled()
    })

    it('should skip the login when a recent attempt was recorded', () => {
      localStorage.setItem('msLoginRequested', Date.now().toString())
      service.loginForSSOEnabledEmbed('ada@corp.com')
      expect(assignSpy).not.toHaveBeenCalled()
    })

    it('should log in again once the attempt has aged out', () => {
      localStorage.setItem('msLoginRequested', String(Date.now() - 601 * 1000))
      service.loginForSSOEnabledEmbed('ada@corp.com')
      expect(assignSpy).toHaveBeenCalled()
    })

    it('should treat a malformed stored timestamp as no prior attempt', () => {
      localStorage.setItem('msLoginRequested', 'not-a-number')
      service.loginForSSOEnabledEmbed('ada@corp.com')
      expect(assignSpy).toHaveBeenCalled()
    })
  })

  describe('getInstanceFromResponse', () => {
    it('should pick only the token fields off the response', () => {
      expect(service.getInstanceFromResponse({ ...tokenResponse(), extra: 'ignored' } as any)).toEqual({
        accessToken: 'tok-1',
        expiresOn: '2026-12-31',
        resource: 'graph',
        tokenType: 'Bearer',
      })
    })
  })
})
