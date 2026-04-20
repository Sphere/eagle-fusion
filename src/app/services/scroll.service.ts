import { Injectable, EventEmitter } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class ScrollService {
  scrollToDivEvent: EventEmitter<string> = new EventEmitter<string>()

  constructor() { }
  scrollToElement(element: HTMLElement) {
    if (element) {
      const rect = element.getBoundingClientRect()
      const scrollTop = window.scrollY + rect.top - 80
      window.scrollTo({ top: scrollTop, behavior: 'smooth' })
    }
  }
}
