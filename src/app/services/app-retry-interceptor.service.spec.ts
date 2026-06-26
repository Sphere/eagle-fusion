import { of } from 'rxjs'
import { HttpRequest, HttpResponse } from '@angular/common/http'
import { AppRetryInterceptorService } from './app-retry-interceptor.service'

describe('AppRetryInterceptorService', () => {
  let service: AppRetryInterceptorService
  let mockHandler: any

  beforeEach(() => {
    service = new AppRetryInterceptorService()
    mockHandler = {
      handle: jest.fn().mockReturnValue(of(new HttpResponse({ status: 200 }))),
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('passes through GET request and returns response', (done) => {
    const req = new HttpRequest('GET', '/api/data')
    service.intercept(req, mockHandler).subscribe(event => {
      if (event instanceof HttpResponse) {
        expect(event.status).toBe(200)
        done()
      }
    })
  })

  it('skips retry for requests with excludeRetry=true in body', (done) => {
    const req = new HttpRequest('POST', '/api/data', { excludeRetry: true })
    service.intercept(req, mockHandler).subscribe(() => {
      expect(mockHandler.handle).toHaveBeenCalledTimes(1)
      done()
    })
  })

  it('calls handler once on first successful request', (done) => {
    const req = new HttpRequest('GET', '/api/endpoint')
    service.intercept(req, mockHandler).subscribe(() => {
      expect(mockHandler.handle).toHaveBeenCalledTimes(1)
      done()
    })
  })
})
