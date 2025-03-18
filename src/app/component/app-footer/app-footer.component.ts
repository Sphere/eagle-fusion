import { Component, Input } from '@angular/core'
import { ConfigurationsService, ValueService } from '@ws-widget/utils'
import { SafeUrl, DomSanitizer } from '@angular/platform-browser'
import { Router } from '@angular/router'

@Component({
  selector: 'ws-app-footer',
  templateUrl: './app-footer.component.html',
  styleUrls: ['./app-footer.component.scss'],
})
export class AppFooterComponent {
  isXSmall = false
  termsOfUser = true
  appIcon: SafeUrl | null = null
  isMedium = false
  currentYear = new Date().getFullYear()
  isLoggedIn = false
  @Input() isEkshamata: any

  constructor(
    public configSvc: ConfigurationsService,
    private valueSvc: ValueService,
    private domSanitizer: DomSanitizer,
    private router: Router,
  ) {
    if (this.configSvc.restrictedFeatures?.has('termsOfUser')) {
      this.termsOfUser = false
    }
    this.valueSvc.isXSmall$.subscribe(isXSmall => this.isXSmall = isXSmall)
    this.valueSvc.isLtMedium$.subscribe(isMedium => this.isMedium = isMedium)

    if (this.configSvc.instanceConfig) {
      this.appIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
        this.configSvc.instanceConfig.logos.app,
      )
    }
    this.isLoggedIn = !!this.configSvc.userProfile
  }

  ngOnInit() {
    this.appIcon = this.isEkshamata
      ? "/fusion-assets/images/aastrika-foundation-logo.svg"
      : "/fusion-assets/images/sphere-new-logo.svg"
  }

  langRedirect(lang: string) {
    if (!lang) return

    const currentUrl = this.router.url.replace(/^\/hi\//, '/')
    this.router.navigateByUrl(`/${lang}${currentUrl}`)
  }

  async redirect(text: string) {
    const userPreferences = this.configSvc.unMappedUser?.profileDetails?.preferences
    const local = userPreferences?.language ?? (this.router.url.includes('/hi/') ? 'hi' : 'en')
    const urlPrefix = local === 'hi' ? 'hi' : ''

    console.log(urlPrefix, text)

    const routes: Record<string, string> = {
      home: '/page/home',
      mycourses: '/app/user/my_courses',
      competency: '/app/user/competency',
      default: '/app/profile-view'
    }

    if (text === 'competency') {
      localStorage.setItem('isOnlyPassbook', JSON.stringify(false))
    }

    const route = routes[text] ?? routes.default
    this.router.navigateByUrl(`/${urlPrefix}${route}`)
  }

  createAcct() {
    this.router.navigateByUrl('/app/create-account')
  }
}
