// import { HttpErrorResponse } from '@angular/common/http'
import { Component, Input, OnInit } from '@angular/core'
// import { ActivatedRoute } from '@angular/router'
// import { WidgetContentService } from '@ws-widget/collection'
import { ValueService } from '@ws-widget/utils/src/public-api'
import { AppTocService } from '../../services/app-toc.service'
import { takeUntil } from 'rxjs/operators'
import { Subject } from 'rxjs'
import * as _ from 'lodash'
@Component({
  selector: 'ws-app-license',
  templateUrl: './license.component.html',
  styleUrls: ['./license.component.scss'],
})
export class LicenseComponent implements OnInit {
  isXSmall = false
  // licenseName: any
  // currentLicenseData: any
  loadLicense = true
  @Input() currentLicenseData: any
  /*
* to unsubscribe the observable
*/
  public unsubscribe = new Subject<void>()
  constructor(private valueSvc: ValueService,
    // private route: ActivatedRoute,
    //private configSvc: ConfigurationsService,
    // private widgetContentSvc: WidgetContentService,
    private tocSvc: AppTocService
  ) {
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      this.isXSmall = isXSmall
    })
  }

  ngOnInit() {
    console.log(this.currentLicenseData)

    // this.route.queryParams.subscribe(params => {
    //   this.licenseName = params['license']
    //   this.getLicenseConfig()
    // })
    this.tocSvc.showComponent$.pipe(takeUntil(this.unsubscribe)).subscribe(item => {
      if (item && !_.get(item, 'showComponent')) {
        this.loadLicense = item.showComponent
      } else {
        this.loadLicense = true
      }
    })

  }

  // getLicenseConfig() {
  //   const licenseurl = `${this.configSvc.sitePath}/license.meta.json`
  //   this.widgetContentSvc.fetchConfig(licenseurl).subscribe(data => {
  //     const licenseData = data
  //     if (licenseData) {
  //       this.currentLicenseData = licenseData.licenses.filter((license: any) => license.licenseName === this.licenseName)
  //     }
  //   },
  //     (err: HttpErrorResponse) => {
  //       if (err.status === 404) {
  //         this.getLicenseConfig()
  //       }
  //     })
  // }
}
