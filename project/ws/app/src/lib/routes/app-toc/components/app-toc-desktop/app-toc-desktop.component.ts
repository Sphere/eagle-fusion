import { Component, Input, OnChanges, OnDestroy, OnInit, HostListener, Inject, ChangeDetectorRef, effect } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { SafeStyle } from '@angular/platform-browser'
import { ActivatedRoute, Event, NavigationEnd, Router } from '@angular/router'
import {
  NsContent,
  viewerRouteGenerator,
  WidgetContentService,
} from '@ws-widget/collection'
import { ConfigurationsService, TelemetryService, TFetchStatus, LoggerService, SafeResourceUrlService } from '@ws-widget/utils'
import { UtilityService } from '@ws-widget/utils/src/lib/services/utility.service'
import { Subscription } from 'rxjs'
import { NsAppToc, NsCohorts } from '../../models/app-toc.model'
import { AppTocService } from '../../services/app-toc.service'
import { MobileAppsService } from 'src/app/services/mobile-apps.service'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import moment from 'moment'
import { IndexedDBService } from 'src/app/services/online-indexed-db.service'
import { DOCUMENT } from '@angular/common'
import { AppTocDesktopModalComponent } from '../app-toc-desktop-modal/app-toc-desktop-modal.component'
import { AppTocCertificateModalComponent } from '../app-toc-certificate-modal/app-toc-certificate-modal.component'
import { ConfirmmodalComponent } from '../../../../../../../viewer/src/lib/plugins/quiz/confirm-modal-component'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { TranslateService } from '@ngx-translate/core'
import { ThemeService } from '../../../../../../../../../src/app/services/theme.service'
import { hasCompetencyData } from '../../utils/competency.util'
@Component({
  standalone: false,
  selector: 'ws-app-app-toc-desktop',
  templateUrl: './app-toc-desktop.component.html',
  styleUrls: ['./app-toc-desktop.component.scss'],
  providers: [],

})
export class AppTocDesktopComponent implements OnInit, OnChanges, OnDestroy {
  @Input() banners: NsAppToc.ITocBanner | null = null
  @Input() content: NsContent.IContent | null = null
  @Input() resumeData: NsContent.IContinueLearningData | null = null
  @Input() forPreview = false
  @Input() batchData!: any
  @Input() enrollCourse!: any
  @Input() resumeResource: NsContent.IContinueLearningData | null = null
  @Input() optmisticPercentage: number | null = null
  @Input() finishedPercentage: any
  batchControl = new FormControl<NsContent.IBatch | null>(null, Validators.required)
  contentTypes = NsContent.EContentTypes
  isTocBanner = true
  issueCertificate = false
  updatedContentFound: any
  updatedContentStatus = false
  bannerUrl: SafeStyle | null = null
  routePath = 'overview'
  validPaths = new Set(['overview', 'contents'])
  averageRating: any = ''
  totalRatings: any = ''
  routerParamSubscription: Subscription | null = null
  routeSubscription: Subscription | null = null
  firstResourceLink: { url: string; queryParams: { [key: string]: any } } | null = null
  resumeDataLink: { url: string; queryParams: { [key: string]: any } } | null = null
  isAssessVisible = false
  isPracticeVisible = false
  hasCompetencies = false
  editButton = false
  reviewButton = false
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
    [key: string]: { hasError: boolean; contents: NsCohorts.ICohortsContent[], count: number }
  } = {}
  identifier: any
  cohortTypesEnum = NsCohorts.ECohortTypes
  defaultSLogo = ''
  disableEnrollBtn = false
  batchId!: string
  enrolledCourse: any
  lastCourseID: any
  stars: number[] = [1, 2, 3, 4, 5]
  isDark: boolean

  constructor(
    private readonly sanitizer: SafeResourceUrlService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly dialog: MatDialog,
    private readonly tocSvc: AppTocService,
    private readonly configSvc: ConfigurationsService,
    private readonly contentSvc: WidgetContentService,
    private readonly utilitySvc: UtilityService,
    private readonly mobileAppsSvc: MobileAppsService,
    private readonly snackBar: MatSnackBar,
    public createBatchDialog: MatDialog,
    private readonly loader: LoaderService,
    private readonly onlineIndexedDbService: IndexedDBService,
    @Inject(DOCUMENT) public document: Document,
    private readonly telemetrySvc: TelemetryService,
    private readonly logger: LoggerService,
    private readonly translate: TranslateService,
    private readonly cdr: ChangeDetectorRef,
    private readonly themeSvc: ThemeService
  ) {
    effect(() => {
      this.isDark = this.themeSvc.isDark()
    })
  }

  @HostListener('window:popstate', [])
  onPopState() {
    const url = sessionStorage.getItem('cURL') || '/page/home'
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
      this.logger.log(this.optmisticPercentage, '149', this.finishedPercentage)
      this.readCourseRatingSummary()
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
    this.checkRegistrationStatus()
    this.routerParamSubscription = this.router.events.subscribe((routerEvent: Event) => {
      if (routerEvent instanceof NavigationEnd) {
        this.assignPathAndUpdateBanner(routerEvent.url)
      }
    })

    if (this.configSvc.restrictedFeatures) {
      this.isGoalsEnabled = !this.configSvc.restrictedFeatures.has('goals')
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
    this.logger.log(this.configSvc, 'key')
    let url = ''

    // ✅ Check if orgSelectiveConfig matches and redirect accordingly
    const rootOrgId = this.configSvc.userProfile?.rootOrgId || ''
    const orgSelectiveConfig = this.configSvc.orgSelectiveCourseConfig

    if (sessionStorage.getItem('cURL')) {
      url = sessionStorage.getItem('cURL') || ''
      if (url.startsWith('http://') || url.startsWith('https://')) {
        const parsed = new URL(url)
        url = parsed.pathname + parsed.search + parsed.hash
      }
      this.router.navigateByUrl(url)
    } else if (orgSelectiveConfig && orgSelectiveConfig.orgId === rootOrgId) {
      // ✅ Redirect to selective org course page instead of home
      const redirectUrl = orgSelectiveConfig.redirectUrl || '/page/home'
      this.logger.log('Redirecting to selective org page:', redirectUrl)
      this.router.navigate([redirectUrl])
    } else {
      this.router.navigate(['/page/home'])
    }
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
  }

  ngOnChanges() {
    this.assignPathAndUpdateBanner(this.router.url)
    const collectionArry = this.updateContentDerivedState()
    if (this.resumeData && this.content) {
      this.processResumeData(collectionArry)
    }
    this.subscribeBatchControlChanges()
  }

  private updateContentDerivedState(): any {
    let collectionArry: any
    // Gate the Competency action on parsed data, not on the raw string — '[]' is truthy and
    // used to show a button that opened an empty dialog.
    this.hasCompetencies = hasCompetencyData((this.content as any)?.competencies_v1)
    if (this.content) {
      this.updatedContentStatus = !(this.optmisticPercentage === 0 && this.finishedPercentage === undefined)
      this.cdr.detectChanges()
      collectionArry = this.uniqueIdsByContentType(this.content!.children, 'Resource')
      this.logger.log(collectionArry, 'collectionArry')
      this.fetchExternalContentAccess()
      this.modifySensibleContentRating()
      this.assignPathAndUpdateBanner(this.router.url)
      this.getLearningUrls()
    }
    return collectionArry
  }

  private processResumeData(collectionArry: any) {
    const resumeDataV2 = this.getResumeDataFromList()
    this.logger.log(resumeDataV2, this.enrollCourse)
    this.onlineIndexedDbService.getRecordFromTable(
      'userEnrollCourse', this.configSvc.userProfile!.userId, this.content!.identifier,
    ).subscribe(
      record => {
        void this.applyResumeRecordSuccess(record, collectionArry)
      },
      err => {
        this.applyResumeRecordError(err)
      })

    const { lastResource, lastResourceMimeType } = this.deriveLastResourceInfo()
    this.setResumeDataLink(resumeDataV2, lastResource, lastResourceMimeType)
  }

  private async applyResumeRecordSuccess(record: any, collectionArry: any) {
    this.logger.log('Record:', record.contentId, this.enrollCourse.lastReadContentId, this.resumeResource)
    this.updatedContentStatus = !!record.contentId
    this.cdr.detectChanges()
    const rowData = await record
    this.logger.log(rowData)
    const data = JSON.parse(rowData.data)
    this.logger.log(data)
    if (rowData.url.includes('/chapters') || rowData.url.includes('/overview?primaryCategory=Course')) {
      this.logger.log(rowData)
      this.handleChaptersOverviewCase(data, collectionArry)
    } else {
      this.handleGenericResumeUrl(rowData, collectionArry)
    }
  }

  private handleChaptersOverviewCase(data: any, collectionArry: any) {
    this.logger.log(this.finishedPercentage, this.optmisticPercentage, '372')
    if (this.optmisticPercentage === 100 && data.contents[0].completionPercentage === 100) {
      this.handleCompletedResumeCase(data, collectionArry)
    } else {
      const url1 = this.resolveResourceUrlForMimeType(data)
      if (url1) {
        this.logger.log(url1, 'url')
        this.updatedContentFound = url1
      }
    }
  }

  private handleCompletedResumeCase(data: any, collectionArry: any) {
    const matchId = data.contents[0].contentId
    const lastItem = collectionArry[collectionArry.length - 1]
    this.logger.log(matchId, lastItem)
    if (matchId === lastItem) {
      const url1 = `${this.firstResourceLink!.url}?primaryCategory=Learning%20Resource&collectionId=${this.content!.identifier}&collectionType=Course&batchId=${data.contents[0].batchId}`
      this.logger.log(url1, 'url')
      this.updatedContentFound = url1
    } else if (data.contents[0].progressdetails.mimeType === "application/pdf") {
      const url1 = this.buildViewerUrl('pdf', data.contents[0].contentId, data.contents[0].courseId, data.contents[0].batchId)
      this.logger.log(url1, 'url')
      this.updatedContentFound = url1
    }
  }

  private resolveResourceUrlForMimeType(data: any): string {
    const mimeType = data.contents[0].progressdetails.mimeType
    const c = data.contents[0]
    if (mimeType === 'application/pdf') {
      return this.buildViewerUrl('pdf', c.contentId, c.courseId, c.batchId)
    }
    if (mimeType === 'video/mp4') {
      return this.buildViewerUrl('video', c.contentId, c.courseId, c.batchId)
    }
    if (mimeType === 'application/json') {
      return this.buildViewerUrl('pdf', data.identifier, this.content!.identifier, this.enrolledCourse.batchId)
    }
    if (mimeType === 'application/vnd.ekstep.html-archive' || mimeType === 'text/x-url') {
      return this.buildViewerUrl('html', data.identifier, this.content!.identifier, this.enrolledCourse.batchId)
    }
    return ''
  }

  private buildViewerUrl(kind: 'pdf' | 'video' | 'html', contentId: string, collectionId: string, batchId: string): string {
    return `/viewer/${kind}/${contentId}?primaryCategory=Learning%20Resource&collectionId=${collectionId}&collectionType=Course&batchId=${batchId}`
  }

  private handleGenericResumeUrl(rowData: any, collectionArry: any) {
    this.logger.log('opp', this.optmisticPercentage, 'l', rowData.url)
    const url = rowData.url
    const regex = /do_\d+(?=\?primaryCategory)/
    const match = url.match(regex)
    if (!match) {
      this.logger.log('Identifier not found')
      return
    }
    this.logger.log(match[0], collectionArry)
    const matchId = match[0]
    const lastItem = collectionArry[collectionArry.length - 1]
    if (matchId === lastItem && this.optmisticPercentage === 100) {
      const url1 = `${this.firstResourceLink!.url}?primaryCategory=Learning%20Resource&collectionId=${this.content!.identifier}&collectionType=Course&batchId=${this.enrolledCourse.batchId}`
      this.logger.log(url1, 'url')
      this.updatedContentFound = url1
    } else {
      this.updatedContentFound = rowData.url
    }
  }

  private applyResumeRecordError(err: any) {
    this.logger.log(err)
    const collectionArry = this.uniqueIdsByContentType(this.content!.children, 'Resource')
    const regex = /do_\d+(?=\?primaryCategory)/
    const match = this.updatedContentFound?.match(regex)
    if (!match) {
      this.logger.log('Identifier not found')
      return
    }
    this.logger.log(match[0], collectionArry)
    const matchId = match[0]
    const lastItem = collectionArry[collectionArry.length - 1]
    if (matchId === lastItem && this.optmisticPercentage === 100) {
      const url1 = `${this.firstResourceLink!.url}?primaryCategory=Learning%20Resource&collectionId=${this.content!.identifier}&collectionType=Course&batchId=${this.enrolledCourse.batchId}`
      this.logger.log(url1, 'url')
      this.updatedContentFound = url1
    }
  }

  private deriveLastResourceInfo(): { lastResource: string, lastResourceMimeType: any } {
    let lastResource = ''
    let lastResourceMimeType: any
    const eCourse = this.enrollCourse.contentStatus
    if (Object.keys(eCourse).length > 0) {
      lastResource = Object.keys(eCourse)[Object.keys(eCourse).length - 1]
      this.content!.children.forEach((item: any) => {
        if (lastResource === item.identifier) {
          lastResourceMimeType = item.mimeType
        }
      })
    }
    return { lastResource, lastResourceMimeType }
  }

  private setResumeDataLink(resumeDataV2: { identifier: string, mimeType: any }, lastResource: string, lastResourceMimeType: any) {
    const useLastResource = (resumeDataV2.identifier === '' && resumeDataV2.mimeType === undefined) ||
      (resumeDataV2.identifier === '' && resumeDataV2.mimeType === '')
    this.resumeDataLink = viewerRouteGenerator(
      useLastResource ? lastResource : resumeDataV2.identifier,
      useLastResource ? lastResourceMimeType : resumeDataV2.mimeType,
      this.isResource ? undefined : this.content!.identifier,
      this.isResource ? undefined : this.content!.contentType,
      this.forPreview,
      'Learning Resource',
      this.getBatchId()
    )
  }

  private subscribeBatchControlChanges() {
    this.batchControl.valueChanges.subscribe((batch: NsContent.IBatch | null) => {
      this.disableEnrollBtn = true
      if (!batch) {
        return
      }
      let userId = ''
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
          this.openSnackbar(this.translate.instant("ENROLL_SUCCESS"))
          this.disableEnrollBtn = false
        } else {
          this.openSnackbar(this.translate.instant("ERROR_MSG"))
          this.disableEnrollBtn = false
        }
      })
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


  redirectPage(updatedContentFound: any) {
    this.telemetrySvc.interact('redirect-clicked', 'click', 'toc-page', { id: this.content!.identifier, type: 'course', version: "", rollup: {} })
    if (updatedContentFound === undefined) {
      let batchId = this.getBatchId()
      this.logger.log(batchId, 'batchId')
      if (!batchId) {
        const u1 = `${document.baseURI}`
        const u2 = u1.split("&")
        const u3 = u2[0].split("Id=")
        batchId = u3[1]
      }
      const url1 = `${this.firstResourceLink!.url}?primaryCategory=Learning%20Resource&collectionId=${this.content!.identifier}&collectionType=Course&batchId=${batchId}`
      this.logger.log(url1, 'url13123')
      this.updatedContentFound = url1
      this.router.navigateByUrl(url1)
    } else {
      const url2 = document.baseURI
      this.logger.log(url2, 'url2')
      const url1 = updatedContentFound.includes(url2)
      if (url1) {
        const u1 = updatedContentFound.split(url2).pop()
        this.router.navigateByUrl(u1)
      } else {
        this.router.navigateByUrl(updatedContentFound)
      }
    }
  }
  private openSnackbar(primaryMsg: string, duration = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }

  downloadCertificate(content: any) {
    this.logger.log(this.optmisticPercentage)

    // is enrolled?
    if (!this.batchData.enrolled) {
      this.openSnackbar(this.translate.instant("ENROLL_ALERT"))
      return
    }
    let userId = ''
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || ''
    }
    const duration = this.getCertificateDownloadDuration()

    if (this.content && this.content.identifier && content.completionPercentage === 100) {
      this.requestCertificateIfNeeded(userId, duration)
    } else {
      this.showCertificateAlertDialog()
    }
  }

  private getCertificateDownloadDuration(): number {
    const key = `certificate_downloaded_${this.content ? this.content.identifier : ''}`
    const stored = localStorage.getItem(key)
    if (!stored) {
      return undefined as any
    }
    const customerDate = moment(stored)
    const dateNow = moment(new Date())
    return dateNow.diff(customerDate, 'minutes')
  }

  private showCertificateAlertDialog() {
    // tslint:disable-next-line:max-line-length
    if (this.optmisticPercentage != 100) {
      this.dialog.open(AppTocDesktopModalComponent, {
        width: '480px',
        data: { type: 'ALERT', message: this.translate.instant("ALERT_CERTIFICATE_MSG") },
      })
    } else {
      this.dialog.open(AppTocDesktopModalComponent, {
        width: '312px',
        data: { type: 'SUCCESS', message: this.translate.instant('CERTIFICATE_REQ_SUCESSFULL') },
      })
    }
  }

  private requestCertificateIfNeeded(userId: string, duration: number) {
    const req = {
      request: {
        courseId: this.content!.identifier,
        batchId: this.getBatchId(),
        userIds: [userId],
      },
    }
    // check if certificate is already generated
    this.contentSvc.fetchUserBatchList(userId).subscribe(
      (courses: NsContent.ICourse[]) => {
        this.handleCertificateBatchList(courses, duration, req)
      })
  }

  private handleCertificateBatchList(courses: NsContent.ICourse[], duration: number, req: any) {
    if (!(this.content && this.content.identifier && !this.forPreview)) {
      return
    }
    if (!(courses && courses.length)) {
      return
    }
    this.enrolledCourse = courses.find(course => {
      const identifier = this.content && this.content.identifier || ''
      return course.courseId === identifier
    })
    if (this.enrolledCourse && this.enrolledCourse.issuedCertificates.length > 0) {
      this.sendApi()
      return
    }
    // trigger request
    // check for exisitng request
    this.processCertificateRequest(duration, req)
  }

  private processCertificateRequest(duration: number, req: any) {
    const key = `certificate_downloaded_${this.content ? this.content.identifier : ''}`
    if (localStorage.getItem(key) && duration <= 30) {
      const dur = (30 - duration)
      this.openSnackbar(this.translate.instant("REQUEST_CERTIFICATE", { duration: dur }))
      return
    }
    this.contentSvc.processCertificate(req).subscribe((response: any) => {
      if (response.responseCode === 'OK') {
        this.sendApi()
        localStorage.setItem(key, moment(new Date()).toString())
        this.dialog.open(AppTocDesktopModalComponent, {
          width: '312px',
          data: { type: 'SUCCESS', message: this.translate.instant('CERTIFICATE_REQ_SUCESSFULL') },
        })
      } else {
        this.openSnackbar(this.translate.instant("REQUEST_CERTIFICATE_FAILED"))
      }
    },
      err => {
        this.logger.log(err.error.params.errmsg)
        this.openSnackbar(this.translate.instant("REQUEST_CERTIFICATE_FAILED"))
      })
  }

  redirectFirstResource(url: any) {
    const url1 = `${this.firstResourceLink!.url}?primaryCategory=Learning%20Resource&collectionId=${url.queryParams!.collectionId}&collectionType=Course&batchId=${url.queryParams!.batchId}`
    this.router.navigateByUrl(url1)
  }


  enrollApi() {
    let userId
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || ''
    }
    this.contentSvc.fetchUserBatchList(userId).subscribe(
      (courses: NsContent.ICourse[]) => {
        this.handleEnrollApiResponse(courses)
      })
  }

  private handleEnrollApiResponse(courses: NsContent.ICourse[]): void {
    if (!this.content || !this.content.identifier || this.forPreview || !(courses && courses.length)) {
      return
    }
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
    this.cdr.detectChanges()
    if (this.enrolledCourse) {
      this.resumeData = this.enrolledCourse.lastReadContentId
    }
    this.logger.log(this.resumeData, this.content)
    this.logger.log(this.optmisticPercentage, 'optmisticPercentage', this.finishedPercentage, '705')
    this.onlineIndexedDbService.getRecordFromTable('userEnrollCourse', this.configSvc.userProfile!.userId, this.content!.identifier).subscribe(
      record => this.handleEnrollRecordFound(record),
      error => this.handleEnrollRecordMissing(error),
    )
  }

  private handleEnrollRecordFound(record: any): void {
    void (async () => {
      this.logger.log('Record:', record)
      if (record.contentId) {
        this.updatedContentStatus = true
        this.updatedContentFound = record.url
      }
      this.cdr.detectChanges()
    })()
  }

  private async handleEnrollRecordMissing(error: any): Promise<void> {
    this.updatedContentStatus = true
    this.logger.log(this.enrolledCourse, 'this.enrolledCourse!')
    if (error && this.enrolledCourse?.batchId) {
      this.logger.log('ewrwer')
      await this.resolveResumeUrl()
    }
    this.cdr.detectChanges()
  }

  private async resolveResumeUrl(): Promise<void> {
    if (!this.enrolledCourse!.lastReadContentId) {
      this.updatedContentStatus = false
      const url1 = `${this.firstResourceLink!.url}?primaryCategory=Learning%20Resource&collectionId=${this.content!.identifier}&collectionType=Course&batchId=${this.enrolledCourse!.batchId}`
      this.logger.log(url1, 'url')
      this.updatedContentFound = url1
      return
    }
    const data = await this.findObjectById(this.content!.children, this.enrolledCourse!.lastReadContentId)
    this.logger.log(data, 'datahoooooray')
    this.updatedContentFound = this.buildResumeUrl(data)
  }

  private buildResumeUrl(data: any): string {
    const mimeToViewer: Record<string, string> = {
      "video/mp4": "video",
      "application/pdf": "pdf",
      "application/json": "quiz",
      "application/vnd.ekstep.html-archive": "html",
      "text/x-url": "html",
    }
    const viewer = mimeToViewer[data.mimeType]
    if (!viewer) {
      return ''
    }
    const url = `/viewer/${viewer}/${data.identifier}?primaryCategory=Learning%20Resource&collectionId=${this.content!.identifier}&collectionType=Course&batchId=${this.enrolledCourse!.batchId}`
    this.logger.log(url)
    return url
  }

  findObjectById(array: any, id: any): any {
    this.logger.log(array, id)
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
            if (this.enrolledCourse?.issuedCertificates?.length > 0) {
              const certID = this.enrolledCourse.issuedCertificates[0].identifier || ''
              const name = this.enrolledCourse.courseName
              this.openPopup(certID, name)
            }
          }
        }
      })
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
      this.bannerUrl = this.sanitizer.trustStyle(
        `url(${this.banners[this.routePath]})`,
      )
    }
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
    // Carry the ASHA context onto the viewer route so the player (viewer-toc) can detect an
    // ASHA course and show the complete-courses flow (lost otherwise on overview → viewer).
    const ashaParams = this.getAshaParams()
    if (this.firstResourceLink && (type === 'START' || type === 'START_OVER')) {
      return this.finalizeQueryParams({
        ...this.firstResourceLink.queryParams,
        viewMode: type,
        batchId: this.getBatchId(),
        ...ashaParams,
      })
    }
    if (this.resumeDataLink && type === 'RESUME') {
      return this.finalizeQueryParams({
        ...this.resumeDataLink.queryParams,
        batchId: this.getBatchId(),
        viewMode: 'RESUME',
        ...ashaParams,
      })
    }
    if (this.forPreview) {
      return {}
    }
    return {
      batchId: this.getBatchId(),
      viewMode: type,
      ...ashaParams,
    }
  }

  private getAshaParams(): { [key: string]: string } {
    const q = this.route.snapshot.queryParams
    return q.isAsha === 'true' ? {
      isAsha: q.isAsha,
      competencyid: q.competencyid,
      levelId: q.levelId,
      courseid: q.courseid,
    } : {}
  }

  private finalizeQueryParams(qParams: { [key: string]: string }): { [key: string]: string } {
    let result = qParams
    if (this.contextId && this.contextPath) {
      result = {
        ...result,
        collectionId: this.contextId,
        collectionType: this.contextPath,
      }
    }
    if (this.forPreview) {
      delete result.viewMode
    }
    return result
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

  openRating(data: any) {
    this.logger.log("read rating", data)
    let userId = ''
    if (data) {
      if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId || ''
      }
      let req
      if (this.content) {
        req = {
          request: {
            userId: [userId],
            activityId: data,
            activityType: "Course",
          },
        }
      }
      this.loader.changeLoad.next(true)

      this.contentSvc.readCourseRating(req).then((res: any) => {
        if (res && res.params.status === 'success') {
          this.logger.log("response", res)

          const courseData = {
            courseId: data,
            courseRating: res.result,
          }
          this.loader.changeLoad.next(false)

          const dialogRef = this.dialog.open(ConfirmmodalComponent, {
            width: '300px',
            height: '420px',
            data: { request: courseData, message: this.translate.instant('COURSE_COMPLETION_MSG') },
            disableClose: false,
          })

          dialogRef.afterClosed().subscribe((data: { event: any, ratingsForm: FormGroup, rating: number }) => {
            this.logger.log("data: ", data)
            if (data && data.event && data.event === "CONFIRMED")
              this.readCourseRatingSummary()
          })


        } else {
          this.loader.changeLoad.next(false)

          this.openSnackbar(this.translate.instant('ERROR_MSG'))
          this.disableEnrollBtn = false
        }
      })
        .catch((err: any) => {
          this.loader.changeLoad.next(false)
          this.logger.log("err", err)
          this.openSnackbar(this.translate.instant('ERROR_MSG'))
        })
    }
  }

  readCourseRatingSummary() {
    if (this.content) {

      let req
      req = { activityId: this.content.identifier }
      this.logger.log("req", req)
      this.contentSvc.readCourseRatingSummary(req).then((data: any) => {

        if (data && data.result && data.result.message === 'Successful') {
          if (data.result.response) {
            const res = data.result.response
            this.averageRating = (res.sum_of_total_ratings / res.total_number_of_ratings).toFixed(1)
            this.totalRatings = res.total_number_of_ratings
            this.logger.log("data: ", res, data.result.response, this.totalRatings)
            this.cdr.detectChanges()
          }
        } else {
          this.disableEnrollBtn = false
        }
      })
        .catch((err: any) => {
          this.logger.log("err", err)
        })
    }

  }

  enrollUser(batchData: any) {
    this.logger.log("enrollUser", batchData)
    let userId = ''
    if (batchData) {
      if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId || ''
      }
      const req = {
        request: {
          userId,
          courseId: batchData[0]?.courseId,
          batchId: batchData[0]?.batchId,
        },
      }
      this.contentSvc.enrollUserToBatch(req).then((data: any) => {
        if (data && data.result && data.result.response === 'SUCCESS') {
          this.router.navigate(
            [],
            {
              relativeTo: this.route,
              queryParams: { batchId: batchData[0].batchId },
              queryParamsHandling: 'merge',
            })
          this.openSnackbar(this.translate.instant('ENROLL_SUCCESS'))
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
          this.openSnackbar(this.translate.instant('ERROR_MSG'))
          this.disableEnrollBtn = false
        }
      })
        .catch((err: any) => {

          this.openSnackbar(this.translate.instant(err.error.params.errmsg))
        })
    }

  }

  openPopup(content: any, tocConfig: any) {
    this.dialog.open(AppTocCertificateModalComponent, {
      width: '90vw',
      maxWidth: '900px',
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
