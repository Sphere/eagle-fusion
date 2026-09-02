import { Subject, of } from 'rxjs'
import { HomeComponent } from './home.component'

const pageData = {
  data: {
    search: {
      isAutoCompleteAllowed: true,
      languageSearch: ['All', 'En', 'Hi'],
    },
  },
}

let queryParamMap$: Subject<any>

const mockRoute: any = {
  snapshot: { data: { pageData } },
  parent: {},
  get queryParamMap() {
    return queryParamMap$.asObservable()
  },
}

const mockRouter: any = {
  navigate: jest.fn().mockResolvedValue(true),
}

const mockConfigSvc: any = {
  pageNavBar: {},
  unMappedUser: {
    profileDetails: {
      preferences: { language: 'en' },
    },
  },
  userPreference: { selectedLangGroup: 'en,hi' },
}

const mockSearchSvc: any = {
  getLanguageSearchIndex: jest.fn().mockImplementation((l: string) => l),
  searchAutoComplete: jest.fn().mockResolvedValue([]),
  getSearchConfig: jest.fn().mockResolvedValue({ search: { suggestedFilters: [] } }),
}

const mockSearchApi: any = {
  currentMessage: new Subject<any>(),
}

const mockLanguageSvc: any = {
  getCurrentLanguage: jest.fn().mockReturnValue('en'),
}

const mockLogger: any = {
  log: jest.fn(),
}

function createComponent(): HomeComponent {
  return new HomeComponent(
    mockConfigSvc,
    mockRouter,
    mockRoute,
    mockSearchSvc,
    mockSearchApi,
    mockLanguageSvc,
    mockLogger,
  )
}

