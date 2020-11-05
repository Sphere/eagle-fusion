import { Component, OnInit } from '@angular/core'
import { PageEvent } from '@angular/material'
import { ActivatedRoute } from '@angular/router'
import { NsContent } from '@ws-widget/collection'
import { ConfigurationsService, ValueService, TFetchStatus } from '@ws-widget/utils'
import { NSAnalyticsData } from '../../../analytics/models/analytics.model'
import { AnalyticsService } from '../../../analytics/services/analytics.service'
import { NSLearningHistory } from '../../models/learning.models'
import { LearningHistoryService } from '../../services/learning-history.service'
import { FormControl } from '@angular/forms'

interface ILearningHistoryContent {
  content: NSLearningHistory.ILearningHistory
  contentType: string
  pageState: number
  loading: boolean
  isLoadingFirstTime: boolean
  fetchStatus: 'fetching' | 'done' | 'error'
}

@Component({
  selector: 'ws-app-learning-history',
  templateUrl: './learning-history.component.html',
  styleUrls: ['./learning-history.component.scss'],
})
export class LearningHistoryComponent implements OnInit {
  lhCard: NSLearningHistory.ILearningHistoryItem[] = []
  lhContent: ILearningHistoryContent[] = []
  pageState = -1
  learningHistoryData: NSLearningHistory.IResult[] = []
  selectedStatusType: 'inprogress' | 'completed' = 'inprogress'
  selectedTabIndex = 0
  contentTypes = ['learning path', 'course', 'collection', 'resource', 'certification']
  pageSize = 10
  loadingContent = true
  ongoingCertifications: NSLearningHistory.ILearningHistoryItem[] = []
  passedCertifications: NSLearningHistory.ILearningHistoryItem[] = []
  enabledTab = this.route.snapshot.data.pageData.data.enabledTabs.learning.subTabs
  startDate = '2018-04-01'
  yesterday = new Date().getTime() - 86400000
  // tslint:disable-next-line:max-line-length
  endDate = `${new Date(this.yesterday).getFullYear()}-${`0${new Date(this.yesterday).getMonth() +
    1}`.slice(-2)}-${`0${new Date(this.yesterday).getDate()}`.slice(-2)}`
  contentType = 'Course'
  isCompleted = 0
  filterControl = new FormControl()
  userFetchStatus: TFetchStatus = 'fetching'
  historyFetchStatus: TFetchStatus = 'fetching'
  courseFetchStatus: TFetchStatus = 'fetching'
  modulesFetchStatus: TFetchStatus = 'fetching'
  resourceFetchStatus: TFetchStatus = 'fetching'
  getUserLearning = true
  coursesDescription = 'Number of courses accessed'
  modulesDescription = 'Number of modules accessed'
  resourcesDescription = 'Number of resources accessed'
  filterList: string[] = ['All']
  error = false
  loader: any
  myProgress: any
  othersProgress: any
  progressData: any
  courseData: any
  resourceData: any
  moduleData: any
  showHistory = false
  page = {
    p1: 0,
    p2: 0,
  }
  filterType = ''
  selected = 'All'
  progressData1 = [
    { status: false, data: [] },
    { status: false, data: [] },
    { status: false, data: [] },
  ]
  userProgressData: NSAnalyticsData.IUserProgressResponse | null = null
  historyData: any
  isLtMedium$ = this.valueSvc.isLtMedium$
  screenSizeIsLtMedium = false
  isClient = this.route.snapshot.data.pageData.data.enabledTabs.learning.subTabs.learningHistory.isClient
  enabledTabs = this.route.snapshot.data.pageData.data.enabledTabs.learning.subTabs.learningHistory.tabs
  history = this.route.snapshot.data.pageData.data.enabledTabs.learning.subTabs.learningHistory
  constructor(
    private route: ActivatedRoute,
    private learnHstSvc: LearningHistoryService,
    private analyticsSrv: AnalyticsService,
    private configSvc: ConfigurationsService,
    private valueSvc: ValueService,
  ) {}

