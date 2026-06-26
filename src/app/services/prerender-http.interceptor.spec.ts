import { of } from 'rxjs'
import { HttpRequest, HttpResponse } from '@angular/common/http'
import { PrerenderHttpInterceptor } from './prerender-http.interceptor'

describe('PrerenderHttpInterceptor (browser)', () => {
  let interceptor: PrerenderHttpInterceptor
  let mockHandler: any

  beforeEach(() => {
    interceptor = new PrerenderHttpInterceptor('browser')
    mockHandler = {
      handle: jest.fn().mockReturnValue(of(new HttpResponse({ status: 200 }))),
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(interceptor).toBeTruthy()
  })

  it('passes all requests through unchanged in browser mode', (done) => {
    const req = new HttpRequest('GET', '/apis/public/v8/data')
    interceptor.intercept(req, mockHandler).subscribe(() => {
      expect(mockHandler.handle).toHaveBeenCalledWith(req)
      done()
    })
  })

  it('passes non-public requests through in browser mode', (done) => {
    const req = new HttpRequest('GET', '/apis/protected/v8/data')
    interceptor.intercept(req, mockHandler).subscribe(() => {
      expect(mockHandler.handle).toHaveBeenCalledWith(req)
      done()
    })
  })
})

describe('PrerenderHttpInterceptor (SSR)', () => {
  let interceptor: PrerenderHttpInterceptor
  let mockHandler: any

  beforeEach(() => {
    interceptor = new PrerenderHttpInterceptor('server')
    mockHandler = {
      handle: jest.fn().mockReturnValue(of(new HttpResponse({ status: 200 }))),
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('rewrites public API URL with absolute base in SSR mode', (done) => {
    const req = new HttpRequest('GET', '/apis/public/v8/toc/content')
    interceptor.intercept(req, mockHandler).subscribe(() => {
      const calledReq = mockHandler.handle.mock.calls[0][0] as HttpRequest<any>
      expect(calledReq.url).toBe('https://sphere.aastrika.org/apis/public/v8/toc/content')
      done()
    })
  })

  it('returns empty 200 response for non-public URLs in SSR mode', (done) => {
    const req = new HttpRequest('GET', '/apis/protected/v8/data')
    interceptor.intercept(req, mockHandler).subscribe((event: any) => {
      expect(mockHandler.handle).not.toHaveBeenCalled()
      expect(event.status).toBe(200)
      expect(event.body).toBeNull()
      done()
    })
  })

  it('returns empty 200 response for relative asset paths in SSR mode', (done) => {
    const req = new HttpRequest('GET', '/fusion-assets/files/apps.json')
    interceptor.intercept(req, mockHandler).subscribe((event: any) => {
      expect(mockHandler.handle).not.toHaveBeenCalled()
      expect(event.status).toBe(200)
      done()
    })
  })

  it('preserves the original URL in the empty response for SSR non-public requests', (done) => {
    const req = new HttpRequest('GET', '/some/other/path')
    interceptor.intercept(req, mockHandler).subscribe((event: any) => {
      expect(event.url).toBe('/some/other/path')
      done()
    })
  })
})
