jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class {
    sitePath = 'assets/configurations'
  },
}))

jest.mock('../../../../library/ws-widget/collection/src/lib/_services/widget-content.model', () => ({}))

jest.mock('../../constants/apiConstants', () => ({
  API_END_POINTS: {
    SEARCH_V7PUBLIC: '/apis/search/v7/public',
    KEYCLOAK_COOKIE: '/apis/keycloak',
    FETCH_USER_ENROLLMENT_LIST: (userId: string) => `/apis/enrollment/${userId}`,
  },
}))

import { of, throwError } from 'rxjs'
import { OrgServiceService } from './org-home-service.service'
import { ConfigurationsService } from '@ws-widget/utils'

describe('OrgServiceService', () => {
  let service: OrgServiceService
  let mockHttp: any
  let mockConfigSvc: any

  beforeEach(() => {
    mockHttp = {
      get: jest.fn().mockReturnValue(of({ name: 'test-org' })),
      post: jest.fn().mockReturnValue(of({ result: { courses: [] } })),
    }
    mockConfigSvc = new ConfigurationsService()
    service = new OrgServiceService(mockHttp, mockConfigSvc)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('hideHeaderFooter defaults to false', (done) => {
    service.hideHeaderFooter.subscribe(v => {
      expect(v).toBe(false)
      done()
    })
  })

  describe('getOrgMetadata', () => {
    it('calls http.get and returns the response', (done) => {
      service.getOrgMetadata().subscribe(data => {
        expect(data).toEqual({ name: 'test-org' })
        done()
      })
    })
  })

  describe('resolve', () => {
    it('returns wrapped data with error null', (done) => {
      service.resolve().subscribe(res => {
        expect(res.data).toEqual({ name: 'test-org' })
        expect(res.error).toBeNull()
        done()
      })
    })

    it('returns error when getOrgMetadata fails', (done) => {
      mockHttp.get.mockReturnValue(throwError(() => new Error('Network error')))
      service.resolve().subscribe(res => {
        expect(res.data).toBeNull()
        expect(res.error).toBeDefined()
        done()
      })
    })
  })

  describe('getSearchResults', () => {
    it('calls http.post with SEARCH_V7PUBLIC URL', () => {
      service.getSearchResults().subscribe()
      expect(mockHttp.post).toHaveBeenCalledWith(
        '/apis/search/v7/public',
        expect.any(Object)
      )
    })
  })

  describe('getLiveSearchResults', () => {
    it('calls http.post with language filter when language provided', () => {
      service.getLiveSearchResults('hi').subscribe()
      const body = mockHttp.post.mock.calls[0][1]
      expect(body.request.filters).toHaveProperty('lang', 'hi')
    })

    it('calls http.post without lang filter when language is empty', () => {
      service.getLiveSearchResults('').subscribe()
      const body = mockHttp.post.mock.calls[0][1]
      expect(body.request.filters).not.toHaveProperty('lang')
    })
  })

  describe('fetchUserBatchList', () => {
    it('calls http.get with the user enrollment URL', () => {
      mockHttp.get.mockReturnValue(of({ result: { courses: [{ id: 'c1' }] } }))
      service.fetchUserBatchList('user-1').subscribe()
      expect(mockHttp.get).toHaveBeenCalledWith('/apis/enrollment/user-1')
    })
  })

  describe('getDatabyOrgId', () => {
    it('calls http.get with the course.json URL and returns data', (done) => {
      mockHttp.get.mockReturnValue(of({ courses: [{ id: 'c1' }] }))
      service.getDatabyOrgId().then(data => {
        expect(data).toEqual({ courses: [{ id: 'c1' }] })
        expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('course.json'))
        done()
      })
    })
  })

  describe('setConnectSid', () => {
    it('calls http.post with keycloak endpoint and returns response', (done) => {
      mockHttp.post.mockReturnValue(of({ session: 'abc' }))
      service.setConnectSid('auth-code-123').subscribe(data => {
        expect(data).toEqual({ session: 'abc' })
        expect(mockHttp.post).toHaveBeenCalledWith(
          expect.stringContaining('keycloak'),
          {}
        )
        done()
      })
    })
  })

  describe('handleError', () => {
    it('returns an observable that throws the given error', (done) => {
      const err = new Error('test error')
      service.handleError(err as any).subscribe({
        error: (e) => {
          expect(e).toBe(err)
          done()
        },
      })
    })
  })
})
