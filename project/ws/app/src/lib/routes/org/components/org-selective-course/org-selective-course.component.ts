import { HttpClient } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'
import { forkJoin, of } from 'rxjs'
import { uniqBy } from 'lodash'
import { ConfigurationsService, LoggerService, ValueService } from '@ws-widget/utils'
import { OrgServiceService } from './../../org-service.service'
import { WidgetUserService } from '@ws-widget/collection'
import { Router } from '@angular/router'

interface OrgSelectiveCourseJson {
  states: {
    code: string
    name: string
    districts?: string[]
    organisations: {
      orgId?: string
      id?: string
      orgName: string
      orgHeaderLogo?: string
      bannerImage?: string
      banner?: OrgBanner
      semesters: {
        name: string
        courses: string[]
        sourceName?: string
      }[]
    }[]
  }[]
}

interface OrgBanner {
  title?: string
  subtitle?: string
  points?: string[]
}

@Component({
  selector: 'ws-org-selective-course',
  templateUrl: './org-selective-course.component.html',
  styleUrls: ['./org-selective-course.component.scss'],
})
export class OrgSelectiveCourseComponent implements OnInit {
  courseData: any[] = []
  semesterData: any[] = []
  orgId!: string
  userId!: string
  isLoading = true
  isXSmall$ = this.valueSvc.isXSmall$
  orgLogo!: string
  bannerImage!: string
  bannerTitle: string = ''
  bannerSubtitle: string = ''
  bannerPoints!: string[]
  isLoggedIn = false

  myCourseDisplayConfig = {
    displayType: 'card-mini',
    badges: {
      cneName: false,
      rating: true,
      completionPercentage: true,
      mobilesourceName: true,
      publicSourceName: false,
    },
  }

  myCourseWebDisplayConfig = { ...this.myCourseDisplayConfig }

  constructor(
    private http: HttpClient,
    private orgService: OrgServiceService,
    private configSvc: ConfigurationsService,
    private valueSvc: ValueService,
    private readonly userSvc: WidgetUserService,
    private router: Router,
    private logger: LoggerService
  ) { }
  sanitizeId(name: string): string {
    return name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
  }
  ngOnInit(): void {
    this.isLoggedIn = !!this.configSvc.userProfile
    if (!this.isLoggedIn) {
      this.myCourseDisplayConfig = {
        displayType: 'card-mini',
        badges: {
          cneName: false,
          rating: false,
          completionPercentage: false,
          mobilesourceName: false,
          publicSourceName: true,
        },
      }

      this.myCourseWebDisplayConfig = this.myCourseDisplayConfig
    }

    this.orgId = this.configSvc?.userProfile?.rootOrgId || ''
    this.userId = this.configSvc?.userProfile?.userId || ''
    this.logger.log('Root Org ID:', this.orgId)
    this.logger.log('User ID:', this.userId, this.myCourseDisplayConfig)
    this.loadOrgSelectiveCourses()
  }



  /**
   * Load org-specific courses from S3 and merge with user progress data
   */
  loadOrgSelectiveCourses() {
    this.isLoading = true

    const cachedOrgConfig = this.configSvc.orgSelectiveCourseConfig
    const orgId = this.orgId
    const urlParams = new URLSearchParams(window.location.search)
    const orgNameFromUrl = urlParams.get('org')?.trim()
    const hasUser = !!this.userId

    // Always fetch user courses if user exists (even with cached config)
    const userCoursesRequest = hasUser
      ? this.userSvc.fetchUserBatchList(this.userId)
      : of([])

    // Use cached config if already matched
    if (
      cachedOrgConfig &&
      (cachedOrgConfig.orgId === orgId ||
        cachedOrgConfig.id === orgId ||
        (orgNameFromUrl &&
          cachedOrgConfig.orgName?.toLowerCase() === orgNameFromUrl.toLowerCase()))
    ) {
      this.logger.log('Using cached org config for:', cachedOrgConfig.orgName || orgId)
      // Still fetch user courses for cached config
      userCoursesRequest.subscribe({
        next: (userCourses) => {
          this.handleOrgData(cachedOrgConfig, userCourses)
        },
        error: (err) => {
          this.logger.error('Error fetching user courses:', err)
          this.handleOrgData(cachedOrgConfig, [])
        },
      })
      return
    }

    // Fetch JSON from S3
    const s3Url = `https://aastar-assets.s3.ap-south-1.amazonaws.com/data/org-selective-course.json?cb=${Date.now()}`
    const s3Request = this.http.get<OrgSelectiveCourseJson>(s3Url)

    forkJoin({
      s3Data: s3Request,
      userCourses: userCoursesRequest,
    }).subscribe({
      next: ({ s3Data, userCourses }) => {
        this.logger.log("userCourses", userCourses)
        if (!s3Data?.states || !Array.isArray(s3Data.states)) {
          this.logger.warn('Invalid org-selective-course.json format')
          this.isLoading = false
          return
        }

        let matchedOrg: any = null

        //1. Logged-in users → match by orgId or id
        if (orgId) {
          for (const state of s3Data.states) {
            const found = state.organisations.find(
              (o) => o.orgId === orgId
            )
            if (found) {
              matchedOrg = found
              break
            }
          }
        }

        //2. Public users → match by orgName param
        if (!matchedOrg && orgNameFromUrl) {
          for (const state of s3Data.states) {
            const found = state.organisations.find(
              (o) =>
                o.orgName?.toLowerCase().trim() === orgNameFromUrl.toLowerCase().trim()
            )
            if (found) {
              matchedOrg = found
              break
            }
          }
        }

        //3. No match found
        if (!matchedOrg) {
          this.logger.warn('No org found for:', orgId || orgNameFromUrl)
          this.isLoading = false
          return
        }

        // Cache for later reuse
        this.configSvc.orgSelectiveCourseConfig = matchedOrg

        // Load org data + user progress
        this.handleOrgData(matchedOrg, userCourses)
      },
      error: (err) => {
        this.logger.error('Error fetching S3 org JSON or user courses:', err)
        this.isLoading = false
      },
    })
  }

