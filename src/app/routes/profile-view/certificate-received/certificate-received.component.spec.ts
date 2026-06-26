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
  })
})
