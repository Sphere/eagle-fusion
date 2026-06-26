jest.mock('@angular/core', () => {
  const actual = jest.requireActual('@angular/core')
  return { ...actual, effect: (fn: () => void) => { fn() } }
})

jest.mock('../../../../library/ws-widget/utils/src/public-api', () => ({
  ValueService: class {
    isMobile = jest.fn().mockReturnValue(false)
  },
  LoggerService: class {
    log = jest.fn()
  },
}))

import { WebEkshamataPublicComponent } from './web-ekshamata-public-container.component'

describe('WebEkshamataPublicComponent', () => {
  let component: WebEkshamataPublicComponent
  let mockRouter: any
  let mockValueSvc: any
  let mockLogger: any

  beforeEach(() => {
    mockRouter = {
      url: '/public/home',
      navigate: jest.fn(),
    }
    mockValueSvc = { isMobile: jest.fn().mockReturnValue(false) }
    mockLogger = { log: jest.fn() }
    component = new WebEkshamataPublicComponent(mockRouter, mockValueSvc, mockLogger)
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default isXSmall$ to false', () => {
    expect(component.isXSmall$).toBe(false)
  })

  it('should set isXSmall$ true when isMobile returns true', () => {
    mockValueSvc.isMobile.mockReturnValue(true)
    component = new WebEkshamataPublicComponent(mockRouter, mockValueSvc, mockLogger)
    expect(component.isXSmall$).toBe(true)
  })

  it('should call logger.log on ngOnInit', () => {
    component.ngOnInit()
    expect(mockLogger.log).toHaveBeenCalledWith('public ekshamata home component')
  })

  it('should redirect to login_url when it exists in localStorage', () => {
    localStorage.setItem('login_url', 'https://ekshamata.example.com/login')
    component.login()
    expect(mockRouter.navigate).not.toHaveBeenCalled()
  })

  it('should remove url_before_login and navigate to public/login when on /public/home', () => {
    localStorage.setItem('url_before_login', '/app/toc/some-course')
    component.login()
    expect(localStorage.getItem('url_before_login')).toBeNull()
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/public/login'],
      { queryParams: { ekshamtaLogin: true } },
    )
  })

  it('should navigate to public/login without removing url_before_login on different route', () => {
    mockRouter.url = '/other/route'
    localStorage.setItem('url_before_login', '/app/toc/some-course')
    component.login()
    expect(localStorage.getItem('url_before_login')).toBe('/app/toc/some-course')
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/public/login'],
      { queryParams: { ekshamtaLogin: true } },
    )
    localStorage.removeItem('url_before_login')
  })
})
