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
    let local = (this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails!.preferences && this.configSvc.unMappedUser!.profileDetails!.preferences!.language !== undefined) ? this.configSvc.unMappedUser.profileDetails.preferences.language : location.href.includes('/hi/') === true ? 'hi' : 'en'
    let url1 = local === 'hi' ? 'hi' : ""
    console.log(url1, text)
    let url3 = `${document.baseURI}`
    if (url3.includes('hi')) {
      url3 = url3.replace(/hi\//g, '')
    }
    console.log("text", text)

    if (text === 'home') {
      let url = url1 === 'hi' ? '/page/home' : 'page/home'
      location.href = `${url3}${url1}${url}`
    } else if (text === 'mycourses') {
      let url = url1 === 'hi' ? '/app/user/my_courses' : 'app/user/my_courses'
      location.href = `${url3}${url1}${url}`

    } else if (text === 'competency') {
      localStorage.setItem('isOnlyPassbook', JSON.stringify(false))
      let url = url1 === 'hi' ? '/app/user/competency' : 'app/user/competency'
      location.href = `${url3}${url1}${url}`
    } else {
      let url = url1 === 'hi' ? '/app/profile-view' : 'app/profile-view'
      location.href = `${url3}${url1}${url}`
    }
  }
  createAcct() {
    this.router.navigateByUrl('app/create-account')
  }
}
