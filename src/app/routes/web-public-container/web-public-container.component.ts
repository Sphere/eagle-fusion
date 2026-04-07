import { Component, OnInit, ElementRef, Input, OnDestroy, effect, QueryList, ViewChildren } from '@angular/core'
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
  selector: 'ws-web-public-container',
  templateUrl: './web-public-container.component.html',
  styleUrls: ['./web-public-container.component.scss'],
})
export class WebPublicComponent implements OnInit, OnDestroy {
  myCourse: any

  private destroy$ = new Subject<void>()
  private courseRecommendationTimeout: any

  topCertifiedCourse: any = []
  cneCourse: any = []
  coursesForYou: any[] = []
  coursesForEK: any[] = []
  videoData: any
  homeFeatureData: any
  homeFeature: any
  userId: any
  firstName: any
  topCertifiedCourseIdentifier: any = []
  cneCoursesIdentifier: any = []
  yourPlansCourseIdentifier: any = []
  featuredCourseIdentifier: any = []
  @Input() userEnrollCourse: any
  @Input() isEkshamata: any
  @Input() configData: any
  langDialog: any
  preferedLanguage: any = { id: 'en', lang: 'English' }
  displayConfig: any
  isLoading = false
  @ViewChildren('scrollToCneCourses') sections!: QueryList<ElementRef<HTMLElement>>
  userEnrolledDisplayConfig: { displayType: string; badges: { certification: boolean; rating: boolean; completionPercentage: boolean } } | undefined
  forYouCourseDisplayConfig: { displayType: string; badges: { certification: boolean; rating: boolean; sourceName: boolean } } | undefined
  CNECourseDisplayConfig: any
  isUpLogin = false
  uiConfig: any
  lang = ''
  isXSmall = false

