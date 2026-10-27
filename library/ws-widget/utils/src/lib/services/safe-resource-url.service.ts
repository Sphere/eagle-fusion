import { Injectable, SecurityContext } from '@angular/core'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'

/**
 * A fill-in-the-blank question ready to render. `html` is sanitized markup in which every
 * blank is a plain-text placeholder; bind it with [innerHTML] and let the wsFitbBlanks
 * directive turn the placeholders into <input> elements.
 */
export interface FitbQuestionHtml {
  html: string
  /** The id of each blank, in document order. */
  blankIds: string[]
  /** Matches one placeholder; capture group 1 is the blank's index into blankIds. */
  placeholder: RegExp
}

@Injectable({ providedIn: 'root' })
export class SafeResourceUrlService {
  constructor(private readonly sanitizer: DomSanitizer) { }

  /**
   * Trusts a resource URL (iframe/embed src) after verifying it uses http(s) —
   * blocks javascript:/data:/vbscript: and other non-navigational schemes.
   */
  trust(url: string | null | undefined): SafeResourceUrl | null {
    if (!url || !this.isHttpOrHttps(url)) {
      return null
    }
    return this.bypassForValidatedResourceUrl(url)
  }

  /**
   * Trusts a resource URL only if it uses https and its hostname is in allowedHosts.
   * Use for embeds sourced from lower-trust config (e.g. user/CMS-provided video links).
   */
  trustFromAllowlist(url: string | null | undefined, allowedHosts: string[]): SafeResourceUrl | null {
    if (!url) {
      return null
    }
    let hostname: string
    let protocol: string
    try {
      ({ hostname, protocol } = new URL(url, window.location.origin))
    } catch {
      return null
    }
    if (protocol !== 'https:' || !allowedHosts.includes(hostname)) {
      return null
    }
    return this.bypassForValidatedResourceUrl(url)
  }

  /**
   * Returns a URL for an <a href>/<audio src> only if it uses http(s) — blocks
   * javascript:/data:/vbscript: and other non-navigational schemes. The value still goes
   * through Angular's URL sanitizer rather than bypassing it.
   */
  sanitizeUrl(url: string | null | undefined): string | null {
    if (!url || !this.isHttpOrHttps(url)) {
      return null
    }
    return this.sanitizer.sanitize(SecurityContext.URL, url)
  }

  /**
   * Returns a value destined for an <img src> only.
   *
   * This additionally permits data:image/svg+xml, which sanitizeUrl() deliberately rejects.
   * That is safe in this one context and nowhere else: the HTML spec requires an image
   * referenced by <img> to be rendered in a restricted, non-interactive mode - scripts do
   * not run, external resources are not fetched, and event handlers are inert. The same
   * SVG in <object>, <embed>, <iframe>, or as a navigation target IS dangerous, so those
   * must keep using trust() / sanitizeUrl().
   *
   * Needed for server-rendered certificates, which arrive as a 650 KB
   * "data:image/svg+xml,<percent-encoded markup>" printUri.
   *
   * blob: is permitted for the same reason. Certificates migrated by the legacy job come back
   * as *raw* SVG markup rather than a data: URI, so the caller wraps them with
   * URL.createObjectURL() before binding. A blob: URL can only be minted by same-origin script
   * from a payload that script already holds, so it grants no reach a data: URI would not.
   *
   * No bypass is needed: Angular's URL sanitizer only rejects javascript:, so data: and
   * blob: values pass through it unchanged.
   */
  sanitizeImageSrc(url: string | null | undefined): string | null {
    if (!url) {
      return null
    }
    if (SafeResourceUrlService.SAFE_IMG_SRC.test(url) || this.isBlob(url) || this.isHttpOrHttps(url)) {
      return this.sanitizer.sanitize(SecurityContext.URL, url)
    }
    return null
  }

