import { Component, Input, OnChanges, OnDestroy, OnInit, HostListener, Inject } from '@angular/core'
import { MatDialog, MatSnackBar } from '@angular/material'
import { DomSanitizer, SafeStyle } from '@angular/platform-browser'
import { ActivatedRoute, Event, NavigationEnd, Router } from '@angular/router'
import {
  // ContentProgressService,
  NsContent,
  // NsGoal,
  // NsPlaylist,
  viewerRouteGenerator,
  WidgetContentService,
} from '@ws-widget/collection'
import { ConfigurationsService, TFetchStatus } from '@ws-widget/utils'
import { UtilityService } from '@ws-widget/utils/src/lib/services/utility.service'
// import { AccessControlService } from '@ws/author'
import { Subscription } from 'rxjs'
// import { NsAnalytics } from '../../models/app-toc-analytics.model'
import { NsAppToc, NsCohorts } from '../../models/app-toc.model'
import { AppTocService } from '../../services/app-toc.service'
// import { AppTocDialogIntroVideoComponent } from '../app-toc-dialog-intro-video/app-toc-dialog-intro-video.component'
import { MobileAppsService } from 'src/app/services/mobile-apps.service'
import { FormControl, Validators } from '@angular/forms'
// import * as dayjs from 'dayjs'
// import * as  lodash from 'lodash'
// import { CreateBatchDialogComponent } from '../create-batch-dialog/create-batch-dialog.component'
// import * as FileSaver from 'file-saver'
import moment from 'moment'
import { IndexedDBService } from 'src/app/online-indexed-db.service'
import { DOCUMENT } from '@angular/common'
import { AppTocDesktopModalComponent } from '../app-toc-desktop-modal/app-toc-desktop-modal.component'
import { AppTocCertificateModalComponent } from '../app-toc-certificate-modal/app-toc-certificate-modal.component'
// import { ConfirmmodalComponent } from '../../../../../../../viewer/src/lib/plugins/quiz/confirm-modal-component'

@Component({
  selector: 'ws-app-app-toc-desktop',
  templateUrl: './app-toc-desktop.component.html',
  styleUrls: ['./app-toc-desktop.component.scss'],
  providers: [
    // AccessControlService
  ],
})
export class AppTocDesktopComponent implements OnInit, OnChanges, OnDestroy {
  @Input() banners: NsAppToc.ITocBanner | null = null
  @Input() content: NsContent.IContent | null = null
  @Input() resumeData: NsContent.IContinueLearningData | null = null
  // @Input() analytics: NsAnalytics.IAnalytics | null = null
  @Input() forPreview = false
  @Input() batchData!: any
  @Input() enrollCourse!: any
  @Input() resumeResource: NsContent.IContinueLearningData | null = null
  @Input() optmisticPercentage: number | null = null
  batchControl = new FormControl('', Validators.required)
  contentTypes = NsContent.EContentTypes
  isTocBanner = true
  issueCertificate = false
  updatedContentFound: any
  updatedContentStatus = false
  // contentProgress = 0
  bannerUrl: SafeStyle | null = null
  routePath = 'overview'
  validPaths = new Set(['overview', 'contents',
    // 'analytics'
  ])
  averageRating: any = ''
  totalRatings: any = ''
  routerParamSubscription: Subscription | null = null
  routeSubscription: Subscription | null = null
  firstResourceLink: { url: string; queryParams: { [key: string]: any } } | null = null
  resumeDataLink: { url: string; queryParams: { [key: string]: any } } | null = null
  isAssessVisible = false
  isPracticeVisible = false
  editButton = false
  reviewButton = false
  // analyticsDataClient: any = null
  // btnPlaylistConfig: NsPlaylist.IBtnPlaylist | null = null
  // btnGoalsConfig: NsGoal.IBtnGoal | null = null
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
  stars: number[] = [1, 2, 3, 4, 5];
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
    private onlineIndexedDbService: IndexedDBService,

