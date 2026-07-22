import { of } from 'rxjs'

const mockDispose = jest.fn()
const mockPlayer = { dispose: jest.fn() }

jest.mock('../_services/videojs-util', () => ({
  videoJsInitializer: jest.fn().mockReturnValue({ player: mockPlayer, dispose: mockDispose }),
  youtubeInitializer: jest.fn().mockReturnValue({ dispose: mockDispose }),
}))

import { videoJsInitializer, youtubeInitializer } from '../_services/videojs-util'
import { PlayerYoutubeComponent } from './player-youtube.component'

const mockEventSvc: any = { dispatchEvent: jest.fn() }
const mockViewerSvc: any = { realTimeProgressUpdate: jest.fn() }
const mockActivatedRoute: any = {
  snapshot: { queryParams: {} },
}
const mockValueSvc: any = { isXSmall$: of(false) }

function createComponent(): PlayerYoutubeComponent {
  return new PlayerYoutubeComponent(mockEventSvc, mockViewerSvc, mockActivatedRoute, mockValueSvc)
}

describe('PlayerYoutubeComponent', () => {
  let component: PlayerYoutubeComponent

  beforeEach(() => {
    jest.clearAllMocks()
    mockActivatedRoute.snapshot.queryParams = {}
    component = createComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set screenHeight to 100% when isXSmall true', () => {
    const valueSvc: any = { isXSmall$: of(true) }
    const comp = new PlayerYoutubeComponent(mockEventSvc, mockViewerSvc, mockActivatedRoute, valueSvc)
    comp.ngOnInit()
    expect(comp.screenHeight).toBe('100%')
  })

  it('should set screenHeight to 500vh when isXSmall false', () => {
    component.ngOnInit()
    expect(component.screenHeight).toBe('500vh')
  })

  it('should do nothing on ngAfterViewInit when no widgetData url', () => {
    component.widgetData = {} as any
    expect(() => component.ngAfterViewInit()).not.toThrow()
  })

  it('should initialize videojs player when isVideojs true', () => {
    component.widgetData = {
      url: 'https://youtube.com/embed/abc123',
      isVideojs: true,
      identifier: 'content-1',
      disableTelemetry: false,
      posterImage: 'poster.png',
      resumePoint: 10,
      passThroughData: {},
    } as any
    ;(component as any).videoTag = { nativeElement: {} }
    component.ngAfterViewInit()
    expect(videoJsInitializer).toHaveBeenCalled()
    expect((component as any).player).toBe(mockPlayer)
  })

  it('should initialize youtube player when isVideojs false', () => {
    component.widgetData = {
      url: 'https://youtube.com/embed/abc123',
      isVideojs: false,
      identifier: 'content-1',
      disableTelemetry: false,
      passThroughData: {},
    } as any
    ;(component as any).youtubeTag = { nativeElement: {} }
    component.ngAfterViewInit()
    expect(youtubeInitializer).toHaveBeenCalled()
  })

  it('should dispatch telemetry event via dispatcher when identifier present', () => {
    component.widgetData = {
      url: 'https://youtube.com/embed/abc123',
      isVideojs: false,
      identifier: 'content-1',
      passThroughData: {},
    } as any
    ;(component as any).youtubeTag = { nativeElement: {} }
    component.ngAfterViewInit()
    const call = (youtubeInitializer as jest.Mock).mock.calls[0]
    const dispatcher = call[2]
    dispatcher({ type: 'event' })
    expect(mockEventSvc.dispatchEvent).toHaveBeenCalledWith({ type: 'event' })
  })

  it('should not dispatch telemetry event when no identifier', () => {
    component.widgetData = {
      url: 'https://youtube.com/embed/abc123',
      isVideojs: false,
      passThroughData: {},
    } as any
    ;(component as any).youtubeTag = { nativeElement: {} }
    component.ngAfterViewInit()
    const call = (youtubeInitializer as jest.Mock).mock.calls[0]
    const dispatcher = call[2]
    dispatcher({ type: 'event' })
    expect(mockEventSvc.dispatchEvent).not.toHaveBeenCalled()
  })

  it('should call realTimeProgressUpdate via fireRProgress for youtube player when identifier present', () => {
    component.widgetData = {
      url: 'https://youtube.com/embed/abc123',
      isVideojs: false,
      identifier: 'content-1',
      passThroughData: {},
    } as any
    ;(component as any).youtubeTag = { nativeElement: {} }
    component.ngAfterViewInit()
    const call = (youtubeInitializer as jest.Mock).mock.calls[0]
    const fireRProgress = call[3]
    fireRProgress('content-1', { some: 'data' })
    expect(mockViewerSvc.realTimeProgressUpdate).toHaveBeenCalledWith('content-1', { some: 'data' })
  })

  it('should set enableTelemetry true when disableTelemetry is false', () => {
    component.widgetData = {
      url: 'https://youtube.com/embed/abc123',
      isVideojs: false,
      identifier: 'content-1',
      disableTelemetry: false,
      passThroughData: {},
    } as any
    ;(component as any).youtubeTag = { nativeElement: {} }
    component.ngAfterViewInit()
    const call = (youtubeInitializer as jest.Mock).mock.calls[0]
    expect(call[6]).toBe(true)
  })

  it('should call realTimeProgressUpdate for videojs player with collectionId/batchId from queryParams', () => {
    mockActivatedRoute.snapshot.queryParams = { collectionId: 'col-1', batchId: 'batch-1' }
    component.widgetData = {
      url: 'https://youtube.com/embed/abc123',
      isVideojs: true,
      identifier: 'content-1',
      passThroughData: {},
    } as any
    ;(component as any).videoTag = { nativeElement: {} }
    component.ngAfterViewInit()
    const call = (videoJsInitializer as jest.Mock).mock.calls[0]
    const fireRProgress = call[3]
    fireRProgress('content-1', { some: 'data' })
    expect(mockViewerSvc.realTimeProgressUpdate).toHaveBeenCalledWith('content-1', { some: 'data' }, 'col-1', 'batch-1')
  })

  it('should fall back to widgetData.identifier for collectionId/batchId when queryParams missing', () => {
    mockActivatedRoute.snapshot.queryParams = {}
    component.widgetData = {
      url: 'https://youtube.com/embed/abc123',
      isVideojs: true,
      identifier: 'content-1',
      passThroughData: {},
    } as any
    ;(component as any).videoTag = { nativeElement: {} }
    component.ngAfterViewInit()
    const call = (videoJsInitializer as jest.Mock).mock.calls[0]
    const fireRProgress = call[3]
    fireRProgress('content-1', { some: 'data' })
    expect(mockViewerSvc.realTimeProgressUpdate).toHaveBeenCalledWith('content-1', { some: 'data' }, 'content-1', 'content-1')
  })

  it('should not call realTimeProgressUpdate when identifier or data missing', () => {
    component.widgetData = {
      url: 'https://youtube.com/embed/abc123',
      isVideojs: true,
      passThroughData: {},
    } as any
    ;(component as any).videoTag = { nativeElement: {} }
    component.ngAfterViewInit()
    const call = (videoJsInitializer as jest.Mock).mock.calls[0]
    const fireRProgress = call[3]
    fireRProgress('content-1', { some: 'data' })
    expect(mockViewerSvc.realTimeProgressUpdate).not.toHaveBeenCalled()
  })

  it('should dispose player and unsubscribe screenSubscription on destroy', () => {
    component.ngOnInit()
    ;(component as any).player = mockPlayer
    ;(component as any).dispose = mockDispose
    const unsubSpy = jest.spyOn(component.screenSubscription as any, 'unsubscribe')
    component.ngOnDestroy()
    expect(mockPlayer.dispose).toHaveBeenCalled()
    expect(mockDispose).toHaveBeenCalled()
    expect(unsubSpy).toHaveBeenCalled()
  })

  it('should handle ngOnDestroy gracefully when nothing set', () => {
    expect(() => component.ngOnDestroy()).not.toThrow()
  })
})
