import { SafeResourceUrlService } from './safe-resource-url.service'

describe('SafeResourceUrlService', () => {
  let service: SafeResourceUrlService
  let mockSanitizer: any

  beforeEach(() => {
    mockSanitizer = {
      bypassSecurityTrustResourceUrl: jest.fn().mockImplementation((url: string) => ({ safe: url })),
      bypassSecurityTrustUrl: jest.fn().mockImplementation((url: string) => ({ safeUrl: url })),
      bypassSecurityTrustStyle: jest.fn().mockImplementation((value: string) => ({ safeStyle: value })),
      bypassSecurityTrustScript: jest.fn().mockImplementation((value: string) => ({ safeScript: value })),
      bypassSecurityTrustHtml: jest.fn().mockImplementation((value: string) => ({ safeHtml: value })),
    }
    service = new SafeResourceUrlService(mockSanitizer)
  })

  describe('trust', () => {
    it('should trust an https url', () => {
      const result = service.trust('https://example.com/embed')
      expect(mockSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('https://example.com/embed')
      expect(result).toEqual({ safe: 'https://example.com/embed' })
    })

    it('should trust an http url', () => {
      service.trust('http://example.com/embed')
      expect(mockSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('http://example.com/embed')
    })

    it('should trust a relative asset path', () => {
      service.trust('fusion-assets/icons/pin.svg')
      expect(mockSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('fusion-assets/icons/pin.svg')
    })

    it('should block a javascript: url', () => {
      const result = service.trust('javascript:alert(1)')
      expect(mockSanitizer.bypassSecurityTrustResourceUrl).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })

    it('should block a data: url', () => {
      const result = service.trust('data:text/html,<script>alert(1)</script>')
      expect(mockSanitizer.bypassSecurityTrustResourceUrl).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })

    it('should return null for empty/undefined/null input', () => {
      expect(service.trust('')).toBeNull()
      expect(service.trust(undefined)).toBeNull()
      expect(service.trust(null)).toBeNull()
      expect(mockSanitizer.bypassSecurityTrustResourceUrl).not.toHaveBeenCalled()
    })
  })

  describe('trustFromAllowlist', () => {
    const allowedHosts = ['www.youtube.com', 'youtube.com']

    it('should trust an https url on the allowlist', () => {
      const result = service.trustFromAllowlist('https://youtube.com/embed/abc123', allowedHosts)
      expect(mockSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('https://youtube.com/embed/abc123')
      expect(result).toEqual({ safe: 'https://youtube.com/embed/abc123' })
    })

    it('should block an https url not on the allowlist', () => {
      const result = service.trustFromAllowlist('https://evil.example/embed', allowedHosts)
      expect(mockSanitizer.bypassSecurityTrustResourceUrl).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })

    it('should block a non-https url even on an allowed host', () => {
      const result = service.trustFromAllowlist('http://youtube.com/embed/abc123', allowedHosts)
      expect(mockSanitizer.bypassSecurityTrustResourceUrl).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })

    it('should return null for empty/undefined/null input', () => {
      expect(service.trustFromAllowlist('', allowedHosts)).toBeNull()
      expect(service.trustFromAllowlist(undefined, allowedHosts)).toBeNull()
      expect(service.trustFromAllowlist(null, allowedHosts)).toBeNull()
    })

    it('should return null for a malformed url', () => {
      expect(service.trustFromAllowlist('::not a url::', allowedHosts)).toBeNull()
    })
  })

  describe('trustUrl', () => {
    it('should trust an https url', () => {
      const result = service.trustUrl('https://example.com/page')
      expect(mockSanitizer.bypassSecurityTrustUrl).toHaveBeenCalledWith('https://example.com/page')
      expect(result).toEqual({ safeUrl: 'https://example.com/page' })
    })

    it('should block a javascript: url', () => {
      const result = service.trustUrl('javascript:alert(1)')
      expect(mockSanitizer.bypassSecurityTrustUrl).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })

    it('should return null for empty/undefined/null input', () => {
      expect(service.trustUrl('')).toBeNull()
      expect(service.trustUrl(undefined)).toBeNull()
      expect(service.trustUrl(null)).toBeNull()
    })
  })

  describe('trustStyle', () => {
    it('should trust a style value', () => {
      const result = service.trustStyle("url('https://example.com/banner.jpg')")
      expect(mockSanitizer.bypassSecurityTrustStyle).toHaveBeenCalledWith("url('https://example.com/banner.jpg')")
      expect(result).toEqual({ safeStyle: "url('https://example.com/banner.jpg')" })
    })

    it('should return null for empty/undefined/null input', () => {
      expect(service.trustStyle('')).toBeNull()
      expect(service.trustStyle(undefined)).toBeNull()
      expect(service.trustStyle(null)).toBeNull()
      expect(mockSanitizer.bypassSecurityTrustStyle).not.toHaveBeenCalled()
    })
  })

  describe('trustScript', () => {
    it('should trust a script value', () => {
      const result = service.trustScript('console.log(1)')
      expect(mockSanitizer.bypassSecurityTrustScript).toHaveBeenCalledWith('console.log(1)')
      expect(result).toEqual({ safeScript: 'console.log(1)' })
    })

    it('should return null for empty/undefined/null input', () => {
      expect(service.trustScript('')).toBeNull()
      expect(service.trustScript(undefined)).toBeNull()
      expect(service.trustScript(null)).toBeNull()
      expect(mockSanitizer.bypassSecurityTrustScript).not.toHaveBeenCalled()
    })
  })

  describe('trustHtml', () => {
    it('should trust an html value', () => {
      const result = service.trustHtml('<p>hello</p>')
      expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('<p>hello</p>')
      expect(result).toEqual({ safeHtml: '<p>hello</p>' })
    })

    it('should return null for empty/undefined/null input', () => {
      expect(service.trustHtml('')).toBeNull()
      expect(service.trustHtml(undefined)).toBeNull()
      expect(service.trustHtml(null)).toBeNull()
      expect(mockSanitizer.bypassSecurityTrustHtml).not.toHaveBeenCalled()
    })
  })
})
