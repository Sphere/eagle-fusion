import { Component, OnInit, ElementRef, Input, OnDestroy, QueryList, ViewChildren, OnChanges, SimpleChanges, signal, computed } from '@angular/core'
import { NavigationExtras, Router } from '@angular/router'
import { uniqBy } from 'lodash-es'
import { MatDialog } from '@angular/material/dialog'
import { OrgServiceService } from '../../../../project/ws/app/src/lib/routes/org/org-service.service'
import { ScrollService } from '../../services/scroll.service'
import { ConfigurationsService, LoggerService, ValueService } from '@ws-widget/utils'
import { forkJoin, firstValueFrom } from 'rxjs'
import { PlaylistService } from '../../services/playlist.service'
import { LanguageService } from '../../services/language.service'
import { Subject } from 'rxjs'
import { WidgetUserService } from '../../../../library/ws-widget/collection/src/public-api'

@Component({
  standalone: false,
  selector: 'ws-web-public-container',
  templateUrl: './web-public-container.component.html',
  styleUrls: ['./web-public-container.component.scss'],
})
export class WebPublicComponent implements OnInit, OnChanges, OnDestroy {
  myCourse: any

  private readonly destroy$ = new Subject<void>()
  private readonly courseRecommendationTimeout: any

  topCertifiedCourse = signal<any[]>([])
  cneCourse = signal<any[]>([])
  coursesForYou = signal<any[]>([])
  coursesForEK = signal<any[]>([])
  programCourses = signal<any[]>([])
  ashaLearningItems = signal<any[]>([])
  videoData: any
  homeFeatureData: any
  homeFeature: any
  userId: any
  firstName: any
  topCertifiedCourseIdentifier: any = []
  cneCoursesIdentifier: any = []
  yourPlansCourseIdentifier: any = []
  programIdentifiers: any = []
  featuredCourseIdentifier: any = []
  @Input() userEnrollCourse: any
  @Input() isEkshamata: any
  @Input() configData: any
  @Input() programConfig!: any
  @Input() hascompetency!: any
  langDialog: any
  preferedLanguage: any = { id: 'en', lang: 'English' }
  displayConfig: any
  isLoading = signal(false)
  @ViewChildren('scrollToCneCourses') sections!: QueryList<ElementRef<HTMLElement>>
  userEnrolledDisplayConfig: { displayType: string; badges: { certification: boolean; rating: boolean; completionPercentage: boolean } } | undefined
  forYouCourseDisplayConfig: { displayType: string; badges: { certification: boolean; rating: boolean; sourceName: boolean } } | undefined
  CNECourseDisplayConfig: any
  isUpLogin = false
  uiConfig = signal<any[]>([])
  lang = ''
  isXSmall = computed(() => this.valueSvc.isMobile())
  expandedCardId: string | null = null

  isCompetencyUser = signal(false)
  competencyPlaylists = signal<any[]>([])
  competencyDesignation = ''
  competencyRole = ''
  competencySection: any

  currentOffset = 0
  pageLimit = 500
  initialPageLimit = 10
  plyLsData: any[] = []
  showbackButton = computed(() => this.playlistSvc.showDetails())
  selectedProgDet = computed(() => this.playlistSvc.selectedProgram())()
  constructor(
    private readonly router: Router,
    public dialog: MatDialog,
    private readonly orgService: OrgServiceService,
    public scrollService: ScrollService,
    private readonly configSvc: ConfigurationsService,
    private readonly playlistSvc: PlaylistService,
    private readonly langSvc: LanguageService,
    private readonly valueSvc: ValueService,
    private readonly logger: LoggerService,
    private readonly userSvc: WidgetUserService,
  ) {
    this.lang = this.langSvc.getCurrentLanguage()
  }

  ngOnInit() {
    this.initializeContainer()
  }

