import { Component, Input, OnInit } from '@angular/core'
// import { ActivatedRoute } from '@angular/router'
// import { WidgetContentService } from '@ws-widget/collection'
import { ValueService } from '@ws-widget/utils/src/public-api'
import { AppTocService } from '../../../../../project/ws/app/src/lib/routes/app-toc/services/app-toc.service'
import { takeUntil } from 'rxjs/operators'
import { Subject } from 'rxjs'
import * as _ from 'lodash'
@Component({
  selector: 'ws-public-license',
  templateUrl: './public-license.component.html',
  styleUrls: ['./public-license.component.scss']
})
export class PublicLicenseComponent implements OnInit {
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
    private tocSvc: AppTocService
  ) {
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      this.isXSmall = isXSmall
    })
  }

  ngOnInit() {

    this.tocSvc.showComponent$.pipe(takeUntil(this.unsubscribe)).subscribe(item => {
      if (item && !_.get(item, 'showComponent')) {
        this.loadLicense = item.showComponent
      } else {
        this.loadLicense = true
      }
    })

  }
}