  /**
   * Turns whatever the certificate service put in `result.printUri` into something an <img>
   * can actually load, and must be called before sanitizeImageSrc() on any certificate value.
   *
   * The shapes differ per issuing path and per environment: newly issued certificates used to
   * carry a `data:image/svg+xml,` URI, prod-migrated rows carry an https cloud URL, and since
   * rendering moved to sunbird-rc the service returns **raw SVG markup**. Raw markup assigned to
   * an <img> is resolved by the browser as a relative path, so it silently passes the http(s)
   * check in sanitizeImageSrc() and then fails to load - a broken image with no error anywhere.
   *
   * Markup is wrapped in an object URL rather than a data: URI: at ~700KB percent-encoding
   * would balloon the string in the DOM, and a blob is same-origin so a canvas drawn from it
   * stays untainted. Any object URL created is pushed onto `objectUrlSink`; the caller must
   * revoke those in ngOnDestroy.
   */
  toImageSource(printUri: string | null | undefined, objectUrlSink: string[]): string {
    let value = (printUri || '').trim().replace(/^﻿/, '')
    if (!value) {
      return ''
    }
    if (/^(?:data:|blob:|https?:|\/\/|\/)/i.test(value)) {
      return value
    }
    // Percent-encoded markup ("%3Csvg...") - decode so the markup test below sees it.
    if (/^%3C/i.test(value)) {
      try {
        value = decodeURIComponent(value)
      } catch {
        // Malformed escape sequence - fall through and treat it as a path.
      }
    }
    // Any markup, not just "<svg": an XML prolog, DOCTYPE or comment can come first.
    if (value.startsWith('<')) {
      const objectUrl = URL.createObjectURL(new Blob([value], { type: 'image/svg+xml' }))
      objectUrlSink.push(objectUrl)
      return objectUrl
    }
    return value
  }

  /**
   * Returns a CSS value (e.g. a background-image url()) for a [style] binding. Angular
   * passes plain style strings through unchanged, so no bypass is needed.
   */
  sanitizeStyle(value: string | null | undefined): string | null {
    if (!value) {
      return null
    }
    return this.sanitizer.sanitize(SecurityContext.STYLE, value)
  }

  /**
   * Sanitizes an HTML string for rendering via [innerHTML]. Runs Angular's own HTML
   * sanitizer instead of bypassing it, so <script>, event handlers and javascript: URLs
   * are stripped even when the markup comes from an API response or the URL.
   */
  sanitizeHtml(value: string | null | undefined): string | null {
    if (!value) {
      return null
    }
    return this.sanitizer.sanitize(SecurityContext.HTML, value)
  }

  /**
   * Prepares a fill-in-the-blank question. Its blanks are <input> elements, which Angular's
   * HTML sanitizer strips, so sanitizeHtml() alone would render the question with no blanks.
   *
   * Every <input> tag is swapped for a plain-text placeholder and the rest of the markup is
   * run through Angular's sanitizer. The result is still an ordinary string: bind it with
   * [innerHTML] (which sanitizes it again) and add the wsFitbBlanks directive, which creates
   * each <input> with DOM APIs. Nothing here bypasses Angular's sanitization.
   */
  sanitizeFitbHtml(value: string | null | undefined): FitbQuestionHtml | null {
    if (!value) {
      return null
    }
    const nonce = Array.from(crypto.getRandomValues(new Uint32Array(2)), n => n.toString(36)).join('')
    const blankIds: string[] = []
    const withPlaceholders = value.replace(/<input\b[^>]*>/gi, tag => {
      blankIds.push(/\bid="([^"]*)"/i.exec(tag)?.[1] ?? '')
      return `FITB${nonce}x${blankIds.length - 1}x`
    })
    return {
      html: this.sanitizer.sanitize(SecurityContext.HTML, withPlaceholders) ?? '',
      blankIds,
      placeholder: new RegExp(`FITB${nonce}x(\\d+)x`),
    }
  }

  // Only raster formats, and only base64-encoded — excludes svg+xml (can embed <script>)
  // and excludes non-base64 data: URIs (which could carry literal markup/JS as text).
  private static readonly SAFE_DATA_IMAGE = /^data:image\/(png|jpe?g|gif|webp);base64,/i

  // Wider set, permitted ONLY by sanitizeImageSrc() — see the rationale there. svg+xml and
  // non-base64 payloads are included because <img> rendering is script-free by spec.
  private static readonly SAFE_IMG_SRC = /^data:image\/(png|jpe?g|gif|webp|svg\+xml)[;,]/i

  // Only for sanitizeImageSrc() — an object URL this app minted for an <img>, never a navigation target.
  private isBlob(url: string): boolean {
    return /^blob:/i.test(url)
  }

  /**
   * The one remaining sanitization bypass. Angular has no sanitizer for the RESOURCE_URL
   * context (iframe/embed src, MatIconRegistry SVG URLs): a plain string there throws, so a
   * bypass is the only way to bind one. Callers must have validated the URL first —
   * trust() requires http(s) and trustFromAllowlist() requires https plus an allowlisted host.
   */
  private bypassForValidatedResourceUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url)
  }

  private isHttpOrHttps(url: string): boolean {
    if (SafeResourceUrlService.SAFE_DATA_IMAGE.test(url)) {
      return true
    }
    try {
      const { protocol } = new URL(url, window.location.origin)
      return protocol === 'https:' || protocol === 'http:'
    } catch {
      return false
    }
  }
}