  private async initializeContainer() {
    this.logger.log('selectedProgDet ', this.selectedProgDet)

    this.isLoading.set(true)
    this.handleScrollEvents()
    const designation = this.configSvc?.unMappedUser?.profileDetails?.profileReq?.professionalDetails?.[0]?.designation || ''
    const designationLower = designation.toLowerCase()
    const rootOrgId = this.configSvc?.userProfile?.rootOrgId
    const roleCheck = (roles: string[]) =>
      roles?.some(r => r.toLowerCase() === designationLower)

    // loadPlaylistData() is cached after the first real fetch, so awaiting it here is
    // cheap — but it guarantees playlistSvc.sections() (needed by getPlaylistConfigId)
    // is populated even if root's background load hasn't resolved yet.
    await this.playlistSvc.loadPlaylistData()

    // Fetched unconditionally (not just inside resolvePlaylistIdentifiers) so
    // handleCompetencyFlow below has plyLsData to search regardless of which
    // branch (FLOW 1 program-config vs. configData) ran above it.
    if (this.configSvc?.userProfile) {
      this.plyLsData = await this.playlistSvc.getPlaylistConfig()
      this.logger.log('plyLsData', this.plyLsData)
    }
    // FLOW 1: Program Config Flow - highest priority
    if (this.showbackButton() && !!this.programConfig) {
      const isCompetencyFlow = await this.initializeProgramConfigFlow(designation)
      if (isCompetencyFlow) {
        return
      }
    } else if (Array.isArray(this.configData)) {
      this.uiConfig.set(this.configData.slice(1, -1))
      if (this.configSvc?.userProfile) {
        await this.resolvePlaylistIdentifiers(rootOrgId, roleCheck, designation)
      }
    }
    // Fallback: if playlist API returned empty, read identifiers from configData
    if (!this.topCertifiedCourseIdentifier.length && !this.cneCoursesIdentifier.length && !this.yourPlansCourseIdentifier.length) {
      this.applyFallbackIdentifiersFromConfig()
    }
    // Evaluate competency eligibility from the actual lookup result rather than the
    // `hascompetency` @Input — that flag doesn't tell us whether handleCompetencyFlow
    // actually found a matching playlist, so branching on it skipped the main flow
    // (and its fetchEnvironmentConfigurations() call) for non-competency users too.
    if (this.handleCompetencyFlow(rootOrgId, roleCheck)) {
      return
    }

    // Main flow (non-competency users)
    if (this.yourPlansCourseIdentifier.length > 0 || this.topCertifiedCourseIdentifier.length > 0 || this.cneCoursesIdentifier.length > 0 || this.programIdentifiers.length > 0) {
      this.fetchEnvironmentConfigurations()
    } else {
      this.isLoading.set(false)
    }
  }

  /** Returns true when this is a competency-user program flow (caller should return early). */
  private async initializeProgramConfigFlow(designation: string): Promise<boolean> {
    // Program config detail view: refresh enrollment/progress data instead of relying on
    // the @Input snapshot (which is captured once at app bootstrap in RootComponent and
    // never re-fires), so completed/in-progress status reflects the latest API response.
    await this.refreshUserEnrollCourse()

    this.isCompetencyUser.set(this.selectedProgDet?.type === 'competency')
    if (this.isCompetencyUser()) {
      const competencyConfigId = this.playlistSvc.getPlaylistConfigId('COMPETENCY_PLAYLIST')
      this.competencyPlaylists.set([{ ...this.selectedProgDet, playlistId: competencyConfigId }])
      this.competencyDesignation = designation
      this.competencyRole = 'learner'

      const sectionFromConfig = this.uiConfig().find(c => c.playlistConfigId === competencyConfigId)
      this.competencySection = sectionFromConfig || { sectionId: 'COMPETENCY_PLAYLIST', title: 'YOUR LEARNING PLAN', tabCardCount: 4,}

      this.isCompetencyUser.set(true)
      this.isLoading.set(false)
      return true
    }
    this.configData = this.programConfig?.tabs
    this.uiConfig.set(this.configData)
    this.programIdentifiers = this.selectedProgDet.payload
    return false
  }

  private async resolvePlaylistIdentifiers(
    rootOrgId: string | undefined,
    roleCheck: (roles: string[]) => boolean,
    designation: string,
  ): Promise<void> {
    // Join key per section is read straight off the uiConfig just set above — each
    // section already carries its own `playlistConfigId` from the backend web_layout
    // config, so a backend rename there needs no code change here.
    const yourPlansConfigId = this.playlistSvc.getPlaylistConfigId('YOUR_PLANS_PLAYLIST')
    const topCourseConfigId = this.playlistSvc.getPlaylistConfigId('TOP_COURSE_PLAYLIST')
    const cneConfigId = this.playlistSvc.getPlaylistConfigId('CNE_COURSE_PLAYLIST')
    const featuredConfigId = this.playlistSvc.getPlaylistConfigId('FEATURED_COURSE_PLAYLIST')

    for (const element of this.plyLsData) {
      if (element.orgId !== rootOrgId || element.language !== this.lang) continue
      const { playlistId, dataSource } = element
      if (designation && roleCheck(element.role)) {
        if (playlistId === yourPlansConfigId) {
          this.yourPlansCourseIdentifier = dataSource.payload
        }
      }
      if (playlistId === topCourseConfigId) {
        this.topCertifiedCourseIdentifier = dataSource.payload
      }
      if (playlistId === cneConfigId) {
        this.cneCoursesIdentifier = dataSource.payload
      }
      if (this.isEkshamata && playlistId === featuredConfigId) {
        this.featuredCourseIdentifier = dataSource.payload
      }
    }
  }

