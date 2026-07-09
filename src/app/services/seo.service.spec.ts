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

  const canonicalHrefFrom = (): string => {
    let canonicalHref = ''
    mockDoc.createElement.mockImplementation(() => {
      const el: any = {
        setAttribute: jest.fn((attr: string, val: string) => {
          if (attr === 'rel') { el._rel = val }
          if (attr === 'href' && el._rel === 'canonical') { canonicalHref = val }
        }),
        remove: jest.fn(),
      }
      return el
    })
    service.update()
    return canonicalHref
  }

  it('update strips a trailing slash from the canonical URL so /x and /x/ consolidate', () => {
    mockRouter.url = '/public/home/'
    expect(canonicalHrefFrom()).toBe('https://sphere.aastrika.org/public/home')
  })

  it('update drops the query string from the canonical URL', () => {
    mockRouter.url = '/public/home?tab=all'
    expect(canonicalHrefFrom()).toBe('https://sphere.aastrika.org/public/home')
  })

  it('update preserves the site root "/" without stripping it to empty', () => {
    mockRouter.url = '/'
    expect(canonicalHrefFrom()).toBe('https://sphere.aastrika.org/')
  })

  it('update reuses the canonical link element across navigations instead of duplicating it', () => {
    service.update()
    const linkCountAfterFirst = mockDoc.createElement.mock.calls
      .filter((args: any[]) => args[0] === 'link').length
    mockRouter.url = '/public/about'
    service.update()
    const linkCountAfterSecond = mockDoc.createElement.mock.calls
      .filter((args: any[]) => args[0] === 'link').length
    // Only the single canonical <link> is created, and it is reused on the second update.
    expect(linkCountAfterFirst).toBe(1)
    expect(linkCountAfterSecond).toBe(1)
  })
})
