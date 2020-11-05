import { Component, OnInit } from '@angular/core'
import { AnalyticsService } from '../../services/analytics.service'
import { NSAnalyticsData } from '../../models/analytics.model'
import { TFetchStatus } from '@ws-widget/utils'
@Component({
  selector: 'ws-app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.scss'],
})
export class PlansComponent implements OnInit {
  startDate = '2018-04-01'
  endDate = '2020-03-31'
  contentType = 'Course'
  filterType = ''
  isCompleted = 0
  userFetchStatus: TFetchStatus = 'fetching'
  userProgressData: NSAnalyticsData.IUserProgressResponse | null = null
  constructor(private analyticsSrv: AnalyticsService) { }

  ngOnInit() {
    this.userFetchStatus = 'fetching'
    this.analyticsSrv.userProgress(this.filterType, this.contentType).subscribe(
      (userProgressResponse: NSAnalyticsData.IUserProgressResponse) => {
        this.userProgressData = userProgressResponse
        this.userFetchStatus = 'done'
      },
      () => {
        this.userFetchStatus = 'error'
      },
    )
  }

}
