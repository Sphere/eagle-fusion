import { Directive, HostListener, OnInit } from '@angular/core'
import { ValueService } from '@ws-widget/utils'

@Directive({
    standalone: false,
    selector: '[wsAppRetainScroll]',

})
export class RetainScrollDirective implements OnInit {
  currentPosition = 0
  isXSmall = false

  constructor(private readonly valueSvc: ValueService) {
  }

  ngOnInit() {
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
        },         0)
      } else {
        window.scrollTo(0, this.currentPosition)
      }
    } else {
      window.scrollTo(0, 600)
    }
  }
}
