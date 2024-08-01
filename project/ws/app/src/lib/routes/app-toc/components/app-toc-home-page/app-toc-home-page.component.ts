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
import includes from 'lodash/includes'
import get from 'lodash/get'
import map from 'lodash/map'
import filter from 'lodash/filter'
import set from 'lodash/set'
import first from 'lodash/first'
import each from 'lodash/each'
import toInteger from 'lodash/toInteger'

import moment from 'moment'
import { IndexedDBService } from 'src/app/online-indexed-db.service'

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
  selector: 'ws-app-app-toc-home-page',
  templateUrl: './app-toc-home-page.component.html',
  styleUrls: ['./app-toc-home-page.component.scss'],
})
export class AppTocHomePageComponent implements OnInit, OnDestroy {
  [x: string]: any

  get enableAnalytics(): boolean {
    if (this.configSvc.restrictedFeatures) {
      return !this.configSvc.restrictedFeatures.has('tocAnalytics')
    }
    return false
  }
  enrolledCourse: NsContent.ICourse | undefined
  banners: NsAppToc.ITocBanner | null = null
  content: NsContent.IContent | null = null
  errorCode: NsAppToc.EWsTocErrorCode | null = null
  batchData: NsContent.IBatchListResponse | null = null
  userEnrollmentList = null
  resumeData: any = null
  resumeResource: any = null
  routeSubscription: Subscription | null = null
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  isCohortsRestricted = false
  isInIframe = false
  forPreview = window.location.href.includes('/author/')
  analytics = this.route.snapshot.data.pageData.data.analytics
  currentFragment = 'overview'
  batchId!: string
  sticky = false
  databaseAndTablesExist: boolean = false;
  rowData: any
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
  resumeDataLink: any
  rowDetails: any | undefined
  optmisticPercentage: number = 0

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
    private discussiConfig: DiscussConfigResolve,
    private onlineIndexedDbService: IndexedDBService
  ) {
    this.discussiConfig.setConfig()
    if (this.configSvc.userProfile) {
      this.show()
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

        try {

          (window as any).fbq('track', 'ViewContent', { "contentId": data.content.data.identifier, "content_category": data.content.data.cneName ? "CNE" : "Non CNE", value: data.content.data.cneName })
        }
        catch (e) {
          console.log("fb pixel error")
        }
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
  async show() {
    try {
      this.databaseAndTablesExist = await this.onlineIndexedDbService.checkDatabaseTablesExists()
      console.log(this.databaseAndTablesExist)
      if (!this.databaseAndTablesExist) {
        console.log('Database or tables do not exist in IndexedDB, creating...')
        await this.createDatabaseAndTables()
        console.log('Database and tables created in IndexedDB')
      } else {
        console.log('Database and tables already exist in IndexedDB')
        await this.checkData()
      }
    } catch (error) {
      console.error('Error checking/creating database and tables in IndexedDB:', error)
    }
  }
  async refreshTable() {
    try {
      const tableName = 'onlineCourseProgress' // Specify the table name
      let tableData = await this.onlineIndexedDbService.getData(tableName)
      console.log(tableData)
    } catch (error) {
      console.error('Error fetching data from IndexedDB:', error)
    }
  }
  checkData() {
    console.log('ppp')
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
        if (this.content && this.content.identifier && !this.forPreview) {
          if (courses && courses.length) {
            this.enrolledCourse = courses.find(course => {
              const identifier = this.content && this.content.identifier || ''
              if (course.courseId !== identifier) {
                return undefined
              }
              return course
            })
          }
          // If current course is present in the list of user enrolled course
          if (this.enrolledCourse && this.enrolledCourse.batchId) {
            // const collectionId = this.isResource ? '' : this.content.identifier
            this.content.completionPercentage = this.enrolledCourse.completionPercentage || 0
            this.content.completionStatus = this.enrolledCourse.status || 0
            this.getContinueLearningData(this.content.identifier, this.enrolledCourse.batchId)
            this.batchData = {
              content: [this.enrolledCourse.batch],
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
    } else if (cname === 'chapters') {
      if (this.batchData && !this.batchData.enrolled) {
        this.enrollUser(this.batchData)
      }
      this.routelinK = 'chapters'
    } else if (cname === 'license') {
      this.routelinK = 'license'
    } else if (cname === 'references') {
      this.routelinK = 'references'
    }

    this.tocSvc._showComponent.next({ showComponent: true })
    this.loadDiscussionWidget = false
  }
  checkRoute() {
    if (includes(this.router.url, 'overview')) {
      this.toggleComponent('overview')
    } else if (includes(this.router.url, 'chapters')) {
      this.toggleComponent('chapters')
      this.enrollUser(this.batchData)
    } else if (includes(this.router.url, 'references')) {
      this.toggleComponent('references')
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
    let userId = ''
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || ''
    }
    const targetUrl = this.router.url
    const urlParams = targetUrl.split('/')
    let courseId = urlParams[3]
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
          console.log('datatta', data)
          this.onlineIndexedDbService.getRecordFromTable('onlineCourseProgress', userId, courseId).subscribe(async (record) => {
            console.log('Record:', record)
            this.rowData = await record
            let dat = JSON.parse(this.rowData.data)
            if (dat && dat.length) {
              this.optmisticPercentage = this.updateKeyIfMatch(dat, data.result.contentList, 'completionPercentage')
              console.log(this.optmisticPercentage, 'foundContent')
            }
          }, (error) => {
            console.error('Error:', error, data.result.contentList)
            this.onlineIndexedDbService.insertData(userId, courseId, 'onlineCourseProgress', data.result.contentList).subscribe(
              (dat: any) => {
                console.log('Data inserted successfully1', dat)
                this.onlineIndexedDbService.getRecordFromTable('onlineCourseProgress', userId, courseId).subscribe(async (record) => {
                  console.log('Record:', record)
                  this.rowData = await record
                  let dat = JSON.parse(this.rowData.data)
                  if (dat && dat.length) {
                    this.optmisticPercentage = this.updateKeyIfMatch(dat, data.result.contentList, 'completionPercentage')
                    console.log(this.optmisticPercentage, 'foundContent')
                  }
                }, (error) => {
                  console.error('Error:', error)
                })
              },
              (error) => {
                console.error('Error inserting data:', error)
              }
            )
          })

          this.resumeData = get(data, 'result.contentList')
          this.resumeData = map(this.resumeData, rr => {
            // tslint:disable-next-line
            const items = filter(flattenItems(get(this.content, 'children') || [], 'children'), { 'identifier': rr.contentId, primaryCategory: 'Learning Resource' })
            set(rr, 'progressdetails.mimeType', get(first(items), 'mimeType'))
            if (!get(rr, 'completionPercentage')) {
              if (get(rr, 'status') === 2) {
                set(rr, 'completionPercentage', rr.completionPercentage)
              } else {
                set(rr, 'completionPercentage', rr.completionPercentage)
              }
            }
            return rr
          })
          const progress = map(this.resumeData, 'completionPercentage')
          this.resumeResource = this.resumeData.filter((item: any) => {
            return (item.contentId == (this.enrolledCourse && this.enrolledCourse.lastReadContentId ? this.enrolledCourse.lastReadContentId : ''))
          })
          console.log(this.enrolledCourse, 'enrolledCourse')
          console.log(this.resumeResource[0], 'me')
          console.log(this.resumeData)
          const totalCount = toInteger(get(this.content, 'leafNodesCount')) || 1
          if (progress.length < totalCount) {
            const diff = totalCount - progress.length
            if (diff) {
              // tslint:disable-next-line
              each(new Array(diff), () => {
                progress.push(0)
              })
            }
          }

          // const percentage = toInteger((sum(progress) / progress.length))
          // if (this.content) {
          //   set(this.content, 'completionPercentage', percentage)
          // }
          this.tocSvc.updateResumaData(this.resumeData)
        } else {
          console.log('no data')
          this.resumeData = null
        }
      },
      (error: any) => {
        this.loggerSvc.error('CONTENT HISTORY FETCH ERROR >', error)
      },
    )
  }

  updateKeyIfMatch(arr1: any, arr2: any, keyToUpdate: string): number {
    const targetUrl = this.router.url
    const urlParams = targetUrl.split('/')
    let courseId = urlParams[3]
    let userID = this.configSvc.userProfile!.userId
    //let cId = this.activatedRoute.snapshot.queryParams.contentId

    arr2.forEach((obj2: any) => {
      const obj1 = arr1.find((o: any) => o.contentId === obj2.contentId)

      if (obj1) {
        // Update the existing object in arr1 if the keyToUpdate value is different
        if (obj1[keyToUpdate] !== obj2[keyToUpdate]) {
          obj1[keyToUpdate] = obj2[keyToUpdate]
        }
      } else {
        // Add the new object from arr2 to arr1
        arr1.push(obj2)
      }
    })
    console.log(arr1, 'arr1')
    this.onlineIndexedDbService.insertData(userID, courseId, 'onlineCourseProgress', arr1).subscribe(
      () => {
        console.log('Data inserted successfully2')
      },
      (error) => {
        console.error('Error inserting data:', error)
      }
    )
    const aggregateValue = this.calculateAggregate(arr1, 'completionPercentage')
    console.log('Aggregate value:', aggregateValue)
    console.log(this.content, 'content')
    let uniqueIdsOfType = this.uniqueIdsByContentType(this.content!.children, 'Resource')
    console.log(uniqueIdsOfType.length, this.content!.childNodes.length) // Output: [1, 3]
    let percentage = Math.round((aggregateValue) / (uniqueIdsOfType.length * 100) * 100)
    console.log(percentage, 'percentage', Math.min(Math.max(percentage, 0), 100))
    let progress = Math.min(Math.max(percentage, 0), 100)
    return progress
  }
  calculateAggregate(arr: any, field: string): number {
    let val = arr.reduce((total: number, obj: any) => total + obj[field], 0)
    console.log(val)
    return val
  }

  uniqueIdsByContentType(obj: any, contentType: any, uniqueIds = new Set()) {
    // Check if the current object is an array
    if (Array.isArray(obj)) {
      // If array, recursively call extractUniqueIds for each element
      obj.forEach(item => this.uniqueIdsByContentType(item, contentType, uniqueIds))
    } else if (typeof obj === 'object' && obj !== null) {
      // If object, check if it has contentType and add id to uniqueIds if contentType matches
      if (obj.contentType === contentType && obj.identifier !== undefined) {
        uniqueIds.add(obj.identifier)
      }
      // Recursively call extractUniqueIds for each property value
      Object.values(obj).forEach(value => this.uniqueIdsByContentType(value, contentType, uniqueIds))
    }
    // Return uniqueIds as an array (if needed)
    return [...uniqueIds]
  };

  enrollUser(batchData: any) {
    let userId = ''
    if (batchData) {
      if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId || ''
      }
      const req = {
        request: {
          userId,
          courseId: batchData.content[0].courseId,
          batchId: batchData.content[0].batchId,
        },
      }
      this.contentSvc.enrollUserToBatch(req).then((data: any) => {
        if (data && data.result && data.result.response === 'SUCCESS') {
          this.getUserEnrollmentList()
          this.router.navigate(
            [],
            {
              relativeTo: this.route,
              queryParams: { batchId: batchData.content[0].batchId },
              queryParamsHandling: 'merge',
            })
          // this.openSnackbar('Enrolled Successfully!')
          setTimeout(() => {
            const query = this.generateQuery('RESUME')
            if (this.resumeDataLink) {
              this.router.navigate([this.resumeDataLink.url], { queryParams: query })
            }

          }, 500)

        } else {
          // this.openSnackbar('Something went wrong, please try again later!')
        }
      })
        .catch((err: any) => {
          console.log(err)
          this.openSnackbar(err.error.params.errmsg)
        })
    }

  }

  generateQuery(type: 'RESUME' | 'START_OVER' | 'START'): { [key: string]: string } {
    if (this.firstResourceLink && (type === 'START' || type === 'START_OVER')) {
      let qParams: { [key: string]: string } = {
        ...this.firstResourceLink.queryParams,
        viewMode: type,
        batchId: this.getBatchId(),
      }
      if (this.contextId && this.contextPath) {
        qParams = {
          ...qParams,
          collectionId: this.contextId,
          collectionType: this.contextPath,
        }
      }
      if (this.forPreview) {
        delete qParams.viewMode
      }
      return qParams
    }
    if (this.resumeDataLink && type === 'RESUME') {
      let qParams: { [key: string]: string } = {
        ...this.resumeDataLink.queryParams,
        batchId: this.getBatchId(),
        viewMode: 'RESUME',
      }
      if (this.contextId && this.contextPath) {
        qParams = {
          ...qParams,
          collectionId: this.contextId,
          collectionType: this.contextPath,
        }
      }
      if (this.forPreview) {
        delete qParams.viewMode
      }
      return qParams
    }
    if (this.forPreview) {
      return {}
    }
    return {
      batchId: this.getBatchId(),
      viewMode: type,
    }
  }
}
