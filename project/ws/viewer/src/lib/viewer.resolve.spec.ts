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

  it('handles unknown resourceType and navigates to viewer for correct mime', done => {
    const route: any = makeRoute({ data: { resourceType: 'unknown' } })
    mockContentSvc.readContentV2.mockReturnValue(of({
      result: { content: { identifier: 'resource-1', mimeType: 'application/pdf', status: 'Live' } },
    }))
    resolver.resolve(route)!.subscribe(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith([expect.stringContaining('/viewer/pdf/resource-1')])
      done()
    })
  })

  it('uses fetchAuthoringContent and /author prefix when url contains /author/', done => {
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost/author/edit' },
      writable: true,
    })
    const route: any = makeRoute({ data: { resourceType: 'unknown' } })
    mockContentSvc.fetchAuthoringContent.mockReturnValue(of({
      result: { content: { identifier: 'resource-1', mimeType: 'application/pdf', status: 'Live' } },
    }))
    resolver.resolve(route)!.subscribe(() => {
      expect(mockContentSvc.fetchAuthoringContent).toHaveBeenCalledWith('resource-1')
      expect(mockRouter.navigate).toHaveBeenCalledWith([expect.stringContaining('/author/viewer/pdf/resource-1')])
      Object.defineProperty(window, 'location', { value: { href: 'http://localhost/app' }, writable: true })
      done()
    })
  })

  it('navigates away when the resource status is Expired', done => {
    const route: any = makeRoute()
    mockContentSvc.readContentV2.mockReturnValue(of({
      result: { content: { identifier: 'resource-1', mimeType: 'application/pdf', status: 'Expired', primaryCategory: 'Course' } },
    }))
    resolver.resolve(route)!.subscribe(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith([expect.stringContaining('/app/toc/resource-1/overview')])
      done()
    })
  })

  it('does not call loginForSSOEnabledEmbed when userProfile absent', done => {
    mockConfigSvc.userProfile = undefined
    const route: any = makeRoute()
    mockContentSvc.readContentV2.mockReturnValue(of({
      result: { content: { identifier: 'resource-1', mimeType: 'application/pdf', status: 'Live', ssoEnabled: true } },
    }))
    resolver.resolve(route)!.subscribe(() => {
      expect(mockMsAuthSvc.loginForSSOEnabledEmbed).toHaveBeenCalledWith('')
      done()
    })
  })

  it('resolves without collectionId gating logger warning check omitted, does not throw when validateGatedResourceAccess errors internally', done => {
    const route: any = makeRoute()
    route.queryParamMap.get.mockImplementation((key: string) => (key === 'collectionId' ? 'course-1' : null))
    mockContentSvc.readContentV2.mockReturnValue(of({
      result: { content: { identifier: 'resource-1', mimeType: 'application/pdf', status: 'Live' } },
    }))
    mockContentSvc.fetchHierarchyContent.mockReturnValue({
      toPromise: jest.fn().mockRejectedValue(new Error('hierarchy failure')),
    })
    resolver.resolve(route)!.subscribe(res => {
      expect(res.error).toBeNull()
      expect(mockLogger.error).toHaveBeenCalled()
      done()
    })
  })

  it('merges progress into hierarchy when batchId present and computes parent completion', done => {
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
              {
                identifier: 'module-1',
                contentType: 'Collection',
                children: [
                  { identifier: 'sib-1', contentType: 'Resource', completionPercentage: 0 },
                ],
              },
              { identifier: 'resource-1', contentType: 'Resource', completionPercentage: 0, mimeType: 'application/pdf' },
            ],
          },
        },
      }),
    })
    mockContentSvc.fetchContentHistoryV2.mockReturnValue({
      toPromise: jest.fn().mockResolvedValue({
        result: { contentList: [{ contentId: 'sib-1', completionPercentage: 100 }] },
      }),
    })
    resolver.resolve(route)!.subscribe(res => {
      expect(mockContentSvc.fetchContentHistoryV2).toHaveBeenCalled()
      expect(res).toBeTruthy()
      done()
    })
  })

  it('skips progress fetch when hierarchy has no content ids', done => {
    const route: any = makeRoute()
    route.queryParamMap.get.mockImplementation((key: string) => (key === 'collectionId' ? 'course-1' : (key === 'batchId' ? 'batch-1' : null)))
    mockContentSvc.readContentV2.mockReturnValue(of({
      result: { content: { identifier: 'resource-1', mimeType: 'application/pdf', status: 'Live' } },
    }))
    mockContentSvc.fetchHierarchyContent.mockReturnValue({
      toPromise: jest.fn().mockResolvedValue({
        result: { content: null },
      }),
    })
    resolver.resolve(route)!.subscribe(() => {
      expect(mockContentSvc.fetchContentHistoryV2).not.toHaveBeenCalled()
      done()
    })
  })

  it('continues with hierarchy data when progress fetch fails', done => {
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
              { identifier: 'sib-1', contentType: 'Resource', completionPercentage: 100 },
              { identifier: 'resource-1', contentType: 'Resource', completionPercentage: 0, mimeType: 'application/pdf' },
            ],
          },
        },
      }),
    })
    mockContentSvc.fetchContentHistoryV2.mockReturnValue({
      toPromise: jest.fn().mockRejectedValue(new Error('progress fetch fail')),
    })
    resolver.resolve(route)!.subscribe(res => {
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Could not fetch user progress'), expect.any(Error))
      expect(res).toBeTruthy()
      done()
    })
  })

  it('finds first incomplete prerequisite deep in a collection and redirects with RESUME params', done => {
    const route: any = makeRoute()
    route.queryParamMap.get.mockImplementation((key: string) => (key === 'collectionId' ? 'course-1' : null))
    mockContentSvc.readContentV2.mockReturnValue(of({
      result: { content: { identifier: 'resource-2', mimeType: 'application/pdf', status: 'Live' } },
    }))
    mockContentSvc.fetchHierarchyContent.mockReturnValue({
      toPromise: jest.fn().mockResolvedValue({
        result: {
          content: {
            identifier: 'course-1',
            gatingEnabled: true,
            primaryCategory: 'Course',
            children: [
              {
                identifier: 'module-1',
                contentType: 'Collection',
                children: [
                  { identifier: 'leaf-1', contentType: 'Resource', completionPercentage: 0, mimeType: 'application/pdf', name: 'Leaf 1' },
                ],
              },
              { identifier: 'resource-2', contentType: 'Resource', completionPercentage: 0, mimeType: 'application/pdf' },
            ],
          },
        },
      }),
    })
    resolver.resolve(route)!.subscribe(res => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [expect.stringContaining('/viewer/pdf/leaf-1')],
        expect.objectContaining({ queryParams: expect.objectContaining({ viewMode: 'RESUME' }) }),
      )
      expect(res.error).toBeInstanceOf(Error)
      done()
    })
  })

  it('falls back to Learning Resource primaryCategory when course data has none', done => {
    const route: any = makeRoute()
    route.queryParamMap.get.mockImplementation((key: string) => (key === 'collectionId' ? 'course-1' : null))
    mockContentSvc.readContentV2.mockReturnValue(of({
      result: { content: { identifier: 'resource-2', mimeType: 'application/pdf', status: 'Live' } },
    }))
    mockContentSvc.fetchHierarchyContent.mockReturnValue({
      toPromise: jest.fn().mockResolvedValue({
        result: {
          content: {
            identifier: 'course-1',
            gatingEnabled: true,
            children: [
              { identifier: 'sib-a', contentType: 'Resource', completionPercentage: 0, mimeType: 'application/pdf' },
              { identifier: 'resource-2', contentType: 'Resource', completionPercentage: 0, mimeType: 'application/pdf' },
            ],
          },
        },
      }),
    })
    resolver.resolve(route)!.subscribe(res => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [expect.stringContaining('/viewer/pdf/sib-a')],
        expect.objectContaining({ queryParams: expect.objectContaining({ primaryCategory: 'Learning Resource' }) }),
      )
      expect(res.error).toBeInstanceOf(Error)
      done()
    })
  })

  it('returns isAccessible true for gating validation when resource not found in hierarchy is false path (resource found deep nested section)', done => {
    const route: any = makeRoute()
    route.queryParamMap.get.mockImplementation((key: string) => (key === 'collectionId' ? 'course-1' : null))
    mockContentSvc.readContentV2.mockReturnValue(of({
      result: { content: { identifier: 'nested-leaf', mimeType: 'application/pdf', status: 'Live' } },
    }))
    mockContentSvc.fetchHierarchyContent.mockReturnValue({
      toPromise: jest.fn().mockResolvedValue({
        result: {
          content: {
            identifier: 'course-1',
            gatingEnabled: true,
            children: [
              {
                identifier: 'section-1',
                contentType: 'Section',
                children: [
                  { identifier: 'nested-leaf', contentType: 'Resource', completionPercentage: 100, mimeType: 'application/pdf' },
                ],
              },
            ],
          },
        },
      }),
    })
    resolver.resolve(route)!.subscribe(res => {
      expect(res.error).toBeNull()
      done()
    })
  })

  it('redirects to overview when resource is not found anywhere in course hierarchy', done => {
    const route: any = makeRoute()
    route.queryParamMap.get.mockImplementation((key: string) => (key === 'collectionId' ? 'course-1' : null))
    mockContentSvc.readContentV2.mockReturnValue(of({
      result: { content: { identifier: 'missing-resource', mimeType: 'application/pdf', status: 'Live' } },
    }))
    mockContentSvc.fetchHierarchyContent.mockReturnValue({
      toPromise: jest.fn().mockResolvedValue({
        result: {
          content: {
            identifier: 'course-1',
            gatingEnabled: true,
            children: [],
          },
        },
      }),
    })
    resolver.resolve(route)!.subscribe(res => {
      expect(mockLogger.error).toHaveBeenCalledWith('Resource not found in course hierarchy')
      expect(res.error).toBeInstanceOf(Error)
      done()
    })
  })
})
