import { HttpErrorResponse } from '@angular/common/http'
import { of, throwError } from 'rxjs'
import { ExploreDetailResolve } from './explore-detail.resolver'

describe('ExploreDetailResolve', () => {
  let resolver: ExploreDetailResolve
  let mockHttp: any
  let configSvc: any
  let utilitySvc: any
  let warnSpy: jest.SpyInstance

  const buildPageData = () => ({
    navigationBar: {
      pageTitle: 'Explore',
      pageBackLink: '/page/explore',
      links: [
        { widgetData: { tags: 'Health>Nursing' } },
        { widgetData: { tags: 'Other' } },
      ],
    },
    pageLayout: {
      widgetData: {
        widgets: [
          { widgetSubType: 'cardBreadcrumb', widgetData: {} },
          {
            widgetSubType: 'contentStripMultiple',
            widgetData: {
              strips: [{ request: { searchV6: { filters: [{ andFilters: [] }] } } }],
            },
          },
        ],
      },
    },
  })

  const buildRoute = (overrides: any = {}) => ({
    params: { tags: encodeURIComponent('Health>Nursing') },
    data: { pageType: 'page', pageKey: 'explore' },
    ...overrides,
  }) as any

  beforeEach(() => {
    jest.useFakeTimers()
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
    mockHttp = { get: jest.fn().mockReturnValue(of(buildPageData())) }
    configSvc = { sitePath: 'assets/configurations', isIntranetAllowed: false }
    utilitySvc = { isMobile: false }
    resolver = new ExploreDetailResolve(mockHttp, configSvc, utilitySvc)
  })

  afterEach(() => {
    jest.useRealTimers()
    warnSpy.mockRestore()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(resolver).toBeTruthy()
  })

  describe('url selection', () => {
    it('should build the url from the page key', done => {
      resolver.resolve(buildRoute(), {} as any).subscribe(() => {
        expect(mockHttp.get).toHaveBeenCalledWith('assets/configurations/page/explore.json')
        done()
      })
    })

    it('should prefer an explicit pageUrl', done => {
      resolver.resolve(buildRoute({ data: { pageUrl: '/custom.json' } }), {} as any).subscribe(() => {
        expect(mockHttp.get).toHaveBeenCalledWith('/custom.json')
        done()
      })
    })

    it('should let the page key override an explicit pageUrl', done => {
      const route = buildRoute({ data: { pageUrl: '/custom.json', pageType: 'page', pageKey: 'explore' } })
      resolver.resolve(route, {} as any).subscribe(() => {
        expect(mockHttp.get).toHaveBeenCalledWith('assets/configurations/page/explore.json')
        done()
      })
    })

    it('should snapshot the intranet setting on each resolve', done => {
      configSvc.isIntranetAllowed = true
      resolver.resolve(buildRoute(), {} as any).subscribe(() => {
        expect(resolver.isIntranetAllowedSettings).toBe(true)
        done()
      })
    })
  })

  describe('transformPageData', () => {
    it('should keep only the navigation links matching the tag', done => {
      resolver.resolve(buildRoute(), {} as any).subscribe((res: any) => {
        expect(res.data.navigationBar.links).toEqual([{ widgetData: { tags: 'Health>Nursing' } }])
        done()
      })
    })

    it('should build a breadcrumb path from the tag segments', done => {
      resolver.resolve(buildRoute(), {} as any).subscribe((res: any) => {
        const breadcrumb = res.data.pageLayout.widgetData.widgets[0]
        expect(breadcrumb.widgetData.path).toEqual([
          { text: 'Explore', clickUrl: '/page/explore' },
          { text: 'Health', clickUrl: '/page/explore/Health' },
          { text: 'Nursing', clickUrl: '/page/explore/Health>Nursing' },
        ])
        done()
      })
    })

    it('should push the catalog path filter onto every strip', done => {
      resolver.resolve(buildRoute(), {} as any).subscribe((res: any) => {
        const strip = res.data.pageLayout.widgetData.widgets[1].widgetData.strips[0]
        expect(strip.request.searchV6.filters[0].andFilters).toEqual([{ catalogPaths: ['Health>Nursing'] }])
        done()
      })
    })

    it('should add the intranet filter on mobile when intranet content is not allowed', done => {
      utilitySvc.isMobile = true
      resolver.resolve(buildRoute(), {} as any).subscribe((res: any) => {
        const strip = res.data.pageLayout.widgetData.widgets[1].widgetData.strips[0]
        expect(strip.request.searchV6.filters[0].andFilters).toContainEqual({ isInIntranet: ['false'] })
        done()
      })
    })

    it('should omit the intranet filter on mobile when intranet content is allowed', done => {
      utilitySvc.isMobile = true
      configSvc.isIntranetAllowed = true
      resolver.resolve(buildRoute(), {} as any).subscribe((res: any) => {
        const strip = res.data.pageLayout.widgetData.widgets[1].widgetData.strips[0]
        expect(strip.request.searchV6.filters[0].andFilters).not.toContainEqual({ isInIntranet: ['false'] })
        done()
      })
    })

    it('should apply the same filters to the no-data widget strips', done => {
      const pageData = buildPageData()
      pageData.pageLayout.widgetData.widgets[1].widgetData.noDataWidget = {
        widgetData: { strips: [{ request: { searchV6: { filters: [{ andFilters: [] }] } } }] },
      } as any
      mockHttp.get.mockReturnValue(of(pageData))
      utilitySvc.isMobile = true

      resolver.resolve(buildRoute(), {} as any).subscribe((res: any) => {
        const strip = res.data.pageLayout.widgetData.widgets[1].widgetData.noDataWidget.widgetData.strips[0]
        expect(strip.request.searchV6.filters[0].andFilters).toEqual([
          { catalogPaths: ['Health>Nursing'] },
          { isInIntranet: ['false'] },
        ])
        done()
      })
    })

    it('should leave the page untouched when there is no navigation bar', done => {
      const pageData: any = buildPageData()
      delete pageData.navigationBar
      pageData.pageLayout.widgetData.widgets = [
        { widgetSubType: 'other', widgetData: {} },
      ]
      mockHttp.get.mockReturnValue(of(pageData))

      resolver.resolve(buildRoute(), {} as any).subscribe((res: any) => {
        expect(res.data.pageLayout.widgetData.widgets[0].widgetData).toEqual({})
        expect(res.error).toBeNull()
        done()
      })
    })
  })

  describe('error mapping', () => {
    const resolveWithError = (error: any) => {
      mockHttp.get.mockReturnValue(throwError(() => error))
      return new Promise<any>(resolve => {
        resolver.resolve(buildRoute(), {} as any).subscribe(res => resolve(res))
        jest.runOnlyPendingTimers()
      })
    }

    it('should map a 404 to NotFound', async () => {
      const res = await resolveWithError(new HttpErrorResponse({ status: 404 }))
      expect(res.data).toBeNull()
      expect(res.error.type).toBe('NotFound')
      expect(res.error.status).toBe(404)
    })

    it('should map a 403 to Forbidden', async () => {
      const res = await resolveWithError(new HttpErrorResponse({ status: 403 }))
      expect(res.error.type).toBe('Forbidden')
    })

    it('should map a 400 to ClientError', async () => {
      const res = await resolveWithError(new HttpErrorResponse({ status: 400 }))
      expect(res.error.type).toBe('ClientError')
    })

    it('should map a non-http error to NetworkError with status 0', async () => {
      const res = await resolveWithError(new Error('boom'))
      expect(res.error.type).toBe('NetworkError')
      expect(res.error.status).toBe(0)
      expect(res.error.message).toBe('Unknown error')
    })
  })
})
