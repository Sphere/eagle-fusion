jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class {},
  LoggerService: class {
    log = jest.fn()
  },
}))

import { HeaderComponent } from './header.component'

describe('HeaderComponent', () => {
  let component: HeaderComponent
  let mockRouter: any
  let mockConfigSvc: any
  let mockLogger: any

  beforeEach(() => {
    mockRouter = { navigateByUrl: jest.fn() }
    mockConfigSvc = { unMappedUser: null }
    mockLogger = { log: jest.fn() }
    component = new HeaderComponent(mockRouter, mockConfigSvc, mockLogger)
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should call logger.log with configSvc', async () => {
      await component.ngOnInit()
      expect(mockLogger.log).toHaveBeenCalledWith(mockConfigSvc)
    })
  })

  describe('homePage', () => {
    it('should navigate to /page/home when user is logged in and flag is false', () => {
      localStorage.setItem('isOrgSelectiveCourse', 'false')
      mockConfigSvc.unMappedUser = { id: 'user1' }
      component.homePage()
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/page/home')
    })

    it('should navigate to /public/home when user is not logged in and flag is false', () => {
      localStorage.setItem('isOrgSelectiveCourse', 'false')
      mockConfigSvc.unMappedUser = null
      component.homePage()
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/public/home')
    })

    it('should not navigate when isOrgSelectiveCourse is true', () => {
      localStorage.setItem('isOrgSelectiveCourse', 'true')
      component.homePage()
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled()
    })

    it('should not navigate when isOrgSelectiveCourse is not set', () => {
      component.homePage()
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled()
    })
  })
})
