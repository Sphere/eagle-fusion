import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { SeoService } from '../../../services/seo.service'
import { BLOG_ARTICLES, IBlogArticle } from './blog-articles.data'

@Component({
  standalone: false,
  selector: 'ws-public-blog-article',
  templateUrl: './public-blog-article.component.html',
  styleUrls: ['./public-blog-article.component.scss'],
})
export class PublicBlogArticleComponent implements OnInit {
  article: IBlogArticle | null = null
  notFound = false

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly seoSvc: SeoService,
  ) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')
    this.article = BLOG_ARTICLES.find(a => a.slug === slug) || null

    if (!this.article) {
      this.notFound = true
      return
    }

    const canonicalUrl = `https://sphere.aastrika.org/public/blog/${this.article.slug}`

    this.seoSvc.update({
      title: this.article.metaTitle,
      description: this.article.metaDescription,
      keywords: this.article.keywords,
      canonicalUrl,
      ogUrl: canonicalUrl,
      ogType: 'article',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': this.article.title,
        'description': this.article.metaDescription,
        'url': canonicalUrl,
        'datePublished': this.article.publishedDate,
        'publisher': {
          '@type': 'Organization',
          'name': 'Aastrika Sphere',
          'url': 'https://sphere.aastrika.org',
        },
      },
    })
  }

  goToBlogList() {
    this.router.navigate(['/public/blog'])
  }

  navigateTo(route: string) {
    this.router.navigate([route])
  }
}
