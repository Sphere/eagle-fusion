import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material'
import { ConfigurationsService, LogoutComponent } from '@ws-widget/utils'
import { Router } from '@angular/router'
import { SignupService } from '../signup/signup.service'
import { Location } from '@angular/common'
import { appNavBarService } from '../../component/app-nav-bar/app-nav-bar.service'
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
    public navOption: appNavBarService

  ) {

    this.navOption.currentOption.subscribe((option: any) => {
      console.log(option, 'open')
      if (option === 'search') {
        console.log("option: ", option)
        console.log(location.path(), 'location.path()')
        // this.currentText = ''
        if (location.path().includes('/app/search/learning')) {
          this.showProfile = false
          this.showHome = false
          this.showCompetency = false
        }
        if (location.path().includes('/app/profile-view')) {
          this.showProfile = true
          this.showHome = false
          this.showCompetency = false
        }
        if (location.path().includes('/overview')) {
          this.showProfile = false
          this.showHome = true
          this.showCompetency = false
        }
        if (location.path().includes('/page/home') || location.path().includes('/app/toc')) {
          this.showProfile = false
          this.showHome = true
          this.showCompetency = false
          this.mycourses = false
        }

      }
    })
    console.log('urlchanges', location.path(), 'path')
    if (location.path().includes('/app/profile-view') || location.path().includes('/app/about-you')) {
      console.log("yes here 1")
      this.showProfile = true
      this.showHome = false
    } else if (location.path().includes('/page/home')) {
      this.showProfile = false
      this.showHome = true
      this.showCompetency = false
    } else if (location.path().includes('competency')) {
      this.showProfile = false
      this.showCompetency = true
      this.showHome = false
    } else if (location.path().includes('user/my_courses')) {
      this.showProfile = false
      this.mycourses = true
      this.showCompetency = false
      this.showHome = false
    } else {
      console.log("yes here 2")
      this.showProfile = false
      this.mycourses = false
      this.showCompetency = false
      this.showHome = true
    }
  }
  linksData: any
  data: any
  showHome = true
  showCompetency = false
  showProfile = false
  mycourses = false
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
    console.log(url1, text)
    let url3 = `${document.baseURI}`
    if (url3.includes('hi')) {
      url3 = url3.replace(/hi\//g, '')
    }
    console.log("text", text)

    if (text === 'home') {
      this.showProfile = false
      this.showHome = true
      this.showCompetency = false
      let url = url1 === 'hi' ? '/page/home' : 'page/home'
      location.href = `${url3}${url1}${url}`
    } else if (text === 'mycourses') {
      let url = url1 === 'hi' ? '/app/user/my_courses' : 'app/user/my_courses'
      let result = await this.signupService.getUserData()
      console.log(result)
      if (result && result.profileDetails!.profileReq!.personalDetails!.dob) {
        location.href = `${url3}${url1}${url}`
      } else {
        this.mycourses = true
        this.showProfile = false
        this.showHome = false
        this.showCompetency = false
        let url = url1 === 'hi' ? '/page/home' : 'page/home'
        this.router.navigate(['/app/about-you'], { queryParams: { redirect: `${url1}${url}` } })
      }
    } else if (text === 'competency') {
      let result = await this.signupService.getUserData()
      if (result && result.profileDetails!.profileReq!.personalDetails!.dob) {
        let url = url1 === 'hi' ? '/app/user/competency' : 'app/user/competency'
        location.href = `${url3}${url1}${url}`
      } else {
        console.log(result)
        this.showCompetency = true
        this.mycourses = false
        this.showProfile = false
        this.showHome = false
        //let url = '/app/user/competency'
        //location.href = `${url3}${url1}${url}`
        let url = url1 === 'hi' ? '/page/home' : 'page/home'
        this.router.navigate(['/app/about-you'], { queryParams: { redirect: `${url1}${url}` } })
      }
    } else {
      console.log(this.configSvc.unMappedUser!.profileDetails!.profileReq!.personalDetails!)
      let result = await this.signupService.getUserData()
      console.log(result)
      if (result && result.profileDetails!.profileReq!.personalDetails!.dob) {
        this.showProfile = true
        let url = url1 === 'hi' ? '/app/profile-view' : 'app/profile-view'
        location.href = `${url3}${url1}${url}`
      } else {
        console.log('p')
        this.showProfile = false
        if (localStorage.getItem('url_before_login')) {
          const courseUrl = localStorage.getItem('url_before_login')
          // const url = `app/about-you`
          this.showProfile = true
          this.router.navigate(['/app/about-you'], { queryParams: { redirect: courseUrl } })
          // window.location.assign(`${location.origin}/${this.lang}/${url}/${courseUrl}`)
        } else {
          this.showProfile = true
          this.showHome = false
          this.showCompetency = false
          let url = url1 === 'hi' ? '/page/home' : 'page/home'
          let url4 = `${document.baseURI}`
          if (url4.includes('hi')) {
            url1 = ''
          }
          this.router.navigate(['/app/about-you'], { queryParams: { redirect: `${url1}${url}` } })
        }
      }
    }
  }
  logout() {
    this.dialog.open<LogoutComponent>(LogoutComponent)
  }
}
