jest.mock('./blog-articles.data', () => ({
  BLOG_ARTICLES: [
    { slug: 'article-1', title: 'Article 1' },
    { slug: 'article-2', title: 'Article 2' },
  ],
}))

import { PublicBlogListComponent } from './public-blog-list.component'

describe('PublicBlogListComponent', () => {
  let component: PublicBlogListComponent
  let mockSeoSvc: any
  let mockRouter: any

  beforeEach(() => {
    mockSeoSvc = { update: jest.fn() }
    mockRouter = { navigate: jest.fn() }
    component = new PublicBlogListComponent(mockSeoSvc, mockRouter)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialise articles from BLOG_ARTICLES', () => {
    expect(component.articles).toHaveLength(2)
    expect(component.articles[0].slug).toBe('article-1')
  })

  it('should call seoSvc.update on ngOnInit', () => {
    component.ngOnInit()
    expect(mockSeoSvc.update).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining('Blog'),
        canonicalUrl: expect.stringContaining('sphere.aastrika.org'),
      }),
    )
  })

  it('should navigate to /public/blog/:slug on navigate()', () => {
    component.navigate('my-slug')
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/public/blog', 'my-slug'])
  })
})
