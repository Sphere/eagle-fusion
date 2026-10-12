import { BtnFacebookShareComponent } from './btn-facebook-share.component'

describe('BtnFacebookShareComponent', () => {
  let component: BtnFacebookShareComponent
  let mockSafeResourceUrlSvc: any
  let mockConfigSvc: any

  beforeEach(() => {
    mockSafeResourceUrlSvc = {
      trust: jest.fn().mockImplementation((url: string) => ({ safe: url })),
    }
    mockConfigSvc = { restrictedFeatures: null }
    component = new BtnFacebookShareComponent(mockSafeResourceUrlSvc, mockConfigSvc)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should enable facebook share when feature is not restricted', () => {
    mockConfigSvc.restrictedFeatures = { has: jest.fn().mockReturnValue(false) }
    component.ngOnInit()
    expect(component.isSocialMediaFacebookShareEnabled).toBe(true)
  })

  it('should disable facebook share when feature is restricted', () => {
    mockConfigSvc.restrictedFeatures = { has: jest.fn().mockReturnValue(true) }
    component.ngOnInit()
    expect(component.isSocialMediaFacebookShareEnabled).toBe(false)
  })

  it('should URL-encode the shared url before building the sanitized fb share url', () => {
    component.url = 'https://example.com/course?ref=home&x=1'
    const result: any = component.sanitizeFbUrl
    const expectedUrl = `https://www.facebook.com/plugins/share_button.php?href=${encodeURIComponent(component.url)}&layout=button&size=large`
    expect(mockSafeResourceUrlSvc.trust).toHaveBeenCalledWith(expectedUrl)
    expect(result).toEqual({ safe: expectedUrl })
  })
})
