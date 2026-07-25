import { Pipe, PipeTransform } from '@angular/core'
import { DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl } from '@angular/platform-browser'

@Pipe({
    standalone: false,
    name: 'pipeSafeSanitizer',
    
})
// Reserved for CMS/content-author-authored strings (T&C pages, About page copy, authoring-tool
// iframe URLs) — never bind this to end-user-submitted text. Verified call sites: see usages of
// `| pipeSafeSanitizer` across the repo.
export class PipeSafeSanitizerPipe implements PipeTransform {

  constructor(protected sanitizer: DomSanitizer) { }
  public transform(
    value: string,
    type = 'html',
  ): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl {
    switch (type) {
      case 'html':
        return this.sanitizer.bypassSecurityTrustHtml(value)
      case 'style':
        return this.sanitizer.bypassSecurityTrustStyle(value)
      case 'script':
        return this.sanitizer.bypassSecurityTrustScript(value)
      case 'url':
        return this.sanitizer.bypassSecurityTrustUrl(value)
      case 'resourceUrl':
        return this.sanitizer.bypassSecurityTrustResourceUrl(value)
      default:
        throw new Error(`Invalid safe type specified: ${type}`)
    }
  }

}
