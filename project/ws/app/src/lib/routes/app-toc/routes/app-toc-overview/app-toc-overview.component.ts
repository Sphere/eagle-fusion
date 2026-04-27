import { Component, OnInit, ViewChild, Input, OnDestroy } from '@angular/core'
import { AppTocOverviewDirective } from './app-toc-overview.directive'
import { AccessControlService } from '@ws/author'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { ActivatedRoute, Data, Router } from '@angular/router'
import { NsContent, WidgetContentService } from '@ws-widget/collection'
import { Observable, Subscription, Subject } from 'rxjs'
import { NsAppToc } from '../../models/app-toc.model'
import { AppTocService } from '../../services/app-toc.service'
import { takeUntil } from 'rxjs/operators'
import { NsWidgetResolver } from '@ws-widget/resolver'

@Component({
  standalone: false,
  selector: 'ws-app-app-toc-overview-root',
  templateUrl: './app-toc-overview.component.html',
  styleUrls: ['./app-toc-overview.component.scss'],

})
export class AppTocOverviewComponent implements OnInit, OnDestroy {

  @ViewChild(AppTocOverviewDirective, { static: true }) wsAppAppTocOverview!: AppTocOverviewDirective
  content: NsContent.IContent | null = null
  routeSubscription: Subscription | null = null
  tocStructure: NsAppToc.ITocStructure | null = null
  trainingLHubCount$?: Observable<number>
  body: SafeHtml = ''
  @Input() forPreview = false
  tocConfig: any = null
  contentParents: { [key: string]: NsAppToc.IContentParentResponse[] } = {}
  objKeys = Object.keys
  public loadOverview = true
  licenseName: any
  currentLicenseData: any[] = []
  loadLicense = true
  license = 'CC BY'
  errorWidgetData: NsWidgetResolver.IRenderConfigWithTypedData<any> = {
    widgetType: 'errorResolver',
    widgetSubType: 'errorResolver',
    widgetData: {
      errorType: 'internalServer',
    },
  }
  /*
* to unsubscribe the observable
*/
  public unsubscribe = new Subject<void>()
  constructor(
    private route: ActivatedRoute,
    private tocSharedSvc: AppTocService,
    private domSanitizer: DomSanitizer,
    private authAccessControlSvc: AccessControlService,
    private router: Router,
    private widgetContentSvc: WidgetContentService
  ) {
    // this.licenseurl = `${this.configSvc.sitePath}/license.meta.json`
  }

  ngOnInit() {
    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(params => {
        this.licenseName = params['license'] || this.license
        this.getLicenseConfig()
      })

    this.route.parent?.data
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        this.initData(data)
        this.tocConfig = data.pageData.data
      })

    this.tocSharedSvc.showComponent$
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(item => {
        this.loadOverview = !(item && !item.showComponent)
      })

    if (!this.forPreview) {
      this.forPreview = window.location.href.includes('/author/')
    }
  }

  getLicenseConfig() {
    const licenseurl = '/fusion-assets/files/license.meta.json'

    this.widgetContentSvc.fetchConfig(licenseurl)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: (data) => {
          if (data?.licenses) {
            this.currentLicenseData = data.licenses.filter(
              (l: any) => l.licenseName === this.licenseName
            )
          }
        },
        error: () => {
          this.currentLicenseData = [] // fallback only
        }
      })
  }

  get showSubtitleOnBanner() {
    return this.tocSharedSvc.subtitleOnBanners
  }
  get showDescription() {
    return this.tocSharedSvc.showDescription
  }
  private initData(data: Data) {
    const initData = this.tocSharedSvc.initData(data)
    this.content = initData.content
    this.body = this.domSanitizer.bypassSecurityTrustHtml(
      this.content?.body
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
  ngOnDestroy() {
    this.unsubscribe.next()
    this.unsubscribe.complete()
  }
}
