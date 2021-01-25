import { Directive, Input, ViewContainerRef, OnChanges } from '@angular/core'
import { LoggerService } from '@ws-widget/utils'
import { NsWidgetResolver } from './widget-resolver.model'
import { ExploreResolverService } from './explore-resolver.service'

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[wsExploreResolverWidget]',
})
export class ExploreResolverDirective implements OnChanges {
  @Input() wsExploreResolverWidget: NsWidgetResolver.IRenderConfigWithAnyData | null = null
  constructor(
    private viewContainerRef: ViewContainerRef,
    private exploreResolverSvc: ExploreResolverService,
    private logger: LoggerService,
  ) { }

  ngOnChanges() {
    if (!this.exploreResolverSvc.isInitialized) {
      this.logger.error(
        'Widgets Registration Not Done. Used Before Initialization.',
        this.wsExploreResolverWidget,
      )
      return
    }
    if (this.wsExploreResolverWidget) {
      const compRef = this.exploreResolverSvc.exploreResolveWidget(
        this.wsExploreResolverWidget,
        this.viewContainerRef,
      )
      if (compRef) {
        compRef.changeDetectorRef.detectChanges()
      }
    }
  }
}
