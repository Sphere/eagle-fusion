import { Component, OnInit, ComponentFactoryResolver, ViewChild } from '@angular/core'
import { AnalyticsDirective } from './analytics.directive'
import { AnalyticsService } from './analytics.service'

@Component({
  selector: 'ws-analytics-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
})
export class AnalyticsComponent implements OnInit {
  @ViewChild(AnalyticsDirective, { static: true }) wsAnalyticsAnalytics!: AnalyticsDirective

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private analyticsSvc: AnalyticsService,
  ) { }

  loadComponent() {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.analyticsSvc.getComponent())
    const viewContainerRef = this.wsAnalyticsAnalytics.viewContainerRef
    viewContainerRef.clear()
    viewContainerRef.createComponent(componentFactory)
  }

  ngOnInit() {
    this.loadComponent()
  }

}
