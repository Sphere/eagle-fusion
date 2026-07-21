jest.mock('@ws-widget/collection', () => ({
  WidgetContentService: class { },
  NsDiscussionForum: {
    EDiscussionType: { LEARNING: 'learning' },
  },
  NsContent: {},
}))
jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class { },
  ValueService: class { },
}))

import { YoutubeComponent } from './youtube.component'
import { NsDiscussionForum } from '@ws-widget/collection'
import { Subject, of } from 'rxjs'

describe('YoutubeComponent', () => {
  let component: YoutubeComponent
  let mockActivatedRoute: any
  let mockValueSvc: any
  let mockContentSvc: any
  let mockPlatform: any
  let mockDataSvc: any
  let mockConfigSvc: any
  let routeDataSubject: Subject<any>
  let fsSubject: Subject<any>

  const baseContent = {
    identifier: 'yt-1',
    name: 'Youtube Video',
    description: 'desc',
    artifactUrl: 'http://example.com/video.mp4',
    duration: 100,
  }

  beforeEach(() => {
    routeDataSubject = new Subject()
    fsSubject = new Subject()
    mockActivatedRoute = {
      snapshot: {
        queryParamMap: { get: jest.fn().mockReturnValue('batch-1') },
        data: routeDataSubject.asObservable(),
      },
      data: routeDataSubject.asObservable(),
    }
    mockValueSvc = { isXSmall$: of(false) }
    mockContentSvc = {
      setS3Cookie: jest.fn().mockReturnValue({ toPromise: () => Promise.resolve({}) }),
      fetchContentHistoryV2: jest.fn(),
    }
    mockPlatform = { ANDROID: false }
    mockDataSvc = { getFullScreenStatus: fsSubject.asObservable() }
    mockConfigSvc = { userProfile: { userId: 'user-1' } }

    component = new YoutubeComponent(
      mockActivatedRoute,
      mockValueSvc,
      mockContentSvc,
      mockPlatform,
      mockDataSvc,
      mockConfigSvc,
    )
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('subscribes to fullscreen status and screen size', () => {
      component.ngOnInit()
      fsSubject.next(true)
      expect(component.fs).toBe(true)
      expect(component.isScreenSizeSmall).toBe(false)
    })

    it('builds widgetResolverYoutubeData from route data content', async () => {
      component.ngOnInit()
      routeDataSubject.next({ content: { data: { ...baseContent } } })
      await Promise.resolve()
      expect(component.widgetResolverYoutubeData?.widgetData.url).toBe(baseContent.artifactUrl)
      expect(component.widgetResolverYoutubeData?.widgetData.identifier).toBe('yt-1')
      expect(component.widgetResolverYoutubeData?.widgetData.isVideojs).toBe(false)
      expect(component.discussionForumWidget).toBeTruthy()
      expect(component.isFetchingDataComplete).toBe(true)
    })

    it('disables telemetry when forPreview is true', async () => {
      component.forPreview = true
      component.ngOnInit()
      routeDataSubject.next({ content: { data: { ...baseContent } } })
      await Promise.resolve()
      expect(component.widgetResolverYoutubeData?.widgetData.disableTelemetry).toBe(true)
    })

    it('calls setS3Cookie when artifactUrl contains content-store', async () => {
      component.ngOnInit()
      routeDataSubject.next({
        content: { data: { ...baseContent, artifactUrl: 'http://example.com/content-store/video.mp4' } },
      })
      await Promise.resolve()
      expect(mockContentSvc.setS3Cookie).toHaveBeenCalledWith('yt-1')
    })

    it('handles null youtubeData gracefully', async () => {
      component.ngOnInit()
      routeDataSubject.next({ content: { data: null } })
      await Promise.resolve()
      expect(component.widgetResolverYoutubeData?.widgetData.url).toBe('')
      expect(component.widgetResolverYoutubeData?.widgetData.identifier).toBe('')
      expect(component.isFetchingDataComplete).toBe(true)
    })
  })

  describe('ngOnDestroy', () => {
    it('unsubscribes all active subscriptions', () => {
      component.ngOnInit()
      const routeSub = (component as any).routeDataSubscription
      const screenSub = (component as any).screenSizeSubscription
      const routeSpy = jest.spyOn(routeSub, 'unsubscribe')
      const screenSpy = jest.spyOn(screenSub, 'unsubscribe')
      component.ngOnDestroy()
      expect(routeSpy).toHaveBeenCalled()
      expect(screenSpy).toHaveBeenCalled()
    })

    it('does not throw when subscriptions are null', () => {
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('fetchContinueLearning', () => {
    it('resolves true and sets resumePoint when contentList matches', async () => {
      component.widgetResolverYoutubeData = {
        widgetType: 'player',
        widgetSubType: 'playerYoutube',
        widgetData: { disableTelemetry: false, url: '', identifier: '' },
      } as any
      mockContentSvc.fetchContentHistoryV2.mockImplementation((_req: any, cb?: any) => ({
        subscribe: (onNext: any) => {
          onNext({
            result: {
              contentList: [
                {
                  contentId: 'video-1',
                  progressdetails: { current: ['5'], max_size: 10 },
                },
              ],
            },
          })
        },
      }))
      const result = await component.fetchContinueLearning('coll-1', 'video-1')
      expect(result).toBe(true)
      expect((component.widgetResolverYoutubeData as any).widgetData.resumePoint).toBe(5)
      expect((component.widgetResolverYoutubeData as any).widgetData.size).toBe(10)
    })

    it('resolves true on error callback', async () => {
      mockContentSvc.fetchContentHistoryV2.mockReturnValue({
        subscribe: (_onNext: any, onError: any) => {
          onError('error')
        },
      })
      const result = await component.fetchContinueLearning('coll-1', 'video-1')
      expect(result).toBe(true)
    })

    it('resolves true when contentList is empty', async () => {
      mockContentSvc.fetchContentHistoryV2.mockReturnValue({
        subscribe: (onNext: any) => {
          onNext({ result: { contentList: [] } })
        },
      })
      const result = await component.fetchContinueLearning('coll-1', 'video-1')
      expect(result).toBe(true)
    })

    it('uses empty userId when userProfile is missing', async () => {
      mockConfigSvc.userProfile = null
      mockContentSvc.fetchContentHistoryV2.mockImplementation((req: any) => {
        expect(req.request.userId).toBeUndefined()
        return { subscribe: (onNext: any) => onNext({ result: { contentList: [] } }) }
      })
      await component.fetchContinueLearning('coll-1', 'video-1')
      expect(mockContentSvc.fetchContentHistoryV2).toHaveBeenCalled()
    })
  })

  describe('getResumePoint', () => {
    it('returns computed progress point when progress supported', () => {
      const content = { duration: 100, progress: { progressSupported: true, progress: 0.5 } } as any
      expect(component.getResumePoint(content)).toBe(50)
    })

    it('returns 0 when progress not supported', () => {
      const content = { duration: 100, progress: { progressSupported: false, progress: 0.5 } } as any
      expect(component.getResumePoint(content)).toBe(0)
    })

    it('returns 0 when content is null', () => {
      expect(component.getResumePoint(null)).toBe(0)
    })
  })

  describe('initWidgetResolverYoutubeData', () => {
    it('returns default widget resolver config', () => {
      const result = component.initWidgetResolverYoutubeData()
      expect(result).toEqual({
        widgetType: 'player',
        widgetSubType: 'playerYoutube',
        widgetData: { disableTelemetry: false, url: '', identifier: '' },
        widgetHostClass: 'video-full',
      })
    })
  })

  describe('formDiscussionForumWidget', () => {
    it('builds discussion forum widget config from content', () => {
      component.formDiscussionForumWidget(baseContent as any)
      expect(component.discussionForumWidget).toEqual({
        widgetData: {
          description: 'desc',
          id: 'yt-1',
          name: NsDiscussionForum.EDiscussionType.LEARNING,
          title: 'Youtube Video',
          initialPostCount: 2,
          isDisabled: component.forPreview,
        },
        widgetSubType: 'discussionForum',
        widgetType: 'discussionForum',
      })
    })
  })
})
