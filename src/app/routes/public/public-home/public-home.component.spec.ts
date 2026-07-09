jest.mock('@angular/core', () => ({
  ...jest.requireActual('@angular/core'),
  effect: (fn: any) => { fn(); return {} },
}))

jest.mock('@angular/common', () => ({
  isPlatformBrowser: jest.fn().mockReturnValue(false),
}))

jest.mock('@ws-widget/resolver', () => ({
  WidgetBaseComponent: class {},
  NsWidgetResolver: {},
}))

jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class {
    userProfile = null
    instanceConfig = null
  },
  ValueService: class { isMobile = jest.fn().mockReturnValue(false) },
  NsPage: {},
}))

jest.mock('../../../services/seo.service', () => ({
  SeoService: class { update = jest.fn() },
}))

jest.mock('../../../services/user-agent.service', () => ({
  UserAgentResolverService: class {
    requestGeolocation = jest.fn()
  },
}))

import { PublicHomeComponent } from './public-home.component'

describe('PublicHomeComponent', () => {
  let component: PublicHomeComponent
  let mockConfigSvc: any
  let mockRouter: any
  let mockValueSvc: any
  let mockSnackBar: any
  let mockSeoSvc: any
  let mockUserAgentSvc: any

  function makeComponent() {
    component = new PublicHomeComponent(
      mockConfigSvc,
      mockRouter,
      mockValueSvc,
      mockSnackBar,
      mockSeoSvc,
      mockUserAgentSvc,
      'server' as any,
    )
  }

  beforeEach(() => {
    mockConfigSvc = { userProfile: null, instanceConfig: null }
    mockRouter = { navigate: jest.fn(), navigateByUrl: jest.fn() }
    mockValueSvc = { isMobile: jest.fn().mockReturnValue(false) }
    mockSnackBar = { open: jest.fn() }
    mockSeoSvc = { update: jest.fn() }
    mockUserAgentSvc = { requestGeolocation: jest.fn() }

    localStorage.clear()
    sessionStorage.clear()
    makeComponent()
  })

  afterEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default isXSmall to false', () => {
    expect(component.isXSmall).toBe(false)
  })

  it('should default isEkshamata to false', () => {
    expect(component.isEkshamata).toBe(false)
  })

  it('should default widgetData to null', () => {
    expect(component.widgetData).toBeNull()
  })

  it('should redirect to /page/home when logged in', () => {
    mockConfigSvc.instanceConfig = { siteName: 'test' }
    mockConfigSvc.userProfile = { userId: 'user-1' }
    makeComponent()
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/page/home'])
  })

  it('should not redirect when userProfile is null', () => {
    mockConfigSvc.instanceConfig = { siteName: 'test' }
    mockConfigSvc.userProfile = null
    makeComponent()
    expect(mockRouter.navigate).not.toHaveBeenCalledWith(['/page/home'])
  })

  describe('ngOnInit', () => {
    it('should call seoSvc.update with SEO metadata', () => {
      component.ngOnInit()
      expect(mockSeoSvc.update).toHaveBeenCalledWith(expect.objectContaining({
        title: expect.stringContaining('Aastrika Sphere'),
      }))
    })

    it('should remove "academic" from sessionStorage if present', () => {
      sessionStorage.setItem('academic', '{"type":"X_STANDARD"}')
      const commonMock = jest.requireMock('@angular/common')
      commonMock.isPlatformBrowser.mockReturnValue(true)
      component.ngOnInit()
      commonMock.isPlatformBrowser.mockReturnValue(false)
      expect(sessionStorage.getItem('academic')).toBeNull()
    })

    it('should open snackBar when mnc_error is in sessionStorage', () => {
      sessionStorage.setItem('mnc_error', 'Session expired')
      const require = jest.requireMock('@angular/common')
      require.isPlatformBrowser.mockReturnValue(true)
      component.ngOnInit()
      expect(mockSnackBar.open).toHaveBeenCalledWith('Session expired', 'OK', expect.any(Object))
      sessionStorage.removeItem('mnc_error')
    })

    it('should set isEkshamata true and clear stored keys in browser', () => {
      const commonMock = jest.requireMock('@angular/common')
      commonMock.isPlatformBrowser.mockReturnValue(true)
      localStorage.setItem('preferedLanguage', 'hi')
      localStorage.setItem('url_before_login', '/x')
      component.ngOnInit()
      commonMock.isPlatformBrowser.mockReturnValue(false)
      expect(component.isEkshamata).toBe(true)
      expect(mockUserAgentSvc.requestGeolocation).toHaveBeenCalled()
      expect(localStorage.getItem('preferedLanguage')).toBeNull()
      expect(localStorage.getItem('url_before_login')).toBeNull()
    })
  })

  describe('constructor branches', () => {
    it('redirects to organisations home when browser and orgValue is nhsrc', () => {
      const commonMock = jest.requireMock('@angular/common')
      commonMock.isPlatformBrowser.mockReturnValue(true)
      localStorage.setItem('orgValue', 'nhsrc')
      makeComponent()
      commonMock.isPlatformBrowser.mockReturnValue(false)
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/public/organisations/home')
    })

    it('sets isXSmall true when isMobile returns true', () => {
      mockValueSvc.isMobile = jest.fn().mockReturnValue(true)
      makeComponent()
      expect(component.isXSmall).toBe(true)
    })
  })
})
