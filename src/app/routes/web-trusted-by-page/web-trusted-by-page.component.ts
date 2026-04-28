import { Component, effect, Input, OnInit } from '@angular/core'
import { ValueService } from '../../../../library/ws-widget/utils/src/public-api'
import { ThemeService } from '../../services/theme.service'
@Component({
  standalone: false,
  selector: 'ws-web-trusted-by-page',
  templateUrl: './web-trusted-by-page.component.html',
  styleUrls: ['./web-trusted-by-page.component.scss'],

})
export class WebTrustedByPageComponent implements OnInit {
  @Input() config: any
  isXsmall = false
  isDark: boolean
  constructor(
    private valueSvc: ValueService,
    private themeSvc: ThemeService
  ) {
    effect(() => {
      this.isXsmall = this.valueSvc.isMobile() ? true : false
      this.isDark = this.themeSvc.isDark()
    })
  }

  ngOnInit() {
  }

}
