import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core'
import { ConfigurationsService, LoggerService, ValueService } from '@ws-widget/utils'
import { OrgServiceService } from './../../org-service.service'
import { ActivatedRoute, Router } from '@angular/router'
import { forkJoin, of, Subscription } from 'rxjs'
import { WidgetUserService } from '@ws-widget/collection'
import { SeoService } from '../../../../../../../../../src/app/services/seo.service'
import { UserAgentResolverService } from '../../../../../../../../../src/app/services/user-agent.service'

@Component({
  standalone: false,
  selector: 'ws-app-org',
  templateUrl: './org.component.html',
  styleUrls: ['./org.component.scss'],
})
export class OrgComponent implements OnInit, OnDestroy {
  orgName!: string
  routeSubscription: any
  currentOrgData: any
  btnText = ''
  competencyData: { identifier: string, name: any; levels: string }[] = []
  rating = 4
  starCount = 5
  stars: number[] = [1, 2, 3, 4, 5]
  color = 'accent'
  ratingArr: any = []
  index = 0
  link = ''
  competency_offered: any = 0
  formattedAbout!: string
  averageRating: any = ''
  totalRatings: any = ''
  orgUserCourseEnrolled: any = 0
  isMobile = false
  private mobileSubscription!: Subscription
  private isDestroyed = false
  isLoading = false
  bannerLoaded = false
  logoLoaded = false
  selectedLanguage: string = 'all'

  // All sections (continue learning, course groups, completed, tag search) resolved from ORG_CONFIG
  orgSections: { config: any, courses: any[], showAll: boolean }[] = []

  constructor(
    private activateRoute: ActivatedRoute,
    private orgService: OrgServiceService,
    private router: Router,
    private configSvc: ConfigurationsService,
    private readonly userSvc: WidgetUserService,
    private valueSvc: ValueService,
    private logger: LoggerService,
    private cdr: ChangeDetectorRef,
    private seoSvc: SeoService,
    private userAgentSvc: UserAgentResolverService,
  ) {
    this.mobileSubscription = this.valueSvc.isLtMedium$.subscribe(mobile => {
      this.isMobile = mobile
      this.detectViewChanges()
    })
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    this.logger.log(event)
    const url = sessionStorage.getItem('currentURL')
    if (url) {
      location.href = url
    }
  }

  ngOnInit() {
    this.userAgentSvc.requestGeolocation()
    for (this.index = 0; this.index < this.starCount; this.index++) {
      this.ratingArr.push(this.index)
    }

    this.routeSubscription = this.activateRoute.queryParams.subscribe(params => {
      this.orgName = (params['orgId'] || '').trim()
      this.resetOrgState()
      if (!this.orgName) {
        this.isLoading = false
        this.detectViewChanges()
        return
      }
      this.loadOrgData()
    })
  }

  private resetOrgState(): void {
    this.isLoading = true
    this.bannerLoaded = false
    this.logoLoaded = false
    this.currentOrgData = undefined
    this.orgSections = []
    this.competencyData = []
    this.selectedLanguage = 'all'
    this.orgUserCourseEnrolled = 0
    this.competency_offered = 0
    this.formattedAbout = ''
    this.averageRating = ''
    this.totalRatings = ''
    this.detectViewChanges()
  }

  private detectViewChanges(): void {
    if (!this.isDestroyed) {
      Promise.resolve().then(() => {
        if (!this.isDestroyed) {
          this.cdr.detectChanges()
        }
      })
    }
  }

