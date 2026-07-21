import { Component, effect, Input } from '@angular/core'
import { ValueService } from '../../../../library/ws-widget/utils/src/public-api'
import { ThemeService } from '../../services/theme.service'
@Component({
  standalone: false,
  selector: 'ws-web-trusted-by-page',
  templateUrl: './web-trusted-by-page.component.html',
  styleUrls: ['./web-trusted-by-page.component.scss'],

})
export class WebTrustedByPageComponent {
  @Input() config: any
  isXsmall = false
  isDark: boolean
  constructor(
    private readonly valueSvc: ValueService,
    private readonly themeSvc: ThemeService
  ) {
    effect(() => {
      this.isXsmall = this.valueSvc.isMobile() ? true : false
      this.isDark = this.themeSvc.isDark()
    })
  }
}
