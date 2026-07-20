import { CardContentComponent } from './card-content.component'

describe('CardContentComponent', () => {
  let component: CardContentComponent

  beforeEach(() => {
    const mockConfigSvc = {} as any
    const mockUtilitySvc = {} as any
    const mockSnackBar = {} as any
    const mockAuthSvc = {} as any
    const mockUserProfileSvc = {} as any
    const mockRouter = {} as any
    const mockTitleService = {} as any
    component = new CardContentComponent(
      mockConfigSvc,
      mockUtilitySvc,
      mockSnackBar,
      mockAuthSvc,
      mockUserProfileSvc,
      mockRouter,
      mockTitleService,
    )
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('slugify', () => {
    it('should lowercase, replace ampersands, and hyphenate spaces/symbols', () => {
      expect(component.slugify('Hello & World! Foo_Bar')).toBe('hello-and-world-foo-bar')
    })

    it('should trim leading/trailing hyphens', () => {
      expect(component.slugify('  --Leading and Trailing--  ')).toBe('leading-and-trailing')
    })

    it('should truncate pathologically long titles before processing', () => {
      const longTitle = `${'a'.repeat(500)} end`
      const result = component.slugify(longTitle)
      expect(result.length).toBeLessThanOrEqual(200)
    })

    it('should not hang on a large run of trailing symbols (ReDoS regression guard)', () => {
      const adversarialInput = `title${'-'.repeat(10000)}`
      const start = Date.now()
      component.slugify(adversarialInput)
      expect(Date.now() - start).toBeLessThan(1000)
    })
  })
})
