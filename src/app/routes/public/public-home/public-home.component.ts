
import {
  Component,
  OnInit,
  Input,
  effect,
} from '@angular/core'
import { Router } from '@angular/router'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { ConfigurationsService, NsPage, ValueService } from '@ws-widget/utils'
@Component({
  selector: 'ws-public-home',
  templateUrl: './public-home.component.html',
  styleUrls: ['./public-home.component.scss'],
})
export class PublicHomeComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<NsPage.IPage | null> {
  isXSmall = false
  @Input() widgetData: NsPage.IPage | null = null
  navBackground: Partial<NsPage.INavBackground> | null = null
  links: NsWidgetResolver.IRenderConfigWithTypedData<NsPage.INavLink>[] = []
  isEkshamata = false
  constructor(
    private configSvc: ConfigurationsService,
    private router: Router,
    private valueSvc: ValueService,
  ) {
    super()
    if (localStorage.getItem('orgValue') === 'nhsrc') {
      this.router.navigateByUrl('/public/organisations/home')
    }

    if (this.configSvc.instanceConfig && this.configSvc.userProfile !== null) {
      this.router.navigate(['/page/home'])
    }
    effect(() => {
      this.isXSmall = this.valueSvc.isMobile() ? true : false
    })
  }

  ngOnInit() {
    if (window.location.hostname?.includes('ekshamata')) {
      this.isEkshamata = true
    }

    if (sessionStorage.getItem('fromOTPpage') === null && localStorage.getItem('preferedLanguage')) {
      localStorage.removeItem('preferedLanguage')
    }
    if (localStorage.getItem('url_before_login')) {
      localStorage.removeItem('url_before_login')
    }
    if (sessionStorage.getItem('academic')) {
      sessionStorage.removeItem('academic')
    }
  }
}
