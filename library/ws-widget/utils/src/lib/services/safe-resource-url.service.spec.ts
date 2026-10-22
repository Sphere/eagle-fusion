import { SecurityContext } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { DomSanitizer } from '@angular/platform-browser'
import { SafeResourceUrlService } from './safe-resource-url.service'

describe('SafeResourceUrlService', () => {
  let service: SafeResourceUrlService
  let mockSanitizer: any

  beforeEach(() => {
    mockSanitizer = {
      bypassSecurityTrustResourceUrl: jest.fn().mockImplementation((url: string) => ({ safe: url })),
      bypassSecurityTrustUrl: jest.fn(),
      bypassSecurityTrustStyle: jest.fn(),
      bypassSecurityTrustHtml: jest.fn(),
      sanitize: jest.fn().mockImplementation((_ctx: SecurityContext, value: string) => value.replace(/<script.*?<\/script>/g, '')),
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

    it('should trust a base64-encoded raster data:image url (e.g. a generated certificate image)', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA'
      const result = service.trust(dataUrl)
      expect(mockSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(dataUrl)
      expect(result).toEqual({ safe: dataUrl })
    })

    it('should block a data:image/svg+xml url (SVG can embed <script>)', () => {
      const result = service.trust('data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+')
      expect(mockSanitizer.bypassSecurityTrustResourceUrl).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })

    it('should block a non-base64 data:image url even with a safe-looking MIME type', () => {
      const result = service.trust('data:image/png,<script>alert(1)</script>')
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

  describe('sanitizeUrl', () => {
    it('should pass an https url through Angular\'s URL sanitizer without bypassing it', () => {
      const result = service.sanitizeUrl('https://example.com/page')
      expect(mockSanitizer.sanitize).toHaveBeenCalledWith(SecurityContext.URL, 'https://example.com/page')
      expect(mockSanitizer.bypassSecurityTrustUrl).not.toHaveBeenCalled()
      expect(result).toBe('https://example.com/page')
    })

    it('should block a javascript: url', () => {
      const result = service.sanitizeUrl('javascript:alert(1)')
      expect(mockSanitizer.sanitize).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })

    it('should allow a base64-encoded certificate image data url', () => {
      const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD'
      const result = service.sanitizeUrl(dataUrl)
      expect(mockSanitizer.sanitize).toHaveBeenCalledWith(SecurityContext.URL, dataUrl)
      expect(result).toBe(dataUrl)
    })

    it('should block a data:image/svg+xml url', () => {
      const result = service.sanitizeUrl('data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+')
      expect(mockSanitizer.sanitize).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })

    it('should return null for empty/undefined/null input', () => {
      expect(service.sanitizeUrl('')).toBeNull()
      expect(service.sanitizeUrl(undefined)).toBeNull()
      expect(service.sanitizeUrl(null)).toBeNull()
    })
  })

  describe('sanitizeStyle', () => {
    it('should pass a style value through Angular\'s style sanitizer without bypassing it', () => {
      const result = service.sanitizeStyle("url('https://example.com/banner.jpg')")
      expect(mockSanitizer.sanitize).toHaveBeenCalledWith(SecurityContext.STYLE, "url('https://example.com/banner.jpg')")
      expect(mockSanitizer.bypassSecurityTrustStyle).not.toHaveBeenCalled()
      expect(result).toBe("url('https://example.com/banner.jpg')")
    })

    it('should return null for empty/undefined/null input', () => {
      expect(service.sanitizeStyle('')).toBeNull()
      expect(service.sanitizeStyle(undefined)).toBeNull()
      expect(service.sanitizeStyle(null)).toBeNull()
      expect(mockSanitizer.sanitize).not.toHaveBeenCalled()
    })
  })

  describe('sanitizeHtml', () => {
    it('should run the value through Angular\'s HTML sanitizer instead of bypassing it', () => {
      const result = service.sanitizeHtml('<p>hello</p><script>alert(1)</script>')
      expect(mockSanitizer.sanitize).toHaveBeenCalledWith(SecurityContext.HTML, '<p>hello</p><script>alert(1)</script>')
      expect(mockSanitizer.bypassSecurityTrustHtml).not.toHaveBeenCalled()
      expect(result).toBe('<p>hello</p>')
    })

    it('should return null for empty/undefined/null input', () => {
      expect(service.sanitizeHtml('')).toBeNull()
      expect(service.sanitizeHtml(undefined)).toBeNull()
      expect(service.sanitizeHtml(null)).toBeNull()
      expect(mockSanitizer.sanitize).not.toHaveBeenCalled()
    })
  })

  describe('sanitizeFitbHtml (real Angular sanitizer)', () => {
    let realService: SafeResourceUrlService
    let realSanitizer: DomSanitizer
    // Angular logs a dev-mode warning whenever it strips content; these tests strip on purpose.
    let warnSpy: jest.SpyInstance

    beforeEach(() => {
      warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
      realSanitizer = TestBed.inject(DomSanitizer)
      realService = new SafeResourceUrlService(realSanitizer)
    })

    afterEach(() => {
      warnSpy.mockRestore()
    })

    it('should never bypass sanitization', () => {
      const spy = jest.spyOn(realSanitizer, 'bypassSecurityTrustHtml')
      realService.sanitizeFitbHtml('<p>Q <input type="text" id="q0"></p>')
      expect(spy).not.toHaveBeenCalled()
    })

    it('should replace each blank with a placeholder and record its id in order', () => {
      const result = realService.sanitizeFitbHtml(
        '<p>The heart has <input matInput style="x" type="text" id="q10"> chambers and <input type="text" id="q11"> valves.</p>',
      )!
      expect(result.blankIds).toEqual(['q10', 'q11'])
      expect(result.html).not.toContain('<input')
      expect(result.html.startsWith('<p>The heart has ')).toBe(true)
      const indexes = result.html.split(new RegExp(result.placeholder.source, 'g')).filter((_, i) => i % 2 === 1)
      expect(indexes).toEqual(['0', '1'])
    })

    it('should strip script and event handlers from the author markup', () => {
      const result = realService.sanitizeFitbHtml('<p onclick="alert(1)">Q <img src="x" onerror="alert(1)"><script>alert(1)</script>'
        + '<input type="text" id="q0"></p>')!
      expect(result.html).not.toMatch(/<script|onclick|onerror/i)
      expect(result.blankIds).toEqual(['q0'])
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('sanitizing HTML stripped some content'))
    })

    it('should record an empty id for a blank without one', () => {
      expect(realService.sanitizeFitbHtml('<input/>')!.blankIds).toEqual([''])
    })

    it('should use a fresh placeholder per call so author text cannot forge one', () => {
      const first = realService.sanitizeFitbHtml('<input id="a">')!
      const second = realService.sanitizeFitbHtml('<input id="a">')!
      expect(first.placeholder.source).not.toBe(second.placeholder.source)
    })

    it('should return the sanitized markup unchanged when there are no blanks', () => {
      const result = realService.sanitizeFitbHtml('<p>No blanks <b>here</b></p>')!
      expect(result.html).toBe('<p>No blanks <b>here</b></p>')
      expect(result.blankIds).toEqual([])
    })

    it('should return null for empty input', () => {
      expect(realService.sanitizeFitbHtml('')).toBeNull()
      expect(realService.sanitizeFitbHtml(null)).toBeNull()
    })
  })

  describe('sanitizeImageSrc', () => {
    it('should allow a data:image/svg+xml certificate uri', () => {
      const uri = 'data:image/svg+xml,%3Csvg%3E%3C/svg%3E'
      expect(service.sanitizeImageSrc(uri)).toBe(uri)
      expect(mockSanitizer.sanitize).toHaveBeenCalledWith(SecurityContext.URL, uri)
      expect(mockSanitizer.bypassSecurityTrustUrl).not.toHaveBeenCalled()
    })

    it('should allow a blob: url minted for an image', () => {
      expect(service.sanitizeImageSrc('blob:http://localhost/abc')).toBe('blob:http://localhost/abc')
    })

    it('should allow an https image url', () => {
      expect(service.sanitizeImageSrc('https://cdn.example.com/cert.png')).toBe('https://cdn.example.com/cert.png')
    })

    it('should block a javascript: url', () => {
      expect(service.sanitizeImageSrc('javascript:alert(1)')).toBeNull()
      expect(mockSanitizer.sanitize).not.toHaveBeenCalled()
    })

    it('should block a data:text/html url', () => {
      expect(service.sanitizeImageSrc('data:text/html,<script>alert(1)</script>')).toBeNull()
    })

    it('should return null for empty/undefined/null input', () => {
      expect(service.sanitizeImageSrc('')).toBeNull()
      expect(service.sanitizeImageSrc(undefined)).toBeNull()
      expect(service.sanitizeImageSrc(null)).toBeNull()
    })
  })

  describe('toImageSource', () => {
    // setup-jest.ts defines URL.createObjectURL as a non-writable jest.fn(), so configure it in place.
    const createObjectURL = URL.createObjectURL as jest.Mock
    let sink: string[]

    beforeEach(() => {
      sink = []
      createObjectURL.mockReset()
      createObjectURL.mockReturnValue('blob:http://localhost/svg-1')
    })

    afterEach(() => {
      createObjectURL.mockReset()
    })

    it('should return an empty string for empty/undefined/null/blank input', () => {
      expect(service.toImageSource('', sink)).toBe('')
      expect(service.toImageSource(undefined, sink)).toBe('')
      expect(service.toImageSource(null, sink)).toBe('')
      expect(service.toImageSource('   ', sink)).toBe('')
      expect(sink).toEqual([])
    })

    it.each([
      'data:image/svg+xml,%3Csvg%3E',
      'blob:http://localhost/abc',
      'https://cdn.example.com/cert.svg',
      'http://cdn.example.com/cert.svg',
      '//cdn.example.com/cert.svg',
      '/assets/cert.svg',
    ])('should pass %s through unchanged', uri => {
      expect(service.toImageSource(uri, sink)).toBe(uri)
      expect(createObjectURL).not.toHaveBeenCalled()
    })

    it('should trim whitespace and a leading BOM', () => {
      expect(service.toImageSource('\uFEFF  https://cdn.example.com/c.svg  ', sink)).toBe('https://cdn.example.com/c.svg')
    })

    it('should wrap raw SVG markup in an object URL and record it in the sink', () => {
      const result = service.toImageSource('<svg xmlns="http://www.w3.org/2000/svg"></svg>', sink)
      expect(result).toBe('blob:http://localhost/svg-1')
      expect(sink).toEqual(['blob:http://localhost/svg-1'])
      const blob = createObjectURL.mock.calls[0][0] as Blob
      expect(blob.type).toBe('image/svg+xml')
    })

    it('should wrap markup that starts with an XML prolog', () => {
      expect(service.toImageSource('<?xml version="1.0"?><svg></svg>', sink)).toBe('blob:http://localhost/svg-1')
    })

    it('should decode percent-encoded markup before wrapping it', () => {
      expect(service.toImageSource('%3Csvg%3E%3C%2Fsvg%3E', sink)).toBe('blob:http://localhost/svg-1')
      expect(sink).toHaveLength(1)
    })

    it('should leave a malformed percent-encoded value as it is', () => {
      expect(service.toImageSource('%3C%E0%A4%A', sink)).toBe('%3C%E0%A4%A')
      expect(createObjectURL).not.toHaveBeenCalled()
    })

    it('should return any other value unchanged', () => {
      expect(service.toImageSource('cert.svg', sink)).toBe('cert.svg')
      expect(sink).toEqual([])
    })
  })
})
