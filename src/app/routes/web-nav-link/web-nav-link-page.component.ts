import { Component, OnInit } from '@angular/core'
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog'
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
          this.mycourses = false
        }
        if (location.path().includes('/overview')) {
          this.showProfile = false
          this.showHome = true
          this.showCompetency = false
          this.showNotification = false
          this.mycourses = false
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
        } else if (location.path().includes('competency')) {
          this.showProfile = false
          this.showCompetency = true
          this.showHome = false
          this.mycourses = false
          this.showNotification = false
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
    const userProfile = this.configSvc.unMappedUser?.profileDetails?.preferences
    const rootOrgId = this.configSvc.userProfile?.rootOrgId
    const orgSelectiveConfig = this.configSvc.orgSelectiveCourseConfig

    const local = userProfile?.language ?? (location.href.includes('/hi/') ? 'hi' : 'en')
    const isHindi = local === 'hi'
    const prefix = isHindi ? '/hi' : ''

    const navigate = (path: string) => this.router.navigate([`${prefix}${path}`])

    console.log('🌐 Lang:', local, '| Action:', text)

    if (text === 'home') {
      this.showProfile = false
      this.showHome = true
      this.showCompetency = false
      this.showNotification = false

      let homePath = '/page/home'
      let queryParams: any = {}

      if (orgSelectiveConfig && orgSelectiveConfig.orgId === rootOrgId) {
        const redirectUrl = orgSelectiveConfig.redirectUrl || homePath
        console.log('🏫 Selective org →', rootOrgId)

        // Parse URL to extract path and query params
        const urlParts = redirectUrl.split('?')
        homePath = urlParts[0]

        // Extract query params if they exist
        if (urlParts[1]) {
          const params = new URLSearchParams(urlParts[1])
          params.forEach((value, key) => {
            queryParams[key] = value
          })
        }
      }

      // Add language prefix and navigate
      let fullPath = homePath

      // Handle language prefix
      if (prefix === '/hi' && !homePath.startsWith('/hi')) {
        fullPath = `/hi${homePath}`
      } else if (prefix === '' && homePath.startsWith('/hi')) {
        fullPath = homePath.replace('/hi/', '/')
      }

      const pathSegments = fullPath.split('/').filter(Boolean)
      this.router.navigate([`/${pathSegments[0]}`, ...pathSegments.slice(1)], {
        queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined
      })
    }

    else if (text === 'mycourses') {
      const result = await this.signupService.getUserData()
      this.configSvc.unMappedUser = result

      if (result?.profileDetails?.profileReq?.personalDetails?.dob) {
        navigate('/app/user/my_courses')
      } else {
        this.router.navigate([`${prefix}/app/about-you`], {
          queryParams: { redirect: `${prefix}/page/home` },
        })
      }
    }

    else if (text === 'competency') {
      localStorage.setItem('isOnlyPassbook', JSON.stringify(false))
      const result = await this.signupService.getUserData()

      if (result?.profileDetails?.profileReq?.personalDetails?.dob) {
        navigate('/app/user/competency')
      } else {
        this.router.navigate([`${prefix}/app/about-you`], {
          queryParams: { redirect: `${prefix}/page/home` },
        })
      }
    }

    else if (text === 'notification') {
      this.showProfile = false
      this.showHome = false
      this.showCompetency = false
      this.showNotification = true

      const dialogRef = this.dialog.open(NotificationsComponent, {
        width: '400px',
        maxHeight: '80vh',
        panelClass: 'custom-notification-modal',
        position: { top: '60px', right: '10px' },
      })

      dialogRef.afterClosed().subscribe(() => console.log('🔔 Notification modal closed'))
    }

    else {
      const result = await this.signupService.getUserData()
      const hasProfile = !!result?.profileDetails?.profileReq?.personalDetails?.dob

      if (hasProfile) {
        navigate('/app/profile-view')
      } else {
        const redirectUrl = localStorage.getItem('url_before_login') || `${prefix}/page/home`
        this.router.navigate([`${prefix}/app/about-you`], { queryParams: { redirect: redirectUrl } })
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
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.redirect('notification')
      event.preventDefault() // Prevents scrolling on space key press
    }
  }
  logout() {
    this.dialog.open<LogoutComponent, MatDialogConfig>(LogoutComponent, {
      panelClass: 'logout-dialog-container'
    })
  }
}