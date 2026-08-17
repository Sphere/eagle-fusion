import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { SeoService } from '../../../services/seo.service'
import { CNE_FAQS, CNE_INTRO, CNE_SECTIONS, CNE_STEPS, ICneFaq, ICneSection } from './cne-content.data'
import { CNE_COURSES, ICneCourse } from './cne-courses.generated'

const CANONICAL = 'https://sphere.aastrika.org/public/cne-courses/'

@Component({
  standalone: false,
  selector: 'ws-public-cne',
  templateUrl: './public-cne.component.html',
  styleUrls: ['./public-cne.component.scss'],
})
export class PublicCneComponent implements OnInit {
  intro = CNE_INTRO
  sections: ICneSection[] = CNE_SECTIONS
  courses: ICneCourse[] = CNE_COURSES
  steps: string[] = CNE_STEPS
  faqs: ICneFaq[] = CNE_FAQS

  constructor(private readonly seoSvc: SeoService, private readonly router: Router) {}

  ngOnInit() {
    this.seoSvc.update({
      title: 'Online CNE Courses — Free, INC-Certified, With Certificate | Aastrika Sphere',
      description:
        'Free online CNE courses for nurses in India. Earn 5–7.5 INC CNE credit hours per course, ' +
        'self-paced on any phone, with a certificate on completion. No fees, no deadline.',
      keywords: [
        'CNE',
        'CNE online',
        'online CNE',
        'CNE courses',
        'CNE course online',
        'CNE online class',
        'free CNE courses',
        'CNE points online',
        'CNE credits',
        'CNE certificate',
        'CNE login',
        'nursing CNE online',
        'continuing nursing education India',
        'INC CNE credits',
      ].join(', '),
      canonicalUrl: CANONICAL,
      ogType: 'article',
      jsonLd: this.buildJsonLd(),
    })
  }

  /** Distinct accrediting bodies across the CNE catalogue, for the intro line. */
  get accreditors(): string[] {
    return [...new Set(this.courses.map(c => c.sourceName).filter(Boolean))]
  }

  trackByIdentifier(_index: number, course: ICneCourse) { return course.identifier }
  trackByQuestion(_index: number, faq: ICneFaq) { return faq.question }
  trackBySection(_index: number, section: ICneSection) { return section.id }
  trackByIndex(index: number) { return index }

  navigateTo(route: string) {
    this.router.navigateByUrl(route)
  }

  /**
   * Two graph nodes: the course list so Google can see what the page actually offers,
   * and the FAQ so the long-tail questions ("is CNE free", "how do I log in") can be
   * matched directly. Answers are the plain text rendered on the page — structured data
   * that disagrees with the visible content is a manual-action risk.
   */
  private buildJsonLd() {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          '@id': `${CANONICAL}#page`,
          'name': 'Online CNE Courses for Nurses in India',
          'url': CANONICAL,
          'description': this.intro,
          'isPartOf': { '@id': 'https://sphere.aastrika.org/#website' },
          'mainEntity': {
            '@type': 'ItemList',
            // Trailing slash restored here: `route` is stored unslashed so routerLink
            // matches `overview/:courseId/:slug`, but the URL Google is given must be
            // the canonical one the destination page declares.
            'itemListElement': this.courses.map((course, index) => ({
              '@type': 'ListItem',
              'position': index + 1,
              'name': course.name,
              'url': `https://sphere.aastrika.org${course.route}/`,
            })),
          },
        },
        {
          '@type': 'FAQPage',
          '@id': `${CANONICAL}#faq`,
          'mainEntity': this.faqs.map(faq => ({
            '@type': 'Question',
            'name': faq.question,
            'acceptedAnswer': { '@type': 'Answer', 'text': faq.answer },
          })),
        },
      ],
    }
  }
}
