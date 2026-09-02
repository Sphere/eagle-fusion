import { ChangeDetectorRef, Component, OnInit, OnDestroy, Input, Inject, PLATFORM_ID } from '@angular/core'
import { isPlatformBrowser } from '@angular/common'

import { Subject } from 'rxjs'

import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { ActivatedRoute } from '@angular/router'
import { WidgetContentService } from '@ws-widget/collection'

@Component({
    standalone: false,
    selector: 'ws-public-toc-overview',
    templateUrl: './public-toc-overview.component.html',
    styleUrls: ['./public-toc-overview.component.scss'],
    
})
export class PublicTocOverviewComponent implements OnInit, OnDestroy {
  /*
* to unsubscribe the observable
*/
  @Input() tocData: any
  public unsubscribe = new Subject<void>()
  content: any
  tocConfig: any = null
  currentLicenseData: any
  licenseName: any
  license = 'CC BY'
  constructor(
    private readonly http: HttpClient,
    private readonly route: ActivatedRoute,
    private readonly widgetContentSvc: WidgetContentService,
    private readonly cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) { }

  ngOnInit() {
    if (this.tocData) {
      this.content = this.tocData
    }
    if (isPlatformBrowser(this.platformId) && localStorage.getItem('tocData')) {
      const data: any = localStorage.getItem('tocData')
      this.content = JSON.parse(data)
    }
    this.fetchTocConfig()

    this.route.queryParams.subscribe(params => {
      this.licenseName = params['license'] || this.license
      this.getLicenseConfig()
    })
  }
  fetchTocConfig() {
    this.http.get('fusion-assets/files/toc.json').pipe().subscribe((res: any) => {
      this.tocConfig = res
    })
  }

  getLicenseConfig() {
    const licenseurl = '/fusion-assets/files/license.meta.json'
    this.widgetContentSvc.fetchConfig(licenseurl).subscribe(data => {
      const licenseData = data
      if (licenseData) {
        this.currentLicenseData = licenseData.licenses.filter((license: any) => license.licenseName === this.licenseName)
        this.cdr.markForCheck()
      }
    },
      (err: HttpErrorResponse) => {
        if (err.status === 404) {
          this.getLicenseConfig()
        }
      })
  }

  ngOnDestroy() {
    this.unsubscribe.next()
    this.unsubscribe.complete()
  }
}
