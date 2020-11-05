import { Component, OnInit } from '@angular/core'
import { NsSettings } from '../../settings.model'
import { TFetchStatus, ConfigurationsService } from '@ws-widget/utils'
import { SettingsService } from '../../settings.service'
import { MatSnackBar } from '@angular/material'

@Component({
  selector: 'ws-app-notification-settings',
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.scss'],
})
export class NotificationSettingsComponent implements OnInit {

  notificationSettings: NsSettings.INotificationGroup[] = []
  notificationsFetchStatus: TFetchStatus = 'none'
  notificationsUpdateStatus: TFetchStatus = 'none'
  userRoles: Set<string> = new Set()
  constructor(
    private snackBar: MatSnackBar,
    private settingsSvc: SettingsService,
    private configSvc: ConfigurationsService,
  ) { }

  ngOnInit() {
    this.userRoles = this.configSvc.userRoles || new Set()
    this.fetchNotificationSettings()
  }

  private fetchNotificationSettings() {
    this.notificationsFetchStatus = 'fetching'
    this.settingsSvc.fetchNotificationSettings().subscribe(
      data => {
        this.notificationSettings = data
        this.notificationsFetchStatus = 'done'
      },
      _ => {
        this.notificationsFetchStatus = 'error'
      },
    )
  }

  updateMode(groupIndex: number, eventIndex: number, successMsg: string, errorMsg: string) {
    this.notificationSettings[groupIndex].events[eventIndex].recipients.forEach(recipient => {
      recipient.modes.forEach(mode => {
        mode.status = !mode.status
      })
    })
    this.updateNotificationSettings(successMsg, errorMsg)
  }

  private updateNotificationSettings(successMsg: string, errorMsg: string) {
    if (this.notificationSettings && this.notificationSettings.length) {
      this.notificationsUpdateStatus = 'fetching'
      this.settingsSvc.updateNotificationSettings(this.notificationSettings).subscribe(
        _ => {
          this.notificationsUpdateStatus = 'done'
          this.snackBar.open(successMsg)
        },
        _ => {
          this.notificationsUpdateStatus = 'error'
          this.snackBar.open(errorMsg)
        },
      )
    }
  }

  getSupportedModes(notificationEvent: NsSettings.INotificationEvent): NsSettings.INotificationMode[] {
    return notificationEvent.recipients[0].modes
  }
}
