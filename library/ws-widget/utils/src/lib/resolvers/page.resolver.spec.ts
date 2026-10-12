import { of, throwError } from 'rxjs'
import { PageResolve } from './page.resolver'
import { API_END_POINTS } from '../../../../../../src/app/constants/apiConstants'

describe('PageResolve', () => {
  let resolver: PageResolve
  let mockHttp: any
  let configSvc: any

  const buildRoute = (data: any, params: Record<string, string> = {}) => ({
    data,
    paramMap: {
      has: (k: string) => k in params,
      get: (k: string) => params[k],
    },
  }) as any

  const buildResolver = (locale = 'en') => new PageResolve(configSvc, mockHttp, locale)

  beforeEach(() => {
    mockHttp = {
      get: jest.fn().mockReturnValue(of({ pageLayout: {} })),
      post: jest.fn().mockReturnValue(of({ ok: true })),
    }
    configSvc = {
      sitePath: 'assets/configurations',
      localSitePath: 'fusion-assets/files',
      userProfile: null,
    }
    resolver = buildResolver()
  })

  afterEach(() => jest.clearAllMocks())

  it('should create', () => {
    expect(resolver).toBeTruthy()
  })

  describe('url selection', () => {
    const expectFetch = (route: any, url: string, done: jest.DoneCallback) => {
      ;(resolver.resolve(route) as any).subscribe(() => {
        expect(mockHttp.get).toHaveBeenCalledWith(`${url}.json`)
        done()
      })
    }

    it('should use an explicit pageUrl', done => {
      expectFetch(buildRoute({ pageUrl: 'custom/page' }), 'custom/page', done)
    })

    it('should read the search feature page from the local assets', done => {
      expectFetch(buildRoute({ pageType: 'feature', pageKey: 'search' }), 'fusion-assets/files/search', done)
    })

    it('should read the toc feature page from the local assets', done => {
      expectFetch(buildRoute({ pageType: 'feature', pageKey: 'toc' }), 'fusion-assets/files/toc', done)
    })

    it('should read any other feature page from the site path', done => {
      expectFetch(buildRoute({ pageType: 'feature', pageKey: 'profile' }), 'assets/configurations/profile', done)
    })

    it('should read the home page from the local assets', done => {
      expectFetch(buildRoute({ pageType: 'page', pageKey: 'pageKey' }, { pageKey: 'home' }), 'fusion-assets/files/home', done)
    })

    it('should read any other page from the site path', done => {
      expectFetch(
        buildRoute({ pageType: 'page', pageKey: 'pageKey' }, { pageKey: 'about' }),
        'assets/configurations/page/about',
        done,
      )
    })

    it('should read the public home page for a public route', done => {
      expectFetch(buildRoute({ pageType: 'public', pageKey: 'anything' }), 'assets/configurations/page/public-home', done)
    })

    it('should return a configuration error when no url can be formed', () => {
      expect(resolver.resolve(buildRoute({}))).toEqual({
        data: null,
        error: 'CONFIGURATION_ERROR_PAGE_URL_NOT_FORMED',
      })
    })

    it('should return a configuration error when a feature route has no page key', () => {
      expect(resolver.resolve(buildRoute({ pageType: 'feature' }))).toEqual({
        data: null,
        error: 'CONFIGURATION_ERROR_PAGE_URL_NOT_FORMED',
      })
    })

    it('should return a configuration error when a page route has no matching param', () => {
      expect(resolver.resolve(buildRoute({ pageType: 'page', pageKey: 'pageKey' }))).toEqual({
        data: null,
        error: 'CONFIGURATION_ERROR_PAGE_URL_NOT_FORMED',
      })
    })
  })

  describe('locale handling', () => {
    it('should skip the localized request for English', done => {
      ;(resolver.resolve(buildRoute({ pageUrl: 'custom/page' })) as any).subscribe((res: any) => {
        expect(mockHttp.get).toHaveBeenCalledTimes(1)
        expect(res).toEqual({ data: { pageLayout: {} }, error: null })
        done()
      })
    })

    it('should prefer the localized page when the profile language is not English', done => {
      configSvc.userProfile = { language: 'hi' }
      mockHttp.get.mockImplementation((url: string) =>
        of(url.includes('.hi.json') ? { localized: true } : { localized: false }))

      ;(resolver.resolve(buildRoute({ pageUrl: 'custom/page' })) as any).subscribe((res: any) => {
        expect(mockHttp.get).toHaveBeenCalledWith('custom/page.hi.json')
        expect(res.data).toEqual({ localized: true })
        done()
      })
    })

    it('should fall back to the general page when the localized one is missing', done => {
      configSvc.userProfile = { language: 'hi' }
      mockHttp.get.mockImplementation((url: string) =>
        url.includes('.hi.json') ? throwError(() => new Error('404')) : of({ localized: false }))

      ;(resolver.resolve(buildRoute({ pageUrl: 'custom/page' })) as any).subscribe((res: any) => {
        expect(res.data).toEqual({ localized: false })
        done()
      })
    })

    it('should treat a profile with no language as English', done => {
      configSvc.userProfile = {}
      ;(resolver.resolve(buildRoute({ pageUrl: 'custom/page' })) as any).subscribe(() => {
        expect(mockHttp.get).toHaveBeenCalledTimes(1)
        done()
      })
    })

    it('should skip the localized request for en-US', done => {
      configSvc.userProfile = { language: 'en-US' }
      ;(resolver.resolve(buildRoute({ pageUrl: 'custom/page' })) as any).subscribe(() => {
        expect(mockHttp.get).toHaveBeenCalledTimes(1)
        done()
      })
    })

    it('should surface a failed general request as an error payload', done => {
      mockHttp.get.mockReturnValue(throwError(() => new Error('down')))
      ;(resolver.resolve(buildRoute({ pageUrl: 'custom/page' })) as any).subscribe((res: any) => {
        expect(res.data).toBeNull()
        expect(res.error).toBeInstanceOf(Error)
        done()
      })
    })
  })

  describe('content-backed pages', () => {
    const contentRoute = () => buildRoute({ pageUrl: 'some/lex_auth_123' })

    it('should set the S3 cookie and fetch the artifact for a lex content id', done => {
      mockHttp.get.mockReturnValue(of({ fromArtifact: true }))
      mockHttp.post.mockImplementation((url: string) =>
        url === API_END_POINTS.SET_COOKIE
          ? of({ ok: true })
          : of({ status: 'Live', artifactUrl: 'https://cdn/page.json' }))

      ;(resolver.resolve(contentRoute()) as any).subscribe((res: any) => {
        expect(mockHttp.post).toHaveBeenCalledWith(API_END_POINTS.SET_COOKIE, { contentId: 'lex_auth_123' })
        expect(res).toEqual({ data: { fromArtifact: true }, error: null })
        done()
      })
    })

    it('should report NoContent for an expired content item', done => {
      mockHttp.post.mockImplementation((url: string) =>
        url === API_END_POINTS.SET_COOKIE ? of({ ok: true }) : of({ status: 'Expired', artifactUrl: 'x' }))

      ;(resolver.resolve(contentRoute()) as any).subscribe((res: any) => {
        expect(res).toEqual({ data: null, error: 'NoContent' })
        done()
      })
    })

    it('should report NoContent for a deleted content item', done => {
      mockHttp.post.mockImplementation((url: string) =>
        url === API_END_POINTS.SET_COOKIE ? of({ ok: true }) : of({ status: 'Deleted', artifactUrl: 'x' }))

      ;(resolver.resolve(contentRoute()) as any).subscribe((res: any) => {
        expect(res).toEqual({ data: null, error: 'NoContent' })
        done()
      })
    })

    it('should report NoContent when the artifact url is missing', done => {
      mockHttp.post.mockImplementation((url: string) =>
        url === API_END_POINTS.SET_COOKIE ? of({ ok: true }) : of({ status: 'Live' }))

      ;(resolver.resolve(contentRoute()) as any).subscribe((res: any) => {
        expect(res).toEqual({ data: null, error: 'NoContent' })
        done()
      })
    })

    it('should surface an artifact fetch failure as an error payload', done => {
      mockHttp.post.mockImplementation((url: string) =>
        url === API_END_POINTS.SET_COOKIE ? of({ ok: true }) : of({ status: 'Live', artifactUrl: 'https://cdn/page.json' }))
      mockHttp.get.mockReturnValue(throwError(() => new Error('cdn down')))

      ;(resolver.resolve(contentRoute()) as any).subscribe((res: any) => {
        expect(res.data).toBeNull()
        expect(res.error).toBeInstanceOf(Error)
        done()
      })
    })

    it('should swallow a failed set-cookie call', done => {
      mockHttp.post.mockImplementation((url: string) =>
        url === API_END_POINTS.SET_COOKIE
          ? throwError(() => new Error('cookie down'))
          : of({ status: 'Live', artifactUrl: 'https://cdn/page.json' }))
      mockHttp.get.mockReturnValue(of({ fromArtifact: true }))

      ;(resolver.resolve(contentRoute()) as any).subscribe((res: any) => {
        expect(res.data).toEqual({ fromArtifact: true })
        done()
      })
    })

    it('should surface a failed content lookup as an error payload', done => {
      mockHttp.post.mockImplementation((url: string) =>
        url === API_END_POINTS.SET_COOKIE ? of({ ok: true }) : throwError(() => new Error('content down')))

      ;(resolver.resolve(contentRoute()) as any).subscribe((res: any) => {
        expect(res.data).toBeNull()
        expect(res.error).toBeInstanceOf(Error)
        done()
      })
    })
  })
})
