import { SeoService } from './seo.service'

describe('SeoService', () => {
  let service: SeoService
  let mockDoc: any
  let mockTitleSvc: any
  let mockMetaSvc: any
  let mockRouter: any

  beforeEach(() => {
    const makeEl = () => ({
      setAttribute: jest.fn(),
      remove: jest.fn(),
      type: '',
      text: '',
    })
    mockDoc = {
      createElement: jest.fn().mockImplementation(() => makeEl()),
      head: { appendChild: jest.fn() },
    }
    mockTitleSvc = { setTitle: jest.fn() }
    mockMetaSvc = { updateTag: jest.fn(), removeTag: jest.fn() }
    mockRouter = { url: '/app/home' }

    service = new SeoService(mockDoc, mockTitleSvc, mockMetaSvc, mockRouter)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('update sets default title when no title provided', () => {
    service.update()
    expect(mockTitleSvc.setTitle).toHaveBeenCalledWith(
      'Aastrika Sphere - Free CNE Courses | INC Certified | Healthcare Training'
    )
  })

  it('update sets provided title', () => {
    service.update({ title: 'Custom Title' })
    expect(mockTitleSvc.setTitle).toHaveBeenCalledWith('Custom Title')
  })

  it('update sets description meta tag', () => {
    service.update({ description: 'Test description' })
    expect(mockMetaSvc.updateTag).toHaveBeenCalledWith({ name: 'description', content: 'Test description' })
  })

  it('update sets og:title meta tag', () => {
    service.update({ ogTitle: 'OG Title' })
    expect(mockMetaSvc.updateTag).toHaveBeenCalledWith({ property: 'og:title', content: 'OG Title' })
  })

  it('update sets keywords meta tag when provided', () => {
    service.update({ keywords: 'nurse, training, cne' })
    expect(mockMetaSvc.updateTag).toHaveBeenCalledWith({ name: 'keywords', content: 'nurse, training, cne' })
  })

  it('update does not set keywords when not provided', () => {
    service.update()
    const keywordCalls = mockMetaSvc.updateTag.mock.calls.filter(
      (args: any[]) => args[0].name === 'keywords'
    )
    expect(keywordCalls.length).toBe(0)
  })

  it('update with noindex adds robots noindex tag', () => {
    service.update({ noindex: true })
    expect(mockMetaSvc.updateTag).toHaveBeenCalledWith({ name: 'robots', content: 'noindex, nofollow' })
  })

  it('update without noindex removes robots tag', () => {
    service.update({ noindex: false })
    expect(mockMetaSvc.removeTag).toHaveBeenCalledWith('name="robots"')
  })

  it('update sets twitter:card meta tag', () => {
    service.update()
    expect(mockMetaSvc.updateTag).toHaveBeenCalledWith({ name: 'twitter:card', content: 'summary_large_image' })
  })

  it('update creates canonical link element on first call', () => {
    service.update()
    expect(mockDoc.createElement).toHaveBeenCalledWith('link')
    expect(mockDoc.head.appendChild).toHaveBeenCalled()
  })
})
