import { Injectable } from '@angular/core'
import { PathLocationStrategy } from '@angular/common'

/**
 * Keeps the trailing slash on public (prerendered) URLs.
 *
 * Each public page is prerendered as `<route>/index.html`, so the server 301s the
 * slash-less form to `<route>/`. Angular's router never writes a trailing slash: on
 * first load it replaceState()s `/…/slug/` to `/…/slug`, and every routerLink href is
 * slash-less. Google renders the JS, follows the rewritten URL into the 301 and reports
 * the page as "Page with redirect" instead of indexing it.
 *
 * Only `/public/` paths are touched. Angular's own TrailingSlashPathLocationStrategy
 * would also rewrite `/app/…`, where code reads window.location directly.
 */
@Injectable()
export class PublicTrailingSlashLocationStrategy extends PathLocationStrategy {
  override prepareExternalUrl(internal: string): string {
    return super.prepareExternalUrl(withPublicTrailingSlash(internal))
  }
}

export function withPublicTrailingSlash(url: string): string {
  const pathEnd = url.search(/[?#]/)
  const path = pathEnd > -1 ? url.slice(0, pathEnd) : url
  const rest = pathEnd > -1 ? url.slice(pathEnd) : ''
  const lastSegment = path.slice(path.lastIndexOf('/') + 1)

  if (!path.startsWith('/public/') || path.endsWith('/') || lastSegment.includes('.')) {
    return url
  }
  return `${path}/${rest}`
}
