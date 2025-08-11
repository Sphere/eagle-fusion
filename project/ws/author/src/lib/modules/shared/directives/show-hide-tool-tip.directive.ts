import { Directive, ElementRef, AfterViewInit } from '@angular/core'
import { MatLegacyTooltip as MatTooltip } from '@angular/material/legacy-tooltip'

@Directive({
  selector: '[matTooltip][wsAuthShowHideToolTip]',
})
export class ShowHideToolTipDirective implements AfterViewInit {
  constructor(private matTooltip: MatTooltip, private elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    // Wait for DOM update
    setTimeout(() => {
      const element = this.elementRef.nativeElement
      this.matTooltip.disabled = element.scrollWidth <= element.clientWidth
    })
  }
}
