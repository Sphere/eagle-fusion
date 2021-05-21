import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material'
import { DomSanitizer, SafeStyle } from '@angular/platform-browser'
import { ActivatedRoute, Event, NavigationEnd, Router } from '@angular/router'
import {
  ContentProgressService,
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
  contentTypes = NsContent.EContentTypes
  contentProgress = 0
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

  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private tocSvc: AppTocService,
    private configSvc: ConfigurationsService,
    private progressSvc: ContentProgressService,
    private contentSvc: WidgetContentService,
    private utilitySvc: UtilityService,
    private mobileAppsSvc: MobileAppsService,
    // private authAccessService: AccessControlService,
  ) { }

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

    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
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
    if (!(this.tocConfig && this.tocConfig.postAssessment)) {
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
      this.resumeDataLink = viewerRouteGenerator(
        this.resumeData.identifier,
        this.resumeData.mimeType,
        this.isResource ? undefined : this.content.identifier,
        this.isResource ? undefined : this.content.contentType,
        this.forPreview,
        this.content.primaryCategory,
      )
    }
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
  ngOnDestroy() {
    this.tocSvc.analyticsFetchStatus = 'none'
    if (this.routerParamSubscription) {
      this.routerParamSubscription.unsubscribe()
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe()
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
      if (!this.forPreview) {
        this.progressSvc.getProgressFor(this.content.identifier).subscribe(data => {
          this.contentProgress = data
        })
      }
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
}
