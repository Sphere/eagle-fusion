import { Component, OnInit, ElementRef, Input, OnDestroy, QueryList, ViewChildren, OnChanges, SimpleChanges, signal, computed } from '@angular/core'
import { NavigationExtras, Router } from '@angular/router'
import { uniqBy } from 'lodash'
import { MatDialog } from '@angular/material/dialog'
import { OrgServiceService } from '../../../../project/ws/app/src/lib/routes/org/org-service.service'
import { ScrollService } from '../../services/scroll.service'
import { ConfigurationsService, LoggerService, ValueService } from '@ws-widget/utils'
import { forkJoin, Observable, of } from 'rxjs'
import { PlaylistService } from '../../services/playlist.service'
import { LanguageService } from '../../services/language.service'
import { Subject } from 'rxjs'
import { WidgetContentService } from '../../../../library/ws-widget/collection/src/public-api'
import { catchError, map } from 'rxjs/operators'

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
    private contentSvc: WidgetContentService,
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
      this.configData = this.programConfig?.tabs
      this.uiConfig.set(this.configData)
      this.programIdentifiers = this.selectedProgDet.payload
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
    // Main flow
    if (this.yourPlansCourseIdentifier.length > 0 || this.topCertifiedCourseIdentifier.length > 0 || this.cneCoursesIdentifier.length > 0 || this.programIdentifiers.length > 0) {
      this.fetchEnvironmentConfigurations()
      return
    } else {
      this.handleCompetencyFlow(rootOrgId, roleCheck)
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['userEnrollCourse'] || changes['configData']) && !this.isLoading()) {
      this.updateCourseData()
    }
  }

  private handleCompetencyFlow(rootOrgId: string, roleCheck: (roles: string[]) => boolean) {
    const matchedElements = this.plyLsData?.filter(element =>
      element.orgId === rootOrgId && roleCheck(element.role) && (element.playlistId === 'COMPETENCY_PLAYLIST' || element.playlistId === 'SEARCH_PLAYLIST'))

    const listOfEnrolledCourseId = (this.userEnrollCourse || [])
      .filter(course => course?.content?.identifier && !course?.content?.competency)
      .map(course => course.content.identifier)

    const competencySearchArray: string[] = []
    let baseQuery: any = {}
    let sourceName: string[] = []

    for (const element of matchedElements || []) {
      const { playlistId, dataSource } = element

      if (playlistId === 'COMPETENCY_PLAYLIST') {
        competencySearchArray.push(
          ...this.buildCompetencySearchArray(dataSource?.payload)
        )
      }
      if (playlistId === 'SEARCH_PLAYLIST') {
        baseQuery = dataSource?.payload || {}

        baseQuery.request = baseQuery.request || {}
        baseQuery.request.filters = baseQuery.request.filters || {}

        baseQuery.request.offset = this.currentOffset
        baseQuery.request.limit = this.pageLimit

        sourceName = baseQuery.request.filters.sourceName || []
      }
    }
    this.currentOffset += this.initialPageLimit
    this.pageLimit += this.initialPageLimit
    if (!competencySearchArray.length) {
      this.isLoading.set(false)
      return
    }

    this.searchContentByCompetencies$(baseQuery, competencySearchArray, sourceName, listOfEnrolledCourseId).subscribe((res: any) => {
      this.coursesForYou.set(res || [])
      this.yourPlansCourseIdentifier = this.coursesForYou().filter(item => item?.identifier).map(item => item.identifier)
      this.updateCourseData()
    })
  }

  buildCompetencySearchArray = (competencyPayload: any[]): string[] => {
    if (!Array.isArray(competencyPayload) || competencyPayload?.length === 0) {
      return []
    }
    const competencySearchArray: string[] = []
    competencyPayload.forEach(competencyObj => {
      Object.keys(competencyObj).forEach(key => {
        const competency = competencyObj[key]
        const competencyId = competency?.id
        if (!competencyId) return

        const levelDescriptions = competency?.additionalProperties?.competencyLevelDescription || []

        levelDescriptions.forEach((levelDesc: any) => {
          const level = levelDesc?.level
          if (level) {
            competencySearchArray.push(`${competencyId}-${level}`)
          }
        })
      })
    })
    return competencySearchArray
  }

  searchContentByCompetencies$ = (baseQuery: any, competencySearchArray: string[], requiredSourceName: string[], listOfEnrolledCourseId: string[]): Observable<any[]> => {
    if (!Array.isArray(competencySearchArray) || competencySearchArray.length === 0) {
      return of([])
    }

    const requestBody = typeof structuredClone === 'function'
      ? structuredClone(baseQuery)
      : JSON.parse(JSON.stringify(baseQuery))

    requestBody.request = requestBody.request || {}
    requestBody.request.filters = requestBody.request.filters || {}
    requestBody.request.filters.competencySearch = competencySearchArray

    return this.contentSvc.getCouseByContentSearch(competencySearchArray, true, requestBody).pipe(
      map((res: any) => {
        const content = res?.result?.content ?? []
        return this.processRecommendedCourses(content, requiredSourceName, listOfEnrolledCourseId)
      }),
      catchError(err => {
        console.error('Error fetching recommendation', err)
        return of([])
      })
    )
  }

  recommendedCourse = (data: any[]) =>
    (data || [])
      .filter(item => item && item.identifier)
      .map(item => ({
        identifier: item.identifier,
        appIcon: item.appIcon,
        thumbnail: item.posterImage || item.thumbnail,
        name: item.name,
        sourceName: item.sourceName,
        issueCertification: item.issueCertification,
        averageRating: item.averageRating,
        competency: item.competency,
      }))

  processRecommendedCourses = (courseList: any[], requiredSourceName: string[], listOfEnrolledCourseId: string[]): any[] => {
    const seen = new Set()
    const enrolledSet = new Set(listOfEnrolledCourseId || [])
    const sourceSet = new Set(requiredSourceName || [])

    return this.recommendedCourse(courseList).filter(item => {
      const id = item?.identifier
      if (!id || seen.has(id) || enrolledSet.has(id)) return false
      if (!sourceSet.has(item.sourceName)) return false
      seen.add(id)
      return true
    })
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
      ...this.programIdentifiers
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
      this.configData.forEach((element: any) => {
        if (element.playlistConfigId === 'CONTINUE_LEARNING') {
          element.data = this.coursesForYou().filter(item =>
            incomplete?.some(bItem => bItem.identifier === item.identifier))
          element.displayData = element?.data?.slice(0, element.limit)
        } else if (element.playlistConfigId === 'YOUR_PLANS_PLAYLIST') {
          const courseList = this.programIdentifiers.length > 0 ? this.programCourses() : this.coursesForYou()
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
          element.data = this.coursesForYou().filter(item =>
            completed?.some(bItem => bItem.identifier === item.identifier))
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

  // For opening Course Page
  raiseTelemetry(contentIdentifier: any) {
    this.router.navigateByUrl(`/app/toc/${contentIdentifier}/overview`)
  }

  // To view all course
  viewAllCourse(content: any) {
    const courseType = content?.button?.courseType
    const isViewingAll = content?.data?.length === content?.displayData?.length

    if (courseType == 'continueLearning' || courseType == 'completed' || courseType == 'formatForYouCourses') {
      if (isViewingAll) {
        // Hide - reset to initial limit
        content.displayData = (courseType == 'formatForYouCourses' ? this.coursesForYou() : this.userEnrollCourse).slice(0, content.limit)
      } else {
        // View all
        content.displayData = this.isXSmall() ?
          (courseType == 'formatForYouCourses' ? this.coursesForYou() : this.userEnrollCourse)
          : this.router.navigate(['app/user/my_courses'], { queryParams: { courseType: courseType } })
      }
    } else if (courseType == 'topCourse' || courseType == 'cneCourses') {
      if (isViewingAll) {
        // Hide - reset to initial limit
        content.displayData = (courseType == 'topCourse' ? this.topCertifiedCourse() : this.cneCourse()).slice(0, content.limit)
      } else {
        // View all
        content.displayData = this.isXSmall() ?
          (courseType == 'topCourse' ? this.topCertifiedCourse() : this.cneCourse())
          : this.router.navigate(['app/search/topCourse'], { queryParams: { courseType: courseType, data: courseType == 'topCourse' ? this.topCertifiedCourseIdentifier : this.cneCoursesIdentifier } })
      }
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
