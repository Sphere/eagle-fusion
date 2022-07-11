import { Component, OnDestroy, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core'
import { ActivatedRoute, Data, Router } from '@angular/router'
import { NsContent, WidgetContentService } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ConfigurationsService, LoggerService, NsPage } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import { NsAppToc } from '../../models/app-toc.model'
import { AppTocService } from '../../services/app-toc.service'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { AccessControlService } from '@ws/author/src/public-api'
import { WidgetUserService } from './../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-user.service'
import { AppTocOverviewComponent } from '../../routes/app-toc-overview/app-toc-overview.component'
import { DiscussConfigResolve } from '../../../../../../../../../src/app/routes/discussion-forum/wrapper/resolvers/discuss-config-resolve'
import * as _ from 'lodash'
import moment from 'moment'

export enum ErrorType {
  internalServer = 'internalServer'
  , serviceUnavailable = 'serviceUnavailable',
  somethingWrong = 'somethingWrong',
}
const flattenItems = (items: any[], key: string | number) => {
  return items.reduce((flattenedItems, item) => {
    flattenedItems.push(item)
    if (Array.isArray(item[key])) {
      // tslint:disable-next-line
      flattenedItems = flattenedItems.concat(flattenItems(item[key], key))
    }
    return flattenedItems
  }, [])
}
@Component({
  selector: 'ws-app-app-toc-home',
  templateUrl: './app-toc-home.component.html',
  styleUrls: ['./app-toc-home.component.scss'],
})
export class AppTocHomeComponent implements OnInit, OnDestroy {

  get enableAnalytics(): boolean {
    if (this.configSvc.restrictedFeatures) {
      return !this.configSvc.restrictedFeatures.has('tocAnalytics')
    }
    return false
  }
  banners: NsAppToc.ITocBanner | null = null
  content: NsContent.IContent | null = null
  errorCode: NsAppToc.EWsTocErrorCode | null = null
  batchData: NsContent.IBatchListResponse | null = null
  userEnrollmentList = null
  resumeData: any = null
  routeSubscription: Subscription | null = null
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  isCohortsRestricted = false
  isInIframe = false
  forPreview = window.location.href.includes('/author/')
  analytics = this.route.snapshot.data.pageData.data.analytics
  currentFragment = 'overview'
  batchId!: string
  sticky = false
  license = 'CC BY'
  errorWidgetData: NsWidgetResolver.IRenderConfigWithTypedData<any> = {
    widgetType: 'errorResolver',
    widgetSubType: 'errorResolver',
    widgetData: {
      errorType: 'internalServer',
    },
  }
  isAuthor = false
  authorBtnWidget: NsPage.INavLink = {
    actionBtnId: 'feature_authoring',
    config: {
      type: 'mat-button',
    },
  }
  tocConfig: any = null
  elementPosition: any
  batchSubscription: Subscription | null = null
  @ViewChild('stickyMenu', { static: true }) menuElement!: ElementRef

  @ViewChild(AppTocOverviewComponent, { static: true }) wsAppAppTocOverview!: AppTocOverviewComponent
  body: SafeHtml | null = null
  contentParents: { [key: string]: NsAppToc.IContentParentResponse[] } = {}
  discussionConfig: any = {}
  loadDiscussionWidget = false
  routelinK = 'overview'
  result: any
  matspinner = true

  @HostListener('window:scroll', ['$event'])
  handleScroll() {
    const windowScroll = window.pageYOffset
    if (windowScroll >= this.elementPosition - 100) {
      this.sticky = true
    } else {
      this.sticky = false
    }
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contentSvc: WidgetContentService,
    private userSvc: WidgetUserService,
    private tocSvc: AppTocService,
    private loggerSvc: LoggerService,
    private configSvc: ConfigurationsService,
    private domSanitizer: DomSanitizer,
    private authAccessControlSvc: AccessControlService,
    private discussiConfig: DiscussConfigResolve
  ) {
    this.discussiConfig.setConfig()
    if (this.configSvc.userProfile) {
      this.discussionConfig = {
        // menuOptions: [{ route: 'categories', enable: true }],
        userName: (this.configSvc.nodebbUserProfile && this.configSvc.nodebbUserProfile.username) || '',
      }
    }

  }
  ngOnInit() {
    this.checkRoute()
    try {
      this.isInIframe = window.self !== window.top
    } catch (_ex) {
      this.isInIframe = false
    }
    if (this.route) {
      this.routeSubscription = this.route.data.subscribe((data: Data) => {

        // adding mock data
        // data.content.error = null
        // data.content.data = this.courseMockData.result.content

        // Checking for JSON DATA
        if (data.content.data) {
          if (this.checkJson(data.content.data.creatorDetails)) {
            data.content.data.creatorDetails = JSON.parse(data.content.data.creatorDetails)
          }

          if (this.checkJson(data.content.data.reviewer)) {
            data.content.data.reviewer = JSON.parse(data.content.data.reviewer)
          }
        } else {
          if (localStorage.getItem('url_before_login')) {
            const url = localStorage.getItem('url_before_login') || ''
            this.router.navigate([url])
          } else {
            this.router.navigate(['/app/login'])
          }
        }

        this.banners = data.pageData.data.banners
        this.tocSvc.subtitleOnBanners = data.pageData.data.subtitleOnBanners || false
        this.tocSvc.showDescription = data.pageData.data.showDescription || false
        this.tocConfig = data.pageData.data
        this.initData(data)
      })
    }

    this.currentFragment = 'overview'
    this.route.fragment.subscribe((fragment: string) => {
      this.currentFragment = fragment || 'overview'
    })
    this.batchSubscription = this.tocSvc.batchReplaySubject.subscribe(
      () => {
        this.fetchBatchDetails()
      },
      () => {
        // tslint:disable-next-line: no-console
        console.log('error on batchSubscription')
      },
    )
  }

