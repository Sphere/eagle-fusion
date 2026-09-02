import { Component, Input, OnInit } from '@angular/core'
import { ValueService } from '@ws-widget/utils/src/public-api'
import { AppTocService } from '../../../../../project/ws/app/src/lib/routes/app-toc/services/app-toc.service'
import { takeUntil } from 'rxjs/operators'
import { Subject } from 'rxjs'
import { get } from 'lodash'
@Component({
  standalone: false,
  selector: 'ws-public-license',
  templateUrl: './public-license.component.html',
  styleUrls: ['./public-license.component.scss'],
  providers: [AppTocService],

})
export class PublicLicenseComponent implements OnInit {
  isXSmall = false
  loadLicense = true
  @Input() currentLicenseData: any
  /*
* to unsubscribe the observable
*/
  public unsubscribe = new Subject<void>()
  constructor(private readonly valueSvc: ValueService,
    private readonly tocSvc: AppTocService
  ) {
  }

  ngOnInit() {
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      this.isXSmall = isXSmall
    })

    this.tocSvc.showComponent$.pipe(takeUntil(this.unsubscribe)).subscribe(item => {
      if (item && !get(item, 'showComponent')) {
        this.loadLicense = item.showComponent
      } else {
        this.loadLicense = true
      }
    })

  }
}
