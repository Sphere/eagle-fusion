import { Component } from '@angular/core'
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
  // currentYear = new Date().getFullYear()

  constructor(
    private configSvc: ConfigurationsService,
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
  }
  redirect(lang: string) {
    console.log(lang)
    console.log(this.router.url)
    if (lang !== '') {
      console.log(`${location.origin}/${lang}${this.router.url}`)
      window.location.assign(`${location.origin}/${lang}${this.router.url}`)
    } else {
      console.log('ss')
      if (this.router.url.includes('hi')) {
        console.log(location.origin)
        console.log(this.router.url)
        let lan = this.router.url.replace('/hi/', '')
        console.log(`${location.origin}/${lan}`)
        window.location.assign(`${location.origin}/${lan}`)
      }

    }
  }
}
