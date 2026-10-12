import { VideoPopupComponent } from './how-does-it-works-popup.component'

describe('VideoPopupComponent', () => {
  let component: VideoPopupComponent
  let mockDialogRef: any
  let mockData: any
  let mockSafeResourceUrlSvc: any

  beforeEach(() => {
    mockDialogRef = { close: jest.fn() }
    mockData = { url: 'https://youtube.com/embed/abc123' }
    mockSafeResourceUrlSvc = {
      trustFromAllowlist: jest.fn().mockImplementation((url: string, hosts: string[]) => {
        try {
          const { hostname, protocol } = new URL(url)
          return protocol === 'https:' && hosts.includes(hostname) ? { trustedUrl: url } : null
        } catch {
          return null
        }
      }),
    }
    component = new VideoPopupComponent(mockDialogRef, mockData, mockSafeResourceUrlSvc)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default autoplayUrl to null', () => {
    expect(component.autoplayUrl).toBeNull()
  })

  it('should default isOpen to false', () => {
    expect(component.isOpen).toBe(false)
  })

  it('should set autoplayUrl with ?autoplay=1 appended on ngOnInit', () => {
    component.ngOnInit()
    expect(mockSafeResourceUrlSvc.trustFromAllowlist).toHaveBeenCalledWith(
      'https://youtube.com/embed/abc123?autoplay=1',
      expect.any(Array),
    )
    expect(component.autoplayUrl).toEqual({ trustedUrl: 'https://youtube.com/embed/abc123?autoplay=1' })
  })

  it('should use changingThisBreaksApplicationSecurity when url is an allow-listed SafeResourceUrl object', () => {
    component['data'] = { url: { changingThisBreaksApplicationSecurity: 'https://youtube.com/embed/xyz' } }
    component.ngOnInit()
    expect(mockSafeResourceUrlSvc.trustFromAllowlist).toHaveBeenCalledWith(
      'https://youtube.com/embed/xyz?autoplay=1',
      expect.any(Array),
    )
  })

  it('should block a SafeResourceUrl object pointing at a non-allow-listed host', () => {
    component['data'] = { url: { changingThisBreaksApplicationSecurity: 'https://trusted.url/embed/xyz' } }
    component.ngOnInit()
    expect(component.autoplayUrl).toBeNull()
  })

  it('should not call the sanitizer when data has no url', () => {
    component['data'] = {}
    component.ngOnInit()
    expect(mockSafeResourceUrlSvc.trustFromAllowlist).not.toHaveBeenCalled()
    expect(component.autoplayUrl).toBeNull()
  })

  it('should call dialogRef.close on close()', () => {
    component.close()
    expect(mockDialogRef.close).toHaveBeenCalled()
  })
})
