import { of, throwError, Subject } from 'rxjs'
import { ContentStripMultipleComponent } from './content-strip-multiple.component'

describe('ContentStripMultipleComponent', () => {
  let component: ContentStripMultipleComponent
  let mockContentStripSvc: any
  let mockContentSvc: any
  let mockLoggerSvc: any
  let mockEventSvc: any
  let mockConfigSvc: any
  let mockUtilitySvc: any
  let mockUserSvc: any
  let events$: Subject<any>

  const buildComponent = () => new ContentStripMultipleComponent(
    mockContentStripSvc,
    mockContentSvc,
    mockLoggerSvc,
    mockEventSvc,
    mockConfigSvc,
    mockUtilitySvc,
    mockUserSvc,
  )

  beforeEach(() => {
    events$ = new Subject<any>()
    mockContentStripSvc = {
      getContentStripResponseApi: jest.fn().mockReturnValue(of({ contents: [{ contentType: 'Course' }] })),
    }
    mockContentSvc = {
      search: jest.fn().mockReturnValue(of({ result: [{ identifier: 'c1' }] })),
      searchV6: jest.fn().mockReturnValue(of({ result: { content: [{ identifier: 'c1' }] } })),
      searchRegionRecommendation: jest.fn().mockReturnValue(of({ contents: [{ identifier: 'c1' }] })),
      fetchMultipleContent: jest.fn().mockReturnValue(of([{ identifier: 'c1' }])),
      publicContentSearch: jest.fn().mockReturnValue(of({ result: { content: [{ identifier: 'c1' }] } })),
      fetchContentLikes: jest.fn().mockResolvedValue({ c1: 5 }),
    }
    mockLoggerSvc = { warn: jest.fn(), log: jest.fn(), error: jest.fn() }
    mockEventSvc = { events$ }
    mockConfigSvc = { userProfile: { userId: 'u1' }, unMappedUser: { id: 'anon' }, activeLocale: { locals: ['en'] } }
    mockUtilitySvc = { isMobile: false }
    mockUserSvc = {
      fetchUserBatchList: jest.fn().mockReturnValue(of([
        { content: { identifier: 'c1' }, completionPercentage: 40, completionStatus: 1 },
      ])),
    }

    component = buildComponent()
    component.widgetData = { strips: [] } as any

    delete (window as any).location
    ;(window as any).location = { href: 'http://localhost/app/home' }
    localStorage.clear()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit routing', () => {
    it('calls initData for default (non-authoring, non-explore, non-public) url', () => {
      const spy = jest.spyOn<any, any>(component, 'initData' as any)
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })

    it('detects authoring url via searchArray words', () => {
      (window as any).location.href = 'http://localhost/preview/xyz'
      component.ngOnInit()
      expect(component.isFromAuthoring).toBe(true)
    })

    it('sets explorePage and callPublicApi and fetches strips for explore url', () => {
      (window as any).location.href = 'http://localhost/explore/xyz'
      component.widgetData = {
        strips: [{
          key: 'k1', title: 't1',
          request: { ids: ['id1'] },
          refreshEvent: { eventType: 'ev1', from: 'src1' },
        }],
      } as any
      component.ngOnInit()
      expect(component.explorePage).toBe(true)
      expect(component.callPublicApi).toBe(true)
      expect(mockContentSvc.fetchMultipleContent).toHaveBeenCalled()
    })

    it('processStrip directly when checkForEmptyWidget is false (login branch)', () => {
      (window as any).location.href = 'http://localhost/login/xyz'
      component.widgetData = { strips: [{ key: 'k1', title: 't1' }] } as any
      component.ngOnInit()
      expect(component.stripsResultDataMap['k1']).toBeTruthy()
    })

    it('calls initPublicHomeData for public/home url', () => {
      (window as any).location.href = 'http://localhost/public/home'
      const spy = jest.spyOn<any, any>(component, 'initPublicHomeData' as any)
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('ngOnDestroy', () => {
    it('unsubscribes changeEventSubscription if present', () => {
      component.ngOnInit()
      const unsubSpy = jest.fn()
      component['changeEventSubscription'] = { unsubscribe: unsubSpy } as any
      component.ngOnDestroy()
      expect(unsubSpy).toHaveBeenCalled()
    })

    it('is safe when no subscription', () => {
      component['changeEventSubscription'] = null
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('initData / fetchStripFromRequestData / fetch* methods', () => {
    beforeEach(() => {
      component.widgetData = {
        strips: [{
          key: 'k1',
          title: 't1',
          loader: true,
          request: {
            api: { path: '/x' },
            search: { query: 'q', filters: {} },
            searchRegionRecommendation: { someKey: true } as any,
            searchV6: { request: { filters: [{ a: 1 }] } } as any,
            ids: ['id1'],
            enrollmentList: { queryParams: {} },
          },
          refreshEvent: { eventType: 'ev1', from: 'src1' },
          stripConfig: { cardSubType: 'card-badges' } as any,
        }],
      } as any
    })

    it('initData sets showParentLoader and stripsKeyOrder, fetches all sources', () => {
      component['initData']()
      expect(component.stripsKeyOrder).toEqual(['k1'])
      expect(mockContentStripSvc.getContentStripResponseApi).toHaveBeenCalled()
      expect(mockContentSvc.search).toHaveBeenCalled()
      expect(mockContentSvc.searchRegionRecommendation).toHaveBeenCalled()
      expect(mockContentSvc.searchV6).toHaveBeenCalled()
      expect(mockContentSvc.fetchMultipleContent).toHaveBeenCalled()
      expect(mockUserSvc.fetchUserBatchList).toHaveBeenCalled()
    })

    it('re-fetches on matching event via subscription', () => {
      component['initData']()
      mockContentStripSvc.getContentStripResponseApi.mockClear()
      events$.next({ eventType: 'ev1', from: 'src1' })
      expect(mockContentStripSvc.getContentStripResponseApi).toHaveBeenCalled()
    })

    it('fetchFromApi handles error', () => {
      mockContentStripSvc.getContentStripResponseApi.mockReturnValue(throwError(() => new Error('err')))
      component.fetchFromApi(component.widgetData.strips[0])
      expect(component.stripsResultDataMap['k1'].showOnError).toBeDefined()
    })

    it('fetchFromSearch (non-public) sets viewMoreUrl when results > 5 and postCardForSearch', () => {
      const results = Array.from({ length: 6 }, (_, i) => ({ identifier: `c${i}` }))
      mockContentSvc.search.mockReturnValue(of({ result: results }))
      component.widgetData.strips[0].stripConfig.postCardForSearch = true
      component.fetchFromSearch(component.widgetData.strips[0])
      expect(component.stripsResultDataMap['k1'].viewMoreUrl).toBeTruthy()
    })

    it('fetchFromSearch handles error', () => {
      mockContentSvc.search.mockReturnValue(throwError(() => new Error('err')))
      component.fetchFromSearch(component.widgetData.strips[0])
      expect(component.stripsResultDataMap['k1'].showOnError).toBeDefined()
    })

    it('fetchFromSearch uses public branch when callPublicApi true', () => {
      component.callPublicApi = true
      component.fetchFromSearch(component.widgetData.strips[0])
      expect(mockContentSvc.searchV6).toHaveBeenCalled()
    })

    it('fetchFromSearchRegionRecommendation handles error', () => {
      mockContentSvc.searchRegionRecommendation.mockReturnValue(throwError(() => new Error('err')))
      component.fetchFromSearchRegionRecommendation(component.widgetData.strips[0])
      expect(component.stripsResultDataMap['k1'].showOnError).toBeDefined()
    })

    it('fetchFromSearchV6 handles error', () => {
      mockContentSvc.searchV6.mockReturnValue(throwError(() => new Error('err')))
      component.fetchFromSearchV6(component.widgetData.strips[0])
      expect(component.stripsResultDataMap['k1'].showOnError).toBeDefined()
    })

    it('fetchFromPublicSearch resolves and handles error', () => {
      component.fetchFromPublicSearch(component.widgetData.strips[0])
      expect(mockContentSvc.publicContentSearch).toHaveBeenCalled()

      mockContentSvc.publicContentSearch.mockReturnValue(throwError(() => new Error('err')))
      component.fetchFromPublicSearch(component.widgetData.strips[0])
      expect(component.stripsResultDataMap['k1'].showOnError).toBeDefined()
    })

    it('fetchFromIds handles error', () => {
      mockContentSvc.fetchMultipleContent.mockReturnValue(throwError(() => new Error('err')))
      component.fetchFromIds(component.widgetData.strips[0])
      expect(component.stripsResultDataMap['k1'].showOnError).toBeDefined()
    })

    it('fetchFromEnrollmentList filters by loginbtn localStorage flag and handles error', () => {
      localStorage.setItem('loginbtn', '1')
      component.fetchFromEnrollmentList(component.widgetData.strips[0])
      expect(mockUserSvc.fetchUserBatchList).toHaveBeenCalled()

      mockUserSvc.fetchUserBatchList.mockReturnValue(throwError(() => new Error('err')))
      component.fetchFromEnrollmentList(component.widgetData.strips[0])
      expect(component.stripsResultDataMap['k1'].showOnError).toBeDefined()
    })

    it('fetchFromEnrollmentList uses unMappedUser when no userProfile', () => {
      mockConfigSvc.userProfile = null
      component.fetchFromEnrollmentList(component.widgetData.strips[0])
      expect(mockUserSvc.fetchUserBatchList).toHaveBeenCalledWith('anon', {})
    })
  })

  describe('initPublicHomeData / fetchHomeStripFromRequestData', () => {
    it('sets stripsKeyOrder, showParentLoader and calls fetchFromPublicSearch', () => {
      component.widgetData = {
        loader: true,
        strips: [{
          key: 'k1', title: 't1',
          request: { searchV6: { request: { filters: [{ a: 1 }] } } },
          refreshEvent: { eventType: 'ev1', from: 'src1' },
        }],
      } as any
      component['initPublicHomeData']()
      expect(component.stripsKeyOrder).toEqual(['k1'])
      expect(mockContentSvc.publicContentSearch).toHaveBeenCalled()
    })

    it('re-fetches home strip on matching event', () => {
      component.widgetData = {
        loader: true,
        strips: [{
          key: 'k1', title: 't1',
          request: { searchV6: { request: {} } },
          refreshEvent: { eventType: 'ev1', from: 'src1' },
        }],
      } as any
      component['initPublicHomeData']()
      mockContentSvc.publicContentSearch.mockClear()
      events$.next({ eventType: 'ev1', from: 'src1' })
      expect(mockContentSvc.publicContentSearch).toHaveBeenCalled()
    })

    it('processStrip directly when strip has no request', () => {
      component.widgetData = { loader: false, strips: [{ key: 'k1', title: 't1' }] } as any
      component['initPublicHomeData']()
      expect(component.stripsResultDataMap['k1']).toBeTruthy()
    })
  })

  describe('showAccordion / setHiddenForStrip / getIfStripHidden', () => {
    beforeEach(() => {
      component.stripsResultDataMap = {
        k1: { mode: 'accordion' } as any,
        k2: { mode: undefined } as any,
      }
    })

    it('returns showAccordionData when mobile and accordion mode', () => {
      mockUtilitySvc.isMobile = true
      component.showAccordionData = false
      expect(component.showAccordion('k1')).toBe(false)
    })

    it('returns true otherwise', () => {
      mockUtilitySvc.isMobile = false
      expect(component.showAccordion('k1')).toBe(true)
      expect(component.showAccordion('k2')).toBe(true)
    })

    it('setHiddenForStrip hides strip and stores in localStorage', () => {
      component.setHiddenForStrip('k1')
      expect(component.stripsResultDataMap['k1'].showStrip).toBe(false)
      expect(localStorage.getItem('cstrip_k1')).toBe('1')
    })
  })

  describe('toggleInfo', () => {
    it('warns and forces below mode when mode not below', () => {
      component.stripsResultDataMap = {
        k1: { stripInfo: { mode: 'popup' } } as any,
      }
      component.toggleInfo({ key: 'k1' } as any)
      expect(mockLoggerSvc.warn).toHaveBeenCalled()
      expect(component.stripsResultDataMap['k1'].stripInfo!.mode).toBe('below')
    })

    it('sets visibilityMode visible when mode already below', () => {
      component.stripsResultDataMap = {
        k1: { stripInfo: { mode: 'below' } } as any,
      }
      component.toggleInfo({ key: 'k1' } as any)
      expect(component.stripsResultDataMap['k1'].stripInfo!.visibilityMode).toBe('visible')
    })

    it('does nothing when no stripInfo', () => {
      component.stripsResultDataMap = { k1: {} as any }
      expect(() => component.toggleInfo({ key: 'k1' } as any)).not.toThrow()
    })
  })

  describe('checkForEmptyWidget', () => {
    it('returns true when request.api present', () => {
      expect(component.checkForEmptyWidget({ request: { api: { path: '/x' } } } as any)).toBe(true)
    })

    it('returns false when no request', () => {
      expect(component.checkForEmptyWidget({} as any)).toBe(false)
    })
  })

  describe('filterCourse', () => {
    it('filters out negative-list identifiers', () => {
      const contents = { content: [{ identifier: 'do_11357408383009587211503' }, { identifier: 'good1' }] }
      const result = component.filterCourse(contents)
      expect(result.content).toEqual([{ identifier: 'good1' }])
    })
  })

  describe('processContentLikes', () => {
    it('assigns likes to each widget result', async () => {
      const results = [{ widgetData: { content: { identifier: 'c1' } } }] as any
      await component.processContentLikes(results)
      expect(results[0].widgetData.likes).toBe(5)
    })

    it('catches errors from fetchContentLikes without throwing', async () => {
      mockContentSvc.fetchContentLikes.mockRejectedValue(new Error('fail'))
      const results = [{ widgetData: { content: { identifier: 'c1' } } }] as any
      await expect(component.processContentLikes(results)).resolves.toBeUndefined()
    })
  })

  describe('checkParentStatus via processStrip (through fetchFromIds)', () => {
    it('marks showParentNoData when all strips have no data', () => {
      component.widgetData = { strips: [{ key: 'k1', title: 't1', request: { ids: ['id1'] } }] } as any
      mockContentSvc.fetchMultipleContent.mockReturnValue(of([]))
      component.fetchFromIds(component.widgetData.strips[0])
      expect(component.showParentNoData).toBe(true)
      expect(component.contentAvailable).toBe(false)
    })

    it('marks showParentError when all strips error', () => {
      component.widgetData = { strips: [{ key: 'k1', title: 't1', request: { ids: ['id1'] } }] } as any
      mockContentSvc.fetchMultipleContent.mockReturnValue(throwError(() => new Error('e')))
      component.fetchFromIds(component.widgetData.strips[0])
      expect(component.showParentError).toBe(true)
    })
  })

  describe('transformContentsToWidgets', () => {
    const strip = (stripConfig: any = {}) => ({ key: 'k1', stripConfig }) as any

    it('should return an empty list when there are no contents', () => {
      expect(component['transformContentsToWidgets'](null as any, strip())).toEqual([])
      expect(component['transformContentsToWidgets']([], strip())).toEqual([])
    })

    it('should wrap each content in a card widget carrying its position', () => {
      const widgets = component['transformContentsToWidgets'](
        [{ identifier: 'c1' }, { identifier: 'c2' }] as any, strip(),
      )
      expect(widgets).toHaveLength(2)
      expect(widgets[0]).toEqual(expect.objectContaining({
        widgetType: 'card', widgetSubType: 'cardContent', widgetHostClass: 'mb-2',
      }))
      expect(widgets[0].widgetData.context).toEqual({ pageSection: 'k1', position: 0 })
      expect(widgets[1].widgetData.context.position).toBe(1)
    })

    it('should carry the strip card configuration onto each widget', () => {
      const [widget] = component['transformContentsToWidgets']([{ identifier: 'c1' }] as any, strip({
        cardSubType: 'card-wide', intranetMode: true, deletedMode: false, contentTags: ['a'],
      }))
      expect(widget.widgetData).toEqual(expect.objectContaining({
        cardSubType: 'card-wide', intranetMode: true, deletedMode: false, contentTags: ['a'],
      }))
      expect(widget.widgetData.badges).toEqual({ orgIcon: false, certification: false })
    })

    it('should turn on both badges for the card-badges sub type', () => {
      const [widget] = component['transformContentsToWidgets'](
        [{ identifier: 'c1' }] as any, strip({ cardSubType: 'card-badges' }),
      )
      expect(widget.widgetData.badges).toEqual({ orgIcon: true, certification: true })
    })

    it('should leave the card config undefined when the strip has none', () => {
      const [widget] = component['transformContentsToWidgets'](
        [{ identifier: 'c1' }] as any, { key: 'k1', stripConfig: {} } as any,
      )
      expect(widget.widgetData.cardSubType).toBeUndefined()
      expect(widget.widgetData.intranetMode).toBeUndefined()
    })
  })

  describe('checkForEmptyWidget - request shapes', () => {
    const shapes = ['api', 'search', 'searchRegionRecommendation', 'searchV6', 'enrollmentList', 'ids']

    shapes.forEach(shape => {
      it(`should accept a strip whose request carries a populated ${shape} block`, () => {
        expect(component.checkForEmptyWidget({ request: { [shape]: { a: 1 } } } as any)).toBe(true)
      })

      it(`should reject a strip whose ${shape} block is empty`, () => {
        expect(component.checkForEmptyWidget({ request: { [shape]: {} } } as any)).toBe(false)
      })
    })

    it('should reject a strip with no request at all', () => {
      expect(component.checkForEmptyWidget({} as any)).toBe(false)
    })

    it('should reject a strip with an empty request object', () => {
      expect(component.checkForEmptyWidget({ request: {} } as any)).toBe(false)
    })
  })

  describe('showAccordion', () => {
    it('should always show the strip on desktop', () => {
      component.stripsResultDataMap = { k1: { mode: 'accordion' } } as any
      expect(component.showAccordion('k1')).toBe(true)
    })

    it('should follow the accordion toggle on mobile', () => {
      mockUtilitySvc.isMobile = true
      component.stripsResultDataMap = { k1: { mode: 'accordion' } } as any
      component.showAccordionData = false
      expect(component.showAccordion('k1')).toBe(false)
      component.showAccordionData = true
      expect(component.showAccordion('k1')).toBe(true)
    })

    it('should always show a non-accordion strip on mobile', () => {
      mockUtilitySvc.isMobile = true
      component.stripsResultDataMap = { k1: { mode: 'strip' } } as any
      component.showAccordionData = false
      expect(component.showAccordion('k1')).toBe(true)
    })
  })

  describe('checkParentStatus', () => {
    beforeEach(() => {
      component.widgetData = { strips: [{ key: 'a' }, { key: 'b' }] } as any
      component.noDataCount = 0
      component.successDataCount = 0
      component.errorDataCount = 0
    })

    it('should count a strip that resolved with no data', () => {
      component['checkParentStatus']('done', 0)
      expect(component.noDataCount).toBe(1)
    })

    it('should count a strip that resolved with data', () => {
      component['checkParentStatus']('done', 3)
      expect(component.successDataCount).toBe(1)
    })

    it('should count a strip that errored', () => {
      component['checkParentStatus']('error', 0)
      expect(component.errorDataCount).toBe(1)
    })

    it('should hold off on a verdict while a successful strip is still waiting on others', () => {
      component['checkParentStatus']('done', 3)
      expect(component.showParentNoData).toBeFalsy()
      expect(component.showParentError).toBeFalsy()
    })

    it('should keep the loader up until every strip has settled', () => {
      component['checkParentStatus']('done', 0)
      expect(component.showParentLoader).toBe(true)
    })

    it('should report no data when every strip came back empty', () => {
      component['checkParentStatus']('done', 0)
      component['checkParentStatus']('done', 0)
      expect(component.showParentLoader).toBe(false)
      expect(component.showParentNoData).toBe(true)
      expect(component.showParentError).toBe(false)
    })

    it('should report an error when every strip failed', () => {
      component['checkParentStatus']('error', 0)
      component['checkParentStatus']('error', 0)
      expect(component.showParentError).toBe(true)
      expect(component.showParentNoData).toBe(false)
    })

    it('should report no data when the strips split between empty and errored', () => {
      component['checkParentStatus']('done', 0)
      component['checkParentStatus']('error', 0)
      expect(component.showParentNoData).toBe(true)
      expect(component.showParentError).toBe(false)
    })

    it('should stay quiet once at least one strip returned data', () => {
      component['checkParentStatus']('done', 2)
      component['checkParentStatus']('done', 0)
      expect(component.showParentNoData).toBe(false)
      expect(component.showParentError).toBe(false)
      expect(component.showParentLoader).toBe(false)
    })

    it('should ignore an unsettled fetch status', () => {
      component['checkParentStatus']('fetching' as any, 0)
      expect(component.noDataCount).toBe(0)
      expect(component.successDataCount).toBe(0)
      expect(component.errorDataCount).toBe(0)
    })
  })

  describe('toggleInfo - mode handling', () => {
    it('should do nothing when the strip carries no info block', () => {
      component.stripsResultDataMap = { k1: {} } as any
      component.toggleInfo({ key: 'k1' } as any)
      expect(component.stripsResultDataMap.k1.stripInfo).toBeUndefined()
    })

    it('should reveal an info block already in "below" mode', () => {
      component.stripsResultDataMap = { k1: { stripInfo: { mode: 'below' } } } as any
      component.toggleInfo({ key: 'k1' } as any)
      expect(component.stripsResultDataMap.k1.stripInfo.visibilityMode).toBe('visible')
      expect(mockLoggerSvc.warn).not.toHaveBeenCalled()
    })

    it('should warn about an unimplemented mode and fall back to "below"', () => {
      component.stripsResultDataMap = { k1: { stripInfo: { mode: 'popup' } } } as any
      component.toggleInfo({ key: 'k1' } as any)
      expect(mockLoggerSvc.warn).toHaveBeenCalledWith('strip info mode: popup not implemented yet')
      expect(component.stripsResultDataMap.k1.stripInfo.visibilityMode).toBe('visible')
    })
  })

  describe('getIfStripHidden / setHiddenForStrip', () => {
    afterEach(() => localStorage.clear())

    it('should treat an unseen strip as visible', () => {
      expect(component['getIfStripHidden']('k1')).toBe(true)
    })

    it('should treat a dismissed strip as hidden', () => {
      localStorage.setItem('cstrip_k1', '1')
      expect(component['getIfStripHidden']('k1')).toBe(false)
    })

    it('should record the dismissal against the strip key', () => {
      component.stripsResultDataMap = { k1: { showStrip: true } } as any
      component.setHiddenForStrip('k1')
      expect(component.stripsResultDataMap.k1.showStrip).toBe(false)
      expect(localStorage.getItem('cstrip_k1')).toBe('1')
    })
  })

  describe('processContentLikes', () => {
    it('should attach zero likes for content the service does not know about', async () => {
      mockContentSvc.fetchContentLikes.mockResolvedValue({})
      const results: any[] = [{ widgetData: { content: { identifier: 'c1' } } }]
      await component.processContentLikes(results)
      expect(results[0].widgetData.likes).toBe(0)
    })

    it('should swallow a like-fetch failure', async () => {
      mockContentSvc.fetchContentLikes.mockRejectedValue(new Error('down'))
      const results: any[] = [{ widgetData: { content: { identifier: 'c1' } } }]
      await expect(component.processContentLikes(results)).resolves.toBeUndefined()
    })

    it('should tolerate a result with no widget data', async () => {
      mockContentSvc.fetchContentLikes.mockResolvedValue({})
      await expect(component.processContentLikes([{}] as any)).resolves.toBeUndefined()
    })
  })
})
