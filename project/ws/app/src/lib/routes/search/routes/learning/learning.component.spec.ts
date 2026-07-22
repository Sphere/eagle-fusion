import { TestBed } from '@angular/core/testing'
import { ChangeDetectorRef } from '@angular/core'
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router'
import { of, Subject, throwError } from 'rxjs'
import { LearningComponent } from './learning.component'

const pageData = {
  data: {
    search: {
      tabs: [
        {
          titleKey: 'learning',
          phraseSearch: true,
          isStandAlone: true,
          searchQuery: { filters: { visibility: ['Default'] } },
        },
      ],
      visibleFilters: {},
    },
  },
}

let routerEvents$: Subject<any>
let queryParamMap$: Subject<any>

const mockActivated: any = {
  snapshot: {
    data: { pageData, pageroute: 'learning' },
    queryParamMap: { get: jest.fn().mockReturnValue(null) },
  },
  parent: {},
  get queryParamMap() {
    return queryParamMap$.asObservable()
  },
}

const mockRouter: any = {
  navigate: jest.fn().mockResolvedValue(true),
  navigateByUrl: jest.fn(),
  get events() {
    return routerEvents$.asObservable()
  },
}

const mockValueSvc: any = {
  isMobile: jest.fn().mockReturnValue(false),
  isLtMedium$: of(false),
}

const mockSearchServ: any = {
  getLanguageSearchIndex: jest.fn().mockImplementation((l: string) => l),
  translateSearchFilters: jest.fn().mockResolvedValue({}),
  getSearchConfig: jest.fn().mockResolvedValue({ search: { visibleFilters: {} } }),
  handleFilters: jest.fn().mockReturnValue({ concept: [], filtersRes: [] }),
  raiseSearchEvent: jest.fn(),
  raiseSearchResponseEvent: jest.fn(),
  raiseNewSearchResponseEvent: jest.fn(),
  getLearning: jest.fn().mockReturnValue(of({ result: { count: 0, content: [] }, filters: [] })),
  getsearchLearning: jest.fn().mockReturnValue(of({ result: { count: 0, content: [] } })),
}

const mockConfigSvc: any = {
  activeLocale: { locals: ['en'] },
  userPreference: { selectedLangGroup: 'en,hi', selectedLocale: 'en' },
  prefChangeNotifier: new Subject<void>(),
  isIntranetAllowed: false,
  restrictedFeatures: new Set(),
}

const mockUtilitySvc: any = {
  isMobile: false,
}

const mockSearchSvc: any = {
  getSearchCompetencyCourses: jest.fn().mockReturnValue(of({ result: { count: 0, content: [] }, filters: [] })),
}

const mockLogger: any = {
  log: jest.fn(),
  error: jest.fn(),
}

const mockCdr: Partial<ChangeDetectorRef> = {
  detectChanges: jest.fn(),
}

function createComponent(): LearningComponent {
  return TestBed.runInInjectionContext(() => new LearningComponent(
    mockActivated as ActivatedRoute,
    mockRouter as Router,
    mockValueSvc,
    mockSearchServ,
    mockConfigSvc,
    mockUtilitySvc,
    mockSearchSvc,
    mockLogger,
    mockCdr as ChangeDetectorRef,
  ))
}

