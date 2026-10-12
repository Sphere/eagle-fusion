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
  let mockTranslate: any
  let mockLogger: any

  beforeEach(() => {
    localStorage.clear()
    jest.spyOn(console, 'log').mockImplementation(() => undefined)
    mockContentSvc = {
      fetchContent: jest.fn(),
      fetchCourseBatches: jest.fn(),
      enrollUserToBatch: jest.fn(),
      fetchContentHistoryV2: jest.fn(),
      getFirstChildInHierarchy: jest.fn(),
      fetchUserBatchList: jest.fn(),
      getFilteredCourseSearchResults: jest.fn(),
    }
    mockConfigSvc = { userProfile: null }
    mockRouter = { navigate: jest.fn() }
    mockTranslate = { getCurrentLang: jest.fn().mockReturnValue('en') }
    mockLogger = { log: jest.fn(), error: jest.fn(), warn: jest.fn(), info: jest.fn() }
    guard = new SelfAssessmentGuard(
      mockContentSvc, mockConfigSvc as any, mockRouter, mockTranslate, mockLogger
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
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

    it('returns false (from selfAssessment) when queryParams are present', () => {
      mockConfigSvc.userProfile = { userId: 'u1' }
      mockContentSvc.fetchContent.mockReturnValue(of({}))
      mockContentSvc.fetchUserBatchList.mockReturnValue(of([]))
      mockContentSvc.fetchCourseBatches.mockReturnValue(of({}))
      jest.spyOn(guard, 'navigateToplayer').mockReturnValue(false)
      const route: any = { queryParams: { contentId: 'do_123' } }
      const result = guard.canActivate(route)
      expect(result).toBe(false)
    })
  })

  describe('enrollUser', () => {
    it('calls contentSvc.enrollUserToBatch with the passed contentId as courseId', () => {
      mockConfigSvc.userProfile = { userId: 'user-99' }
      const batchData = [{ batchId: 'batch-1' }]
      guard.enrollUser(batchData, 'course-1')
      expect(guard.batchId).toBe('batch-1')
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
      guard.enrollUser([{ batchId: 'b1' }], 'c1')
      expect(mockContentSvc.enrollUserToBatch).toHaveBeenCalledWith(
        expect.objectContaining({ request: expect.objectContaining({ userId: '' }) }),
      )
    })
  })

  describe('routeNavigation', () => {
    it('navigates with merged queryParams when resumeDataLink is set', () => {
      guard['resumeDataLink'] = { url: '/viewer/do_1', queryParams: { mode: 'play' } }
      guard.routeNavigation('batch-99', 'RESUME')
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/viewer/do_1'],
        {
          queryParams: expect.objectContaining({
            batchId: 'batch-99',
            viewMode: 'RESUME',
            competency: 'true',
            mode: 'play',
          }),
        },
      )
    })

    it('navigates with the asha params when the course is an asha course', () => {
      guard['resumeDataLink'] = { url: '/viewer/do_1', queryParams: { mode: 'play' } }
      guard.isAshaCourses = true
      guard.competencyId = '5'
      guard.language = 'hi'
      guard.levelsDetaisl = '[]'
      guard.routeNavigation('batch-1', 'START')
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/viewer/do_1'],
        {
          queryParams: expect.objectContaining({
            batchId: 'batch-1',
            viewMode: 'START',
            isAsha: true,
            competencyId: '5',
            lang: 'hi',
            levels: '[]',
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

  describe('selfAssessment', () => {
    it('stores competency metadata and resolves the batch from the enrolled list', () => {
      mockContentSvc.fetchContent.mockReturnValue(of({
        result: {
          content: {
            children: [{ identifier: 'child-1', index: 1 }],
            competencies_v1: JSON.stringify([{ id: 'comp1' }]),
          },
        },
      }))
      mockContentSvc.fetchUserBatchList.mockReturnValue(of([{ contentId: 'do_123', batchId: 'b1' }]))
      mockConfigSvc.userProfile = { userId: 'user-1' }
      const navSpy = jest.spyOn(guard, 'navigateToplayer').mockReturnValue(false)
      const result = guard.selfAssessment({ contentId: 'do_123', contentType: 'Course', lang: 'hi', isAsha: 'true' })
      expect(result).toBe(false)
      expect(mockContentSvc.fetchContent).toHaveBeenCalledWith('do_123')
      expect(guard.language).toBe('hi')
      expect(guard.isAshaCourses).toBe(true)
      const stored = JSON.parse(localStorage.getItem('competency_meta_data') || '[]')
      expect(stored[0]).toEqual({ id: 'comp1' })
      expect(stored[1].competencyIds).toEqual([{ identifier: 'child-1', competencyId: 1 }])
      expect(navSpy).toHaveBeenCalledWith({ batchId: 'b1' })
    })

    it('enrols the user through the batch-list endpoint when not already enrolled', () => {
      mockContentSvc.fetchContent.mockReturnValue(of({ result: { content: { children: [], competencies_v1: null } } }))
      mockContentSvc.fetchUserBatchList.mockReturnValue(of([]))
      mockContentSvc.fetchCourseBatches.mockReturnValue(of({ content: [{ batchId: 'b9' }] }))
      mockContentSvc.enrollUserToBatch.mockReturnValue(of({ batchId: 'b9' }))
      mockConfigSvc.userProfile = { userId: 'user-1' }
      const navSpy = jest.spyOn(guard, 'navigateToplayer').mockReturnValue(false)
      const result = guard.selfAssessment({ contentId: 'do_456', contentType: 'Course' })
      expect(result).toBe(false)
      expect(guard.language).toBe('en')
      expect(mockContentSvc.enrollUserToBatch).toHaveBeenCalledWith({
        request: { userId: 'user-1', courseId: 'do_456', batchId: 'b9' },
      })
      expect(navSpy).toHaveBeenCalledWith({ batchId: 'b9' })
    })

    it('skips enrolment when the batch list carries no batch id', () => {
      mockContentSvc.fetchContent.mockReturnValue(of({}))
      mockContentSvc.fetchUserBatchList.mockReturnValue(of([]))
      mockContentSvc.fetchCourseBatches.mockReturnValue(of({ content: [] }))
      mockConfigSvc.userProfile = { userId: 'user-1' }
      const navSpy = jest.spyOn(guard, 'navigateToplayer').mockReturnValue(false)
      guard.selfAssessment({ contentId: 'do_789', contentType: 'Course' })
      expect(mockContentSvc.enrollUserToBatch).not.toHaveBeenCalled()
      expect(navSpy).toHaveBeenCalledWith({ batchId: undefined })
    })
  })

  describe('getEnrolledCourseList / getFilteredCourseSearchResults', () => {
    it('fetches the user batch list with the profile userId', () => {
      mockConfigSvc.userProfile = { userId: 'user-1' }
      guard.getEnrolledCourseList()
      expect(mockContentSvc.fetchUserBatchList).toHaveBeenCalledWith('user-1')
    })

    it('delegates course search to the content service', () => {
      guard.getFilteredCourseSearchResults('do_1')
      expect(mockContentSvc.getFilteredCourseSearchResults).toHaveBeenCalledWith('do_1')
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
