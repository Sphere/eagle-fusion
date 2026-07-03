jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class {
    userProfile = null
    userPreference = null
    activeOrg = null
    rootOrg = null
    hostPath = 'https://sphere.aastrika.org'
  },
  LoggerService: class {
    log = jest.fn()
    warn = jest.fn()
    error = jest.fn()
  },
}))

import { of } from 'rxjs'
import { HttpRequest, HttpResponse } from '@angular/common/http'
import { AppInterceptorService } from './app-interceptor.service'
import { ConfigurationsService } from '@ws-widget/utils'

describe('AppInterceptorService', () => {
  let service: AppInterceptorService
  let mockHandler: any
  let mockConfigSvc: any
  let mockLogger: any

  beforeEach(() => {
    mockConfigSvc = new ConfigurationsService()
    mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    mockHandler = {
      handle: jest.fn().mockReturnValue(of(new HttpResponse({ status: 200, body: {} }))),
    }
    service = new AppInterceptorService(mockConfigSvc, mockLogger, 'en-US')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('passes through S3 external URLs without adding headers', done => {
    const req = new HttpRequest('GET', 'https://sunbirdcontent.s3-ap-south-1.amazonaws.com/img.png')
    service.intercept(req, mockHandler).subscribe(() => {
      expect(mockHandler.handle).toHaveBeenCalledWith(req)
      done()
    })
  })

  it('passes through static CDN URLs', done => {
    const req = new HttpRequest('GET', 'https://static.example.com/asset.js')
    service.intercept(req, mockHandler).subscribe(() => {
      expect(mockHandler.handle).toHaveBeenCalledWith(req)
      done()
    })
  })

  it('passes through when userProfile is null', done => {
    mockConfigSvc.userProfile = null
    const req = new HttpRequest('GET', '/apis/data')
    service.intercept(req, mockHandler).subscribe(() => {
      expect(mockHandler.handle).toHaveBeenCalled()
      done()
    })
  })

  it('passes through SCORM content state read endpoint', done => {
    mockConfigSvc.userProfile = { userId: 'u-1' }
    const req = new HttpRequest('GET', '/api/course/v1/content/state/read')
    service.intercept(req, mockHandler).subscribe(() => {
      expect(mockHandler.handle).toHaveBeenCalled()
      done()
    })
  })

  it('adds org and rootOrg headers when both are set and user is logged in', done => {
    mockConfigSvc.userProfile = { userId: 'u-1' }
    mockConfigSvc.activeOrg = 'test-org'
    mockConfigSvc.rootOrg = 'root-org'
    const req = new HttpRequest('GET', '/apis/protected/v8/data')
    service.intercept(req, mockHandler).subscribe(() => {
      const modifiedReq = mockHandler.handle.mock.calls[0][0] as HttpRequest<any>
      expect(modifiedReq.headers.get('org')).toBe('test-org')
      expect(modifiedReq.headers.get('rootOrg')).toBe('root-org')
      done()
    })
  })

  it('passes through when user is logged in but no activeOrg/rootOrg', done => {
    mockConfigSvc.userProfile = { userId: 'u-1' }
    mockConfigSvc.activeOrg = null
    mockConfigSvc.rootOrg = null
    const req = new HttpRequest('GET', '/apis/data')
    service.intercept(req, mockHandler).subscribe(() => {
      expect(mockHandler.handle).toHaveBeenCalled()
      done()
    })
  })

  it('adds Accept headers for .json requests when logged in', done => {
    mockConfigSvc.userProfile = { userId: 'u-1' }
    mockConfigSvc.activeOrg = null
    const req = new HttpRequest('GET', '/api/config.json')
    service.intercept(req, mockHandler).subscribe(() => {
      const modifiedReq = mockHandler.handle.mock.calls[0][0] as HttpRequest<any>
      expect(modifiedReq.headers.get('Accept')).toContain('application/json')
      done()
    })
  })

  it('includes userPreference selectedLangGroup when set', done => {
    mockConfigSvc.userProfile = { userId: 'u-1' }
    mockConfigSvc.activeOrg = 'org-1'
    mockConfigSvc.rootOrg = 'root-1'
    mockConfigSvc.userPreference = { selectedLangGroup: 'hi,en' }
    const req = new HttpRequest('GET', '/apis/data')
    service.intercept(req, mockHandler).subscribe(() => {
      expect(mockHandler.handle).toHaveBeenCalled()
      done()
    })
  })

  it('catchError in unauthenticated path propagates non-419 errors', done => {
    const { throwError: rxThrow } = require('rxjs')
    const { HttpErrorResponse } = require('@angular/common/http')
    // userProfile null → enters the public/unauthenticated catchError block
    mockConfigSvc.userProfile = null
    mockHandler.handle = jest.fn().mockReturnValue(rxThrow(new HttpErrorResponse({ status: 500 })))
    const req = new HttpRequest('GET', '/apis/public/data')
    service.intercept(req, mockHandler).subscribe({
      next: () => {},
      error: (err: any) => { expect(err.status).toBe(500); done() },
    })
  })

  it('propagates 419 error in authenticated path', done => {
    const { throwError: rxThrow } = require('rxjs')
    const { HttpErrorResponse } = require('@angular/common/http')
    mockConfigSvc.userProfile = { userId: 'u-1' }
    mockConfigSvc.activeOrg = 'org-1'
    mockConfigSvc.rootOrg = 'root-1'
    mockHandler.handle = jest.fn().mockReturnValue(rxThrow(new HttpErrorResponse({ status: 419 })))
    const req = new HttpRequest('GET', '/apis/protected/data')
    service.intercept(req, mockHandler).subscribe({
      next: () => {},
      error: (err: any) => {
        expect(err.status).toBe(419)
        done()
      },
    })
  })

  it('propagates non-419 error in authenticated path', done => {
    const { throwError: rxThrow } = require('rxjs')
    const { HttpErrorResponse } = require('@angular/common/http')
    mockConfigSvc.userProfile = { userId: 'u-1' }
    mockConfigSvc.activeOrg = 'org-1'
    mockConfigSvc.rootOrg = 'root-1'
    mockHandler.handle = jest.fn().mockReturnValue(rxThrow(new HttpErrorResponse({ status: 500 })))
    const req = new HttpRequest('GET', '/apis/data')
    service.intercept(req, mockHandler).subscribe({
      next: () => {},
      error: (err: any) => {
        expect(err.status).toBe(500)
        done()
      },
    })
  })
})
