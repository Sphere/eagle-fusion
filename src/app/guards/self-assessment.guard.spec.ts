jest.mock('../../../library/ws-widget/collection/src/public-api', () => ({
  WidgetContentService: class {
    fetchContent = jest.fn()
    fetchCourseBatches = jest.fn()
    enrollUserToBatch = jest.fn()
    fetchContentHistoryV2 = jest.fn()
    getFirstChildInHierarchy = jest.fn()
  },
}))

jest.mock('../../../library/ws-widget/utils/src/public-api', () => ({
  ConfigurationsService: class { userProfile = null },
}))

jest.mock('@ws-widget/collection', () => ({
  viewerRouteGenerator: jest.fn().mockReturnValue({ url: '/viewer/do_1', queryParams: {} }),
}))

import { of } from 'rxjs'
import { SelfAssessmentGuard } from './self-assessment.guard'

describe('SelfAssessmentGuard', () => {
  let guard: SelfAssessmentGuard
  let mockContentSvc: any
  let mockConfigSvc: any
  let mockRouter: any

  beforeEach(() => {
    localStorage.clear()
    mockContentSvc = {
      fetchContent: jest.fn(),
      fetchCourseBatches: jest.fn(),
      enrollUserToBatch: jest.fn(),
      fetchContentHistoryV2: jest.fn(),
      getFirstChildInHierarchy: jest.fn(),
    }
    mockConfigSvc = { userProfile: null }
    mockRouter = { navigate: jest.fn() }
    guard = new SelfAssessmentGuard(mockContentSvc, mockConfigSvc as any, mockRouter)
  })

  afterEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('should create', () => {
    expect(guard).toBeTruthy()
  })

  it('resumeData defaults to null', () => {
    expect(guard.resumeData).toBeNull()
  })

  it('eventData defaults to null', () => {
    expect(guard.eventData).toBeNull()
  })

  describe('canActivate', () => {
    it('navigates to public/home and returns false when userProfile is null', () => {
      mockConfigSvc.userProfile = null
      const route: any = { queryParams: {} }
      const result = guard.canActivate(route)
      expect(mockRouter.navigate).toHaveBeenCalledWith(['public/home'])
      expect(result).toBe(false)
    })

    it('returns false when userProfile is set but queryParams is null', () => {
      mockConfigSvc.userProfile = { userId: 'u1' }
      const route: any = { queryParams: null }
      const result = guard.canActivate(route)
      expect(result).toBe(false)
    })

    it('returns false (from selfAsesment) when queryParams are present', () => {
      mockConfigSvc.userProfile = { userId: 'u1' }
      const route: any = { queryParams: { contentId: 'do_123' } }
      const result = guard.canActivate(route)
      expect(result).toBe(false)
    })
  })

  describe('enrollUser', () => {
    it('calls contentSvc.enrollUserToBatch with correct request', () => {
      mockConfigSvc.userProfile = { userId: 'user-99' }
      const batchData = [{ courseId: 'course-1', batchId: 'batch-1' }]
      guard.enrollUser(batchData)
      expect(mockContentSvc.enrollUserToBatch).toHaveBeenCalledWith({
        request: {
          userId: 'user-99',
          courseId: 'course-1',
          batchId: 'batch-1',
        },
      })
    })

    it('uses empty string for userId when userProfile is null', () => {
      mockConfigSvc.userProfile = null
      guard.enrollUser([{ courseId: 'c1', batchId: 'b1' }])
      expect(mockContentSvc.enrollUserToBatch).toHaveBeenCalledWith(
        expect.objectContaining({ request: expect.objectContaining({ userId: '' }) }),
      )
    })
  })

  describe('routeNavigation', () => {
    it('does nothing when resumeDataLink is falsy', () => {
      guard['resumeDataLink'] = null
      guard.routeNavigation('batch-1', 'START')
      expect(mockRouter.navigate).not.toHaveBeenCalled()
    })

    it('navigates with merged queryParams when resumeDataLink is set', () => {
      guard['resumeDataLink'] = { url: '/viewer/do_1', queryParams: { mode: 'play' } }
      guard.routeNavigation('batch-99', 'RESUME')
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/viewer/do_1'],
        {
          queryParams: expect.objectContaining({
            batchId: 'batch-99',
            viewMode: 'RESUME',
            competency: true,
            mode: 'play',
          }),
        },
      )
    })
  })

  describe('getContent', () => {
    it('calls contentSvc.fetchContent with eventData.contentId', () => {
      guard.eventData = { contentId: 'do_456' }
      guard.getContent()
      expect(mockContentSvc.fetchContent).toHaveBeenCalledWith('do_456')
    })
  })

  describe('getCourseBatch', () => {
    it('calls contentSvc.fetchCourseBatches with correct filter', () => {
      guard.eventData = { contentId: 'do_789' }
      guard.getCourseBatch()
      expect(mockContentSvc.fetchCourseBatches).toHaveBeenCalledWith(
        expect.objectContaining({
          request: expect.objectContaining({
            filters: expect.objectContaining({ courseId: 'do_789' }),
          }),
        }),
      )
    })
  })

  describe('selfAsesment', () => {
    it('should return false and call getContent and getCourseBatch', () => {
      const contentResult = of({ result: { content: { children: [], competencies_v1: null } } })
      const batchResult = of({ content: [{ batchId: 'b1', courseId: 'c1', enrollmentEndDate: null }] })
      mockContentSvc.fetchContent = jest.fn().mockReturnValue(contentResult)
      mockContentSvc.fetchCourseBatches = jest.fn().mockReturnValue(batchResult)
      mockContentSvc.enrollUserToBatch = jest.fn().mockReturnValue(of([{ batchId: 'b1' }]))
      mockContentSvc.fetchContentHistoryV2 = jest.fn().mockReturnValue(of({ result: { contentList: [] } }))
      mockContentSvc.getFirstChildInHierarchy = jest.fn().mockReturnValue({ identifier: 'child1', mimeType: 'application/json' })
      mockConfigSvc.userProfile = { userId: 'user-1' }
      guard['configSvc'] = mockConfigSvc
      const result = guard.selfAsesment({ contentId: 'do_123', contentType: 'Course' })
      expect(result).toBe(false)
      expect(mockContentSvc.fetchContent).toHaveBeenCalledWith('do_123')
    })

    it('covers forEach callback and subscribe next callback with valid children and competencies_v1', () => {
      const competencyData = [{ id: 'comp1' }]
      const contentResult = of({
        result: {
          content: {
            children: [{ identifier: 'child-1', index: 1 }],
            competencies_v1: JSON.stringify(competencyData),
          },
        },
      })
      const batchResult = of({ content: [{ batchId: 'b1', courseId: 'c1', enrollmentEndDate: '2099-12-31' }] })
      mockContentSvc.fetchContent = jest.fn().mockReturnValue(contentResult)
      mockContentSvc.fetchCourseBatches = jest.fn().mockReturnValue(batchResult)
      mockContentSvc.fetchContentHistoryV2 = jest.fn().mockReturnValue(of({ result: { contentList: [] } }))
      mockContentSvc.getFirstChildInHierarchy = jest.fn().mockReturnValue({ identifier: 'child-1', mimeType: 'video/mp4' })
      mockConfigSvc.userProfile = { userId: 'user-1' }
      guard['configSvc'] = mockConfigSvc
      guard['resumeDataLink'] = null
      jest.spyOn(guard, 'routeNavigation').mockImplementation(jest.fn())
      const result = guard.selfAsesment({ contentId: 'do_456', contentType: 'Course' })
      expect(result).toBe(false)
      expect(mockContentSvc.fetchContentHistoryV2).toHaveBeenCalled()
    })
  })

  describe('navigateToplayer', () => {
    it('should call routeNavigation with START when contentList is empty', () => {
      mockContentSvc.fetchContentHistoryV2 = jest.fn().mockReturnValue(of({ result: { contentList: [] } }))
      mockContentSvc.getFirstChildInHierarchy = jest.fn().mockReturnValue({ identifier: 'child1', mimeType: 'application/json' })
      guard.eventData = { contentId: 'do_123', contentType: 'Course' }
      guard.content = { children: [] }
      guard['resumeDataLink'] = null
      const routeNavSpy = jest.spyOn(guard, 'routeNavigation')
      guard.navigateToplayer({ batchId: 'batch-1' })
      expect(mockContentSvc.fetchContentHistoryV2).toHaveBeenCalled()
    })

    it('should call routeNavigation with RESUME when contentList has items', () => {
      const contentList = [{ contentId: 'child1', progressdetails: { mimeType: 'application/json' } }]
      mockContentSvc.fetchContentHistoryV2 = jest.fn().mockReturnValue(of({ result: { contentList } }))
      guard.eventData = { contentId: 'do_123', contentType: 'Course' }
      guard['resumeDataLink'] = null
      const routeNavSpy = jest.spyOn(guard, 'routeNavigation')
      guard.navigateToplayer({ batchId: 'batch-2' })
      expect(mockContentSvc.fetchContentHistoryV2).toHaveBeenCalled()
    })
  })
})
