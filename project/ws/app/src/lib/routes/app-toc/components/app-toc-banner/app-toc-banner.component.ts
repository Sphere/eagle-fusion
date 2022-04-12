import { Component, Input, OnChanges, OnDestroy, OnInit, HostListener, Inject } from '@angular/core'
import { MatDialog, MatSnackBar } from '@angular/material'
import { DomSanitizer, SafeStyle } from '@angular/platform-browser'
import { ActivatedRoute, Event, NavigationEnd, Router } from '@angular/router'
import {
  // ContentProgressService,
  NsContent,
  NsGoal,
  NsPlaylist,
  viewerRouteGenerator,
  WidgetContentService,
} from '@ws-widget/collection'
import { ConfigurationsService, TFetchStatus } from '@ws-widget/utils'
import { UtilityService } from '@ws-widget/utils/src/lib/services/utility.service'
import { AccessControlService } from '@ws/author'
import { Subscription } from 'rxjs'
import { NsAnalytics } from '../../models/app-toc-analytics.model'
import { NsAppToc, NsCohorts } from '../../models/app-toc.model'
import { AppTocService } from '../../services/app-toc.service'
import { AppTocDialogIntroVideoComponent } from '../app-toc-dialog-intro-video/app-toc-dialog-intro-video.component'
import { MobileAppsService } from 'src/app/services/mobile-apps.service'
import { FormControl, Validators } from '@angular/forms'
import * as dayjs from 'dayjs'
import * as  lodash from 'lodash'
import { CreateBatchDialogComponent } from '../create-batch-dialog/create-batch-dialog.component'
import * as FileSaver from 'file-saver'
import moment from 'moment'

import { DOCUMENT } from '@angular/common'

