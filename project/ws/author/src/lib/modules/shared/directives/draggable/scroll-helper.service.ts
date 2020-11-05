import { Injectable, ElementRef } from '@angular/core'

@Injectable()
export class ScrollHelperService {

  private DEFAULT_SCROLLSPEED = 50

  constructor() { }

  scrollIfNecessary(elementRef: ElementRef, event: any) {
    const rect = elementRef.nativeElement.getBoundingClientRect()
    const rightScroll = Math.floor(rect.right - event.pageX)
    const leftScroll = Math.floor(rect.left - event.pageX)
    // var y = Math.floor(rect.top - event.pageY)
    if (rightScroll < this.DEFAULT_SCROLLSPEED) {
      elementRef.nativeElement.children[0].children[1].scrollBy({
        left: this.DEFAULT_SCROLLSPEED,
        behavior: 'smooth',
      })
    } else if (leftScroll < this.DEFAULT_SCROLLSPEED) {
      elementRef.nativeElement.children[0].children[1].scrollBy({
        left: - this.DEFAULT_SCROLLSPEED,
        behavior: 'smooth',
      })
    }
  }
}
