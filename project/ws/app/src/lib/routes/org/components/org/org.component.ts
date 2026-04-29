import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core'
import { ConfigurationsService, LoggerService, ValueService } from '@ws-widget/utils'
import { OrgServiceService } from './../../org-service.service'
import { ActivatedRoute, Router } from '@angular/router'
import { MdePopoverTrigger } from '@jaguards/material-extended-mde'
import { HttpClient } from '@angular/common/http'
import { forkJoin, of, Subscription } from 'rxjs'
import { WidgetUserService } from '@ws-widget/collection'
import { uniqBy } from 'lodash'

@Component({
  standalone: false,
  selector: 'ws-app-org',
  templateUrl: './org.component.html',
  styleUrls: ['./org.component.scss'],

})
export class OrgComponent implements OnInit, OnDestroy {
  @ViewChild('target', { static: false }) target!: MdePopoverTrigger
  orgName!: string
  courseData!: any
  routeSubscription: any
  orgMetaList: any   // Full list of org entries from orgMeta.json
  currentOrgData: any
  showEndPopup = false
  btnText = ''
  courseCount = 0
  cardLimit = 5
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
  inProgressCourses: any[] = []        // Courses the user has started but not completed (0 < pct < 100)
  completedCourses: any[] = []          // Courses the user has fully completed (pct === 100)
  orgUserCourseEnrolled: any = 0
  enrolledCourseCardConfig: any         // Card display config for Continue Learning & Completed sections (card-mini)
  isMobile = false
  private mobileSubscription!: Subscription
  private isDestroyed = false
  // True while orgMeta.json is being fetched; drives the shimmer skeleton in the template
  isLoading = false
  // Track individual image load state so shimmer persists on banner/logo
  // until the browser finishes downloading the S3 image (fires after isLoading = false)
  bannerLoaded = false
  logoLoaded = false
  showAllUserEnrollCourses: boolean = false
  showAllCompletedCourses: boolean = false
  showAllCneSectionMap: { [index: number]: boolean } = {}
  selectedLanguage: string = 'all'
  cneSections: { label: string, courses: any[] }[] = []  // CNE grouped sections built from orgMeta.json courseSections
  cneCourseCardConfig: any              // Card display config for CNE section cards (card-badges)

