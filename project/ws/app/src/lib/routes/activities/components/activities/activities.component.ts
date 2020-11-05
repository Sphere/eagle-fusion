import { Component, OnInit } from '@angular/core'
import { ActivitiesService } from '../../services/activities.service'
import { IActivity, IActivityCard, IChallenges } from '../../interfaces/activities.model'
import { ConfigurationsService } from '@ws-widget/utils/src/lib/services/configurations.service'
import { MatSnackBar } from '@angular/material'
import { ActivatedRoute } from '@angular/router'

export interface IActivityProgress {
  isCompleted: Boolean,
  ActivityCard: IActivityCard
}

@Component({
  selector: 'ws-app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss'],
})
export class ActivitiesComponent implements OnInit {

  keyFeatureCard: IActivityProgress[] = []
  learningChallengeCard: IActivityCard[] = []
  appCard: IActivityCard[] = []

  activityCards: IActivityCard[] = []
  completedActivity: string[] = []
  completedId = false
  showActivities = true
  isActivities = true
  tag = ''
  keyTag: string[] = []
  challenges: IChallenges[] = []

  constructor(
    private configSvc: ConfigurationsService,
    private snackBar: MatSnackBar,
    private activitiesSvc: ActivitiesService,
    private route: ActivatedRoute) {
    if (this.configSvc.restrictedFeatures) {
      if (this.configSvc.restrictedFeatures.has('activities')) {
        this.showActivities = false
      }
    }
    this.route.queryParams.subscribe(params => {
      this.tag = params['tag']
    })
  }

  ngOnInit() {
    if (this.showActivities) {
      this.activitiesSvc.fetchActivites().then((result: IActivity) => {
        if (result.activities.length !== 0) {
          this.activityCards = result.activities
          this.activityCards.forEach(activityCard => {
            if (!(this.keyTag.includes(activityCard.tag))) {
              this.keyTag.push(activityCard.tag)
            }
          })
          this.keyTag.forEach(tag => {
            const filteredActivity = this.activityCards.filter(activity => (tag === activity.tag))
            this.challenges.push({ tag, activities: filteredActivity })
          })
        } else {
          this.showActivities = false
        }
      }).catch(() => {
        this.showActivities = false
        this.snackBar.open('Failed to load activities')
      })
    }
  }
}
