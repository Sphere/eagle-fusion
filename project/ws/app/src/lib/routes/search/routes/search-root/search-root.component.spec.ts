import { Subject } from 'rxjs'
import { Router, ActivatedRoute } from '@angular/router'
import { ConfigurationsService } from '@ws-widget/utils'
import { SearchRootComponent } from './search-root.component'

describe('SearchRootComponent', () => {
  let component: SearchRootComponent
  let mockRouter: Partial<Router>
  let mockActivated: any
  let mockConfigSvc: Partial<ConfigurationsService>
  let queryParamMap$: Subject<any>

  const createComponent = () => new SearchRootComponent(
    mockRouter as Router,
    mockActivated as ActivatedRoute,
    mockConfigSvc as ConfigurationsService,
  )

  beforeEach(() => {
    queryParamMap$ = new Subject<any>()
    mockRouter = {
      navigateByUrl: jest.fn(),
      url: '/app/search/courses',
      parseUrl: jest.fn().mockReturnValue({
        root: { children: { primary: { segments: [{ path: 'learning' }, { path: 'courses' }] } } },
      }),
    }
    mockActivated = {
      snapshot: { data: { searchPageData: { data: { search: { tabs: ['t1'], routeValue: ['courses'], placeHolder: {}, social: {} } } } } },
      queryParamMap: queryParamMap$,
    }
    mockConfigSvc = { pageNavBar: { title: 'Search' } as any }
    component = createComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set pageNavbar from configSvc on construction', () => {
    expect(component.pageNavbar).toEqual({ title: 'Search' })
  })

  describe('ngOnInit', () => {
    it('should set searchTabs from activated route snapshot data', () => {
      component.ngOnInit()
      expect(component.searchTabs.routeValue).toEqual(['courses'])
    })

    it('should not set searchTabs when snapshot data is missing', () => {
      mockActivated.snapshot = { data: {} }
      component = createComponent()
      component.ngOnInit()
      expect(component.searchTabs.tabs).toEqual([])
    })

    it('should update searchRequest.query when q param is present', () => {
      component.ngOnInit()
      queryParamMap$.next({ has: (key: string) => key === 'q', get: () => 'angular' })
      expect(component.searchRequest.query).toBe('angular')
    })

    it('should default query to empty string when q value is falsy', () => {
      component.ngOnInit()
      queryParamMap$.next({ has: (key: string) => key === 'q', get: () => null })
      expect(component.searchRequest.query).toBe('')
    })

    it('should not update query when q param is absent', () => {
      component.ngOnInit()
      queryParamMap$.next({ has: () => false, get: () => null })
      expect(component.searchRequest.query).toBe('')
    })

    it('should set route and selectedIndex from url segments', () => {
      component.ngOnInit()
      queryParamMap$.next({ has: () => false, get: () => null })
      expect(component.route).toBe('courses')
      expect(component.selectedIndex).toBe(0)
    })
  })

  describe('routeTabs', () => {
    it('should set selectedIndex and navigate to the selected tab route', () => {
      component.searchTabs = { tabs: [], routeValue: ['courses', 'programs'], placeHolder: {}, social: {} }
      component.routeTabs(1)
      expect(component.selectedIndex).toBe(1)
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/search/programs')
    })
  })

  describe('hasKeys', () => {
    it('should return true when object has keys', () => {
      expect(component.hasKeys({ a: 1 })).toBe(true)
    })

    it('should return false for an empty object', () => {
      expect(component.hasKeys({})).toBe(false)
    })

    it('should return false for null', () => {
      expect(component.hasKeys(null as any)).toBe(false)
    })
  })
})
