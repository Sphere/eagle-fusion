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
  noindex?: boolean
}

const DEFAULT_TITLE = 'Aastrika Sphere - Free CNE Courses | INC Certified | Healthcare Training'
const DEFAULT_DESCRIPTION =
  'Earn CNE points and INC certification with free online healthcare courses on Aastrika Sphere. Training for nurses, midwives, and healthcare workers across India.'
const BASE_URL = 'https://sphere.aastrika.org'
// Dedicated 1200x630 social share card. A favicon (the previous value) makes a poor
// OG image. Asset lives at src/fusion-assets/images/og-image.png.
const DEFAULT_OG_IMAGE = `${BASE_URL}/fusion-assets/images/og-image.png`

@Injectable({ providedIn: 'root' })
export class SeoService {
  private canonicalEl: HTMLLinkElement | null = null
  private jsonLdEl: HTMLScriptElement | null = null

  constructor(
    @Inject(DOCUMENT) private readonly doc: Document,
    private readonly titleSvc: Title,
    private readonly metaSvc: Meta,
    private readonly router: Router,
  ) {}

  update(config: ISeoConfig = {}) {
    const title = config.title || DEFAULT_TITLE
    const description = config.description || DEFAULT_DESCRIPTION
    const ogTitle = config.ogTitle || title
    const ogDescription = config.ogDescription || description
    const ogImage = config.ogImage || DEFAULT_OG_IMAGE
    const ogUrl = this.toServedForm(config.ogUrl || `${BASE_URL}${this.router.url.split('?')[0]}`)
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

    // robots — noindex for pages that should not appear in search results (login, OTP, etc.)
    if (config.noindex) {
      this.metaSvc.updateTag({ name: 'robots', content: 'noindex, nofollow' })
    } else {
      this.metaSvc.removeTag('name="robots"')
    }

    // Canonical and JSON-LD — use injected DOCUMENT so these work during SSR/prerender too
    this.setCanonical(this.toServedForm(config.canonicalUrl || ogUrl))
    this.setJsonLd(config.jsonLd || null)
  }

  /**
   * The CDN 301-redirects every extension-less path to its trailing-slash form
   * (`/public/home` -> `/public/home/`). A canonical or og:url pointing at the
   * non-slash form therefore points at a redirect, so Google discards it and picks
   * its own canonical — which is why Search Console reports `/public/home` and
   * `/public/home/` as two separate pages and flags 265 URLs as "Page with redirect".
   * Emit the form the server actually serves with a 200.
   *
   * Query-string URLs (`/app/org-details?orgId=…`) and file-like paths are served
   * as-is by the CDN, so they are left untouched.
   */
  private toServedForm(url: string): string {
    const queryOrHashAt = url.search(/[?#]/)
    if (queryOrHashAt !== -1) { return url }
    if (url.endsWith('/') || /\.[a-z0-9]+$/i.test(url)) { return url }
    return `${url}/`
  }

  private setCanonical(url: string) {
    if (!this.canonicalEl) {
      // Reuse a canonical already in the document (e.g. emitted by a previous
      // prerender pass) instead of appending a second, competing tag.
      this.canonicalEl = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    }
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
