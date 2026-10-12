import { of } from 'rxjs'
import { SearchApiService } from './search-api.service'

describe('SearchApiService', () => {
  let service: SearchApiService
  let mockHttp: any
  let mockKeycloakSvc: any
  let mockLogger: any

  beforeEach(() => {
    mockHttp = {
      post: jest.fn().mockReturnValue(of({})),
      get: jest.fn().mockReturnValue(of([])),
    }
    mockKeycloakSvc = { getKeycloakInstance: jest.fn().mockReturnValue(null) }
    mockLogger = { log: jest.fn() }
    service = new SearchApiService(mockHttp, mockKeycloakSvc, mockLogger)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('userId', () => {
    it('returns empty string when no keycloak instance', () => {
      mockKeycloakSvc.getKeycloakInstance.mockReturnValue(null)
      expect(service.userId).toBe('')
    })

    it('returns sub from tokenParsed when present', () => {
      mockKeycloakSvc.getKeycloakInstance.mockReturnValue({ tokenParsed: { sub: 'user-1' } })
      expect(service.userId).toBe('user-1')
    })

    it('falls back to idTokenParsed sub when tokenParsed is absent', () => {
      mockKeycloakSvc.getKeycloakInstance.mockReturnValue({ idTokenParsed: { sub: 'user-2' } })
      expect(service.userId).toBe('user-2')
    })

    it('returns undefined when neither tokenParsed nor idTokenParsed has sub', () => {
      mockKeycloakSvc.getKeycloakInstance.mockReturnValue({})
      expect(service.userId).toBeUndefined()
    })
  })

  describe('changeMessage / currentMessage', () => {
    it('emits the message onto currentMessage', done => {
      service.currentMessage.subscribe(msg => {
        if (msg) {
          expect(msg).toBe('hello')
          done()
        }
      })
      service.changeMessage('hello')
    })
  })

  describe('getSearchResults', () => {
    it('posts the social search request', () => {
      const req: any = { query: 'x' }
      service.getSearchResults(req)
      expect(mockHttp.post).toHaveBeenCalledWith(expect.any(String), req)
    })
  })

  describe('getSearchAutoCompleteResults', () => {
    it('gets autocomplete results with params', () => {
      const params = { q: 'abc', l: 'en' }
      service.getSearchAutoCompleteResults(params)
      expect(mockHttp.get).toHaveBeenCalledWith(expect.any(String), { params })
    })
  })

  describe('getSearchCompetencyCourses', () => {
    it('posts the given body', () => {
      const body = { foo: 'bar' }
      service.getSearchCompetencyCourses(body)
      expect(mockHttp.post).toHaveBeenCalledWith(expect.any(String), body)
    })
  })

  describe('getSearchV6Results', () => {
    it('builds filters from facets and searchconfig', done => {
      const res = {
        result: { facets: [{ name: 'primaryCategory' }] },
        filters: [],
      }
      mockHttp.post.mockReturnValue(of(res))
      const searchconfig = [
        {
          displayname: 'Category',
          name: 'primaryCategory',
          values: [{ name: 'Course', count: 5 }],
        },
      ]
      service.getSearchV6Results({} as any, searchconfig).subscribe((result: any) => {
        expect(result.filters.length).toBe(1)
        expect(result.filters[0].content[0].displayName).toBe('Course')
        done()
      })
    })

    it('trims catalogPaths content to its single child list', done => {
      const res = {
        result: { facets: [{ name: 'x' }] },
        filters: [],
      }
      mockHttp.post.mockReturnValue(of(res))
      const searchconfig = [
        {
          displayname: 'Catalog',
          name: 'catalogPaths',
          values: [],
        },
      ]
      service.getSearchV6Results({} as any, searchconfig).subscribe((result: any) => {
        const catalogFilter = result.filters.find((f: any) => f.type === 'catalogPaths')
        expect(catalogFilter).toBeTruthy()
        done()
      })
    })

    it('does not build filters when facets are empty', done => {
      const res = { result: { facets: [] }, filters: [] }
      mockHttp.post.mockReturnValue(of(res))
      service.getSearchV6Results({} as any, []).subscribe((result: any) => {
        expect(result.filters).toEqual([])
        done()
      })
    })
  })

  describe('getSearchV7Results', () => {
    it('logs v6 branch when content is present', done => {
      const res = { result: { content: [{ id: 1 }] } }
      mockHttp.post.mockReturnValue(of(res))
      service.getSearchV7Results({} as any).subscribe(() => {
        expect(mockLogger.log).toHaveBeenCalledWith('v6', res)
        done()
      })
    })

    it('logs v7 branch when content is empty', done => {
      const res = { result: { content: [] } }
      mockHttp.post.mockReturnValue(of(res))
      service.getSearchV7Results({} as any).subscribe(() => {
        expect(mockLogger.log).toHaveBeenCalledWith('v7', res)
        done()
      })
    })
  })
})
