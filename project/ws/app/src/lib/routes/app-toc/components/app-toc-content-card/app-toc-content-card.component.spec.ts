import { Router, ActivatedRoute } from '@angular/router'
import { of } from 'rxjs'

jest.mock('@ws-widget/collection', () => ({
  WidgetContentService: class MockWidgetContentService {},
  NsContent: {
    EMimeTypes: {
      COLLECTION: 'application/vnd.ekstep.content-collection',
      PDF: 'application/pdf',
      HANDS_ON: 'application/hands-on',
      MP3: 'audio/mpeg',
      MP4: 'video/mp4',
      M3U8: 'application/x-mpegURL',
      INTERACTION: 'application/interaction',
      HTML: 'application/html',
      QUIZ: 'application/quiz',
      WEB_MODULE: 'application/web-module',
      YOUTUBE: 'video/x-youtube',
    },
    EContentTypes: {
      COURSE: 'Course',
      KNOWLEDGE_ARTIFACT: 'Knowledge Artifact',
      MODULE: 'Module',
      RESOURCE: 'Resource',
    },
    EDisplayContentTypes: {
      COURSE: 'COURSE',
      PDF: 'PDF',
      RESOURCE: 'RESOURCE',
    },
  },
  viewerRouteGenerator: jest.fn().mockReturnValue({ url: '/viewer/url', queryParams: {} }),
}))

import { NsContent, WidgetContentService } from '@ws-widget/collection'
import { ConfigurationsService, LoggerService } from '@ws-widget/utils'
import { AppTocService } from '../../services/app-toc.service'
import { AppTocContentCardComponent } from './app-toc-content-card.component'

const mockConfigSvc: Partial<ConfigurationsService> = {
  instanceConfig: { logos: { defaultContent: 'default-thumb.svg' } } as any,
}

const mockRoute: Partial<ActivatedRoute> = {
  queryParams: of({ batchId: 'batch-1', contentId: 'content-1' }),
}

const mockRouter: Partial<Router> = {
  navigateByUrl: jest.fn(),
}

const mockTocSvc: Partial<AppTocService> = {
  getNode: jest.fn().mockReturnValue(false),
}

const mockContentSvc: Partial<WidgetContentService> = {
  showConformation: false,
}

const mockLogger: Partial<LoggerService> = {
  log: jest.fn(),
  warn: jest.fn(),
}

function createComponent(): AppTocContentCardComponent {
  return new AppTocContentCardComponent(
    mockConfigSvc as ConfigurationsService,
    mockRoute as ActivatedRoute,
    mockRouter as Router,
    mockTocSvc as AppTocService,
    mockContentSvc as WidgetContentService,
    mockLogger as LoggerService,
  )
}

