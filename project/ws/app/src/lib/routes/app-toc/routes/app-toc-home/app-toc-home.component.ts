import { Component, OnInit, ComponentFactoryResolver, ViewChild } from '@angular/core'
import { AppTocHomeDirective } from './app-toc-home.directive'
import { AppTocHomeService } from './app-toc-home.service'
@Component({
  selector: 'ws-app-app-toc-home-root',
  templateUrl: './app-toc-home.component.html',
  styleUrls: ['./app-toc-home.component.scss'],
})
export class AppTocHomeComponent implements OnInit {
  @ViewChild(AppTocHomeDirective, { static: true }) wsAppAppTocHome!: AppTocHomeDirective

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appTocHomeSvc: AppTocHomeService,
  ) { }

  loadComponent() {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.appTocHomeSvc.getComponent())
    const viewContainerRef = this.wsAppAppTocHome.viewContainerRef
    viewContainerRef.clear()
    viewContainerRef.createComponent(componentFactory)
  }

  ngOnInit() {
    this.loadComponent()
  }

}
