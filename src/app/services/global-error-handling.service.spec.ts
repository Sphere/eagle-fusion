import { GlobalErrorHandlingService } from './global-error-handling.service'

describe('GlobalErrorHandlingService', () => {
  let service: GlobalErrorHandlingService

  beforeEach(() => {
    sessionStorage.clear()
    service = new GlobalErrorHandlingService()
  })

  afterEach(() => {
    sessionStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('handleError', () => {
    it('reloads on ChunkLoadError when no prior reload attempt', () => {
      const reloadSpy = jest.fn()
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { ...window.location, reload: reloadSpy, href: '/' },
      })
      service.handleError({ message: 'ChunkLoadError: something failed' })
      expect(sessionStorage.getItem('chunk_reload_attempted')).toBe('1')
    })

    it('redirects to "/" on ChunkLoadError when already attempted reload', () => {
      sessionStorage.setItem('chunk_reload_attempted', '1')
      const reloadSpy = jest.fn()
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { ...window.location, reload: reloadSpy, href: '/current-path' },
      })
      service.handleError({ message: 'ChunkLoadError: something failed' })
      expect(sessionStorage.getItem('chunk_reload_attempted')).toBeNull()
    })

    it('silently ignores NG0100 DiscussAllComponent error', () => {
      expect(() =>
        service.handleError({ message: 'NG0100: ExpressionChangedAfterItHasBeenChecked in DiscussAllComponent' })
      ).not.toThrow()
    })

    it('re-throws non-ChunkLoad, non-NG0100 errors', () => {
      expect(() =>
        service.handleError(new Error('Some unexpected error'))
      ).toThrow('Some unexpected error')
    })

    it('handles error with no message property', () => {
      expect(() =>
        service.handleError({})
      ).toThrow()
    })
  })
})
