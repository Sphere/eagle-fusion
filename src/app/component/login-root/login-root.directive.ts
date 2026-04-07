import { Directive, ViewContainerRef } from '@angular/core'

@Directive({
    standalone: false,
    selector: '[wsLoginRoot]',
    
})
export class LoginRootDirective {

  constructor(
    public viewContainerRef: ViewContainerRef,
  ) { }

}
