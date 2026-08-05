import { of, throwError } from 'rxjs'
import { ErrorResolverService } from './error-resolver.service'

describe('ErrorResolverService', () => {
  let service: ErrorResolverService
  let mockHttp: any

  beforeEach(() => {
    mockHttp = { get: jest.fn().mockReturnValue(of({ errorType: 'notFound' })) }
    service = new ErrorResolverService(mockHttp)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('getErrorConfig', () => {
    it('should resolve with the config at the given path', async () => {
      await expect(service.getErrorConfig('/errors/404.json')).resolves.toEqual({ errorType: 'notFound' })
      expect(mockHttp.get).toHaveBeenCalledWith('/errors/404.json')
    })

    it('should reject when the request fails', async () => {
      mockHttp.get.mockReturnValue(throwError(() => new Error('missing')))
      await expect(service.getErrorConfig('/errors/404.json')).rejects.toThrow('missing')
    })
  })
})
