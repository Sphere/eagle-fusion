import { Directive, ViewContainerRef } from '@angular/core'

@Directive({
  selector: '[wsAnalyticsAnalytics]',
})
export class AnalyticsDirective {

  constructor(
    public viewContainerRef: ViewContainerRef,
  ) { }

}
