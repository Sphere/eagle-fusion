import { of } from 'rxjs'
import { ApiService } from './api.service'
import { AUTHORING_BASE } from './../../../constants/apiEndpoints'

describe('ApiService', () => {
  let service: ApiService
  let http: any

  beforeEach(() => {
    http = {
      get: jest.fn(() => of({})),
      post: jest.fn(() => of({})),
      put: jest.fn(() => of({})),
      patch: jest.fn(() => of({})),
      delete: jest.fn(() => of({})),
    }
    service = new ApiService(http)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('base64', () => {
    it('should return encoded data when url starts with AUTHORING_BASE', () => {
      const result = service.base64(`${AUTHORING_BASE}content/create`, { foo: 'bar' })
      expect(result).toHaveProperty('data')
      expect(typeof result.data).toBe('string')
    })

    it('should return body unchanged when url does not start with AUTHORING_BASE', () => {
      const body = { foo: 'bar' }
      const result = service.base64('/apis/public/v8/content', body)
      expect(result).toBe(body)
    })
  })

  describe('get', () => {
    it('should call http.get with url and options', () => {
      service.get('url1', { headers: {} }).subscribe()
      expect(http.get).toHaveBeenCalledWith('url1', { headers: {} })
    })

    it('should call http.get with undefined options when not provided', () => {
      service.get('url1').subscribe()
      expect(http.get).toHaveBeenCalledWith('url1', undefined)
    })
  })

  describe('post', () => {
    it('should call http.post with encoded body by default', () => {
      const spy = jest.spyOn(service, 'base64')
      service.post('url1', { a: 1 }).subscribe()
      expect(spy).toHaveBeenCalledWith('url1', { a: 1 })
      expect(http.post).toHaveBeenCalled()
    })

    it('should call http.post with raw body when doEncoding is false', () => {
      const body = { a: 1 }
      service.post('url1', body, false).subscribe()
      expect(http.post).toHaveBeenCalledWith('url1', body, undefined)
    })

    it('should pass options to http.post', () => {
      const body = { a: 1 }
      service.post('url1', body, false, { headers: {} }).subscribe()
      expect(http.post).toHaveBeenCalledWith('url1', body, { headers: {} })
    })
  })

  describe('put', () => {
    it('should call http.put with encoded body', () => {
      const body = { a: 1 }
      service.put('url1', body).subscribe()
      expect(http.put).toHaveBeenCalledWith('url1', body, undefined)
    })

    it('should pass options to http.put', () => {
      const body = { a: 1 }
      service.put('url1', body, { headers: {} }).subscribe()
      expect(http.put).toHaveBeenCalledWith('url1', body, { headers: {} })
    })
  })

  describe('patch', () => {
    it('should call http.patch with encoded body', () => {
      const body = { a: 1 }
      service.patch('url1', body).subscribe()
      expect(http.patch).toHaveBeenCalledWith('url1', body, undefined)
    })

    it('should pass options to http.patch', () => {
      const body = { a: 1 }
      service.patch('url1', body, { headers: {} }).subscribe()
      expect(http.patch).toHaveBeenCalledWith('url1', body, { headers: {} })
    })
  })

  describe('delete', () => {
    it('should call http.delete with url and options', () => {
      service.delete('url1', { headers: {} }).subscribe()
      expect(http.delete).toHaveBeenCalledWith('url1', { headers: {} })
    })

    it('should call http.delete with undefined options when not provided', () => {
      service.delete('url1').subscribe()
      expect(http.delete).toHaveBeenCalledWith('url1', undefined)
    })
  })
})
