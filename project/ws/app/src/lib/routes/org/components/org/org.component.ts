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
    private readonly activateRoute: ActivatedRoute,
    private readonly orgService: OrgServiceService,
    private readonly router: Router,
    private readonly configSvc: ConfigurationsService,
    private readonly userSvc: WidgetUserService,
    private readonly valueSvc: ValueService,
    private readonly logger: LoggerService,
    private readonly cdr: ChangeDetectorRef,
    private readonly seoSvc: SeoService,
    private readonly userAgentSvc: UserAgentResolverService,
  ) {
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
    this.mobileSubscription = this.valueSvc.isLtMedium$.subscribe(mobile => {
      this.isMobile = mobile
      this.detectViewChanges()
    })
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
      // Name-only pass, so the page never serves the generic homepage title while
      // ORG_CONFIG is still in flight. Re-run with the full org data once it lands.
      this.applyOrgSeoData()
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

      this.applyOrgSeoData()
      this.formattedAbout = this.formatAbout(this.currentOrgData.about)

      const sections: any[] = this.currentOrgData.sections ?? []
      const allCourseIds = this.collectExplicitCourseIds(sections)
      const needsUserData = sections.some(
        (s: any) => ['continueLearning', 'completed'].includes(s.sectionType)
      )

      forkJoin([
        allCourseIds.length ? this.orgService.getSearchResultsV7ById(allCourseIds) : of(null),
        needsUserData && userId ? this.userSvc.fetchUserBatchList(userId) : of([]),
      ]).subscribe({
        next: ([courseResult, userBatchList]: any[]) =>
          this.handleOrgDataLoaded(sections, allCourseIds, courseResult, userBatchList),
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

  /**
   * Runs twice: once as soon as the orgId is known, then again when ORG_CONFIG resolves.
   * These pages are not prerendered, so the first pass is what a crawler that gives up
   * before the config API returns will see — without it the whole org route served the
   * generic homepage title, which is what Search Console reports across ~72k impressions.
   */
  private applyOrgSeoData(): void {
    const about = this.plainTextAbout(this.currentOrgData?.about)
    const canonicalUrl = `https://sphere.aastrika.org/app/org-details?orgId=${encodeURIComponent(this.orgName)}`

    this.seoSvc.update({
      // Leads with the org name because these pages rank for the council's own name
      // ("indian nursing council", "tnnmc", "maharashtra nursing council") and for its
      // e-learning variants ("inc e learning", "inc cne login").
      title: `${this.orgName} e-Learning | Free CNE Courses & Certification | Aastrika Sphere`,
      description: about
        ? this.truncateAtWord(about, 155)
        // eslint-disable-next-line max-len
        : `Free online CNE courses from ${this.orgName} on Aastrika Sphere. Self-paced, certified training for nurses, ANMs, GNMs, midwives and healthcare workers across India.`,
      keywords: [
        this.orgName,
        `${this.orgName} e learning`,
        `${this.orgName} CNE`,
        'free CNE courses',
        'CNE points online',
        'online courses for nurses India',
        'Aastrika Sphere',
      ].join(', '),
      ogImage: this.currentOrgData?.logo || undefined,
      canonicalUrl,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': `${this.orgName} — Free CNE Courses`,
        'url': canonicalUrl,
        'isPartOf': { '@id': 'https://sphere.aastrika.org/#website' },
        'about': {
          '@type': 'EducationalOrganization',
          'name': this.orgName,
          ...(about ? { description: this.truncateAtWord(about, 300) } : {}),
          ...(this.currentOrgData?.logo ? { logo: this.currentOrgData.logo } : {}),
        },
      },
    })
  }

  private plainTextAbout(about?: string): string {
    if (!about) { return '' }
    return about
      .replaceAll(/<[^>]{0,1000}>/g, ' ')
      .replaceAll('&nbsp;', ' ')
      .replaceAll(/\s+/g, ' ')
      .trim()
  }

  private truncateAtWord(text: string, max: number): string {
    if (text.length <= max) { return text }
    const cut = text.slice(0, max)
    const lastSpace = cut.lastIndexOf(' ')
    return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\s]{1,1000}$/, '')}…`
  }

  private collectExplicitCourseIds(sections: any[]): string[] {
    // Collect all explicit courseIds across courseGroup + courseList sections for a single batch fetch,
    // excluding any IDs each section has opted to hide via `hideCourse`
    return sections
      .filter((s: any) => ['courseGroup', 'courseList'].includes(s.sectionType))
      .flatMap((s: any) => (s.courseIds ?? []).filter((id: string) => !(s.hideCourse ?? []).includes(id)))
  }

  private handleOrgDataLoaded(sections: any[], allCourseIds: string[], courseResult: any, userBatchList: any): void {
    const fetchedCourses: any[] = courseResult?.result?.content ?? []
    const courseMap = new Map(fetchedCourses.map((c: any) => [c.identifier, c]))

    const { inProgressCourses, completedCourses, startedOrCompletedIds } =
      this.partitionCoursesByProgress(userBatchList, allCourseIds)

    this.orgSections = this.buildOrgSections(sections, inProgressCourses, completedCourses, courseMap, startedOrCompletedIds)

    if (fetchedCourses.length > 0) {
      this.competencyData = this.groupCompetenciesById(fetchedCourses)
      this.competency_offered = new Set(this.competencyData.map((c: any) => c.competencyId)).size
    }

    this.populateTagSearchPlaceholders(sections)

    // All synchronous sections are ready — dismiss the shimmer now to avoid CLS
    this.isLoading = false
    this.detectViewChanges()

    this.fetchTagSearchSections(sections)
  }

  private partitionCoursesByProgress(
    userBatchList: any,
    allCourseIds: string[],
  ): { inProgressCourses: any[]; completedCourses: any[]; startedOrCompletedIds: Set<string> } {
    const inProgressCourses: any[] = []
    const completedCourses: any[] = []
    const startedOrCompletedIds = new Set<string>()

      ; (userBatchList ?? []).forEach((item: any) => {
        const id = item?.content?.identifier ?? item?.courseId
        if (id && allCourseIds.includes(id)) {
          const pct = item.completionPercentage ?? 0
          const normalized = this.normalizeBatchItem(item)
          if (pct === 100) {
            completedCourses.push(normalized)
          } else {
            inProgressCourses.push(normalized)
          }
          startedOrCompletedIds.add(id)
        }
      })

    return { inProgressCourses, completedCourses, startedOrCompletedIds }
  }

  private buildOrgSections(
    sections: any[],
    inProgressCourses: any[],
    completedCourses: any[],
    courseMap: Map<string, any>,
    startedOrCompletedIds: Set<string>,
  ): any[] {
    return sections
      .filter((s: any) => s.show !== false)
      .filter((s: any) => s.sectionType !== 'tagSearch')
      .map((sectionConfig: any) => ({
        config: sectionConfig,
        courses: this.resolveSectionCourses(sectionConfig, inProgressCourses, completedCourses, courseMap, startedOrCompletedIds),
        showAll: false,
      }))
  }

  private resolveSectionCourses(
    sectionConfig: any,
    inProgressCourses: any[],
    completedCourses: any[],
    courseMap: Map<string, any>,
    startedOrCompletedIds: Set<string>,
  ): any[] {
    switch (sectionConfig.sectionType) {
      case 'continueLearning':
        return inProgressCourses
      case 'completed':
        return completedCourses
      case 'courseGroup':
      case 'courseList': {
        const hideCourseIds = new Set<string>(sectionConfig.hideCourse ?? [])
        return (sectionConfig.courseIds ?? [])
          .filter((id: string) => !startedOrCompletedIds.has(id) && !hideCourseIds.has(id))
          .map((id: string) => courseMap.get(id))
          .filter(Boolean)
      }
      default:
        return []
    }
  }

  private populateTagSearchPlaceholders(sections: any[]): void {
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
  }

  private fetchTagSearchSections(sections: any[]): void {
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

        const hideCourseIds = new Set<string>(sectionConfig.hideCourse ?? [])

        this.orgService.getSearchV7Results(sourceNames)
          .subscribe((result: any) => this.mergeTagSearchResults(target, sourceNames, hideCourseIds, result))
      })
  }

  private mergeTagSearchResults(
    target: { config: any, courses: any[], showAll: boolean },
    sourceNames: string[],
    hideCourseIds: Set<string>,
    result: any,
  ): void {
    const incoming = (result?.result?.content ?? [])
      .filter((c: any) => sourceNames.includes(c.sourceName) && !hideCourseIds.has(c.identifier))
    const existingIds = new Set(target.courses.map((c: any) => c.identifier))
    const newCourses = incoming.filter((c: any) => !existingIds.has(c.identifier))
    target.courses = [...target.courses, ...newCourses]
    // Extend competencyData with tagSearch courses not already present
    const existingCompIds = new Set(this.competencyData.map((c: any) => c.identifier))
    const newCompetencies = this.groupCompetenciesById(newCourses.filter((c: any) => !existingCompIds.has(c.identifier)))
    this.competencyData = [...this.competencyData, ...newCompetencies]
    this.detectViewChanges()
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

  // Total number of courses across all non-personal sections (for the stats block).
  // Counts what is actually on screen: the cards render through
  // getFilteredSectionCourses, so the total has to honour the language filter too —
  // otherwise "N Courses offered" keeps showing the All total under English/Hindi.
  get totalCourseCount(): number {
    return this.orgSections
      .reduce((total, s: any) => total + this.getFilteredSectionCourses(s.courses).length, 0)
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
      .replaceAll('\n', '<br>')
      .replaceAll('•', '&bull;')
      .replaceAll('\\u2019', '&#8217;')
      .replaceAll('\t', '&nbsp;&nbsp;&nbsp;&nbsp;')
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
