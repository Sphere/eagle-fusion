import { of, throwError } from 'rxjs'
import { BtnFeatureService } from './btn-feature.service'

describe('BtnFeatureService', () => {
  let service: BtnFeatureService
  let mockHttp: any

  beforeEach(() => {
    mockHttp = { get: jest.fn().mockReturnValue(of(7)) }
    service = new BtnFeatureService(mockHttp)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('getBadgeCount', () => {
    it('should resolve with the count from the endpoint', async () => {
      await expect(service.getBadgeCount('/api/badges')).resolves.toBe(7)
      expect(mockHttp.get).toHaveBeenCalledWith('/api/badges')
    })

    it('should reject when the request fails', async () => {
      mockHttp.get.mockReturnValue(throwError(() => new Error('network')))
      await expect(service.getBadgeCount('/api/badges')).rejects.toThrow('network')
    })
  })
})
