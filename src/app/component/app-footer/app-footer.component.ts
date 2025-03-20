import { Component, Input, OnInit } from '@angular/core'
import { ConfigurationsService, ValueService } from '@ws-widget/utils'
import { SafeUrl, DomSanitizer } from '@angular/platform-browser'
import { Router } from '@angular/router'

@Component({
  selector: 'ws-app-footer',
  templateUrl: './app-footer.component.html',
  styleUrls: ['./app-footer.component.scss'],
})
export class AppFooterComponent implements OnInit {
  @Input() isEkshamata = false
  isXSmall = false
  termsOfUser = true
  appIcon: SafeUrl | null = null
  isMedium = false
  currentYear = new Date().getFullYear()
  isLoggedIn = false

  constructor(
    private configSvc: ConfigurationsService,
    private valueSvc: ValueService,
    private domSanitizer: DomSanitizer,
    private readonly router: Router
  ) {
    this.isLoggedIn = !!this.configSvc.userProfile
    this.termsOfUser = !this.configSvc.restrictedFeatures?.has('termsOfUser')
    if (this.configSvc.instanceConfig) {
      this.appIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
        this.configSvc.instanceConfig.logos.app
      )
    }

  }

  ngOnInit() {
    if (this.isEkshamata) {
      this.appIcon = '/fusion-assets/images/aastrika-foundation-logo.svg'
    } else {
      this.appIcon = '/fusion-assets/images/sphere-new-logo.svg'
    }

    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      this.isXSmall = isXSmall
    })

    this.valueSvc.isLtMedium$.subscribe(isMedium => {
      this.isMedium = isMedium
    })
  }


  async redirect(text: string) {
    let url = ''
    switch (text) {
      case 'home':
        url = '/page/home'
        break
      case 'mycourses':
        url = '/app/user/my_courses'
        break
      case 'competency':
        url = '/app/user/competency'
        localStorage.setItem('isOnlyPassbook', 'false')
        break
      default:
        url = '/app/profile-view'
        break
    }
    await this.router.navigateByUrl(url)
  }

  createAcct() {
    this.router.navigateByUrl('/app/create-account')
  }
}