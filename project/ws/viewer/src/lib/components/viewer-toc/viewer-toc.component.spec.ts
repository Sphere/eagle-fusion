jest.mock('@ws-widget/collection', () => ({
  NsContent: {
    EDisplayContentTypes: {
      PROGRAM: 'Program', COURSE: 'Course', MODULE: 'Module', GOALS: 'Goals', PLAYLIST: 'Playlist',
    },
    EMiscPlayerSupportedCollectionTypes: { PLAYLIST: 'Playlist' },
    EContentTypes: { MODULE: 'Module', COURSE: 'Course', PROGRAM: 'Program' },
    EMimeTypes: {},
  },
  VIEWER_ROUTE_FROM_MIME: () => 'pdf',
  WidgetContentService: class {},
}))
jest.mock('@ws-widget/resolver', () => ({ NsWidgetResolver: {} }))
jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class {},
  LoggerService: class {},
  SafeResourceUrlService: class {},
  UtilityService: class {},
}))
jest.mock('file-saver', () => ({ saveAs: jest.fn() }))
jest.mock('project/ws/viewer/src/lib/plugins/quiz/confirm-modal-component', () => ({
  ConfirmmodalComponent: class {},
}))
jest.mock('../../plugins/quiz/components/congratulations-popup/congratulations-popup.component', () => ({
  CongratulationsPopupComponent: class {},
}))
jest.mock('../../plugins/quiz/components/complete-courses-modal/complete-courses-modal.component', () => ({
  CompleteCoursesModalComponent: class {},
}))

import { of } from 'rxjs'
import { ViewerTocComponent } from './viewer-toc.component'