  private applyFallbackIdentifiersFromConfig(): void {
    const fallbackTopCourseConfigId = this.playlistSvc.getPlaylistConfigId('TOP_COURSE_PLAYLIST')
    const fallbackCneConfigId = this.playlistSvc.getPlaylistConfigId('CNE_COURSE_PLAYLIST')
    this.uiConfig().forEach(data => {
      if (data?.playlistConfigId == fallbackTopCourseConfigId) {
        this.topCertifiedCourseIdentifier = data.payload || []
      } else if (data?.playlistConfigId == fallbackCneConfigId) {
        this.cneCoursesIdentifier = data.payload || []
      }
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['userEnrollCourse'] || changes['configData']) && !this.isLoading()) {
      this.updateCourseData()
    }
  }

  /**
   * Fetches fresh enrollment/progress data and replaces the @Input userEnrollCourse
   * snapshot with it. Falls back to the existing @Input value on failure or when
   * there's no logged-in user, so callers can keep using this.userEnrollCourse as-is.
   */
  private async refreshUserEnrollCourse(): Promise<void> {
    const userId = this.configSvc?.userProfile?.userId
    if (!userId) {
      return
    }
    try {
      const rawCourses = await firstValueFrom(this.userSvc.fetchUserEnrollmentWithProgress(userId))
      this.userEnrollCourse = this.buildEnrolledCourses(rawCourses)
      this.logger.log('[WebPublicContainer] Refreshed userEnrollCourse with progress:', this.userEnrollCourse?.length, 'courses')
    } catch (error) {
      this.logger.warn('[WebPublicContainer] Failed to fetch enrollment with progress, using fallback:', error)
    }
  }

  /**
   * Normalizes the raw enrollment API response (nested `content.identifier`, top-level
   * `courseId`/`contentId`) into the flat shape { identifier, completionPercentage, ... }
   * that updateCourseData()/matching logic in this component expects.
   */
  private buildEnrolledCourses(res: any): any[] {
    const myCourse: any[] = []
    if (!Array.isArray(res)) {
      return myCourse
    }
    res.forEach((key: any) => {
      const identifier = key?.content?.identifier || key?.courseId || key?.contentId
      if (identifier) {
        myCourse.push({
          identifier,
          appIcon: key.content?.appIcon,
          thumbnail: key.content?.thumbnail,
          name: key.content?.name,
          dateTime: key.dateTime,
          completionPercentage: key.completionPercentage,
          sourceName: key.content?.sourceName,
          issueCertification: key.content?.issueCertification,
          averageRating: key.content?.averageRating,
          posterImage: key.content?.posterImage,
        })
      }
    })
    return myCourse
  }

  private handleCompetencyFlow(rootOrgId: string, roleCheck: (roles: string[]) => boolean): boolean {
    const designation = this.configSvc?.unMappedUser?.profileDetails?.profileReq?.professionalDetails?.[0]?.designation || ''

    const competencyConfigId = this.playlistSvc.getPlaylistConfigId('COMPETENCY_PLAYLIST')
    const competencyPlaylist = this.plyLsData?.find(element =>
      element.orgId === rootOrgId &&
      element.language === this.lang &&
      element.playlistId === competencyConfigId &&
      roleCheck(element.role)
    )

    if (!competencyPlaylist) {
      // Not a competency user — let the caller fall through to the standard flow.
      return false
    }

    this.competencyPlaylists.set([{ ...competencyPlaylist, playlistId: competencyConfigId }])
    this.competencyDesignation = designation
    this.competencyRole = 'learner'

    const sectionFromConfig = this.uiConfig().find(c => c.playlistConfigId === competencyConfigId)
    this.competencySection = sectionFromConfig || { sectionId: 'COMPETENCY_PLAYLIST', title: 'YOUR LEARNING PLAN', tabCardCount: 4 }

    this.isCompetencyUser.set(true)
    this.isLoading.set(false)
    return true
  }

