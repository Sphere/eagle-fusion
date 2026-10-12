import { of } from 'rxjs'
import { OrgServiceService } from './org-service.service'

describe('OrgServiceService', () => {
  let service: OrgServiceService
  let mockHttp: any
  let mockConfigSvc: any
  let mockLogger: any

  beforeEach(() => {
    mockHttp = {
      post: jest.fn().mockReturnValue(of({ ok: true })),
      get: jest.fn().mockReturnValue({ toPromise: jest.fn().mockResolvedValue({ data: 'x' }) }),
    }
    mockConfigSvc = { sitePath: 'assets/configurations' }
    mockLogger = { log: jest.fn() }
    service = new OrgServiceService(mockHttp, mockConfigSvc, mockLogger)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('getOrgConfig', () => {
    it('fetches and caches the org config on first call', () => {
      const result1 = service.getOrgConfig()
      const result2 = service.getOrgConfig()
      expect(mockHttp.post).toHaveBeenCalledTimes(1)
      expect(result1).toBe(result2)
    })

    it('refetches once the cache TTL has expired', () => {
      service.getOrgConfig()
      expect(mockHttp.post).toHaveBeenCalledTimes(1)
      const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 6 * 60 * 1000)
      service.getOrgConfig()
      expect(mockHttp.post).toHaveBeenCalledTimes(2)
      nowSpy.mockRestore()
    })
  })

  describe('getSearchResults', () => {
    it('posts a search request with the given source', () => {
      service.getSearchResults('sourceA')
      expect(mockHttp.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ request: expect.objectContaining({ filters: expect.objectContaining({ sourceName: 'sourceA' }) }) }),
      )
    })
  })

  describe('getSearchV7Results', () => {
    it('posts a search request with the given source', () => {
      service.getSearchV7Results('sourceB')
      expect(mockHttp.post).toHaveBeenCalled()
    })
  })

  describe('getSearchResultsById', () => {
    it('posts a search request with the given identifier', () => {
      service.getSearchResultsById('id1')
      expect(mockHttp.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ request: expect.objectContaining({ filters: expect.objectContaining({ identifier: 'id1' }) }) }),
      )
    })
  })

  describe('getSearchResultsV7ById', () => {
    it('posts a search request with the given identifier', () => {
      service.getSearchResultsV7ById('id2')
      expect(mockHttp.post).toHaveBeenCalled()
    })
  })

  describe('getDatabyOrgId', () => {
    it('fetches course.json from the configured site path', async () => {
      const result = await service.getDatabyOrgId()
      expect(mockHttp.get).toHaveBeenCalledWith('assets/configurations/page/course.json')
      expect(result).toEqual({ data: 'x' })
    })
  })

  describe('getLiveSearchResults', () => {
    it('posts a live search request with the given language', () => {
      service.getLiveSearchResults('en')
      expect(mockHttp.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ request: expect.objectContaining({ filters: expect.objectContaining({ lang: 'en' }) }) }),
      )
    })
  })

  describe('getTopLiveSearchResults', () => {
    it('logs the language and posts a search request with identifiers', () => {
      service.getTopLiveSearchResults(['id1', 'id2'], 'en')
      expect(mockLogger.log).toHaveBeenCalledWith('lang ', 'en')
      expect(mockHttp.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ request: expect.objectContaining({ filters: expect.objectContaining({ identifier: ['id1', 'id2'] }) }) }),
      )
    })
  })

  describe('setSashaktId', () => {
    it('calls the sashakt auth endpoint with token and id', () => {
      service.setSashaktId('tok', 'mod1')
      expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('token=tok&moduleId=mod1'))
    })
  })

  describe('setMaternyId', () => {
    it('logs data and posts to the maternity auth endpoint', () => {
      service.setMaternyId({ a: 1 })
      expect(mockLogger.log).toHaveBeenCalledWith({ a: 1 })
      expect(mockHttp.post).toHaveBeenCalled()
    })
  })

  describe('setMNCId', () => {
    it('logs data and posts to the MNC auth endpoint', () => {
      service.setMNCId({ b: 2 })
      expect(mockLogger.log).toHaveBeenCalledWith({ b: 2 })
      expect(mockHttp.post).toHaveBeenCalled()
    })
  })

  describe('setTnaiToken', () => {
    it('logs data and posts to the tnai auth endpoint', () => {
      service.setTnaiToken({ c: 3 })
      expect(mockLogger.log).toHaveBeenCalledWith({ c: 3 })
      expect(mockHttp.post).toHaveBeenCalled()
    })
  })

  describe('setTnnmcToken', () => {
    it('logs data and posts to the tnnmc auth endpoint', () => {
      service.setTnnmcToken({ d: 4 })
      expect(mockLogger.log).toHaveBeenCalledWith({ d: 4 })
      expect(mockHttp.post).toHaveBeenCalled()
    })
  })

  describe('setConnectSid', () => {
    it('posts to the keycloak cookie endpoint with the auth code', () => {
      service.setConnectSid('code1')
      expect(mockHttp.post).toHaveBeenCalledWith(expect.stringContaining('code=code1'), {})
    })
  })
})
