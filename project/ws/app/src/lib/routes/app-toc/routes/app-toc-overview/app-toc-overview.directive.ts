import { Directive, ViewContainerRef } from '@angular/core'

@Directive({
    standalone: false,
    selector: '[wsAppAppTocOverview]',
    
})
export class AppTocOverviewDirective {

  constructor(
    public viewContainerRef: ViewContainerRef,
  ) { }

}
