import { Directive, OnChanges, Input, HostBinding, HostListener } from '@angular/core'

@Directive({
  selector: '[wsUtilsNavigation]',
})
export class NavigationDirective implements OnChanges {
  @Input() wsUtilsNavigation = ''
  @Input() openInNewTab = false
  @Input()
  @HostBinding('attr.routerLink') routeUrl = ''
  @HostListener('mousedown', ['$event']) onMouseEnter($event: Event) {
    if (this.openInNewTab || this.wsUtilsNavigation.includes('mailto')) {
      $event.preventDefault()
      $event.stopPropagation()
      this.routeUrl = './'
      window.open(this.wsUtilsNavigation)
    }
  }
  constructor() { }

  ngOnChanges() {
    if (this.openInNewTab || this.wsUtilsNavigation.includes('mailto')) {
      this.routeUrl = './'
    }
  }

}
