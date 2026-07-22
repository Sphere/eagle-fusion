
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
import { SeoService } from '../../../services/seo.service'
import { UserAgentResolverService } from '../../../services/user-agent.service'
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
    private readonly configSvc: ConfigurationsService,
    private readonly router: Router,
    private readonly valueSvc: ValueService,
    private readonly snackBar: MatSnackBar,
    private readonly seoSvc: SeoService,
    private readonly userAgentSvc: UserAgentResolverService,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {
    super()
    effect(() => {
      this.isXSmall = this.valueSvc.isMobile() ? true : false
    })
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId) && localStorage.getItem('orgValue') === 'nhsrc') {
      this.router.navigateByUrl('/public/organisations/home')
    }

    if (this.configSvc.instanceConfig && this.configSvc.userProfile !== null) {
      this.router.navigate(['/page/home'])
    }

    this.seoSvc.update({
      title: 'Free Online Courses for Nurses in India | INC Certified | Aastrika Sphere',
      description: 'Earn CNE points with 500+ free INC-certified online courses for nurses, ANMs, GNMs, midwives and healthcare workers across India. Maternal health, newborn care, and more — in Hindi and English.',
      keywords: 'free nursing courses online India, INC certified courses, CNE points online, free courses for nurses India, ANM GNM courses online, healthcare training online India, maternal health courses nurses, free courses for healthcare workers',
      canonicalUrl: 'https://sphere.aastrika.org/public/home',
      ogType: 'website',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'Aastrika Sphere',
        'url': 'https://sphere.aastrika.org',
        'description': 'Free INC-certified online courses for nurses, ANMs, GNMs, midwives and healthcare workers across India.',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': 'https://sphere.aastrika.org/app/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
    })
    if (!isPlatformBrowser(this.platformId)) { return }

    this.userAgentSvc.requestGeolocation()

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
