jest.mock('@ws-widget/resolver', () => ({
  WidgetBaseComponent: class {
    widgetType = ''
    widgetSubType = ''
    widgetInstanceId = undefined
    widgetHostClass = undefined
    widgetSafeStyle = undefined
    className = undefined
    updateBaseComponent = jest.fn()
    ngAfterViewInit = jest.fn()
  },
  NsWidgetResolver: {},
}))

jest.mock('../../services/mobile-apps.service', () => ({
  MobileAppsService: class {
    init = jest.fn()
  },
}))

import { Subject } from 'rxjs'
import { LoginComponent } from './login.component'

describe('LoginComponent', () => {
  let component: LoginComponent
  let dataSubject: Subject<any>
  let mockActivatedRoute: any
  let mockAuthSvc: any
  let mockConfigSvc: any
  let mockDomSanitizer: any
  let mockMobileAppsSvc: any

  const makeRouteData = (overrides: any = {}) => ({
    pageData: {
      data: {
        pageLayout: 'default',
        isClient: false,
        footer: {
          descriptiveFooter: { text: 'Footer text' },
          contactUs: false,
        },
        topbar: { title: 'Login', subTitle: 'Welcome back' },
        ...overrides,
      },
    },
  })

  beforeEach(() => {
    dataSubject = new Subject<any>()

    mockActivatedRoute = {
      data: dataSubject.asObservable(),
      snapshot: {
        queryParamMap: {
          has: jest.fn().mockReturnValue(false),
          get: jest.fn().mockReturnValue(null),
        },
      },
    }

    mockAuthSvc = {
      login: jest.fn(),
    }

    mockConfigSvc = {
      instanceConfig: {
        logos: {
          appTransparent: 'https://example.com/logo.png',
          company: 'TestCompany',
          developedBy: 'Tarento',
        },
      },
      pageNavBar: { background: '#fff' },
    }

    mockDomSanitizer = {
      bypassSecurityTrustResourceUrl: jest.fn().mockReturnValue('safe-logo-url'),
    }

    mockMobileAppsSvc = { init: jest.fn() }
  })

  const createComponent = () =>
    new LoginComponent(
      mockActivatedRoute,
      mockAuthSvc,
      mockConfigSvc,
      mockDomSanitizer,
      mockMobileAppsSvc,
    )

  afterEach(() => jest.clearAllMocks())

  it('should create', () => {
    component = createComponent()
    expect(component).toBeTruthy()
  })

  describe('constructor', () => {
    it('should call mobileAppsSvc.init()', () => {
      component = createComponent()
      expect(mockMobileAppsSvc.init).toHaveBeenCalled()
    })

    it('should sanitize appTransparent logo URL', () => {
      component = createComponent()
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(
        'https://example.com/logo.png',
      )
      expect(component.appIcon).toBe('safe-logo-url')
    })

    it('should set productLogo from instanceConfig', () => {
      component = createComponent()
      expect(component.productLogo).toBe('TestCompany')
    })

    it('should set developedBy from instanceConfig', () => {
      component = createComponent()
      expect(component.developedBy).toBe('Tarento')
    })

    it('should not throw when instanceConfig is null', () => {
      mockConfigSvc.instanceConfig = null
      expect(() => createComponent()).not.toThrow()
    })

    it('should leave appIcon null when instanceConfig is null', () => {
      mockConfigSvc.instanceConfig = null
      component = createComponent()
      expect(component.appIcon).toBeNull()
    })
  })

  describe('default property values', () => {
    beforeEach(() => { component = createComponent() })

    it('should default isXSmall to false', () => {
      expect(component.isXSmall).toBe(false)
    })

    it('should default contactUs to false', () => {
      expect(component.contactUs).toBe(false)
    })

    it('should default isClientLogin to false', () => {
      expect(component.isClientLogin).toBe(false)
    })

    it('should default loginConfig to null', () => {
      expect(component.loginConfig).toBeNull()
    })

    it('should default pageData to null', () => {
      expect(component.pageData).toBeNull()
    })

    it('should default alreadyRaised to false', () => {
      expect(component.alreadyRaised).toBe(false)
    })
  })

  describe('ngOnInit', () => {
    it('should set loginConfig from route data', () => {
      component = createComponent()
      component.ngOnInit()
      dataSubject.next(makeRouteData())
      expect(component.loginConfig).not.toBeNull()
      expect(component.isClientLogin).toBe(false)
    })

    it('should set title and subTitle from topbar', () => {
      component = createComponent()
      component.ngOnInit()
      dataSubject.next(makeRouteData())
      expect(component.title).toBe('Login')
      expect(component.subTitle).toBe('Welcome back')
    })

    it('should set welcomeFooter from descriptiveFooter', () => {
      component = createComponent()
      component.ngOnInit()
      dataSubject.next(makeRouteData())
      expect(component.welcomeFooter).toEqual({ text: 'Footer text' })
    })

    it('should set isClientLogin from route data', () => {
      component = createComponent()
      component.ngOnInit()
      dataSubject.next(makeRouteData({ isClient: true }))
      expect(component.isClientLogin).toBe(true)
    })

    it('should set error and null pageData when pageData is missing', () => {
      component = createComponent()
      component.ngOnInit()
      dataSubject.next({ pageData: { error: 'Not found' } })
      expect(component.pageData).toBeNull()
      expect(component.error).toBe('Not found')
    })

    it('should set redirectUrl from baseURI when ref param is absent', () => {
      component = createComponent()
      component.ngOnInit()
      dataSubject.next(makeRouteData())
      // redirectUrl is private, login() passes it to authSvc
      component.login('E')
      expect(mockAuthSvc.login).toHaveBeenCalledWith('E', document.baseURI)
    })

    it('should set redirectUrl including ref param when present', () => {
      mockActivatedRoute.snapshot.queryParamMap.has = jest.fn().mockReturnValue(true)
      mockActivatedRoute.snapshot.queryParamMap.get = jest.fn().mockReturnValue('/app/home')
      component = createComponent()
      component.ngOnInit()
      dataSubject.next(makeRouteData())
      component.login('E')
      expect(mockAuthSvc.login).toHaveBeenCalledWith('E', `${document.baseURI}/app/home`)
    })
  })

  describe('ngOnInit filter callback', () => {
    it('filters channel_how_to from links when isXSmall is false', () => {
      component = createComponent()
      component.ngOnInit()
      dataSubject.next({
        pageData: {
          data: {
            navigationBar: {
              links: [
                { widgetData: { actionBtnId: 'home', config: {} } },
                { widgetData: { actionBtnId: 'channel_how_to', config: {} } },
              ],
            },
          },
        },
      })
      expect(component.links).toHaveLength(1)
      expect(component.links[0].widgetData.actionBtnId).toBe('home')
    })
  })

  describe('getNavLinks', () => {
    beforeEach(() => {
      component = createComponent()
      component.ngOnInit()
      dataSubject.next(makeRouteData())
    })

    it('should return empty array when pageData is null', () => {
      component.pageData = null
      expect(component.getNavLinks()).toEqual([])
    })

    it('should return empty array when navigationBar is absent', () => {
      component.pageData = { navigationBar: null } as any
      expect(component.getNavLinks()).toEqual([])
    })

    it('should return links when navigationBar.links is an array', () => {
      const links = [{ widgetData: { actionBtnId: 'home', config: {} } }] as any
      component.pageData = { navigationBar: { links } } as any
      expect(component.getNavLinks()).toEqual(links)
    })

    it('should wrap links with mat-menu-item config on mobile', () => {
      component.isXSmall = true
      const links = [{ widgetData: { actionBtnId: 'home', config: { type: 'mat-button' } } }] as any
      component.pageData = { navigationBar: { links } } as any
      const result = component.getNavLinks()
      expect(result[0].widgetData.config.type).toBe('mat-menu-item')
    })
  })

  describe('login', () => {
    it('should call authSvc.login with key E', () => {
      component = createComponent()
      component.ngOnInit()
      dataSubject.next(makeRouteData())
      component.login('E')
      expect(mockAuthSvc.login).toHaveBeenCalledWith('E', expect.any(String))
    })

    it('should call authSvc.login with key N', () => {
      component = createComponent()
      component.ngOnInit()
      dataSubject.next(makeRouteData())
      component.login('N')
      expect(mockAuthSvc.login).toHaveBeenCalledWith('N', expect.any(String))
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe the login subscription', () => {
      component = createComponent()
      component.ngOnInit()
      dataSubject.next(makeRouteData())
      expect(() => component.ngOnDestroy()).not.toThrow()
      // Emitting after destroy should not cause errors
      expect(() => dataSubject.next(makeRouteData())).not.toThrow()
    })

    it('should not throw when subscriptionLogin is null', () => {
      component = createComponent()
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })
})