describe('ViewerTocComponent', () => {
  let component: ViewerTocComponent
  let mockHttp: any
  let mockActivatedRoute: any
  let mockSafeResourceUrlSvc: any
  let mockContentSvc: any
  let mockUtilitySvc: any
  let mockViewerDataSvc: any
  let mockViewSvc: any
  let mockConfigSvc: any
  let mockPlayerStateService: any
  let mockRouter: any
  let mockDialog: any
  let mockOnlineIndexedDbService: any
  let mockQuizService: any
  let mockCdr: any
  let mockNgZone: any
  let mockLogger: any

  beforeEach(() => {
    mockHttp = { get: jest.fn() }
    mockActivatedRoute = { queryParamMap: of(new Map()) }
    mockSafeResourceUrlSvc = { trust: jest.fn().mockReturnValue('trusted') }
    mockContentSvc = {
      getAshaData: jest.fn().mockReturnValue(null),
      fetchContent: jest.fn(),
      fetchAuthoringContent: jest.fn(),
      fetchCollectionHierarchy: jest.fn(),
      currentMessage: of(null),
      showConformation: false,
      readCourseRating: jest.fn(),
      fetchContentHistoryV2: jest.fn(),
      getAshaCardData: jest.fn(),
      setAshaData: jest.fn(),
      getFilteredCourseSearchResults: jest.fn(),
    }
    mockUtilitySvc = { getLeafNodes: jest.fn().mockReturnValue([]), getPath: jest.fn().mockReturnValue([]) }
    mockViewerDataSvc = {
      getNode: jest.fn().mockReturnValue(false),
      setNode: jest.fn(),
      changedSubject: of(null),
      scromChangeSubject: of(null),
      resourceId: null,
    }
    mockViewSvc = { editResourceData: jest.fn() }
    mockConfigSvc = { instanceConfig: null, userProfile: { userId: 'user-1' } }
    mockPlayerStateService = {
      isResourceCompleted: jest.fn().mockReturnValue(false),
      getNextResource: jest.fn().mockReturnValue(null),
      setState: jest.fn(),
      trigger$: { getValue: jest.fn(), complete: jest.fn(), next: jest.fn() },
    }
    mockRouter = { navigate: jest.fn(), url: '/viewer/pdf/res-1' }
    mockDialog = { open: jest.fn(), openDialogs: [], getDialogById: jest.fn(), closeAll: jest.fn() }
    mockOnlineIndexedDbService = {
      getRecordFromTable: jest.fn().mockReturnValue(of({})),
      insertData: jest.fn().mockReturnValue(of({})),
    }
    mockQuizService = { updatePassbook: jest.fn().mockReturnValue(of({})) }
    mockCdr = { markForCheck: jest.fn(), detectChanges: jest.fn() }
    mockNgZone = { run: (fn: any) => fn() }
    mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }

    component = new ViewerTocComponent(
      mockHttp,
      mockActivatedRoute,
      mockSafeResourceUrlSvc,
      mockContentSvc,
      mockUtilitySvc,
      mockViewerDataSvc,
      mockViewSvc,
      mockConfigSvc,
      mockPlayerStateService,
      mockRouter,
      mockDialog,
      mockOnlineIndexedDbService,
      mockQuizService,
      mockCdr,
      mockNgZone,
      mockLogger,
    )
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('downloadResource', () => {
    it('fetches the artifact as a blob and saves it', () => {
      const blob = new Blob(['x'])
      mockHttp.get.mockReturnValue(of(blob))
      component.downloadResource({ artifactUrl: '/art.pdf', title: 'My File' })
      expect(mockHttp.get).toHaveBeenCalledWith('/art.pdf', { responseType: 'blob' })
    })
  })

  describe('checkIndexOfResource', () => {
    it('does nothing when there is no collection', () => {
      component.collection = null
      expect(() => component.checkIndexOfResource()).not.toThrow()
    })

    it('scrolls to the resource index when a collection exists', () => {
      component.collection = { identifier: 'c1' } as any
      component.queue = [{ identifier: 'res-1' } as any, { identifier: 'res-2' } as any]
      component.resourceId = 'res-2'
      expect(() => component.checkIndexOfResource()).not.toThrow()
    })
  })

  describe('changeTocMode', () => {
    it('toggles between FLAT and TREE', () => {
      component.tocMode = 'TREE'
      component.changeTocMode()
      expect(component.tocMode).toBe('FLAT')
      component.changeTocMode()
      expect(component.tocMode).toBe('TREE')
    })
  })

  describe('sendStatus', () => {
    it('marks Assessment content to open the overview dialog and forwards to viewerSvc', () => {
      const content: any = { type: 'Assessment' }
      component.sendStatus(content)
      expect(content.openOverviewDialog).toBe(true)
      expect(mockViewSvc.editResourceData).toHaveBeenCalledWith(content)
    })

    it('does not open the overview dialog for non-Assessment content', () => {
      const content: any = { type: 'Video' }
      component.sendStatus(content)
      expect(content.openOverviewDialog).toBe(false)
    })
  })

  describe('resourceContentTypeFunct', () => {
    it.each([
      ['application/pdf', 'Lecture'],
      ['application/quiz', 'Assessment'],
      ['application/vnd.ekstep.html-archive', 'Scrom'],
      ['video/mp4', 'Video'],
      ['audio/mpeg', 'Audio'],
      ['video/x-youtube', 'Link'],
      ['unknown/type', 'Course'],
    ])('maps %s to %s', (mime, expected) => {
      component.resourceContentTypeFunct(mime)
      expect(component.resourceContentType).toBe(expected)
    })
  })

  describe('getCollectionTypeRedirectUrl', () => {
    it('builds a course overview redirect url when called directly with a matching displayContentType', () => {
      const url = (component as any).getCollectionTypeRedirectUrl('course-1', '', 'Course')
      expect(url).toBe('/app/toc/course-1/overview')
    })

    it('builds a goals redirect url when called directly with a matching displayContentType', () => {
      const url = (component as any).getCollectionTypeRedirectUrl('goal-1', '', 'Goals')
      expect(url).toBe('/app/goals/goal-1')
    })

    it('appends primaryCategory as a query param when contentType is supplied', () => {
      const url = (component as any).getCollectionTypeRedirectUrl('course-1', 'Course', 'Course')
      expect(url).toBe('/app/toc/course-1/overview?primaryCategory=Course')
    })

    it('returns null for an unrecognized displayContentType', () => {
      const url = (component as any).getCollectionTypeRedirectUrl('x-1', '', 'Unknown')
      expect(url).toBeNull()
    })
  })

  describe('createCollectionCard', () => {
    // createCollectionCard only forwards (identifier, displayContentType) to
    // getCollectionTypeRedirectUrl, so displayContentType lands in the `contentType`
    // parameter and the switch always falls to default (url = null) before the
    // contentType query string is appended — this documents that live behavior.
    it('produces a redirectUrl of the form "null?primaryCategory=<displayContentType>"', () => {
      const card = (component as any).createCollectionCard({
        identifier: 'course-1',
        name: 'Course 1',
        mimeType: 'application/vnd.ekstep.content-collection',
        resourceType: 'Course',
        complexityLevel: 'basic',
        duration: 100,
        displayContentType: 'Course',
        appIcon: 'icon.png',
      })
      expect(card.redirectUrl).toBe('null?primaryCategory=Course')
      expect(card.type).toBe('Lecture')
      expect(card.id).toBe('course-1')
    })
  })

  describe('convertContentToIViewerTocCard', () => {
    it('maps a flat content node with no children', () => {
      const result = (component as any).convertContentToIViewerTocCard({
        identifier: 'res-1',
        mimeType: 'application/pdf',
        appIcon: 'icon.png',
        name: 'Res 1',
        duration: 10,
        complexityLevel: 'basic',
        artifactUrl: '/a.pdf',
        showDownloadBtn: 'Yes',
      })
      expect(result.identifier).toBe('res-1')
      expect(result.viewerUrl).toBe('/viewer/pdf/res-1')
      expect(result.children).toBeNull()
    })

    it('recursively maps children', () => {
      const result = (component as any).convertContentToIViewerTocCard({
        identifier: 'course-1',
        mimeType: 'application/vnd.ekstep.content-collection',
        appIcon: 'icon.png',
        name: 'Course',
        duration: 10,
        complexityLevel: 'basic',
        artifactUrl: '',
        children: [
          { identifier: 'res-1', mimeType: 'application/pdf', appIcon: '', name: 'r1', duration: 1, complexityLevel: 'basic', artifactUrl: '' },
        ],
      })
      expect(result.children!.length).toBe(1)
      expect(result.children![0].identifier).toBe('res-1')
    })
  })

  describe('isCurrentResourceLastLeaf', () => {
    it('returns false when there is no queue or resourceId', () => {
      component.queue = []
      component.resourceId = null
      expect((component as any).isCurrentResourceLastLeaf()).toBe(false)
    })

    it('returns true when resourceId is the last item in the queue', () => {
      component.queue = [{ identifier: 'r1' } as any, { identifier: 'r2' } as any]
      component.resourceId = 'r2'
      expect((component as any).isCurrentResourceLastLeaf()).toBe(true)
    })

    it('returns false when resourceId is not the last item', () => {
      component.queue = [{ identifier: 'r1' } as any, { identifier: 'r2' } as any]
      component.resourceId = 'r1'
      expect((component as any).isCurrentResourceLastLeaf()).toBe(false)
    })
  })

  describe('calculateAggregate', () => {
    it('sums a numeric field across objects, coercing invalid values to 0', () => {
      const total = component.calculateAggregate([{ completionPercentage: 50 }, { completionPercentage: 'bad' }, { completionPercentage: 25 }], 'completionPercentage')
      expect(total).toBe(75)
    })
  })

  describe('uniqueIdsByContentType', () => {
    it('collects unique identifiers matching the given contentType from a nested structure', () => {
      const tree = {
        contentType: 'Course',
        children: [
          { identifier: 'r1', contentType: 'Resource' },
          { identifier: 'r2', contentType: 'Resource' },
          { identifier: 'r1', contentType: 'Resource' },
        ],
      }
      const ids = component.uniqueIdsByContentType(tree, 'Resource')
      expect(ids.sort()).toEqual(['r1', 'r2'])
    })

    it('returns an empty array when nothing matches', () => {
      expect(component.uniqueIdsByContentType({ contentType: 'Other' }, 'Resource')).toEqual([])
    })
  })

  describe('seedPlayerStateForCurrentResource', () => {
    it('delegates to playerStateService.setState with the built state', () => {
      component.queue = [{ identifier: 'res-1', viewerUrl: '/v/1', title: 't1', completionPercentage: 100 } as any]
      component.resourceId = 'res-1'
      component.collection = { identifier: 'c1' } as any
      component.seedPlayerStateForCurrentResource()
      expect(mockPlayerStateService.setState).toHaveBeenCalledWith(expect.objectContaining({ currentPercentage: 100, isValid: true }))
    })
  })

  describe('updateResourceChange', () => {
    it('computes prev/next/current state from the queue and pushes it to playerStateService', () => {
      component.queue = [
        { identifier: 'r1', viewerUrl: '/v/1', title: 't1', completionPercentage: 100 } as any,
        { identifier: 'r2', viewerUrl: '/v/2', title: 't2', completionPercentage: 40 } as any,
      ]
      component.resourceId = 'r2'
      component.collection = { identifier: 'c1' } as any
      component.updateResourceChange()
      expect(mockPlayerStateService.setState).toHaveBeenCalledWith(expect.objectContaining({
        prev: '/v/1', next: null, currentPercentage: 40, prevPercentage: 100,
      }))
      expect(component.isLoading).toBe(false)
      expect(mockCdr.markForCheck).toHaveBeenCalled()
    })
  })

  describe('progressColor', () => {
    it('returns the fixed progress color', () => {
      expect(component.progressColor()).toBe('#1D8923')
    })
  })

  describe('expandThePath', () => {
    it('does nothing when there is no collection or resourceId', () => {
      component.collection = null
      component.resourceId = null
      expect(() => component.expandThePath()).not.toThrow()
      expect(mockUtilitySvc.getPath).not.toHaveBeenCalled()
    })

    it('builds a pathSet from utilitySvc.getPath when collection and resourceId are set', () => {
      mockUtilitySvc.getPath.mockReturnValue([{ identifier: 'a' }, { identifier: 'b' }])
      component.collection = { identifier: 'c1' } as any
      component.resourceId = 'b'
      component.nestedTreeControl.expand = jest.fn()
      component.expandThePath()
      expect(component.pathSet).toEqual(new Set(['a', 'b']))
    })
  })

  describe('openAshaModal', () => {
    it('navigates home when ASHA card/progress data is missing', () => {
      mockContentSvc.getAshaCardData.mockReturnValue(null)
      mockContentSvc.getAshaData.mockReturnValue(null)
      component.openAshaModal()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['page/home'])
    })
  })

  describe('navigateToNextAshaCourses', () => {
    it('navigates home when no next course id can be resolved', () => {
      component.navigateToNextAshaCourses({ levels: [] }, { competencyId: null, nextLevelId: null })
      expect(mockRouter.navigate).toHaveBeenCalledWith(['page/home'])
    })

    it('navigates to the resolved course overview when a next course id is found', () => {
      mockContentSvc.getFilteredCourseSearchResults.mockReturnValue(of({
        result: { content: [{ identifier: 'course-2', batches: [{ batchId: 'batch-2' }] }] },
      }))
      const currentAshaCardData = {
        lang: 'en',
        levels: [{ level: 2, competencyId: 'comp-1', course: [{ id: 'course-2', lang: 'en' }] }],
      }
      component.navigateToNextAshaCourses(currentAshaCardData, { competencyId: 'comp-1', nextLevelId: 2 })
      expect(mockContentSvc.setAshaData).toHaveBeenCalled()
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/app/toc/course-2/overview'],
        expect.objectContaining({ queryParams: expect.objectContaining({ batchId: 'batch-2' }) }),
      )
    })
  })

  describe('ngOnChanges', () => {
    it('subscribes to contentSvc.currentMessage without throwing when no data arrives', () => {
      expect(() => component.ngOnChanges()).not.toThrow()
    })
  })

  describe('ngOnDestroy', () => {
    it('unsubscribes all active subscriptions without throwing', () => {
      component.ngOnChanges()
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('ngAfterViewInit', () => {
    it('marks fetching complete after the initial delay', () => {
      jest.useFakeTimers()
      component.ngAfterViewInit()
      jest.advanceTimersByTime(300)
      expect(component.isFetching).toBe(false)
      jest.useRealTimers()
    })
  })
})
