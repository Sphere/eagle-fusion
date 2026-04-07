import { Component, effect, Input, OnInit } from '@angular/core'
import { ValueService } from '../../../../library/ws-widget/utils/src/public-api'
@Component({
    standalone: false,
    selector: 'ws-web-trusted-by-page',
    templateUrl: './web-trusted-by-page.component.html',
    styleUrls: ['./web-trusted-by-page.component.scss'],
    
})
export class WebTrustedByPageComponent implements OnInit {
  @Input() config: any
  isXsmall = false
  constructor(
    private valueSvc: ValueService
  ) {
    effect(() => {
      this.isXsmall = this.valueSvc.isMobile() ? true : false
    })
  }

  ngOnInit() {
  }

}