  constructor(private activateRoute: ActivatedRoute,
    private orgService: OrgServiceService,
    private router: Router,
    private http: HttpClient,
    private configSvc: ConfigurationsService,
    private readonly userSvc: WidgetUserService,
    private valueSvc: ValueService,
    private logger: LoggerService,
    private cdr: ChangeDetectorRef,
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
    for (this.index = 0; this.index < this.starCount; this.index++) {
      this.ratingArr.push(this.index)
    }

    // Subscribe to queryParams instead of reading snapshot once.
    // Angular reuses the same OrgComponent instance when the user navigates
    // between /app/org-details?orgId=X and ?orgId=Y (same route, different
    // query param), so ngOnInit would not re-fire. By subscribing here we
    // react to every orgId change — including the home-redirect that sends
    // an MNC user from another org's page to the MNC org page.
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

  // Clears all data properties so a fresh load of a different org starts clean.
  // Must be called before loadOrgData() whenever the orgId query param changes.
  private resetOrgState(): void {
    this.isLoading = true   // show shimmer skeleton until orgMeta.json resolves
    this.bannerLoaded = false  // reset so banner shimmer shows for the new org
    this.logoLoaded = false    // reset so logo shimmer shows for the new org
    this.courseData = undefined
    this.currentOrgData = undefined
    this.inProgressCourses = []
    this.completedCourses = []
    this.cneSections = []
    this.courseCount = 0
    this.competencyData = []
    this.selectedLanguage = 'all'
    this.cardLimit = 5
    this.showAllUserEnrollCourses = false
    this.showAllCompletedCourses = false
    this.showAllCneSectionMap = {}
    this.orgUserCourseEnrolled = 0
    this.competency_offered = 0
    this.formattedAbout = ''
    this.averageRating = ''
    this.totalRatings = ''
    this.enrolledCourseCardConfig = undefined
    this.cneCourseCardConfig = undefined
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

  // Contains the full org initialisation logic previously in ngOnInit.
  // Extracted so it can be re-run whenever the orgId query param changes.
  private loadOrgData(): void {
    // Resolve the logged-in user's ID early so it's available inside async callbacks below.
    // Prefer the mapped userProfile; fall back to the unMapped user object for SSO flows.
    let userId: string | undefined
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId
    } else {
      userId = this.configSvc.unMappedUser?.id
    }

    // orgMeta.json drives all org-level configuration: logo, banner, about text, and course layout.
    // The cache-buster (?cb=...) ensures we always get the latest version and never serve stale data.
    const url = `https://aastar-app-assets.s3.ap-south-1.amazonaws.com/orgMeta.json?cb=${Date.now()}`

    this.http.get(url, { responseType: 'text' })
      .subscribe(
        (results: any) => {
          try {
            const orgMetaConfig = JSON.parse(results)
            this.orgMetaList = Array.isArray(orgMetaConfig?.sources) ? orgMetaConfig.sources : []

            // Find the entry in orgMeta.json that matches the current org name
            this.currentOrgData = this.orgMetaList.find(
              (orgEntry: any) => orgEntry?.sourceName?.trim() === this.orgName
            )
            if (this.currentOrgData) {
              this.formattedAbout = this.formatAbout(this.currentOrgData.about)
              // Org meta resolved — replace shimmer skeleton with real content
              this.isLoading = false
              this.detectViewChanges()

              // ─── LAYOUT STRATEGY 1: courseSections (e.g. MNC) ───────────────────────────
              // Used when an org configures named course groups in orgMeta.json, e.g.:
              //   "courseSections": [
              //     { "label": "5 CNE Hours Courses", "courseIds": ["do_xxx", ...] },
              //     { "label": "10 CNE Hours Courses", "courseIds": ["do_yyy", ...] }
              //   ]
              // Renders: Continue Learning | CNE sections | Completed
              if (this.currentOrgData?.courseSections) {

                // Flatten all course IDs across every section into a single array
                // so we can fetch them all in one API call
                // Flatten all course IDs across every section into one array for a single API call
                const allCourseIds = this.currentOrgData.courseSections.flatMap((courseSection: any) => courseSection.courseIds)

                // Fetch course metadata and the user's enrolled batch list in parallel
                forkJoin([
                  this.orgService.getSearchResultsV7ById(allCourseIds),       // course details from search API
                  userId ? this.userSvc.fetchUserBatchList(userId) : of([]),   // user's enrolled courses (empty if not logged in)
                ]).subscribe(([courseSearchResult, userBatchList]: any[]) => {

                  // Build a lookup map: courseId → course object for O(1) access when building sections
                  const fetchedCourses: any[] = courseSearchResult?.result?.content || []
                  const coursesByIdentifier = new Map(fetchedCourses.map((course: any) => [course.identifier, course]))

                  // Track IDs of courses the user has started or completed so they can be
                  // excluded from the CNE sections and shown in the correct personal section
                  const startedOrCompletedIds = new Set<string>()

                    // Process each course from the user's enrolled batch list
                    ; (Array.isArray(userBatchList) ? userBatchList : []).forEach((batchItem: any) => {
                      const courseId = batchItem?.content?.identifier ?? batchItem?.courseId
                      const completionPct = batchItem?.completionPercentage ?? 0

                      // Only process courses that belong to this org's CNE sections.
                      // Without this filter, courses from other orgs could leak into
                      // this org's Continue Learning / Completed sections.
                      if (courseId && allCourseIds.includes(courseId)) {
                        if (completionPct >= 0 && completionPct < 100) {
                          // STARTED (in-progress): move to "Continue Learning", hide from CNE sections
                          startedOrCompletedIds.add(courseId)
                          this.inProgressCourses.push({
                            identifier: courseId,
                            appIcon: batchItem.content.appIcon,
                            thumbnail: batchItem.content.thumbnail,
                            name: batchItem.content.name,
                            completionPercentage: completionPct,
                            sourceName: batchItem.content.sourceName,
                            averageRating: batchItem.content.averageRating,
                            lang: batchItem.content.lang || 'en'
                          })
                        } else if (completionPct === 100) {
                          // COMPLETED: move to "Completed" section, hide from CNE sections
                          startedOrCompletedIds.add(courseId)
                          this.completedCourses.push({
                            identifier: courseId,
                            appIcon: batchItem.content.appIcon,
                            thumbnail: batchItem.content.thumbnail,
                            name: batchItem.content.name,
                            completionPercentage: completionPct,
                            sourceName: batchItem.content.sourceName,
                            averageRating: batchItem.content.averageRating,
                            lang: batchItem.content.lang || 'en',
                          })
                        }
                        // completionPct === 0 means enrolled but not started: keep visible in CNE sections
                      }
                    })

                  // Build each CNE section, excluding courses the user has already
                  // started or completed (those are in Continue Learning / Completed)
                  this.cneSections = this.currentOrgData.courseSections.map((courseSection: any) => ({
                    label: courseSection.label,
                    courses: (courseSection.courseIds as string[])
                      .filter((courseId: string) => !startedOrCompletedIds.has(courseId)) // exclude started/completed
                      .map((courseId: string) => coursesByIdentifier.get(courseId))        // resolve ID → course object
                      .filter(Boolean),                                                      // drop IDs not found in search results
                  }))

                  // Card display config for CNE section cards (full thumbnail + badges overlay)
                  this.cneCourseCardConfig = {
                    displayType: 'card-badges',
                    badges: { cneName: true, rating: true, sourceName: true },
                  }

                  // Card display config for Continue Learning and Completed cards (mini with progress bar)
                  // Set unconditionally so the Completed section renders even if inProgressCourses is empty
                  this.enrolledCourseCardConfig = {
                    displayType: 'card-mini',
                    badges: { rating: true, completionPercentage: true, certification: true, mobilesourceName: this.isMobile },
                  }
                  this.detectViewChanges()
                })

                // ─── LAYOUT STRATEGY 2: closedCoursesList (e.g. TNNMC, TNAI, Goa) ─────────
                // Used when an org has a flat list of specific course IDs to always display.
                // For TNNMC, also fetches the user's enrolled courses to show Continue Learning
                // and Completed sections. Other orgs just show the flat course grid.
              } else if (this.currentOrgData && this.currentOrgData.closedCoursesList) {
                this.logger.log("this.currentOrgData.closedCoursesList present", this.currentOrgData.closedCoursesList)

                // TNNMC additionally shows personal Continue Learning / Completed sections
                if (this.orgName === 'Tamil Nadu Nurses and Midwives Council (TNNMC)' && this.currentOrgData) {
                  forkJoin([this.userSvc.fetchUserBatchList(userId)]).pipe().subscribe((batchListResult: any) => {
                    this.logger.log("batchListResult: ", batchListResult)
                    this.formatmyCourseResponse(batchListResult[0])
                    this.detectViewChanges()
                  })
                }

                // Fetch courses by their explicit IDs AND by org name tag, then merge (deduplicated)
                forkJoin([
                  this.orgService.getSearchResultsV7ById(this.currentOrgData.closedCoursesList),
                  this.orgService.getSearchV7Results(this.orgName),
                ]).subscribe(([closedCoursesResult, taggedCoursesResult]: any[]) => {
                  const explicitCourses = closedCoursesResult.result.content || []
                  const orgTaggedCourses = (taggedCoursesResult.result.content || []).filter(
                    (courseItem: any) => courseItem.sourceName === this.currentOrgData.sourceName
                  )

                  // Merge explicit + tagged courses, removing any duplicates by identifier
                  const mergedCourses = [...explicitCourses, ...orgTaggedCourses]
                  this.courseData = uniqBy(mergedCourses, 'identifier')

                  this.courseCount = this.courseData

                  this.logger.log("this.courseData", this.courseData)

                  if (this.courseData.length > 0) {
                    this.competencyData = this.groupCompetenciesById(this.courseData)
                  }
                  this.detectViewChanges()
                })

                // ─── LAYOUT STRATEGY 3: tag-based search (all other orgs) ────────────────
                // No explicit course list configured — search by org name (sourceName field).
                // Falls back to taggedSourceName if the primary search returns no results.
              } else {
                this.orgService.getSearchV7Results(this.orgName).subscribe((courseSearchResult: any) => {
                  this.courseData = courseSearchResult.result.content.filter(
                    (courseItem: any) => courseItem.sourceName === this.orgName
                  )

                  this.courseCount = this.courseData
                  this.logger.log("this.courseData", this.courseData)
                  if (this.courseData && this.courseData.length > 0) {
                    this.competencyData = this.groupCompetenciesById(this.courseData)
                  } else {
                    this.logger.log("this.courseData", this.courseData)

                    // Primary search returned nothing — try the fallback taggedSourceName
                    this.orgService.getSearchResults(this.currentOrgData.taggedSourceName).subscribe((fallbackSearchResult: any) => {
                      this.courseData = fallbackSearchResult.result.content.filter(
                        (courseItem: any) => courseItem.sourceName === this.currentOrgData.taggedSourceName
                      )
                      this.courseCount = this.courseData
                      this.logger.log("this.courseData", this.courseData)
                      if (this.courseData && this.courseData.length > 0) {
                        this.logger.log('l')
                        this.competencyData = this.groupCompetenciesById(this.courseData)
                      }
                      this.detectViewChanges()
                    })
                  }
                  this.detectViewChanges()
                })
              }
            } else {
              this.isLoading = false
              this.detectViewChanges()
            }
          } catch (e) {
            this.isLoading = false
            this.logger.error('Error parsing JSON', e)
            this.detectViewChanges()
          }
        },
        error => {
          this.isLoading = false
          this.logger.error('HTTP error', error)
          this.detectViewChanges()
        }
      )

    // TODO: Re-enable once apis/protected/v8/userEnrolledInSource is fixed (currently returning 500)
    // this.orgService.getEnroledUserForCourses(this.orgName).subscribe((userEnrolled) => {
    //   if (userEnrolled && userEnrolled.length > 0) {
    //     this.orgUserCourseEnrolled = userEnrolled[0].enrolled_users || []
    //     this.competency_offered = userEnrolled[0].competency_offered || undefined
    //   }
    // })

    this.configSvc.unMappedUser! == undefined ? this.btnText = 'Login' : this.btnText = 'View Course'
  }

  filterByLanguage(language: 'all' | 'en' | 'hi'): void {
    this.selectedLanguage = language
    this.cardLimit = 5 // Reset card limit when filtering
  }

  getFilteredCourseData(): any[] {
    if (!this.courseData) {
      return []
    }

    if (this.selectedLanguage === 'all') {
      return this.courseData
    }

    return this.courseData.filter((course: any) => {
      const courseLanguage = course.lang || 'en'
      return courseLanguage === this.selectedLanguage
    })
  }

  getFilteredUserEnrollCourse(): any[] {
    if (!this.inProgressCourses) {
      return []
    }

    if (this.selectedLanguage === 'all') {
      return this.inProgressCourses
    }

    return this.inProgressCourses.filter((course: any) => {
      const courseLanguage = course.lang || 'en'
      return courseLanguage === this.selectedLanguage
    })
  }

  getFilteredCompletedCourse(): any[] {
    if (!this.completedCourses) {
      return []
    }

    if (this.selectedLanguage === 'all') {
      return this.completedCourses
    }

    return this.completedCourses.filter((course: any) => {
      const courseLanguage = course.lang || 'en'
      return courseLanguage === this.selectedLanguage
    })
  }

  getFilteredSectionCourses(courses: any[]): any[] {
    if (!courses) { return [] }
    if (this.selectedLanguage === 'all') { return courses }
    return courses.filter((course: any) => {
      const courseLanguage = course.lang || 'en'
      return courseLanguage === this.selectedLanguage
    })
  }

  getDisplayedItems(items: any[], showAll: boolean): any[] {
    if (showAll) {
      return items
    } else {
      if (items.length > 5) {
        return items.slice(0, 5)
      } else {
        return items
      }
    }
  }

  viewAllItems(section: string): void {
    switch (section) {
      case 'userEnrollCourses':
        this.showAllUserEnrollCourses = !this.showAllUserEnrollCourses
        break
      case 'completedCourses':
        this.showAllCompletedCourses = !this.showAllCompletedCourses
        break
    }
  }

  toggleCneSection(index: number): void {
    this.showAllCneSectionMap[index] = !this.showAllCneSectionMap[index]
  }

  formatmyCourseResponse(batchList: any) {
    // If this org has a closedCoursesList, filter the batch to only include those courses
    if (this.currentOrgData?.closedCoursesList && this.currentOrgData?.closedCoursesList.length > 0) {
      batchList = batchList.filter((batchItem: any) => this.currentOrgData.closedCoursesList.includes(batchItem.content.identifier))
    }
    this.logger.log("orgFiltered", batchList)

    batchList.forEach((enrolledItem: any) => {
      if (enrolledItem?.content?.identifier) {

        // Normalize the batch item shape to match the card component's expected input
        const normalizedCourse = {
          identifier: enrolledItem.content?.identifier,
          appIcon: enrolledItem.content?.appIcon,
          thumbnail: enrolledItem.content?.thumbnail,
          name: enrolledItem.content?.name,
          dateTime: enrolledItem.dateTime,
          completionPercentage: enrolledItem.completionPercentage,
          sourceName: enrolledItem.content?.sourceName,
          issueCertification: enrolledItem.content?.issueCertification,
          averageRating: enrolledItem.content?.averageRating,
          lang: enrolledItem.content?.lang || 'en',
        }

        if (enrolledItem.completionPercentage < 100) {
          this.inProgressCourses.push(normalizedCourse)
        } else {
          this.completedCourses.push(normalizedCourse)
        }
      }
    })
    this.logger.log("personal courses", this.completedCourses, this.inProgressCourses)
    if (this.inProgressCourses.length > 0 || this.completedCourses.length > 0) {
      this.enrolledCourseCardConfig = {
        displayType: 'card-mini',
        badges: {
          rating: true,
          completionPercentage: true,
          certification: true,
          mobilesourceName: this.isMobile ? true : false,
        },
      }
    }
    this.detectViewChanges()
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
      .replace(/\u2022/g, '&bull;')
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
      // Navigation is now language-agnostic; translations handled via ngx-translate
      this.router.navigateByUrl('/page/home')
    }
  }

  toggleCardLimit() {
    if (this.cardLimit === 5) {
      this.cardLimit = this.getFilteredCourseData().length
    } else {
      this.cardLimit = 5
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

  showTarget(event: any) {
    if (window.innerWidth - event.clientX < 483) {
      this.showEndPopup = true
      this.target.targetOffsetX = event.clientX + 1
    }
  }

  loginRedirect(contentId: any) {
    this.router.navigateByUrl(`/app/toc/${contentId}/overview`)
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
    const groupedCompetencies = Object.values(grouped)
    this.logger.log("groupedCompetencies", groupedCompetencies)
    return groupedCompetencies
  }
}
