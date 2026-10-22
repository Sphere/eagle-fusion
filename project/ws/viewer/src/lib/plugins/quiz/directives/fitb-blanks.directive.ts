import { AfterViewChecked, Directive, ElementRef, Input } from '@angular/core'
import { FitbQuestionHtml } from '@ws-widget/utils'

const BLANK_STYLE = 'border-style: none none solid none; border-width: 1px; padding: 8px 12px;'

/**
 * Renders the blanks of a fill-in-the-blank question. Use it next to the innerHTML binding:
 *
 *   <h3 [innerHTML]="fitbQuestion?.html" [wsFitbBlanks]="fitbQuestion"></h3>
 *
 * Angular sanitizes the markup as for any other [innerHTML]; this directive then replaces each
 * placeholder with an <input> it creates itself, so no sanitization bypass is needed. Directive
 * view hooks run before the host component's ngAfterViewInit, which looks the blanks up by id.
 * Angular resets innerHTML whenever the question changes, so the check runs on every pass and
 * returns early once no placeholder is left.
 */
@Directive({
  standalone: false,
  selector: '[wsFitbBlanks]',
})
export class FitbBlanksDirective implements AfterViewChecked {
  @Input('wsFitbBlanks') fitb: FitbQuestionHtml | null = null

  constructor(private readonly elementRef: ElementRef<HTMLElement>) { }

  ngAfterViewChecked(): void {
    this.renderBlanks()
  }

  renderBlanks(): void {
    const host = this.elementRef.nativeElement
    const fitb = this.fitb
    if (!fitb || !fitb.placeholder.test(host.textContent || '')) {
      return
    }
    const doc = host.ownerDocument
    const walker = doc.createTreeWalker(host, NodeFilter.SHOW_TEXT)
    const textNodes: Text[] = []
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode as Text)
    }
    const splitter = new RegExp(fitb.placeholder.source, 'g')
    textNodes
      .filter(node => fitb.placeholder.test(node.data))
      .forEach(node => {
        const fragment = doc.createDocumentFragment()
        // split() with a capture group alternates text, blank index, text, blank index, ...
        node.data.split(splitter).forEach((part, i) => {
          fragment.appendChild(i % 2 === 0 ? doc.createTextNode(part) : this.createBlank(doc, fitb.blankIds[Number(part)]))
        })
        node.parentNode?.replaceChild(fragment, node)
      })
  }

  private createBlank(doc: Document, id: string | undefined): HTMLInputElement {
    const input = doc.createElement('input')
    input.setAttribute('matInput', '')
    input.setAttribute('style', BLANK_STYLE)
    input.type = 'text'
    input.id = id ?? ''
    return input
  }
}
