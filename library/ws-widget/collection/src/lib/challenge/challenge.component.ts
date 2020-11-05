import { Component, OnInit, Input } from '@angular/core'
import {
  IChallenges,
  IActivityCard,
} from '../../../../../../project/ws/app/src/lib/routes/activities/interfaces/activities.model'
import { ConfigurationsService } from '../../../../utils/src/lib/services/configurations.service'
import { Router, NavigationExtras } from '@angular/router'
import { ProgressSpinnerMode } from '@angular/material/progress-spinner'

@Component({
  selector: 'ws-widget-challenge',
  templateUrl: './challenge.component.html',
  styleUrls: ['./challenge.component.scss'],
})
export class ChallengeComponent implements OnInit {
  @Input() widgetData!: IChallenges
  tag = ''
  heading = ''
  activities: IActivityCard[] = []
  completedActivity: string[] = []
  moreActivities = false
  totalNumberOfActivities = 0
  completedActivityLength = 0
  mode: ProgressSpinnerMode = 'determinate'
  constructor(private configSvc: ConfigurationsService, private router: Router) {}

  ngOnInit() {
    if (this.configSvc.userPreference) {
      if (this.configSvc.userPreference.completedActivity) {
        this.completedActivity = this.configSvc.userPreference.completedActivity
      }
    }
    this.totalNumberOfActivities = this.widgetData.activities.length
    this.completedActivity.forEach(id => {
      this.widgetData.activities.forEach(activityId => {
        if (id === activityId.id) {
          this.completedActivityLength += 1
        }
      })
    })
    if (this.widgetData.activities.length > 2) {
      this.moreActivities = true
    }
    if (this.widgetData) {
      if (this.widgetData.activities.length > 2) {
        this.widgetData.activities.forEach(activity => {
          if (!this.completedActivity.includes(activity.id)) {
            if (this.activities.length < 2) {
              this.activities.push(activity)
            }
          }
        })
        if (this.activities.length !== 2) {
          this.widgetData.activities.forEach(activity => {
            if (this.activities.length !== 2) {
              if (!this.activities.includes(activity)) {
                this.activities.push(activity)
              }
            }
          })
        }
      } else {
        this.activities = this.widgetData.activities
      }
      this.tag = this.widgetData.tag
    }
  }
  activitiesRoute() {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        tag: this.tag,
      },
    }
    this.router.navigate(['/app/activities'], navigationExtras)
  }
}
