import { of, Subject } from 'rxjs'

jest.mock('@ws-widget/collection', () => ({
  NsContent: {
    EContentTypes: { RESOURCE: 'Resource', KNOWLEDGE_ARTIFACT: 'Knowledge Artifact' },
    EMimeTypes: {
      M3U8: 'application/x-mpegURL',
      MP4: 'video/mp4',
      MP3: 'audio/mpeg',
      M4A: 'audio/m4a',
      PDF: 'application/pdf',
      YOUTUBE: 'video/x-youtube',
    },
  },
  viewerRouteGenerator: jest.fn().mockReturnValue({ url: '/viewer', queryParams: {} }),
  ROOT_WIDGET_CONFIG: {
    player: {
      _type: 'player',
      video: 'videoPlayer',
      audio: 'audioPlayer',
      pdf: 'pdfPlayer',
      youtube: 'youtubePlayer',
    },
  },
  WidgetContentService: class MockWidgetContentService {},
}))

import { NsContent } from '@ws-widget/collection'
import { AppTocContentsComponent } from './app-toc-contents.component'

describe('AppTocContentsComponent', () => {
  let component: AppTocContentsComponent
  let routeMock: any
  let sanitizerMock: any
  let tocSvcMock: any
  let configSvcMock: any
  let contentSvcMock: any
  let resumeDataSubject: Subject<any>
  let showComponentSubject: Subject<any>

  const buildContent = (overrides: any = {}) => ({
    identifier: 'course1',
    contentType: NsContent.EContentTypes.RESOURCE,
    mimeType: NsContent.EMimeTypes.PDF,
    gatingEnabled: false,
    children: [{ identifier: 'child1', completionPercentage: 100, children: [] }],
    ...overrides,
  })

  beforeEach(() => {
    resumeDataSubject = new Subject()
    showComponentSubject = new Subject()
    routeMock = {
      queryParamMap: of({ get: (key: string) => (key === 'contextId' ? 'ctx1' : 'path1') }),
      parent: {
        data: of({ content: { data: buildContent() } }),
      },
    }
    tocSvcMock = {
      initData: jest.fn().mockReturnValue({ content: buildContent(), errorCode: null }),
      resumeData: resumeDataSubject,
      showComponent$: showComponentSubject.asObservable(),
      setNode: jest.fn(),
    }
    configSvcMock = {
      instanceConfig: { logos: { defaultContent: 'default.png' } },
      rootOrg: 'default',
    }
    contentSvcMock = {
      showConformation: null,
    }
    sanitizerMock = {
      trustStyle: jest.fn().mockReturnValue('safe-style'),
    }
    component = new AppTocContentsComponent(routeMock, sanitizerMock, tocSvcMock, configSvcMock, contentSvcMock)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize content and context on ngOnInit', () => {
    component.ngOnInit()
    expect(component.content).toBeTruthy()
    expect(component.contextId).toBe('ctx1')
    expect(component.contextPath).toBe('path1')
    expect(component.defaultThumbnail).toBe('default.png')
  })

  it('should set loadContent true/false based on showComponent$', () => {
    component.ngOnInit()
    showComponentSubject.next({ showComponent: false })
    expect(component.loadContent).toBe(false)
    showComponentSubject.next({ showComponent: true })
    expect(component.loadContent).toBe(true)
    showComponentSubject.next(null)
    expect(component.loadContent).toBe(true)
  })

  it('should resubscribe route data when resumeData emits', () => {
    component.ngOnInit()
    resumeDataSubject.next([{ contentId: 'child1' }])
    expect(tocSvcMock.initData).toHaveBeenCalled()
  })

  it('should set gating flag and hideLocIcon for first child when gatingEnabled', () => {
    tocSvcMock.initData.mockReturnValue({
      content: buildContent({ gatingEnabled: true, children: [{ identifier: 'c1', children: [] }] }),
      errorCode: null,
    })
    component.ngOnInit()
    expect(tocSvcMock.setNode).toHaveBeenCalledWith(true)
    expect(component.content!.children[0]['hideLocIcon']).toBe(true)
  })

  it('should populate video widget for MP4 mime type', () => {
    tocSvcMock.initData.mockReturnValue({
      content: buildContent({ mimeType: NsContent.EMimeTypes.MP4, artifactUrl: 'url', appIcon: 'icon' }),
      errorCode: null,
    })
    component.ngOnInit()
    expect(component.isPlayable).toBe(true)
    expect(component.contentPlayWidgetConfig!.widgetSubType).toBe('videoPlayer')
  })

  it('should populate audio widget for MP3 mime type', () => {
    tocSvcMock.initData.mockReturnValue({
      content: buildContent({ mimeType: NsContent.EMimeTypes.MP3 }),
      errorCode: null,
    })
    component.ngOnInit()
    expect(component.contentPlayWidgetConfig!.widgetSubType).toBe('audioPlayer')
  })

  it('should populate pdf widget for PDF mime type', () => {
    component.ngOnInit()
    expect(component.contentPlayWidgetConfig!.widgetSubType).toBe('pdfPlayer')
  })

  it('should populate youtube widget for YOUTUBE mime type', () => {
    tocSvcMock.initData.mockReturnValue({
      content: buildContent({ mimeType: NsContent.EMimeTypes.YOUTUBE }),
      errorCode: null,
    })
    component.ngOnInit()
    expect(component.contentPlayWidgetConfig!.widgetSubType).toBe('youtubePlayer')
  })

  it('should sanitize background image url', () => {
    const result = component.sanitizedBackgroundImage('http://img.png')
    expect(sanitizerMock.trustStyle).toHaveBeenCalledWith('url(http://img.png)')
    expect(result).toBe('safe-style')
  })

  it('should generate resource link', () => {
    const result = component.resourceLink({ identifier: 'r1', mimeType: 'application/pdf' } as any)
    expect(result).toEqual({ url: '/viewer', queryParams: {} })
  })

  it('should return null identifier for null content in contentTrackBy', () => {
    expect(component.contentTrackBy(0, null as any)).toBeNull()
    expect(component.contentTrackBy(0, { identifier: 'x' } as any)).toBe('x')
  })

  it('should set confirmation status', () => {
    component.setConfirmDialogStatus(75)
    expect(contentSvcMock.showConformation).toBe(75)
  })

  it('should check last resource percentage with nested children', () => {
    component.checkLastResoursePercentage({
      children: [{ children: [{ completionPercentage: 50 }] }],
    })
    expect(contentSvcMock.showConformation).toBe(50)
  })

  it('should check last resource percentage without nested children', () => {
    component.checkLastResoursePercentage({
      children: [{ completionPercentage: 30 }],
    })
    expect(contentSvcMock.showConformation).toBe(30)
  })

  it('should return true for showYouMayAlsoLikeTab by default', () => {
    expect(component.showYouMayAlsoLikeTab).toBe(true)
  })

  it('should unsubscribe subscriptions and reset gating on ngOnDestroy', () => {
    component.ngOnInit()
    component.ngOnDestroy()
    expect(tocSvcMock.setNode).toHaveBeenCalledWith(false)
  })

  it('should not throw ngOnDestroy when subscriptions are null', () => {
    expect(() => component.ngOnDestroy()).not.toThrow()
  })
})
