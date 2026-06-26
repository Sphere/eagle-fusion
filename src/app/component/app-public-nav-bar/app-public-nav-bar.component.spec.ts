jest.mock('@angular/core', () => {
  const actual = jest.requireActual('@angular/core')
  return { ...actual, effect: jest.fn() }
})

import { AppPublicNavBarComponent } from './app-public-nav-bar.component'
import { Subscription } from 'rxjs'

describe('AppPublicNavBarComponent', () => {
  let component: AppPublicNavBarComponent
  let mockConfigSvc: any
  let mockRouter: any
  let mockActivateRoute: any
  let mockValueSvc: any
  let mockAuthSvc: any
  let mockLogger: any
  let mockThemeSvc: any

  beforeEach(() => {
    mockConfigSvc = {}
    mockRouter = {
      navigateByUrl: jest.fn(),
      url: '/public/home',
    }
    mockActivateRoute = {
      snapshot: {
        queryParamMap: {
          has: jest.fn().mockReturnValue(false),
          get: jest.fn().mockReturnValue(null),
        },
      },
    }
    mockValueSvc = {
      isMobile: jest.fn().mockReturnValue(false),
    }
    mockAuthSvc = {
      login: jest.fn(),
    }
    mockLogger = {
      log: jest.fn(),
    }
    mockThemeSvc = {
      isDark: jest.fn().mockReturnValue(false),
    }

    component = new AppPublicNavBarComponent(
      mockConfigSvc,
      mockRouter,
      mockActivateRoute,
      mockValueSvc,
      mockAuthSvc,
      mockLogger,
      mockThemeSvc
    )
  })

  describe('Component creation and default property values', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy()
    })

    it('should have default redirectUrl as empty string', () => {
      expect(component.redirectUrl).toBe('')
    })

    it('should have default isDark as false', () => {
      expect(component.isDark).toBe(false)
    })

    it('should expose public configSvc reference', () => {
      expect(component.configSvc).toBe(mockConfigSvc)
    })
  })

  describe('ngOnInit', () => {
    const originalBaseURI = document.baseURI
    const originalLocation = window.location

    beforeEach(() => {
      Object.defineProperty(document, 'baseURI', {
        value: 'http://localhost/',
        configurable: true,
      })
    })

    afterEach(() => {
      Object.defineProperty(document, 'baseURI', {
        value: originalBaseURI,
        configurable: true,
      })
    })

    it('should call has("ref") on the queryParamMap', async () => {
      mockActivateRoute.snapshot.queryParamMap.has.mockReturnValue(false)
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/public/home' },
        configurable: true,
      })
      await component.ngOnInit()
      expect(mockActivateRoute.snapshot.queryParamMap.has).toHaveBeenCalledWith('ref')
    })

    it('should set redirectUrl from ref query param when ref is present', async () => {
      mockActivateRoute.snapshot.queryParamMap.has.mockReturnValue(true)
      mockActivateRoute.snapshot.queryParamMap.get.mockReturnValue('some/path')
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/public/home?ref=some/path' },
        configurable: true,
      })
      await component.ngOnInit()
      expect(component.redirectUrl).toBe('http://localhost/some/path')
    })

    it('should set redirectUrl to href when href contains org-details', async () => {
      mockActivateRoute.snapshot.queryParamMap.has.mockReturnValue(false)
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/org-details/123' },
        configurable: true,
      })
      await component.ngOnInit()
      expect(component.redirectUrl).toBe('http://localhost/org-details/123')
    })

    it('should set redirectUrl to keycloak URL as fallback', async () => {
      mockActivateRoute.snapshot.queryParamMap.has.mockReturnValue(false)
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/public/home' },
        configurable: true,
      })
      await component.ngOnInit()
      expect(component.redirectUrl).toBe('http://localhost/openid/keycloak')
    })
  })

  describe('login', () => {
    beforeEach(() => {
      const mockLocalStorage: Record<string, string> = {}
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => mockLocalStorage[key] || null)
      jest.spyOn(Storage.prototype, 'removeItem').mockImplementation((key: string) => { delete mockLocalStorage[key] })
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => { mockLocalStorage[key] = value })
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should navigate to /public/login', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)
      component.login('E')
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/public/login')
    })

    it('should call authSvc.login with correct key E and redirectUrl', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)
      component.redirectUrl = 'http://localhost/openid/keycloak'
      component.login('E')
      expect(mockAuthSvc.login).toHaveBeenCalledWith('E', 'http://localhost/openid/keycloak')
    })

    it('should call authSvc.login with correct key N and redirectUrl', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)
      component.redirectUrl = 'http://localhost/openid/keycloak'
      component.login('N')
      expect(mockAuthSvc.login).toHaveBeenCalledWith('N', 'http://localhost/openid/keycloak')
    })

    it('should call authSvc.login with correct key S and redirectUrl', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)
      component.redirectUrl = 'http://localhost/openid/keycloak'
      component.login('S')
      expect(mockAuthSvc.login).toHaveBeenCalledWith('S', 'http://localhost/openid/keycloak')
    })

    it('should remove url_before_login when router url is /public/home and url_before_login exists', () => {
      const mockLocalStorage: Record<string, string> = { 'url_before_login': '/some/path' }
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => mockLocalStorage[key] || null)
      const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem')
      mockRouter.url = '/public/home'
      component.login('E')
      expect(removeItemSpy).toHaveBeenCalledWith('url_before_login')
    })

    it('should not remove url_before_login when router url is not /public/home', () => {
      const mockLocalStorage: Record<string, string> = { 'url_before_login': '/some/path' }
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => mockLocalStorage[key] || null)
      const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem')
      mockRouter.url = '/public/search'
      component.login('E')
      expect(removeItemSpy).not.toHaveBeenCalledWith('url_before_login')
    })
  })

  describe('onPopState', () => {
    it('should log back button pressed message via LoggerService', () => {
      const originalLocation = window.location
      Object.defineProperty(window, 'location', {
        value: { href: '' },
        configurable: true,
      })
      component.onPopState()
      expect(mockLogger.log).toHaveBeenCalledWith('Back button pressed')
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        configurable: true,
      })
    })
  })

  describe('ngOnDestroy', () => {
    it('should not throw when subscriptionLogin is null', () => {
      (component as any).subscriptionLogin = null
      expect(() => component.ngOnDestroy()).not.toThrow()
    })

    it('should call unsubscribe when subscriptionLogin exists', () => {
      const mockSubscription = { unsubscribe: jest.fn() } as unknown as Subscription
      ;(component as any).subscriptionLogin = mockSubscription
      component.ngOnDestroy()
      expect(mockSubscription.unsubscribe).toHaveBeenCalled()
    })
  })
})
