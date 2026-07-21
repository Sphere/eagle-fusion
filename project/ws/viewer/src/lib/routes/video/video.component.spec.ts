jest.mock('@ws/author', () => ({
  AccessControlService: class {},
}))
jest.mock('@ws-widget/collection', () => ({
  NsContent: {},
  NsDiscussionForum: { EDiscussionType: { LEARNING: 'learning' } },
}))
jest.mock('@ws-widget/resolver', () => ({
  NsWidgetResolver: {},
}))
jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class {},
  LoggerService: class { log = jest.fn() },
  ValueService: class {},
}))
jest.mock('../../../../../../../src/app/constants/apiConstants', () => ({
  API_END_POINTS: {
    AUTH_CONTENT: jest.fn().mockImplementation((path: string) => `/auth-content/${path}`),
  },
}))

import { of, Subject } from 'rxjs'
import { VideoComponent } from './video.component'
import { API_END_POINTS } from '../../../../../../../src/app/constants/apiConstants'

describe('VideoComponent (routes)', () => {
  let component: VideoComponent
  let mockActivatedRoute: any
  let mockValueSvc: any
  let mockViewerSvc: any
  let mockContentSvc: any
  let mockPlatform: any
  let mockAccessControlSvc: any
  let mockConfigSvc: any
  let mockLogger: any
  let mockCdr: any
  let routeDataSubject: Subject<any>
  let contentHistorySubject: Subject<any>
  let queryParamMapStore: Record<string, string>

  const buildComponent = () => {
    routeDataSubject = new Subject()
    contentHistorySubject = new Subject()
    queryParamMapStore = {}
    mockActivatedRoute = {
      snapshot: {
        queryParams: {},
        queryParamMap: { get: jest.fn((key: string) => queryParamMapStore[key] || null) },
        paramMap: { get: jest.fn().mockReturnValue('res-1') },
      },
      data: routeDataSubject.asObservable(),
    }
    mockValueSvc = { isXSmall$: of(false) }
    mockViewerSvc = {
      getContent: jest.fn().mockReturnValue(of({ identifier: 'vid-1', artifactUrl: 'https://x/y/video.mp4', mimeType: 'video/mp4' })),
      initUpdate: jest.fn().mockReturnValue(of({ result: {} })),
      getAuthoringUrl: jest.fn().mockReturnValue('author-url'),
    }
    mockContentSvc = {
      fetchContentHistoryV2: jest.fn().mockReturnValue(contentHistorySubject.asObservable()),
      changeMessage: jest.fn(),
      setS3Cookie: jest.fn().mockReturnValue({ toPromise: jest.fn().mockResolvedValue({}) }),
    }
    mockPlatform = { IOS: false, WEBKIT: true, SAFARI: true, ANDROID: false }
    mockAccessControlSvc = { authoringConfig: { newDesign: false } }
    mockConfigSvc = { userProfile: { userId: 'user-1' } }
    mockLogger = { log: jest.fn() }
    mockCdr = { detectChanges: jest.fn() }
    return new VideoComponent(
      mockActivatedRoute,
      mockValueSvc,
      mockViewerSvc,
      mockContentSvc,
      mockPlatform,
      mockAccessControlSvc,
      mockConfigSvc,
      mockLogger,
      mockCdr,
    )
  }

  beforeEach(() => {
    component = buildComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should subscribe to screen size and set isScreenSizeSmall', () => {
    component = buildComponent()
    mockValueSvc.isXSmall$ = of(true)
    component.ngOnInit()
    expect(component.isScreenSizeSmall).toBe(true)
  })

  it('should set isNotEmbed false when embed query param is true', () => {
    queryParamMapStore.embed = 'true'
    component.ngOnInit()
    expect(component.isNotEmbed).toBe(false)
  })

  it('should use preview branch (getContent) when preview param set and newDesign is false', () => {
    queryParamMapStore.preview = 'true'
    component.ngOnInit()
    expect(mockViewerSvc.getContent).toHaveBeenCalledWith('res-1')
    expect(component.videoData).toEqual({ identifier: 'vid-1', artifactUrl: 'https://x/y/video.mp4', mimeType: 'video/mp4' })
    expect(component.isFetchingDataComplete).toBe(true)
    expect(component.widgetResolverVideoData!.widgetData.url).toBe(API_END_POINTS.AUTH_CONTENT(encodeURIComponent('https://x/y/video.mp4')))
  })

  it('should build content-store auth url in preview branch when artifactUrl has content-store', () => {
    mockViewerSvc.getContent.mockReturnValue(
      of({ identifier: 'vid-1', artifactUrl: 'https://x/content-store/video.mp4', mimeType: 'video/mp4' }),
    )
    queryParamMapStore.preview = 'true'
    component.ngOnInit()
    expect(component.widgetResolverVideoData!.widgetData.url).toContain('/auth-content/')
  })

  it('should not use preview branch when accessControlSvc newDesign is true', () => {
    mockAccessControlSvc.authoringConfig.newDesign = true
    queryParamMapStore.preview = 'true'
    component.ngOnInit()
    expect(mockViewerSvc.getContent).not.toHaveBeenCalled()
  })

  it('should process route data branch and fetch continue learning when collectionId present', async () => {
    mockActivatedRoute.snapshot.queryParams.collectionId = 'coll-1'
    component.ngOnInit()
    routeDataSubject.next({
      content: {
        data: {
          identifier: 'vid-1',
          artifactUrl: 'https://x/y/video.mp4',
          mimeType: 'video/mp4',
          description: 'desc',
          name: 'Video 1',
          duration: 100,
        },
      },
    })
    await Promise.resolve()
    contentHistorySubject.next({ result: { contentList: [] } })
    await Promise.resolve()
    await Promise.resolve()
    expect(component.videoData).toBeTruthy()
    expect(component.discussionForumWidget!.widgetData.id).toBe('vid-1')
    expect(component.isFetchingDataComplete).toBe(true)
    expect(mockCdr.detectChanges).toHaveBeenCalled()
  })

  it('should fall back to identifier as collectionId when no collectionId query param', async () => {
    component.ngOnInit()
    routeDataSubject.next({
      content: {
        data: { identifier: 'vid-1', artifactUrl: 'https://x/y/video.mp4', mimeType: 'video/mp4', duration: 10 },
      },
    })
    await Promise.resolve()
    contentHistorySubject.next({ result: { contentList: [] } })
    await Promise.resolve()
    await Promise.resolve()
    expect(component.isFetchingDataComplete).toBe(true)
  })

  it('should call setS3Cookie when artifactUrl has content-store in route data branch', async () => {
    component.ngOnInit()
    routeDataSubject.next({
      content: {
        data: { identifier: 'vid-1', artifactUrl: 'https://x/content-store/video.mp4', mimeType: 'video/mp4', duration: 10 },
      },
    })
    await Promise.resolve()
    contentHistorySubject.next({ result: { contentList: [] } })
    await Promise.resolve()
    await Promise.resolve()
    expect(mockContentSvc.setS3Cookie).toHaveBeenCalledWith('vid-1')
  })

  it('should use authoring url when forPreview is true in route data branch', async () => {
    ;(component as any).forPreview = true
    component.ngOnInit()
    routeDataSubject.next({
      content: {
        data: { identifier: 'vid-1', artifactUrl: 'https://x/y/video.mp4', mimeType: 'video/mp4', duration: 10 },
      },
    })
    await Promise.resolve()
    contentHistorySubject.next({ result: { contentList: [] } })
    await Promise.resolve()
    await Promise.resolve()
    expect(mockViewerSvc.getAuthoringUrl).toHaveBeenCalledWith('https://x/y/video.mp4')
  })

  it('should compute resumePoint from progress when contentList empty', async () => {
    component.ngOnInit()
    routeDataSubject.next({
      content: {
        data: {
          identifier: 'vid-1',
          artifactUrl: 'https://x/y/video.mp4',
          mimeType: 'video/mp4',
          duration: 100,
          progress: { progressSupported: true, progress: 0.5 },
        },
      },
    })
    await Promise.resolve()
    contentHistorySubject.next({ result: { contentList: [] } })
    await Promise.resolve()
    await Promise.resolve()
    expect(component.widgetResolverVideoData!.widgetData.resumePoint).toBe(50)
  })

  it('should use resumePoint from fetchContentHistoryV2 progressdetails when present', async () => {
    component.ngOnInit()
    routeDataSubject.next({
      content: {
        data: { identifier: 'vid-1', artifactUrl: 'https://x/y/video.mp4', mimeType: 'video/mp4', duration: 100 },
      },
    })
    await Promise.resolve()
    contentHistorySubject.next({
      result: {
        contentList: [
          { contentId: 'vid-1', progressdetails: { current: ['42'] }, completionPercentage: 20, status: 2 },
        ],
      },
    })
    await Promise.resolve()
    await Promise.resolve()
    expect(component.widgetResolverVideoData!.widgetData.resumePoint).toBe(42)
  })

  it('getResumePoint should return 0 when content is null', () => {
    expect(component.getResumePoint(null)).toBe(0)
  })

  it('getResumePoint should return 0 when progress not supported', () => {
    expect(component.getResumePoint({ progress: { progressSupported: false } } as any)).toBe(0)
  })

  it('initWidgetResolverVideoData should set isVideojs true for IOS', () => {
    mockPlatform.IOS = true
    const result = component.initWidgetResolverVideoData({ mimeType: 'video/mp4' } as any)
    expect(result.widgetData.isVideojs).toBe(true)
  })

  it('initWidgetResolverVideoData should set isVideojs true for ANDROID', () => {
    mockPlatform.IOS = false
    mockPlatform.WEBKIT = true
    mockPlatform.SAFARI = true
    mockPlatform.ANDROID = true
    const result = component.initWidgetResolverVideoData({ mimeType: 'video/mp4' } as any)
    expect(result.widgetData.isVideojs).toBe(true)
  })

  it('initWidgetResolverVideoData should set isVideojs false for desktop safari webkit', () => {
    mockPlatform.IOS = false
    mockPlatform.WEBKIT = true
    mockPlatform.SAFARI = true
    mockPlatform.ANDROID = false
    const result = component.initWidgetResolverVideoData({ mimeType: 'video/mp4' } as any)
    expect(result.widgetData.isVideojs).toBe(false)
  })

  it('formDiscussionForumWidget should build widget data from content', () => {
    component.formDiscussionForumWidget({ description: 'd', identifier: 'id1', name: 'n1' } as any)
    expect(component.discussionForumWidget!.widgetData.description).toBe('d')
    expect(component.discussionForumWidget!.widgetData.id).toBe('id1')
  })

  it('fetchContinueLearning should resolve true even on error', async () => {
    mockContentSvc.fetchContentHistoryV2.mockReturnValue({
      subscribe: (_next: any, error: any) => error(),
    })
    const result = await component.fetchContinueLearning('coll-1', 'vid-1')
    expect(result).toBe(true)
  })

  it('ngOnDestroy should unsubscribe all active subscriptions without throwing', () => {
    component.ngOnInit()
    expect(() => component.ngOnDestroy()).not.toThrow()
  })
})
