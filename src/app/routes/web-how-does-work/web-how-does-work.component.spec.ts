jest.mock('@angular/core', () => {
  const actual = jest.requireActual('@angular/core')
  return { ...actual, effect: (fn: () => void) => { fn() } }
})

jest.mock('../../../../library/ws-widget/utils/src/public-api', () => ({
  ValueService: class {
    isMobile = jest.fn().mockReturnValue(false)
  },
}))

jest.mock('../how-does-it-works-popup/how-does-it-works-popup.component', () => ({
  VideoPopupComponent: class {},
}))

import { WebHowDoesWorkComponent } from './web-how-does-work.component'

describe('WebHowDoesWorkComponent', () => {
  let component: WebHowDoesWorkComponent
  let mockScrollService: any
  let mockElementRef: any
  let mockDialog: any
  let mockSafeResourceUrlSvc: any
  let mockValueSvc: any

  beforeEach(() => {
    mockScrollService = { scrollToDivEvent: { subscribe: jest.fn() } }
    mockElementRef = { nativeElement: { scrollIntoView: jest.fn() } }
    mockDialog = { open: jest.fn() }
    mockSafeResourceUrlSvc = {
      trustFromAllowlist: jest.fn().mockImplementation((url: string) => (url ? { safe: url } : null)),
    }
    mockValueSvc = { isMobile: jest.fn().mockReturnValue(false) }
    component = new WebHowDoesWorkComponent(
      mockScrollService,
      mockElementRef,
      mockDialog,
      mockSafeResourceUrlSvc,
      mockValueSvc,
    )
    component.config = {
      data: [
        { url: 'https://youtube.com/embed/abc123', title: 'Video 1' },
        { url: null, title: 'Video 2' },
      ],
    }
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default isXSmall$ to false', () => {
    expect(component.isXSmall$).toBe(false)
  })

  it('should set isXSmall$ true when isMobile returns true', () => {
    mockValueSvc.isMobile.mockReturnValue(true)
    component = new WebHowDoesWorkComponent(mockScrollService, mockElementRef, mockDialog, mockSafeResourceUrlSvc, mockValueSvc)
    expect(component.isXSmall$).toBe(true)
  })

  it('should populate videoData from config.data on ngOnInit', () => {
    component.ngOnInit()
    expect(component.videoData).toHaveLength(2)
  })

  it('should sanitize URL for elements with a string url', () => {
    component.ngOnInit()
    expect(mockSafeResourceUrlSvc.trustFromAllowlist).toHaveBeenCalledWith('https://youtube.com/embed/abc123', expect.any(Array))
  })

  it('should read from localStorage when config.data is missing', () => {
    const videoData = { data: [{ url: 'https://youtube.com/embed/xyz', title: 'Local Video' }] }
    localStorage.setItem('videoData', JSON.stringify(videoData))
    component.config = {}
    component.ngOnInit()
    expect(component.videoData).toHaveLength(1)
  })

  it('should subscribe to scroll events on ngOnInit', () => {
    component.ngOnInit()
    expect(mockScrollService.scrollToDivEvent.subscribe).toHaveBeenCalled()
  })

  it('should call scrollIntoView when scrollToHowSphereWorks event fires', () => {
    let scrollCallback: (id: string) => void = () => {}
    mockScrollService.scrollToDivEvent.subscribe = jest.fn(cb => { scrollCallback = cb })
    component.ngOnInit()
    scrollCallback('scrollToHowSphereWorks')
    expect(mockElementRef.nativeElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
  })

  it('should not call scrollIntoView for other scroll events', () => {
    let scrollCallback: (id: string) => void = () => {}
    mockScrollService.scrollToDivEvent.subscribe = jest.fn(cb => { scrollCallback = cb })
    component.ngOnInit()
    scrollCallback('someOtherEvent')
    expect(mockElementRef.nativeElement.scrollIntoView).not.toHaveBeenCalled()
  })

  describe('sanitizeUrl', () => {
    it('should return sanitized url for valid string', () => {
      const result = component.sanitizeUrl('https://youtube.com/embed/test')
      expect(mockSafeResourceUrlSvc.trustFromAllowlist).toHaveBeenCalledWith('https://youtube.com/embed/test', expect.any(Array))
      expect(result).toBeTruthy()
    })

    it('should return null for falsy url', () => {
      expect(component.sanitizeUrl()).toBeNull()
      expect(component.sanitizeUrl('')).toBeNull()
    })
  })

  describe('openVideoPopup', () => {
    it('should open dialog with video url', () => {
      component.openVideoPopup('https://youtube.com/embed/test')
      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ data: { url: 'https://youtube.com/embed/test' } }),
      )
    })
  })

  describe('getYoutubeThumbnail', () => {
    it('should extract video ID from embed URL', () => {
      const result = component.getYoutubeThumbnail('https://youtube.com/embed/abc12345678')
      expect(result).toBe('https://img.youtube.com/vi/abc12345678/hqdefault.jpg')
    })

    it('should return empty string for non-youtube URL', () => {
      expect(component.getYoutubeThumbnail('https://other.com/video')).toBe('')
    })

    it('should handle SafeResourceUrl object', () => {
      const safeUrl = { changingThisBreaksApplicationSecurity: 'https://youtube.com/embed/xyz11223344' }
      const result = component.getYoutubeThumbnail(safeUrl)
      expect(result).toBe('https://img.youtube.com/vi/xyz11223344/hqdefault.jpg')
    })
  })
})
