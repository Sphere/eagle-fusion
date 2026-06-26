import { of } from 'rxjs'
import { HttpRequest, HttpResponse } from '@angular/common/http'
import { AssetCacheInterceptorService } from './asset-cache-interceptor.service'

describe('AssetCacheInterceptorService', () => {
  let service: AssetCacheInterceptorService
  let mockHandler: any

  beforeEach(() => {
    sessionStorage.clear()
    service = new AssetCacheInterceptorService()
    mockHandler = {
      handle: jest.fn().mockReturnValue(of(new HttpResponse({ status: 200, body: { data: 'fresh' } }))),
    }
  })

  afterEach(() => {
    sessionStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('passes through non-GET requests without caching', (done) => {
    const req = new HttpRequest('POST', 'http://localhost/fusion-assets/files/apps.json', {})
    service.intercept(req, mockHandler).subscribe(() => {
      expect(mockHandler.handle).toHaveBeenCalled()
      done()
    })
  })

  it('passes through non-cacheable GET requests', (done) => {
    const req = new HttpRequest('GET', 'http://localhost/api/data')
    service.intercept(req, mockHandler).subscribe(() => {
      expect(mockHandler.handle).toHaveBeenCalled()
      done()
    })
  })

  it('returns cached response without calling handler when cache is present', (done) => {
    const cacheKey = 'asset_cache:fusion-assets/files/apps.json'
    sessionStorage.setItem(cacheKey, JSON.stringify({ version: 'cached-v1' }))
    const req = new HttpRequest('GET', 'http://localhost/fusion-assets/files/apps.json')
    service.intercept(req, mockHandler).subscribe(event => {
      if (event instanceof HttpResponse) {
        expect(event.body).toEqual({ version: 'cached-v1' })
        expect(mockHandler.handle).not.toHaveBeenCalled()
        done()
      }
    })
  })

  it('fetches from HTTP and caches response for cacheable URL', (done) => {
    const req = new HttpRequest('GET', 'http://localhost/fusion-assets/files/apps.json')
    service.intercept(req, mockHandler).subscribe(event => {
      if (event instanceof HttpResponse) {
        const cached = sessionStorage.getItem('asset_cache:fusion-assets/files/apps.json')
        expect(cached).toBe(JSON.stringify({ data: 'fresh' }))
        done()
      }
    })
  })

  it('caches i18n JSON files', (done) => {
    const req = new HttpRequest('GET', 'http://localhost/assets/i18n/en.json')
    service.intercept(req, mockHandler).subscribe(event => {
      if (event instanceof HttpResponse) {
        const cached = sessionStorage.getItem('asset_cache:assets/i18n/en.json')
        expect(cached).not.toBeNull()
        done()
      }
    })
  })

  describe('clearCache', () => {
    it('removes all asset_cache: prefixed keys', () => {
      sessionStorage.setItem('asset_cache:apps.json', '{}')
      sessionStorage.setItem('asset_cache:en.json', '{}')
      sessionStorage.setItem('other_key', 'preserve-me')
      AssetCacheInterceptorService.clearCache()
      expect(sessionStorage.getItem('asset_cache:apps.json')).toBeNull()
      expect(sessionStorage.getItem('asset_cache:en.json')).toBeNull()
      expect(sessionStorage.getItem('other_key')).toBe('preserve-me')
    })
  })
})
