import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { SeoService } from '../../../services/seo.service'
import { BLOG_ARTICLES, IBlogArticle } from './blog-articles.data'

@Component({
  standalone: false,
  selector: 'ws-public-blog-list',
  templateUrl: './public-blog-list.component.html',
  styleUrls: ['./public-blog-list.component.scss'],
})
export class PublicBlogListComponent implements OnInit {
  articles: IBlogArticle[] = BLOG_ARTICLES

  constructor(private seoSvc: SeoService, private router: Router) {}

  ngOnInit() {
    this.seoSvc.update({
      title: 'Healthcare Training Blog | Aastrika Sphere',
      description:
        'Guides and articles for nurses, ANMs, GNMs and healthcare workers in India. Learn about CNE points, INC certification, AMTSL, and free online courses.',
      keywords:
        'healthcare training blog, CNE points guide, INC certification India, nursing education, ANM GNM courses',
      canonicalUrl: 'https://sphere.aastrika.org/public/blog',
    })
  }

  navigate(slug: string) {
    this.router.navigate(['/public/blog', slug])
  }
}
