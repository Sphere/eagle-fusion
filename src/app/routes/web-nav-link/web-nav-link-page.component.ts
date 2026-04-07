import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core'
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog'
import { ConfigurationsService, LoggerService, LogoutComponent } from '@ws-widget/utils'
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
export class WebNavLinkPageComponent implements OnInit, OnChanges {
  data: any
  numberOfNotification = ''
  currentTab = ''
  notificationDialogRef: MatDialogRef<NotificationsComponent> | null = null
  @Input() menuItems: any[]
  @Input() mode = ''
  userData: any
  constructor(
    private dialog: MatDialog,
    private configSvc: ConfigurationsService,
    private router: Router,
    private signupService: SignupService,
    public location: Location,
    public navOption: appNavBarService,
    public storage: LocalStorageService,
    private readonly event: Events,
    private playlistSvc: PlaylistService,
    private cd: ChangeDetectorRef,
    private logger: LoggerService
  ) {
    this.subscribeNavbarChanges()
  }

  async ngOnInit() {
    this.logger.log(" menuItems ", this.menuItems)
    this.data = this.configSvc?.unMappedUser?.profileDetails?.profileReq?.personalDetails
    this.updateNotificationCount(this.storage.getNumberOfNotifications())

    this.event.subscribe('notificationCountUpdated', count => {
      this.updateNotificationCount(count)
    })
    this.userData = await this.signupService.getUserData()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['menuItems'] && this.menuItems?.length) {
      this.currentTab = this.playlistSvc.getSelectedTab()
      this.syncMenuWithUrl()
      this.cd?.detectChanges()
    }
  }

  private updateNotificationCount(count: number): void {
    this.numberOfNotification = count > 1 ? '1+' : count > 0 ? '1' : ''
  }

  private subscribeNavbarChanges(): void {
    this.navOption.currentOption.subscribe(option => {
      if (option === 'search') {
        this.syncMenuWithUrl()
      }
    })
  }

  private syncMenuWithUrl(): void {
    const path = this.location.path()

    if (path.includes('/app/profile-view') || path.includes('/app/about-you')) {
      this.updatedMenuItems('Account')
    } else if (
      path.includes('/page/home') ||
      path.includes('/overview') ||
      path.includes('/app/toc')
    ) {
      this.updatedMenuItems('Home')
    } else if (path.includes('/app/user/my_courses')) {
      this.updatedMenuItems('My Courses')
    } else if (path.includes('competency')) {
      this.updatedMenuItems('Competency')
    } else if (path.includes('notification')) {
      this.updatedMenuItems('Notification')
    } else if (path.includes('search')) {
      this.updatedMenuItems("Search")
    } else {
      this.updatedMenuItems('Home')
    }
  }

  updatedMenuItems(label: string): void {
    this.menuItems?.forEach(item => {
      item.show = false
      item.active = false
    })

    const selected =
      this.menuItems?.find(i => label && i.title === label) ||
      this.menuItems?.find(i => i.id === this.currentTab) ||
      this.menuItems?.[0]

    if (selected) {
      this.playlistSvc.setSelectedTab(selected.id)
      selected.show = true
      selected.active = true
      this.currentTab = selected.id
    }
  }

  async redirect(item: any): Promise<void> {
    this.menuItems?.forEach(menu => {
      menu.show = false
      menu.active = menu.id === item.id
    })
    const rootOrgId = this.configSvc.userProfile?.rootOrgId
    const orgConfig = this.configSvc.orgSelectiveCourseConfig
    const route = item.redirect
    const titleKey = item.title.toLowerCase().replace(/\s+/g, '')
    // this.navOption.changeNavBarActive(titleKey)

    switch (titleKey) {
      case 'home':
        if (orgConfig?.orgId === rootOrgId) {
          const redirectUrl = orgConfig.redirectUrl || item.redirect
          window.location.href = redirectUrl.startsWith('/')
            ? redirectUrl.substring(1)
            : redirectUrl
          return
        }
        this.router.navigate([route])
        break
      case 'mycourses':
      case 'competency':
      case 'account':
        if (this.userData?.profileDetails?.profileReq?.personalDetails?.dob) {
          localStorage.setItem('isOnlyPassbook', 'false')
          this.router.navigate([route])
        } else {
          const fallback = localStorage.getItem('url_before_login') || this.menuItems[0].redirect
          this.router.navigate(['/app/about-you'], { queryParams: { redirect: fallback } })
        }
        break
      case 'notification':
        this.openNotificationDialog()
        break
      case 'search':
        this.router.navigate(['/app/search/home'])
        break
    }
  }

  openNotificationDialog(): void {
    if (this.notificationDialogRef) return

    this.notificationDialogRef = this.dialog.open(NotificationsComponent, {
      width: '400px', // Adjust as needed
      maxHeight: '80vh', // Prevent overflow
      panelClass: 'custom-notification-modal',
      position: { top: '60px', right: '10px' }, // Adjust as per your navbar height
    })
    this.notificationDialogRef.afterClosed().subscribe(() => {
      this.notificationDialogRef = null
    })
  }
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.redirect({ title: 'Notification' })
      event.preventDefault()
    }
  }
  logout() {
    this.dialog.open<LogoutComponent, MatDialogConfig>(LogoutComponent, {
      panelClass: 'logout-dialog-container',
    })
  }
}
