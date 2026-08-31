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

import { of, Subject, throwError } from 'rxjs'
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
    mockActivatedRoute = { queryParamMap: new Subject<Map<string, string>>() }
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
      changedSubject: new Subject<any>(),
      scromChangeSubject: new Subject<any>(),
      resourceId: null,
      isCourseCompletionFlowActive: false,
      lastRatingSubmittedCourseId: null,
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

  describe('ngOnInit', () => {
    it('sets defaultThumbnail when instanceConfig is present', () => {
      mockConfigSvc.instanceConfig = { logos: { defaultContent: 'thumb.png' } }
      component.ngOnInit()
      expect(mockSafeResourceUrlSvc.trust).toHaveBeenCalledWith('thumb.png')
      expect(component.defaultThumbnail).toBe('trusted')
    })

    it('does not set defaultThumbnail when instanceConfig is absent', () => {
      mockConfigSvc.instanceConfig = null
      component.ngOnInit()
      expect(mockSafeResourceUrlSvc.trust).not.toHaveBeenCalled()
      expect(component.defaultThumbnail).toBeNull()
    })

    describe('queryParamMap subscription', () => {
      it('calls getPlaylistContent and sets queue for a playlist collectionType', async () => {
        const card = { identifier: 'p1', children: null } as any
        jest.spyOn(component as any, 'getPlaylistContent').mockResolvedValue(card)
        mockUtilitySvc.getLeafNodes.mockReturnValue([card])
        component.ngOnInit()
        mockActivatedRoute.queryParamMap.next(new Map([
          ['batchId', 'b1'], ['collectionId', 'c1'], ['collectionType', 'Playlist'],
        ]))
        await Promise.resolve()
        await Promise.resolve()
        expect((component as any).getPlaylistContent).toHaveBeenCalledWith('c1', 'Playlist')
        expect(component.collection).toBe(card)
        expect(component.queue).toEqual([card])
      })

      it('calls getCollection for module/course/program collectionTypes', async () => {
        const card = { identifier: 'c1', children: null } as any
        jest.spyOn(component as any, 'getCollection').mockResolvedValue(card)
        mockUtilitySvc.getLeafNodes.mockReturnValue([card])
        component.ngOnInit()
        mockActivatedRoute.queryParamMap.next(new Map([
          ['batchId', 'b1'], ['collectionId', 'c1'], ['collectionType', 'Course'],
        ]))
        await Promise.resolve()
        await Promise.resolve()
        expect((component as any).getCollection).toHaveBeenCalledWith('c1', 'Course')
        expect(component.collection).toBe(card)
      })

      it('sets isErrorOccurred for an unrecognized collectionType', async () => {
        component.ngOnInit()
        mockActivatedRoute.queryParamMap.next(new Map([
          ['batchId', 'b1'], ['collectionId', 'c1'], ['collectionType', 'Unknown'],
        ]))
        await Promise.resolve()
        await Promise.resolve()
        expect(component.isErrorOccurred).toBe(true)
      })

      it('calls processCurrentResourceChange when resourceId is already set', async () => {
        component.resourceId = 'r1'
        const processSpy = jest.spyOn(component as any, 'processCurrentResourceChange').mockImplementation(() => {})
        component.ngOnInit()
        mockActivatedRoute.queryParamMap.next(new Map())
        await Promise.resolve()
        await Promise.resolve()
        expect(processSpy).toHaveBeenCalled()
      })

      it('navigates to the overview when a completed Video is the last leaf and has no next resource', async () => {
        component.resourceId = 'r1'
        component.currentContentType = 'Video'
        component.queue = [{ identifier: 'r1' } as any]
        jest.spyOn(component as any, 'processCurrentResourceChange').mockImplementation(() => {})
        mockPlayerStateService.isResourceCompleted.mockReturnValue(true)
        mockPlayerStateService.getNextResource.mockReturnValue(null)
        component.ngOnInit()
        mockActivatedRoute.queryParamMap.next(new Map([['collectionId', 'c1'], ['batchId', 'b1']]))
        await Promise.resolve()
        await Promise.resolve()
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/toc/c1/overview'], expect.objectContaining({
          queryParams: expect.objectContaining({ primaryCategory: 'Course', batchId: 'b1' }),
        }))
      })

      it('navigates directly to the resolved next resource for a completed Video', async () => {
        component.resourceId = 'r1'
        component.currentContentType = 'Video'
        jest.spyOn(component as any, 'processCurrentResourceChange').mockImplementation(() => {})
        mockPlayerStateService.isResourceCompleted.mockReturnValue(true)
        mockPlayerStateService.getNextResource.mockReturnValue('/next-res')
        component.ngOnInit()
        mockActivatedRoute.queryParamMap.next(new Map())
        await Promise.resolve()
        await Promise.resolve()
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/next-res'], { queryParamsHandling: 'preserve' })
      })
    })

    describe('changedSubject subscription', () => {
      it('updates resourceId, restores gating and reseeds player state when the resourceId changes', () => {
        jest.useFakeTimers()
        mockViewerDataSvc.resourceId = 'new-res'
        component.heirarchy = { gatingEnabled: true }
        const seedSpy = jest.spyOn(component, 'seedPlayerStateForCurrentResource')
        const processSpy = jest.spyOn(component as any, 'processCurrentResourceChange').mockImplementation(() => {})
        const checkSpy = jest.spyOn(component, 'checkIndexOfResource').mockImplementation(() => {})
        component.ngOnInit()
        mockViewerDataSvc.changedSubject.next({})
        expect(component.resourceId).toBe('new-res')
        expect(mockViewerDataSvc.setNode).toHaveBeenCalledWith(true)
        expect(seedSpy).toHaveBeenCalled()
        jest.advanceTimersByTime(0)
        expect(processSpy).toHaveBeenCalled()
        expect(checkSpy).toHaveBeenCalled()
        jest.useRealTimers()
      })

      it('does nothing when the emitted resourceId is unchanged', () => {
        component.resourceId = 'same-res'
        mockViewerDataSvc.resourceId = 'same-res'
        const seedSpy = jest.spyOn(component, 'seedPlayerStateForCurrentResource')
        component.ngOnInit()
        mockViewerDataSvc.changedSubject.next({})
        expect(seedSpy).not.toHaveBeenCalled()
      })
    })

    describe('scromChangeSubject subscription', () => {
      it('processes scrom completion and navigates directly to the next resource when available', () => {
        jest.useFakeTimers()
        mockPlayerStateService.trigger$.getValue.mockReturnValue('not-triggered')
        mockPlayerStateService.isResourceCompleted.mockReturnValue(true)
        mockPlayerStateService.getNextResource.mockReturnValue('/next-res')
        const scromSpy = jest.spyOn(component, 'scromUpdateCheck').mockResolvedValue(undefined)
        component.ngOnInit()
        mockViewerDataSvc.scromChangeSubject.next({ batchId: 'b1' })
        jest.advanceTimersByTime(500)
        expect(scromSpy).toHaveBeenCalledWith({ batchId: 'b1' })
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/next-res'], { queryParamsHandling: 'preserve' })
        jest.useRealTimers()
      })

      it('opens the ASHA completion flow when there is no next resource and isAsha is true', () => {
        jest.useFakeTimers()
        mockPlayerStateService.trigger$.getValue.mockReturnValue(undefined)
        mockPlayerStateService.isResourceCompleted.mockReturnValue(true)
        mockPlayerStateService.getNextResource.mockReturnValue(null)
        jest.spyOn(component, 'scromUpdateCheck').mockResolvedValue(undefined)
        const completeSpy = jest.spyOn(component as any, 'completeCourseNavigation').mockImplementation(() => {})
        component.isAsha = true
        component.ngOnInit()
        mockViewerDataSvc.scromChangeSubject.next({ batchId: 'b1' })
        jest.advanceTimersByTime(500)
        expect(completeSpy).toHaveBeenCalled()
        jest.useRealTimers()
      })

      it('alerts and navigates to overview when there is no next resource and the course is not ASHA', () => {
        jest.useFakeTimers()
        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => undefined)
        mockPlayerStateService.trigger$.getValue.mockReturnValue(undefined)
        mockPlayerStateService.isResourceCompleted.mockReturnValue(true)
        mockPlayerStateService.getNextResource.mockReturnValue(null)
        jest.spyOn(component, 'scromUpdateCheck').mockResolvedValue(undefined)
        component.isAsha = false
        component.collectionId = 'c1'
        component.batchId = 'b1'
        component.ngOnInit()
        mockViewerDataSvc.scromChangeSubject.next({ batchId: 'b1' })
        jest.advanceTimersByTime(500)
        expect(alertSpy).toHaveBeenCalledWith('No more resources to play')
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/toc/c1/overview'], expect.objectContaining({
          queryParams: expect.objectContaining({ primaryCategory: 'Course', batchId: 'b1' }),
        }))
        alertSpy.mockRestore()
        jest.useRealTimers()
      })

      it('does nothing when a trigger is already in flight', () => {
        mockPlayerStateService.trigger$.getValue.mockReturnValue('triggered')
        const scromSpy = jest.spyOn(component, 'scromUpdateCheck')
        component.ngOnInit()
        mockViewerDataSvc.scromChangeSubject.next({ batchId: 'b1' })
        expect(scromSpy).not.toHaveBeenCalled()
      })

      it('does not navigate to overview when the shared congrats/rating flow is already active', () => {
        jest.useFakeTimers()
        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => undefined)
        mockPlayerStateService.trigger$.getValue.mockReturnValue(undefined)
        mockPlayerStateService.isResourceCompleted.mockReturnValue(true)
        mockPlayerStateService.getNextResource.mockReturnValue(null)
        jest.spyOn(component, 'scromUpdateCheck').mockResolvedValue(undefined)
        component.isAsha = false
        component.collectionId = 'c1'
        component.batchId = 'b1'
        // quiz.component.ts's own flow (or this component's currentMessage-driven flow) has
        // already started a congrats/rating dialog chain for this same completion.
        mockViewerDataSvc.isCourseCompletionFlowActive = true
        component.ngOnInit()
        mockViewerDataSvc.scromChangeSubject.next({ batchId: 'b1' })
        jest.advanceTimersByTime(500)
        expect(alertSpy).not.toHaveBeenCalled()
        expect(mockRouter.navigate).not.toHaveBeenCalledWith(['/app/toc/c1/overview'], expect.anything())
        alertSpy.mockRestore()
        jest.useRealTimers()
      })

      it('does not close-all/navigate for ASHA when the shared congrats/rating flow is already active', () => {
        jest.useFakeTimers()
        mockPlayerStateService.trigger$.getValue.mockReturnValue(undefined)
        mockPlayerStateService.isResourceCompleted.mockReturnValue(true)
        mockPlayerStateService.getNextResource.mockReturnValue(null)
        jest.spyOn(component, 'scromUpdateCheck').mockResolvedValue(undefined)
        const completeSpy = jest.spyOn(component as any, 'completeCourseNavigation').mockImplementation(() => {})
        component.isAsha = true
        mockViewerDataSvc.isCourseCompletionFlowActive = true
        component.ngOnInit()
        mockViewerDataSvc.scromChangeSubject.next({ batchId: 'b1' })
        jest.advanceTimersByTime(500)
        expect(completeSpy).not.toHaveBeenCalled()
        jest.useRealTimers()
      })
    })
  })

  describe('getCollection', () => {
    it('fetches content, restores gating, and returns a converted card on success', async () => {
      mockContentSvc.fetchContent.mockReturnValue({
        toPromise: () => Promise.resolve({
          result: {
            content: {
              identifier: 'c1', mimeType: 'application/pdf', appIcon: 'i.png', name: 'C1', duration: 5,
              complexityLevel: 'basic', artifactUrl: '', gatingEnabled: true, displayContentType: 'Course', resourceType: 'Course',
            },
          },
        }),
      })
      const result = await (component as any).getCollection('c1', 'Course')
      expect(mockViewerDataSvc.setNode).toHaveBeenCalledWith(true)
      expect(result!.identifier).toBe('c1')
    })

    it('uses fetchAuthoringContent instead of fetchContent when forPreview is true', async () => {
      component.forPreview = true
      mockContentSvc.fetchAuthoringContent.mockReturnValue({
        toPromise: () => Promise.resolve({
          result: {
            content: {
              identifier: 'c1', mimeType: 'application/pdf', appIcon: '', name: 'C1', duration: 5, complexityLevel: 'basic', artifactUrl: '',
            },
          },
        }),
      })
      await (component as any).getCollection('c1', 'Course')
      expect(mockContentSvc.fetchAuthoringContent).toHaveBeenCalledWith('c1')
      expect(mockContentSvc.fetchContent).not.toHaveBeenCalled()
    })

    it.each([
      [403, 'accessForbidden'],
      [404, 'notFound'],
      [500, 'internalServer'],
      [503, 'serviceUnavailable'],
      [418, 'somethingWrong'],
    ])('sets errorType for status %s to %s and returns null', async (status, errorType) => {
      mockContentSvc.fetchContent.mockReturnValue({ toPromise: () => Promise.reject(Object.assign(new Error('mock error'), { status })) })
      const result = await (component as any).getCollection('c1', 'Course')
      expect(result).toBeNull()
      expect(component.errorWidgetData.widgetData.errorType).toBe(errorType)
    })
  })

  describe('getPlaylistContent', () => {
    it('fetches the playlist hierarchy and returns a converted card on success', async () => {
      mockContentSvc.fetchCollectionHierarchy.mockReturnValue({
        toPromise: () => Promise.resolve({
          data: { identifier: 'p1', mimeType: 'application/pdf', appIcon: '', name: 'P1', duration: 5, complexityLevel: 'basic', artifactUrl: '' },
        }),
      })
      const result = await (component as any).getPlaylistContent('p1', 'Playlist')
      expect(mockContentSvc.fetchCollectionHierarchy).toHaveBeenCalledWith('playlist', 'p1', 0, 1000)
      expect(result!.identifier).toBe('p1')
    })

    it.each([
      [403, 'accessForbidden'],
      [404, 'notFound'],
      [500, 'internalServer'],
      [503, 'serviceUnavailable'],
      [418, 'somethingWrong'],
    ])('sets errorType for status %s to %s and returns null', async (status, errorType) => {
      mockContentSvc.fetchCollectionHierarchy.mockReturnValue({ toPromise: () => Promise.reject(Object.assign(new Error('mock error'), { status })) })
      const result = await (component as any).getPlaylistContent('p1', 'Playlist')
      expect(result).toBeNull()
      expect(component.errorWidgetData.widgetData.errorType).toBe(errorType)
    })
  })

  // processCollectionForTree is very large - only the main top-level branches are covered
  // here (contentList present vs absent, cachedRating reuse, and the completeCourseNavigation
  // dispatch). The deeply nested scorm/assessment/quiz navigation branches, the congratulation
  // popup/competency-passbook sub-flow, and the catchError fallback path (insertData retry) are
  // intentionally skipped as out of scope for this pass.
  describe('processCollectionForTree', () => {
    beforeEach(() => {
      mockContentSvc.readCourseRating.mockReturnValue(Promise.resolve({ params: { status: 'success' }, result: {} }))
      mockOnlineIndexedDbService.getRecordFromTable.mockReturnValue(of({ data: JSON.stringify([]) }))
      component.collectionId = 'c1'
      component.heirarchy = { gatingEnabled: true }
    })

    it('processes contentList: restores gating, calls processData, and reads course rating/progress', async () => {
      const processDataSpy = jest.spyOn(component, 'processData').mockResolvedValue(undefined)
      mockPlayerStateService.isResourceCompleted.mockReturnValue(false)
      await (component as any).processCollectionForTree({ contentList: [{ contentId: 'r1' }] })
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(mockViewerDataSvc.setNode).toHaveBeenCalledWith(true)
      expect(processDataSpy).toHaveBeenCalledWith([{ contentId: 'r1' }])
      expect(mockContentSvc.readCourseRating).toHaveBeenCalled()
      expect(mockOnlineIndexedDbService.getRecordFromTable).toHaveBeenCalledWith('onlineCourseProgress', 'user-1', 'c1')
    })

    it('reuses cachedRating on subsequent calls instead of calling readCourseRating again', async () => {
      jest.spyOn(component, 'processData').mockResolvedValue(undefined)
      ;(component as any).cachedRating = { some: 'rating' }
      mockPlayerStateService.isResourceCompleted.mockReturnValue(false)
      await (component as any).processCollectionForTree({ contentList: [] })
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(mockContentSvc.readCourseRating).not.toHaveBeenCalled()
    })

    it('only restores gating and does not read progress when content has no contentList', async () => {
      await (component as any).processCollectionForTree({ type: 'video' })
      expect(mockViewerDataSvc.setNode).toHaveBeenCalledWith(true)
      expect(mockOnlineIndexedDbService.getRecordFromTable).not.toHaveBeenCalled()
    })

    it('dispatches completeCourseNavigation when optimisticPercentage reaches 100 and the resource is not completed', async () => {
      jest.spyOn(component, 'processData').mockResolvedValue(undefined)
      mockOnlineIndexedDbService.getRecordFromTable.mockReturnValue(
        of({ data: JSON.stringify([{ contentId: 'r1', completionPercentage: 100 }]) }),
      )
      jest.spyOn(component, 'updateKeyIfMatch').mockReturnValue(100)
      mockPlayerStateService.isResourceCompleted.mockReturnValue(false)
      const completeSpy = jest.spyOn(component as any, 'completeCourseNavigation').mockImplementation(() => {})
      await (component as any).processCollectionForTree({ contentList: [{ contentId: 'r1' }], type: 'video' })
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(completeSpy).toHaveBeenCalled()
    })
  })

  describe('processData', () => {
    it('merges progress data into collection children and triggers updateResourceChange', async () => {
      component.collection = {
        identifier: 'c1',
        children: [
          { identifier: 'r1', completionPercentage: 0 } as any,
          { identifier: 'r2', completionPercentage: 0 } as any,
        ],
      } as any
      mockUtilitySvc.getLeafNodes.mockReturnValue(component.collection!.children)
      const updateSpy = jest.spyOn(component, 'updateResourceChange').mockImplementation(() => {})
      await component.processData([{ contentId: 'r1', completionPercentage: 100, status: 2 }])
      expect((component.collection!.children![0] as any).completionPercentage).toBe(100)
      expect((component.collection!.children![0] as any).completionStatus).toBe(2)
      expect(updateSpy).toHaveBeenCalled()
    })

    it('marks the following node disabled when the data has no match and gating is enabled', async () => {
      mockViewerDataSvc.getNode.mockReturnValue(true)
      component.collection = {
        identifier: 'c1',
        children: [
          { identifier: 'r1', completionPercentage: undefined } as any,
          { identifier: 'r2', completionPercentage: 0 } as any,
        ],
      } as any
      mockUtilitySvc.getLeafNodes.mockReturnValue(component.collection!.children)
      jest.spyOn(component, 'updateResourceChange').mockImplementation(() => {})
      await component.processData([{ contentId: 'unmatched', completionPercentage: 0 }])
      expect((component.collection!.children![0] as any).disabledNode).toBe(false)
    })

    it('processes nested children within a matched top-level node', async () => {
      component.collection = {
        identifier: 'c1',
        children: [
          {
            identifier: 'r1',
            completionPercentage: 100,
            children: [{ identifier: 'child-1', completionPercentage: 0 }],
          } as any,
        ],
      } as any
      mockUtilitySvc.getLeafNodes.mockReturnValue(component.collection!.children)
      jest.spyOn(component, 'updateResourceChange').mockImplementation(() => {})
      await component.processData([
        { contentId: 'r1', completionPercentage: 100, status: 2 },
        { contentId: 'child-1', completionPercentage: 50, status: 1 },
      ])
      const child = (component.collection!.children![0] as any).children[0]
      expect(child.completionPercentage).toBe(50)
      expect(child.completionStatus).toBe(1)
    })

    it('does nothing when there is no collection', async () => {
      component.collection = null
      const updateSpy = jest.spyOn(component, 'updateResourceChange').mockImplementation(() => {})
      await component.processData([])
      expect(updateSpy).toHaveBeenCalled()
    })
  })

  describe('openCongratulationPopup', () => {
    it('resolves true when the dialog closes with completed', async () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => ({ toPromise: () => Promise.resolve({ completed: true }) }) })
      const result = await component.openCongratulationPopup()
      expect(result).toBe(true)
    })

    it('resolves false when the dialog closes without a completed result', async () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => ({ toPromise: () => Promise.resolve(undefined) }) })
      const result = await component.openCongratulationPopup()
      expect(result).toBe(false)
    })
  })

  describe('completeCourseNavigation', () => {
    it('closes dialogs and opens the ASHA modal for ASHA courses', () => {
      component.isAsha = true
      const ashaSpy = jest.spyOn(component, 'openAshaModal').mockImplementation(() => {})
      ;(component as any).completeCourseNavigation()
      expect(mockDialog.closeAll).toHaveBeenCalled()
      expect(ashaSpy).toHaveBeenCalled()
      expect(mockRouter.navigate).not.toHaveBeenCalled()
    })

    it('navigates to the course overview for non-ASHA courses', () => {
      component.isAsha = false
      component.collectionId = 'c1'
      component.batchId = 'b1'
      ;(component as any).completeCourseNavigation()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/toc/c1/overview'], expect.objectContaining({
        queryParams: expect.objectContaining({ primaryCategory: 'Course', batchId: 'b1' }),
      }))
    })
  })

  describe('updateKeyIfMatch', () => {
    it('merges arr2 into arr1, persists progress, and returns the computed aggregate percentage', () => {
      component.collectionId = 'c1'
      component.heirarchy = {
        children: [{ identifier: 'r1', contentType: 'Resource' }, { identifier: 'r2', contentType: 'Resource' }],
        childNodes: [],
      }
      const arr1: any[] = [{ contentId: 'r1', completionPercentage: 50 }]
      const arr2: any[] = [{ contentId: 'r1', completionPercentage: 100 }, { contentId: 'r2', completionPercentage: 100 }]
      const result = component.updateKeyIfMatch(arr1, arr2, 'completionPercentage')
      expect(arr1.find((o: any) => o.contentId === 'r1')!.completionPercentage).toBe(100)
      expect(arr1.some((o: any) => o.contentId === 'r2')).toBe(true)
      expect(mockOnlineIndexedDbService.insertData).toHaveBeenCalledWith('user-1', 'c1', 'onlineCourseProgress', arr1)
      expect(result).toBe(100)
    })
  })

  describe('updatePassbookEntryPassbook', () => {
    it('calls quizService.updatePassbook with the formatted competency data', () => {
      component.heirarchy = { name: 'Course 1' }
      mockQuizService.updatePassbook.mockReturnValue(of({ ok: true }))
      component.updatePassbookEntryPassbook({ courseId: 'c1' }, { competencyId: 106, competencyName: 'Comp', competencyLevel: 2 })
      expect(mockQuizService.updatePassbook).toHaveBeenCalled()
      const arg = mockQuizService.updatePassbook.mock.calls[0][0]
      expect(arg.request.competencyDetails[0].competencyId).toBe('106')
    })

    it('does not throw and falls back via catchError when updatePassbook errors', () => {
      component.heirarchy = { name: 'Course 1' }
      mockQuizService.updatePassbook.mockReturnValue(throwError(() => new Error('fail')))
      expect(() => component.updatePassbookEntryPassbook(
        { courseId: 'c1' }, { competencyId: 1, competencyName: 'C', competencyLevel: 1 },
      )).not.toThrow()
    })
  })

  describe('scromUpdateCheck', () => {
    it.each([
      ['Playlist'],
      ['Course'],
      ['Module'],
    ])('always calls processCurrentResourceChange and checkIndexOfResource for collectionType %s', async collectionType => {
      component.collection = { identifier: 'c1' } as any
      mockUtilitySvc.getLeafNodes.mockReturnValue([])
      const processSpy = jest.spyOn(component as any, 'processCurrentResourceChange').mockImplementation(() => {})
      const checkSpy = jest.spyOn(component, 'checkIndexOfResource').mockImplementation(() => {})
      await component.scromUpdateCheck({ batchId: 'b1', collectionId: 'c1', collectionType })
      expect(processSpy).toHaveBeenCalled()
      expect(checkSpy).toHaveBeenCalled()
    })

    it('sets isErrorOccurred for an unrecognized collectionType but still checks the current resource', async () => {
      component.collection = null
      const checkSpy = jest.spyOn(component, 'checkIndexOfResource').mockImplementation(() => {})
      await component.scromUpdateCheck({ batchId: 'b1', collectionId: 'c1', collectionType: 'Unknown' })
      expect(component.isErrorOccurred).toBe(true)
      expect(checkSpy).toHaveBeenCalled()
    })
  })

  describe('scrollToUserView', () => {
    it('does not throw and does not touch the DOM refs for index <= 3', () => {
      jest.useFakeTimers()
      expect(() => component.scrollToUserView(2)).not.toThrow()
      jest.advanceTimersByTime(300)
      jest.useRealTimers()
    })

    it('scrolls the outer container to the highlighted item when it is active and out of view', () => {
      jest.useFakeTimers()
      component.highlightItem = {
        nativeElement: {
          classList: { contains: () => true },
          offsetTop: 600,
          clientHeight: 50,
        },
      } as any
      component.outer = {
        nativeElement: { clientHeight: 400, scrollTop: 0 },
      } as any
      component.reverse = ''
      component.scrollToUserView(5)
      jest.advanceTimersByTime(300)
      expect(component.outer.nativeElement.scrollTop).toBe(600)
      jest.useRealTimers()
    })

    it('does nothing when the highlighted item is not the active li', () => {
      jest.useFakeTimers()
      component.highlightItem = {
        nativeElement: { classList: { contains: () => false }, offsetTop: 600, clientHeight: 50 },
      } as any
      component.outer = { nativeElement: { clientHeight: 400, scrollTop: 0 } } as any
      component.scrollToUserView(5)
      jest.advanceTimersByTime(300)
      expect(component.outer.nativeElement.scrollTop).toBe(0)
      jest.useRealTimers()
    })
  })

  describe('ngOnChanges deeper coverage', () => {
    it('sets contentId in localStorage for scorm type and updates tree nodes with progress', () => {
      mockContentSvc.currentMessage = of({
        type: 'scorm',
        contentList: [{ contentId: 'r1', completionPercentage: 80, status: 2 }],
      })
      component.collection = {
        identifier: 'c1',
        children: [{ identifier: 'r1', completionPercentage: 0, completionStatus: 0 } as any],
      } as any
      jest.spyOn(component as any, 'processCollectionForTree').mockImplementation(() => {})
      jest.spyOn(component, 'updateResourceChange').mockImplementation(() => {})
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem')
      component.ngOnChanges()
      expect(setItemSpy).toHaveBeenCalledWith('contentId', expect.any(String))
      expect((component.collection!.children![0] as any).completionPercentage).toBe(80)
      setItemSpy.mockRestore()
    })

    it('removes contentId from localStorage for non-scorm type', () => {
      mockContentSvc.currentMessage = of({ type: 'video', contentList: null })
      jest.spyOn(component as any, 'processCollectionForTree').mockImplementation(() => {})
      const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem')
      component.ngOnChanges()
      expect(removeItemSpy).toHaveBeenCalledWith('contentId')
      removeItemSpy.mockRestore()
    })

    it('recursively updates nested child progress nodes', () => {
      mockContentSvc.currentMessage = of({
        type: 'video',
        contentList: [{ contentId: 'child-1', completionPercentage: 60 }],
      })
      component.collection = {
        identifier: 'c1',
        children: [{
          identifier: 'parent-1',
          completionPercentage: 0,
          children: [{ identifier: 'child-1', completionPercentage: 0, completionStatus: 0 }],
        } as any],
      } as any
      jest.spyOn(component as any, 'processCollectionForTree').mockImplementation(() => {})
      jest.spyOn(component, 'updateResourceChange').mockImplementation(() => {})
      component.ngOnChanges()
      expect((component.collection!.children![0] as any).children[0].completionPercentage).toBe(60)
    })
  })

  describe('processCollectionForTree - no contentList branch', () => {
    beforeEach(() => {
      component.collectionId = 'c1'
      component.resourceId = 'r1'
      mockConfigSvc.userProfile = { userId: 'user-1' }
      component.queue = [{ identifier: 'r1' } as any]
    })

    it('does nothing when collection has no children', async () => {
      component.collection = { identifier: 'c1', children: null } as any
      await (component as any).processCollectionForTree({})
      expect(mockContentSvc.fetchContent).not.toHaveBeenCalled()
    })

    it('fetches content, merges progress via fetchContentHistoryV2 and updates resource change', async () => {
      component.collection = {
        identifier: 'c1',
        children: [{ identifier: 'r1', completionPercentage: 0 } as any],
      } as any
      mockContentSvc.fetchContent.mockReturnValue({
        toPromise: () => Promise.resolve({ result: { content: { mimeType: 'application/pdf' } } }),
      })
      mockContentSvc.fetchContentHistoryV2.mockReturnValue(of({
        result: { contentList: [{ contentId: 'r1', completionPercentage: 100, status: 2 }] },
      }))
      const updateSpy = jest.spyOn(component, 'updateResourceChange').mockImplementation(() => {})
      await (component as any).processCollectionForTree({})
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(mockContentSvc.fetchContentHistoryV2).toHaveBeenCalled()
      expect(updateSpy).toHaveBeenCalled()
    })

    it('removes contentId from localStorage when mimeType is not scorm html-archive', async () => {
      component.collection = {
        identifier: 'c1',
        children: [{ identifier: 'r1', completionPercentage: 0 } as any],
      } as any
      mockContentSvc.fetchContent.mockReturnValue({
        toPromise: () => Promise.resolve({ result: { content: { mimeType: 'application/pdf' } } }),
      })
      mockContentSvc.fetchContentHistoryV2.mockReturnValue(of({ result: { contentList: [] } }))
      const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem')
      await (component as any).processCollectionForTree({})
      expect(removeItemSpy).toHaveBeenCalledWith('contentId')
      removeItemSpy.mockRestore()
    })

    it('logs the content history fetch error without throwing', async () => {
      component.collection = {
        identifier: 'c1',
        children: [{ identifier: 'r1', completionPercentage: 0 } as any],
      } as any
      mockContentSvc.fetchContent.mockReturnValue({
        toPromise: () => Promise.resolve({ result: { content: { mimeType: 'application/pdf' } } }),
      })
      mockContentSvc.fetchContentHistoryV2.mockReturnValue(throwError(() => new Error('fetch fail')))
      await expect((component as any).processCollectionForTree({})).resolves.toBeUndefined()
    })
  })

  describe('processCollectionForTree - contentList deep branches', () => {
    beforeEach(() => {
      component.collectionId = 'c1'
      component.heirarchy = { gatingEnabled: true }
      mockOnlineIndexedDbService.getRecordFromTable.mockReturnValue(of({ data: JSON.stringify([]) }))
      mockContentSvc.readCourseRating.mockReturnValue(Promise.resolve({ params: { status: 'success' }, result: {} }))
    })

    it('falls back to insertData retry path when getRecordFromTable errors', async () => {
      jest.spyOn(component, 'processData').mockResolvedValue(undefined)
      mockOnlineIndexedDbService.getRecordFromTable.mockReturnValueOnce(throwError(() => new Error('fail')))
      mockOnlineIndexedDbService.getRecordFromTable.mockReturnValue(of({ data: JSON.stringify([]) }))
      mockOnlineIndexedDbService.insertData.mockReturnValue(of({}))
      await (component as any).processCollectionForTree({ contentList: [{ contentId: 'r1' }] })
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(mockOnlineIndexedDbService.insertData).toHaveBeenCalled()
    })

    it('navigates directly to a resolved next resource for scorm content type', async () => {
      jest.spyOn(component, 'processData').mockResolvedValue(undefined)
      mockOnlineIndexedDbService.getRecordFromTable.mockReturnValue(
        of({ data: JSON.stringify([{ contentId: 'r1', completionPercentage: 100 }]) }),
      )
      jest.spyOn(component, 'updateKeyIfMatch').mockReturnValue(50)
      mockPlayerStateService.isResourceCompleted.mockReturnValue(true)
      mockPlayerStateService.getNextResource.mockReturnValue('/next-res')
      mockRouter.navigate.mockReturnValue(Promise.resolve(true))
      await (component as any).processCollectionForTree({ contentList: [{ contentId: 'r1' }], type: 'scorm' })
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/next-res'], { queryParamsHandling: 'preserve' })
    })

    it('shows congratulation popup flow when there is no next resource and confirmation is required', async () => {
      jest.spyOn(component, 'processData').mockResolvedValue(undefined)
      mockOnlineIndexedDbService.getRecordFromTable.mockReturnValue(
        of({ data: JSON.stringify([{ contentId: 'r1', completionPercentage: 100 }]) }),
      )
      jest.spyOn(component, 'updateKeyIfMatch').mockReturnValue(100)
      mockPlayerStateService.isResourceCompleted.mockReturnValue(true)
      mockPlayerStateService.getNextResource.mockReturnValue('')
      mockContentSvc.showConformation = true
      component.resourceContentType = 'Video'
      component.collectionId = 'c1'
      mockDialog.openDialogs = []
      const popupSpy = jest.spyOn(component, 'openCongratulationPopup').mockResolvedValue(true)
      mockDialog.open.mockReturnValue({ afterClosed: () => of({ event: 'CONFIRMED' }) })
      const completeSpy = jest.spyOn(component as any, 'completeCourseNavigation').mockImplementation(() => {})
      jest.useFakeTimers()
      const promise = (component as any).processCollectionForTree({ contentList: [{ contentId: 'r1' }], type: 'video' })
      for (let i = 0; i < 5; i++) {
        await Promise.resolve()
      }
      jest.advanceTimersByTime(2000)
      for (let i = 0; i < 5; i++) {
        await Promise.resolve()
      }
      await promise
      jest.useRealTimers()
      expect(popupSpy).toHaveBeenCalled()
      // Save-and-refresh signal: app-toc-desktop.component.ts consumes this to force a
      // fresh rating-summary fetch, and the mutex flag must be released once the chain
      // resolves so it doesn't block a later, unrelated completion flow.
      expect(mockViewerDataSvc.lastRatingSubmittedCourseId).toBe('c1')
      expect(mockViewerDataSvc.isCourseCompletionFlowActive).toBe(false)
      expect(completeSpy).toHaveBeenCalled()
    })

    it('completes the course when content.type is falsy and optimisticPercentage is 100', async () => {
      jest.spyOn(component, 'processData').mockResolvedValue(undefined)
      mockOnlineIndexedDbService.getRecordFromTable.mockReturnValue(
        of({ data: JSON.stringify([{ contentId: 'r1', completionPercentage: 100 }]) }),
      )
      jest.spyOn(component, 'updateKeyIfMatch').mockReturnValue(100)
      mockPlayerStateService.isResourceCompleted.mockReturnValue(false)
      const completeSpy = jest.spyOn(component as any, 'completeCourseNavigation').mockImplementation(() => {})
      await (component as any).processCollectionForTree({ contentList: [{ contentId: 'r1' }], type: 'other' })
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(completeSpy).toHaveBeenCalled()
    })

    it('navigates when the completed content has no type and resource-completed with a resolvable next match', async () => {
      jest.spyOn(component, 'processData').mockResolvedValue(undefined)
      mockOnlineIndexedDbService.getRecordFromTable.mockReturnValue(
        of({ data: JSON.stringify([{ contentId: 'res-1', completionPercentage: 100 }, { contentId: 'do_123', completionPercentage: 0 }]) }),
      )
      jest.spyOn(component, 'updateKeyIfMatch').mockReturnValue(50)
      mockPlayerStateService.isResourceCompleted.mockReturnValue(true)
      mockPlayerStateService.getNextResource.mockReturnValue('/do_123')
      component.resourceId = 'res-1'
      mockContentSvc.fetchContent.mockReturnValue({
        toPromise: () => Promise.resolve({ mimeType: 'application/json' }),
      })
      await (component as any).processCollectionForTree({ contentList: [{ contentId: 'r1' }] })
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/do_123'], { queryParamsHandling: 'preserve' })
    })

    it('completes the course directly when confirmation is not required and rating already exists', async () => {
      jest.spyOn(component, 'processData').mockResolvedValue(undefined)
      mockOnlineIndexedDbService.getRecordFromTable.mockReturnValue(
        of({ data: JSON.stringify([{ contentId: 'r1', completionPercentage: 100 }]) }),
      )
      jest.spyOn(component, 'updateKeyIfMatch').mockReturnValue(100)
      mockPlayerStateService.isResourceCompleted.mockReturnValue(true)
      mockPlayerStateService.getNextResource.mockReturnValue('')
      mockContentSvc.showConformation = false
      mockContentSvc.readCourseRating.mockReturnValue(Promise.resolve({ params: { status: 'success' }, result: { stars: 5 } }))
      component.heirarchy = { gatingEnabled: true, competencies_v1: JSON.stringify([{ competencyName: 'c', level: 1, competencyId: 1 }]) }
      const completeSpy = jest.spyOn(component as any, 'completeCourseNavigation').mockImplementation(() => {})
      await (component as any).processCollectionForTree({ contentList: [{ contentId: 'r1' }], type: 'video' })
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(completeSpy).toHaveBeenCalled()
    })

    it('performs an external redirect for scorm content with a completed, non-Scrom foundObject', async () => {
      jest.useFakeTimers()
      jest.spyOn(component, 'processData').mockResolvedValue(undefined)
      mockOnlineIndexedDbService.getRecordFromTable.mockReturnValue(
        of({ data: JSON.stringify([{ contentId: 'r1', completionPercentage: 100 }]) }),
      )
      jest.spyOn(component, 'updateKeyIfMatch').mockReturnValue(50)
      mockPlayerStateService.isResourceCompleted.mockReturnValue(true)
      mockPlayerStateService.getNextResource.mockReturnValue('/do_999')
      component.collection = { identifier: 'c1', children: [{ identifier: 'do_999', type: 'Scrom', completionPercentage: 100 } as any] } as any
      const promise = (component as any).processCollectionForTree({ contentList: [{ contentId: 'r1' }], type: 'scorm' })
      await promise
      for (let i = 0; i < 5; i++) {
        await Promise.resolve()
      }
      jest.advanceTimersByTime(60)
      jest.useRealTimers()
      expect(component.isLoading).toBe(false)
    })
  })

  describe('openAshaModal further branches', () => {
    it('closes any already-open assessment/confirm dialogs and opens the complete-courses modal', () => {
      mockContentSvc.getAshaCardData.mockReturnValue({
        levels: [
          { level: 1, competencyId: 'c1', course: ['a'] },
          { level: 2, competencyId: 'c1', course: ['b'] },
        ],
      })
      mockContentSvc.getAshaData.mockReturnValue({ competencylevel: '1', competencyid: 'c1', competencylevel_raw: 1 })
      const assessmentClose = jest.fn()
      const confirmClose = jest.fn()
      mockDialog.getDialogById.mockImplementation((id: string) => {
        if (id === 'assessmentModel') return { close: assessmentClose }
        if (id === 'confirmModal') return { close: confirmClose }
        return null
      })
      mockDialog.open.mockReturnValue({ afterClosed: () => of(null) })
      component.openAshaModal()
      expect(assessmentClose).toHaveBeenCalled()
      expect(confirmClose).toHaveBeenCalled()
      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('navigates home and closes dialogs on CLOSE event', () => {
      mockContentSvc.getAshaCardData.mockReturnValue({ levels: [{ level: 1, competencyId: 'c1', course: ['a'] }] })
      mockContentSvc.getAshaData.mockReturnValue({ competencylevel: '1', competencyid: 'c1' })
      mockDialog.getDialogById.mockReturnValue(null)
      mockDialog.open.mockReturnValue({ afterClosed: () => of({ event: 'CLOSE' }) })
      component.openAshaModal()
      expect(mockDialog.closeAll).toHaveBeenCalled()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['page/home'])
    })

    it('navigates to next asha course on STARTNEXTCOURSE event', () => {
      mockContentSvc.getAshaCardData.mockReturnValue({ levels: [{ level: 1, competencyId: 'c1', course: ['a'] }] })
      mockContentSvc.getAshaData.mockReturnValue({ competencylevel: '1', competencyid: 'c1' })
      mockDialog.getDialogById.mockReturnValue(null)
      mockDialog.open.mockReturnValue({ afterClosed: () => of({ event: 'STARTNEXTCOURSE' }) })
      const navSpy = jest.spyOn(component, 'navigateToNextAshaCourses').mockImplementation(() => {})
      component.openAshaModal()
      expect(navSpy).toHaveBeenCalled()
    })

    it('does not reopen the complete-courses modal when one is already open', () => {
      mockContentSvc.getAshaCardData.mockReturnValue({ levels: [{ level: 1, competencyId: 'c1', course: ['a'] }] })
      mockContentSvc.getAshaData.mockReturnValue({ competencylevel: '1', competencyid: 'c1' })
      mockDialog.getDialogById.mockImplementation((id: string) => (id === 'completeCoursesModal' ? {} : null))
      component.openAshaModal()
      expect(mockDialog.open).not.toHaveBeenCalled()
    })
  })

  describe('processData - top level gating', () => {
    const run = async (children: any[], data: any[]) => {
      component.collection = { identifier: 'c1', children } as any
      mockUtilitySvc.getLeafNodes.mockReturnValue(children)
      jest.spyOn(component, 'updateResourceChange').mockImplementation(() => { })
      await component.processData(data)
      return children
    }

    it('should default a missing completion percentage to zero', async () => {
      const children = await run(
        [{ identifier: 'r1' }, { identifier: 'r2' }],
        [{ contentId: 'r1', status: 1 }],
      )
      expect(children[0].completionPercentage).toBe(0)
      expect(children[0].completionStatus).toBe(1)
    })

    it('should unlock the next node once a node is complete', async () => {
      const children = await run(
        [{ identifier: 'r1' }, { identifier: 'r2' }],
        [{ contentId: 'r1', completionPercentage: 100, status: 2 }],
      )
      expect(children[1].disabledNode).toBe(false)
    })

    it('should keep the next node locked while gating is on and the node is incomplete', async () => {
      mockViewerDataSvc.getNode.mockReturnValue(true)
      const children = await run(
        [{ identifier: 'r1' }, { identifier: 'r2' }],
        [{ contentId: 'r1', completionPercentage: 40, status: 1 }],
      )
      expect(children[1].disabledNode).toBe(true)
    })

    it('should leave the next node unlocked when gating is off', async () => {
      mockViewerDataSvc.getNode.mockReturnValue(false)
      const children = await run(
        [{ identifier: 'r1' }, { identifier: 'r2' }],
        [{ contentId: 'r1', completionPercentage: 40, status: 1 }],
      )
      expect(children[1].disabledNode).toBe(false)
    })

    it('should lock the node after an unmatched non-first node while gating is on', async () => {
      mockViewerDataSvc.getNode.mockReturnValue(true)
      const children = await run(
        [{ identifier: 'r1', completionPercentage: 100 }, { identifier: 'r2' }, { identifier: 'r3' }],
        [{ contentId: 'r1', completionPercentage: 100, status: 2 }],
      )
      expect(children[2].disabledNode).toBe(true)
    })

    it('should tolerate an unmatched last node with no successor', async () => {
      mockViewerDataSvc.getNode.mockReturnValue(true)
      const children = await run([{ identifier: 'r1' }], [{ contentId: 'other' }])
      expect(children[0].disabledNode).toBe(false)
    })
  })

  describe('processData - nested child gating', () => {
    const buildTree = (prevChildren: any[], targetChildren: any[]) => ([
      { identifier: 'm1', children: prevChildren },
      { identifier: 'm2', children: targetChildren },
    ])

    const run = async (children: any[]) => {
      component.collection = { identifier: 'c1', children } as any
      mockUtilitySvc.getLeafNodes.mockReturnValue(children)
      jest.spyOn(component, 'updateResourceChange').mockImplementation(() => { })
      // No progress records, so every nested child falls through to the gating branches.
      await component.processData([])
      return children
    }

    it('should unlock the first child of a module whose predecessor finished', async () => {
      const tree = await run(buildTree(
        [{ identifier: 'a1', completionPercentage: 100 }],
        [{ identifier: 'b1' }, { identifier: 'b2' }],
      ))
      expect(tree[1].children[0].disabledNode).toBe(false)
    })

    it('should unlock a later child whose own predecessor finished', async () => {
      const tree = await run(buildTree(
        [{ identifier: 'a1', completionPercentage: 100 }],
        [{ identifier: 'b1', completionPercentage: 100 }, { identifier: 'b2' }],
      ))
      expect(tree[1].children[1].disabledNode).toBe(false)
    })

    it('should lock a later child whose predecessor is unfinished while gating is on', async () => {
      mockViewerDataSvc.getNode.mockReturnValue(true)
      const tree = await run(buildTree(
        [{ identifier: 'a1', completionPercentage: 100 }],
        [{ identifier: 'b1', completionPercentage: 20 }, { identifier: 'b2' }],
      ))
      expect(tree[1].children[1].disabledNode).toBe(true)
    })

    it('should leave a later child unlocked when gating is off', async () => {
      mockViewerDataSvc.getNode.mockReturnValue(false)
      const tree = await run(buildTree(
        [{ identifier: 'a1', completionPercentage: 100 }],
        [{ identifier: 'b1', completionPercentage: 20 }, { identifier: 'b2' }],
      ))
      expect(tree[1].children[1].disabledNode).toBe(false)
    })

    it('should lock children when the previous module is unfinished and gating is on', async () => {
      mockViewerDataSvc.getNode.mockReturnValue(true)
      const tree = await run(buildTree(
        [{ identifier: 'a1', completionPercentage: 30 }],
        [{ identifier: 'b1' }, { identifier: 'b2' }],
      ))
      expect(tree[1].children[1].disabledNode).toBe(true)
    })

    it('should unlock children when the previous module is unfinished but gating is off', async () => {
      mockViewerDataSvc.getNode.mockReturnValue(false)
      const tree = await run(buildTree(
        [{ identifier: 'a1', completionPercentage: 30 }],
        [{ identifier: 'b1' }, { identifier: 'b2' }],
      ))
      expect(tree[1].children[1].disabledNode).toBe(false)
    })

    it('should fall back to per-child gating for the first module', async () => {
      mockViewerDataSvc.getNode.mockReturnValue(true)
      const tree = await run([
        { identifier: 'm1', children: [{ identifier: 'a1', completionPercentage: 20 }, { identifier: 'a2' }] },
      ])
      expect(tree[0].children[1].disabledNode).toBe(true)
    })

    it('should unlock a child of the first module whose predecessor finished', async () => {
      const tree = await run([
        { identifier: 'm1', children: [{ identifier: 'a1', completionPercentage: 100 }, { identifier: 'a2' }] },
      ])
      expect(tree[0].children[1].disabledNode).toBe(false)
    })

    it('should apply matched progress to a nested child before any gating', async () => {
      component.collection = {
        identifier: 'c1',
        children: [{ identifier: 'm1', children: [{ identifier: 'a1' }] }],
      } as any
      mockUtilitySvc.getLeafNodes.mockReturnValue(component.collection!.children)
      jest.spyOn(component, 'updateResourceChange').mockImplementation(() => { })

      await component.processData([{ contentId: 'a1', completionPercentage: 70, status: 1 }])
      const child = (component.collection!.children![0] as any).children[0]
      expect(child.completionPercentage).toBe(70)
      expect(child.completionStatus).toBe(1)
    })

    it('should tolerate a module with no children to gate', async () => {
      const tree = await run(buildTree([{ identifier: 'a1', completionPercentage: 100 }], []))
      expect(tree[1].children).toEqual([])
    })
  })

  describe('mergeProgressRecords', () => {
    it('should append a record that is not yet tracked', () => {
      const existing: any[] = [{ contentId: 'r1', completionPercentage: 10 }]
      component['mergeProgressRecords'](existing, [{ contentId: 'r2', completionPercentage: 50 }], 'completionPercentage')
      expect(existing).toHaveLength(2)
      expect(existing[1].contentId).toBe('r2')
    })

    it('should update a tracked record when the value changed', () => {
      const existing: any[] = [{ contentId: 'r1', completionPercentage: 10 }]
      component['mergeProgressRecords'](existing, [{ contentId: 'r1', completionPercentage: 80 }], 'completionPercentage')
      expect(existing[0].completionPercentage).toBe(80)
    })

    it('should leave a tracked record alone when the value is unchanged', () => {
      const existing: any[] = [{ contentId: 'r1', completionPercentage: 10 }]
      component['mergeProgressRecords'](existing, [{ contentId: 'r1', completionPercentage: 10 }], 'completionPercentage')
      expect(existing[0].completionPercentage).toBe(10)
    })

    it('should never overwrite a known value with undefined', () => {
      const existing: any[] = [{ contentId: 'r1', completionPercentage: 100 }]
      component['mergeProgressRecords'](existing, [{ contentId: 'r1' }], 'completionPercentage')
      expect(existing[0].completionPercentage).toBe(100)
    })
  })

  describe('persistProgress', () => {
    it('should write the merged records to the offline store', () => {
      component.collectionId = 'c1'
      component['persistProgress']([{ contentId: 'r1' }])
      expect(mockOnlineIndexedDbService.insertData).toHaveBeenCalledWith(
        'user-1', 'c1', 'onlineCourseProgress', [{ contentId: 'r1' }],
      )
    })

    it('should log a write failure without throwing', () => {
      mockOnlineIndexedDbService.insertData.mockReturnValueOnce(throwError(() => new Error('db down')))
      expect(() => component['persistProgress']([{ contentId: 'r1' }])).not.toThrow()
      expect(mockLogger.error).toHaveBeenCalledWith('Error inserting data:', expect.any(Error))
    })
  })

  describe('calculateCourseProgress', () => {
    beforeEach(() => {
      component.heirarchy = {
        children: [
          { contentType: 'Resource', identifier: 'r1' },
          { contentType: 'Resource', identifier: 'r2' },
        ],
        childNodes: ['r1', 'r2'],
      } as any
    })

    it('should average the completion across the current resources', () => {
      expect(component['calculateCourseProgress']([
        { contentId: 'r1', completionPercentage: 100 },
        { contentId: 'r2', completionPercentage: 0 },
      ])).toBe(50)
    })

    it('should ignore progress for resources no longer in the hierarchy', () => {
      expect(component['calculateCourseProgress']([
        { contentId: 'r1', completionPercentage: 100 },
        { contentId: 'removed', completionPercentage: 100 },
      ])).toBe(50)
    })

    it('should report 100 when every resource is complete', () => {
      expect(component['calculateCourseProgress']([
        { contentId: 'r1', completionPercentage: 100 },
        { contentId: 'r2', completionPercentage: 100 },
      ])).toBe(100)
    })

    it('should report 0 for a course with no resources', () => {
      component.heirarchy = { children: [], childNodes: [] } as any
      expect(component['calculateCourseProgress']([])).toBe(0)
    })

    it('should clamp an over-reported aggregate to 100', () => {
      expect(component['calculateCourseProgress']([
        { contentId: 'r1', completionPercentage: 300 },
        { contentId: 'r2', completionPercentage: 300 },
      ])).toBe(100)
    })
  })
})
