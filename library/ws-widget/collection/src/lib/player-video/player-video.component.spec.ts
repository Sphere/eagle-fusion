import { PlayerVideoComponent } from './player-video.component'
import { of } from 'rxjs'
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

  beforeEach(() => {
    mockEventSvc = {
      dispatchEvent: jest.fn(),
    }
    mockContentSvc = {
      fetchContentHistoryV2: jest.fn().mockReturnValue(of({ result: { contentList: [] } })),
      fetchContent: jest.fn().mockReturnValue(of({ result: { content: {} } })),
      setS3Cookie: jest.fn().mockReturnValue(of({})),
      saveContinueLearning: jest.fn().mockReturnValue(of({})),
      changeMessage: jest.fn(),
    }
    mockViewerSvc = {
      realTimeProgressUpdate: jest.fn().mockReturnValue(of({})),
    }
    mockActivatedRoute = {
      snapshot: {
        queryParams: {
          batchId: 'batch123',
          collectionId: 'collection123',
          collectionType: 'playlist',
        },
      },
    }
    mockConfigSvc = {
      userProfile: { userId: 'user123' },
    }
    mockTelemetrySvc = {
      start: jest.fn(),
      end: jest.fn(),
    }
    mockViewerDataSvc = {
      resource: { name: 'resourceName', parent: 'parent123' },
    }
    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of({})),
      }),
      closeAll: jest.fn(),
    }
    mockValueSvc = {
      isXSmall$: of(false),
    }

    component = new PlayerVideoComponent(
      mockEventSvc,
      mockContentSvc,
      mockViewerSvc,
      mockActivatedRoute,
      mockConfigSvc,
      mockTelemetrySvc,
      mockViewerDataSvc,
      mockDialog,
      mockValueSvc
    )
  })

  it('should initialize component and fetch content', async () => {
    const fetchContentSpy = jest.spyOn(component, 'fetchContent').mockResolvedValue(undefined)
    const getCurrentTimeSpy = jest.spyOn(component, 'getCurrentTime').mockResolvedValue(undefined)

    await component.ngOnInit()
    await component.ngAfterViewInit()

    expect(getCurrentTimeSpy).toHaveBeenCalled()
    expect(fetchContentSpy).toHaveBeenCalled()
  })

  it('should handle video initialization', async () => {
    const initializePlayerSpy = jest.spyOn(component as any, 'initializePlayer').mockImplementation(() => { })
    const initializeVPlayerSpy = jest.spyOn(component as any, 'initializeVPlayer').mockImplementation(() => { })

    component.widgetData = { url: 'videoUrl', isVideojs: true }
    await component.ngAfterViewInit()

    expect(initializePlayerSpy).toHaveBeenCalled()

    component.widgetData.isVideojs = false
    await component.ngAfterViewInit()

    expect(initializeVPlayerSpy).toHaveBeenCalled()
  })

  it('should handle video time update', () => {
    const videoElement = document.createElement('video')
    const addTimeUpdateListenerSpy = jest.spyOn(component as any, 'addTimeUpdateListener')

    component.addTimeUpdateListener(videoElement)

    expect(addTimeUpdateListenerSpy).toHaveBeenCalledWith(videoElement)
  })

  it('should handle fullscreen mode', () => {
    const videoElement = document.createElement('video')
    const requestFullscreenSpy = jest.spyOn(videoElement, 'requestFullscreen').mockImplementation(() => Promise.resolve())

    component.openFullscreen(videoElement)

    expect(requestFullscreenSpy).toHaveBeenCalled()
  })

  it('should handle popup opening and closing', () => {
    const videoElement = document.createElement('video')
    const intervalId = { unsubscribe: jest.fn() } as any
    const openPopupSpy = jest.spyOn(component as any, 'openPopup')

    component.openPopup([], videoElement, intervalId)

    expect(openPopupSpy).toHaveBeenCalledWith([], videoElement, intervalId)
  })


  it('should fetch current time', async () => {
    const fetchContentHistorySpy = jest.spyOn(mockContentSvc, 'fetchContentHistoryV2').mockReturnValue(of({
      result: {
        contentList: [
          {
            contentId: 'content123',
            progressdetails: { current: 50 },
          },
        ],
      },
    }))

    await component.getCurrentTime()

    expect(fetchContentHistorySpy).toHaveBeenCalled()
    expect(component.widgetData.resumePoint).toBe(50)
  })

  it('should fetch content and handle video questions', async () => {
    const fetchContentSpy = jest.spyOn(mockContentSvc, 'fetchContent').mockReturnValue(of({
      result: {
        content: {
          videoQuestions: JSON.stringify([{ timestampInSeconds: 10, question: [] }]),
        },
      },
    }))

    await component.fetchContent()

    expect(fetchContentSpy).toHaveBeenCalled()
    expect(component.widgetData.videoQuestions.length).toBe(1)
  })

  it('should handle time update and progress', () => {
    const videoElement = document.createElement('video')
    Object.defineProperty(videoElement, 'duration', { writable: true, value: 100 })
    videoElement.currentTime = 50
    component.videoTag = { nativeElement: videoElement } as any
    component.progressData = { completionPercentage: 40 }

    const realTimeProgressUpdateSpy = jest.spyOn(mockViewerSvc, 'realTimeProgressUpdate').mockReturnValue(of({}))

    component.onTimeUpdate()

    expect(realTimeProgressUpdateSpy).toHaveBeenCalled()
  })
})