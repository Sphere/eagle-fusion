import { Component, Input, OnInit } from '@angular/core'
import { ConfigurationsService } from '@ws-widget/utils/src/public-api'
import { IActivityCard } from '@ws/app/src/lib/routes/activities/interfaces/activities.model'
import { Router } from '@angular/router'
import { MatSnackBar } from '@angular/material'

@Component({
  selector: 'ws-widget-activity-card',
  templateUrl: './activity-card.component.html',
  styleUrls: ['./activity-card.component.scss'],
})
export class ActivityCardComponent implements OnInit {
  @Input() widgetData!: IActivityCard
  completedActivity: string[] = []
  completedId = false

  constructor(
    private configSvc: ConfigurationsService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.completedId = false
    if (this.configSvc.userPreference) {
      if (this.configSvc.userPreference.completedActivity) {
        this.completedActivity = this.configSvc.userPreference.completedActivity
      }
    }
    if (this.completedActivity) {
      if ((this.completedActivity.indexOf(this.widgetData.id)) !== -1) {
        this.completedId = true
      }
    }

  }

  proceedToActivity(id: string, url: string) {
    if (this.completedActivity.indexOf(id) === -1) {
      if (this.widgetData.tag === 'Get to know my Learning world') {
        this.completedActivity.push(id)
        this.configSvc.completedActivity = this.completedActivity
        this.configSvc.prefChangeNotifier.next({ completedActivity: this.configSvc.completedActivity })
        this.router.navigateByUrl(url)
      } else {
        this.router.navigateByUrl(url)
      }
    } else {
      this.openSnackBar()
      this.router.navigateByUrl(url)
    }

  }
  openSnackBar() {
    this.snackBar.open('This activity is already completed', undefined, {
      duration: 2000,
    })
  }

}
