import { Directive, HostListener } from '@angular/core'
import { ValueService } from '../../services/value.service'

@Directive({
  selector: '[wsUtilsRetain]',
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
    const scrollHeight = document.getElementById('scroll-height')
    console.log(scrollHeight)
    if (scrollHeight) {
      setTimeout(() => {
        scrollHeight.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 0)
    }
    else {
      window.scrollTo(0, window.outerHeight)
    }
  }
}
