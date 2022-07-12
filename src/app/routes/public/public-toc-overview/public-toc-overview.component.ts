import { Component, OnInit, OnDestroy } from '@angular/core'

import { Subject } from 'rxjs'

import * as _ from 'lodash'
// import { takeUntil } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http'
import { ActivatedRoute } from '@angular/router'
import { WidgetContentService } from '@ws-widget/collection'
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/public-api'
import { HttpErrorResponse } from '@angular/common/http'


@Component({
  selector: 'ws-public-toc-overview',
  templateUrl: './public-toc-overview.component.html',
  styleUrls: ['./public-toc-overview.component.scss']
})
export class PublicTocOverviewComponent implements OnInit, OnDestroy {
  /*
* to unsubscribe the observable
*/
  public unsubscribe = new Subject<void>()
  content: any
  tocConfig: any = null
  currentLicenseData: any
  licenseName: any
  license = 'CC BY';
  constructor(

    private http: HttpClient,
    private route: ActivatedRoute,
    private widgetContentSvc: WidgetContentService,
    private configSvc: ConfigurationsService,) { }

  ngOnInit() {
    if (localStorage.getItem('tocData')) {
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
    this.http.get('assets/configurations/feature/toc.json').pipe().subscribe((res: any) => {
      console.log(res)
      this.tocConfig = res
    })
  }

  getLicenseConfig() {
    const licenseurl = `${this.configSvc.sitePath}/license.meta.json`
    this.widgetContentSvc.fetchConfig(licenseurl).subscribe(data => {
      const licenseData = data
      if (licenseData) {
        this.currentLicenseData = licenseData.licenses.filter((license: any) => license.licenseName === this.licenseName)
        console.log(this.currentLicenseData)
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
