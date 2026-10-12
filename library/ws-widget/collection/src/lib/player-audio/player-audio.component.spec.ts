const mockDispose = jest.fn()
const mockAddRemoteTextTrack = jest.fn()
const mockSrc = jest.fn()
let readyCallback: (() => void) | undefined
const mockPlayer = {
  dispose: jest.fn(),
  ready: jest.fn((cb: () => void) => { readyCallback = cb; cb() }),
  addRemoteTextTrack: mockAddRemoteTextTrack,
  src: mockSrc,
}

jest.mock('../_services/videojs-util', () => ({
  videoJsInitializer: jest.fn().mockReturnValue({ player: mockPlayer, dispose: mockDispose }),
}))

import { videoJsInitializer } from '../_services/videojs-util'
import { PlayerAudioComponent } from './player-audio.component'

const mockEventSvc: any = { dispatchEvent: jest.fn() }
const mockContentSvc: any = {
  fetchContent: jest.fn(),
  setS3Cookie: jest.fn(),
}
const mockViewerSvc: any = { realTimeProgressUpdate: jest.fn() }
const mockActivatedRoute: any = { snapshot: { queryParams: {} } }
const mockPlylsSvc: any = { orgDetails: jest.fn().mockReturnValue({ videoConfig: { isSeekingEnable: true } }) }

function createComponent(): PlayerAudioComponent {
  const component = new PlayerAudioComponent(mockEventSvc, mockContentSvc, mockViewerSvc, mockActivatedRoute, mockPlylsSvc)
  ;(component as any).audioTag = { nativeElement: {} }
  return component
}

