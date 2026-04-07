import { Component, OnInit, OnDestroy, effect } from '@angular/core'
import { NsContent, WidgetContentService } from '@ws-widget/collection'
import { ConfigurationsService, ValueService } from '@ws-widget/utils'
import { SignupService } from 'src/app/routes/signup/signup.service'
import { ActivatedRoute, Router } from '@angular/router'
import { PlaylistService } from '../../services/playlist.service'
import { LanguageService } from '../../services/language.service'
import { OrgServiceService } from '../../../../project/ws/app/src/lib/routes/org/org-service.service'
import { Observable, of, Subject } from 'rxjs'
import { catchError, map, takeUntil } from 'rxjs/operators'

@Component({
    standalone: false,
    selector: 'ws-my-courses',
    templateUrl: './my-courses.component.html',
    styleUrls: ['./my-courses.component.scss'],
    
})
export class MyCoursesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>()
  startedCourse: any[] = []
  completedCourse: any[] = []
  coursesForYou: any[] = []
  isLoading = false
  private pendingRequests = 0
  isXSmall = false
  selectedIndex = 0 // Index for the active tab
  yourPlansCourseIdentifier: any[] = []
  config: any
  lang: any
  plyLsData: any
  userEnrolledCourse: any = []
  currentOffset = 1
  pageLimit = 500
  initialPageLimit = 10
  displayLimit: number[] = [] // Per-tab display limits for progressive rendering
  private readonly PAGE_SIZE = 10
  constructor(
    private configSvc: ConfigurationsService,
    private contentSvc: WidgetContentService,
    private signupService: SignupService,
    public router: Router,
    private valueSvc: ValueService,
    private readonly route: ActivatedRoute,
    private playlistSvc: PlaylistService,
    private langSvc: LanguageService,
    private orgService: OrgServiceService
  ) {
    effect(() => {
      this.isXSmall = this.valueSvc.isMobile() ? true : false
    })
  }

  async ngOnInit() {
    this.lang = this.langSvc.getCurrentLanguage()
    this.isLoading = true
    this.pendingRequests = 2 // enrollment list + professional/forYou courses

    // Load playlist configs
    this.plyLsData = await this.playlistSvc.getPlaylistConfig()
    let res = this.playlistSvc.selectedTabConfig()
    if (res == '') {
      res = await this.playlistSvc.loadPlaylistData()
      this.config = res?.LAYOUT_BODY?.sections?.courseTab
    } else {
      this.config = res
    }

    sessionStorage.removeItem('cURL')

    const userId = this.configSvc?.userProfile?.userId || ''

    // Handle route params
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['courseType'] === 'formatForYouCourses') {
        this.selectedIndex = 1
      } else if (params['courseType'] === 'completed') {
        this.selectedIndex = 2
      }
    })

    // Fetch user courses - pending request 1
    this.contentSvc.fetchUserBatchList(userId).pipe(takeUntil(this.destroy$)).subscribe({
      next: courses => {
        this.userEnrolledCourse = courses
        this.processUserCourses(courses)
        this.updateTabData()
        this.decrementPending()
      },
      error: () => {
        this.decrementPending()
      },
    })

    // Handle professional details - pending request 2
    this.handleProfessionalCourses()
  }

  private decrementPending() {
    this.pendingRequests--
    if (this.pendingRequests <= 0) {
      this.isLoading = false
    }
  }

  private processUserCourses(courses: NsContent.ICourse[]) {
    this.startedCourse = []
    this.completedCourse = []

    courses.forEach(course => {
      const content = course?.content
      if (!content?.identifier || content?.competency) return

      const courseObj = {
        identifier: content.identifier,
        appIcon: content.appIcon,
        thumbnail: content.thumbnail,
        name: content.name,
        dateTime: course.dateTime,
        completionPercentage: course.completionPercentage,
        sourceName: content.sourceName,
        issueCertification: content.issueCertification,
        posterImage: content.posterImage,
      }

        ; (course.completionPercentage !== 100
          ? this.startedCourse
          : this.completedCourse
        ).push(courseObj)
    })
    const sortFn = (a, b) => +new Date(b.dateTime) - +new Date(a.dateTime)
    this.startedCourse.sort(sortFn)
    this.completedCourse.sort(sortFn)
  }

  private handleProfessionalCourses() {
    const profDet = this.configSvc?.unMappedUser?.profileDetails?.profileReq?.professionalDetails

    if (!profDet) {
      this.coursesForYou = []
      this.decrementPending()
      return
    }

    const professionalDetails = profDet[0]
    const designation = professionalDetails.designation || professionalDetails.profession
    const rootOrgId = this.configSvc.userProfile.rootOrgId
    const roleCheck = (roles: string[]) =>
      roles?.some(r => r.toLowerCase() === designation.toLowerCase())

    let matchedElements = this.plyLsData?.filter(element =>
      element.orgId === rootOrgId && roleCheck(element.role) && element.playlistId === 'YOUR_PLANS_PLAYLIST' && element.language === this.lang)

    if (matchedElements.length === 0) {
      matchedElements = this.plyLsData?.filter(element =>
        element.orgId === rootOrgId && roleCheck(element.role) && (element.playlistId === 'COMPETENCY_PLAYLIST' || element.playlistId === 'SEARCH_PLAYLIST'))

      const listOfEnrolledCourseId = (this.userEnrolledCourse || [])
        .filter(course => course?.content?.identifier && !course?.content?.competency)
        .map(course => course.content.identifier)

      const competencySearchArray: string[] = []
      let baseQuery: any = {}
      let sourceName: string[] = []

      matchedElements?.forEach(element => {
        if (element.playlistId === 'COMPETENCY_PLAYLIST') {
          competencySearchArray.push(
            ...this.buildCompetencySearchArray(element?.dataSource?.payload)
          )
        }

        if (element.playlistId === 'SEARCH_PLAYLIST') {
          baseQuery = element?.dataSource?.payload || {}
          baseQuery.request ??= {}
          baseQuery.request.filters ??= {}

          baseQuery.request.offset = this.currentOffset
          baseQuery.request.limit = this.pageLimit
          sourceName = baseQuery.request.filters.sourceName || []
        }
      })

      this.currentOffset += this.initialPageLimit
      this.pageLimit += this.initialPageLimit

      if (competencySearchArray.length > 0) {
        this.searchContentByCompetencies$(baseQuery, competencySearchArray, sourceName, listOfEnrolledCourseId).subscribe({
          next: (res: any) => {
            this.coursesForYou = res || []
            this.updateTabData()
            this.decrementPending()
          },
          error: () => {
            this.decrementPending()
          },
        })
      } else {
        this.updateTabData()
        this.decrementPending()
      }
    } else {
      const element = matchedElements[0]
      this.yourPlansCourseIdentifier = element.dataSource.payload

      this.orgService
        .getTopLiveSearchResults(this.yourPlansCourseIdentifier, this.lang)
        .subscribe({
          next: (results: any) => {
            const content = results?.result?.content || []
            const idSet = new Set(this.yourPlansCourseIdentifier)

            this.coursesForYou = Array.from(
              new Map(
                content
                  .filter(item => idSet.has(item.identifier))
                  .map(item => [item.identifier, item])
              ).values()
            )

            this.updateTabData()
            this.decrementPending()
          },
          error: () => {
            this.decrementPending()
          },
        })
    }
  }

  private updateTabData() {
    if (!this.config?.tabMenu) return

    this.config.tabMenu.forEach((tab: any, index: number) => {
      if (tab.label === 'For You') {
        tab.data = this.coursesForYou.filter(item =>
          !this.userEnrolledCourse.some(bItem => bItem.contentId === item.identifier))
      }
      if (tab.label === 'Started') {
        tab.data = this.startedCourse
      }
      if (tab.label === 'Completed') {
        tab.data = this.completedCourse
      }
      // Initialize display limits for each tab
      if (this.displayLimit[index] === undefined) {
        this.displayLimit[index] = this.PAGE_SIZE
      }
    })
  }

  tabClick() {
    this.selectedIndex = 1
  }

  onTabChange(index: number) {
    this.selectedIndex = index
    // Reset display limit for new tab to show first page quickly
    if (this.displayLimit[index] === undefined) {
      this.displayLimit[index] = this.PAGE_SIZE
    }
  }

  showMore(tabIndex: number, totalLength: number) {
    this.displayLimit[tabIndex] = Math.min(
      (this.displayLimit[tabIndex] || this.PAGE_SIZE) + this.PAGE_SIZE,
      totalLength
    )
  }

  courseTrackBy(index: number, item: any): string {
    return item?.identifier || index
  }


  async navigateToToc(contentIdentifier: any) {
    sessionStorage.setItem('cURL', location.href)
    // ✅ NO language prefix in URLs - ngx-translate handles language via localStorage
    const baseUrl = document.baseURI
    const tocUrl = `/app/toc/${contentIdentifier}/overview`
    const result = await this.signupService.getUserData()
    if (this.configSvc.unMappedUser) {
      if (result && result.profileDetails!.profileReq && result.profileDetails!.profileReq!.personalDetails!.dob) {
        location.href = `${baseUrl}${tocUrl}`
      } else {
        if (localStorage.getItem('url_before_login')) {
          const courseUrl = localStorage.getItem('url_before_login')
          this.router.navigate(['/app/about-you'], { queryParams: { redirect: courseUrl } })
        } else {
          this.router.navigate(['/app/about-you'], { queryParams: { redirect: tocUrl } })
        }
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
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

    return this.recommendedCourse(courseList)
      .filter(item => {
        if (!item?.identifier || seen.has(item.identifier)) return false
        seen.add(item.identifier)
        return true
      })
      .filter(item => sourceSet.has(item.sourceName))
      .filter(item => !enrolledSet.has(item.identifier))
  }
}
