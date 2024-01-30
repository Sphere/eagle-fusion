import { Directive, HostListener, Output, EventEmitter } from '@angular/core'

@Directive({
  selector: '[appScrollDetector]'
})
export class ScrollDetectorDirective {
  @Output() scrolled = new EventEmitter<boolean>();


  @HostListener('scroll', ['$event'])
  onScroll(event: Event): void {
    const element = event.target as HTMLElement
    const isScrolled = element.scrollHeight - element.scrollTop === element.clientHeight
    console.log(isScrolled)
    // Emit the event indicating whether the user has scrolled
    if (isScrolled) {
      this.scrolled.emit(isScrolled)
    }
  }
}
