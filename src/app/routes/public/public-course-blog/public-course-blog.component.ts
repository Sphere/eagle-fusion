import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { HttpClient } from '@angular/common/http'
import { SeoService } from '../../../services/seo.service'
import { API_END_POINTS } from '../../../constants/apiConstants'

@Component({
  standalone: false,
  selector: 'ws-public-course-blog',
  templateUrl: './public-course-blog.component.html',
  styleUrls: ['./public-course-blog.component.scss'],
})
export class PublicCourseBlogComponent implements OnInit {
  course: any = null
  isLoading = true
  notFound = false

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private seoSvc: SeoService,
  ) {}

  ngOnInit() {
    const courseId = this.route.snapshot.paramMap.get('courseId') || ''
    if (!courseId) {
      this.notFound = true
      this.isLoading = false
      return
    }
    this.fetchCourse(courseId)
  }

  private fetchCourse(courseId: string) {
    const body = {
      request: {
        filters: {
          primaryCategory: ['Course'],
          contentType: ['Course'],
          status: ['Live'],
          identifier: [courseId],
        },
      },
      query: '',
      sort: [{ lastUpdatedOn: 'desc' }],
    }

    this.http.post<any>(API_END_POINTS.SEARCH_V7PUBLIC, body).subscribe({
      next: (res: any) => {
        const content = res?.result?.content ?? []
        if (!content.length) {
          this.notFound = true
          this.isLoading = false
          return
        }
        this.course = content[0]
        this.isLoading = false
        this.updateSeo()
      },
      error: () => {
        this.notFound = true
        this.isLoading = false
      },
    })
  }

  private updateSeo() {
    const c = this.course
    const canonicalUrl = `https://sphere.aastrika.org/public/course-blog/${c.identifier}`
    const title = `${c.name} | Free Online Course | Aastrika Sphere`
    const description = (c.description || c.name || '')
      .replace(/<[^>]*>/g, '')
      .slice(0, 160)
      .trim()

    this.seoSvc.update({
      title,
      description,
      keywords: this.getKeywordsString(c),
      canonicalUrl: `https://sphere.aastrika.org/public/toc/overview/${c.identifier}`,
      ogUrl: canonicalUrl,
      ogType: 'article',
      ogImage: c.appIcon || c.thumbnail || undefined,
      noindex: true,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Course',
        'name': c.name,
        'description': description,
        'url': canonicalUrl,
        'provider': {
          '@type': 'Organization',
          'name': c.sourceName || 'Aastrika Sphere',
          'url': 'https://sphere.aastrika.org',
        },
        'hasCourseInstance': {
          '@type': 'CourseInstance',
          'courseMode': 'online',
          'inLanguage': this.getLanguageLabel(c.medium || c.lang),
        },
        ...(c.averageRating ? {
          'aggregateRating': {
            '@type': 'AggregateRating',
            'ratingValue': c.averageRating,
            'bestRating': 5,
            'ratingCount': c.totalRatingsCount || 1,
          },
        } : {}),
      },
    })
  }

  getKeywordsString(c: any): string {
    const parts: string[] = []
    if (c.name) { parts.push(c.name) }
    if (c.sourceName) { parts.push(c.sourceName) }
    if (c.subject) { parts.push(...(Array.isArray(c.subject) ? c.subject : [c.subject])) }
    parts.push('free healthcare course', 'Aastrika Sphere', 'INC certified', 'CNE points')
    return parts.join(', ')
  }

  getKeywordsList(c: any): string[] {
    const kws: string[] = []
    if (c.subject) { kws.push(...(Array.isArray(c.subject) ? c.subject : [c.subject])) }
    if (c.keywords) {
      const raw = Array.isArray(c.keywords) ? c.keywords : (c.keywords || '').split(',')
      kws.push(...raw.map((k: string) => k.trim()).filter(Boolean))
    }
    return [...new Set(kws)].slice(0, 10)
  }

  getDurationHours(seconds: number): string {
    if (!seconds || seconds <= 0) { return '' }
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h && m) { return `${h}h ${m}m` }
    if (h) { return `${h} hour${h > 1 ? 's' : ''}` }
    return `${m} min`
  }

  getLanguageLabel(lang: string | string[]): string {
    const l = Array.isArray(lang) ? lang[0] : lang
    const map: Record<string, string> = { en: 'English', hi: 'Hindi', ta: 'Tamil', te: 'Telugu' }
    return map[l] || l || 'English'
  }

  formatDate(dateStr: string): string {
    if (!dateStr) { return '' }
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) { return '' }
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  enrollNow() {
    this.router.navigate([`/public/toc/overview/${this.course.identifier}`])
  }

  goToHome() {
    this.router.navigate(['/public/home'])
  }
}
