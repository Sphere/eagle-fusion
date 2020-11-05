import { Directive, ViewContainerRef } from '@angular/core'

@Directive({
  selector: '[wsAppAppTocOverview]',
})
export class AppTocOverviewDirective {

  constructor(
    public viewContainerRef: ViewContainerRef,
  ) { }

}
