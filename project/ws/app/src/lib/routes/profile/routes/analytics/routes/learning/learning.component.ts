import { Component, OnInit } from '@angular/core'
import { AnalyticsService } from '../../services/analytics.service'
import { NSAnalyticsData } from '../../models/analytics.model'
import { TFetchStatus } from '@ws-widget/utils'

@Component({
  selector: 'ws-app-learning',
  templateUrl: './learning.component.html',
  styleUrls: ['./learning.component.scss'],
})
export class LearningComponent implements OnInit {
  startDate = '2018-04-01'
  endDate = '2020-03-31'
  contentType = 'Course'
  filterType = ''
  isCompleted = 0
  nsoFetchStatus: TFetchStatus = 'fetching'
  userFetchStatus: TFetchStatus = 'fetching'
  nsoData: NSAnalyticsData.INsoResponse | null = null
  userProgressData: NSAnalyticsData.IUserProgressResponse | null = null
  constructor(private analyticsSrv: AnalyticsService) { }

  ngOnInit() {
    this.nsoFetchStatus = 'fetching'
    this.userFetchStatus = 'fetching'
    this.analyticsSrv.nsoArtifacts(this.startDate, this.endDate, this.contentType, this.isCompleted).subscribe(
      (nsoResponse: NSAnalyticsData.INsoResponse) => {
        this.nsoData = nsoResponse
        this.nsoFetchStatus = 'done'
      },
      () => {
        this.nsoFetchStatus = 'error'
      })
    this.analyticsSrv.userProgress(this.filterType, this.contentType).subscribe(
      (userProgressResponse: NSAnalyticsData.IUserProgressResponse) => {
        this.userProgressData = userProgressResponse
        this.userFetchStatus = 'done'
      },
      () => {
        this.userFetchStatus = 'error'
      })
  }

}
