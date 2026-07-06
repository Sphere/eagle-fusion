import { of } from 'rxjs'
import { ExternalUrlResolverService } from './external-url-resolver.service'

describe('ExternalUrlResolverService', () => {
  let service: ExternalUrlResolverService

  beforeEach(() => {
    service = new ExternalUrlResolverService()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('canActivate opens the external URL and returns false', done => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(jest.fn())
    const mockRoute = {
      paramMap: { get: jest.fn().mockReturnValue('https://example.com') },
    } as any
    service.canActivate(mockRoute).subscribe(result => {
      expect(openSpy).toHaveBeenCalledWith('https://example.com', '_self')
      expect(result).toBe(false)
      done()
    })
    openSpy.mockRestore()
  })

  it('canActivate returns an Observable', () => {
    jest.spyOn(window, 'open').mockImplementation(jest.fn())
    const mockRoute = {
      paramMap: { get: jest.fn().mockReturnValue('https://external.org') },
    } as any
    const result = service.canActivate(mockRoute)
    expect(result).toBeDefined()
    expect(typeof result.subscribe).toBe('function')
    jest.restoreAllMocks()
  })
})