  normalizeCompetencyPayload(payload: any): any[] {
    if (!payload) {
      return []
    }

    const normalizeOne = (item: any): any => {
      if (item?.id && Array.isArray(item.levels)) {
        return item
      }
      if (item && typeof item === 'object') {
        const key = Object.keys(item)[0]
        const competency = item[key]
        return {
          id: competency?.id || competency?.competencyId || key,
          title: competency?.title || competency?.name || competency?.competencyName,
          levels: competency?.levels || competency?.additionalProperties?.competencyLevelDescription || [],
          progress: competency?.progress || competency?.learnerPathProgress,
        }
      }
      return null
    }

    if (Array.isArray(payload) && payload.length > 0 && payload[0]?.id && Array.isArray(payload[0]?.levels)) {
      return payload
    }

    if (Array.isArray(payload)) {
      return payload.flatMap((item: any) => {
        const normalized = normalizeOne(item)
        return normalized ? [normalized] : []
      })
    }

    if (typeof payload === 'object') {
      return Object.keys(payload).map(key => {
        const competency = payload[key]
        return {
          id: competency?.id || competency?.competencyId || key,
          title: competency?.title || competency?.name || competency?.competencyName,
          levels: competency?.levels || competency?.additionalProperties?.competencyLevelDescription || [],
          progress: competency?.progress || competency?.learnerPathProgress,
        }
      })
    }

    return []
  }

  private handleScrollEvents() {
    this.scrollService.scrollToDivEvent.subscribe((targetDivId: string) => {
      const section = this.sections.find(
        s => s.nativeElement.getAttribute('data-scroll') === targetDivId
      )
      if (section?.nativeElement) {
        this.scrollService.scrollToElement(section?.nativeElement)
      }
    })
  }

  private fetchEnvironmentConfigurations() {
    const defaultIds = [
      ...this.topCertifiedCourseIdentifier,
      ...this.cneCoursesIdentifier,
    ]

    const identifiers = [
      ...this.yourPlansCourseIdentifier,
      ...this.featuredCourseIdentifier,
    ]
    const programIds = [
      ...this.programIdentifiers,
    ]

    const requests = !this.configSvc?.unMappedUser ? [this.orgService.getTopLiveSearchResults(defaultIds, 'en')] :
      [this.orgService.getTopLiveSearchResults([...defaultIds, ...identifiers, ...programIds], this.lang)]

    return forkJoin(requests).subscribe((responses: any[]) => {
      const content = responses.flatMap(res => res?.result?.content || [])

      if (!content.length) {
        setTimeout(() => {
          this.isLoading.set(false)
        })
        return
      }

      const cneSet = new Set(this.cneCoursesIdentifier)
      const topCertifiedSet = new Set(this.topCertifiedCourseIdentifier)
      const yourPlansSet = new Set(this.yourPlansCourseIdentifier)
      const featureSet = new Set(this.featuredCourseIdentifier)
      const programSet = new Set(this.programIdentifiers)

      this.cneCourse.set(uniqBy(content.filter(item => cneSet.has(item.identifier)), 'identifier'))
      this.topCertifiedCourse.set(uniqBy(content.filter(item => topCertifiedSet.has(item.identifier)), 'identifier'))
      this.coursesForYou.set(uniqBy(content.filter(item => yourPlansSet.has(item.identifier)), 'identifier'))
      this.coursesForEK.set(uniqBy(content.filter(item => featureSet.has(item.identifier)), 'identifier'))
      this.programCourses.set(uniqBy(content.filter(item => programSet.has(item.identifier)), 'identifier'))
      this.updateCourseData()
    })
  }

