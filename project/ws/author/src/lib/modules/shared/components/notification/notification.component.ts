import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { Component, Inject } from '@angular/core'
import { MAT_LEGACY_SNACK_BAR_DATA as MAT_SNACK_BAR_DATA } from '@angular/material/legacy-snack-bar'

interface IData {
  type: keyof typeof Notify,
  data: any
}

@Component({
  selector: 'ws-auth-root-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent {

  type: any = ''
  notify: any = Notify
  otherData: any

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) data: IData,
  ) {
    this.type = data.type
    this.otherData = data.data
  }
  canShow(msg: string) {
    switch (this.type) {
      case Notify.SAVE_SUCCESS:
      case Notify.UPLOAD_SUCCESS:
      case Notify.REVIEW_SUCCESS:
      case Notify.PUBLISH_SUCCESS:
      case Notify.EMAIL_SUCCESS:
      case Notify.SUCCESS:
      case Notify.SEND_FOR_REVIEW_SUCCESS:
        if (msg === 'success') {
          return true
        }
        return false

      case Notify.SAVE_FAIL:
      case Notify.UPLOAD_FAIL:
      case Notify.SEND_FOR_REVIEW_FAIL:
      case Notify.REVIEW_FAIL:
      case Notify.PUBLISH_FAIL:
      case Notify.EMAIL_FAIL:
      case Notify.FAIL:
      case Notify.CONTENT_FAIL:
        if (msg === 'failure') {
          return true
        }
        return false

      default:
        return false
    }
  }
}
