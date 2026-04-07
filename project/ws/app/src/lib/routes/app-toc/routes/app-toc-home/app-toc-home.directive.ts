import { Directive, ViewContainerRef } from '@angular/core'

@Directive({
    standalone: false,
    selector: '[wsAppAppTocHome]',
    
})
export class AppTocHomeDirective {

  constructor(
    public viewContainerRef: ViewContainerRef,
  ) { }

}
