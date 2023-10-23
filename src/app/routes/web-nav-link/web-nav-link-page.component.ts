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
    if (location.path().includes('/app/profile-view')) {
      this.showFontColor = true
    } else {
      this.showFontColor = false
    }
  }
  linksData: any
  data: any
  showFontColor = false
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
  async redirect() {
    console.log(this.configSvc.unMappedUser!.profileDetails!.profileReq!.personalDetails!)
    let result = await this.signupService.getUserData()
    console.log(result)
    if (result && result.profileDetails!.profileReq!.personalDetails!.dob) {
      this.showFontColor = true
      location.href = '/app/profile-view'
    } else {
      console.log('p')
      this.showFontColor = true
      if (localStorage.getItem('url_before_login')) {
        const courseUrl = localStorage.getItem('url_before_login')
        // const url = `app/about-you`
        this.router.navigate(['/app/about-you'], { queryParams: { redirect: courseUrl } })
        // window.location.assign(`${location.origin}/${this.lang}/${url}/${courseUrl}`)
      } else {
        const url = '/page/home'
        this.router.navigate(['/app/about-you'], { queryParams: { redirect: url } })
      }
    }
  }
  logout() {
    this.dialog.open<LogoutComponent>(LogoutComponent)
  }
}