  private async loadOrgData(): Promise<void> {
    const userId = this.configSvc.userProfile?.userId ?? this.configSvc.unMappedUser?.id

    try {
      const response: any = await this.orgService.getOrgConfig().toPromise()
      const sources: any[] = response?.result?.form?.data?.sources ?? []

      this.currentOrgData = sources.find((s: any) => s.sourceName?.trim() === this.orgName)
      if (!this.currentOrgData) {
        this.isLoading = false
        this.detectViewChanges()
        return
      }

      this.seoSvc.update({
        title: `${this.orgName} | Aastrika Sphere - Free Healthcare Courses`,
        description: this.currentOrgData.about
          ? this.currentOrgData.about.replace(/<[^>]*>/g, '').slice(0, 160)
          : `Explore free healthcare courses offered by ${this.orgName} on Aastrika Sphere.`,
        ogImage: this.currentOrgData.logo || undefined,
        canonicalUrl: `https://sphere.aastrika.org/app/org-details?orgId=${encodeURIComponent(this.orgName)}`,
      })

      this.formattedAbout = this.formatAbout(this.currentOrgData.about)

      const sections: any[] = this.currentOrgData.sections ?? []

      // Collect all explicit courseIds across courseGroup + courseList sections for a single batch fetch
      const allCourseIds: string[] = sections
        .filter((s: any) => ['courseGroup', 'courseList'].includes(s.sectionType))
        .flatMap((s: any) => s.courseIds ?? [])

      const needsUserData = sections.some(
        (s: any) => ['continueLearning', 'completed'].includes(s.sectionType)
      )

      forkJoin([
        allCourseIds.length ? this.orgService.getSearchResultsV7ById(allCourseIds) : of(null),
        needsUserData && userId ? this.userSvc.fetchUserBatchList(userId) : of([]),
      ]).subscribe({ next: ([courseResult, userBatchList]: any[]) => {
        const fetchedCourses: any[] = courseResult?.result?.content ?? []
        const courseMap = new Map(fetchedCourses.map((c: any) => [c.identifier, c]))

        const inProgressCourses: any[] = []
        const completedCourses: any[] = []
        const startedOrCompletedIds = new Set<string>()

        ;(userBatchList ?? []).forEach((item: any) => {
          const id = item?.content?.identifier ?? item?.courseId
          if (id && allCourseIds.includes(id)) {
            const pct = item.completionPercentage ?? 0
            const normalized = this.normalizeBatchItem(item)
            if (pct === 100) {
              completedCourses.push(normalized)
              startedOrCompletedIds.add(id)
            } else {
              inProgressCourses.push(normalized)
              startedOrCompletedIds.add(id)
            }
          }
        })

        this.orgSections = sections
          .filter((s: any) => s.show !== false)
          .filter((s: any) => s.sectionType !== 'tagSearch')
          .map((sectionConfig: any) => {
            let courses: any[] = []
            switch (sectionConfig.sectionType) {
              case 'continueLearning':
                courses = inProgressCourses
                break
              case 'completed':
                courses = completedCourses
                break
              case 'courseGroup':
              case 'courseList':
                courses = (sectionConfig.courseIds ?? [])
                  .filter((id: string) => !startedOrCompletedIds.has(id))
                  .map((id: string) => courseMap.get(id))
                  .filter(Boolean)
                break
            }
            return { config: sectionConfig, courses, showAll: false }
          })

        if (fetchedCourses.length > 0) {
          this.competencyData = this.groupCompetenciesById(fetchedCourses)
          this.competency_offered = new Set(this.competencyData.map((c: any) => c.competencyId)).size
        }

        // Pre-populate tagSearch slots with empty courses so they are in the DOM before
        // isLoading = false — prevents layout shift when search results arrive later.
        sections
          .filter((s: any) => s.sectionType === 'tagSearch' && s.show !== false)
          .forEach((sectionConfig: any) => {
            const existing = this.orgSections.find((s: any) => s.config.title === sectionConfig.title)
            if (!existing) {
              this.orgSections.push({ config: sectionConfig, courses: [], showAll: false })
            }
          })

        // All synchronous sections are ready — dismiss the shimmer now to avoid CLS
        this.isLoading = false
        this.detectViewChanges()

        // tagSearch sections fire individual search calls and merge courses into the pre-existing slots
        sections
          .filter((s: any) => s.sectionType === 'tagSearch' && s.show !== false)
          .forEach((sectionConfig: any) => {
            const target = this.orgSections.find((s: any) => s.config.title === sectionConfig.title)!

            // Build a deduplicated array of sourceNames: org's own name + taggedSourceName
            const sourceNames = [...new Set([
              this.orgName,
              ...(sectionConfig.taggedSourceName ? [sectionConfig.taggedSourceName] : []),
            ])]

            this.orgService.getSearchV7Results(sourceNames)
              .subscribe((result: any) => {
                const incoming = (result?.result?.content ?? [])
                  .filter((c: any) => sourceNames.includes(c.sourceName))
                const existingIds = new Set(target.courses.map((c: any) => c.identifier))
                const newCourses = incoming.filter((c: any) => !existingIds.has(c.identifier))
                target.courses = [...target.courses, ...newCourses]
                // Extend competencyData with tagSearch courses not already present
                const existingCompIds = new Set(this.competencyData.map((c: any) => c.identifier))
                const newCompetencies = this.groupCompetenciesById(newCourses.filter((c: any) => !existingCompIds.has(c.identifier)))
                this.competencyData = [...this.competencyData, ...newCompetencies]
                this.detectViewChanges()
              })
          })
      },
      error: () => {
        this.isLoading = false
        this.detectViewChanges()
      },
    })

    } catch (e) {
      this.isLoading = false
      this.logger.error('Error loading org data from ORG_CONFIG', e)
      this.detectViewChanges()
    }

    this.configSvc.unMappedUser! == undefined ? this.btnText = 'Login' : this.btnText = 'View Course'
  }