  updateCourseData() {
    if (Array.isArray(this.configData)) {
      const completed = this.userEnrollCourse?.filter((item: any) => item.completionPercentage === 100) || []
      const incomplete = this.userEnrollCourse?.filter((item: any) => item.completionPercentage !== 100) || []
      const courseList = this.programIdentifiers.length > 0 ? this.programCourses() : this.coursesForYou()

      // Each configData element carries its own `playlistConfigId` (backend web_layout
      // config) — resolve the target value per sectionId dynamically rather than
      // hardcoding it, so a backend rename needs no code change here either.
      const continueLearningConfigId = this.playlistSvc.getPlaylistConfigId('CONTINUE_LEARNING')
      const yourPlansConfigId = this.playlistSvc.getPlaylistConfigId('YOUR_PLANS_PLAYLIST')
      const cneConfigId = this.playlistSvc.getPlaylistConfigId('CNE_COURSE_PLAYLIST')
      const topCourseConfigId = this.playlistSvc.getPlaylistConfigId('TOP_COURSE_PLAYLIST')
      const completedConfigId = this.playlistSvc.getPlaylistConfigId('COMPLETED')

      // Guard each branch on the resolved config id being present, not just equal —
      // getPlaylistConfigId() returns `undefined` when that section isn't in the current
      // org's layout, and elements with no playlistConfigId at all (e.g. the home banner)
      // also read as `undefined`. Without the truthy guard, `undefined === undefined`
      // matches the banner element and overwrites its `data` (a reference into
      // PlaylistService's shared cache) with an unrelated, often-empty course list.
      this.configData.forEach((element: any) => {
        if (element.playlistConfigId && continueLearningConfigId && element.playlistConfigId === continueLearningConfigId) {
          element.data = incomplete?.filter(item =>
            courseList?.some(bItem => bItem.identifier === item.identifier))
          element.displayData = element?.data?.slice(0, element.limit)
        } else if (element.playlistConfigId && yourPlansConfigId && element.playlistConfigId === yourPlansConfigId) {
          element.data = courseList.filter(item =>
            !this.userEnrollCourse?.some(bItem => bItem.identifier === item.identifier)
          )
          element.displayData = element?.data?.slice(0, element.limit)
        } else if (element.playlistConfigId && cneConfigId && element.playlistConfigId === cneConfigId) {
          element.data = this.cneCourse()
          element.displayData = element?.data?.slice(0, element.limit)
        } else if (element.playlistConfigId && topCourseConfigId && element.playlistConfigId === topCourseConfigId) {
          element.data = !this.isEkshamata ? this.topCertifiedCourse() : this.coursesForEK()
          element.displayData = element?.data?.slice(0, element.limit)
        } else if (element.playlistConfigId && completedConfigId && element.playlistConfigId === completedConfigId) {
          element.data = completed.filter(item =>
            courseList?.some(bItem => bItem.identifier === item.identifier))
          element.displayData = element?.data?.slice(0, element.limit)
        }
      })
      // Create new array reference so the uiConfig signal notifies Angular of the update
      this.uiConfig.set([...this.uiConfig()])
    }
    setTimeout(() => {
      this.isLoading.set(false)
    })
  }

  onCardExpanded(id: string | undefined, expanded: boolean) {
    if (!id) return
    this.expandedCardId = expanded ? id : (this.expandedCardId === id ? null : this.expandedCardId)
  }

  // For opening Course Page
  raiseTelemetry(contentIdentifier: any) {
    this.router.navigateByUrl(`/app/toc/${contentIdentifier}/overview`)
  }

  // To view all course
  viewAllCourse(content: any) {
    const courseType = content?.button?.courseType

    // Desktop: "View All" always navigates to the full listing page on a single
    // click. (Previously navigation was gated behind the expand/collapse toggle,
    // so when all items were already shown it took two clicks — and the
    // router.navigate() Promise was wrongly assigned to content.displayData.)
    if (!this.isXSmall()) {
      if (courseType == 'continueLearning' || courseType == 'completed' || courseType == 'formatForYouCourses') {
        this.router.navigate(['app/user/my_courses'], { queryParams: { courseType } })
      } else if (courseType == 'topCourse' || courseType == 'cneCourses') {
        this.router.navigate(['app/search/topCourse'], {
          queryParams: {
            courseType,
            data: courseType == 'topCourse' ? this.topCertifiedCourseIdentifier : this.cneCoursesIdentifier,
          },
        })
      }
      return
    }

    // Mobile: toggle inline expand / collapse.
    const isViewingAll = content?.data?.length === content?.displayData?.length
    if (courseType == 'continueLearning' || courseType == 'completed' || courseType == 'formatForYouCourses') {
      const full = courseType == 'formatForYouCourses' ? this.coursesForYou() : this.userEnrollCourse
      content.displayData = isViewingAll ? full.slice(0, content.limit) : full
    } else if (courseType == 'topCourse' || courseType == 'cneCourses') {
      const full = courseType == 'topCourse' ? this.topCertifiedCourse() : this.cneCourse()
      content.displayData = isViewingAll ? full.slice(0, content.limit) : full
    }
  }

  openIframe(video: any) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        video: video.videoIndex,
      },
    }
    this.router.navigate(['/app/video-player'], navigationExtras)
  }

  ngOnDestroy() {
    if (this.courseRecommendationTimeout) {
      clearTimeout(this.courseRecommendationTimeout)
    }
    this.destroy$.next()
    this.destroy$.complete()
  }

  backScreen() {
    this.playlistSvc.showDetails.set(false)
  }
}
