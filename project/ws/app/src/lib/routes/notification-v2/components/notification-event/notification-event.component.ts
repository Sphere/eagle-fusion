import { Component, OnInit, Input } from '@angular/core'
import { ENotificationEvent } from '../../models/notifications.model'

@Component({
  selector: 'ws-app-notification-event',
  templateUrl: './notification-event.component.html',
  styleUrls: ['./notification-event.component.scss'],
})
export class NotificationEventComponent implements OnInit {
  @Input() notificationEvent!: ENotificationEvent
  notificationEvents: typeof ENotificationEvent

  constructor() {
    this.notificationEvents = ENotificationEvent
  }

  ngOnInit() {}
}
