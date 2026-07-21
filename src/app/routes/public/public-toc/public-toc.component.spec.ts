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

import { of } from 'rxjs'
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

  describe('seachAPI', () => {
    it('should set tocData when result contains matching content', async () => {
      const courseId = 'do_123'
      component.courseid = courseId
      mockRouter.url = '/public/toc/overview/do_123'
      mockOrgService.getSearchResultsV7ById = jest.fn().mockReturnValue(
        of({ result: { content: [{ identifier: courseId, name: 'Test Course', description: 'Test Desc', subject: ['Health'], keywords: ['kw1'] }] } }),
      )
      component['orgService'] = mockOrgService
      await component.seachAPI(courseId)
      expect(component.tocData).toBeDefined()
      expect(component.tocData.identifier).toBe(courseId)
      expect(mockSeoSvc.update).toHaveBeenCalled()
    })

    it('should not set tocData when content is empty', async () => {
      mockOrgService.getSearchResultsV7ById = jest.fn().mockReturnValue(
        of({ result: { content: [] } }),
      )
      component['orgService'] = mockOrgService
      await component.seachAPI('do_missing')
      expect(component.tocData).toBeUndefined()
    })

    it('should log error when orgService throws', async () => {
      const { throwError } = require('rxjs')
      mockOrgService.getSearchResultsV7ById = jest.fn().mockReturnValue(throwError(() => new Error('API error')))
      component['orgService'] = mockOrgService
      await component.seachAPI('do_123')
      expect(mockLogger.error).toHaveBeenCalled()
    })
  })

  describe('ngOnInit', () => {
    it('should call requestGeolocation on init', async () => {
      mockActiveRoute.params = of({ courseId: 'do_123' })
      mockActiveRoute.queryParams = of({})
      mockOrgService.getSearchResultsV7ById = jest.fn().mockReturnValue(of({ result: { content: [] } }))
      component = new PublicTocComponent(mockRouter, mockOrgService, mockActiveRoute, mockUserProfileSvc, mockSeoSvc, mockLogger, mockCdr, mockUserAgentSvc)
      await component.ngOnInit()
      expect(mockUserAgentSvc.requestGeolocation).toHaveBeenCalled()
    })

    it('should call getUserdetailsFromRegistry when userUUID exists in localStorage', async () => {
      localStorage.setItem('userUUID', 'uuid-test')
      mockActiveRoute.params = of({ courseId: 'do_999' })
      mockActiveRoute.queryParams = of({})
      mockUserProfileSvc.getUserdetailsFromRegistry = jest.fn().mockReturnValue({ subscribe: jest.fn() })
      mockOrgService.getSearchResultsV7ById = jest.fn().mockReturnValue(of({ result: { content: [] } }))
      component = new PublicTocComponent(mockRouter, mockOrgService, mockActiveRoute, mockUserProfileSvc, mockSeoSvc, mockLogger, mockCdr, mockUserAgentSvc)
      await component.ngOnInit()
      expect(mockUserProfileSvc.getUserdetailsFromRegistry).toHaveBeenCalledWith('uuid-test')
    })

    it('should navigateByUrl when getUserdetailsFromRegistry succeeds and URL differs', async () => {
      localStorage.setItem('userUUID', 'uuid-test')
      mockActiveRoute.params = of({ courseId: 'do_999', slug: 'my-course' })
      mockActiveRoute.queryParams = of({})
      mockRouter.url = '/some-other-path'
      mockUserProfileSvc.getUserdetailsFromRegistry = jest.fn().mockReturnValue(of({}))
      mockOrgService.getSearchResultsV7ById = jest.fn().mockReturnValue(of({ result: { content: [] } }))
      component = new PublicTocComponent(mockRouter, mockOrgService, mockActiveRoute, mockUserProfileSvc, mockSeoSvc, mockLogger, mockCdr, mockUserAgentSvc)
      await component.ngOnInit()
      await Promise.resolve()
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/public/toc/overview/do_999/my-course')
    })

    it('should log error when getUserdetailsFromRegistry fails', async () => {
      localStorage.setItem('userUUID', 'uuid-err')
      mockActiveRoute.params = of({ courseId: 'do_err' })
      mockActiveRoute.queryParams = of({})
      const { throwError: thrw } = require('rxjs')
      mockUserProfileSvc.getUserdetailsFromRegistry = jest.fn().mockReturnValue(thrw(() => new Error('profile error')))
      mockOrgService.getSearchResultsV7ById = jest.fn().mockReturnValue(of({ result: { content: [] } }))
      component = new PublicTocComponent(mockRouter, mockOrgService, mockActiveRoute, mockUserProfileSvc, mockSeoSvc, mockLogger, mockCdr, mockUserAgentSvc)
      await component.ngOnInit()
      await Promise.resolve()
      expect(mockLogger.error).toHaveBeenCalled()
    })

    it('should remove tocData from localStorage when it exists', async () => {
      localStorage.setItem('tocData', JSON.stringify({ id: 'old' }))
      mockActiveRoute.params = of({ courseId: 'do_123' })
      mockActiveRoute.queryParams = of({})
      mockOrgService.getSearchResultsV7ById = jest.fn().mockReturnValue(of({ result: { content: [] } }))
      component = new PublicTocComponent(mockRouter, mockOrgService, mockActiveRoute, mockUserProfileSvc, mockSeoSvc, mockLogger, mockCdr, mockUserAgentSvc)
      await component.ngOnInit()
      expect(localStorage.getItem('tocData')).toBeNull()
    })
  })

  describe('seachAPI additional branches', () => {
    it('should build keywords from string subject and string keywords', async () => {
      const courseId = 'do_123'
      mockOrgService.getSearchResultsV7ById = jest.fn().mockReturnValue(
        of({ result: { content: [{ identifier: courseId, name: 'Test', subject: 'Health', keywords: 'kw1,kw2', averageRating: 4.5, totalRatingsCount: 10 }] } }),
      )
      component['orgService'] = mockOrgService
      await component.seachAPI(courseId)
      expect(mockSeoSvc.update).toHaveBeenCalledWith(
        expect.objectContaining({
          jsonLd: expect.objectContaining({ aggregateRating: expect.objectContaining({ ratingValue: 4.5 }) }),
        }),
      )
    })

    it('should not include aggregateRating when averageRating is absent', async () => {
      const courseId = 'do_no_rating'
      mockOrgService.getSearchResultsV7ById = jest.fn().mockReturnValue(
        of({ result: { content: [{ identifier: courseId, name: 'Test' }] } }),
      )
      component['orgService'] = mockOrgService
      await component.seachAPI(courseId)
      const updateCall = mockSeoSvc.update.mock.calls[0][0]
      expect(updateCall.jsonLd.aggregateRating).toBeUndefined()
    })
  })
})
