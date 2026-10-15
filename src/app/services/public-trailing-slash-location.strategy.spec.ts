import { APP_BASE_HREF, LocationStrategy, PlatformLocation } from '@angular/common'
import { TestBed } from '@angular/core/testing'
import { PublicTrailingSlashLocationStrategy, withPublicTrailingSlash } from './public-trailing-slash-location.strategy'

describe('withPublicTrailingSlash', () => {
  it('adds a trailing slash to a public path', () => {
    expect(withPublicTrailingSlash('/public/cne-courses')).toBe('/public/cne-courses/')
  })

  it('keeps the query string and fragment after the added slash', () => {
    expect(withPublicTrailingSlash('/public/toc/do_1/overview?lang=hi#faq')).toBe('/public/toc/do_1/overview/?lang=hi#faq')
    expect(withPublicTrailingSlash('/public/home#top')).toBe('/public/home/#top')
  })

  it('leaves a public path that already ends with a slash', () => {
    expect(withPublicTrailingSlash('/public/home/')).toBe('/public/home/')
    expect(withPublicTrailingSlash('/public/home/?a=1')).toBe('/public/home/?a=1')
  })

  it('leaves a public file path alone', () => {
    expect(withPublicTrailingSlash('/public/sitemap.xml')).toBe('/public/sitemap.xml')
  })

  it('leaves non-public paths alone', () => {
    expect(withPublicTrailingSlash('/app/profile')).toBe('/app/profile')
    expect(withPublicTrailingSlash('/public')).toBe('/public')
    expect(withPublicTrailingSlash('')).toBe('')
  })
})

describe('PublicTrailingSlashLocationStrategy', () => {
  let strategy: LocationStrategy

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' },
        { provide: LocationStrategy, useClass: PublicTrailingSlashLocationStrategy },
        {
          provide: PlatformLocation,
          useValue: { getBaseHrefFromDOM: () => '/', onPopState: () => jest.fn(), onHashChange: () => jest.fn() },
        },
      ],
    })
    strategy = TestBed.inject(LocationStrategy)
  })

  it('writes public URLs with a trailing slash', () => {
    expect(strategy.prepareExternalUrl('/public/cne-courses')).toBe('/public/cne-courses/')
  })

  it('writes app URLs unchanged', () => {
    expect(strategy.prepareExternalUrl('/app/profile')).toBe('/app/profile')
  })
})
