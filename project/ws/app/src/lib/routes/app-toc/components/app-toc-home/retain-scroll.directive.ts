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
    const matNav = document.getElementById('mat-nav')
    if (matNav && this.isXSmall) {
      if (this.currentPosition === 0) {
        setTimeout(() => {
          matNav.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        }, 0)
      } else {
        window.scrollTo(0, this.currentPosition)
      }
    } else {
      window.scrollTo(0, 600)
    }
  }
}
