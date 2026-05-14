
import {
  Component,
  OnInit,
  Input,
  effect,
  Inject,
  PLATFORM_ID,
} from '@angular/core'
import { isPlatformBrowser } from '@angular/common'
import { Router } from '@angular/router'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { ConfigurationsService, NsPage, ValueService } from '@ws-widget/utils'
@Component({
    standalone: false,
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
    private snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    super()
    if (isPlatformBrowser(this.platformId) && localStorage.getItem('orgValue') === 'nhsrc') {
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
    if (!isPlatformBrowser(this.platformId)) { return }

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

    const mncError = sessionStorage.getItem('mnc_error')
    if (mncError) {
      sessionStorage.removeItem('mnc_error')
      this.snackBar.open(mncError, 'OK', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['mnc-error-snackbar'],
      })
    }
  }
}