  private normalizeBatchItem(item: any): any {
    return {
      identifier: item.content?.identifier,
      appIcon: item.content?.appIcon,
      thumbnail: item.content?.thumbnail,
      name: item.content?.name,
      completionPercentage: item.completionPercentage,
      sourceName: item.content?.sourceName,
      averageRating: item.content?.averageRating,
      lang: item.content?.lang || 'en',
    }
  }

  // Total number of courses across all non-personal sections (for the stats block)
  get totalCourseCount(): number {
    return this.orgSections
      .filter((s: any) => !['continueLearning', 'completed'].includes(s.config?.sectionType))
      .reduce((total, s) => total + (s.courses?.length ?? 0), 0)
  }

  filterByLanguage(language: 'all' | 'en' | 'hi'): void {
    this.selectedLanguage = language
  }

  getFilteredSectionCourses(courses: any[]): any[] {
    if (!courses) { return [] }
    if (this.selectedLanguage === 'all') { return courses }
    return courses.filter((course: any) => (course.lang || 'en') === this.selectedLanguage)
  }

  getDisplayedItems(items: any[], showAll: boolean, limit = 5): any[] {
    if (showAll) { return items }
    return items.length > limit ? items.slice(0, limit) : items
  }

  getStarImage(index: number, averageRating: number): string {
    const fullStarUrl = '/fusion-assets/icons/toc_star.png'
    const halfStarUrl = '/fusion-assets/icons/Half_star1.svg'
    const emptyStarUrl = '/fusion-assets/icons/empty_star.png'

    const decimalPart = averageRating - Math.floor(averageRating)
    if (index + 1 <= Math.floor(averageRating)) {
      return fullStarUrl
    } else if (decimalPart >= 0.1 && decimalPart <= 0.9 && index === Math.floor(averageRating)) {
      return halfStarUrl
    } else {
      return emptyStarUrl
    }
  }

  formatAbout(text: string): string {
    if (!text) return text
    return text
      .replace(/\n/g, '<br>')
      .replace(/•/g, '&bull;')
      .replace(/\\u2019/g, '&#8217;')
      .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
  }

  add(a: number, b: number): number {
    return a + b
  }

  redirect() {
    const url = sessionStorage.getItem('currentURL')
    if (url) {
      const path = url.startsWith('http') ? new URL(url).pathname : url
      this.router.navigateByUrl(path)
    } else {
      this.router.navigateByUrl('/page/home')
    }
  }

  gotoOverview(identifier: any) {
    sessionStorage.setItem('cURL', location.href)
    this.router.navigate([`/app/toc/${identifier}/overview`])
  }

  showMoreCourses() {
    this.router.navigate(['/app/org-details/all-courses'], { queryParams: { orgId: this.orgName } })
  }

  goToProfile(id: string) {
    this.router.navigate(['/app/person-profile'], { queryParams: { userId: id } })
  }

  goToLink(a: string) {
    window.open(a, '_blank')
  }

  showIcon(index: number) {
    if (this.rating >= index + 1) {
      return 'star'
    }
    return 'star_border'
  }

  groupCompetenciesById(courses: any[]): any[] {
    const grouped: { [key: string]: any } = {}

    courses.forEach((course: any) => {
      if (course?.competencies_v1) {
        let competencies: any[]
        try {
          competencies = JSON.parse(course.competencies_v1)
        } catch (err) {
          competencies = []
        }

        competencies.forEach((comp: any) => {
          if (comp?.competencyId && comp?.level) {
            const key = `${course.identifier}_${comp.competencyId}`

            if (!grouped[key]) {
              grouped[key] = {
                identifier: course.identifier,
                competencyId: comp.competencyId,
                name: comp.competencyName,
                levels: [],
              }
            }

            grouped[key].levels.push(`Level ${comp.level}`)
          }
        })
      }
    })

    return Object.values(grouped)
  }

  ngOnDestroy() {
    this.isDestroyed = true
    this.orgService.hideHeaderFooter.next(false)
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe()
    }
    this.mobileSubscription?.unsubscribe()
    this.orgService.hideHeaderFooter.next(false)
  }
}
