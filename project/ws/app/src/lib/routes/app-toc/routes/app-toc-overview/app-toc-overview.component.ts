import { Component, OnInit, ViewChild, Input } from '@angular/core'
import { AppTocOverviewDirective } from './app-toc-overview.directive'
import { AccessControlService } from '@ws/author'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { ActivatedRoute, Data, Router } from '@angular/router'
import { NsContent } from '@ws-widget/collection'
import { Observable, Subscription } from 'rxjs'
import { NsAppToc } from '../../models/app-toc.model'
import { AppTocService } from '../../services/app-toc.service'

@Component({
  selector: 'ws-app-app-toc-overview-root',
  templateUrl: './app-toc-overview.component.html',
  styleUrls: ['./app-toc-overview.component.scss'],
})
export class AppTocOverviewComponent implements OnInit {

  @ViewChild(AppTocOverviewDirective, { static: true }) wsAppAppTocOverview!: AppTocOverviewDirective
  content: NsContent.IContent | null = null
  routeSubscription: Subscription | null = null
  tocStructure: NsAppToc.ITocStructure | null = null
  trainingLHubCount$?: Observable<number>
  body: SafeHtml | null = null
  @Input() forPreview = false
  tocConfig: any = null
  contentParents: { [key: string]: NsAppToc.IContentParentResponse[] } = {}
  objKeys = Object.keys

  constructor(
    private route: ActivatedRoute,
    private tocSharedSvc: AppTocService,
    private domSanitizer: DomSanitizer,
    private authAccessControlSvc: AccessControlService,
    private router: Router,
  ) { }

  // loadComponent() {
  //   const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.appTocSvc.getComponent())
  //   const viewContainerRef = this.wsAppAppTocOverview.viewContainerRef
  //   viewContainerRef.clear()
  //   viewContainerRef.createComponent(componentFactory)
  // }

  ngOnInit() {
    // this.loadComponent()
    if (!this.forPreview) {
      this.forPreview = window.location.href.includes('/author/')
    }
    if (this.route && this.route.parent) {
      this.routeSubscription = this.route.parent.data.subscribe((data: Data) => {
        this.initData(data)
        this.tocConfig = data.pageData.data
      })
    }
  }

  get showSubtitleOnBanner() {
    return this.tocSharedSvc.subtitleOnBanners
  }
  get showDescription() {
    if (this.content && !this.content.body) {
      return true
    }
    return this.tocSharedSvc.showDescription
  }
  private initData(data: Data) {
    const initData = this.tocSharedSvc.initData(data)
    this.content = initData.content
    this.body = this.domSanitizer.bypassSecurityTrustHtml(
      this.content && this.content.body
        ? this.forPreview
          ? this.authAccessControlSvc.proxyToAuthoringUrl(this.content.body)
          : this.content.body
        : '',
    )
    this.contentParents = {}
  }

  goToProfile(id: string) {
    this.router.navigate(['/app/person-profile'], { queryParams: { userId: id } })
  }
}
