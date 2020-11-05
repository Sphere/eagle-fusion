import { Directive, ViewContainerRef } from '@angular/core'

@Directive({
  selector: '[wsAppAppTocCohorts]',
})
export class AppTocCohortsDirective {

  constructor(
    public viewContainerRef: ViewContainerRef,
  ) { }

}
