import { Component, OnInit, ComponentFactoryResolver, ViewChild } from '@angular/core'
import { AppTocHomeDirective } from './app-toc-home.directive'
import { AppTocHomeService } from './app-toc-home.service'
import { Router } from '@angular/router'
import { HttpClient } from '@angular/common/http'

@Component({
  selector: 'ws-app-app-toc-home-root',
  templateUrl: './app-toc-home.component.html',
  styleUrls: ['./app-toc-home.component.scss'],
})
export class AppTocHomeComponent implements OnInit {
  @ViewChild(AppTocHomeDirective, { static: true }) wsAppAppTocHome!: AppTocHomeDirective

  mappingUrl = '/fusion-assets/files/mapping.json'
  mapping: any = []

  constructor(
    private http: HttpClient,
    private router: Router,
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
    const targetUrl = this.router.url
    const urlParams = targetUrl.split('/')
    const courseId = urlParams[3].split('_')
    if (courseId[0] === 'lex') {
      this.http.get(this.mappingUrl).subscribe((course: any) => {
        const courseNewId = course.find((data: { EagleID: string }) => data.EagleID === urlParams[3]).SunbirdID
        location.href = `/app/toc/${courseNewId}/overview`
      })
    }
    this.loadComponent()
  }
}
