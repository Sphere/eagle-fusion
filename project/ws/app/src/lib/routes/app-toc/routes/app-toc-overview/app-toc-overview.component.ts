import { Component, OnInit, ComponentFactoryResolver, ViewChild } from '@angular/core'
import { AppTocOverviewDirective } from './app-toc-overview.directive'
import { AppTocOverviewService } from './app-toc-overview.service'

@Component({
  selector: 'ws-app-app-toc-overview-root',
  templateUrl: './app-toc-overview.component.html',
  styleUrls: ['./app-toc-overview.component.scss'],
})
export class AppTocOverviewComponent implements OnInit {

  @ViewChild(AppTocOverviewDirective, { static: true }) wsAppAppTocOverview!: AppTocOverviewDirective

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appTocSvc: AppTocOverviewService,
  ) { }

  loadComponent() {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.appTocSvc.getComponent())
    const viewContainerRef = this.wsAppAppTocOverview.viewContainerRef
    viewContainerRef.clear()
    viewContainerRef.createComponent(componentFactory)
  }

  ngOnInit() {
    this.loadComponent()
  }

}
