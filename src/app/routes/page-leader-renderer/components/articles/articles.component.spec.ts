import { ArticlesComponent } from './articles.component'

describe('ArticlesComponent', () => {
  let component: ArticlesComponent

  beforeEach(() => {
    component = new ArticlesComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default articles to empty array', () => {
    expect(component.articles).toEqual([])
  })

  it('should accept articles input', () => {
    const mockArticles: any[] = [
      { title: 'Article 1', url: 'https://example.com/1' },
      { title: 'Article 2', url: 'https://example.com/2' },
    ]
    component.articles = mockArticles
    expect(component.articles).toHaveLength(2)
    expect(component.articles[0].title).toBe('Article 1')
  })

  it('should complete ngOnInit without error', () => {
    expect(() => component.ngOnInit()).not.toThrow()
  })
})
