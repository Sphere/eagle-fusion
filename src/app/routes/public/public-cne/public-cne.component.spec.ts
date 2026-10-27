import { PublicCneComponent } from './public-cne.component'
import { CNE_FAQS } from './cne-content.data'
import { CNE_COURSES } from './cne-courses.generated'

describe('PublicCneComponent', () => {
  let component: PublicCneComponent
  let seoSvc: { update: jest.Mock }
  let router: { navigateByUrl: jest.Mock }

  beforeEach(() => {
    seoSvc = { update: jest.fn() }
    router = { navigateByUrl: jest.fn() }
    component = new PublicCneComponent(seoSvc as any, router as any)
  })

  it('exposes the CNE content', () => {
    expect(component.courses).toBe(CNE_COURSES)
    expect(component.faqs).toBe(CNE_FAQS)
    expect(component.sections.length).toBeGreaterThan(0)
    expect(component.steps.length).toBeGreaterThan(0)
    expect(component.intro).toBeTruthy()
  })

  describe('ngOnInit', () => {
    let meta: any

    beforeEach(() => {
      component.ngOnInit()
      meta = seoSvc.update.mock.calls[0][0]
    })

    it('sets the page SEO with the canonical URL', () => {
      expect(seoSvc.update).toHaveBeenCalledTimes(1)
      expect(meta.canonicalUrl).toBe('https://sphere.aastrika.org/public/cne-courses/')
      expect(meta.ogType).toBe('article')
      expect(meta.title).toContain('CNE')
      expect(meta.keywords).toContain('CNE online, online CNE')
    })

    it('lists every course with a slashed canonical URL in the JSON-LD', () => {
      const [page] = meta.jsonLd['@graph']
      expect(page['@type']).toBe('CollectionPage')
      expect(page.description).toBe(component.intro)
      const items = page.mainEntity.itemListElement
      expect(items).toHaveLength(component.courses.length)
      items.forEach((item: any, index: number) => {
        expect(item.position).toBe(index + 1)
        expect(item.name).toBe(component.courses[index].name)
        expect(item.url).toBe(`https://sphere.aastrika.org${component.courses[index].route}/`)
      })
    })

    it('mirrors the visible FAQ in the JSON-LD', () => {
      const faqPage = meta.jsonLd['@graph'][1]
      expect(faqPage['@type']).toBe('FAQPage')
      expect(faqPage.mainEntity).toHaveLength(component.faqs.length)
      expect(faqPage.mainEntity[0]).toEqual({
        '@type': 'Question',
        name: component.faqs[0].question,
        acceptedAnswer: { '@type': 'Answer', text: component.faqs[0].answer },
      })
    })
  })

  it('lists each accrediting body once and skips empty ones', () => {
    component.courses = [
      { sourceName: 'INC' }, { sourceName: 'INC' }, { sourceName: '' }, { sourceName: 'MPNRC' },
    ] as any
    expect(component.accreditors).toEqual(['INC', 'MPNRC'])
  })

  it('tracks list items by their stable keys', () => {
    expect(component.trackByIdentifier(0, { identifier: 'do_1' } as any)).toBe('do_1')
    expect(component.trackByQuestion(0, { question: 'Is CNE free?' } as any)).toBe('Is CNE free?')
    expect(component.trackBySection(0, { id: 'what' } as any)).toBe('what')
    expect(component.trackByIndex(3)).toBe(3)
  })

  it('navigates to the given route', () => {
    component.navigateTo('/public/home')
    expect(router.navigateByUrl).toHaveBeenCalledWith('/public/home')
  })
})
