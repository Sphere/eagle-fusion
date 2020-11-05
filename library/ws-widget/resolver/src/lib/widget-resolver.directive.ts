import { Directive, Input, ViewContainerRef, OnChanges } from '@angular/core'
import { LoggerService } from '@ws-widget/utils'
import { NsWidgetResolver } from './widget-resolver.model'
import { WidgetResolverService } from './widget-resolver.service'

@Directive({
  selector: '[wsResolverWidget]',
})
export class WidgetResolverDirective implements OnChanges {
  @Input() wsResolverWidget: NsWidgetResolver.IRenderConfigWithAnyData | null = null
  constructor(
    private viewContainerRef: ViewContainerRef,
    private widgetResolverSvc: WidgetResolverService,
    private logger: LoggerService,
  ) { }

  ngOnChanges() {
    const url = window.location.href
    if (url.indexOf('login') < 0) {
      if (!this.widgetResolverSvc.isInitialized) {
        this.logger.error(
          'Widgets Registration Not Done. Used Before Initialization.',
          this.wsResolverWidget,
        )
        return
      }
      if (this.wsResolverWidget) {
        const compRef = this.widgetResolverSvc.resolveWidget(
          this.wsResolverWidget,
          this.viewContainerRef,
        )
        if (compRef) {
          compRef.changeDetectorRef.detectChanges()
        }
      }
    }
  }
}