  ngOnInit() {
    this.isLtMedium$.subscribe((isLtMedium: boolean) => {
      this.screenSizeIsLtMedium = isLtMedium
    })
    if (this.isClient) {
      if (
        this.configSvc &&
        this.configSvc.userRoles &&
        this.configSvc.userRoles.has('my-analytics')
      ) {
        this.showHistory = true
      } else {
        this.showHistory = false
      }
      if (this.history.showCount) {
        if (this.enabledTabs.courses) {
          this.analyticsSrv.userProgress(this.filterType, 'Course').subscribe((history: any) => {
            this.courseData = history
          })
        }
        if (this.enabledTabs.modules) {
          this.analyticsSrv.userProgress(this.filterType, 'Module').subscribe((history: any) => {
            this.moduleData = history
          })
        }
        if (this.enabledTabs.resources) {
          this.analyticsSrv.userProgress(this.filterType, 'Resource').subscribe((history: any) => {
            this.resourceData = history
          })
        }
      }
      this.analyticsSrv.fetchFilterList().subscribe((data: any) => {
        this.filterList = this.filterList.concat(data.progress_source)
      })
      this.getFilteredCourse(0)
    } else {
      this.contentTypes.forEach(contentType => {
        this.lhContent.push({
          contentType,
          content: {
            count: 0,
            page_state: '',
            result: [],
          },
          pageState: 0,
          loading: false,
          isLoadingFirstTime: true,
          fetchStatus: 'fetching',
        })
      })
      this.route.data.subscribe(async data => {
        this.lhCard = data.learningHistory.data.results
        this.lhContent[0].content = data.learningHistory.data
        this.lhContent[0].contentType = 'learning path'
        this.lhContent[0].fetchStatus = 'done'
        this.lhContent[0].loading = false
        this.lhContent[0].isLoadingFirstTime = false
      })
    }
  }

  // getHistoryData(contentType: string) {
  //   this.learnHstSvc.fetchContentProgress(this.pageState, this.pageSize, this.selectedStatusType, contentType).subscribe(
  //     (data: NSLearningHistory.ILearningHistoryResponse) => {
  //       this.learningHistoryData = data.result
  //       this.historyFetchStatus = 'done'
  //     },
  //     () => {
  //       this.historyFetchStatus = 'done'
  //     },
  //   )
  // }
  getUserProgress(content: ILearningHistoryContent) {
    this.toggleLoading(true, content)
    if (content.contentType !== 'certification') {
      if (content.contentType === 'collection') {
        this.pageSize = 20
      } else if (content.contentType === 'resource') {
        this.pageSize = 40
      } else {
        this.pageSize = 10
      }
      this.learnHstSvc
        .fetchContentProgress(
          content.content.page_state,
          this.pageSize,
          this.selectedStatusType,
          content.contentType,
        )
        .subscribe((data: NSLearningHistory.ILearningHistory) => {
          content.content.count = data.count
          content.content.page_state = data.page_state
          data.result.forEach((resultObj: any) => {
            content.content.result.push(resultObj)
          })

          content.pageState += 1
          this.toggleLoading(false, content)
        })
    } else {
      if (this.ongoingCertifications.length && this.passedCertifications.length) {
        content.content.result =
          this.selectedStatusType === 'inprogress'
            ? this.ongoingCertifications
            : this.passedCertifications
        this.toggleLoading(false, content)
        return
      }
      this.learnHstSvc.fetchCertification().subscribe(
        (data: NSLearningHistory.ICertification) => {
          // Create the list for ongoing certifications
          this.ongoingCertifications = data.ongoingList.map(cert =>
            this.contentToLearningHistory(cert),
          )
          // Create the list for passed certifications
          this.passedCertifications = data.passedList.map(cert =>
            this.contentToLearningHistory(cert),
          )
          content.content.result =
            this.selectedStatusType === 'inprogress'
              ? this.ongoingCertifications
              : this.passedCertifications
          this.toggleLoading(false, content)
        },
        () => {
          this.toggleLoading(false, content)
        },
      )
    }
  }

  reinitializeHistory() {
    this.lhContent.forEach(content => {
      content.content.count = 0
      content.content.result = []
      content.content.page_state = ''
      content.pageState = 0
      content.loading = false
      content.isLoadingFirstTime = true
      content.fetchStatus = 'fetching'
    })
  }

  onStatusChange() {
    this.selectedStatusType = this.selectedStatusType === 'inprogress' ? 'completed' : 'inprogress'
    this.reinitializeHistory()
    this.getUserProgress(this.lhContent[this.selectedTabIndex])
  }