describe('LearningComponent', () => {
  let component: LearningComponent

  beforeEach(() => {
    jest.clearAllMocks()
    routerEvents$ = new Subject<any>()
    queryParamMap$ = new Subject<any>()
    mockActivated.snapshot.queryParamMap.get.mockReturnValue(null)
    component = createComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('effect should update isXSmall from valueSvc.isMobile', () => {
    expect(component.isXSmall).toBe(false)
  })

  describe('getActiveLocale', () => {
    it('should return language search index of active locale', () => {
      expect(component.getActiveLocale()).toBe('en')
    })

    it('should return empty string when no activeLocale', () => {
      mockConfigSvc.activeLocale = undefined
      expect(component.getActiveLocale()).toBe('')
      mockConfigSvc.activeLocale = { locals: ['en'] }
    })
  })

  it('applyPhraseSearch getter should reflect config', () => {
    expect(component.applyPhraseSearch).toBe(true)
  })

  it('applyIsStandAlone getter should reflect config', () => {
    expect(component.applyIsStandAlone).toBe(true)
  })

  it('filtersFromConfig getter should return config filters', () => {
    expect(component.filtersFromConfig).toEqual({ visibility: ['Default'] })
  })

  describe('isDefaultFilterApplied', () => {
    it('should return false when no default filters', () => {
      mockActivated.snapshot.data.pageData.data.search.tabs[0].searchQuery.filters = {}
      expect(component.isDefaultFilterApplied).toBe(false)
      mockActivated.snapshot.data.pageData.data.search.tabs[0].searchQuery.filters = { visibility: ['Default'] }
    })

    it('should return true when applied filters match default', () => {
      component.searchRequestObject.request.filters = { visibility: ['Default'] }
      expect(component.isDefaultFilterApplied).toBe(true)
    })
  })

  describe('preferredLanguages', () => {
    it('should join preferred languages', () => {
      expect(component.preferredLanguages).toBe('en,hi')
    })

    it('should return en by default', () => {
      mockConfigSvc.userPreference = {}
      expect(component.preferredLanguages).toBe('en')
      mockConfigSvc.userPreference = { selectedLangGroup: 'en,hi', selectedLocale: 'en' }
    })
  })

  it('searchAcrossPreferredLang getter should return false', () => {
    expect(component.searchAcrossPreferredLang).toBe(false)
  })

  it('selectLang should navigate with lang param', () => {
    component.selectLang('hi')
    expect(component.lang).toBe('hi')
    expect(mockRouter.navigate).toHaveBeenCalled()
  })

  it('removeDefaultFiltersApplied should navigate when filters match', () => {
    component.searchRequestObject.request.filters = { visibility: ['Default'] }
    component.removeDefaultFiltersApplied()
    expect(mockRouter.navigate).toHaveBeenCalled()
  })

  it('removeDefaultFiltersApplied should return early when applied filter missing', () => {
    component.searchRequestObject.request.filters = {}
    component.removeDefaultFiltersApplied()
  })

  it('searchWithPreferredLanguage should navigate with preferred lang', () => {
    component.searchWithPreferredLanguage()
    expect(mockRouter.navigate).toHaveBeenCalledWith([], expect.objectContaining({
      queryParams: { lang: 'en,hi' },
    }))
  })

  describe('ngOnInit', () => {
    it('should wire up subscriptions and trigger search', () => {
      component.ngOnInit()
      routerEvents$.next(new NavigationEnd(1, '/app/search/learning', '/app/search/learning'))
      expect(component.withoutFilter).toBe(true)

      queryParamMap$.next({
        get: (key: string) => (key === 'q' ? 'test' : null),
        has: (key: string) => key === 'q',
        getAll: () => [],
      })
      expect(mockSearchServ.getsearchLearning).toHaveBeenCalled()
    })

    it('should handle competency query param', () => {
      component.ngOnInit()
      queryParamMap$.next({
        get: (key: string) => (key === 'competency' ? 'true' : null),
        has: () => false,
        getAll: () => ['a', 'b'],
      })
      expect(mockSearchSvc.getSearchCompetencyCourses).toHaveBeenCalled()
    })

    it('should apply query, filters, sort and language query params', () => {
      component.ngOnInit()
      queryParamMap$.next({
        get: (key: string) => {
          const map: any = { q: 'test query', f: JSON.stringify({ contentType: ['Course'] }), sort: 'asc', lang: 'HI' }
          return map[key] !== undefined ? map[key] : null
        },
        has: (key: string) => ['q', 'f', 'sort', 'lang'].includes(key),
        getAll: () => [],
      })
      expect(component.searchRequest.lang).toBe('hi')
      expect(component.lang).toBe('hi')
      expect(component.contact).toBe('hi')
    })

    it('should reset filters to visibility default when f param has no keys', () => {
      component.ngOnInit()
      queryParamMap$.next({
        get: (key: string) => (key === 'f' ? '{}' : null),
        has: (key: string) => key === 'f',
        getAll: () => [],
      })
      expect(component.searchRequestObject.request.filters).toEqual({ visibility: ['Default'] })
    })

    it('should apply mobile restrictions when isMobile and intranet not allowed', () => {
      mockUtilitySvc.isMobile = true
      mockConfigSvc.isIntranetAllowed = false
      mockConfigSvc.prefChangeNotifier.next()
      component.ngOnInit()
      queryParamMap$.next({
        get: () => null,
        has: () => false,
        getAll: () => [],
      })
      expect(component.searchRequestObject.request.filters).toEqual({})
      mockUtilitySvc.isMobile = false
    })

    it('should reset filters when pageroute matches titleKey and differs from learning', () => {
      mockActivated.snapshot.data.pageroute = 'other'
      component.ngOnInit()
      queryParamMap$.next({
        get: () => null,
        has: () => false,
        getAll: () => [],
      })
      expect(component.routeComp).toBe('other')
      mockActivated.snapshot.data.pageroute = 'learning'
    })

    it('should apply sort_by rules for non-empty non-all query', () => {
      component.ngOnInit()
      queryParamMap$.next({
        get: (key: string) => (key === 'q' ? 'abc' : null),
        has: (key: string) => key === 'q',
        getAll: () => [],
      })
      expect(component.searchRequestObject.request.sort_by.lastUpdatedOn).toBe('')
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe all subscriptions', () => {
      component.ngOnInit()
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('getCompetencyResult', () => {
    it('should update search results on success', () => {
      mockSearchSvc.getSearchCompetencyCourses.mockReturnValue(of({
        result: { count: 2, content: [{ id: 1 }] },
        filters: [],
      }))
      component.getCompetencyResult(['q1'])
      expect(component.searchResults.result.count).toBe(2)
      expect(mockCdr.detectChanges).toHaveBeenCalled()
    })

    it('should handle error', () => {
      mockSearchSvc.getSearchCompetencyCourses.mockReturnValue(throwError(() => new Error('fail')))
      component.getCompetencyResult(['q1'])
      expect(component.error.load).toBe(true)
    })
  })

  describe('getResults (legacy)', () => {
    it('should update search results and status on success', () => {
      mockSearchServ.getLearning.mockReturnValue(of({
        result: { count: 1, content: [{ identifier: '1', lastPublishedOn: '2024' }] },
        filters: [],
      }))
      component.getResults()
      expect(component.searchResults.result.count).toBe(1)
      expect(mockCdr.detectChanges).toHaveBeenCalled()
    })

    it('should handle no content', () => {
      mockSearchServ.getLearning.mockReturnValue(of({
        result: { count: 0, content: null },
        filters: [],
      }))
      component.getResults()
      expect(component.searchResults.result.content).toEqual([])
    })

    it('should handle error', () => {
      mockSearchServ.getLearning.mockReturnValue(throwError(() => new Error('fail')))
      component.getResults()
      expect(component.error.load).toBe(true)
    })

    it('should trigger updateFiltersResponse with facets', () => {
      mockSearchServ.getSearchConfig.mockResolvedValue({ search: { visibleFilters: { type1: { displayName: 'Type One' } } } })
      mockSearchServ.handleFilters.mockReturnValue({
        concept: [],
        filtersRes: [{ displayName: 'type1', type: 'type1', content: [] }],
      })
      mockSearchServ.getLearning.mockReturnValue(of({
        result: {
          count: 1,
          content: [{ identifier: '1' }],
          facets: [
            { name: 'resourceType', values: [{ name: 'video', count: 1 }] },
            { name: 'other', values: [] },
          ],
        },
        filters: [{ type: 'type1', content: [] }],
      }))
      component.getResults()
      expect(mockSearchServ.handleFilters).toHaveBeenCalled()
    })

    it('should set noContent true when zero results and single-word query', () => {
      component.searchRequestObject.request.filters = {}
      component.searchRequestObject.request.query = 'singleword'
      mockSearchServ.getLearning.mockReturnValue(of({
        result: { count: 0, content: [] },
        filters: [],
      }))
      component.getResults(true)
      expect(component.noContent).toBe(true)
    })
  })

  describe('getSearchResults', () => {
    it('should update new search results on success', () => {
      mockSearchServ.getsearchLearning.mockReturnValue(of({
        result: { count: 3, content: [{ identifier: '1', lastPublishedOn: '2024' }] },
      }))
      component.getSearchResults()
      expect(component.searchResults.result.count).toBe(3)
      expect(mockCdr.detectChanges).toHaveBeenCalled()
    })

    it('should use lang from url when present', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/app?lang=hi' },
        writable: true,
      })
      mockSearchServ.getsearchLearning.mockReturnValue(of({ result: { count: 0, content: [] } }))
      component.getSearchResults()
      expect(component.newSearchRequestObject.language).toBe('hi')
    })

    it('should handle error', () => {
      mockSearchServ.getsearchLearning.mockReturnValue(throwError(() => new Error('fail')))
      component.getSearchResults()
      expect(component.error.load).toBe(true)
    })
  })

  it('contentTrackBy should return identifier', () => {
    expect(component.contentTrackBy({ identifier: 'abc' } as any)).toBe('abc')
  })

  it('sortOrder should navigate with sort param', () => {
    component.sortOrder('asc')
    expect(mockRouter.navigate).toHaveBeenCalled()
  })

  it('getSortType should return desc', () => {
    expect(component.getSortType()).toBe('desc')
  })

  it('searchLanguage should navigate and reset expandToPrefLang', async () => {
    component.expandToPrefLang = true
    component.searchLanguage('hi')
    await Promise.resolve()
    expect(mockRouter.navigate).toHaveBeenCalled()
    expect(component.expandToPrefLang).toBe(false)
  })

  it('didYouMeanSearch should strip em tags and navigate', () => {
    component.didYouMeanSearch('<em>test</em>')
    expect(mockRouter.navigate).toHaveBeenCalledWith([], expect.objectContaining({
      queryParams: { q: 'test' },
    }))
  })

  it('searchInsteadFor should reset content and search again', () => {
    component.searchResults.result.content = [{ id: 1 }]
    component.searchInsteadFor()
    expect(mockSearchServ.getsearchLearning).toHaveBeenCalled()
  })

  it('removeFilters should navigate clearing filter', () => {
    component.removeFilters()
    expect(mockRouter.navigate).toHaveBeenCalled()
  })

  it('removeLanguage should navigate by url', () => {
    component.removeLanguage()
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/search/home?f=')
  })

  it('removeSearch should reset lang/contact and navigate', () => {
    component.contact = 'en'
    component.lang = 'en'
    component.removeSearch()
    expect(component.contact).toBe('')
    expect(component.lang).toBe('')
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/search/learning?q=')
  })

  it('closeFilter should set sideNavBarOpened', () => {
    component.closeFilter(false)
    expect(component.sideNavBarOpened).toBe(false)
  })
})
