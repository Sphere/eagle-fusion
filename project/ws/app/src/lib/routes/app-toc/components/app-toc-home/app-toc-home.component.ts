import { Component, OnDestroy, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core'
import { ActivatedRoute, Data, Router } from '@angular/router'
import { NsContent, WidgetContentService } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ConfigurationsService, LoggerService, NsPage } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
// import { share } from 'rxjs/operators'
import { NsAppToc } from '../../models/app-toc.model'
import { AppTocService } from '../../services/app-toc.service'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { AccessControlService } from '@ws/author/src/public-api'
import { WidgetUserService } from './../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-user.service'
import * as _ from 'lodash'

export enum ErrorType {
  internalServer = 'internalServer',
  serviceUnavailable = 'serviceUnavailable',
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
  },                  [])
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
  body: SafeHtml | null = null
  contentParents: { [key: string]: NsAppToc.IContentParentResponse[] } = {}

  courseMockData = {
    id: 'api.content.hierarchy.get',
    ver: '3.0',
    ts: '2021-04-15T05:58:58ZZ',
    params: {
      resmsgid: 'c477f314-9efe-4371-9f86-79b5f995b279',
      msgid: null,
      err: null,
      status: 'successful',
      errmsg: null,
    },
    responseCode: 'OK',
    result: {
      content: {
        ownershipType: [
          'createdFor',
        ],
        instructions: '<p>sad asd aa as das&nbsp;</p>\n',
        publisherIDs: '["af7ee6ca-5ea3-40d6-9219-962e4b792f3a"]',
        channel: '0131397178949058560',
        downloadUrl: `https://igot.blob.core.windows.net/public/ecar_files/do_113257933092823040123/
        call-read-now_1618405760370_do_113257933092823040123_1.0_spine.ecar`,
        organisation: [
          'igot-karmayogi',
        ],
        language: [
          'English',
        ],
        source: 'SVPNPA',
        mimeType: 'application/vnd.ekstep.content-collection',
        variants: {
          online: {
            ecarUrl: `https://igot.blob.core.windows.net/public/ecar_files/do_113257933092823040123/
            call-read-now_1618405760527_do_113257933092823040123_1.0_online.ecar`,
            size: 4041.0,
          },
          spine: {
            ecarUrl: `https://igot.blob.core.windows.net/public/ecar_files/do_113257933092823040123/
            call-read-now_1618405760370_do_113257933092823040123_1.0_spine.ecar`,
            size: 51905.0,
          },
        },
        leafNodes: [
          'do_113257933430104064124',
        ],
        objectType: 'Content',
        appIcon: `https://igot.blob.core.windows.net/public/content/do_113257933092823040123/
        artifact/do_113254274397224960172_1617953417901_image351617953417717.thumb.png`,
        children: [
          {
            ownershipType: [
              'createdFor',
            ],
            instructions: '<p>sad asd as ads dsa&nbsp; sa</p>\n',
            publisherIDs: '["af7ee6ca-5ea3-40d6-9219-962e4b792f3a"]',
            previewUrl: `https://igot.blob.core.windows.net/content/content/do_113257933430104064124/artifact/
            do_113257933430104064124_1618400115322_igotusermanual21618400114946.pdf`,
            // tslint:disable
            downloadUrl: `https://igot.blob.core.windows.net/public/ecar_files/do_113257933430104064124/
            pdf-upload_1618405726078_do_113257933430104064124_1.0.ecar`,
            channel: '0131397178949058560',
            organisation: [
              'igot-karmayogi',
            ],
            language: [
              'English',
            ],
            variants: {
              spine: {
                ecarUrl: `https://igot.blob.core.windows.net/public/ecar_files/do_113257933430104064124/
                pdf-upload_1618405726585_do_113257933430104064124_1.0_spine.ecar`,
                size: 20998.0,
              },
            },
            source: 'LBSNNA',
            mimeType: 'application/pdf',
            appIcon: `https://igot.blob.core.windows.net/public/content/do_113257933430104064124/artifact/
            thumbnail1618240054138.thumb.jpg`,
            primaryCategory: 'Learning Resource',
            // tslint:disable
            artifactUrl: `https://igot.blob.core.windows.net/content/content/do_113257933430104064124/artifact/
            do_113257933430104064124_1618400115322_igotusermanual21618400114946.pdf`,
            contentEncoding: 'identity',
            contentType: 'Resource',
            trackable: {
              enabled: 'No',
              autoBatch: 'No',
            },
            identifier: 'do_113257933430104064124',
            thumbnail: `https://igot.blob.core.windows.net/content/content/do_113256622523056128122/
            artifact/thumbnail1618240054138.jpg`,
            audience: [
              'Student',
            ],
            visibility: 'Default',
            isExternal: false,
            consumerId: '9a1039b0-7159-4e55-b4e6-19ce338d21e9',
            publisherDetails: '[{"id":"af7ee6ca-5ea3-40d6-9219-962e4b792f3a","name":"reviewer one"}]',
            mediaType: 'content',
            osId: 'org.ekstep.quiz.app',
            lastPublishedBy: 'reviewerone',
            version: 2,
            pragma: [
              'external',
            ],
            prevState: 'Review',
            license: 'CC BY 4.0',
            size: 2764727.0,
            lastPublishedOn: '2021-04-14T13:08:46.077+0000',
            name: 'pdf upload',
            status: 'Live',
            code: '1542714906013016',
            purpose: 'asdas dasdsa d',
            credentials: {
              enabled: 'No',
            },
            prevStatus: 'Processing',
            description: 'asd asas  d',
            // tslint:disable
            streamingUrl: `https://igot.blob.core.windows.net/content/content/do_113257933430104064124/artifact/
            do_113257933430104064124_1618400115322_igotusermanual21618400114946.pdf`,
            posterImage: `https://igot.blob.core.windows.net/content/content/
            do_113256622523056128122/artifact/thumbnail1618240054138.jpg`,
            idealScreenSize: 'normal',
            createdOn: '2021-04-14T11:34:36.918+0000',
            duration: '720',
            contentDisposition: 'inline',
            lastUpdatedOn: '2021-04-14T13:08:45.587+0000',
            SYS_INTERNAL_LAST_UPDATED_ON: '2021-04-14T13:08:46.782+0000',
            dialcodeRequired: 'No',
            lastStatusChangedOn: '2021-04-14T13:08:46.763+0000',
            creator: 'igotdemo1',
            createdFor: [
              '0131397178949058560',
            ],
            os: [
              'All',
            ],
            cloudStorageKey: `content/do_113257933430104064124/artifact/
            do_113257933430104064124_1618400115322_igotusermanual21618400114946.pdf`,
            se_FWIds: [
              'igot',
            ],
            reviewer: '[{"id":"af7ee6ca-5ea3-40d6-9219-962e4b792f3a","name":"reviewer one"}]',
            pkgVersion: 1.0,
            versionKey: '1618405725587',
            reviewerIDs: '["af7ee6ca-5ea3-40d6-9219-962e4b792f3a"]',
            idealScreenDensity: 'hdpi',
            s3Key: 'ecar_files/do_113257933430104064124/pdf-upload_1618405726078_do_113257933430104064124_1.0.ecar',
            framework: 'igot',
            lastSubmittedOn: '2021-04-14T13:01:02.946+0000',
            createdBy: '5574b3c5-16ca-49d8-8059-705304f2c7fb',
            compatibilityLevel: 4,
            index: 1,
            depth: 1,
            parent: 'do_113257933092823040123',
            objectType: 'Content',
          },
        ],
        primaryCategory: 'Course',
        contentEncoding: 'gzip',
        totalCompressedSize: 2764727.0,
        mimeTypesCount: '{"application/pdf":1}',
        contentType: 'Course',
        trackable: {
          enabled: 'Yes',
          autoBatch: 'Yes',
        },
        identifier: 'do_113257933092823040123',
        audience: [
          'Student',
        ],
        thumbnail: `https://igot.blob.core.windows.net/content/content/do_113254274397224960172/
        artifact/do_113254274397224960172_1617953417901_image351617953417717.png`,
        toc_url: `https://igot.blob.core.windows.net/public/content/do_113257933092823040123/artifact/
        do_113257933092823040123_toc.json`,
        isExternal: false,
        visibility: 'Default',
        contentTypesCount: '{"Resource":1}',
        childNodes: [
          'do_113257933430104064124',
        ],
        mediaType: 'content',
        publisherDetails: '[{"id":"af7ee6ca-5ea3-40d6-9219-962e4b792f3a","name":"reviewer one"}]',
        osId: 'org.ekstep.quiz.app',
        lastPublishedBy: 'reviewerone',
        version: 2,
        license: 'CC BY 4.0',
        prevState: 'Review',
        size: 51905.0,
        lastPublishedOn: '2021-04-14T13:09:20.245+0000',
        name: 'call read now',
        status: 'Live',
        code: '1463368231333933',
        purpose: 'asdad a sd',
        credentials: {
          enabled: 'Yes',
        },
        prevStatus: 'Processing',
        description: 'sa dsadsa dsa d',
        posterImage: `https://igot.blob.core.windows.net/content/content/do_113254274397224960172/
        artifact/do_113254274397224960172_1617953417901_image351617953417717.png`,
        idealScreenSize: 'normal',
        createdOn: '2021-04-14T11:33:55.758+0000',
        duration: '720',
        contentDisposition: 'inline',
        lastUpdatedOn: '2021-04-14T13:09:20.046+0000',
        SYS_INTERNAL_LAST_UPDATED_ON: '2021-04-14T13:09:20.787+0000',
        dialcodeRequired: 'No',
        lastStatusChangedOn: '2021-04-14T13:09:20.773+0000',
        createdFor: [
          '0131397178949058560',
        ],
        creator: 'igotdemo1',
        os: [
          'All',
        ],
        se_FWIds: [
          'igot',
        ],
        reviewer: '[{"id":"af7ee6ca-5ea3-40d6-9219-962e4b792f3a","name":"reviewer one"}]',
        pkgVersion: 1.0,
        versionKey: '1618405760046',
        reviewerIDs: '["af7ee6ca-5ea3-40d6-9219-962e4b792f3a"]',
        idealScreenDensity: 'hdpi',
        framework: 'igot',
        depth: 0,
        s3Key: 'ecar_files/do_113257933092823040123/call-read-now_1618405760370_do_113257933092823040123_1.0_spine.ecar',
        lastSubmittedOn: '2021-04-14T13:01:25.051+0000',
        createdBy: '5574b3c5-16ca-49d8-8059-705304f2c7fb',
        compatibilityLevel: 4,
        leafNodesCount: 1,
        userConsent: 'Yes',
      },
    },
  }
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
  ) {
  }
  ngOnInit() {
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


        // CHecking for JSON DATA
        if (this.checkJson(data.content.data.creatorContacts)) {
          data.content.data.creatorContacts = JSON.parse(data.content.data.creatorContacts)
        }

        if (this.checkJson(data.content.data.creatorDetails)) {
          data.content.data.creatorDetails = JSON.parse(data.content.data.creatorDetails)
        }

        if (this.checkJson(data.content.data.reviewer)) {
          data.content.data.reviewer = JSON.parse(data.content.data.reviewer)
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
          this.batchData = data
          this.batchData.enrolled = false
          if (this.getBatchId()) {
            this.router.navigate(
              [],
              {
                relativeTo: this.route,
                // queryParams: { batchId: this.getBatchId() },
                queryParamsHandling: 'merge',
              })
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
          const percentage = _.toInteger((_.sum(progress) / progress.length))
          if (this.content) {
            _.set(this.content, 'completionPercentage', percentage)
          }
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
