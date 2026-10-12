import { Subject } from 'rxjs'
import { FilterDisplayComponent } from './filter-display.component'

let queryParamMap$: Subject<any>

const mockActivated: any = {
  parent: {
    snapshot: {
      data: {
        searchPageData: {
          data: {
            search: {
              tabs: [
                {
                  titleKey: 'learning',
                  searchQuery: { advancedFilters: [{ id: 'af1', filters: {} }] },
                },
              ],
            },
          },
        },
      },
    },
  },
  get queryParamMap() {
    return queryParamMap$.asObservable()
  },
}

const mockRouter: any = {
  navigate: jest.fn(),
}

const mockSearchServ: any = {
  translateSearchFilters: jest.fn().mockResolvedValue({}),
}

const mockConfigSvc: any = {
  userPreference: { selectedLocale: 'en' },
}

function createComponent(): FilterDisplayComponent {
  return new FilterDisplayComponent(
    mockActivated,
    mockRouter,
    mockSearchServ,
    mockConfigSvc,
  )
}

describe('FilterDisplayComponent', () => {
  let component: FilterDisplayComponent

  beforeEach(() => {
    jest.clearAllMocks()
    queryParamMap$ = new Subject<any>()
    mockConfigSvc.userPreference = { selectedLocale: 'en' }
    mockSearchServ.translateSearchFilters.mockResolvedValue({})
    mockActivated.parent = {
      snapshot: {
        data: {
          searchPageData: {
            data: {
              search: {
                tabs: [
                  {
                    titleKey: 'learning',
                    searchQuery: { advancedFilters: [{ id: 'af1', filters: {} }] },
                  },
                ],
              },
            },
          },
        },
      },
    }
    component = createComponent()
    component.routeComp = 'learning'
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should translate filters using userPreference locale', async () => {
      mockSearchServ.translateSearchFilters.mockResolvedValue({ contentType: { value: {} } })
      component.ngOnInit()
      await Promise.resolve()
      await Promise.resolve()
      expect(mockSearchServ.translateSearchFilters).toHaveBeenCalledWith('en')
      expect(component.translatedFilters.contenttype).toEqual({ value: {} })
    })

    it('should default to en when no userPreference locale', async () => {
      mockConfigSvc.userPreference = undefined
      component = createComponent()
      component.ngOnInit()
      await Promise.resolve()
      expect(mockSearchServ.translateSearchFilters).toHaveBeenCalledWith('en')
    })

    it('should set advancedFilters when routeComp matches tab titleKey', () => {
      component.ngOnInit()
      expect(component.advancedFilters).toEqual([{ id: 'af1', filters: {} }])
    })

    it('should not set advancedFilters when routeComp does not match', () => {
      component.routeComp = 'other'
      component.ngOnInit()
      expect(component.advancedFilters).toEqual([])
    })

    it('should not throw when activated.parent absent', () => {
      mockActivated.parent = null
      component = createComponent()
      expect(() => component.ngOnInit()).not.toThrow()
    })

    it('should set searchRequest filters from f query param', () => {
      component.ngOnInit()
      queryParamMap$.next({
        has: (key: string) => key === 'f',
        get: (key: string) => (key === 'f' ? JSON.stringify({ contentType: ['Course'] }) : null),
      })
      expect(component.searchRequest.filters).toEqual({ contentType: ['Course'] })
    })

    it('should reset searchRequest filters when no f param present', () => {
      component.ngOnInit()
      queryParamMap$.next({
        has: () => false,
        get: () => null,
      })
      expect(component.searchRequest.filters).toEqual({})
    })
  })

  it('advancedFilterClick should navigate with filter query', () => {
    component.advancedFilterClick({ id: 'af1', filters: { contentType: ['Course'] } } as any)
    expect(mockRouter.navigate).toHaveBeenCalledWith([], expect.objectContaining({
      queryParams: { f: JSON.stringify({ contentType: ['Course'] }) },
    }))
  })

  it('filterUnitResponseTrackBy should return id', () => {
    expect(component.filterUnitResponseTrackBy({ id: 'r1' } as any)).toBe('r1')
  })

  it('filterUnitTrackBy should return id', () => {
    expect(component.filterUnitTrackBy({ id: 'u1' } as any)).toBe('u1')
  })

  describe('applyFilters', () => {
    it('should addFilter when not currently present', () => {
      component.searchRequest.filters = {}
      const addSpy = jest.spyOn(component, 'addFilter')
      component.applyFilters({ unitFilter: { type: 'video', id: 'u1' } as any, filterType: 'resourceType' })
      expect(addSpy).toHaveBeenCalledWith({ key: 'resourceType', value: 'video' })
    })

    it('should removeFilter when value already present', () => {
      component.searchRequest.filters = { resourceType: ['video'] }
      const removeSpy = jest.spyOn(component, 'removeFilter')
      component.applyFilters({ unitFilter: { type: 'video', id: 'u1' } as any, filterType: 'resourceType' })
      expect(removeSpy).toHaveBeenCalledWith({ key: 'resourceType', value: 'video' })
    })

    it('should reset filtersResponse to empty array', () => {
      component.filtersResponse = [{ id: 'r1' } as any]
      component.applyFilters({ unitFilter: { type: '', id: 'u1' } as any, filterType: 'resourceType' })
      expect(component.filtersResponse).toEqual([])
    })
  })

  describe('addFilter', () => {
    it('should append value when key already exists', () => {
      component.searchRequest.filters = { resourceType: ['video'] }
      component.addFilter({ key: 'resourceType', value: 'doc' })
      expect(mockRouter.navigate).toHaveBeenCalledWith([], expect.objectContaining({
        queryParams: { f: JSON.stringify({ resourceType: ['video', 'doc'] }) },
      }))
    })

    it('should create new key with value array when key absent', () => {
      component.searchRequest.filters = {}
      component.addFilter({ key: 'resourceType', value: 'video' })
      expect(mockRouter.navigate).toHaveBeenCalledWith([], expect.objectContaining({
        queryParams: { f: JSON.stringify({ resourceType: ['video'] }) },
      }))
    })
  })

  describe('removeFilter', () => {
    it('should remove value from filters and navigate', () => {
      component.searchRequest.filters = { resourceType: ['video', 'doc'] }
      component.removeFilter({ key: 'resourceType', value: 'video' })
      expect(mockRouter.navigate).toHaveBeenCalledWith([], expect.objectContaining({
        queryParams: { f: JSON.stringify({ resourceType: ['doc'] }) },
      }))
    })

    it('should delete key entirely when resulting array is empty', () => {
      component.searchRequest.filters = { resourceType: ['video'] }
      component.removeFilter({ key: 'resourceType', value: 'video' })
      expect(mockRouter.navigate).toHaveBeenCalledWith([], expect.objectContaining({
        queryParams: { f: JSON.stringify({}) },
      }))
    })
  })

  it('removeFilters should navigate with null f param', () => {
    component.removeFilters()
    expect(mockRouter.navigate).toHaveBeenCalledWith([], expect.objectContaining({
      queryParams: { f: null },
    }))
  })

  describe('lowerCaseFilter', () => {
    it('should lowercase keys and recurse into nested value objects', () => {
      const filterObj: any = {
        ContentType: { value: { SubType: { value: {} } } },
      }
      component.lowerCaseFilter(filterObj, Object.keys(filterObj))
      expect(filterObj.contenttype).toBeDefined()
      expect(filterObj.contenttype.value.subtype).toBeDefined()
    })

    it('should handle keys with no nested value', () => {
      const filterObj: any = { Simple: { value: {} } }
      expect(() => component.lowerCaseFilter(filterObj, Object.keys(filterObj))).not.toThrow()
    })
  })
})
