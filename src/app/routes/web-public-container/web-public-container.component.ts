import { Component, OnInit, ElementRef, Input, OnDestroy, QueryList, ViewChildren, OnChanges, SimpleChanges, signal, computed } from '@angular/core'
import { NavigationExtras, Router } from '@angular/router'
import { uniqBy } from 'lodash-es'
import { MatDialog } from '@angular/material/dialog'
import { OrgServiceService } from '../../../../project/ws/app/src/lib/routes/org/org-service.service'
import { ScrollService } from '../../services/scroll.service'
import { ConfigurationsService, LoggerService, ValueService } from '@ws-widget/utils'
import { forkJoin } from 'rxjs'
import { PlaylistService } from '../../services/playlist.service'
import { LanguageService } from '../../services/language.service'
import { Subject } from 'rxjs'

@Component({
  standalone: false,
  selector: 'ws-web-public-container',
  templateUrl: './web-public-container.component.html',
  styleUrls: ['./web-public-container.component.scss'],
})
export class WebPublicComponent implements OnInit, OnChanges, OnDestroy {
  myCourse: any

  private destroy$ = new Subject<void>()
  private courseRecommendationTimeout: any

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
    private router: Router,
    public dialog: MatDialog,
    private orgService: OrgServiceService,
    public scrollService: ScrollService,
    private configSvc: ConfigurationsService,
    private playlistSvc: PlaylistService,
    private langSvc: LanguageService,
    private valueSvc: ValueService,
    private logger: LoggerService,
  ) {
    this.lang = this.langSvc.getCurrentLanguage()
  }

  async ngOnInit() {
    console.log("selectedProgDet ", this.selectedProgDet)

    this.isLoading.set(true)
    this.handleScrollEvents()
    const designation = this.configSvc?.unMappedUser?.profileDetails?.profileReq?.professionalDetails?.[0]?.designation || ''
    const designationLower = designation.toLowerCase()
    const rootOrgId = this.configSvc?.userProfile?.rootOrgId
    const roleCheck = (roles: string[]) =>
      roles?.some(r => r.toLowerCase() === designationLower)
    if (this.showbackButton() && !!this.programConfig) {
      this.isCompetencyUser.set(this.selectedProgDet?.type === 'competency')
      if (this.isCompetencyUser()) {
        // this.handleCompetencyFlow(rootOrgId, roleCheck)
        this.competencyPlaylists.set([{ ...this.selectedProgDet, playlistId: 'COMPETENCY_PLAYLIST' }])
        this.competencyDesignation = designation
        this.competencyRole = 'learner'

        const sectionFromConfig = this.uiConfig().find(c => c.playlistConfigId === 'COMPETENCY_PLAYLIST')
        this.competencySection = sectionFromConfig || { text: 'YOUR LEARNING PLAN', tabCardCount: 4 }

        this.isCompetencyUser.set(true)
        this.isLoading.set(false)
        return
      } else {
        this.configData = this.programConfig?.tabs
        this.uiConfig.set(this.configData)
        this.programIdentifiers = this.selectedProgDet.payload
      }
    } else if (Array.isArray(this.configData)) {
      this.uiConfig.set(this.configData.slice(1, -1))
      if (this.configSvc?.userProfile) {
        this.plyLsData = await this.playlistSvc.getPlaylistConfig()
        this.logger.log('plyLsData', this.plyLsData)

        for (const element of this.plyLsData) {
          if (element.orgId !== rootOrgId || element.language !== this.lang) continue
          const { playlistId, dataSource } = element
          if (designation && roleCheck(element.role)) {
            if (playlistId === 'YOUR_PLANS_PLAYLIST') {
              this.yourPlansCourseIdentifier = dataSource.payload
            }
          }
          if (playlistId === 'TOP_COURSE_PLAYLIST') {
            this.topCertifiedCourseIdentifier = dataSource.payload
          }
          if (playlistId === 'CNE_COURSE_PLAYLIST') {
            this.cneCoursesIdentifier = dataSource.payload
          }
          if (this.isEkshamata && playlistId === 'FEATURED_COURSE_PLAYLIST') {
            this.featuredCourseIdentifier = dataSource.payload
          }
        }
      }
    }
    // Fallback: if playlist API returned empty, read identifiers from form config
    if (!this.topCertifiedCourseIdentifier.length && !this.cneCoursesIdentifier.length && !this.yourPlansCourseIdentifier.length) {
      this.uiConfig().forEach(data => {
        if (data?.playlistConfigId == 'TOP_COURSE_PLAYLIST') {
          this.topCertifiedCourseIdentifier = data.payload || []
        } else if (data?.playlistConfigId == 'CNE_COURSE_PLAYLIST') {
          this.cneCoursesIdentifier = data.payload || []
        }
      })
    }
    // Evaluate competency eligibility first so isCompetencyUser is set correctly even
    // when standard playlist identifiers also exist (the fallback above can populate them).
    if (this.handleCompetencyFlow(rootOrgId, roleCheck)) {
      return
    }

    // Main flow (non-competency users)
    if (this.yourPlansCourseIdentifier.length > 0 || this.topCertifiedCourseIdentifier.length > 0 || this.cneCoursesIdentifier.length > 0 || this.programIdentifiers.length > 0) {
      this.fetchEnvironmentConfigurations()
      return
    } else {
      this.isLoading.set(false)
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['userEnrollCourse'] || changes['configData']) && !this.isLoading()) {
      this.updateCourseData()
    }
  }

  private handleCompetencyFlow(rootOrgId: string, roleCheck: (roles: string[]) => boolean): boolean {
    const designation = this.configSvc?.unMappedUser?.profileDetails?.profileReq?.professionalDetails?.[0]?.designation || ''

    const competencyPlaylist = this.plyLsData?.find(element =>
      element.orgId === rootOrgId &&
      element.language === 'en' &&
      element.playlistId === 'COMPETENCY_PLAYLIST' &&
      roleCheck(element.role)
    )

    if (!competencyPlaylist) {
      // Not a competency user — let the caller fall through to the standard flow.
      return false
    }

    this.competencyPlaylists.set([{ ...competencyPlaylist, playlistId: 'COMPETENCY_PLAYLIST' }])
    this.competencyDesignation = designation
    this.competencyRole = 'learner'

    const sectionFromConfig = this.uiConfig().find(c => c.playlistConfigId === 'COMPETENCY_PLAYLIST')
    this.competencySection = sectionFromConfig || { text: 'YOUR LEARNING PLAN', tabCardCount: 4 }

    this.isCompetencyUser.set(true)
    this.isLoading.set(false)
    return true
  }

  normalizeCompetencyPayload(payload: any): any[] {
    if (!payload) {
      return []
    }

    if (Array.isArray(payload) && payload.length > 0 && payload[0]?.id && Array.isArray(payload[0]?.levels)) {
      return payload
    }

    if (Array.isArray(payload)) {
      return payload.flatMap((item: any) => {
        if (item?.id && Array.isArray(item.levels)) {
          return [item]
        }

        if (item && typeof item === 'object') {
          return Object.keys(item).map(key => {
            const competency = item[key]
            return {
              id: competency?.id || competency?.competencyId || key,
              title: competency?.title || competency?.name || competency?.competencyName,
              levels: competency?.levels || competency?.additionalProperties?.competencyLevelDescription || [],
              progress: competency?.progress || competency?.learnerPathProgress,
            }
          })
        }
        return []
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
      this.configData.forEach((element: any) => {
        if (element.playlistConfigId === 'CONTINUE_LEARNING') {
          element.data = incomplete?.filter(item =>
            courseList?.some(bItem => bItem.identifier === item.identifier))
          element.displayData = element?.data?.slice(0, element.limit)
        } else if (element.playlistConfigId === 'YOUR_PLANS_PLAYLIST') {
          element.data = courseList.filter(item =>
            !this.userEnrollCourse?.some(bItem => bItem.identifier === item.identifier)
          )
          element.displayData = element?.data?.slice(0, element.limit)
        } else if (element.playlistConfigId === 'CNE_COURSE_PLAYLIST') {
          element.data = this.cneCourse()
          element.displayData = element?.data?.slice(0, element.limit)
        } else if (element.playlistConfigId === 'TOP_COURSE_PLAYLIST') {
          element.data = !this.isEkshamata ? this.topCertifiedCourse() : this.coursesForEK()
          element.displayData = element?.data?.slice(0, element.limit)
        } else if (element.playlistConfigId === 'COMPLETED') {
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
