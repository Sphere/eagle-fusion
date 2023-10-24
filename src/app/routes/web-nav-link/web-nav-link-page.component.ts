import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material'
import { ConfigurationsService, LogoutComponent } from '@ws-widget/utils'
import { Router } from '@angular/router'
import { SignupService } from '../signup/signup.service'
import { Location } from '@angular/common'
@Component({
  selector: 'ws-web-nav-link-page',
  templateUrl: './web-nav-link-page.component.html',
  styleUrls: ['./web-nav-link-page.component.scss'],
})
export class WebNavLinkPageComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    private configSvc: ConfigurationsService,
    private router: Router,
    private signupService: SignupService,
    location: Location,
  ) {
    console.log('urlchanges')
    if (location.path().includes('/app/profile-view')) {
      this.showProfile = true
      this.showHome = false
    } else if (location.path().includes('/page/home')) {
      this.showHome = true
    } else {
      this.showCompetency = true
      this.showHome = false
    }
  }
  linksData: any
  data: any
  showHome = true
  showCompetency = false
  showProfile = false
  ngOnInit() {
    console.log(this.router.url)
    this.data = this.configSvc.unMappedUser!
    this.linksData = [
      {
        linkName: 'Home',
        title: 'Home',
        url: 'page/home',
      },
      {
        linkName: 'Competency',
        tootTip: 'Competency',
        url: '/app/user/competency',
      },
      {
        linkName: 'Account',
        title: 'Account',
        url: '/app/profile-view',
      },
    ]
  }

  async redirect(text: string) {
    let local = (this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails!.preferences && this.configSvc.unMappedUser!.profileDetails!.preferences!.language !== undefined) ? this.configSvc.unMappedUser.profileDetails.preferences.language : location.href.includes('/hi/') === true ? 'hi' : 'en'
    let url1 = local === 'hi' ? 'hi' : ""
    console.log(url1)
    if (text === 'home') {
      this.showProfile = false
      this.showHome = true
      let url = '/page/home'
      location.href = `${url1}${url}`
    } else if (text === 'competency') {
      this.showCompetency = true
      this.showProfile = false
      let url = '/app/user/competency'
      location.href = `${url1}${url}`
    } else {
      console.log(this.configSvc.unMappedUser!.profileDetails!.profileReq!.personalDetails!)
      let result = await this.signupService.getUserData()
      console.log(result)
      if (result && result.profileDetails!.profileReq!.personalDetails!.dob) {
        this.showProfile = true
        let url = '/app/profile-view'
        location.href = `${url1}${url}`
      } else {
        console.log('p')
        this.showProfile = true
        if (localStorage.getItem('url_before_login')) {
          const courseUrl = localStorage.getItem('url_before_login')
          // const url = `app/about-you`
          this.router.navigate(['/app/about-you'], { queryParams: { redirect: courseUrl } })
          // window.location.assign(`${location.origin}/${this.lang}/${url}/${courseUrl}`)
        } else {
          const url = '/page/home'
          this.router.navigate(['/app/about-you'], { queryParams: { redirect: `${url1}${url}` } })
        }
      }
    }
  }
  logout() {
    this.dialog.open<LogoutComponent>(LogoutComponent)
  }
}
