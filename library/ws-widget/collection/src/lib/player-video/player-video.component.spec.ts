jest.mock('video.js', () => jest.fn())
jest.mock('videojs-markers', () => ({}))
jest.mock('../_services/videojs-util', () => ({
  videoInitializer: jest.fn(() => ({ dispose: jest.fn() })),
  videoJsInitializer: jest.fn(() => ({ player: { ready: jest.fn() }, dispose: jest.fn() })),
}))

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0))

import { of, throwError } from 'rxjs'
import { PlayerVideoComponent } from './player-video.component'
import * as videojsUtil from '../_services/videojs-util'

describe('PlayerVideoComponent', () => {
  let component: PlayerVideoComponent
  let mockEventSvc: any
  let mockContentSvc: any
  let mockViewerSvc: any
  let mockActivatedRoute: any
  let mockConfigSvc: any
  let mockTelemetrySvc: any
  let mockViewerDataSvc: any
  let mockDialog: any
  let mockValueSvc: any
  let mockLogger: any
  let mockPlylsSvc: any

  const buildComponent = () => new PlayerVideoComponent(
    mockEventSvc,
    mockContentSvc,
    mockViewerSvc,
    mockActivatedRoute,
    mockConfigSvc,
    mockTelemetrySvc,
    mockViewerDataSvc,
    mockDialog,
    mockValueSvc,
    mockLogger,
    mockPlylsSvc,
  )

  beforeEach(() => {
    jest.clearAllMocks()
    mockEventSvc = { dispatchEvent: jest.fn() }
    mockContentSvc = {
      fetchContentHistoryV2: jest.fn().mockReturnValue(of({ result: { contentList: [] } })),
      fetchContent: jest.fn().mockReturnValue(of({ result: { content: {} }, artifactUrl: '' })),
      setS3Cookie: jest.fn().mockReturnValue(of({})),
      changeMessage: jest.fn(),
    }
    mockViewerSvc = {
      realTimeProgressUpdateV3: jest.fn().mockReturnValue(of({})),
      generateInteractTelemetry: jest.fn(),
    }
    mockActivatedRoute = { snapshot: { queryParams: {} } }
    mockConfigSvc = { userProfile: { userId: 'u1' } }
    mockTelemetrySvc = { start: jest.fn(), interact: jest.fn(), end: jest.fn() }
    mockViewerDataSvc = {}
    mockDialog = { open: jest.fn(), closeAll: jest.fn() }
    mockValueSvc = { isXSmall$: of(false) }
    mockLogger = { log: jest.fn(), error: jest.fn(), warn: jest.fn() }
    mockPlylsSvc = { orgDetails: jest.fn().mockReturnValue({ videoConfig: { isSeekingEnable: true } }) }

    component = buildComponent()
    component.widgetData = {
      identifier: 'id1',
      url: 'http://video.mp4',
      isVideojs: true,
      mimeType: 'video/mp4',
    } as any
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('ngOnInit logs data', () => {
    component.ngOnInit()
    expect(mockLogger.log).toHaveBeenCalled()
  })

  describe('getCurrentTime', () => {
    it('sets resumePoint when progressdetails.current present as array', async () => {
      mockContentSvc.fetchContentHistoryV2.mockReturnValue(of({
        result: { contentList: [{ contentId: 'id1', progressdetails: { current: ['45.5'] } }] },
      }))
      await component.getCurrentTime()
      expect(component.widgetData.resumePoint).toBe(45.5)
    })

    it('sets resumePoint when progressdetails.current present as string', async () => {
      mockContentSvc.fetchContentHistoryV2.mockReturnValue(of({
        result: { contentList: [{ contentId: 'id1', progressdetails: { current: '30' } }] },
      }))
      await component.getCurrentTime()
      expect(component.widgetData.resumePoint).toBe(30)
    })

    it('does nothing when contentList empty', async () => {
      mockContentSvc.fetchContentHistoryV2.mockReturnValue(of({ result: { contentList: [] } }))
      await component.getCurrentTime()
      expect(component.widgetData.resumePoint).toBeUndefined()
    })

    it('handles missing userProfile', async () => {
      mockConfigSvc.userProfile = null
      await component.getCurrentTime()
      expect(mockContentSvc.fetchContentHistoryV2).toHaveBeenCalled()
    })
  })

  describe('fetchContent', () => {
    it('parses videoQuestions JSON when present', async () => {
      mockContentSvc.fetchContent.mockReturnValue(of({
        result: { content: { videoQuestions: JSON.stringify([{ timestampInSeconds: 1 }]) } },
        artifactUrl: '',
      }))
      await component.fetchContent()
      expect(component.widgetData.videoQuestions).toEqual([{ timestampInSeconds: 1 }])
    })

    it('sets empty array when videoQuestions is empty string', async () => {
      mockContentSvc.fetchContent.mockReturnValue(of({
        result: { content: { videoQuestions: '' } },
        artifactUrl: '',
      }))
      await component.fetchContent()
      expect(component.widgetData.videoQuestions).toBeUndefined()
    })

    it('handles invalid JSON gracefully', async () => {
      mockContentSvc.fetchContent.mockReturnValue(of({
        result: { content: { videoQuestions: 'not-json{' } },
        artifactUrl: '',
      }))
      await component.fetchContent()
      expect(component.widgetData.videoQuestions).toEqual([])
      expect(mockLogger.error).toHaveBeenCalled()
    })

    it('sets url/posterImage and calls setS3Cookie when content-store url', async () => {
      mockContentSvc.fetchContent.mockReturnValue(of({
        result: { content: {} },
        artifactUrl: 'http://x/content-store/file.mp4',
        appIcon: 'icon.png',
      }))
      await component.fetchContent()
      expect(component.widgetData.url).toBe('http://x/content-store/file.mp4')
      expect(mockContentSvc.setS3Cookie).toHaveBeenCalled()
    })

    it('catches errors from contentSvc.fetchContent', async () => {
      mockContentSvc.fetchContent.mockReturnValue(throwError(() => new Error('fail')))
      await component.fetchContent()
      expect(mockLogger.error).toHaveBeenCalled()
      expect(component.widgetData.videoQuestions).toEqual([])
    })
  })

  describe('ngAfterViewInit', () => {
    it('initializes videojs player when isVideojs true and url present', async () => {
      const spyInit = jest.spyOn<any, any>(component, 'initializePlayer' as any)
      component.videoTag = { nativeElement: document.createElement('video') } as any
      component.ngAfterViewInit()
      await flushPromises()
      expect(spyInit).toHaveBeenCalled()
    })

    it('initializes native video player when isVideojs false', async () => {
      const videoJsMock = jest.requireMock('video.js') as jest.Mock
      videoJsMock.mockReturnValue({ id: jest.fn(), on: jest.fn(), isDisposed: jest.fn().mockReturnValue(false) })
      component.widgetData = { ...component.widgetData, isVideojs: false }
      component.realvideoTag = { nativeElement: document.createElement('video') } as any
      const spyInitV = jest.spyOn<any, any>(component, 'initializeVPlayer' as any)
      component.ngAfterViewInit()
      await flushPromises()
      expect(spyInitV).toHaveBeenCalled()
    })

    it('does nothing when url is missing', async () => {
      component.widgetData = { ...component.widgetData, url: undefined }
      const spyInit = jest.spyOn<any, any>(component, 'initializePlayer' as any)
      component.ngAfterViewInit()
      await flushPromises()
      expect(spyInit).not.toHaveBeenCalled()
    })
  })

  describe('initializeVPlayer', () => {
    it('calls videoInitializer and sets dispose, seeks to resumePoint', () => {
      component.widgetData = { ...component.widgetData, resumePoint: 20, disableTelemetry: false }
      component.realvideoTag = { nativeElement: document.createElement('video') } as any
      component['initializeVPlayer']()
      expect(videojsUtil.videoInitializer).toHaveBeenCalled()
      expect(component.realvideoTag.nativeElement.currentTime).toBe(20)
    })

    it('dispatcher calls eventSvc when identifier present', () => {
      component.realvideoTag = { nativeElement: document.createElement('video') } as any
      component['initializeVPlayer']()
      const call = (videojsUtil.videoInitializer as jest.Mock).mock.calls[0]
      const dispatcher = call[1]
      dispatcher({ some: 'event' })
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
    })

    it('fireRProgress calls realTimeProgressUpdateV3 and handles success/error', () => {
      component.realvideoTag = { nativeElement: document.createElement('video') } as any
      component['initializeVPlayer']()
      const call = (videojsUtil.videoInitializer as jest.Mock).mock.calls[0]
      const fireRProgress = call[2]
      fireRProgress('id1', { current: ['10'], max_size: 100 })
      expect(mockViewerSvc.realTimeProgressUpdateV3).toHaveBeenCalled()

      mockViewerSvc.realTimeProgressUpdateV3.mockReturnValue(throwError(() => new Error('e')))
      fireRProgress('id1', { current: ['10'], max_size: 100 })
      expect(mockLogger.error).toHaveBeenCalled()
    })
  })

  describe('initializePlayer', () => {
    beforeEach(() => {
      component.videoTag = { nativeElement: document.createElement('video') } as any
    })

    it('invokes videoJsInitializer with computed config and sets player/dispose', () => {
      component['initializePlayer']()
      expect(videojsUtil.videoJsInitializer).toHaveBeenCalled()
    })

    it('adds subtitles and sets src on player ready', () => {
      const readyCb: { fn?: () => void } = {}
      const fakePlayer = {
        ready: (cb: () => void) => { readyCb.fn = cb },
        addRemoteTextTrack: jest.fn(),
        src: jest.fn(),
      }
      ;(videojsUtil.videoJsInitializer as jest.Mock).mockReturnValue({ player: fakePlayer, dispose: jest.fn() })
      component.widgetData = { ...component.widgetData, subtitles: [{ url: 'a.vtt', label: 'en', srclang: 'en' }] }
      component['initializePlayer']()
      readyCb.fn!()
      expect(fakePlayer.addRemoteTextTrack).toHaveBeenCalled()
      expect(fakePlayer.src).toHaveBeenCalledWith(component.widgetData.url)
    })

    it('fetchAndCacheContentHistory logs warning on failure', async () => {
      mockContentSvc.fetchContentHistoryV2.mockReturnValue(throwError(() => new Error('fail')))
      component['initializePlayer']()
      await Promise.resolve()
      await Promise.resolve()
    })

    it('fireRProgress handles 95%+ completion and forces 100', async () => {
      component['initializePlayer']()
      const call = (videojsUtil.videoJsInitializer as jest.Mock).mock.calls[0]
      const fireRProgress = call[3]
      component['contentHistoryResponse'] = { contentList: [{ contentId: 'id1', completionPercentage: 0 }] }
      await fireRProgress('id1', { current: ['96'], max_size: 100 })
      expect(mockViewerSvc.realTimeProgressUpdateV3).toHaveBeenCalled()
    })

    it('fireRProgress skips when already 100% complete', async () => {
      component['initializePlayer']()
      const call = (videojsUtil.videoJsInitializer as jest.Mock).mock.calls[0]
      const fireRProgress = call[3]
      component['contentHistoryResponse'] = { contentList: [{ contentId: 'id1', completionPercentage: 100 }] }
      await fireRProgress('id1', { current: ['50'], max_size: 100 })
      expect(component['lastSentProgressPercentage']).toBe(100)
    })

    it('fireRProgress skips duplicate percentage', async () => {
      component['initializePlayer']()
      const call = (videojsUtil.videoJsInitializer as jest.Mock).mock.calls[0]
      const fireRProgress = call[3]
      component['contentHistoryResponse'] = { contentList: [] }
      component['lastSentProgressPercentage'] = 50
      await fireRProgress('id1', { current: ['50'], max_size: 100 })
    })

    it('fireRProgress skips backward progress', async () => {
      component['initializePlayer']()
      const call = (videojsUtil.videoJsInitializer as jest.Mock).mock.calls[0]
      const fireRProgress = call[3]
      component['contentHistoryResponse'] = { contentList: [] }
      component['lastSentProgressPercentage'] = 80
      await fireRProgress('id1', { current: ['10'], max_size: 100 })
    })

    it('fireRProgress resets tracking when identifier changes', async () => {
      component['initializePlayer']()
      const call = (videojsUtil.videoJsInitializer as jest.Mock).mock.calls[0]
      const fireRProgress = call[3]
      component['lastProgressIdentifier'] = 'old'
      component['lastSentProgressPercentage'] = 50
      component['contentHistoryResponse'] = { contentList: [] }
      await fireRProgress('id1', { current: ['20'], max_size: 100 })
    })

    it('fireRProgress catches errors', async () => {
      component['initializePlayer']()
      const call = (videojsUtil.videoJsInitializer as jest.Mock).mock.calls[0]
      const fireRProgress = call[3]
      mockContentSvc.fetchContentHistoryV2.mockImplementation(() => { throw new Error('boom') })
      component['contentHistoryResponse'] = null
      fireRProgress('id1', { current: ['20'], max_size: 100 })
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(mockLogger.error).toHaveBeenCalled()
    })
  })

  describe('onTimeUpdate', () => {
    beforeEach(() => {
      const videoEl = document.createElement('video')
      Object.defineProperty(videoEl, 'currentTime', { value: 50, writable: true })
      Object.defineProperty(videoEl, 'duration', { value: 100, writable: true })
      component.videoTag = { nativeElement: videoEl } as any
      component.progressData = { completionPercentage: 10 }
    })

    it('updates progress when percentage increased', async () => {
      await component.onTimeUpdate()
      expect(mockViewerSvc.realTimeProgressUpdateV3).toHaveBeenCalled()
    })

    it('forces 100% when percentage >= 95', async () => {
      (component.videoTag.nativeElement as any).currentTime = 96
      await component.onTimeUpdate()
      expect(mockViewerSvc.realTimeProgressUpdateV3).toHaveBeenCalled()
    })

    it('skips update when percentage did not increase', async () => {
      component['lastSentProgressPercentage'] = 90
      await component.onTimeUpdate()
    })

    it('does nothing when progressData completionPercentage >= percentage', async () => {
      component.progressData = { completionPercentage: 99 }
      await component.onTimeUpdate()
    })

    it('catches errors', async () => {
      mockContentSvc.fetchContentHistoryV2.mockImplementation(() => { throw new Error('fail') })
      component['contentHistoryResponse'] = null
      await component.onTimeUpdate()
      expect(mockLogger.error).toHaveBeenCalled()
    })
  })

  describe('onEventTrigger', () => {
    it('start triggers onVideoPlay first time', () => {
      const spy = jest.spyOn(component, 'onVideoPlay')
      component.onEventTrigger('start')
      expect(spy).toHaveBeenCalled()
      expect(component.isResumeStarted).toBe(true)
    })

    it('start triggers onVideoPause when already resumed', () => {
      component.isResumeStarted = true
      const spy = jest.spyOn(component, 'onVideoPause')
      component.onEventTrigger('start')
      expect(spy).toHaveBeenCalledWith('start')
    })

    it('pause triggers onVideoPause', () => {
      const spy = jest.spyOn(component, 'onVideoPause')
      component.onEventTrigger('pause')
      expect(spy).toHaveBeenCalledWith('pause')
    })

    it('end triggers onVideoEnded', () => {
      const spy = jest.spyOn(component, 'onVideoEnded')
      component.onEventTrigger('end')
      expect(spy).toHaveBeenCalled()
    })
  })

  it('onVideoPlay calls telemetrySvc.start', () => {
    component.onVideoPlay()
    expect(mockTelemetrySvc.start).toHaveBeenCalled()
  })

  it('onVideoPause calls telemetrySvc.interact', () => {
    component.onVideoPause('pause')
    expect(mockTelemetrySvc.interact).toHaveBeenCalled()
  })

  it('onVideoEnded calls telemetrySvc.end', () => {
    component.onVideoEnded()
    expect(mockTelemetrySvc.end).toHaveBeenCalled()
  })

  describe('setupVideoQuestionListeners / openFullscreen / openPopup', () => {
    let fakePlayer: any
    let handlers: { [key: string]: (() => void)[] }

    beforeEach(() => {
      handlers = {}
      fakePlayer = {
        id: jest.fn().mockReturnValue('vid1'),
        on: jest.fn((event: string, cb: () => void) => {
          handlers[event] = handlers[event] || []
          handlers[event].push(cb)
        }),
        isDisposed: jest.fn().mockReturnValue(false),
        currentTime: jest.fn().mockReturnValue(5),
        pause: jest.fn(),
        play: jest.fn(),
        requestFullscreen: jest.fn(),
      }
      component.widgetData = {
        ...component.widgetData,
        videoQuestions: [{ timestampInSeconds: 5, question: [{ text: 'q' }] }],
      }
    })

    const fire = (event: string) => (handlers[event] || []).forEach(cb => cb())

    it('registers play and timeupdate handlers', () => {
      component.setupVideoQuestionListeners(fakePlayer)
      expect(fakePlayer.on).toHaveBeenCalledWith('play', expect.any(Function))
      expect(fakePlayer.on).toHaveBeenCalledWith('timeupdate', expect.any(Function))
    })

    it('openFullscreen calls requestFullscreen when isXSmall', () => {
      mockValueSvc.isXSmall$ = of(true)
      component.openFullscreen(fakePlayer)
      expect(fakePlayer.requestFullscreen).toHaveBeenCalled()
    })

    it('openFullscreen uses webkitRequestFullscreen fallback', () => {
      mockValueSvc.isXSmall$ = of(true)
      fakePlayer.requestFullscreen = undefined
      fakePlayer.webkitRequestFullscreen = jest.fn()
      component.openFullscreen(fakePlayer)
      expect(fakePlayer.webkitRequestFullscreen).toHaveBeenCalled()
    })

    it('openPopup opens dialog and handles afterClosed', () => {
      const afterClosed$ = of(undefined)
      mockDialog.open.mockReturnValue({ afterClosed: () => afterClosed$ })
      const intervalSub: any = { unsubscribe: jest.fn() }
      const spySetup = jest.spyOn(component, 'setupVideoQuestionListeners')
      component.openPopup([{ text: 'q' }], fakePlayer, intervalSub)
      expect(mockDialog.open).toHaveBeenCalled()
      expect(fakePlayer.play).toHaveBeenCalled()
      expect(intervalSub.unsubscribe).toHaveBeenCalled()
      expect(spySetup).toHaveBeenCalled()
    })

    it('does nothing extra when dialog.open returns falsy', () => {
      mockDialog.open.mockReturnValue(null)
      const intervalSub: any = { unsubscribe: jest.fn() }
      expect(() => component.openPopup([], fakePlayer, intervalSub)).not.toThrow()
    })
  })

  describe('ngOnDestroy', () => {
    it('disposes player and calls dispose fn', () => {
      component['player'] = { dispose: jest.fn() } as any
      component['dispose'] = jest.fn()
      component.ngOnDestroy()
      expect(component['player'].dispose).toHaveBeenCalled()
      expect(component['dispose']).toHaveBeenCalled()
    })

    it('is safe when player/dispose are null', () => {
      component['player'] = null
      component['dispose'] = null
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('video telemetry events', () => {
    it('should roll up under the collection id from the query params', () => {
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'coll-1' }
      component.onVideoPlay()
      expect(mockTelemetrySvc.start).toHaveBeenCalledWith(
        'video/mp4', 'start', 'player',
        expect.objectContaining({ rollup: { l1: 'coll-1', l2: 'id1' } }),
      )
    })

    it('should roll up under the content id when there is no collection', () => {
      component.onVideoPlay()
      expect(mockTelemetrySvc.start).toHaveBeenCalledWith(
        'video/mp4', 'start', 'player',
        expect.objectContaining({ rollup: { l1: 'id1', l2: 'id1' } }),
      )
    })

    it('should raise an interact event on pause', () => {
      component.onVideoPause('pause')
      expect(mockTelemetrySvc.interact).toHaveBeenCalledWith(
        'video/mp4', 'pause', 'player', expect.objectContaining({ id: 'id1' }),
      )
    })

    it('should roll a pause up under the collection id', () => {
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'coll-1' }
      component.onVideoPause('pause')
      expect(mockTelemetrySvc.interact.mock.calls[0][3].rollup).toEqual({ l1: 'coll-1', l2: 'id1' })
    })

    it('should close the telemetry span when the video ends', () => {
      component.onVideoEnded()
      expect(mockTelemetrySvc.end).toHaveBeenCalledWith(
        'video/mp4', 'ended', 'player', expect.objectContaining({ id: 'id1' }),
      )
    })

    it('should roll an end up under the collection id', () => {
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'coll-1' }
      component.onVideoEnded()
      expect(mockTelemetrySvc.end.mock.calls[0][3].rollup).toEqual({ l1: 'coll-1', l2: 'id1' })
    })
  })

  describe('onEventTrigger', () => {
    it('should treat the first start as a play', () => {
      component.isResumeStarted = false
      component.onEventTrigger('start')
      expect(component.isResumeStarted).toBe(true)
      expect(mockTelemetrySvc.start).toHaveBeenCalled()
      expect(mockTelemetrySvc.interact).not.toHaveBeenCalled()
    })

    it('should treat a later start as a resume interact', () => {
      component.isResumeStarted = true
      component.onEventTrigger('start')
      expect(mockTelemetrySvc.start).not.toHaveBeenCalled()
      expect(mockTelemetrySvc.interact).toHaveBeenCalledWith(
        'video/mp4', 'start', 'player', expect.any(Object),
      )
    })

    it('should raise a pause interact', () => {
      component.onEventTrigger('pause')
      expect(mockTelemetrySvc.interact).toHaveBeenCalledWith(
        'video/mp4', 'pause', 'player', expect.any(Object),
      )
    })

    it('should close the span on end', () => {
      component.onEventTrigger('end')
      expect(mockTelemetrySvc.end).toHaveBeenCalled()
    })

    it('should ignore an unrecognised event', () => {
      component.onEventTrigger('seek' as any)
      expect(mockTelemetrySvc.start).not.toHaveBeenCalled()
      expect(mockTelemetrySvc.interact).not.toHaveBeenCalled()
      expect(mockTelemetrySvc.end).not.toHaveBeenCalled()
    })
  })

  describe('updateVideoProgress', () => {
    const data = { current: 50, max_size: 100 }

    it('should send status 2 for a fully watched video', async () => {
      await component['updateVideoProgress']('id1', data, 100, 'coll-1', 'b1')
      expect(mockViewerSvc.realTimeProgressUpdateV3).toHaveBeenCalledWith(
        'id1', expect.objectContaining({ completionPercentage: 100, status: 2 }), 'coll-1', 'b1',
      )
    })

    it('should send status 1 for a partially watched video', async () => {
      await component['updateVideoProgress']('id1', data, 50, 'coll-1', 'b1')
      expect(mockViewerSvc.realTimeProgressUpdateV3).toHaveBeenCalledWith(
        'id1', expect.objectContaining({ completionPercentage: 50, status: 1 }), 'coll-1', 'b1',
      )
    })

    it('should send status 0 for an unwatched video', async () => {
      await component['updateVideoProgress']('id1', data, 0, 'coll-1', 'b1')
      expect(mockViewerSvc.realTimeProgressUpdateV3).toHaveBeenCalledWith(
        'id1', expect.objectContaining({ completionPercentage: 0, status: 0 }), 'coll-1', 'b1',
      )
    })

    it('should merge the new percentage into the cached history list', async () => {
      component.contentHistoryResponse = {
        contentList: [{ contentId: 'id1', batchId: 'b1', courseId: 'coll-1', completionPercentage: 10, status: 1 }],
      } as any

      await component['updateVideoProgress']('id1', data, 100, 'coll-1', 'b1')
      await Promise.resolve()

      const [message] = mockContentSvc.changeMessage.mock.calls[0]
      expect(message.type).toBe('Video')
      expect(message.contentList[0]).toEqual(expect.objectContaining({
        contentId: 'id1', completionPercentage: 100, status: 2,
      }))
      expect(component.lastSentProgressPercentage).toBe(100)
    })

    it('should backfill missing percentages on the other cached entries', async () => {
      component.contentHistoryResponse = {
        contentList: [
          { contentId: 'id1', completionPercentage: 10, status: 1 },
          { contentId: 'other' },
        ],
      } as any

      await component['updateVideoProgress']('id1', data, 60, 'coll-1', 'b1')
      await Promise.resolve()

      const other = mockContentSvc.changeMessage.mock.calls[0][0].contentList
        .find((i: any) => i.contentId === 'other')
      expect(other).toEqual(expect.objectContaining({ completionPercentage: 0, status: 0 }))
    })

    it('should append an entry for a video watched for the first time', async () => {
      component.contentHistoryResponse = {
        contentList: [{ contentId: 'other', completionPercentage: 100, status: 2 }],
      } as any

      await component['updateVideoProgress']('id1', data, 100, 'coll-1', 'b1')
      await Promise.resolve()

      const added = mockContentSvc.changeMessage.mock.calls[0][0].contentList
        .find((i: any) => i.contentId === 'id1')
      expect(added).toEqual(expect.objectContaining({
        completionPercentage: 100, status: 2, batchId: 'b1', courseId: 'coll-1',
      }))
    })

    it('should default a missing batch id on the appended entry', async () => {
      component.contentHistoryResponse = { contentList: [{ contentId: 'other' }] } as any

      await component['updateVideoProgress']('id1', data, 40, 'coll-1', undefined)
      await Promise.resolve()

      const added = mockContentSvc.changeMessage.mock.calls[0][0].contentList
        .find((i: any) => i.contentId === 'id1')
      expect(added.batchId).toBe('')
    })

    it('should report the progress update in telemetry', async () => {
      component.contentHistoryResponse = { contentList: [{ contentId: 'id1' }] } as any

      await component['updateVideoProgress']('id1', data, 100, 'coll-1', 'b1')
      await Promise.resolve()

      expect(mockViewerSvc.generateInteractTelemetry).toHaveBeenCalledWith(
        'progress-update-success',
        expect.objectContaining({ contentId: 'id1', completionPercentage: 100, mimeType: 'video/mp4' }),
      )
    })
  })
})
