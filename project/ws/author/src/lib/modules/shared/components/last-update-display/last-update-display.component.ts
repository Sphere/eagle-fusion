import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { Component, OnInit, Input } from '@angular/core'

@Component({
  selector: 'ws-auth-last-update-display',
  templateUrl: './last-update-display.component.html',
  styleUrls: ['./last-update-display.component.scss'],
})
export class LastUpdateDisplayComponent implements OnInit {
  @Input() lastUpdatedOn!: string
  @Input() expiryDate!: string
  convertedExpiryDate = new Date()
  difference = 0
  @Input() perspective:
    | 'lastUpdated'
    | 'lastAction'
    | 'deleted'
    | 'lastPublished'
    | 'lastUnpublished'
    | 'expires' = 'lastUpdated'
  timeDuration: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year' = 'second'
  constructor(private accessService: AccessControlService) {}

  ngOnInit() {
    if (this.perspective === 'expires') {
      this.convertedExpiryDate = this.accessService.convertToISODate(this.expiryDate)
    } else {
      const minutes = 60 * 1000
      const hour = 60 * minutes
      const day = 24 * hour
      const month = 30 * day
      const year = 365 * day
      const difference =
        new Date().valueOf() - this.accessService.convertToISODate(this.lastUpdatedOn).valueOf()
      if (difference < minutes) {
        this.difference = Math.round(difference / 1000)
        this.timeDuration = 'second'
      } else if (difference < hour) {
        this.difference = Math.round(difference / minutes)
        this.timeDuration = 'minute'
      } else if (difference < day) {
        this.difference = Math.round(difference / hour)
        this.timeDuration = 'hour'
      } else if (difference < month) {
        this.difference = Math.round(difference / day)
        this.timeDuration = 'day'
      } else if (difference < year) {
        this.difference = Math.round(difference / month)
        this.timeDuration = 'month'
      } else {
        this.difference = Math.round(difference / year)
        this.timeDuration = 'year'
      }
    }
  }
}
