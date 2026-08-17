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
      head: { appendChild: jest.fn(), querySelector: jest.fn().mockReturnValue(null) },
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

  it('reuses an existing canonical link instead of appending a second one', () => {
    const existing = { setAttribute: jest.fn() }
    mockDoc.head.querySelector.mockReturnValue(existing)

    service.update({ canonicalUrl: 'https://sphere.aastrika.org/public/home/' })

    expect(mockDoc.createElement).not.toHaveBeenCalledWith('link')
    expect(mockDoc.head.appendChild).not.toHaveBeenCalled()
    expect(existing.setAttribute).toHaveBeenCalledWith('href', 'https://sphere.aastrika.org/public/home/')
  })

  describe('trailing-slash normalisation', () => {
    const canonicalHref = () => {
      const link = mockDoc.createElement.mock.results
        .map((r: any) => r.value)
        .find((el: any) => el.setAttribute.mock.calls.some((c: any[]) => c[0] === 'href'))
      return link.setAttribute.mock.calls.find((c: any[]) => c[0] === 'href')[1]
    }

    it('appends a trailing slash to an extension-less canonical', () => {
      service.update({ canonicalUrl: 'https://sphere.aastrika.org/public/blog' })
      expect(canonicalHref()).toBe('https://sphere.aastrika.org/public/blog/')
    })

    it('leaves an already-slashed canonical untouched', () => {
      service.update({ canonicalUrl: 'https://sphere.aastrika.org/public/blog/' })
      expect(canonicalHref()).toBe('https://sphere.aastrika.org/public/blog/')
    })

    it('leaves a query-string canonical untouched', () => {
      const url = 'https://sphere.aastrika.org/app/org-details?orgId=Indian%20Nursing%20Council'
      service.update({ canonicalUrl: url })
      expect(canonicalHref()).toBe(url)
    })

    it('normalises the derived og:url from the router path', () => {
      mockRouter.url = '/public/toc/overview/do_123/slug?batchId=9'
      service.update()
      expect(mockMetaSvc.updateTag).toHaveBeenCalledWith({
        property: 'og:url',
        content: 'https://sphere.aastrika.org/public/toc/overview/do_123/slug/',
      })
    })
  })
})
