import { Directive, ViewContainerRef } from '@angular/core'

@Directive({
  selector: '[wsLoginRoot]',
})
export class LoginRootDirective {

  constructor(
    public viewContainerRef: ViewContainerRef,
  ) { }

}
