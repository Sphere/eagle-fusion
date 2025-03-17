import { Component, OnInit } from '@angular/core'
import { MatDialog, MatDialogRef } from '@angular/material/dialog'
import { ConfigurationsService, LogoutComponent } from '@ws-widget/utils'
import { Router } from '@angular/router'
import { SignupService } from '../signup/signup.service'
import { Location } from '@angular/common'
import { appNavBarService } from '../../component/app-nav-bar/app-nav-bar.service'
import { NotificationsComponent } from '../notification/notification.component'
import { LocalStorageService } from '../../services/local-storage.service'
import { Events } from '../notification/events'

@Component({
  selector: 'ws-web-nav-link-page',
  templateUrl: './web-nav-link-page.component.html',
  styleUrls: ['./web-nav-link-page.component.scss'],
})
export class WebNavLinkPageComponent implements OnInit {
  linksData: any
  data: any
  showHome = true
  showCompetency = false
  showProfile = false
  mycourses = false
  showNotification = false
  numberOfNotification: any
  notificationDialogRef: MatDialogRef<NotificationsComponent> | null = null;

  constructor(
    private dialog: MatDialog,
    private configSvc: ConfigurationsService,
    private router: Router,
    private signupService: SignupService,
    location: Location,
    public navOption: appNavBarService,
    public storage: LocalStorageService,
    private readonly event: Events,


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
          this.showNotification = false
        }
        if (location.path().includes('/app/profile-view')) {
          this.showProfile = true
          this.showHome = false
          this.showCompetency = false
          this.showNotification = false
        }
        if (location.path().includes('/overview')) {
          this.showProfile = false
          this.showHome = true
          this.showCompetency = false
          this.showNotification = false
        }
        if (location.path().includes('/page/home') || location.path().includes('/app/toc')) {
          this.showProfile = false
          this.showHome = true
          this.showCompetency = false
          this.mycourses = false
          this.showNotification = false
        }
        if (location.path().includes('/app/user/my_courses')) {
          this.showProfile = false
          this.showHome = false
          this.showCompetency = false
          this.mycourses = true
          this.showNotification = false
        }
        if (location.path().includes('/notification')) {
          this.showProfile = false
          this.showHome = false
          this.showCompetency = false
          this.mycourses = false
          this.showNotification = true
        }

      }
    })
    console.log('urlchanges', location.path(), 'path')
    if (location.path().includes('/app/profile-view') || location.path().includes('/app/about-you')) {
      console.log("yes here 1")
      this.showProfile = true
      this.showHome = false
      this.showNotification = false
    } else if (location.path().includes('/page/home')) {
      this.showProfile = false
      this.showHome = true
      this.showCompetency = false
      this.showNotification = false
    } else if (location.path().includes('competency')) {
      this.showProfile = false
      this.showCompetency = true
      this.showHome = false
      this.showNotification = false
    } else if (location.path().includes('user/my_courses')) {
      this.showProfile = false
      this.mycourses = true
      this.showCompetency = false
      this.showHome = false
      this.showNotification = false
    } else if (location.path().includes('notification')) {
      this.showProfile = false
      this.mycourses = false
      this.showCompetency = false
      this.showHome = false
      this.showNotification = true
    }
    else {
      console.log("yes here 2")
      this.showProfile = false
      this.mycourses = false
      this.showCompetency = false
      this.showHome = true
      this.showNotification = false
    }
  }

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
    const count = this.storage.getNumberOfNotifications()
    let notificationText = count > 0 ? '1' : ''

    this.numberOfNotification = (count > 1) ? '1+' : notificationText
    this.event.subscribe('notificationCountUpdated', (data) => {
      let notificationText = data > 0 ? '1' : ''
      this.numberOfNotification = (data > 1) ? '1+' : notificationText
    })
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
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      location.href = `${url3}${url1}${url}`
      this.showNotification = false
    } else if (text === 'mycourses') {
      let url = url1 === 'hi' ? '/app/user/my_courses' : 'app/user/my_courses'
      let result = await this.signupService.getUserData()
      console.log(result)
      if (result && result.profileDetails!.profileReq!.personalDetails!.dob) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
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
      localStorage.setItem('isOnlyPassbook', JSON.stringify(false))
      let result = await this.signupService.getUserData()
      if (result && result.profileDetails!.profileReq!.personalDetails!.dob) {
        let url = url1 === 'hi' ? '/app/user/competency' : 'app/user/competency'
        // eslint-disable-next-line security/detect-non-literal-fs-filename
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
    } else if (text === 'notification') {
      this.showProfile = false
      this.showHome = false
      this.showCompetency = false
      this.showNotification = true
      const dialogRef = this.dialog.open(NotificationsComponent, {
        width: '400px', // Adjust as needed
        maxHeight: '80vh', // Prevent overflow
        panelClass: 'custom-notification-modal',
        position: { top: '60px', right: '10px' }, // Adjust as per your navbar height
      })
      dialogRef.afterClosed().subscribe(() => {
        console.log('Notification modal closed')
      })
    } else {
      console.log(this.configSvc.unMappedUser!.profileDetails!.profileReq!.personalDetails!)
      let result = await this.signupService.getUserData()
      console.log(result)
      if (result && result.profileDetails!.profileReq!.personalDetails!.dob) {
        this.showProfile = true
        let url = url1 === 'hi' ? '/app/profile-view' : 'app/profile-view'
        // eslint-disable-next-line security/detect-non-literal-fs-filename
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
  openNotificationDialog() {
    if (!this.notificationDialogRef) {
      this.notificationDialogRef = this.dialog.open(NotificationsComponent, {
        width: '400px', // Adjust as needed
        maxHeight: '80vh', // Prevent overflow
        panelClass: 'custom-notification-modal',
        position: { top: '60px', right: '10px' }, // Adjust as per your navbar height
      })
    }
  }
  closeNotificationDialog() {
    if (this.notificationDialogRef) {
      this.notificationDialogRef.close()
      this.notificationDialogRef = null
    }
  }
  handleKeyDown(event: KeyboardEvent, item: any) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.redirect('notification')
      event.preventDefault() // Prevents scrolling on space key press
    }
  }
  logout() {
    this.dialog.open<LogoutComponent>(LogoutComponent)
  }
}