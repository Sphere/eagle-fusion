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

  it('passes through GET request and returns response', done => {
    const req = new HttpRequest('GET', '/api/data')
    service.intercept(req, mockHandler).subscribe(event => {
      if (event instanceof HttpResponse) {
        expect(event.status).toBe(200)
        done()
      }
    })
  })

  it('skips retry for requests with excludeRetry=true in body', done => {
    const req = new HttpRequest('POST', '/api/data', { excludeRetry: true })
    service.intercept(req, mockHandler).subscribe(() => {
      expect(mockHandler.handle).toHaveBeenCalledTimes(1)
      done()
    })
  })

  it('calls handler once on first successful request', done => {
    const req = new HttpRequest('GET', '/api/endpoint')
    service.intercept(req, mockHandler).subscribe(() => {
      expect(mockHandler.handle).toHaveBeenCalledTimes(1)
      done()
    })
  })

  it('retries a 503 at most twice (0.5s, then 1.5s) and then gives the error to the caller', () => {
    jest.useFakeTimers()
    const { defer, throwError } = require('rxjs')
    const { HttpErrorResponse } = require('@angular/common/http')
    let attempts = 0
    mockHandler.handle = jest.fn().mockReturnValue(
      defer(() => {
        attempts++
        return throwError(() => new HttpErrorResponse({ status: 503 }))
      }),
    )
    const errors: any[] = []
    service.intercept(new HttpRequest('GET', '/api/data'), mockHandler).subscribe({
      error: (err: any) => errors.push(err),
    })
    expect(attempts).toBe(1)
    jest.advanceTimersByTime(499)
    expect(attempts).toBe(1)
    jest.advanceTimersByTime(1)
    expect(attempts).toBe(2)
    jest.advanceTimersByTime(1500)
    expect(attempts).toBe(3)
    jest.advanceTimersByTime(60000)
    expect(attempts).toBe(3)
    expect(errors.length).toBe(1)
    expect(errors[0].status).toBe(503)
    jest.useRealTimers()
  })

  it('does not retry a plain 500', () => {
    const { defer, throwError } = require('rxjs')
    const { HttpErrorResponse } = require('@angular/common/http')
    let attempts = 0
    mockHandler.handle = jest.fn().mockReturnValue(
      defer(() => {
        attempts++
        return throwError(() => new HttpErrorResponse({ status: 500 }))
      }),
    )
    const errors: any[] = []
    service.intercept(new HttpRequest('GET', '/api/data'), mockHandler).subscribe({
      error: (err: any) => errors.push(err),
    })
    expect(attempts).toBe(1)
    expect(errors[0].status).toBe(500)
  })

  it('should throw error for 4xx without retrying', done => {
    const { throwError } = require('rxjs')
    const { HttpErrorResponse } = require('@angular/common/http')
    mockHandler.handle = jest.fn().mockReturnValue(throwError(new HttpErrorResponse({ status: 400 })))
    const req = new HttpRequest('GET', '/api/data')
    service.intercept(req, mockHandler).subscribe({
      next: () => {},
      error: (err: any) => {
        expect(err.status).toBe(400)
        done()
      },
    })
  })
})