  currentOffset = 0
  pageLimit = 500
  initialPageLimit = 10
  plyLsData: any[] = []
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
    private contentSvc: WidgetContentService
  ) {
    this.lang = this.langSvc.getCurrentLanguage()
    effect(() => {
      this.isXSmall = this.valueSvc.isMobile()
    })
  }

  async ngOnInit() {
    this.handleScrollEvents()
    const designation = this.configSvc?.unMappedUser?.profileDetails?.profileReq?.professionalDetails?.[0]?.designation || ''
    const designationLower = designation.toLowerCase()
    const rootOrgId = this.configSvc?.userProfile?.rootOrgId
    const roleCheck = (roles: string[]) =>
      roles?.some(r => r.toLowerCase() === designationLower)
    if (this.configData) {
      this.uiConfig = this.configData.slice(1, -1)
    }
    if (this.configSvc?.userProfile) {
      this.plyLsData = await this.playlistSvc.getPlaylistConfig()
      this.logger.log("plyLsData", this.plyLsData)

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
    } else {
      this.uiConfig?.forEach(data => {
        if (data?.playlistConfigId == 'TOP_COURSE_PLAYLIST') {
          this.topCertifiedCourseIdentifier = data.payload
        } else if (data?.playlistConfigId == 'CNE_COURSE_PLAYLIST') {
          this.cneCoursesIdentifier = data.payload
        }
      })
    }
    this.isLoading = true
    // Main flow
    if (this.yourPlansCourseIdentifier.length > 0 || this.topCertifiedCourseIdentifier.length > 0 || this.cneCoursesIdentifier.length > 0) {
      this.fetchEnvironmentConfigurations()
      return
    } else {
      this.handleCompetencyFlow(rootOrgId, roleCheck)
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
      this.isLoading = false
      return
    }

    this.searchContentByCompetencies$(baseQuery, competencySearchArray, sourceName, listOfEnrolledCourseId).subscribe((res: any) => {
      this.coursesForYou = res || []
      this.yourPlansCourseIdentifier = this.coursesForYou.filter(item => item?.identifier).map(item => item.identifier)
      this.updateCourseData()
      this.isLoading = false
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

        const processedCourses = this.processRecommendedCourses(content, requiredSourceName, listOfEnrolledCourseId)
        return processedCourses
      }),
      catchError(err => {
        console.error("Error fetching recommendation", err)
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

    const requests = !this.configSvc?.unMappedUser ? [this.orgService.getTopLiveSearchResults(defaultIds, 'en')] :
      this.orgService.getTopLiveSearchResults([...defaultIds, ...identifiers], this.lang)

    return forkJoin(requests).subscribe((responses: any[]) => {
      const content = responses
        .flatMap(res => res?.result?.content || [])

      if (!content.length) {
        return
      }
      const cneSet = new Set(this.cneCoursesIdentifier)
      const topCertifiedSet = new Set(this.topCertifiedCourseIdentifier)
      const yourPlansSet = new Set(this.yourPlansCourseIdentifier)
      const featureSet = new Set(this.featuredCourseIdentifier)
      this.cneCourse = uniqBy(
        content.filter(item => cneSet.has(item.identifier)),
        'identifier'
      )
      this.topCertifiedCourse = uniqBy(
        content.filter(item => topCertifiedSet.has(item.identifier)),
        'identifier'
      )
      this.coursesForYou = uniqBy(
        content.filter(item => yourPlansSet.has(item.identifier)),
        'identifier'
      )
      this.coursesForEK = uniqBy(
        content.filter(item => featureSet.has(item.identifier)),
        'identifier'
      )
      this.updateCourseData()
    })
  }

  updateCourseData() {
    const data = this.userEnrollCourse?.filter(item => this.yourPlansCourseIdentifier?.includes(item.identifier))
    if (this.configData) {
      const completed = data?.filter(item => item.completionPercentage === 100)
      const incomplete = data?.filter(item => item.completionPercentage !== 100)
      this.configData?.forEach((element: any) => {
        if (element.playlistConfigId === 'CONTINUE_LEARNING') {
          element.data = incomplete
          element.displayData = element?.data?.slice(0, element.limit)
        } else if (element.playlistConfigId === 'YOUR_PLANS_PLAYLIST') {
          element.data = this.coursesForYou.filter(item =>
            !this.userEnrollCourse?.some(bItem => bItem.identifier === item.identifier)
          )
          element.displayData = element?.data?.slice(0, element.limit)
        } else if (element.playlistConfigId === 'CNE_COURSE_PLAYLIST') {
          element.data = this.cneCourse
          element.displayData = element?.data?.slice(0, element.limit)
        } else if (element.playlistConfigId === 'TOP_COURSE_PLAYLIST') {
          element.data = !this.isEkshamata ? this.topCertifiedCourse : this.coursesForEK
          element.displayData = element?.data?.slice(0, element.limit)
        } else if (element.playlistConfigId === 'COMPLETED') {
          element.data = completed
          element.displayData = element?.data?.slice(0, element.limit)
        }
      })
    }
    this.isLoading = false
  }

  // For opening Course Page
  raiseTelemetry(contentIdentifier: any) {
    this.router.navigateByUrl(`/app/toc/${contentIdentifier}/overview`)
  }
  // To view all course
  viewAllCourse(content: any) {
    const courseType = content?.button?.courseType
    if (courseType == 'continueLearning' || courseType == 'completed' || courseType == 'formatForYouCourses') {
      content.displayData = this.isXSmall ?
        (courseType == 'formatForYouCourses' ? this.coursesForYou : this.userEnrollCourse)
        : this.router.navigate(['app/user/my_courses'], { queryParams: { courseType: courseType } })
    } else if (courseType == 'topCourse' || courseType == 'cneCourses') {
      content.displayData = this.isXSmall ?
        (courseType == 'topCourse' ? this.topCertifiedCourse : this.cneCourse)
        : this.router.navigate(['app/search/topCourse'], { queryParams: { courseType: courseType, data: courseType == 'topCourse' ? this.topCertifiedCourseIdentifier : this.cneCoursesIdentifier } })
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

}
