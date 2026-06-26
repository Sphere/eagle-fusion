jest.mock('lodash', () => ({
  find: (arr: any[], pred: any) => Array.isArray(arr) ? arr.find(pred) : undefined,
  includes: (str: string, sub: string) => typeof str === 'string' ? str.includes(sub) : false,
}))

jest.mock('project/ws/app/src/lib/routes/user-profile/services/user-profile.service', () => ({
  UserProfileService: class {
    getUserdetailsFromRegistry = jest.fn()
  },
}))

jest.mock('../../../../../project/ws/app/src/lib/routes/org/org-service.service', () => ({
  OrgServiceService: class {
    getSearchResultsV7ById = jest.fn()
  },
}))

jest.mock('../../../services/seo.service', () => ({
  SeoService: class { update = jest.fn() },
}))

jest.mock('../../../../../library/ws-widget/utils/src/public-api', () => ({
  LoggerService: class { log = jest.fn(); error = jest.fn() },
}))

jest.mock('../../../services/user-agent.service', () => ({
  UserAgentResolverService: class {
    requestGeolocation = jest.fn()
  },
}))

import { PublicTocComponent } from './public-toc.component'

describe('PublicTocComponent', () => {
  let component: PublicTocComponent
  let mockRouter: any
  let mockOrgService: any
  let mockActiveRoute: any
  let mockUserProfileSvc: any
  let mockSeoSvc: any
  let mockLogger: any
  let mockCdr: any
  let mockUserAgentSvc: any

  beforeEach(() => {
    mockRouter = {
      navigate: jest.fn(),
      navigateByUrl: jest.fn(),
      url: '/public/toc/overview/do_123/course-slug',
    }
    mockOrgService = { getSearchResultsV7ById: jest.fn() }
    mockActiveRoute = {
      firstChild: null,
      params: { subscribe: jest.fn() },
      queryParams: { subscribe: jest.fn() },
    }
    mockUserProfileSvc = { getUserdetailsFromRegistry: jest.fn() }
    mockSeoSvc = { update: jest.fn() }
    mockLogger = { log: jest.fn(), error: jest.fn() }
    mockCdr = { detectChanges: jest.fn(), markForCheck: jest.fn() }
    mockUserAgentSvc = { requestGeolocation: jest.fn() }

    localStorage.clear()

    component = new PublicTocComponent(
      mockRouter,
      mockOrgService,
      mockActiveRoute,
      mockUserProfileSvc,
      mockSeoSvc,
      mockLogger,
      mockCdr,
      mockUserAgentSvc,
    )
  })

  afterEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default routelinK to "overview"', () => {
    expect(component.routelinK).toBe('overview')
  })

  it('should default isLoading to false', () => {
    expect(component.isLoading).toBe(false)
  })

  describe('toggleComponent', () => {
    it('should set routelinK to "overview" for "overview"', () => {
      component.toggleComponent('overview')
      expect(component.routelinK).toBe('overview')
    })

    it('should set routelinK to "contents" for "contents"', () => {
      component.toggleComponent('contents')
      expect(component.routelinK).toBe('contents')
    })

    it('should set routelinK to "license" for "license"', () => {
      component.toggleComponent('license')
      expect(component.routelinK).toBe('license')
    })

    it('should set routelinK to empty string first then set value', () => {
      component.routelinK = 'contents'
      component.toggleComponent('overview')
      expect(component.routelinK).toBe('overview')
    })
  })

  describe('checkRoute', () => {
    it('should toggle to overview when URL includes "overview"', () => {
      mockRouter.url = '/public/toc/overview/do_123'
      component.checkRoute()
      expect(component.routelinK).toBe('overview')
    })

    it('should toggle to contents when URL includes "contents"', () => {
      mockRouter.url = '/public/toc/contents/do_123'
      component.checkRoute()
      expect(component.routelinK).toBe('contents')
    })

    it('should toggle to license when URL includes neither overview nor contents', () => {
      mockRouter.url = '/public/toc/license/do_123'
      component.checkRoute()
      expect(component.routelinK).toBe('license')
    })
  })
})
