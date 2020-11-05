import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { TFetchStatus } from '@ws-widget/utils'
import { NSCompetency } from '../../models/competency.model'
import { Subscription } from 'rxjs'
import { ActivatedRoute, Data, Router } from '@angular/router'

@Component({
  selector: 'ws-app-achievements',
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.scss'],
})
export class AchievementsComponent implements OnInit, OnDestroy {
  startDate = '2018-04-01'
  endDate = `${new Date().getFullYear()}-${`0${new Date().getMonth() + 1}`.slice(-2)}-${`0${new Date().getDate()}`.slice(-2)}`
  contentType = 'Course'
  isCompleted = 0
  apiFetchStatus: TFetchStatus | null = null
  assessmentsData: NSCompetency.IAchievementsRes | null = null
  assessmentsList: NSCompetency.ICompetency[] = []
  private routeSubscription: Subscription | null = null
  achievementType = ''
  redirectUrl = {
    path: '/app/search/learning',
    qParams: {
      q: 'all',
      f: JSON.stringify({
        contentType: ['Resource'],
      }),
    },
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private changeDetect: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    if (this.route) {
      this.routeSubscription = this.route.data.subscribe(
        (data: Data) => {
          this.resetData()
          this.assessmentsData = data.competencyData
          if (data.competencyData === undefined) {
            this.apiFetchStatus = 'error'
          }
          this.assessmentsList = data.competencyData.achievements
          this.achievementType = this.router.url.split('/')[this.router.url.split('/').length - 1]
          if (this.achievementType === 'assessment') {
            this.redirectUrl = {
              path: '/app/search/learning',
              qParams: {
                q: 'all',
                f: JSON.stringify({
                  contentType: ['Resource'],
                  resourceType: ['Assessment'],
                }),
              },
            }
          }
          this.apiFetchStatus = 'done'
        },
        () => {
          this.apiFetchStatus = 'error'
        }
      )
    }
  }
  resetData() {
    this.apiFetchStatus = 'fetching'
    this.assessmentsData = null
    this.assessmentsList = []
    this.changeDetect.detectChanges()
  }
  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe()
    }
  }
}
