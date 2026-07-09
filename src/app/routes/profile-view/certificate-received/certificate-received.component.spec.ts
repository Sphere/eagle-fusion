jest.mock('../../../../../library/ws-widget/utils/src/public-api', () => ({
  LoggerService: class {
    log = jest.fn()
    error = jest.fn()
  },
}))

import { CertificateReceivedComponent } from './certificate-received.component'

describe('CertificateReceivedComponent', () => {
  let component: CertificateReceivedComponent
  let mockLogger: any

  beforeEach(() => {
    mockLogger = { log: jest.fn(), error: jest.fn() }
    component = new CertificateReceivedComponent(mockLogger)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should complete ngOnInit without error', () => {
    expect(() => component.ngOnInit()).not.toThrow()
  })

  it('should not throw when rcCerticate is falsy', () => {
    expect(() => component.convertToJpeg({
      rcCerticate: false, printUri: '', name: 'Test Certificate',
    })).not.toThrow()
  })

  it('should call fetch when rcCerticate is truthy', () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(new Blob()) })
    ;(window as any).fetch = fetchMock
    component.convertToJpeg({ rcCerticate: true, downloadUrl: 'https://example.com/cert.jpg', name: 'My Certificate' })
    expect(fetchMock).toHaveBeenCalledWith('https://example.com/cert.jpg')
    delete (window as any).fetch
  })

  it('should handle fetch response with ok === false', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: false, blob: () => Promise.resolve(new Blob()) })
    ;(window as any).fetch = fetchMock
    component.convertToJpeg({ rcCerticate: true, downloadUrl: 'https://example.com/cert.jpg', name: 'Test' })
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(mockLogger.error).toHaveBeenCalledWith('Image download failed:', expect.any(Error))
    delete (window as any).fetch
  })

  it('should log error when fetch rejects', async () => {
    ;(window as any).fetch = jest.fn().mockRejectedValue(new Error('Network error'))
    component.convertToJpeg({ rcCerticate: true, downloadUrl: 'https://example.com/cert.jpg', name: 'Test' })
    await Promise.resolve()
    delete (window as any).fetch
  })

  it('should accept certificateData input', () => {
    component.certificateData = { id: '123', name: 'My Certificate' }
    expect(component.certificateData.id).toBe('123')
  })

  describe('convertToJpeg else branch (printUri path)', () => {
    let OriginalImage: any
    let assignedSrc: string

    beforeEach(() => {
      assignedSrc = ''
      OriginalImage = (global as any).Image
      const MockImage = function (this: any) {
        this.onload = null
        Object.defineProperty(this, 'src', {
          set(v: string) { assignedSrc = v },
          get() { return assignedSrc },
        })
      } as any
      ;(global as any).Image = MockImage
    })

    afterEach(() => {
      ;(global as any).Image = OriginalImage
    })

    it('should create an Image and set its src to printUri', () => {
      component.convertToJpeg({ rcCerticate: false, printUri: 'https://example.com/cert.png', name: 'Test Cert' })
      expect(assignedSrc).toBe('https://example.com/cert.png')
    })

    it('should not call fetch for the else branch', () => {
      const fetchMock = jest.fn()
      ;(window as any).fetch = fetchMock
      component.convertToJpeg({ rcCerticate: false, printUri: 'https://example.com/img.png', name: 'Cert' })
      expect(fetchMock).not.toHaveBeenCalled()
      delete (window as any).fetch
    })

    it('triggers img.onload callback and processes image via canvas', () => {
      const mockCtx = { drawImage: jest.fn() }
      const mockCanvas = {
        getContext: jest.fn().mockReturnValue(mockCtx),
        toDataURL: jest.fn().mockReturnValue('data:image/jpeg;base64,dGVzdA=='),
        width: 0,
        height: 0,
      }
      const getElemSpy = jest.spyOn(document, 'getElementById').mockReturnValue(mockCanvas as any)
      const FileSaver = require('file-saver')
      const saveAsSpy = jest.spyOn(FileSaver, 'saveAs').mockImplementation(jest.fn())

      ;(global as any).Image = function (this: any) {
        this.onload = null
        this.width = 500
        this.height = 400
        Object.defineProperty(this, 'src', {
          set(v: string) { if (this.onload) { this.onload() } },
          get() { return '' },
        })
      }

      component.convertToJpeg({ rcCerticate: false, printUri: 'https://example.com/cert.png', name: 'Test Cert' })
      expect(saveAsSpy).toHaveBeenCalled()

      getElemSpy.mockRestore()
      saveAsSpy.mockRestore()
    })

    it('should use actual image dimensions when width >= 1000 and height >= 600', () => {
      const mockCtx = { drawImage: jest.fn() }
      const mockCanvas = {
        getContext: jest.fn().mockReturnValue(mockCtx),
        toDataURL: jest.fn().mockReturnValue('data:image/jpeg;base64,dGVzdA=='),
        width: 0,
        height: 0,
      }
      const getElemSpy = jest.spyOn(document, 'getElementById').mockReturnValue(mockCanvas as any)
      const FileSaver = require('file-saver')
      const saveAsSpy = jest.spyOn(FileSaver, 'saveAs').mockImplementation(jest.fn())

      ;(global as any).Image = function (this: any) {
        this.onload = null
        this.width = 1200
        this.height = 800
        Object.defineProperty(this, 'src', {
          set(v: string) { if (this.onload) { this.onload() } },
          get() { return '' },
        })
      }

      component.convertToJpeg({ rcCerticate: false, printUri: 'https://example.com/cert.png', name: 'LargeCert' })
      expect(mockCanvas.width).toBe(1200)
      expect(mockCanvas.height).toBe(800)
      expect(saveAsSpy).toHaveBeenCalled()

      getElemSpy.mockRestore()
      saveAsSpy.mockRestore()
    })

    it('should handle canvas with minimal context methods', () => {
      const mockCtx = { drawImage: jest.fn() }
      const mockCanvas = {
        getContext: jest.fn().mockReturnValue(mockCtx),
        toDataURL: jest.fn().mockReturnValue('data:image/jpeg;base64,dGVzdA=='),
        width: 0,
        height: 0,
      }
      const getElemSpy = jest.spyOn(document, 'getElementById').mockReturnValue(mockCanvas as any)
      const FileSaver = require('file-saver')
      const saveAsSpy = jest.spyOn(FileSaver, 'saveAs').mockImplementation(jest.fn())

      ;(global as any).Image = function (this: any) {
        this.onload = null
        this.width = 800
        this.height = 600
        Object.defineProperty(this, 'src', {
          set(v: string) { if (this.onload) { this.onload() } },
          get() { return '' },
        })
      }

      component.convertToJpeg({ rcCerticate: false, printUri: 'https://example.com/cert.png', name: 'Test' })
      expect(saveAsSpy).toHaveBeenCalled()

      getElemSpy.mockRestore()
      saveAsSpy.mockRestore()
    })
  })
})