  scrollToSem(semName: string) {
    const id = this.sanitizeId(semName)
    const element = document.getElementById(id)

    if (element) {
      const y = element.getBoundingClientRect().top + window.pageYOffset - 80  // scroll 10px above the name
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }



  /**
   * Populate org banner, logo, and courses
   */
  private handleOrgData(org: any, userCourses: any[] = []) {
    this.logger.log('Loaded org config:', org)
    localStorage.setItem('isOrgSelectiveCourse', 'true')

    this.orgLogo = org.orgHeaderLogo || ''
    this.bannerImage = org.bannerImage || ''
    this.bannerTitle = org.banner?.title || ''
    this.bannerSubtitle = org.banner?.subtitle || ''
    this.bannerPoints = org.banner?.points || []

    const allCourseIds = org.semesters?.flatMap((sem: any) => sem.courses) || []
    if (!allCourseIds.length) {
      this.logger.warn('No courses found for org', org.orgName)
      this.isLoading = false
      return
    }

    // Pass all IDs as an array instead of one by one
    this.orgService.getSearchResultsV7ById(allCourseIds).subscribe({
      next: (response: any) => {
        const allCourses = response?.result?.content || []
        this.logger.log('All fetched courses:', allCourses)
        this.logger.log('User courses with progress:', userCourses)

        const enrichedCourses = allCourses.map((course: any) => {
          const userProgress = userCourses.find(
            (u: any) => u.courseId === course.identifier
          )
          const completion = userProgress?.completionPercentage ?? 0
          this.logger.log(`Course: ${course.identifier}, Progress:`, userProgress, 'Completion:', completion)

          // Always include completionPercentage (even if 0)
          return { ...course, completionPercentage: completion }
        })

        this.logger.log('Enriched courses:', enrichedCourses)
        this.courseData = uniqBy(enrichedCourses, 'identifier')
        this.buildSemesterWiseData(org.semesters)
        this.isLoading = false
      },
      error: (err) => {
        this.logger.error('Error fetching course data:', err)
        this.isLoading = false
      },
    })
  }

  /**
   * Build semester-wise structure for UI rendering
   */
  buildSemesterWiseData(semesters: any[]) {
    this.semesterData = semesters.map((sem) => ({
      name: sem.name,
      courses: sem.courses
        .map((id: string) => this.courseData.find((c) => c.identifier === id))
        .filter(Boolean),
    }))
    this.logger.log('Final Semester Data:', this.semesterData)
    this.logger.log('Sample course with completionPercentage:', this.semesterData[0]?.courses[0])
  }
  login() {
    this.router.navigateByUrl('/public/login')
  }
  signUp() {
    const cachedOrgConfig = this.configSvc.orgSelectiveCourseConfig
    const urlParams = new URLSearchParams(window.location.search)
    const orgNameFromUrl = urlParams.get('org')?.trim()

    // If no org data available, stay safe
    if (!cachedOrgConfig && !orgNameFromUrl) {
      this.logger.warn('No organization data found for signup')
      this.router.navigateByUrl('/app/create-account')
      return
    }

    // Determine state code and org name
    const stateCode = cachedOrgConfig?.stateCode || 'TN'
    const orgName = cachedOrgConfig?.orgName || orgNameFromUrl || 'UnknownOrg'

    // Determine user role (can also come from org config if needed)
    const role = cachedOrgConfig?.signupRole || 'TNNMC-Student'

    // Construct dynamic URL
    const path = `/app/create-account/${encodeURIComponent(stateCode)}/${encodeURIComponent(orgName)}/${encodeURIComponent(role)}`

    this.logger.log('Navigating to:', path)
    this.router.navigateByUrl(path)
  }

}
