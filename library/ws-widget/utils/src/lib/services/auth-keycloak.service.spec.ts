import { Subject, of, throwError } from 'rxjs'
import { KeycloakEventTypeLegacy } from 'keycloak-angular'
import { AuthKeycloakService } from './auth-keycloak.service'
import { API_END_POINTS } from '../../../../../../src/app/constants/apiConstants'

describe('AuthKeycloakService', () => {
  let service: AuthKeycloakService
  let mockHttp: any
  let configSvc: any
  let keycloakSvc: any
  let msAuthSvc: any
  let logger: any
  let themeSvc: any
  let keycloakEvents$: Subject<any>
  let kcInstance: any

  const buildInstanceConfig = (overrides: any = {}) => ({
    microsoft: { isConfigured: false },
    keycloak: {
      url: 'https://kc.example.com',
      realm: 'sphere',
      clientId: 'web',
      bearerExcludedUrls: ['/public'],
    },
    ...overrides,
  })

  const build = () => new AuthKeycloakService(mockHttp, configSvc, keycloakSvc, msAuthSvc, logger, themeSvc)

  const flushMicrotasks = () => new Promise(resolve => queueMicrotask(() => resolve(null)))

  beforeEach(() => {
    keycloakEvents$ = new Subject<any>()
    kcInstance = {
      authenticated: true,
      token: 'tok',
      sessionId: 'sess',
      tokenParsed: { sub: 'u1', email: 'ada@x.com', name: 'Ada' },
      idTokenParsed: { sub: 'id1', email: 'id@x.com', name: 'Ada Id' },
    }
    mockHttp = { get: jest.fn().mockReturnValue(of({ ok: true })) }
    configSvc = { instanceConfig: buildInstanceConfig(), isAuthenticated: false, userProfile: null }
    keycloakSvc = {
      isLoggedIn: jest.fn().mockReturnValue(true),
      getKeycloakInstance: jest.fn(() => kcInstance),
      init: jest.fn().mockResolvedValue(true),
      register: jest.fn().mockResolvedValue(undefined),
      keycloakEvents$,
    }
    msAuthSvc = { init: jest.fn() }
    logger = { log: jest.fn(), error: jest.fn() }
    themeSvc = { setTheme: jest.fn() }

    localStorage.clear()
    sessionStorage.clear()
    service = build()
  })

  afterEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('getters', () => {
    it('should delegate isLoggedIn to keycloak', () => {
      expect(service.isLoggedIn).toBe(true)
      expect(keycloakSvc.isLoggedIn).toHaveBeenCalled()
    })

    it('should read authenticated, token and sessionId from the instance', () => {
      expect(service.isAuthenticated).toBe(true)
      expect(service.token).toBe('tok')
      expect(service.sessionId).toBe('sess')
    })

    it('should prefer the token sub for the user id', () => {
      expect(service.userId).toBe('u1')
    })

    it('should fall back to the id-token sub', () => {
      kcInstance.tokenParsed = null
      expect(service.userId).toBe('id1')
    })

    it('should return an empty user id when there is no keycloak instance', () => {
      keycloakSvc.getKeycloakInstance.mockReturnValue(null)
      expect(service.userId).toBe('')
    })

    it('should prefer the token email', () => {
      expect(service.userEmail).toBe('ada@x.com')
    })

    it('should fall back through the id-token email chain', () => {
      kcInstance.tokenParsed = {}
      expect(service.userEmail).toBe('id@x.com')

      kcInstance.idTokenParsed = { encEmail: 'enc@x.com' }
      expect(service.userEmail).toBe('enc@x.com')

      kcInstance.tokenParsed = { preferred_username: 'ada' }
      kcInstance.idTokenParsed = {}
      expect(service.userEmail).toBe('ada')

      kcInstance.tokenParsed = {}
      kcInstance.idTokenParsed = { preferred_username: 'ada-id' }
      expect(service.userEmail).toBe('ada-id')
    })

    it('should prefer the token name', () => {
      expect(service.userName).toBe('Ada')
    })

    it('should fall back to the id-token name', () => {
      kcInstance.tokenParsed = {}
      expect(service.userName).toBe('Ada Id')
    })
  })

  describe('login state stream', () => {
    it('should mirror the login state onto the config service', async () => {
      await flushMicrotasks()
      keycloakEvents$.next({ type: KeycloakEventTypeLegacy.OnReady, args: true })
      service.isLoggedIn$.subscribe()
      expect(configSvc.isAuthenticated).toBe(false)

      service = build()
      await flushMicrotasks()
      keycloakEvents$.next({ type: KeycloakEventTypeLegacy.OnAuthError })
      expect(configSvc.isAuthenticated).toBe(false)
    })

    it('should populate a fallback profile when the pid check is disabled', async () => {
      configSvc.instanceConfig = buildInstanceConfig({ disablePidCheck: true })
      service = build()
      await flushMicrotasks()
      service['loginChangeSubject'].next(true)

      expect(configSvc.userProfile).toEqual({ email: 'ada@x.com', userName: 'Ada', userId: 'u1' })
    })

    it('should not populate a profile when the pid check is enabled', async () => {
      await flushMicrotasks()
      service['loginChangeSubject'].next(true)
      expect(configSvc.userProfile).toBeNull()
      expect(configSvc.isAuthenticated).toBe(true)
    })

    it('should default the user id to an empty string when keycloak has none', async () => {
      configSvc.instanceConfig = buildInstanceConfig({ disablePidCheck: true })
      kcInstance.tokenParsed = { email: 'a@x.com', name: 'A' }
      kcInstance.idTokenParsed = {}
      service = build()
      await flushMicrotasks()
      service['loginChangeSubject'].next(true)

      expect(configSvc.userProfile.userId).toBe('')
    })
  })

  describe('initAuth', () => {
    it('should initialise keycloak from the instance config', async () => {
      await expect(service.initAuth()).resolves.toBe(true)
      expect(keycloakSvc.init).toHaveBeenCalledWith(expect.objectContaining({
        config: { url: 'https://kc.example.com', realm: 'sphere', clientId: 'web' },
        enableBearerInterceptor: true,
        loadUserProfileAtStartUp: false,
        bearerExcludedUrls: ['/public'],
      }))
    })

    it('should return false when there is no instance config', async () => {
      configSvc.instanceConfig = null
      await expect(service.initAuth()).resolves.toBe(false)
      expect(keycloakSvc.init).not.toHaveBeenCalled()
    })

    it('should initialise the microsoft auth service when configured', async () => {
      configSvc.instanceConfig = buildInstanceConfig({ microsoft: { isConfigured: true, clientId: 'ms' } })
      await service.initAuth()
      expect(msAuthSvc.init).toHaveBeenCalledWith({ microsoft: { isConfigured: true, clientId: 'ms' } })
    })

    it('should skip the microsoft auth service when not configured', async () => {
      await service.initAuth()
      expect(msAuthSvc.init).not.toHaveBeenCalled()
    })

    it('should return false when keycloak init throws', async () => {
      keycloakSvc.init.mockRejectedValue(new Error('kc down'))
      await expect(service.initAuth()).resolves.toBe(false)
    })
  })

  describe('keycloak event handling', () => {
    beforeEach(async () => {
      await service.initAuth()
    })

    it('should mark logged out on an auth error', () => {
      const seen: boolean[] = []
      service.isLoggedIn$.subscribe(v => seen.push(v))
      keycloakEvents$.next({ type: KeycloakEventTypeLegacy.OnAuthError })
      expect(seen).toContain(false)
    })

    it('should clear the stored session on logout', () => {
      localStorage.setItem('kc', 'value')
      keycloakEvents$.next({ type: KeycloakEventTypeLegacy.OnAuthLogout })
      expect(localStorage.getItem('kc')).toBeNull()
    })

    it('should publish the ready state', () => {
      const seen: boolean[] = []
      service.isLoggedIn$.subscribe(v => seen.push(v))
      keycloakEvents$.next({ type: KeycloakEventTypeLegacy.OnReady, args: true })
      expect(seen).toContain(true)
    })

    it('should ignore the no-op event types', () => {
      expect(() => {
        keycloakEvents$.next({ type: KeycloakEventTypeLegacy.OnAuthRefreshError })
        keycloakEvents$.next({ type: KeycloakEventTypeLegacy.OnAuthRefreshSuccess })
        keycloakEvents$.next({ type: KeycloakEventTypeLegacy.OnAuthSuccess })
        keycloakEvents$.next({ type: KeycloakEventTypeLegacy.OnTokenExpired })
      }).not.toThrow()
    })
  })

  describe('login', () => {
    it('should log the idp hint and redirect url', () => {
      service.login('S', '/app/home')
      expect(logger.log).toHaveBeenCalledWith('S', '/app/home')
    })

    it('should default the idp hint to E', () => {
      service.login(undefined as any, '/app/home')
      expect(logger.log).toHaveBeenCalledWith('E', '/app/home')
    })
  })

  describe('register', () => {
    it('should register with the supplied redirect url', async () => {
      await service.register('/app/welcome')
      expect(keycloakSvc.register).toHaveBeenCalledWith({ redirectUri: '/app/welcome' })
    })

    it('should default the redirect url to the document base', async () => {
      await service.register()
      expect(keycloakSvc.register).toHaveBeenCalledWith({ redirectUri: document.baseURI })
    })
  })

  describe('logout', () => {
    it('should clear storage, keep the theme and redirect to the public home', async () => {
      localStorage.setItem('theme', 'light')
      localStorage.setItem('tocData', 'x')
      sessionStorage.setItem('anything', 'y')

      await service.logout()

      expect(localStorage.getItem('tocData')).toBeNull()
      expect(sessionStorage.getItem('anything')).toBeNull()
      expect(localStorage.getItem('theme')).toBe('light')
      expect(mockHttp.get).toHaveBeenCalledWith(API_END_POINTS.LOGOUT_USER)
      expect(themeSvc.setTheme).not.toHaveBeenCalled()
    })

    it('should re-apply the dark theme after clearing storage', async () => {
      localStorage.setItem('theme', 'dark')
      await service.logout()
      expect(localStorage.getItem('theme')).toBe('dark')
      expect(themeSvc.setTheme).toHaveBeenCalledWith(true)
    })

    it('should default the theme to light when none was stored', async () => {
      await service.logout()
      expect(localStorage.getItem('theme')).toBe('light')
    })

    it('should swallow a failing logout call', async () => {
      mockHttp.get.mockReturnValue(throwError(() => new Error('network')))
      await expect(service.logout()).resolves.toBeUndefined()
    })
  })
})
