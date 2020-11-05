import { Directive, ViewContainerRef } from '@angular/core'

@Directive({
  selector: '[wsAppAppTocHome]',
})
export class AppTocHomeDirective {

  constructor(
    public viewContainerRef: ViewContainerRef,
  ) { }

}
