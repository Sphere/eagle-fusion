import { UserProfileService } from './../../../../../user-profile/services/user-profile.service'
import { ITimeSpent } from './../../../learning/models/learning.models'
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { NsContent, NsContentStripMultiple, ROOT_WIDGET_CONFIG } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ConfigurationsService, TFetchStatus } from '@ws-widget/utils'
import { NSProfileData } from '../../../../models/profile.model'
import { ProfileService } from '../../../../services/profile.service'
import { InterestService } from '../../../interest/services/interest.service'
import { NSLearningHistory } from '../../../learning/models/learning.models'
import { LearningHistoryService } from '../../../learning/services/learning-history.service'
import { IUserProfileDetailsFromRegistry } from '../../../../../user-profile/models/user-profile.model'

interface ILearningHistoryContent {
  content: NSLearningHistory.ILearningHistory
  contentType: string
  pageNum: number
  loading: boolean
  isLoadingFirstTime: boolean
  fetchStatus: 'fetching' | 'done' | 'error'
}
export interface ITimeResolveData {
  start: Date
  end: Date
  data: ITimeSpent
}
@Component({
  selector: 'ws-app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})

export class DashboardComponent implements OnInit {
  @ViewChild('myElem', { static: false }) myProp!: ElementRef
  startDate = '2018-04-01'
  endDate = '2020-03-31'
  specialDates: number[] = []
  followContent: NSProfileData.IFollowing[] = []
  channelsFollow: NsContent.IContentMinimal[] = []
  contentType = 'Course'
  timeEvent = new Date()
  isCompleted = 0
  userPointsEarned = 0
  orgWidePointsPercent = 0
  orgWideTimePercent = 0
  totalLearningHours = -1
  badgesData: any | null = null
  badgesEarned: any[] | null = null
  interests: string[] | null = null
  nsoArtifacts: NSProfileData.INsoResponse | null = null
  userName = ''
  userEmail = ''
  departmentName = ''
  skillData: any
  skillFetchStatus: TFetchStatus = 'none'
  badgeApiFetchStatus: TFetchStatus = 'none'
  interestFetchStatus: TFetchStatus = 'none'
  userDataFetchStatus: TFetchStatus = 'none'
  nsoArtifactsFetchStatus: TFetchStatus = 'none'
  followFetchStatus: TFetchStatus = 'none'
  historyFetchStatus: TFetchStatus = 'none'
  apiFetchStatus: TFetchStatus = 'none'
  pointsEarn: number | null = 0
  timeSpentData: NSProfileData.ITimeSpentResponse | null = null
  timeSpent = 0
  enabledTabs = this.activatedRoute.snapshot.data.pageData.data.enabledTabs.dashboard
  widgetResolverData: NsWidgetResolver.IRenderConfigWithTypedData<NsContentStripMultiple.IContentStripMultiple> = {
    widgetData: {
      strips: [
        {
          key: 'continueLearning',
          title: 'Last viewed',

          stripConfig: {
            cardSubType: 'standard',
            deletedMode: 'hide',
            intranetMode: 'greyOut',
          },
          request: {
            api: {
              path: '/apis/protected/v8/user/history',
              queryParams: {
                pageSize: 20,
              },
            },
          },
        },
      ],
    },
    widgetType: ROOT_WIDGET_CONFIG.contentStrip._type,
    widgetSubType: ROOT_WIDGET_CONFIG.contentStrip.multiStrip,
    widgetHostClass: 'block sm:-mx-10 -mx-6',
  }

  coursePending: NSLearningHistory.ILearningHistoryItem[] = []
  lhContent: ILearningHistoryContent[] = []
  selectedStatusType = 'inprogress'
  selectedTabIndex = 0
  contentTypes = ['learning path', 'course', 'collection', 'resource', 'certification']
  pageSize = 10
  loadingContent = true
  pageNum = ''
  ongoingCertifications: NSLearningHistory.ILearningHistoryItem[] = []
  passedCertifications: NSLearningHistory.ILearningHistoryItem[] = []
  userProfileData!: IUserProfileDetailsFromRegistry
  xStandardValues = 0
  xiiStandardValues = 0
  graduate = 0
  postGraduate = 0
  showAcademicElse = false
  showInterest = false
  academicsArray: any[] = []
  mobile: any

  constructor(
    private configSvc: ConfigurationsService,
    // private badgesSvc: BadgesService,
    private profileSvc: ProfileService,
    private learnHstSvc: LearningHistoryService,
    private interestSvc: InterestService,
    private activatedRoute: ActivatedRoute,
    private userProfileSvc: UserProfileService,
  ) {

    if (this.configSvc.userProfile) {
      this.userName = this.configSvc.userProfile.givenName || ''
      this.userEmail = this.configSvc.userProfile.email || ''
      this.departmentName = this.configSvc.userProfile.departmentName || ''
      this.mobile = this.configSvc.userProfile.phone || ''

      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        (data: any) => {
          if (data) {
            this.userProfileData = data.profileDetails.profileReq
            if (this.userProfileData.academics && Array.isArray(this.userProfileData.academics)) {
              this.academicsArray = this.userProfileData.academics
              const academics = this.userProfileData.academics
              academics.forEach((academic: any) => {

                if (academic.type === 'X_STANDARD') {
                  const xstandardArray = academic

                  for (const key in xstandardArray) {

                    if (xstandardArray[key] !== '') {
                      this.xStandardValues = this.xStandardValues + 1
                    }
                  }
                }

                if (academic.type === 'XII_STANDARD') {
                  const xiistandardArray = academic

                  for (const key in xiistandardArray) {

                    if (xiistandardArray[key] !== '') {
                      this.xiiStandardValues = this.xiiStandardValues + 1
                    }
                  }
                }

                if (academic.type === 'GRADUATE') {
                  const graduateArray = academic

                  for (const key in graduateArray) {

                    if (graduateArray[key] !== '') {
                      this.graduate = this.graduate + 1
                    }
                  }
                }

                if (academic.type === 'POSTGRADUATE') {
                  const postGraduateArray = academic

                  for (const key in postGraduateArray) {

                    if (postGraduateArray[key] !== '') {
                      this.postGraduate = this.postGraduate + 1
                    }
                  }
                }

              })

              if (this.xStandardValues > 1 || this.xiiStandardValues > 1 || this.graduate > 1 || this.postGraduate > 1) {
                this.showAcademicElse = true
              } else {
                this.showAcademicElse = false
              }
            }
          }
        },
        () => {
        })
    }
  }

  ngOnInit() {
    this.badgeApiFetchStatus = 'fetching'
    this.userDataFetchStatus = 'fetching'
    this.nsoArtifactsFetchStatus = 'fetching'
    this.interestFetchStatus = 'fetching'
    this.followFetchStatus = 'fetching'
    this.historyFetchStatus = 'fetching'
    this.apiFetchStatus = 'fetching'
    this.fetchInterests()
    // this.badgesSvc.fetchBadges().subscribe(
    //   (data: IBadgeResponse) => {
    //     this.badgesData = data
    //     this.badgesEarned = this.badgesData.earned
    //     this.pointsEarn =
    //       this.badgesData.totalPoints[0].collaborative_points +
    //       this.badgesData.totalPoints[0].learning_points
    //     this.badgeApiFetchStatus = 'done'
    //   },
    //   () => {
    //     this.badgeApiFetchStatus = 'error'
    //   },
    // )
    // if (this.enabledTabs.subFeatures.calendar) {
    this.profileSvc.timeSpent(this.startDate, this.endDate, this.contentType, this.isCompleted).subscribe(
      (timeSpentTrack: NSProfileData.ITimeSpentResponse) => {
        this.timeSpentData = timeSpentTrack
        this.apiFetchStatus = 'done'
        if (this.timeSpentData) {
          this.userPointsEarned = this.timeSpentData.points_and_ranks.user_points_earned
          this.orgWideTimePercent = Math.round(
            this.timeSpentData.timespent_user_vs_org_wide.usage_percent,
          )
          this.orgWidePointsPercent = Math.round(
            this.timeSpentData.points_and_ranks.points_user_vs_org_wide.points_percent,
          )
          this.totalLearningHours = Math.round(this.timeSpentData.time_spent_by_user)

          // this.trackWiseDataFetch(this.learningTimeData.track_wise_user_timespent)
          this.specialDatesSet()
        }
      },
      () => {
        this.apiFetchStatus = 'error'
      })
    // }
    if (this.enabledTabs.subFeatures.pendingCourses) {
      this.learnHstSvc.fetchContentProgress(this.pageNum, this.pageSize, this.selectedStatusType, 'course').subscribe(
        (data: NSLearningHistory.ILearningHistory) => {
          this.coursePending = data.result.sort((a: any, b: any) => (a.timeLeft > b.timeLeft ? 1 : a.timeLeft < b.timeLeft ? -1 : 0))
          this.historyFetchStatus = 'done'
        },
        () => {
          this.historyFetchStatus = 'done'
        })
    }
    if (this.myProp) {
      this.myProp.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  fetchInterests() {
    this.interestSvc.fetchUserInterestsV2().subscribe(
      (data: string[]) => {
        this.interests = data
        this.interestFetchStatus = 'done'
      },
      () => {
        this.interestFetchStatus = 'error'
      },
    )
  }

  closeInterest() {
    this.showInterest = false
    this.fetchInterests()
  }

  specialDatesSet() {
    if (this.timeSpentData) {
      const timeSpentDateWise = this.timeSpentData.date_wise.filter(data => data.value !== 0)
      this.specialDates = timeSpentDateWise.map(data => data.key)
    }
  }
  calendarEvent(event: string) {
    this.timeEvent = new Date(event)
    const clickedDate = this.timeEvent.getTime() + 330 * 60000
    if (this.timeSpentData) {
      this.timeSpentData.date_wise.reverse().find((cur: NSProfileData.IProfileData) => {
        if (clickedDate === cur.key) {
          this.timeSpent = cur.value
          return
        }
      })
    }
  }
}
