jest.mock('@ws/author', () => ({
  AccessControlService: class {},
}))
jest.mock('@ws-widget/collection', () => ({
  WidgetContentService: class {},
  NsContent: {},
  VIEWER_ROUTE_FROM_MIME: (mimeType: string) => {
    if (mimeType === 'application/pdf') { return 'pdf' }
    if (mimeType === 'application/quiz') { return 'quiz' }
    return 'html'
  },
}))
jest.mock('@ws-widget/utils', () => ({
  AuthMicrosoftService: class {},
  ConfigurationsService: class {},
  LoggerService: class {},
}))

import { of, throwError } from 'rxjs'
import { ViewerResolve } from './viewer.resolve'

describe('ViewerResolve', () => {
  let resolver: ViewerResolve
  let mockContentSvc: any
  let mockViewerDataSvc: any
  let mockMobileAppsSvc: any
  let mockRouter: any
  let mockAccessControlSvc: any
  let mockMsAuthSvc: any
  let mockConfigSvc: any
  let mockPlatform: any
  let mockLogger: any

  const makeRoute = (overrides: any = {}) => ({
    data: { resourceType: 'pdf' },
    paramMap: { get: jest.fn().mockReturnValue('resource-1') },
    queryParams: {},
    queryParamMap: { get: jest.fn().mockReturnValue(null) },
    ...overrides,
  })

  beforeEach(() => {
    mockContentSvc = {
      fetchAuthoringContent: jest.fn(),
      readContentV2: jest.fn(),
      fetchHierarchyContent: jest.fn().mockReturnValue({ toPromise: jest.fn().mockResolvedValue({ result: { content: {} } }) }),
      fetchContentHistoryV2: jest.fn().mockReturnValue({ toPromise: jest.fn().mockResolvedValue({ result: { contentList: [] } }) }),
    }
    mockViewerDataSvc = {
      reset: jest.fn(),
      resourceId: 'resource-1',
      setNode: jest.fn(),
      updateResource: jest.fn(),
    }
    mockMobileAppsSvc = { sendViewerData: jest.fn() }
    mockRouter = { navigate: jest.fn() }
    mockAccessControlSvc = { authoringConfig: { newDesign: false } }
    mockMsAuthSvc = { loginForSSOEnabledEmbed: jest.fn() }
    mockConfigSvc = { userProfile: { userId: 'user-1', email: 'a@b.com' } }
    mockPlatform = {}
    mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    resolver = new ViewerResolve(
      mockContentSvc,
      mockViewerDataSvc,
      mockMobileAppsSvc,
      mockRouter,
      mockAccessControlSvc,
      mockMsAuthSvc,
      mockConfigSvc,
      mockPlatform,
      mockLogger,
    )
  })

  it('should create', () => {
    expect(resolver).toBeTruthy()
  })

  it('returns null when resourceId could not be resolved from the route', () => {
    const route: any = makeRoute()
    route.paramMap.get.mockReturnValue(null)
    mockViewerDataSvc.resourceId = null
    expect(resolver.resolve(route)).toBeNull()
    expect(mockViewerDataSvc.reset).toHaveBeenCalledWith(null, 'none', undefined)
  })

  it('returns null for a preview request when newDesign is off and resourceType is not quiz', () => {
    const route: any = makeRoute()
    route.queryParamMap.get.mockImplementation((key: string) => (key === 'preview' ? 'true' : null))
    expect(resolver.resolve(route)).toBeNull()
  })

  it('does not return null for a preview request when resourceType is quiz', () => {
    const route: any = makeRoute({ data: { resourceType: 'quiz' } })
    route.queryParamMap.get.mockImplementation((key: string) => (key === 'preview' ? 'true' : null))
    mockContentSvc.fetchAuthoringContent.mockReturnValue(of({ result: { content: { identifier: 'resource-1', mimeType: 'application/quiz', status: 'Live' } } }))
    const result = resolver.resolve(route)
    expect(result).not.toBeNull()
  })

  it('resolves and updates the resource when resourceType matches the mime type', done => {
    const route: any = makeRoute()
    mockContentSvc.readContentV2.mockReturnValue(of({
      result: { content: { identifier: 'resource-1', mimeType: 'application/pdf', status: 'Live' } },
    }))
    resolver.resolve(route)!.subscribe(res => {
      expect(mockViewerDataSvc.updateResource).toHaveBeenCalled()
      expect(res.error).toBeNull()
      done()
    })
  })

  it('marks a mimeTypeMismatch error when resourceType does not match the mime type', done => {
    const route: any = makeRoute({ data: { resourceType: 'video' } })
    mockContentSvc.readContentV2.mockReturnValue(of({
      result: { content: { identifier: 'resource-1', mimeType: 'application/pdf', status: 'Live' } },
    }))
    resolver.resolve(route)!.subscribe(res => {
      expect(res.error).toBe('mimeTypeMismatch')
      expect(mockViewerDataSvc.updateResource).toHaveBeenCalledWith(null, expect.objectContaining({ errorType: 'mimeTypeMismatch' }))
      done()
    })
  })

  it('navigates away when the resource status is Deleted', done => {
    const route: any = makeRoute()
    mockContentSvc.readContentV2.mockReturnValue(of({
      result: { content: { identifier: 'resource-1', mimeType: 'application/pdf', status: 'Deleted', primaryCategory: 'Course' } },
    }))
    resolver.resolve(route)!.subscribe(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith([expect.stringContaining('/app/toc/resource-1/overview')])
      done()
    })
  })

  it('logs in for SSO-enabled embeds', done => {
    const route: any = makeRoute()
    mockContentSvc.readContentV2.mockReturnValue(of({
      result: { content: { identifier: 'resource-1', mimeType: 'application/pdf', status: 'Live', ssoEnabled: true } },
    }))
    resolver.resolve(route)!.subscribe(() => {
      expect(mockMsAuthSvc.loginForSSOEnabledEmbed).toHaveBeenCalledWith('a@b.com')
      done()
    })
  })

  it('catches errors from the content pipeline and returns {error, data: null}', done => {
    const route: any = makeRoute()
    mockContentSvc.readContentV2.mockReturnValue(throwError(() => new Error('boom')))
    resolver.resolve(route)!.subscribe(res => {
      expect(res.data).toBeNull()
      expect(mockViewerDataSvc.updateResource).toHaveBeenCalled()
      done()
    })
  })

  it('skips gating validation when no collectionId is present', done => {
    const route: any = makeRoute()
    mockContentSvc.readContentV2.mockReturnValue(of({
      result: { content: { identifier: 'resource-1', mimeType: 'application/pdf', status: 'Live' } },
    }))
    resolver.resolve(route)!.subscribe(() => {
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('No collectionId provided'))
      done()
    })
  })

  it('blocks and redirects when gating is enabled and prerequisites are incomplete', done => {
    const route: any = makeRoute()
    route.queryParamMap.get.mockImplementation((key: string) => (key === 'collectionId' ? 'course-1' : (key === 'batchId' ? 'batch-1' : null)))
    mockContentSvc.readContentV2.mockReturnValue(of({
      result: { content: { identifier: 'resource-1', mimeType: 'application/pdf', status: 'Live' } },
    }))
    mockContentSvc.fetchHierarchyContent.mockReturnValue({
      toPromise: jest.fn().mockResolvedValue({
        result: {
          content: {
            identifier: 'course-1',
            gatingEnabled: true,
            children: [
              { identifier: 'sib-1', contentType: 'Resource', completionPercentage: 0 },
              { identifier: 'resource-1', contentType: 'Resource', completionPercentage: 0, mimeType: 'application/pdf' },
            ],
          },
        },
      }),
    })
    resolver.resolve(route)!.subscribe(res => {
      expect(mockRouter.navigate).toHaveBeenCalled()
      expect(res.error).toBeInstanceOf(Error)
      expect(mockViewerDataSvc.updateResource).not.toHaveBeenCalled()
      done()
    })
  })

  it('allows access when gating is enabled but all prerequisites are complete', done => {
    const route: any = makeRoute()
    route.queryParamMap.get.mockImplementation((key: string) => (key === 'collectionId' ? 'course-1' : null))
    mockContentSvc.readContentV2.mockReturnValue(of({
      result: { content: { identifier: 'resource-1', mimeType: 'application/pdf', status: 'Live' } },
    }))
    mockContentSvc.fetchHierarchyContent.mockReturnValue({
      toPromise: jest.fn().mockResolvedValue({
        result: {
          content: {
            identifier: 'course-1',
            gatingEnabled: true,
            children: [
              { identifier: 'sib-1', contentType: 'Resource', completionPercentage: 100 },
              { identifier: 'resource-1', contentType: 'Resource', completionPercentage: 0, mimeType: 'application/pdf' },
            ],
          },
        },
      }),
    })
    resolver.resolve(route)!.subscribe(res => {
      expect(res.error).toBeNull()
      expect(mockViewerDataSvc.updateResource).toHaveBeenCalled()
      done()
    })
  })
})
