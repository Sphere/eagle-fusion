jest.mock('@ws-widget/utils/src/lib/pipes/pipe-limit-to/pipe-limit-to.pipe', () => ({
  PipeLimitToPipe: class { transform = jest.fn((v: string) => v) },
}), { virtual: true })
jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class {},
  LoggerService: class {},
  SafeResourceUrlService: class { sanitizeHtml = jest.fn((v: string) => v) },
  ValueService: class {},
}))
jest.mock('@ws-widget/collection', () => ({
  NsContent: {},
  NsDiscussionForum: {},
  WidgetContentService: class {},
}))
jest.mock('../../player-state.service', () => ({
  PlayerStateService: class {},
}))
jest.mock('../../viewer-util.service', () => ({
  ViewerUtilService: class {},
}))

import { HtmlComponent } from './html.component'
import { of } from 'rxjs'

describe('HtmlComponent (route-view-container/html)', () => {
  let component: HtmlComponent
  let mockActivatedRoute: any
  let mockSafeResourceUrlSvc: any
  let mockPipeLimitTo: any
  let mockValueSvc: any
  let mockConfigSvc: any
  let mockViewerDataSvc: any
  let mockRouter: any
  let mockViewerSvc: any
  let mockLogger: any
  let mockContentSvc: any
  let mockCdr: any

  beforeEach(() => {
    mockActivatedRoute = { snapshot: { queryParams: { collectionType: 'course', collectionId: 'col1' } } }
    mockSafeResourceUrlSvc = { sanitizeHtml: jest.fn((v: string) => v) }
    mockPipeLimitTo = { transform: jest.fn((v: string) => v) }
    mockValueSvc = { isLtMedium$: of(false) }
    mockConfigSvc = { restrictedFeatures: new Set(['other']) }
    mockViewerDataSvc = { playerState: of({ currentCompletionPercentage: 100 }) }
    mockRouter = {}
    mockViewerSvc = { realTimeProgressUpdateV3: jest.fn(() => of({})), generateInteractTelemetry: jest.fn() }
    mockLogger = { warn: jest.fn(), log: jest.fn() }
    mockContentSvc = { fetchContentHistoryV2: jest.fn(() => of({ result: { contentList: [] } })), changeMessage: jest.fn() }
    mockCdr = { markForCheck: jest.fn() }

    component = new HtmlComponent(
      mockActivatedRoute,
      mockSafeResourceUrlSvc,
      mockPipeLimitTo,
      mockValueSvc,
      mockConfigSvc,
      mockViewerDataSvc,
      mockRouter,
      mockViewerSvc,
      mockLogger,
      mockContentSvc,
      mockCdr,
    )
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('sets isTypeOfCollection/collectionType from route params', () => {
      component.ngOnInit()
      expect(component.isTypeOfCollection).toBe(true)
      expect(component.collectionType).toBe('course')
      expect(component.collectionIdentifier).toBe('col1')
    })

    it('subscribes to playerState and updates currentCompletionPercentage', () => {
      component.ngOnInit()
      expect(component.currentCompletionPercentage).toBe(100)
    })

    it('sets isRestricted true when discussionForum not in restrictedFeatures', () => {
      component.ngOnInit()
      expect(component.isRestricted).toBe(true)
    })

    it('sets isRestricted false when discussionForum is in restrictedFeatures', () => {
      mockConfigSvc.restrictedFeatures = new Set(['disscussionForum'])
      component.ngOnInit()
      expect(component.isRestricted).toBe(false)
    })

    it('sets isLtMedium from ValueService observable', () => {
      mockValueSvc.isLtMedium$ = of(true)
      component.ngOnInit()
      expect(component.isLtMedium).toBe(true)
    })

    it('handles absent restrictedFeatures gracefully', () => {
      mockConfigSvc.restrictedFeatures = undefined
      expect(() => component.ngOnInit()).not.toThrow()
      expect(component.isRestricted).toBe(false)
    })
  })

  describe('ngOnChanges', () => {
    it('flags SCORM content when artifactUrl starts with https://scorm.', () => {
      component.ngOnChanges({
        htmlData: { currentValue: {}, previousValue: null, firstChange: true, isFirstChange: () => true },
      } as any)
      component.htmlData = { artifactUrl: 'https://scorm.example.com/x' } as any
      component.ngOnChanges({
        htmlData: { currentValue: component.htmlData, previousValue: null, firstChange: false, isFirstChange: () => false },
      } as any)
      expect(component.isScormContent).toBe(true)
    })

    it('sets isScormContent false for non-scorm artifactUrl', () => {
      component.htmlData = { artifactUrl: 'https://example.com/x' } as any
      component.ngOnChanges({ htmlData: {} } as any)
      expect(component.isScormContent).toBe(false)
    })

    it('sets learningObjective when present', () => {
      component.htmlData = { artifactUrl: 'https://example.com/x', learningObjective: '<p>obj</p>' } as any
      component.ngOnChanges({ htmlData: {} } as any)
      expect(component.learningObjective).toBe('<p>obj</p>')
    })

    it('sets description via pipeLimitTo when present', () => {
      component.htmlData = { artifactUrl: 'https://example.com/x', description: 'a long description' } as any
      component.ngOnChanges({ htmlData: {} } as any)
      expect(mockPipeLimitTo.transform).toHaveBeenCalledWith('a long description', 450)
      expect(component.description).toBe('a long description')
    })

    it('ignores changes to unrelated props', () => {
      component.ngOnChanges({ isPreviewMode: {} } as any)
      expect(component.isScormContent).toBe(false)
    })
  })

  describe('player choice', () => {
    const htmlPackage = {
      identifier: 'do_h', artifactUrl: 'https://example.com/do_h.zip',
      mimeType: 'application/vnd.ekstep.html-archive', packageType: 'html',
    }
    beforeEach(() => {
      mockConfigSvc.instanceConfig = { htmlContentPlayer: { contentIds: [], mimeTypes: ['application/vnd.ekstep.html-archive'] } }
    })

    it('plays an HTML package (packageType html) in the Sunbird content-player', () => {
      component.htmlData = htmlPackage as any
      component.ngOnChanges({ htmlData: {} } as any)
      expect(component.useContentPlayer).toBe(true)
    })

    it('keeps the SCORM/HTML player for the same mimeType without packageType html', () => {
      component.htmlData = { ...htmlPackage, packageType: 'scorm' } as any
      component.ngOnChanges({ htmlData: {} } as any)
      expect(component.useContentPlayer).toBe(false)
      component.htmlData = { ...htmlPackage, packageType: undefined } as any
      component.ngOnChanges({ htmlData: {} } as any)
      expect(component.useContentPlayer).toBe(false)
    })
  })

  describe('isProgressCheck', () => {
    it('returns true when currentCompletionPercentage is 100', () => {
      component.currentCompletionPercentage = 100
      expect(component.isProgressCheck()).toBe(true)
    })

    it('returns false when currentCompletionPercentage is not 100', () => {
      component.currentCompletionPercentage = 40
      expect(component.isProgressCheck()).toBe(false)
    })

    it('returns false when currentCompletionPercentage is null', () => {
      component.currentCompletionPercentage = null
      expect(component.isProgressCheck()).toBe(false)
    })
  })
})
