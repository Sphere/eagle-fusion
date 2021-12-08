import { Directive, Input, ViewContainerRef, OnChanges } from '@angular/core'
import { ConfigurationsService } from '@ws-widget/utils'
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
    // private logger: LoggerService,
    private configSvc: ConfigurationsService,
  ) { }

  ngOnChanges() {
    const url = window.location.href
    // if (url.indexOf('login') < 0 && url.indexOf('explore') < 0) {
    //   if (!this.widgetResolverSvc.isInitialized) {
    //     this.logger.error(
    //       'Widgets Registration Not Done. Used Before Initialization.',
    //       this.wsResolverWidget,
    //     )
    //     return
    //   }
    // }
    if (url.indexOf('/public/home') > 0) {
      if (!this.widgetResolverSvc.isInitialized) {
        this.widgetResolverSvc.initialize(this.configSvc.restrictedWidgets,
                                          this.configSvc.userRoles,
                                          this.configSvc.userGroups,
                                          this.configSvc.restrictedFeatures)
        if (this.wsResolverWidget) {
          const compRef = this.widgetResolverSvc.resolveWidget(
            this.wsResolverWidget,
            this.viewContainerRef,
          )
          if (compRef) {
            compRef.changeDetectorRef.detectChanges()
          }
        }
      } else {
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
    } else {
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
