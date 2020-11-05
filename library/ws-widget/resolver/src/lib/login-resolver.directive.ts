import { Directive, Input, ViewContainerRef, OnChanges } from '@angular/core'
import { LoggerService } from '@ws-widget/utils'
import { NsWidgetResolver } from './widget-resolver.model'
import { LoginResolverService } from './login-resolver.service'

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[wsLoginResolverWidget]',
})
export class LoginResolverDirective implements OnChanges {
  @Input() wsLoginResolverWidget: NsWidgetResolver.IRenderConfigWithAnyData | null = null
  constructor(
    private viewContainerRef: ViewContainerRef,
    private loginResolverSvc: LoginResolverService,
    private logger: LoggerService,
  ) {}

  ngOnChanges() {
    if (!this.loginResolverSvc.isInitialized) {
      this.logger.error(
        'Widgets Registration Not Done. Used Before Initialization.',
        this.wsLoginResolverWidget,
      )
      return
    }
    if (this.wsLoginResolverWidget) {
      const compRef = this.loginResolverSvc.loginResolveWidget(
        this.wsLoginResolverWidget,
        this.viewContainerRef,
      )
      if (compRef) {
        compRef.changeDetectorRef.detectChanges()
      }
    }
  }
}
