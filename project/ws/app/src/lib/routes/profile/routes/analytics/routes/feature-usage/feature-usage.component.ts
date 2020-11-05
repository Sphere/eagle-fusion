import { Component, OnInit } from '@angular/core'
import { AnalyticsService } from '../../services/analytics.service'
import { NSAnalyticsData } from '../../models/analytics.model'
import { TFetchStatus } from '@ws-widget/utils'
import { NSCompetency } from '../../../competency/models/competency.model'
@Component({
  selector: 'ws-app-feature-usage',
  templateUrl: './feature-usage.component.html',
  styleUrls: ['./feature-usage.component.scss'],
})
export class FeatureUsageComponent implements OnInit {
  startDate = '2018-04-01'
  endDate = '2020-03-31'
  contentType = 'Course'
  isCompleted = 0
  timeSpent = 0
  filterType = ''
  pendingAssessments = 0
  assessmentComplete = 0
  assessments: NSCompetency.IAchievementsRes | null = null
  timeSpentFetchStatus: TFetchStatus = 'fetching'
  nsoFetchStatus: TFetchStatus = 'fetching'
  userProgressFetchStatus: TFetchStatus = 'fetching'
  assessmentFetchStatus: TFetchStatus = 'fetching'
  nsoData: NSAnalyticsData.INsoResponse | null = null
  userProgressData: NSAnalyticsData.IUserProgressResponse | null = null
  timeSpentData: NSAnalyticsData.ITimeSpentResponse | null = null
  assessmentData: NSAnalyticsData.IAssessmentResponse | null = null

  constructor(private analyticsSrv: AnalyticsService) { }
  ngOnInit() {
    this.timeSpentFetchStatus = 'fetching'
    this.nsoFetchStatus = 'fetching'
    this.userProgressFetchStatus = 'fetching'
    this.assessmentFetchStatus = 'fetching'

    this.analyticsSrv.nsoArtifacts(this.startDate, this.endDate, this.contentType, this.isCompleted).subscribe(
      (nsoResponse: NSAnalyticsData.INsoResponse) => {
        this.nsoData = nsoResponse
        this.nsoFetchStatus = 'done'
      },
      () => {
        this.nsoFetchStatus = 'error'
      })
    this.analyticsSrv.assessments(this.startDate, this.endDate, this.contentType, this.isCompleted).subscribe(
      (assessmentResponse: NSAnalyticsData.IAssessmentResponse) => {
        this.assessmentData = assessmentResponse
        this.assessmentData.assessment.map((cur: any) => {
          if (cur.assessment_score >= 60) {
            this.assessmentComplete += 1
          }
          this.assessmentFetchStatus = 'done'
        })
      },
      () => {
        this.assessmentFetchStatus = 'error'
      })
    this.analyticsSrv.fetchAssessments(this.startDate, this.endDate).subscribe(
      (assessmentsData: NSCompetency.IAchievementsRes) => {
        this.assessments = assessmentsData
        if (this.assessments.assessments) {
          this.assessments.assessments.map((cur: any) => {
            if (cur.assessment_score >= 60) {
              this.assessmentComplete += 1
            }
            this.assessmentFetchStatus = 'done'
          })
        }
      },
      () => {
        this.assessmentFetchStatus = 'error'
      },
    )
    this.analyticsSrv.userProgress(this.filterType, this.contentType).subscribe(
      (userProgressResponse: NSAnalyticsData.IUserProgressResponse) => {
        this.userProgressData = userProgressResponse
        this.pendingAssessments = Math.abs(this.userProgressData.learning_history.length - this.assessmentComplete)
        this.userProgressFetchStatus = 'done'
      },
      () => {
        this.userProgressFetchStatus = 'error'
      })
    this.analyticsSrv.timeSpent(this.startDate, this.endDate, this.contentType, this.isCompleted).subscribe(
      (timeSpentResponse: NSAnalyticsData.ITimeSpentResponse) => {
        this.timeSpentData = timeSpentResponse
        this.timeSpent = Math.ceil(this.timeSpentData.timespent_user_vs_org_wide.time_spent_by_user / 60)
        this.timeSpentFetchStatus = 'done'
      },
      () => {
        this.timeSpentFetchStatus = 'error'
      })
  }

}
