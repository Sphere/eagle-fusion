import { Component, OnInit } from '@angular/core'
import { ConfigurationsService, NsPage, TFetchStatus } from '@ws-widget/utils'

import { NotificationApiService } from '../../services/notification-api.service'
import { ENotificationType, INotification } from '../../models/notifications.model'
import { NotificationService } from '../../services/notification.service'
import { noop } from 'rxjs'
import { Router } from '@angular/router'

@Component({
  selector: 'ws-app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  showMarkAsRead = false
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  actionNotifications: INotification[]
  infoNotifications: INotification[]
  actionNotificationsFetchStatus: TFetchStatus
  infoNotificationsFetchStatus: TFetchStatus
  actionNotificationsNextPage?: string
  infoNotificationsNextPage?: string
  private pageSize: number
  hideSeen: Boolean = true
  allSeen!: INotification[]

  constructor(
    private configSvc: ConfigurationsService,
    private notificationApi: NotificationApiService,
    private notificationSvc: NotificationService,
    private router: Router,
  ) {
    this.pageSize = 5
    this.actionNotifications = []
    this.infoNotifications = []
    this.actionNotificationsFetchStatus = 'none'
    this.infoNotificationsFetchStatus = 'none'
  }

  ngOnInit() {
    this.fetchActionNotifications()
    this.fetchInfoNotifications()
    this.getCount()
  }

  fetchActionNotifications() {
    this.actionNotificationsFetchStatus = 'fetching'
    this.notificationApi
      .getNotifications(ENotificationType.Action, this.pageSize, this.actionNotificationsNextPage)
      .subscribe(
        notifications => {
          this.actionNotifications = this.actionNotifications.concat(notifications.data)
          this.actionNotificationsNextPage = notifications.page
          this.actionNotificationsFetchStatus = 'done'
        },
        () => {
          this.actionNotificationsFetchStatus = 'error'
        },
      )
  }

  fetchInfoNotifications() {
    this.infoNotificationsFetchStatus = 'fetching'
    this.notificationApi
      .getNotifications(
        ENotificationType.Information,
        this.pageSize,
        this.infoNotificationsNextPage,
      )
      .subscribe(
        notifications => {
          this.infoNotifications = this.infoNotifications.concat(notifications.data)
          this.infoNotificationsNextPage = notifications.page
          this.infoNotificationsFetchStatus = 'done'
        },
        () => {
          this.infoNotificationsFetchStatus = 'error'
        },
      )
  }

  onClickNotification(notification: INotification) {
    if (!notification.seen) {
      this.notificationApi
        .updateNotificationSeenStatus(notification.notificationId, notification.classifiedAs)
        .subscribe(() => {
          notification.seen = true
        },         noop)
    }

    this.notificationSvc.mapRoute(notification)
  }

  getCount() {
    this.notificationApi.getCount().subscribe(count => {
      if (count > 0) {
        this.showMarkAsRead = true
      }
    })
  }

  readAllNotifications() {
    this.notificationApi.updateNotificationSeenStatus().subscribe(_data => {
      this.router.navigate([], { queryParams: { ts: Date.now() } })
      this.showMarkAsRead = false
      this.actionNotifications.forEach((notification: INotification) => {
        notification.seen = true
      })
      this.infoNotifications.forEach((notification: INotification) => {
        notification.seen = true
      })
    })
  }

  displayInfoNotifications() {
    this.allSeen = this.infoNotifications.filter(item => {
      return !item.seen
    })
    if (this.hideSeen) {
      return this.infoNotifications.filter(item => {
        return !item.seen
      })
    }
    return this.infoNotifications
  }

  displayActionNotifications() {
    this.allSeen = this.infoNotifications.filter(item => {
      return !item.seen
    })
    if (this.hideSeen) {
      return this.actionNotifications.filter(item => {
        return !item.seen
      })
    }
    return this.actionNotifications
  }

  toggleSeen() {
    this.hideSeen = !this.hideSeen
  }

  toggleButtonText() {
    if (this.hideSeen) {
      return 'Show All'
    }
    return 'Hide Read'
  }
}
