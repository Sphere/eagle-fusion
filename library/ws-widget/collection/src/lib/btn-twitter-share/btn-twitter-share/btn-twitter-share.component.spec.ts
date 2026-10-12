import { BtnTwitterShareComponent } from './btn-twitter-share.component'

describe('BtnTwitterShareComponent', () => {
  let component: BtnTwitterShareComponent
  let mockSafeResourceUrlSvc: any
  let mockConfigSvc: any

  beforeEach(() => {
    mockSafeResourceUrlSvc = {
      trust: jest.fn().mockImplementation((url: string) => ({ safe: url })),
    }
    mockConfigSvc = { restrictedFeatures: null }
    component = new BtnTwitterShareComponent(mockSafeResourceUrlSvc, mockConfigSvc)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should enable twitter share when feature is not restricted', () => {
    mockConfigSvc.restrictedFeatures = { has: jest.fn().mockReturnValue(false) }
    component.ngOnInit()
    expect(component.isSocialMediaTwitterShareEnabled).toBe(true)
  })

  it('should disable twitter share when feature is restricted', () => {
    mockConfigSvc.restrictedFeatures = { has: jest.fn().mockReturnValue(true) }
    component.ngOnInit()
    expect(component.isSocialMediaTwitterShareEnabled).toBe(false)
  })

  it('should URL-encode the shared url before building the sanitized twitter widget url', () => {
    component.url = 'https://example.com/course?ref=home&x=1' as any
    const encoded = encodeURIComponent(String(component.url))
    const result: any = component.sanitizeTwitterUrl
    // tslint:disable-next-line: max-line-length
    const expectedUrl = `https://platform.twitter.com/widgets/tweet_button.c63890edc4243ee77048d507b181eeec.en.html#dnt=false&id=twitter-widget-2&lang=en&original_referer=${encoded}&size=l&type=share&url=${encoded}`
    expect(mockSafeResourceUrlSvc.trust).toHaveBeenCalledWith(expectedUrl)
    expect(result).toEqual({ safe: expectedUrl })
  })
})
