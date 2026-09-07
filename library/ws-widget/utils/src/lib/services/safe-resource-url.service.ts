import { Injectable } from '@angular/core'
import { DomSanitizer, SafeHtml, SafeResourceUrl, SafeScript, SafeStyle, SafeUrl } from '@angular/platform-browser'

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
    return this.sanitizer.bypassSecurityTrustResourceUrl(url)
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
    return this.sanitizer.bypassSecurityTrustResourceUrl(url)
  }

  /**
   * Trusts a non-navigational URL (e.g. an <a href>) after verifying it uses http(s) —
   * blocks javascript:/data:/vbscript: and other non-navigational schemes.
   */
  trustUrl(url: string | null | undefined): SafeUrl | null {
    if (!url || !this.isHttpOrHttps(url)) {
      return null
    }
    return this.sanitizer.bypassSecurityTrustUrl(url)
  }

  /**
   * Trusts a value destined for an <img src> only.
   *
   * This additionally permits data:image/svg+xml, which trustUrl() deliberately rejects.
   * That is safe in this one context and nowhere else: the HTML spec requires an image
   * referenced by <img> to be rendered in a restricted, non-interactive mode - scripts do
   * not run, external resources are not fetched, and event handlers are inert. The same
   * SVG in <object>, <embed>, <iframe>, or as a navigation target IS dangerous, so those
   * must keep using trust() / trustUrl().
   *
   * Needed for server-rendered certificates, which arrive as a 650 KB
   * "data:image/svg+xml,<percent-encoded markup>" printUri.
   */
  trustImageSrc(url: string | null | undefined): SafeUrl | null {
    if (!url) {
      return null
    }
    if (SafeResourceUrlService.SAFE_IMG_SRC.test(url) || this.isHttpOrHttps(url)) {
      return this.sanitizer.bypassSecurityTrustUrl(url)
    }
    return null
  }

  /**
   * Trusts a CSS value (e.g. a background-image url()). Style injection can't execute
   * script directly, but this still disables Angular's built-in CSS sanitization.
   */
  trustStyle(value: string | null | undefined): SafeStyle | null {
    if (!value) {
      return null
    }
    return this.sanitizer.bypassSecurityTrustStyle(value)
  }

  /**
   * Trusts a script value for execution contexts. Reserved for content that is never
   * end-user-controlled — prefer avoiding bypassSecurityTrustScript entirely where possible.
   */
  trustScript(value: string | null | undefined): SafeScript | null {
    if (!value) {
      return null
    }
    return this.sanitizer.bypassSecurityTrustScript(value)
  }

  /**
   * Trusts an HTML string for rendering via [innerHTML]. This does NOT sanitize the
   * markup — only use for content whose author is fully trusted (e.g. CMS/course-authoring
   * roles), never for end-user-submitted text.
   */
  trustHtml(value: string | null | undefined): SafeHtml | null {
    if (!value) {
      return null
    }
    return this.sanitizer.bypassSecurityTrustHtml(value)
  }

  // Only raster formats, and only base64-encoded — excludes svg+xml (can embed <script>)
  // and excludes non-base64 data: URIs (which could carry literal markup/JS as text).
  private static readonly SAFE_DATA_IMAGE = /^data:image\/(png|jpe?g|gif|webp);base64,/i

  // Wider set, permitted ONLY by trustImageSrc() — see the rationale there. svg+xml and
  // non-base64 payloads are included because <img> rendering is script-free by spec.
  private static readonly SAFE_IMG_SRC = /^data:image\/(png|jpe?g|gif|webp|svg\+xml)[;,]/i

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
