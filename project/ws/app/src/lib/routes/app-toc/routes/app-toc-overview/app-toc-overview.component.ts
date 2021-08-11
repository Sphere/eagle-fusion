import { Component, OnInit, ComponentFactoryResolver, ViewChild } from '@angular/core'
import { AppTocOverviewDirective } from './app-toc-overview.directive'
import { AppTocOverviewService } from './app-toc-overview.service'
import { AwsAnalyticsService } from '../../../../../../../viewer/src/lib/aws-analytics.service'
import { ConfigurationsService } from '../../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'

@Component({
  selector: 'ws-app-app-toc-overview-root',
  templateUrl: './app-toc-overview.component.html',
  styleUrls: ['./app-toc-overview.component.scss'],
})
export class AppTocOverviewComponent implements OnInit {

  @ViewChild(AppTocOverviewDirective, { static: true }) wsAppAppTocOverview!: AppTocOverviewDirective
  userEmail: any

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appTocSvc: AppTocOverviewService,
    private awsAnalyticsService: AwsAnalyticsService,
    private configSvc: ConfigurationsService
  ) { }

  loadComponent() {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.appTocSvc.getComponent())
    const viewContainerRef = this.wsAppAppTocOverview.viewContainerRef
    viewContainerRef.clear()
    viewContainerRef.createComponent(componentFactory)

    if (this.configSvc.userProfile) {
      this.userEmail = this.configSvc.userProfile.email
    }
    this.awsAnalyticsService.awsAnlyticsService('View-course')
  }

  ngOnInit() {
    this.loadComponent()
  }

}