  showContents() {
    this.getUserEnrollmentList()
  }
  checkJson(str: any) {
    try {
      JSON.parse(str)
    } catch (e) {
      return false
    }
    return true
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe()
    }
  }

  private initData(data: Data) {
    const initData = this.tocSvc.initData(data, true)
    this.content = initData.content
    this.errorCode = initData.errorCode

    switch (this.errorCode) {
      case NsAppToc.EWsTocErrorCode.API_FAILURE: {
        this.errorWidgetData.widgetData.errorType = ErrorType.internalServer
        break
      }
      case NsAppToc.EWsTocErrorCode.INVALID_DATA: {
        this.errorWidgetData.widgetData.errorType = ErrorType.internalServer
        break
      }
      case NsAppToc.EWsTocErrorCode.NO_DATA: {
        this.errorWidgetData.widgetData.errorType = ErrorType.internalServer
        break
      }
      default: {
        this.errorWidgetData.widgetData.errorType = ErrorType.somethingWrong
        break
      }
    }

    this.discussionConfig.contextIdArr = (this.content) ? [this.content.identifier] : []
    if (this.content) {
      this.discussionConfig.categoryObj = {
        category: {
          name: this.content.name,
          pid: '',
          description: this.content.description,
          context: [
            {
              type: 'course',
              identifier: this.content.identifier,
            },
          ],
        },
      }
    }
    this.discussionConfig.contextType = 'course'
    this.matspinner = false
    this.getUserEnrollmentList()
    this.body = this.domSanitizer.bypassSecurityTrustHtml(
      this.content && this.content.body
        ? this.forPreview
          ? this.authAccessControlSvc.proxyToAuthoringUrl(this.content.body)
          : this.content.body
        : '',
    )
    this.contentParents = {}
  }

  private getUserEnrollmentList() {
    if (this.content && this.content.identifier && this.content.primaryCategory !== 'Course') {
      // const collectionId = this.isResource ? '' : this.content.identifier
      return this.getContinueLearningData(this.content.identifier)
    }
    this.userEnrollmentList = null
    let userId
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || ''
    }
    // this.route.data.subscribe(data => {
    //   userId = data.profileData.data.userId
    //   }
    // )
    this.userSvc.fetchUserBatchList(userId).subscribe(
      (courses: NsContent.ICourse[]) => {
        let enrolledCourse: NsContent.ICourse | undefined
        if (this.content && this.content.identifier && !this.forPreview) {
          if (courses && courses.length) {
            enrolledCourse = courses.find(course => {
              const identifier = this.content && this.content.identifier || ''
              if (course.courseId !== identifier) {
                return undefined
              }
              return course
            })
          }


          // If current course is present in the list of user enrolled course
          if (enrolledCourse && enrolledCourse.batchId) {
            // const collectionId = this.isResource ? '' : this.content.identifier
            this.content.completionPercentage = enrolledCourse.completionPercentage || 0
            this.content.completionStatus = enrolledCourse.status || 0
            this.getContinueLearningData(this.content.identifier, enrolledCourse.batchId)
            this.batchData = {
              content: [enrolledCourse.batch],
              enrolled: true,
            }
            if (this.getBatchId()) {
              this.batchId = this.getBatchId()
              this.router.navigate(
                [],
                {
                  relativeTo: this.route,
                  queryParams: { batchId: this.getBatchId() },
                  queryParamsHandling: 'merge',
                })
            }
          } else {
            // It's understood that user is not already enrolled
            // Fetch the available batches and present to user
            this.fetchBatchDetails()
          }
        }
      },
      (error: any) => {
        this.loggerSvc.error('CONTENT HISTORY FETCH ERROR >', error)
      },
    )
  }
  public getBatchId(): string {
    let batchId = ''
    if (this.batchData && this.batchData.content) {
      for (const batch of this.batchData.content) {
        batchId = batch.batchId
      }
    }
    return batchId
  }
  redirectTo() {
    this.routelinK = 'discuss'
    this.loadDiscussionWidget = true
    this.tocSvc._showComponent.next({ showComponent: false })
  }
  toggleComponent(cname: string) {
    this.routelinK = ''
    if (cname === 'overview') {
      this.routelinK = 'overview'
    } else if (cname === 'contents') {
      this.routelinK = 'contents'
    } else if (cname === 'license') {
      this.routelinK = 'license'
    }
    this.tocSvc._showComponent.next({ showComponent: true })
    this.loadDiscussionWidget = false
  }
  checkRoute() {
    if (_.includes(this.router.url, 'overview')) {
      this.toggleComponent('overview')
    } else if (_.includes(this.router.url, 'contents')) {
      this.toggleComponent('contents')
    } else {
      this.toggleComponent('license')
    }
  }
  public fetchBatchDetails() {
    if (this.content && this.content.identifier) {
      this.resumeData = null
      const req = {
        request: {
          filters: {
            courseId: this.content.identifier,
            status: ['0', '1', '2'],
            // createdBy: 'fca2925f-1eee-4654-9177-fece3fd6afc9',
          },
          sort_by: { createdDate: 'desc' },
        },
      }
      this.contentSvc.fetchCourseBatches(req).subscribe(
        (data: NsContent.IBatchListResponse) => {
          if (data.content) {
            const batchList = data.content.filter((obj: any) => obj.endDate >= moment(new Date()).format('YYYY-DD-MM'))
            this.batchData = {
              content: batchList,
              enrolled: false,
            }
            if (this.getBatchId()) {
              this.router.navigate(
                [],
                {
                  relativeTo: this.route,
                  // queryParams: { batchId: this.getBatchId() },
                  queryParamsHandling: 'merge',
                })
            }
          }
        },
        (error: any) => {
          this.loggerSvc.error('CONTENT HISTORY FETCH ERROR >', error)
        },
      )
    }
  }

  private getContinueLearningData(contentId: string, batchId?: string) {
    this.resumeData = null
    let userId
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || ''
    }
    // this.route.data.subscribe(data => {
    //   userId = data.profileData.data.userId
    // })
    const req: NsContent.IContinueLearningDataReq = {
      request: {
        batchId,
        userId,
        courseId: contentId || '',
        contentIds: [],
        fields: ['progressdetails'],
      },
    }
    this.contentSvc.fetchContentHistoryV2(req).subscribe(
      data => {
        if (data && data.result && data.result.contentList && data.result.contentList.length) {
          this.resumeData = _.get(data, 'result.contentList')
          this.resumeData = _.map(this.resumeData, rr => {
            // tslint:disable-next-line
            const items = _.filter(flattenItems(_.get(this.content, 'children') || [], 'children'), { 'identifier': rr.contentId, primaryCategory: 'Learning Resource' })
            _.set(rr, 'progressdetails.mimeType', _.get(_.first(items), 'mimeType'))
            if (!_.get(rr, 'completionPercentage')) {
              if (_.get(rr, 'status') === 2) {
                _.set(rr, 'completionPercentage', rr.completionPercentage)
              } else {
                _.set(rr, 'completionPercentage', rr.completionPercentage)
              }
            }
            return rr
          })
          const progress = _.map(this.resumeData, 'completionPercentage')
          const totalCount = _.toInteger(_.get(this.content, 'leafNodesCount')) || 1
          if (progress.length < totalCount) {
            const diff = totalCount - progress.length
            if (diff) {
              // tslint:disable-next-line
              _.each(new Array(diff), () => {
                progress.push(0)
              })
            }
          }
          // const percentage = _.toInteger((_.sum(progress) / progress.length))
          // if (this.content) {
          //   _.set(this.content, 'completionPercentage', percentage)
          // }
          this.tocSvc.updateResumaData(this.resumeData)
        } else {
          this.resumeData = null
        }
      },
      (error: any) => {
        this.loggerSvc.error('CONTENT HISTORY FETCH ERROR >', error)
      },
    )
  }
}
