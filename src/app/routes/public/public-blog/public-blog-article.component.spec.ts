jest.mock('./blog-articles.data', () => ({
  BLOG_ARTICLES: [
    {
      slug: 'test-article',
      title: 'Test Article',
      metaTitle: 'Test Article Meta',
      metaDescription: 'Test description',
      keywords: 'test, article',
      publishedDate: '2024-01-01',
    },
    {
      slug: 'another-article',
      title: 'Another Article',
      metaTitle: 'Another Meta',
      metaDescription: 'Another description',
      keywords: 'another, test',
      publishedDate: '2024-02-01',
    },
  ],
}))

import { PublicBlogArticleComponent } from './public-blog-article.component'

describe('PublicBlogArticleComponent', () => {
  let component: PublicBlogArticleComponent
  let mockRoute: any
  let mockRouter: any
  let mockSeoSvc: any

  beforeEach(() => {
    mockRoute = {
      snapshot: { paramMap: { get: jest.fn().mockReturnValue('test-article') } },
    }
    mockRouter = { navigate: jest.fn() }
    mockSeoSvc = { update: jest.fn() }
    component = new PublicBlogArticleComponent(mockRoute, mockRouter, mockSeoSvc)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default article to null and notFound to false', () => {
    expect(component.article).toBeNull()
    expect(component.notFound).toBe(false)
  })

  it('should set article when slug matches', () => {
    component.ngOnInit()
    expect(component.article).not.toBeNull()
    expect(component.article?.slug).toBe('test-article')
    expect(component.notFound).toBe(false)
  })

  it('should set notFound true when slug not found', () => {
    mockRoute.snapshot.paramMap.get.mockReturnValue('nonexistent-slug')
    component.ngOnInit()
    expect(component.article).toBeNull()
    expect(component.notFound).toBe(true)
  })

  it('should call seoSvc.update with article data on ngOnInit', () => {
    component.ngOnInit()
    expect(mockSeoSvc.update).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Article Meta',
        description: 'Test description',
        keywords: 'test, article',
        ogType: 'article',
      }),
    )
  })

  it('should not call seoSvc.update when article not found', () => {
    mockRoute.snapshot.paramMap.get.mockReturnValue('no-match')
    component.ngOnInit()
    expect(mockSeoSvc.update).not.toHaveBeenCalled()
  })

  it('should navigate to /public/blog on goToBlogList()', () => {
    component.goToBlogList()
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/public/blog'])
  })

  it('should navigate to given route on navigateTo()', () => {
    component.navigateTo('/public/home')
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/public/home'])
  })
})
