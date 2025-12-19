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
import { PlaylistService } from '../../services/playlist.service'

@Component({
  selector: 'ws-web-nav-link-page',
  templateUrl: './web-nav-link-page.component.html',
  styleUrls: ['./web-nav-link-page.component.scss'],
})
export class WebNavLinkPageComponent implements OnInit {
  data: any
  numberOfNotification: any
  notificationDialogRef: MatDialogRef<NotificationsComponent> | null = null;
  menuItems: any[] = []
  constructor(
    private dialog: MatDialog,
    private configSvc: ConfigurationsService,
    private router: Router,
    private signupService: SignupService,
    public location: Location,
    public navOption: appNavBarService,
    public storage: LocalStorageService,
    private readonly event: Events,
    private playlistSvc: PlaylistService

  ) {
    let res = this.playlistSvc.getPlaylistData()
    let config = res.LAYOUT_HEADER
    this.menuItems = config.menuItems
    this.navOption.currentOption.subscribe((option: any) => {
      console.log(option, 'open')
      if (option === 'search') {
        console.log("option: ", option)
        console.log(location.path(), 'location.path()')
        if (location.path().includes('/app/search/learning')) {
          this.updatedMenuItems('')
        }
        if (location.path().includes('/app/profile-view')) {
          this.updatedMenuItems('Account')
        }
        if (location.path().includes('/overview') || location.path().includes('/page/home') || location.path().includes('/app/toc')) {
          this.updatedMenuItems('Home')
        }
        if (location.path().includes('/app/user/my_courses')) {
          this.updatedMenuItems('My Courses')
        }
        if (location.path().includes('/notification')) {
          this.updatedMenuItems('Notification')
        } else if (location.path().includes('competency')) {
          this.updatedMenuItems('Competency')
        }

      }
    })
    console.log('urlchanges', location.path(), 'path')
    if (location.path().includes('/app/profile-view') || location.path().includes('/app/about-you')) {
      console.log("yes here 1")
      this.updatedMenuItems('Account')
    } else if (location.path().includes('/page/home')) {
      this.updatedMenuItems('Home')
    } else if (location.path().includes('competency')) {
      this.updatedMenuItems('Competency')
    } else if (location.path().includes('user/my_courses')) {
      this.updatedMenuItems('My Courses')
    } else if (location.path().includes('notification')) {
      this.updatedMenuItems('Notification')
    }
    else {
      console.log("yes here 2")
      this.updatedMenuItems('Home')
    }
  }

  updatedMenuItems(label: string) {
    this.menuItems.forEach((menuItem: any) => {
      menuItem.show = false
      if (menuItem.title == label) {
        menuItem.show = true
      }
    })
  }

  ngOnInit() {
    console.log(this.router.url)
    this.data = this.configSvc.unMappedUser!
    const count = this.storage.getNumberOfNotifications()
    let notificationText = count > 0 ? '1' : ''

    this.numberOfNotification = (count > 1) ? '1+' : notificationText
    this.event.subscribe('notificationCountUpdated', (data) => {
      let notificationText = data > 0 ? '1' : ''
      this.numberOfNotification = (data > 1) ? '1+' : notificationText
    })
  }

  async redirect(item: any) {
    this.menuItems.forEach((menuItem: any) => {
      menuItem.show = false
    })
    let userProfile = this.configSvc.unMappedUser?.profileDetails?.preferences
    const rootOrgId = this.configSvc.userProfile?.rootOrgId
    const orgSelectiveConfig = this.configSvc.orgSelectiveCourseConfig
    let local: string

    if (userProfile && userProfile.language !== undefined) {
      local = userProfile.language
    } else {
      local = location.href.includes('/hi/') ? 'hi' : 'en'
    }
    let defUrl = '/app/about-you'
    let result = await this.signupService.getUserData()
    const url = item.redirect
    let url1 = local === 'hi' ? 'hi' : ""
    let reUrl = url1 === 'hi' ? '/' + url : url
    console.log(url1, item)
    let text = item.title.toLowerCase().split(' ').join('')
    switch (text) {
      case 'home':
        item.show = true
        if (orgSelectiveConfig && orgSelectiveConfig.orgId === rootOrgId) {
          const redirectUrl = orgSelectiveConfig.redirectUrl || item.redirect
          reUrl = redirectUrl.startsWith('/') ? redirectUrl.substring(1) : redirectUrl
          console.log('🏫 Selective org redirect →', reUrl)
          window.location.href = reUrl
          return
        }
        this.router.navigate([reUrl])
        break
      case 'mycourses':
        item.show = true
        this.configSvc.unMappedUser = result
        if (result?.profileDetails?.profileReq?.personalDetails?.dob) {
          this.router.navigate([reUrl])
        } else {
          this.router.navigate([defUrl], { queryParams: { redirect: `${url1 + this.menuItems[0].redirect}` } })
        }
        break
      case 'competency':
        item.show = true
        localStorage.setItem('isOnlyPassbook', JSON.stringify(false))
        if (result?.profileDetails?.profileReq?.personalDetails?.dob) {
          this.router.navigate([reUrl])
        } else {
          this.router.navigate([defUrl], { queryParams: { redirect: `${url1 + this.menuItems[0].redirect}` } })
        }
        break
      case 'account':
        item.show = true
        if (result?.profileDetails?.profileReq?.personalDetails?.dob) {
          this.router.navigate([reUrl])
        } else {
          if (localStorage.getItem('url_before_login')) {
            const courseUrl = localStorage.getItem('url_before_login')
            this.router.navigate([defUrl], { queryParams: { redirect: courseUrl } })
          } else {
            this.router.navigate([defUrl], { queryParams: { redirect: `${url1 + this.menuItems[0].redirect}` } })
          }
        }
        break
      case 'notification':
        item.show = true
        const dialogRef = this.dialog.open(NotificationsComponent, {
          width: '400px',
          maxHeight: '80vh',
          panelClass: 'custom-notification-modal',
          position: { top: '60px', right: '10px' }
        })

        dialogRef.afterClosed().subscribe(() => {
          console.log('Notification modal closed')
        })
        break
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