describe('PlayerAudioComponent', () => {
  let component: PlayerAudioComponent

  beforeEach(() => {
    jest.clearAllMocks()
    mockActivatedRoute.snapshot.queryParams = {}
    mockPlylsSvc.orgDetails.mockReturnValue({ videoConfig: { isSeekingEnable: true } })
    component = createComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should fetch content when identifier present and no url', () => {
    component.widgetData = { identifier: 'id-1' } as any
    const spy = jest.spyOn(component, 'fetchContent').mockResolvedValue(undefined)
    component.ngAfterViewInit()
    expect(spy).toHaveBeenCalled()
  })

  it('should not fetch content when url already present', () => {
    component.widgetData = { identifier: 'id-1', url: 'audio.mp3' } as any
    const spy = jest.spyOn(component, 'fetchContent')
    component.ngAfterViewInit()
    expect(spy).not.toHaveBeenCalled()
  })

  it('should initialize player when url present', () => {
    component.widgetData = { identifier: 'id-1', url: 'audio.mp3', passThroughData: {} } as any
    component.ngAfterViewInit()
    expect(videoJsInitializer).toHaveBeenCalled()
    expect((component as any).player).toBe(mockPlayer)
  })

  it('should not initialize player when no url', () => {
    component.widgetData = {} as any
    component.ngAfterViewInit()
    expect(videoJsInitializer).not.toHaveBeenCalled()
  })

  it('should dispatch telemetry event when identifier present', () => {
    component.widgetData = { identifier: 'id-1', url: 'audio.mp3', passThroughData: {} } as any
    component.ngAfterViewInit()
    const call = (videoJsInitializer as jest.Mock).mock.calls[0]
    const dispatcher = call[2]
    dispatcher({ type: 'evt' })
    expect(mockEventSvc.dispatchEvent).toHaveBeenCalledWith({ type: 'evt' })
  })

  it('should not dispatch telemetry event when no identifier', () => {
    component.widgetData = { url: 'audio.mp3', passThroughData: {} } as any
    component.ngAfterViewInit()
    const call = (videoJsInitializer as jest.Mock).mock.calls[0]
    const dispatcher = call[2]
    dispatcher({ type: 'evt' })
    expect(mockEventSvc.dispatchEvent).not.toHaveBeenCalled()
  })

  it('should fire realtime progress with queryParams collectionId/batchId', () => {
    mockActivatedRoute.snapshot.queryParams = { collectionId: 'col-1', batchId: 'batch-1' }
    component.widgetData = { identifier: 'id-1', url: 'audio.mp3', passThroughData: {} } as any
    component.ngAfterViewInit()
    const call = (videoJsInitializer as jest.Mock).mock.calls[0]
    const fireRProgress = call[3]
    fireRProgress('id-1', { d: 1 })
    expect(mockViewerSvc.realTimeProgressUpdate).toHaveBeenCalledWith('id-1', { d: 1 }, 'col-1', 'batch-1')
  })

  it('should fall back to widgetData.identifier for collectionId/batchId', () => {
    mockActivatedRoute.snapshot.queryParams = {}
    component.widgetData = { identifier: 'id-1', url: 'audio.mp3', passThroughData: {} } as any
    component.ngAfterViewInit()
    const call = (videoJsInitializer as jest.Mock).mock.calls[0]
    const fireRProgress = call[3]
    fireRProgress('id-1', { d: 1 })
    expect(mockViewerSvc.realTimeProgressUpdate).toHaveBeenCalledWith('id-1', { d: 1 }, 'id-1', 'id-1')
  })

  it('should not fire realtime progress when no identifier', () => {
    component.widgetData = { url: 'audio.mp3', passThroughData: {} } as any
    component.ngAfterViewInit()
    const call = (videoJsInitializer as jest.Mock).mock.calls[0]
    const fireRProgress = call[3]
    fireRProgress('id-1', { d: 1 })
    expect(mockViewerSvc.realTimeProgressUpdate).not.toHaveBeenCalled()
  })

  it('should set enableTelemetry true when disableTelemetry false', () => {
    component.widgetData = { identifier: 'id-1', url: 'audio.mp3', disableTelemetry: false, passThroughData: {} } as any
    component.ngAfterViewInit()
    const call = (videoJsInitializer as jest.Mock).mock.calls[0]
    expect(call[7]).toBe(true)
  })

  it('should default isSeekingEnable true when orgDetails config missing', () => {
    mockPlylsSvc.orgDetails.mockReturnValue(undefined)
    component.widgetData = { identifier: 'id-1', url: 'audio.mp3', passThroughData: {} } as any
    component.ngAfterViewInit()
    const call = (videoJsInitializer as jest.Mock).mock.calls[0]
    expect(call[10]).toBe(true)
  })

  it('should add remote text tracks for subtitles on player ready', () => {
    component.widgetData = {
      identifier: 'id-1',
      url: 'audio.mp3',
      passThroughData: {},
      subtitles: [
        { label: 'en', srclang: 'en', url: 'en.vtt' },
        { label: 'hi', srclang: 'hi', url: 'hi.vtt' },
      ],
    } as any
    component.ngAfterViewInit()
    expect(mockAddRemoteTextTrack).toHaveBeenCalledTimes(2)
    expect(mockSrc).toHaveBeenCalledWith('audio.mp3')
  })

  it('should not add text tracks when subtitles is not array', () => {
    component.widgetData = { identifier: 'id-1', url: 'audio.mp3', passThroughData: {} } as any
    component.ngAfterViewInit()
    expect(mockAddRemoteTextTrack).not.toHaveBeenCalled()
    expect(mockSrc).toHaveBeenCalledWith('audio.mp3')
  })

  it('should dispose player and dispose fn on destroy', () => {
    component.widgetData = { identifier: 'id-1', url: 'audio.mp3', passThroughData: {} } as any
    component.ngAfterViewInit()
    component.ngOnDestroy()
    expect(mockPlayer.dispose).toHaveBeenCalled()
    expect(mockDispose).toHaveBeenCalled()
  })

  it('should not throw ngOnDestroy when nothing set', () => {
    expect(() => component.ngOnDestroy()).not.toThrow()
  })

  it('should fetch content and set widgetData url when artifactUrl matches content-store', async () => {
    mockContentSvc.fetchContent.mockReturnValue({
      toPromise: () => Promise.resolve({ artifactUrl: '/content-store/abc.mp3', appIcon: 'icon.png' }),
    })
    mockContentSvc.setS3Cookie.mockReturnValue({ toPromise: () => Promise.resolve({}) })
    component.widgetData = { identifier: 'id-1', primaryCategory: 'cat' } as any
    await component.fetchContent()
    expect(component.widgetData.url).toBe('/content-store/abc.mp3')
    expect(component.widgetData.posterImage).toBe('icon.png')
    expect(mockContentSvc.setS3Cookie).toHaveBeenCalledWith('id-1')
  })

  it('should not update widgetData when artifactUrl does not match content-store', async () => {
    mockContentSvc.fetchContent.mockReturnValue({
      toPromise: () => Promise.resolve({ artifactUrl: 'https://cdn.com/abc.mp3' }),
    })
    component.widgetData = { identifier: 'id-1' } as any
    await component.fetchContent()
    expect(component.widgetData.url).toBeUndefined()
    expect(mockContentSvc.setS3Cookie).not.toHaveBeenCalled()
  })
})
