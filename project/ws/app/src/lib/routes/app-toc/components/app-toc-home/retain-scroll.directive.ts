import { Directive, HostListener } from '@angular/core'
import { ValueService } from '@ws-widget/utils'

@Directive({
  selector: '[wsAppRetainScroll]',
})
export class RetainScrollDirective {
  currentPosition = 0
  isXSmall = false

  constructor(private valueSvc: ValueService) {
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      this.isXSmall = isXSmall
    })
  }

  @HostListener('click') clicking() {
    if (this.isXSmall) {
      const testDiv = document.getElementById('tab-bar')
      if (testDiv && this.currentPosition === 0) {
        this.currentPosition = testDiv.offsetTop
      } else {
        window.scrollTo(0, this.currentPosition)
      }
    }
  }
}