describe('HomeComponent', () => {
  let component: HomeComponent

  beforeEach(() => {
    jest.clearAllMocks()
    queryParamMap$ = new Subject<any>()
    mockSearchApi.currentMessage = new Subject<any>()
    mockConfigSvc.unMappedUser = {
      profileDetails: { preferences: { language: 'en' } },
    }
    mockConfigSvc.userPreference = { selectedLangGroup: 'en,hi' }
    component = createComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set isAutoCompleteAllowed from route data', () => {
    expect(component.isAutoCompleteAllowed).toBe(true)
  })

  describe('getActivateLocale', () => {
    it('should return preference language when available', () => {
      expect(component.getActivateLocale()).toBe('en')
    })

    it('should fallback to languageSvc when no preference language', () => {
      mockConfigSvc.unMappedUser = { profileDetails: {} }
      expect(component.getActivateLocale()).toBe('en')
      expect(mockLanguageSvc.getCurrentLanguage).toHaveBeenCalled()
    })
  })

  describe('preferredLanguages', () => {
    it('should return joined preferred languages', () => {
      expect(component.preferredLanguages).toBe('en,hi')
    })

    it('should return null when no userPreference', () => {
      mockConfigSvc.userPreference = undefined
      expect(component.preferredLanguages).toBeNull()
    })

    it('should return null when no selectedLangGroup', () => {
      mockConfigSvc.userPreference = {}
      expect(component.preferredLanguages).toBeNull()
    })
  })

  describe('search', () => {
    it('should navigate with query and lang', () => {
      component.searchQuery.q = 'abc'
      component.searchQuery.l = 'en'
      component.search('query', 'hi')
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/search/home'], expect.objectContaining({
        queryParams: { lang: 'hi', q: 'query' },
      }))
    })

    it('should use searchQuery values when no args passed', async () => {
      component.searchQuery.q = 'defq'
      component.searchQuery.l = 'defl'
      component.search()
      await Promise.resolve()
      await Promise.resolve()
      expect(mockRouter.navigate).toHaveBeenCalled()
    })

    it('should use lang from url params when present', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/app?lang=fr' },
        writable: true,
      })
      component.search('q')
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/search/home'], expect.objectContaining({
        queryParams: { lang: 'fr', q: 'q' },
      }))
    })
  })

  it('selectLang should set lang and navigate', () => {
    component.selectLang('hi')
    expect(component.lang).toBe('hi')
    expect(mockRouter.navigate).toHaveBeenCalled()
  })

  describe('searchWithFilter', () => {
    it('should navigate with contentType filter', () => {
      component.searchWithFilter({ contentType: 'Course' })
      expect(mockRouter.navigate).toHaveBeenCalled()
    })

    it('should navigate with resourceType filter', () => {
      component.searchWithFilter({ resourceType: 'video' })
      expect(mockRouter.navigate).toHaveBeenCalled()
    })

    it('should navigate with combinedType learningContent filter', () => {
      component.searchWithFilter({ combinedType: 'learningContent' })
      expect(mockRouter.navigate).toHaveBeenCalled()
    })

    it('should navigate with empty filter when none match', () => {
      component.searchWithFilter({})
      expect(mockRouter.navigate).toHaveBeenCalled()
    })
  })

  it('swapRemove should move array element', () => {
    const arr = ['all', 'en', 'hi']
    component.swapRemove(arr, 1, 0)
    expect(arr).toEqual(['en', 'all', 'hi'])
  })

  describe('getAutoCompleteResults', () => {
    it('should set autoCompleteResults on success', async () => {
      mockSearchSvc.searchAutoComplete.mockResolvedValue([{ term: 'a' }])
      component.getAutoCompleteResults()
      await Promise.resolve()
      expect(component.autoCompleteResults).toEqual([{ term: 'a' }])
    })

    it('should handle rejection silently', async () => {
      mockSearchSvc.searchAutoComplete.mockRejectedValue(new Error('fail'))
      component.getAutoCompleteResults()
      await Promise.resolve()
      expect(component).toBeTruthy()
    })
  })

  it('searchLanguage should navigate then fetch autocomplete', async () => {
    component.searchLanguage('hi')
    await Promise.resolve()
    expect(mockRouter.navigate).toHaveBeenCalledWith([], expect.objectContaining({
      queryParams: { lang: 'hi', q: '' },
    }))
  })

  it('langSelect should set lang', () => {
    component.langSelect('fr')
    expect(component.lang).toBe('fr')
  })

  describe('ngOnInit', () => {
    it('should subscribe to query valueChanges when autocomplete allowed', done => {
      component.ngOnInit()
      component.query.setValue('term')
      setTimeout(() => {
        expect(component.searchQuery.q).toBe('term')
        done()
      }, 250)
    })

    it('should not subscribe to query valueChanges when autocomplete disallowed', () => {
      component.isAutoCompleteAllowed = false
      component.ngOnInit()
      expect(component).toBeTruthy()
    })

    it('should trigger search when currentMessage emits truthy', () => {
      const searchSpy = jest.spyOn(component, 'search')
      component.ngOnInit()
      mockSearchApi.currentMessage.next(true)
      expect(searchSpy).toHaveBeenCalled()
    })

    it('should not trigger search when currentMessage emits falsy', () => {
      const searchSpy = jest.spyOn(component, 'search')
      component.ngOnInit()
      mockSearchApi.currentMessage.next(false)
      expect(searchSpy).not.toHaveBeenCalled()
    })

    it('should set searchQuery from queryParamMap with q and lang present', () => {
      component.ngOnInit()
      queryParamMap$.next({
        has: (key: string) => ['q', 'lang'].includes(key),
        get: (key: string) => (key === 'q' ? 'hello' : key === 'lang' ? 'hi' : null),
      })
      expect(component.searchQuery.q).toBe('hello')
      expect(component.searchQuery.l).toBe('hi')
    })

    it('should default searchQuery when q and lang absent', () => {
      component.ngOnInit()
      queryParamMap$.next({
        has: () => false,
        get: () => null,
      })
      expect(component.searchQuery.q).toBe('')
      expect(component.searchQuery.l).toBe('en')
    })

    it('should splice preferredLanguages into languageSearch when multiple langs', () => {
      mockConfigSvc.userPreference = { selectedLangGroup: 'en,hi' }
      component.ngOnInit()
      queryParamMap$.next({
        has: () => false,
        get: () => null,
      })
      expect(component.languageSearch).toContain('en,hi')
    })

    it('should set suggestedFilters from getSearchConfig', async () => {
      mockSearchSvc.getSearchConfig.mockResolvedValue({ search: { suggestedFilters: [{ id: 1 }] } })
      component.ngOnInit()
      await Promise.resolve()
      expect(component.suggestedFilters).toEqual([{ id: 1 }])
    })
  })
})
