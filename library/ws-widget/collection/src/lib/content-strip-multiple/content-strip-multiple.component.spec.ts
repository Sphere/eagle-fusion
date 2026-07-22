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
})
