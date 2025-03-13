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
    if (this.configSvc.restrictedFeatures) {
      if (this.configSvc.restrictedFeatures.has('termsOfUser')) {
        this.termsOfUser = false
      }
    }
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      this.isXSmall = isXSmall
    })
    this.valueSvc.isLtMedium$.subscribe(isMedium => {
      this.isMedium = isMedium
    })
    if (this.configSvc.instanceConfig) {
      this.appIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
        this.configSvc.instanceConfig.logos.app,
      )
    }
    if (this.configSvc.userProfile) {
      this.isLoggedIn = true
    } else {
      this.isLoggedIn = false
    }
  }
  ngOnInit() {
    if (this.isEkshamata) {
      console.log("this.configSvc.instanceConfig", this.configSvc.hostedInfo)
      this.appIcon = "/fusion-assets/images/aastrika-foundation-logo.svg"
    } else {
      this.appIcon = "/fusion-assets/images/sphere-new-logo.svg"
    }
  }
  langRedirect(lang: string) {
    if (lang !== '') {
      if (this.router.url.includes('hi')) {
        const lan = this.router.url.split('hi/').join('')
        window.location.assign(`${location.origin}/${lang}${lan}`)
      } else {
        window.location.assign(`${location.origin}/${lang}${this.router.url}`)
      }
    } else {
      if (this.router.url.includes('hi')) {
        const lan = this.router.url.split('hi/').join('')
        window.location.assign(`${location.origin}${lang}${lan}`)
      } else {
        window.location.assign(`${location.origin}${lang}${this.router.url}`)
      }
    }
  }
  async redirect(text: string) {
    const userPreferences = this.configSvc.unMappedUser?.profileDetails?.preferences
    const local = userPreferences?.language ?? (location.href.includes('/hi/') ? 'hi' : 'en')
    const url1 = local === 'hi' ? 'hi' : ''
    let baseUrl = document.baseURI.replace(/hi\//g, '')

    console.log(url1, text)

    const routes: Record<string, string> = {
      home: 'page/home',
      mycourses: 'app/user/my_courses',
      competency: 'app/user/competency',
      default: 'app/profile-view'
    }

    if (text === 'competency') {
      localStorage.setItem('isOnlyPassbook', JSON.stringify(false))
    }

    const route = routes[text] ?? routes.default
    location.href = `${baseUrl}${url1}/${route}`
  }

  createAcct() {
    this.router.navigateByUrl('app/create-account')
  }
}