@Component({
  selector: 'ws-app-toc-banner',
  templateUrl: './app-toc-banner.component.html',
  styleUrls: ['./app-toc-banner.component.scss'],
  providers: [AccessControlService],
})
export class AppTocBannerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() banners: NsAppToc.ITocBanner | null = null
  @Input() content: NsContent.IContent | null = null
  @Input() resumeData: NsContent.IContinueLearningData | null = null
  @Input() analytics: NsAnalytics.IAnalytics | null = null
  @Input() forPreview = false
  @Input() batchData!: any
  batchControl = new FormControl('', Validators.required)
  contentTypes = NsContent.EContentTypes
  // contentProgress = 0
  bannerUrl: SafeStyle | null = null
  routePath = 'overview'
  validPaths = new Set(['overview', 'contents', 'analytics'])
  routerParamSubscription: Subscription | null = null
  routeSubscription: Subscription | null = null
  firstResourceLink: { url: string; queryParams: { [key: string]: any } } | null = null
  resumeDataLink: { url: string; queryParams: { [key: string]: any } } | null = null
  isAssessVisible = false
  isPracticeVisible = false
  editButton = false
  reviewButton = false
  analyticsDataClient: any = null
  btnPlaylistConfig: NsPlaylist.IBtnPlaylist | null = null
  btnGoalsConfig: NsGoal.IBtnGoal | null = null
  isRegistrationSupported = false
  checkRegistrationSources: Set<string> = new Set([
    'SkillSoft Digitalization',
    'SkillSoft Leadership',
    'Pluralsight',
  ])
  isUserRegistered = false
  actionBtnStatus = 'wait'
  showIntranetMessage = false
  showTakeAssessment: NsAppToc.IPostAssessment | null = null
  externalContentFetchStatus: TFetchStatus = 'done'
  registerForExternal = false
  isGoalsEnabled = false
  contextId?: string
  contextPath?: string
  tocConfig: any = null
  cohortResults: {
    [key: string]: { hasError: boolean; contents: NsCohorts.ICohortsContent[], count: Number }
  } = {}
  identifier: any
  cohortTypesEnum = NsCohorts.ECohortTypes
  // learnersCount:Number
  defaultSLogo = ''
  disableEnrollBtn = false
  batchId!: string
  displayStyle = 'none'
  enrolledCourse: any
  lastCourseID: any
  certificateMsg?: any

  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private tocSvc: AppTocService,
    private configSvc: ConfigurationsService,
    // private progressSvc: ContentProgressService,
    private contentSvc: WidgetContentService,
    private utilitySvc: UtilityService,
    private mobileAppsSvc: MobileAppsService,
    private snackBar: MatSnackBar,
    public createBatchDialog: MatDialog,
    // private authAccessService: AccessControlService,
    @Inject(DOCUMENT) public document: Document
  ) {
  }
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    window.location.href = '/page/home'
  }

  ngOnInit() {
    if (this.content) {
      this.fetchCohorts(this.cohortTypesEnum.ACTIVE_USERS, this.content.identifier)
    }

    this.route.data.subscribe(data => {
      this.tocConfig = data.pageData.data
      if (this.content && this.isPostAssessment) {
        this.tocSvc.fetchPostAssessmentStatus(this.content.identifier).subscribe(res => {
          const assessmentData = res.result
          for (const o of assessmentData) {
            if (o.contentId === (this.content && this.content.identifier)) {
              this.showTakeAssessment = o
              break
            }
          }
        })
      }
    })
    this.getCourseID()
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig && instanceConfig.logos && instanceConfig.logos.defaultSourceLogo) {
      this.defaultSLogo = instanceConfig.logos.defaultSourceLogo
    }

    if (this.configSvc.restrictedFeatures) {
      this.isGoalsEnabled = !this.configSvc.restrictedFeatures.has('goals')
    }
    this.routeSubscription = this.route.queryParamMap.subscribe(qParamsMap => {
      const contextId = qParamsMap.get('contextId')
      const contextPath = qParamsMap.get('contextPath')
      if (contextId && contextPath) {
        this.contextId = contextId
        this.contextPath = contextPath
      }
    })
    if (this.configSvc.restrictedFeatures) {
      this.isRegistrationSupported = this.configSvc.restrictedFeatures.has('registrationExternal')
      this.showIntranetMessage = !this.configSvc.restrictedFeatures.has(
        'showIntranetMessageDesktop',
      )
    }

    // if (this.authAccessService.hasAccess(this.content as any) && !this.isInIFrame) {
    //   const status: string = (this.content as any).status
    //   if (!this.forPreview) {
    //     this.editButton = true
    //   } else if (['Draft', 'Live'].includes(status)) {
    //     this.editButton = true
    //   } else if (['InReview', 'Reviewed', 'QualityReview'].includes(status)) {
    //     this.reviewButton = true
    //   }
    // }
    this.checkRegistrationStatus()
    this.routerParamSubscription = this.router.events.subscribe((routerEvent: Event) => {
      if (routerEvent instanceof NavigationEnd) {
        this.assignPathAndUpdateBanner(routerEvent.url)
      }
    })

    if (this.configSvc.restrictedFeatures) {
      this.isGoalsEnabled = !this.configSvc.restrictedFeatures.has('goals')
    }

    if (this.content) {
      this.btnPlaylistConfig = {
        contentId: this.content.identifier,
        contentName: this.content.name,
        contentType: this.content.contentType,
        mode: 'dialog',
      }
      this.btnGoalsConfig = {
        contentId: this.content.identifier,
        contentName: this.content.name,
        contentType: this.content.contentType,
      }
    }
  }

  get showIntranetMsg() {
    if (this.isMobile) {
      return true
    }
    return this.showIntranetMessage
  }

  get showStart() {
    return this.tocSvc.showStartButton(this.content)
  }

  get isPostAssessment(): boolean {
    if (!(this.tocConfig)) {
      return false
    }
    if (this.content) {
      return (
        this.content.contentType === NsContent.EContentTypes.COURSE &&
        this.content.learningMode === 'Instructor-Led'
      )
    }
    return false
  }

  get isMobile(): boolean {
    return this.utilitySvc.isMobile
  }

  get showSubtitleOnBanner() {
    return this.tocSvc.subtitleOnBanners
  }

  // resumeBtn() {
  //   if(localStorage.getItem(`resume_URL`)){
  //     this.resumeDataLink.url = localStorage.getItem(`resume_URL`)
  //       console.log(resume_URL)
  //       //location.href = resume_URL
  //       //this.router.navigateByUrl(`${resume_URL}`)
  //   } else {
  //     console.log(this.lastCourseID)
  //     this.resumeDataLink = viewerRouteGenerator(
  //       this.lastCourseID.content.identifier,
  //       this.lastCourseID.content.mimeType,
  //       this.isResource ? undefined : this.lastCourseID.content.identifier,
  //       this.isResource ? undefined : this.lastCourseID.content.contentType,
  //       this.forPreview,
  //       'Learning Resource',
  //       this.getBatchId(),
  //     )
  //     console.log(this.resumeDataLink)
  //      const query = this.generateQuery('RESUME')
  //      console.log(query)
  //      console.log(this.resumeDataLink)
  // tslint:disable-next-line:max-line-length
  //     let url = this.resumeDataLink.url+'?primaryCategory='+query.primaryCategory+'&collectionId='+query.collectionId+'&collectionType='+query.collectionType+'&batchId='+query.batchId

  //   }
  // }

  ngOnChanges() {
    this.assignPathAndUpdateBanner(this.router.url)
    if (this.content) {
      // this.content.status = 'Deleted'
      this.fetchExternalContentAccess()
      this.modifySensibleContentRating()
      this.assignPathAndUpdateBanner(this.router.url)
      this.getLearningUrls()
    }
    if (this.resumeData && this.content) {
      const resumeDataV2 = this.getResumeDataFromList()
      this.resumeDataLink = viewerRouteGenerator(
        resumeDataV2.identifier,
        resumeDataV2.mimeType,
        this.isResource ? undefined : this.content.identifier,
        this.isResource ? undefined : this.content.contentType,
        this.forPreview,
        // this.content.primaryCategory
        'Learning Resource',
        this.getBatchId()
      )
    }
    this.batchControl.valueChanges.subscribe((batch: NsContent.IBatch) => {
      this.disableEnrollBtn = true
      let userId = ''
      if (batch) {
        if (this.configSvc.userProfile) {
          userId = this.configSvc.userProfile.userId || ''
        }
        const req = {
          request: {
            userId,
            courseId: batch.courseId,
            batchId: batch.batchId,
          },
        }
        this.contentSvc.enrollUserToBatch(req).then((data: any) => {
          if (data && data.result && data.result.response === 'SUCCESS') {
            this.batchData = {
              content: [batch],
              enrolled: true,
            }
            this.router.navigate(
              [],
              {
                relativeTo: this.route,
                queryParams: { batchId: batch.batchId },
                queryParamsHandling: 'merge',
              })
            this.openSnackbar('Enrolled Successfully!')
            this.disableEnrollBtn = false
          } else {
            this.openSnackbar('Something went wrong, please try again later!')
            this.disableEnrollBtn = false
          }
        })
      }
    })
  }
  private getBatchId(): string {
    let batchId = ''
    if (this.batchData && this.batchData.content) {
      for (const batch of this.batchData.content) {
        batchId = batch.batchId
      }
    }
    return batchId
  }

  public handleEnrollmentEndDate(batch: any) {
    const enrollmentEndDate = dayjs(lodash.get(batch, 'enrollmentEndDate')).format('YYYY-MM-DD')
    const systemDate = dayjs()
    return enrollmentEndDate ? dayjs(enrollmentEndDate).isBefore(systemDate) : false
  }

  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }

  downloadCertificate(content: any) {
    // is enrolled?
    if (this.batchData.enrolled) {
      let userId = ''
      let duration: number
      if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId || ''
      }

      if (localStorage.getItem(`certificate_downloaded_${this.content ? this.content.identifier : ''}`)) {

        const customerDate = moment(localStorage.getItem(`certificate_downloaded_${this.content ? this.content.identifier : ''}`))
        const dateNow = moment(new Date())
        duration = dateNow.diff(customerDate, 'minutes')
      }

      if (this.content && this.content.identifier && content.completionPercentage === 100) {
        const req = {
          request: {
            courseId: this.content.identifier,
            batchId: this.getBatchId(),
            userIds: [userId],
          },
        }
        // if course is complete

        // check if certificate is already generated
        this.contentSvc.fetchUserBatchList(userId).subscribe(
          (courses: NsContent.ICourse[]) => {
            // let enrolledCourse: NsContent.ICourse | undefined
            if (this.content && this.content.identifier && !this.forPreview) {

              if (courses && courses.length) {
                this.enrolledCourse = courses.find(course => {
                  const identifier = this.content && this.content.identifier || ''
                  if (course.courseId !== identifier) {
                    return undefined
                  }
                  return course
                })
                if (this.enrolledCourse && this.enrolledCourse.issuedCertificates.length > 0) {
                  this.displayStyle = 'block'
                  // tslint:disable-next-line: max-line-length
                  this.certificateMsg = 'Your certificate download will begin shortly. If it does not start after 3 minutes, please allow popups in the browser and try again'
                  this.sendApi()
                  // trigger this.downloadCertificate

                } else {
                  // trigger request
                  // check for exisitng request

                  if (localStorage.getItem(`certificate_downloaded_${this.content ? this.content.identifier : ''}`) && duration <= 30) {
                    this.displayStyle = 'block'
                    // tslint:disable-next-line: max-line-length
                    this.certificateMsg = `You have already requested a certificate. Please check after ${30 - duration} minutes!`
                  } else {
                    this.contentSvc.processCertificate(req).subscribe((response: any) => {
                      if (response.responseCode === 'OK') {
                        // this.sendApi()
                        // tslint:disable-next-line: max-line-length
                        localStorage.setItem(`certificate_downloaded_${this.content ? this.content.identifier : ''}`, moment(new Date()).toString())
                        this.displayStyle = 'block'
                        // tslint:disable-next-line: max-line-length
                        this.certificateMsg = `Your request for certificate has been successfully processed. Please download it after 30 minutes.`
                      } else {
                        this.displayStyle = 'block'
                        this.certificateMsg = 'Unable to request certificate at this moment. Please try later!'
                      }
                    },
                      err => {
                        this.displayStyle = 'block'
                        /* tslint:disable-next-line */
                        console.log(err.error.params.errmsg)
                        this.certificateMsg = 'Unable to request certificate at this moment. Please try later!'
                        // this.openSnackbar(err.error.params.errmsg)
                      })
                  }
                }

              }
            }
          })

      } else {
        // tslint:disable-next-line:max-line-length
        this.certificateMsg = 'You have not finished all modules of the course. It is mandatory to complete all modules before you can request a certificate'
        this.displayStyle = 'block'
      }
    } else {
      // tslint:disable-next-line: max-line-length
      this.certificateMsg = 'Please enroll by clicking the Start button, finish all modules and then request for the certificate'
      this.displayStyle = 'block'
    }

  }
  sendApi() {
    let userId
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || ''
    }
    this.contentSvc.fetchUserBatchList(userId).subscribe(
      (courses: NsContent.ICourse[]) => {
        // let enrolledCourse: NsContent.ICourse | undefined
        if (this.content && this.content.identifier && !this.forPreview) {
          // tslint:disable-next-line:no-this-assignment
          const self = this
          if (courses && courses.length) {
            this.enrolledCourse = courses.find(course => {
              const identifier = this.content && this.content.identifier || ''
              if (course.courseId !== identifier) {
                return undefined
              }
              return course
            })
            if (this.enrolledCourse && this.enrolledCourse.issuedCertificates.length > 0) {
              const certID = this.enrolledCourse.issuedCertificates[0].identifier || ''
              this.contentSvc.downloadCertificateAPI(certID).toPromise().then((response: any) => {
                if (response.responseCode) {
                  const img = new Image()
                  const url = response.result.printUri
                  img.onload = function () {

                    const canvas: any = document.getElementById('certCanvas') || {}
                    const ctx = canvas.getContext('2d')
                    const imgWidth = img.width
                    const imgHeight = img.height
                    canvas.width = imgWidth
                    canvas.height = imgHeight
                    ctx.drawImage(img, 0, 0, imgWidth, imgHeight)
                    let imgURI = canvas
                      .toDataURL('image/jpeg')

                    imgURI = decodeURIComponent(imgURI.replace('data:image/jpeg,', ''))
                    const arr = imgURI.split(',')
                    const mime = arr[0].match(/:(.*?);/)[1]
                    const bstr = atob(arr[1])
                    let n = bstr.length
                    const u8arr = new Uint8Array(n)
                    while (n) {
                      n = n - 1
                      u8arr[n] = bstr.charCodeAt(n)
                    }
                    const blob = new Blob([u8arr], { type: mime })
                    FileSaver.saveAs(blob, 'certificate.jpeg')
                    if (localStorage.getItem(`certificate_downloaded_${self.content ? self.content.identifier : ''}`)) {
                      localStorage.removeItem(`certificate_downloaded_${self.content ? self.content.identifier : ''}`)
                    }
                  }
                  //  DOMURL.revokeObjectURL(url)
                  img.src = url
                }
              })
            } else {
              this.displayStyle = 'block'
            }
          }
        }
      })
  }

  closePopup() {
    this.displayStyle = 'none'
  }

  getCourseID() {
    let userId
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || ''
    }
    this.contentSvc.fetchUserBatchList(userId).subscribe(
      (courses: NsContent.ICourse[]) => {
        if (this.content && this.content.identifier && !this.forPreview) {
          if (courses && courses.length) {
            this.lastCourseID = courses.find(course => {
              const identifier = this.content && this.content.identifier || ''
              if (course.courseId !== identifier) {
                return undefined
              }
              return course
            })
          }
        }
      })
  }

  get showInstructorLedMsg() {
    return (
      this.showActionButtons &&
      this.content &&
      this.content.learningMode === 'Instructor-Led' &&
      !this.content.children.length &&
      !this.content.artifactUrl
    )
  }

  get isHeaderHidden() {
    return this.isResource && this.content && !this.content.artifactUrl.length
  }

  // get showStart() {
  //   return this.content && this.content.resourceType !== 'Certification'
  // }

  get showActionButtons() {
    return (
      this.actionBtnStatus !== 'wait' &&
      this.content &&
      this.content.status !== 'Deleted' &&
      this.content.status !== 'Expired'
    )
  }

  get showButtonContainer() {
    return (
      this.actionBtnStatus === 'grant' &&
      !(this.isMobile && this.content && this.content.isInIntranet) &&
      !(
        this.content &&
        this.content.contentType === 'Course' &&
        this.content.children.length === 0 &&
        !this.content.artifactUrl
      ) &&
      !(this.content && this.content.contentType === 'Resource' && !this.content.artifactUrl)
    )
  }

  get isResource() {
    if (this.content) {
      const isResource = this.content.contentType === NsContent.EContentTypes.KNOWLEDGE_ARTIFACT ||
        this.content.contentType === NsContent.EContentTypes.RESOURCE || !this.content.children.length
      if (isResource) {
        this.mobileAppsSvc.sendViewerData(this.content)
      }
      return isResource
    }
    return false
  }

  showOrgprofile(orgId: string) {
    this.router.navigate(['/app/org-details'], { queryParams: { orgId } })
  }

  ngOnDestroy() {
    this.tocSvc.analyticsFetchStatus = 'none'
    if (this.routerParamSubscription) {
      this.routerParamSubscription.unsubscribe()
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe()
    }
  }
  private getResumeDataFromList() {
    const lastItem = this.resumeData && this.resumeData.pop()
    return {
      identifier: lastItem.contentId,
      mimeType: lastItem.progressdetails && lastItem.progressdetails.mimeType,

    }
  }

  private modifySensibleContentRating() {
    if (
      this.content &&
      this.content.averageRating &&
      typeof this.content.averageRating !== 'number'
    ) {
      this.content.averageRating = (this.content.averageRating as any)[this.configSvc.rootOrg || '']
    }
    if (this.content && this.content.totalRating && typeof this.content.totalRating !== 'number') {
      this.content.totalRating = (this.content.totalRating as any)[this.configSvc.rootOrg || '']
    }
  }
  private getLearningUrls() {
    if (this.content) {
      // if (!this.forPreview) {
      //   this.progressSvc.getProgressFor(this.content.identifier).subscribe(data => {
      //     this.contentProgress = data
      //   })
      // }
      // this.progressSvc.fetchProgressHashContentsId({
      //   "contentIds": [
      //     "lex_29959473947367270000",
      //     "lex_5501638797018560000"
      //   ]
      // }
      // ).subscribe(data => {
      //   console.log("DATA: ", data)
      // })
      this.isPracticeVisible = Boolean(
        this.tocSvc.filterToc(this.content, NsContent.EFilterCategory.PRACTICE),
      )
      this.isAssessVisible = Boolean(
        this.tocSvc.filterToc(this.content, NsContent.EFilterCategory.ASSESS),
      )
      const firstPlayableContent = this.contentSvc.getFirstChildInHierarchy(this.content)
      this.firstResourceLink = viewerRouteGenerator(
        firstPlayableContent.identifier,
        firstPlayableContent.mimeType,
        this.isResource ? undefined : this.content.identifier,
        this.isResource ? undefined : this.content.contentType,
        this.forPreview,
        this.content.primaryCategory,
        this.getBatchId(),
      )
    }
  }
  private assignPathAndUpdateBanner(url: string) {
    const path = url.split('/').pop()
    if (path && this.validPaths.has(path)) {
      this.routePath = path
      this.updateBannerUrl()
    }
  }
  private updateBannerUrl() {
    if (this.banners) {
      this.bannerUrl = this.sanitizer.bypassSecurityTrustStyle(
        `url(${this.banners[this.routePath]})`,
      )
    }
  }
  playIntroVideo() {
    if (this.content) {
      this.dialog.open(AppTocDialogIntroVideoComponent, {
        data: this.content.introductoryVideo,
        height: '350px',
        width: '620px',
      })
    }
  }
  get sanitizedIntroductoryVideoIcon() {
    if (this.content && this.content.introductoryVideoIcon) {
      return this.sanitizer.bypassSecurityTrustStyle(`url(${this.content.introductoryVideoIcon})`)
    }
    return null
  }
  private fetchExternalContentAccess() {
    if (this.content && this.content.registrationUrl) {
      if (!this.forPreview) {
        this.externalContentFetchStatus = 'fetching'
        this.registerForExternal = false
        this.tocSvc.fetchExternalContentAccess(this.content.identifier).subscribe(
          data => {
            this.externalContentFetchStatus = 'done'
            this.registerForExternal = data.hasAccess
          },
          _ => {
            this.externalContentFetchStatus = 'done'
            this.registerForExternal = false
          },
        )
      } else {
        this.externalContentFetchStatus = 'done'
        this.registerForExternal = true
      }
    }
  }
  getRatingIcon(ratingIndex: number): 'star' | 'star_border' | 'star_half' {
    if (this.content && this.content.averageRating) {
      const avgRating = this.content.averageRating
      const ratingFloor = Math.floor(avgRating)
      if (ratingIndex <= ratingFloor) {
        return 'star'
      }
      if (ratingFloor === ratingIndex - 1 && avgRating % 1 > 0) {
        return 'star_half'
      }
    }
    return 'star_border'
  }

  private checkRegistrationStatus() {
    const source = (this.content && this.content.sourceShortName) || ''
    if (
      !this.forPreview &&
      !this.isRegistrationSupported &&
      this.checkRegistrationSources.has(source)
    ) {
      this.contentSvc
        .getRegistrationStatus(source)
        .then(res => {
          if (res.hasAccess) {
            this.actionBtnStatus = 'grant'
          } else {
            this.actionBtnStatus = 'reject'
            if (res.registrationUrl && this.content) {
              this.content.registrationUrl = res.registrationUrl
            }
          }
        })
        .catch(_err => { })
    } else {
      this.actionBtnStatus = 'grant'
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

  get isInIFrame(): boolean {
    try {
      return window.self !== window.top
    } catch (e) {
      return true
    }
  }

  fetchCohorts(cohortType: NsCohorts.ECohortTypes, identifier: string) {
    if (!this.cohortResults[cohortType] && !this.forPreview) {

      this.tocSvc.fetchContentCohorts(cohortType, identifier).subscribe(
        data => {
          this.cohortResults[cohortType] = {
            contents: data || [],
            hasError: false,
            count: data ? data.length : 0,
          }
        },
        () => {
          this.cohortResults[cohortType] = {
            contents: [],
            hasError: true,
            count: 0,
          }
        },
      )
    } else if (this.cohortResults[cohortType] && !this.forPreview) {
      return
    } else {
      this.cohortResults[cohortType] = {
        contents: [],
        hasError: false,
        count: 0,
      }
    }
  }
  enrollUser(batchData: any) {
    let userId = ''
    if (batchData) {
      if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId || ''
      }
      const req = {
        request: {
          userId,
          courseId: batchData[0].courseId,
          batchId: batchData[0].batchId,
        },
      }
      this.contentSvc.enrollUserToBatch(req).then((data: any) => {

        if (data && data.result && data.result.response === 'SUCCESS') {
          // this.batchData = {
          //   content: [data],
          //   enrolled: true,
          // }
          this.router.navigate(
            [],
            {
              relativeTo: this.route,
              queryParams: { batchId: batchData[0].batchId },
              queryParamsHandling: 'merge',
            })
          this.openSnackbar('Enrolled Successfully!')
          this.disableEnrollBtn = false
          setTimeout(() => {
            if (this.resumeData && this.resumeDataLink) {
              const query = this.generateQuery('RESUME')
              this.router.navigate([this.resumeDataLink.url], { queryParams: query })
            } else if (this.firstResourceLink) {
              const query = this.generateQuery('START')
              this.router.navigate([this.firstResourceLink.url], { queryParams: query })
            }
          }, 500)

        } else {
          this.openSnackbar('Something went wrong, please try again later!')
          this.disableEnrollBtn = false
        }
      })
        .catch((err: any) => {

          this.openSnackbar(err.error.params.errmsg)
        })
    }

  }
  openDialog(content: any): void {
    // const dialogRef = this.createBatchDialog.open(CreateBatchDialogComponent, {
    this.createBatchDialog.open(CreateBatchDialogComponent, {
      // height: '400px',
      width: '600px',
      data: { content },
    })
    // dialogRef.componentInstance.xyz = this.configSvc
    // dialogRef.afterClosed().subscribe((_result: any) => {
    //   if (!this.batchId) {
    //     this.tocSvc.updateBatchData()
    //   }
    // })
  }

}
