import { ViewerComponent } from './viewer.component'

describe('ViewerComponent', () => {
  let component: ViewerComponent
  let accessControlSvc: any
  let mockSafeResourceUrlSvc: any

  beforeEach(() => {
    accessControlSvc = {
      authoringConfig: { newDesign: false },
    }
    mockSafeResourceUrlSvc = { trust: jest.fn().mockImplementation(url => ({ trusted: url })) }
    component = new ViewerComponent(accessControlSvc, mockSafeResourceUrlSvc)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default selected to the desktop preview device', () => {
    expect(component.selected.value).toBe('desktop')
  })

  describe('ngOnChanges', () => {
    it('should set channel iframe url when newDesign is true and mimeTypeRoute is channel', () => {
      accessControlSvc.authoringConfig.newDesign = true
      component.identifier = 'id1'
      component.mimeTypeRoute = 'channel'
      component.ngOnChanges()
      expect(component.rawIframeUrl).toBe('author/viewer/channel/id1')
      expect(mockSafeResourceUrlSvc.trust).toHaveBeenCalledWith('author/viewer/channel/id1')
      expect(component.iframeUrl).toEqual({ trusted: 'author/viewer/channel/id1' })
    })

    it('should set toc overview iframe url when newDesign is true and mimeTypeRoute is not channel', () => {
      accessControlSvc.authoringConfig.newDesign = true
      component.identifier = 'id2'
      component.mimeTypeRoute = 'pdf'
      component.ngOnChanges()
      expect(component.rawIframeUrl).toBe('author/toc/id2/overview')
    })

    it('should set legacy viewer iframe url when newDesign is false', () => {
      accessControlSvc.authoringConfig.newDesign = false
      component.identifier = 'id3'
      component.mimeTypeRoute = 'video'
      component.ngOnChanges()
      expect(component.rawIframeUrl).toBe('/viewer/video/id3?preview=true')
    })
  })

  describe('ngAfterViewInit', () => {
    it('should build previewDevices with empty viewValues when viewChild refs are null', () => {
      component.mobile = null
      component.tab = null
      component.desktop = null
      component.ngAfterViewInit()
      expect(component.previewDevices[0].viewValue).toBe('')
      expect(component.previewDevices[1].viewValue).toBe('')
      expect(component.previewDevices[2].viewValue).toBe('Desktop')
      expect(component.selected).toBe(component.previewDevices[2])
    })

    it('should use native element values when viewChild refs are present', () => {
      component.mobile = { nativeElement: { value: 'mobileVal' } } as any
      component.tab = { nativeElement: { value: 'tabVal' } } as any
      component.desktop = { nativeElement: { value: 'desktopVal' } } as any
      component.ngAfterViewInit()
      expect(component.previewDevices[0].viewValue).toBe('mobileVal')
      expect(component.previewDevices[1].viewValue).toBe('tabVal')
      expect(component.previewDevices[2].viewValue).toBe('desktopVal')
    })

    it('should default desktop viewValue to Desktop when nativeElement value is empty', () => {
      component.desktop = { nativeElement: { value: '' } } as any
      component.mobile = null
      component.tab = null
      component.ngAfterViewInit()
      expect(component.previewDevices[2].viewValue).toBe('Desktop')
    })
  })
})
