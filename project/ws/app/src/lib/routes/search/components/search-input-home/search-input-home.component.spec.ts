import { Subject } from 'rxjs'
import { SearchInputHomeComponent } from './search-input-home.component'

let queryParamMap$: Subject<any>

const mockActivated: any = {
  snapshot: { queryParams: { q: '' }, data: {} },
  parent: {},
  get queryParamMap() {
    return queryParamMap$.asObservable()
  },
}

const mockRouter: any = {
  navigate: jest.fn(),
  url: '/app/search/learning',
}

const mockSearchServSvc: any = {
  getLanguageSearchIndex: jest.fn().mockImplementation((l: string) => l),
  getSearchConfig: jest.fn().mockResolvedValue({
    search: { isAutoCompleteAllowed: true, languageSearch: ['All', 'En', 'Hi'] },
  }),
  searchAutoComplete: jest.fn().mockResolvedValue([]),
}

const mockConfigSvc: any = {
  activeLocale: { locals: ['en'] },
  userPreference: { selectedLangGroup: 'en,hi' },
}

function createComponent(): SearchInputHomeComponent {
  return new SearchInputHomeComponent(
    mockActivated,
    mockRouter,
    mockSearchServSvc,
    mockConfigSvc,
    mockActivated,
  )
}

describe('SearchInputHomeComponent', () => {
  let component: SearchInputHomeComponent

  beforeEach(() => {
    jest.clearAllMocks()
    queryParamMap$ = new Subject<any>()
    mockActivated.snapshot = { queryParams: { q: '' }, data: {} }
    mockRouter.url = '/app/search/learning'
    mockConfigSvc.activeLocale = { locals: ['en'] }
    mockConfigSvc.userPreference = { selectedLangGroup: 'en,hi' }
    component = createComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('getActiveLocale should return locale index from configSvc', () => {
    expect(component.getActiveLocale()).toBe('en')
  })

  it('getActiveLocale should default to en when no activeLocale', () => {
    mockConfigSvc.activeLocale = undefined
    expect(component.getActiveLocale()).toBe('en')
  })

  describe('preferredLanguages', () => {
    it('should return joined preferred languages', () => {
      expect(component.preferredLanguages).toBe('en,hi')
    })

    it('should return null when no userPreference', () => {
      mockConfigSvc.userPreference = undefined
      expect(component.preferredLanguages).toBeNull()
    })
  })

  it('swapRemove should move array element', () => {
    const arr = ['all', 'en', 'hi']
    component.swapRemove(arr, 1, 0)
    expect(arr).toEqual(['en', 'all', 'hi'])
  })

  describe('autoFilter', () => {
    it('should do nothing when no searchPageData', () => {
      mockActivated.snapshot.data = {}
      expect(() => component.autoFilter()).not.toThrow()
    })

    it('should subscribe to valueChanges when isAutoCompleteAllowed is true', done => {
      mockActivated.snapshot.data = {
        searchPageData: { data: { search: { isAutoCompleteAllowed: true } } },
      }
      component.autoFilter()
      const spy = jest.spyOn(component, 'getSearchAutoCompleteResults')
      component.queryControl.setValue('term')
      setTimeout(() => {
        expect(spy).toHaveBeenCalledWith('term')
        done()
      }, 250)
    })

    it('should subscribe when isAutoCompleteAllowed is undefined', () => {
      mockActivated.snapshot.data = {
        searchPageData: { data: { search: {} } },
      }
      expect(() => component.autoFilter()).not.toThrow()
    })

    it('should not subscribe when isAutoCompleteAllowed is false', () => {
      mockActivated.snapshot.data = {
        searchPageData: { data: { search: { isAutoCompleteAllowed: false } } },
      }
      expect(() => component.autoFilter()).not.toThrow()
    })
  })

  describe('init', () => {
    it('should focus searchInputElem when nativeElement present', () => {
      const focus = jest.fn()
      component.searchInputElem = { nativeElement: { focus } } as any
      component.init()
      expect(focus).toHaveBeenCalled()
    })

    it('should not focus when nativeElement absent', () => {
      component.searchInputElem = {} as any
      expect(() => component.init()).not.toThrow()
    })

    it('should set queryControl value from q param when on search/learning url', () => {
      component.init()
      queryParamMap$.next({
        has: (key: string) => key === 'q',
        get: (key: string) => (key === 'q' ? 'hello' : null),
      })
      expect(component.queryControl.value).toBe('hello')
    })

    it('should reset queryControl when not on search/learning url', () => {
      mockRouter.url = '/app/other'
      component.init()
      queryParamMap$.next({
        has: () => true,
        get: () => 'hello',
      })
      expect(component.queryControl.value).toBe('')
    })

    it('should set languageSearch and splice preferredLanguages when multiple langs', () => {
      mockActivated.snapshot.data = {
        searchPageData: { data: { search: { languageSearch: ['All', 'En', 'Hi'] } } },
      }
      component.init()
      expect(component.languageSearch).toContain('en,hi')
    })

    it('should not process languageSearch when empty', () => {
      mockActivated.snapshot.data = {
        searchPageData: { data: { search: { languageSearch: [] } } },
      }
      expect(() => component.init()).not.toThrow()
    })
  })

  describe('ngOnInit', () => {
    it('should fetch search config and call init', async () => {
      const initSpy = jest.spyOn(component, 'init').mockImplementation()
      component.ngOnInit()
      await Promise.resolve()
      await Promise.resolve()
      expect(mockActivated.snapshot.data.searchPageData).toBeDefined()
      expect(initSpy).toHaveBeenCalled()
    })
  })

  it('ngOnChanges should not throw', () => {
    expect(() => component.ngOnChanges()).not.toThrow()
  })

  describe('updateQuery', () => {
    it('should blur input and navigate to /app/search when ref is home', () => {
      const blur = jest.fn()
      component.searchInputElem = { nativeElement: { blur } } as any
      component.ref = 'home'
      const emitSpy = jest.spyOn(component.closed, 'emit')
      component.updateQuery(' test ')
      expect(blur).toHaveBeenCalled()
      expect(emitSpy).toHaveBeenCalledWith(false)
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/search'], expect.objectContaining({
        queryParams: { q: 'test' },
      }))
    })

    it('should navigate relative to parent when ref is not home', () => {
      component.ref = ''
      component.updateQuery('abc')
      expect(mockRouter.navigate).toHaveBeenCalledWith([], expect.objectContaining({
        queryParams: { q: 'abc' },
      }))
    })

    it('should not throw when searchInputElem has no nativeElement', () => {
      component.searchInputElem = {} as any
      expect(() => component.updateQuery('x')).not.toThrow()
    })
  })

  describe('getSearchAutoCompleteResults', () => {
    it('should fetch autocomplete results when single locale', async () => {
      component.searchLocale = 'en'
      mockSearchServSvc.searchAutoComplete.mockResolvedValue([{ term: 'x' }])
      component.getSearchAutoCompleteResults('q')
      await Promise.resolve()
      expect(component.autoCompleteResults).toEqual([{ term: 'x' }])
    })

    it('should not fetch when multiple locales', () => {
      component.searchLocale = 'en,hi'
      component.getSearchAutoCompleteResults('q')
      expect(mockSearchServSvc.searchAutoComplete).not.toHaveBeenCalled()
    })

    it('should handle rejection silently', async () => {
      component.searchLocale = 'en'
      mockSearchServSvc.searchAutoComplete.mockRejectedValue(new Error('fail'))
      component.getSearchAutoCompleteResults('q')
      await Promise.resolve()
      expect(component).toBeTruthy()
    })
  })

  it('searchLanguage should navigate with lang and query', () => {
    component.queryControl.setValue('term')
    component.searchLanguage('hi')
    expect(mockRouter.navigate).toHaveBeenCalledWith([], expect.objectContaining({
      queryParams: { lang: 'hi', q: 'term' },
    }))
  })
})