  toggleLoading(loading: boolean, content: ILearningHistoryContent) {
    if (loading) {
      this.loadingContent = true
      content.loading = true
    } else {
      content.loading = false
      content.isLoadingFirstTime = false
      content.fetchStatus = 'done'

      this.loadingContent = false
    }
  }

  contentToLearningHistory(cert: NsContent.IContent) {
    return {
      identifier: cert.identifier,
      name: cert.name,
      contentType: cert.contentType,
      totalDuration: cert.duration,
      children: cert.children.map(child => child.identifier),
    }
  }

  onTabChange(selectedIndex: number) {
    this.selectedTabIndex = selectedIndex
    if (this.lhContent[selectedIndex].fetchStatus === 'done') {
      return
    }
    this.getUserProgress(this.lhContent[this.selectedTabIndex])
  }
  onTabChangeClient(selectedIndex: number) {
    this.selectedTabIndex = selectedIndex
    this.getFilteredCourse(selectedIndex)
  }
  applyFilter(filter: string) {
    this.userFetchStatus = 'fetching'
    this.filterType = filter === 'All' ? '' : filter
    this.getFilteredCourse(this.selectedTabIndex)
  }
  getFilteredCourse(index: number) {
    this.getUserLearning = true
    let contentType = ''
    if (index === 0) {
      contentType = 'Course'
      this.courseFetchStatus = 'fetching'
    } else if (index === 1 && this.enabledTabs.modules) {
      contentType = 'Module'
      this.modulesFetchStatus = 'fetching'
    } else if (index === 1 && !this.enabledTabs.modules && this.enabledTabs.resources) {
      contentType = 'Resource'
      this.resourceFetchStatus = 'fetching'
    } else if (index === 2 && this.enabledTabs.modules && this.enabledTabs.resources) {
      contentType = 'Resource'
      this.resourceFetchStatus = 'fetching'
    }
    this.analyticsSrv.userProgress(this.filterType, contentType).subscribe(
      (history: any) => {
        this.userProgressData = history
        this.progressData = []
        this.myProgress = history.learning_history
        this.othersProgress = history.learning_history_progress_range
        this.myProgress.map((cur: any, i: any) => {
          const others = this.othersProgress[cur.lex_id]
          if (others.length === 5) {
            const obj: any = {
              screenSizeIsLtMedium: this.screenSizeIsLtMedium,
              name: cur.content_name,
              id: cur.lex_id,
              progress: cur.progress,
              isExternal: cur.is_external || false,
              completed: cur.num_of_users || 0,
              source: cur.source,
              completedUsers: others['4'].doc_count || 0,
              contentUrl: cur.is_external ? cur.content_url : `/app/toc/${cur.lex_id}`,
              legend: i === 0 ? true : false,
              data: [
                {
                  y: others['0'].doc_count || 0,
                },
                {
                  y: others['1'].doc_count || 0,
                },
                {
                  y: others['2'].doc_count || 0,
                },
                {
                  y: others['3'].doc_count + others['4'].doc_count || 0,
                },
              ],
            }
            this.progressData.push(obj)
            // if(i)
          }
        })
        setTimeout(
          () => {
            if (contentType === 'Course') {
              this.courseFetchStatus = 'done'
            } else if (contentType === 'Module') {
              this.modulesFetchStatus = 'done'
            } else if (contentType === 'Resource') {
              this.resourceFetchStatus = 'done'
            }
          },
          // tslint:disable-next-line:align
          1000,
        )
        this.loader = setInterval(
          () => {
            this.userFetchStatus = 'done'
          },
          // tslint:disable-next-line:align
          1000,
        )
      },
      () => {
        this.error = true
        this.loader = true
        if (contentType === 'Course') {
          this.courseFetchStatus = 'error'
        } else if (contentType === 'Module') {
          this.modulesFetchStatus = 'error'
        } else if (contentType === 'Resource') {
          this.resourceFetchStatus = 'error'
        }
        this.userFetchStatus = 'error'
      },
    )
  }
  changePage(event: PageEvent, num: number) {
    if (num === 1) {
      this.page.p1 = event.pageIndex * 10
    } else if (num === 2) {
      this.page.p2 = event.pageIndex * 10
    }
  }
}