describe('AppTocContentCardComponent', () => {
  let component: AppTocContentCardComponent

  beforeEach(() => {
    jest.clearAllMocks()
    ;(mockTocSvc.getNode as jest.Mock).mockReturnValue(false)
    component = createComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set defaultThumbnail, batchId, contentId and disabledNode on init', () => {
    ;(mockTocSvc.getNode as jest.Mock).mockReturnValue(true)
    component.ngOnInit()
    expect(component.defaultThumbnail).toBe('default-thumb.svg')
    expect(component.batchId).toBe('batch-1')
    expect(component.contentId).toBe('content-1')
    expect(component.disabledNode).toBe(true)
  })

  it('should toggle viewChildren on ngOnChanges when expandAll changes', () => {
    component.expandAll = true
    component.ngOnChanges({ expandAll: {} as any })
    expect(component.viewChildren).toBe(true)
  })

  it('should not toggle viewChildren for unrelated changes', () => {
    component.viewChildren = false
    component.ngOnChanges({ rootId: {} as any })
    expect(component.viewChildren).toBe(false)
  })

  it('should set showConformation via setConfirmDialogStatus', () => {
    component.setConfirmDialogStatus(50)
    expect(mockContentSvc.showConformation).toBe(50)
  })

  it('should map mimeType to resourceContentType', () => {
    component.resourceContentTypeFunct('application/pdf')
    expect(component.resourceContentType).toBe('PDF')
    component.resourceContentTypeFunct('video/mp4')
    expect(component.resourceContentType).toBe('Video')
    component.resourceContentTypeFunct('unknown/type')
    expect(component.resourceContentType).toBe('Course')
  })

  it('should map collection mimeType to Topic', () => {
    component.resourceContentTypeFunct('application/vnd.ekstep.content-collection')
    expect(component.resourceContentType).toBe('Topic')
  })

  it('should map quiz/json mimeType to Assessment', () => {
    component.resourceContentTypeFunct('application/quiz')
    expect(component.resourceContentType).toBe('Assessment')
    component.resourceContentTypeFunct('application/json')
    expect(component.resourceContentType).toBe('Assessment')
  })

  it('should map html/scorm mimeType to Scorm', () => {
    component.resourceContentTypeFunct('application/html')
    expect(component.resourceContentType).toBe('Scorm')
    component.resourceContentTypeFunct('application/vnd.ekstep.html-archive')
    expect(component.resourceContentType).toBe('Scorm')
  })

  it('should map audio mimeType to Audio', () => {
    component.resourceContentTypeFunct('audio/mpeg')
    expect(component.resourceContentType).toBe('Audio')
  })

  it('should map link-like mimeTypes to Link', () => {
    component.resourceContentTypeFunct('video/x-youtube')
    expect(component.resourceContentType).toBe('Link')
    component.resourceContentTypeFunct('text/x-url')
    expect(component.resourceContentType).toBe('Link')
    component.resourceContentTypeFunct('application/web-module')
    expect(component.resourceContentType).toBe('Link')
  })

  it('should navigate when reDirect is called with accessible content', () => {
    component.disabledNode = false
    const content = { url: '/a', queryParams: { primaryCategory: 'p', collectionId: 'c', collectionType: 'ct', batchId: 'b' } }
    component.reDirect(content)
    expect(mockRouter.navigateByUrl).toHaveBeenCalled()
  })

  it('should block navigation when reDirect is called with locked content', () => {
    component.disabledNode = true
    const content = { hideLocIcon: false, url: '/a', queryParams: {} }
    component.reDirect(content)
    expect(mockRouter.navigateByUrl).not.toHaveBeenCalled()
    expect(mockLogger.warn).toHaveBeenCalled()
  })

  it('canAccessResource should allow when disabledNode is false', () => {
    component.disabledNode = false
    expect(component.canAccessResource({})).toBe(true)
  })

  it('canAccessResource should allow when hideLocIcon is true', () => {
    component.disabledNode = true
    expect(component.canAccessResource({ hideLocIcon: true })).toBe(true)
  })

  it('canAccessResource should deny when locked', () => {
    component.disabledNode = true
    expect(component.canAccessResource({ hideLocIcon: false })).toBe(false)
  })

  it('isCollection should return true and set incomplete for collection content', () => {
    component.content = {
      mimeType: NsContent.EMimeTypes.COLLECTION,
      contentType: 'Resource',
      children: [{ completionPercentage: 50 }],
    } as any
    expect(component.isCollection).toBe(true)
    expect((component.content as any).incomplete).toBe(true)
  })

  it('isCollection should return false for non-collection content', () => {
    component.content = { mimeType: 'application/pdf' } as any
    expect(component.isCollection).toBe(false)
  })

  it('isCollection should return false when content is null', () => {
    component.content = null
    expect(component.isCollection).toBe(false)
  })

  it('isCollection should set incomplete false when all children are complete', () => {
    component.content = {
      mimeType: NsContent.EMimeTypes.COLLECTION,
      contentType: 'Resource',
      children: [{ completionPercentage: 100 }],
    } as any
    expect(component.isCollection).toBe(true)
    expect((component.content as any).incomplete).toBe(false)
  })

  it('isResource should return true for Resource contentType', () => {
    component.content = { contentType: 'Resource' } as any
    expect(component.isResource).toBe(true)
  })

  it('isResource should return false when content is null', () => {
    component.content = null
    expect(component.isResource).toBe(false)
  })

  it('resourceLink should return empty when content is null', () => {
    component.content = null
    expect(component.resourceLink).toEqual({ url: '', queryParams: {} })
  })

  it('resourceLink should build a url when content is present', () => {
    component.content = {
      identifier: 'id-1',
      mimeType: 'application/pdf',
      primaryCategory: 'Course',
    } as any
    component.rootId = 'root-1'
    component.rootContentType = 'Course'
    const result = component.resourceLink
    expect(result.url).toBeTruthy()
  })

  it('contextPath should return rootId, rootContentType and batchId', () => {
    component.rootId = 'root-1'
    component.rootContentType = 'Course'
    component.batchId = 'batch-1'
    expect(component.contextPath).toEqual({ contextId: 'root-1', contextPath: 'Course', batchId: 'batch-1' })
  })

  it('progressColor should return correct colors for ranges', () => {
    expect(component.progressColor(20)).toBe('#D13924')
    expect(component.progressColor(50)).toBe('#E99E38')
    expect(component.progressColor(90)).toBe('#1D8923')
  })

  it('contentTrackBy should return identifier or null', () => {
    expect(component.contentTrackBy(0, { identifier: 'abc' } as any)).toBe('abc')
    expect(component.contentTrackBy(0, null as any)).toBeNull()
  })

  it('ngOnInit should evaluate immediate children structure across all content/mime types', () => {
    component.content = {
      children: [
        { contentType: 'Course' },
        { contentType: 'Knowledge Artifact' },
        { contentType: 'Module' },
        { contentType: 'Resource', mimeType: 'application/hands-on' },
        { contentType: 'Resource', mimeType: 'audio/mpeg' },
        { contentType: 'Resource', mimeType: 'video/mp4' },
        { contentType: 'Resource', mimeType: 'application/x-mpegURL' },
        { contentType: 'Resource', mimeType: 'application/interaction' },
        { contentType: 'Resource', mimeType: 'application/pdf' },
        { contentType: 'Resource', mimeType: 'application/html' },
        { contentType: 'Resource', mimeType: 'application/quiz' },
        { contentType: 'Resource', mimeType: 'application/web-module' },
        { contentType: 'Resource', mimeType: 'video/x-youtube' },
        { contentType: 'Resource', mimeType: 'unknown/other' },
      ],
    } as any
    component.ngOnInit()
    expect(component.contentStructure.course).toBe(1)
    expect(component.contentStructure.other).toBe(2)
    expect(component.contentStructure.learningModule).toBe(1)
    expect(component.contentStructure.handsOn).toBe(1)
    expect(component.contentStructure.podcast).toBe(1)
    expect(component.contentStructure.video).toBe(2)
    expect(component.contentStructure.interactiveVideo).toBe(1)
    expect(component.contentStructure.pdf).toBe(1)
    expect(component.contentStructure.webPage).toBe(1)
    expect(component.contentStructure.assessment).toBe(1)
    expect(component.contentStructure.webModule).toBe(1)
    expect(component.contentStructure.youtube).toBe(1)
    expect(component.hasContentStructure).toBe(true)
  })

  it('ngOnInit should leave hasContentStructure false when there are no children', () => {
    component.content = { children: [] } as any
    component.ngOnInit()
    expect(component.hasContentStructure).toBe(false)
  })

  it('expandView should emit true', () => {
    const emitSpy = jest.spyOn(component.expandChild, 'emit')
    component.expandView()
    expect(emitSpy).toHaveBeenCalledWith(true)
  })
})