    // private authAccessService: AccessControlService,
    @Inject(DOCUMENT) public document: Document
  ) {
  }
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    let url = sessionStorage.getItem('cURL') || '/page/home'
    if (url) {
      location.href = url
    }


  }

  ngOnInit() {
    if (sessionStorage.getItem('currentURL')) {
      sessionStorage.removeItem('currentURL')
    }
    this.enrollApi()

    if (this.content) {

      //this.readCourseRatingSummary()
      // this.fetchCohorts(this.cohortTypesEnum.ACTIVE_USERS, this.content.identifier)
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
      // this.btnPlaylistConfig = {
      //   contentId: this.content.identifier,
      //   contentName: this.content.name,
      //   contentType: this.content.contentType,
      //   mode: 'dialog',
      // }
      // this.btnGoalsConfig = {
      //   contentId: this.content.identifier,
      //   contentName: this.content.name,
      //   contentType: this.content.contentType,
      // }
    }
  }
  getStarImage(index: number): string {
    const fullStarUrl = '/fusion-assets/icons/toc_star.png'
    const halfStarUrl = '/fusion-assets/icons/Half_star1.svg'
    const emptyStarUrl = '/fusion-assets/icons/empty_star.png'

    const decimalPart = this.averageRating - Math.floor(this.averageRating) // Calculate the decimal part of the average rating

    if (index + 1 <= Math.floor(this.averageRating)) {
      return fullStarUrl // Full star
    } else if (decimalPart >= 0.1 && decimalPart <= 0.9 && index === Math.floor(this.averageRating)) {
      return halfStarUrl // Half star
    } else {
      return emptyStarUrl // Empty star
    }
  }



  setConfirmDialogStatus(percentage: any) {
    this.contentSvc.showConformation = percentage
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
  redirect() {
    console.log(this.configSvc, 'key')
    let local = (
      this.configSvc.unMappedUser &&
      this.configSvc.unMappedUser.profileDetails &&
      this.configSvc.unMappedUser.profileDetails.preferences &&
      this.configSvc.unMappedUser.profileDetails.preferences.language !== undefined
    )
      ? this.configSvc.unMappedUser.profileDetails.preferences.language
      : (location.href.includes('/hi/') ? 'hi' : '')
    local = local === 'en' ? '' : 'hi'
    console.log(local)
    let url = ''
    if (sessionStorage.getItem('cURL')) {
      url = sessionStorage.getItem('cURL') || ''
      location.href = url
    } else {
      url = local === 'hi' ? `${local}/page/home` : `${local}page/home`
      console.log(url)
      let url3 = `${document.baseURI}`
      if (url3.includes('hi')) {
        url3 = url3.replace(/hi\//g, '')
      }
      location.href = `${url3}${url}`
    }
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
      let lastResource = ''
      let lastResourceMimeType: any
      console.log(resumeDataV2, this.enrollCourse)
      this.onlineIndexedDbService.getRecordFromTable('userEnrollCourse', this.configSvc.userProfile!.userId, this.content.identifier).subscribe(async (record) => {
        console.log('Record:', record.contentId, this.enrollCourse.lastReadContentId, this.resumeResource)
        if (record.contentId) {
          this.updatedContentStatus = true
          //this.updatedContentFound = record
        } else {
          this.updatedContentStatus = false
        }
        let rowData = await record
        console.log(rowData)
        let data = JSON.parse(rowData.data)
        console.log(data)
        let url1 = ''
        if (rowData.url.includes('/chapters') || rowData.url.includes('/overview?primaryCategory=Course')) {
          console.log(rowData)
          if (data.contents[0].progressdetails.mimeType === "application/pdf") {
            url1 = `/viewer/pdf/${data.contents[0].contentId}?primaryCategory=Learning%20Resource&collectionId=${data.contents[0].courseId}&collectionType=Course&batchId=${data.contents[0].batchId}`
            console.log(url1, 'url')
            this.updatedContentFound = url1
          } else if (data.contents[0].progressdetails.mimeType === "video/mp4") {
            url1 = `/viewer/video/${data.contents[0].contentId}?primaryCategory=Learning%20Resource&collectionId=${data.contents[0].courseId}&collectionType=Course&batchId=${data.contents[0].batchId}`
            console.log(url1, 'url')
            this.updatedContentFound = url1
          } else if (data.contents[0].progressdetails.mimeType === "application/json") {
            url1 = `/viewer/pdf/${data.identifier}?primaryCategory=Learning%20Resource&collectionId=${this.content!.identifier}&collectionType=Course&batchId=${this.enrolledCourse.batchId}`
            console.log(url1)
            this.updatedContentFound = url1
          } else if (data.contents[0].progressdetails.mimeType === "application/vnd.ekstep.html-archive" || data.contents[0].progressdetails.mimeType === "text/x-url") {
            url1 = `/viewer/html/${data.identifier}?primaryCategory=Learning%20Resource&collectionId=${this.content!.identifier}&collectionType=Course&batchId=${this.enrolledCourse.batchId}`
            console.log(url1)
            this.updatedContentFound = url1

          }
        } else {
          console.log('opp')
          this.updatedContentFound = record.url
        }

      })

      let eCourse = this.enrollCourse.contentStatus
      if (Object.keys(eCourse).length > 0) {
        lastResource = Object.keys(eCourse)[Object.keys(eCourse).length - 1]
        this.content.children.filter((item: any) => {
          if (lastResource === item.identifier) {
            lastResourceMimeType = item.mimeType
          }
        })
      }

      if (resumeDataV2.identifier === '' && resumeDataV2.mimeType === undefined ||
        resumeDataV2.identifier === '' && resumeDataV2.mimeType === '') {
        console.log(lastResource, 'lr', this.content, lastResourceMimeType)
        this.resumeDataLink = viewerRouteGenerator(
          lastResource,
          lastResourceMimeType,
          this.isResource ? undefined : this.content.identifier,
          this.isResource ? undefined : this.content.contentType,
          this.forPreview,
          // this.content.primaryCategory
          'Learning Resource',
          this.getBatchId()
        )
      } else {
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

  // public handleEnrollmentEndDate(batch: any) {
  //   const enrollmentEndDate = dayjs(lodash.get(batch, 'enrollmentEndDate')).format('YYYY-MM-DD')
  //   const systemDate = dayjs()
  //   return enrollmentEndDate ? dayjs(enrollmentEndDate).isBefore(systemDate) : false
  // }

  redirectPage(updatedContentFound: any) {
    console.log(updatedContentFound, 'updatedContentFound', this.resumeResource)
    console.log(this.enrolledCourse, this.getBatchId())
    if (updatedContentFound === undefined) {
      let batchId = this.getBatchId()
      console.log(batchId, 'batchId')
      if (!batchId) {
        let u1 = `${document.baseURI}`
        console.log(u1)
        let u2 = u1.split("&")
        console.log(u2)
        let u3 = u2[0].split("Id=")
        console.log(u3)
        batchId = u3[1]
        console.log(batchId, 'batchId')
      }
      let url1 = `${this.firstResourceLink!.url}?primaryCategory=Learning%20Resource&collectionId=${this.content!.identifier}&collectionType=Course&batchId=${batchId}`
      console.log(url1, 'url13123')
      this.updatedContentFound = url1
      //location.href = url1
      this.router.navigateByUrl(url1)
    } else {
      let url2 = document.baseURI
      console.log(url2, 'url2')
      if (url2.includes('hi')) {
        url2 = url2.replace(/hi\//g, '')
      }
      let url1 = updatedContentFound.includes(url2)
      if (url1) {
        let u1 = updatedContentFound.split(document.baseURI).pop()
        this.router.navigateByUrl(u1)
      } else {
        this.router.navigateByUrl(updatedContentFound)
      }
      //location.href = updatedContentFound
    }
  }
  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }

  downloadCertificate(content: any) {
    let local = (this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails!.preferences && this.configSvc.unMappedUser!.profileDetails!.preferences!.language !== undefined) ? this.configSvc.unMappedUser.profileDetails.preferences.language : location.href.includes('/hi/') === true ? 'hi' : 'en'
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
                  // this.displayStyle = 'block'
                  // tslint:disable-next-line: max-line-length
                  // this.certificateMsg = 'Our certificate download will begin shortly. If it does not start after 3 minutes, please allow popups in the browser and try again or write to support@aastrika.org'
                  this.sendApi()
                  // trigger this.downloadCertificate

                } else {
                  // trigger request
                  // check for exisitng request

                  if (localStorage.getItem(`certificate_downloaded_${this.content ? this.content.identifier : ''}`) && duration <= 30) {
                    this.displayStyle = 'block'
                    // tslint:disable-next-line: max-line-length
                    if (local === 'en') {
                      this.certificateMsg = `You have already requested a certificate. Please check after ${30 - duration} minutes!`
                    } else {
                      this.certificateMsg = `आप पहले ही प्रमाणपत्र का अनुरोध कर चुके हैं. कृपया बाद में जांचें ${30 - duration} मिनट!`
                    }
                  } else {
                    this.contentSvc.processCertificate(req).subscribe((response: any) => {
                      if (response.responseCode === 'OK') {
                        this.sendApi()
                        // tslint:disable-next-line: max-line-length
                        localStorage.setItem(`certificate_downloaded_${this.content ? this.content.identifier : ''}`, moment(new Date()).toString())
                        this.displayStyle = 'block'
                        // tslint:disable-next-line: max-line-length
                        if (local === 'en') {
                          this.certificateMsg = `Your request for certificate has been successfully processed. Please download it after 30 minutes.`
                        } else {
                          this.certificateMsg = `प्रमाणपत्र के लिए आपका अनुरोध सफलतापूर्वक संसाधित कर दिया गया है। कृपया 30 मिनट बाद इसे डाउनलोड करें।`
                        }
                      } else {
                        this.displayStyle = 'block'
                        if (local === 'en') {
                          this.certificateMsg = 'Unable to request certificate at this moment. Please try later!'
                        } else {
                          this.certificateMsg = 'इस समय प्रमाणपत्र का अनुरोध करने में असमर्थ. बाद में कोशिश करें!'
                        }
                      }
                    },
                      err => {
                        this.displayStyle = 'block'
                        /* tslint:disable-next-line */
                        console.log(err.error.params.errmsg)
                        if (local === 'en') {
                          this.certificateMsg = 'Unable to request certificate at this moment. Please try later!'
                        } else {
                          this.certificateMsg = 'इस समय प्रमाणपत्र का अनुरोध करने में असमर्थ। बाद में कोशिश करें!'
                        }
                        // this.openSnackbar(err.error.params.errmsg)
                      })
                  }
                }

              }
            }
          })

      } else {
        this.displayStyle = 'block'
        // tslint:disable-next-line:max-line-length
        if (local === 'en') {
          this.certificateMsg = 'You have not finished all modules of the course. It is mandatory to complete all modules before you can request a certificate'
        } else {
          this.certificateMsg = 'आपने पाठ्यक्रम के सभी मॉड्यूल समाप्त नहीं किए हैं. प्रमाणपत्र का अनुरोध करने से पहले सभी मॉड्यूल को पूरा करना अनिवार्य है'
        }

      }
    } else {
      this.displayStyle = 'block'
      if (local === 'en') {
        // tslint:disable-next-line: max-line-length
        this.certificateMsg = 'Please enroll by clicking the Start button, finish all modules and then request for the certificate'
      } else {
        this.certificateMsg = 'कृपया स्टार्ट बटन पर क्लिक करके नामांकन करें, सभी मॉड्यूल समाप्त करें और फिर प्रमाणपत्र के लिए अनुरोध करें'
      }

    }

  }

  enrollApi() {
    let userId
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || ''
    }
    this.contentSvc.fetchUserBatchList(userId).subscribe(
      (courses: NsContent.ICourse[]) => {
        // let enrolledCourse: NsContent.ICourse | undefined
        if (this.content && this.content.identifier && !this.forPreview) {
          // tslint:disable-next-line:no-this-assignment
          if (courses && courses.length) {
            this.enrolledCourse = courses.find(course => {
              const identifier = this.content && this.content.identifier || ''
              if (course.courseId !== identifier) {
                return undefined
              }
              return course
            })
            if (this.enrolledCourse && this.enrolledCourse.issuedCertificates.length > 0) {
              this.issueCertificate = true
            }
            if (this.enrolledCourse) {
              this.resumeData = this.enrolledCourse.lastReadContentId
            }
            console.log(this.resumeData, this.content)
            console.log(this.optmisticPercentage, 'optmisticPercentage')
            this.onlineIndexedDbService.getRecordFromTable('userEnrollCourse', this.configSvc.userProfile!.userId, this.content!.identifier).subscribe(async (record) => {
              console.log('Record:', record)
              if (record.contentId) {
                this.updatedContentStatus = true
                this.updatedContentFound = record.url
              } else {
                // this.updatedContentStatus = false
              }
            }, async (error) => {
              this.updatedContentStatus = true
              console.log(this.enrolledCourse, 'this.enrolledCourse!')
              if (error && this.enrolledCourse && this.enrolledCourse!.batchId) {
                console.log('ewrwer')
                if (this.enrolledCourse.lastReadContentId) {
                  let url = ''
                  let data = await this.findObjectById(this.content!.children, this.enrolledCourse.lastReadContentId)
                  console.log(data, 'datahoooooray')
                  if (data.mimeType === "video/mp4") {
                    url = `/viewer/video/${data.identifier}?primaryCategory=Learning%20Resource&collectionId=${this.content!.identifier}&collectionType=Course&batchId=${this.enrolledCourse.batchId}`
                    console.log(url)
                  } else if (data.mimeType === "application/pdf") {
                    url = `/viewer/pdf/${data.identifier}?primaryCategory=Learning%20Resource&collectionId=${this.content!.identifier}&collectionType=Course&batchId=${this.enrolledCourse.batchId}`
                    console.log(url)
                  } else if (data.mimeType === "application/json") {
                    url = `/viewer/quiz/${data.identifier}?primaryCategory=Learning%20Resource&collectionId=${this.content!.identifier}&collectionType=Course&batchId=${this.enrolledCourse.batchId}`
                    console.log(url)
                  } else if (data.mimeType === "application/vnd.ekstep.html-archive" || data.mimeType === "text/x-url") {
                    url = `/viewer/html/${data.identifier}?primaryCategory=Learning%20Resource&collectionId=${this.content!.identifier}&collectionType=Course&batchId=${this.enrolledCourse.batchId}`
                    console.log(url)
                  }
                  this.updatedContentFound = url
                } else {
                  let url1 = `${this.firstResourceLink!.url}?primaryCategory=Learning%20Resource&collectionId=${this.content!.identifier}&collectionType=Course&batchId=${this.enrolledCourse.batchId}`
                  console.log(url1, 'url')
                  this.updatedContentFound = url1
                }
              }
              // else {
              //   let batchId = await this.getBatchId()
              //   console.log(batchId, 'batchId')
              //   if (!batchId) {
              //     let u1 = `${document.baseURI}`
              //     console.log(u1)
              //     let u2 = u1.split("&")
              //     console.log(u2)
              //     let u3 = u2[0].split("Id=")
              //     console.log(u3)
              //     batchId = u3[1]
              //     console.log(batchId, 'batchId')
              //   }
              //   let url1 = `${this.firstResourceLink!.url}?primaryCategory=Learning%20Resource&collectionId=${this.content!.identifier}&collectionType=Course&batchId=${batchId}`
              //   console.log(url1, 'url13123')
              //   this.updatedContentFound = url1
              // }
            }
            )
          }
        }
      })
  }

  findObjectById(array: any, id: any): any {
    console.log(array, id)
    for (const item of array) {
      if (item.identifier === id) {
        return item
      }
      if (item.children) {
        const result = this.findObjectById(item.children, id)
        if (result) {
          return result
        }
      }
    }
    return null
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
          // const self = this
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
              const name = this.enrolledCourse.courseName
              this.openPopup(certID, name)
              // this.contentSvc.downloadCertificateAPI(certID).toPromise().then((response: any) => {
              //   if (response.responseCode) {
              //     const img = new Image()
              //     const url = response.result.printUri
              //     img.onload = function () {

              //       const canvas: any = document.getElementById('certCanvas') || {}
              //       const ctx = canvas.getContext('2d')
              //       const imgWidth = img.width
              //       const imgHeight = img.height
              //       canvas.width = imgWidth
              //       canvas.height = imgHeight
              //       ctx.drawImage(img, 0, 0, imgWidth, imgHeight)
              //       let imgURI = canvas
              //         .toDataURL('image/jpeg')

              //       imgURI = decodeURIComponent(imgURI.replace('data:image/jpeg,', ''))
              //       const arr = imgURI.split(',')
              //       const mime = arr[0].match(/:(.*?);/)[1]
              //       const bstr = atob(arr[1])
              //       let n = bstr.length
              //       const u8arr = new Uint8Array(n)
              //       while (n) {
              //         n = n - 1
              //         u8arr[n] = bstr.charCodeAt(n)
              //       }
              //       const blob = new Blob([u8arr], { type: mime })
              //       FileSaver.saveAs(blob, `${name}`)
              //       if (localStorage.getItem(`certificate_downloaded_${self.content ? self.content.identifier : ''}`)) {
              //         localStorage.removeItem(`certificate_downloaded_${self.content ? self.content.identifier : ''}`)
              //       }
              //     }
              //     //  DOMURL.revokeObjectURL(url)
              //     img.src = url
              //   }
              // })
            } else {
              // this.displayStyle = 'block'
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
    sessionStorage.setItem('currentURL', location.href)
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
    const lastItem = this.resumeResource && this.resumeResource.pop()
    return {
      identifier: lastItem ? lastItem.contentId : '',
      mimeType: lastItem ? lastItem.progressdetails && lastItem.progressdetails.mimeType : '',

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
  // playIntroVideo() {
  //   if (this.content) {
  //     this.dialog.open(AppTocDialogIntroVideoComponent, {
  //       data: this.content.introductoryVideo,
  //       height: '350px',
  //       width: '620px',
  //     })
  //   }
  // }
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
  // giveRating(batchData: any) {
  //   if (batchData) {
  //     const data = {
  //       courseId: batchData[0].courseId,
  //     }
  //     const dialogRef = this.dialog.open(ConfirmmodalComponent, {
  //       width: '300px',
  //       height: '400px',
  //       data: { request: data, message: 'Congratulations!, you have completed the course' },
  //       disableClose: false,
  //     })

  //     dialogRef.afterClosed().subscribe((data: { ratingsForm: FormGroup, rating: number }) => {
  //       console.log("data: ", data)
  //     })
  //   }

  // }
  readCourseRating(data: any) {
    console.log("read rating", data)
    let userId = ''
    if (data) {
      if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId || ''
      }
      let req
      if (this.content) {
        req = {
          request: {
            userId,
            activityId: data.courseId,
            activityType: "Course",
          },
        }
      }

      this.contentSvc.readCourseRating(req).then((data: any) => {

        if (data && data.result && data.result.count > 0) {


          console.log("data: " + data.result.content[0])


        } else {
          this.openSnackbar('Something went wrong, please try again later!')
          this.disableEnrollBtn = false
        }
      })
        .catch((err: any) => {
          console.log("err", err)
          this.openSnackbar(err.error.message)
        })
    }

  }
  readCourseRatingSummary() {
    if (this.content) {

      let req
      req = { activityId: this.content.identifier }
      console.log("req", req)
      this.contentSvc.readCourseRatingSummary(req).then((data: any) => {

        if (data && data.result && data.result.message === 'Successful') {
          if (data.result.response) {
            let res = data.result.response
            this.averageRating = (res.sum_of_total_ratings / res.total_number_of_ratings).toFixed(1)
            this.totalRatings = res.total_number_of_ratings
            console.log("data: ", res, data.result.response, this.totalRatings)
          }


        } else {
          this.disableEnrollBtn = false
        }
      })
        .catch((err: any) => {
          console.log("err", err)
        })
    }

  }

  enrollUser(batchData: any) {
    console.log("enrollUser", batchData)
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
  // openDialog(content: any): void {
  // const dialogRef = this.createBatchDialog.open(CreateBatchDialogComponent, {
  // this.createBatchDialog.open(CreateBatchDialogComponent, {
  //   // height: '400px',
  //   width: '600px',
  //   data: { content },
  // })
  // dialogRef.componentInstance.xyz = this.configSvc
  // dialogRef.afterClosed().subscribe((_result: any) => {
  //   if (!this.batchId) {
  //     this.tocSvc.updateBatchData()
  //   }
  // })
  // }
  openPopup(content: any, tocConfig: any) {
    this.dialog.open(AppTocCertificateModalComponent, {
      width: '100vw',
      height: '80vh',
      data: { content, tocConfig, type: 'DETAILS' },
      disableClose: false,
    })
  }
  openDetails(content: any, tocConfig: any) {
    this.dialog.open(AppTocDesktopModalComponent, {
      width: '600px',
      data: { content, tocConfig, type: 'DETAILS' },
      disableClose: true,
    })
  }
  openCompetency(content: any) {
    this.dialog.open(AppTocDesktopModalComponent, {
      width: '600px',
      data: { competency: content.competencies_v1, type: 'COMPETENCY' },
    })
  }
}
