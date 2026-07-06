import { VideoPopupComponent } from './how-does-it-works-popup.component'

describe('VideoPopupComponent', () => {
  let component: VideoPopupComponent
  let mockDialogRef: any
  let mockData: any
  let mockSanitizer: any

  beforeEach(() => {
    mockDialogRef = { close: jest.fn() }
    mockData = { url: 'https://youtube.com/embed/abc123' }
    mockSanitizer = {
      bypassSecurityTrustResourceUrl: jest.fn().mockImplementation((url: string) => ({ trustedUrl: url })),
    }
    component = new VideoPopupComponent(mockDialogRef, mockData, mockSanitizer)
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
    expect(mockSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(
      'https://youtube.com/embed/abc123?autoplay=1',
    )
    expect(component.autoplayUrl).toEqual({ trustedUrl: 'https://youtube.com/embed/abc123?autoplay=1' })
  })

  it('should use changingThisBreaksApplicationSecurity when url is a SafeResourceUrl object', () => {
    component['data'] = { url: { changingThisBreaksApplicationSecurity: 'https://trusted.url/embed/xyz' } }
    component.ngOnInit()
    expect(mockSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(
      'https://trusted.url/embed/xyz?autoplay=1',
    )
  })

  it('should use empty string when data has no url', () => {
    component['data'] = {}
    component.ngOnInit()
    expect(mockSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('?autoplay=1')
  })

  it('should call dialogRef.close on close()', () => {
    component.close()
    expect(mockDialogRef.close).toHaveBeenCalled()
  })
})
