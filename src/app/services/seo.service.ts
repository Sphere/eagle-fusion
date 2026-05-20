import { Inject, Injectable } from '@angular/core'
import { DOCUMENT } from '@angular/common'
import { Meta, Title } from '@angular/platform-browser'
import { Router } from '@angular/router'

export interface ISeoConfig {
  title?: string
  description?: string
  keywords?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogUrl?: string
  ogType?: string
  canonicalUrl?: string
  jsonLd?: object | null
}

const DEFAULT_TITLE = 'Aastrika Sphere - Free CNE Courses | INC Certified | Healthcare Training'
const DEFAULT_DESCRIPTION =
  'Earn CNE points and INC certification with free online healthcare courses on Aastrika Sphere. Training for nurses, midwives, and healthcare workers across India.'
const DEFAULT_OG_IMAGE =
  'https://sunbirdcontent.s3-ap-south-1.amazonaws.com/content/do_1137952004583669761234/artifact/do_1137952004583669761234_1683984431271_favicon1683984430342.png'
const BASE_URL = 'https://sphere.aastrika.org'

@Injectable({ providedIn: 'root' })
export class SeoService {
  private canonicalEl: HTMLLinkElement | null = null
  private jsonLdEl: HTMLScriptElement | null = null

  constructor(
    @Inject(DOCUMENT) private doc: Document,
    private titleSvc: Title,
    private metaSvc: Meta,
    private router: Router,
  ) {}

  update(config: ISeoConfig = {}) {
    const title = config.title || DEFAULT_TITLE
    const description = config.description || DEFAULT_DESCRIPTION
    const ogTitle = config.ogTitle || title
    const ogDescription = config.ogDescription || description
    const ogImage = config.ogImage || DEFAULT_OG_IMAGE
    const ogUrl = config.ogUrl || `${BASE_URL}${this.router.url.split('?')[0]}`
    const ogType = config.ogType || 'website'

    this.titleSvc.setTitle(title)

    this.metaSvc.updateTag({ name: 'description', content: description })

    if (config.keywords) {
      this.metaSvc.updateTag({ name: 'keywords', content: config.keywords })
    }

    // Open Graph
    this.metaSvc.updateTag({ property: 'og:title', content: ogTitle })
    this.metaSvc.updateTag({ property: 'og:description', content: ogDescription })
    this.metaSvc.updateTag({ property: 'og:image', content: ogImage })
    this.metaSvc.updateTag({ property: 'og:url', content: ogUrl })
    this.metaSvc.updateTag({ property: 'og:type', content: ogType })

    // Twitter / X cards
    this.metaSvc.updateTag({ name: 'twitter:card', content: 'summary_large_image' })
    this.metaSvc.updateTag({ name: 'twitter:title', content: ogTitle })
    this.metaSvc.updateTag({ name: 'twitter:description', content: ogDescription })
    this.metaSvc.updateTag({ name: 'twitter:image', content: ogImage })

    // Canonical and JSON-LD — use injected DOCUMENT so these work during SSR/prerender too
    this.setCanonical(config.canonicalUrl || ogUrl)
    this.setJsonLd(config.jsonLd || null)
  }

  private setCanonical(url: string) {
    if (!this.canonicalEl) {
      this.canonicalEl = this.doc.createElement('link')
      this.canonicalEl.setAttribute('rel', 'canonical')
      this.doc.head.appendChild(this.canonicalEl)
    }
    this.canonicalEl.setAttribute('href', url)
  }

  private setJsonLd(schema: object | null) {
    if (this.jsonLdEl) {
      this.jsonLdEl.remove()
      this.jsonLdEl = null
    }
    if (!schema) { return }
    this.jsonLdEl = this.doc.createElement('script')
    this.jsonLdEl.type = 'application/ld+json'
    this.jsonLdEl.text = JSON.stringify(schema)
    this.doc.head.appendChild(this.jsonLdEl)
  }
}
