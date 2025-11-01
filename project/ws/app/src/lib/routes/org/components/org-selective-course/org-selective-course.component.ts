import { HttpClient } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'
import { forkJoin } from 'rxjs'
import { uniqBy } from 'lodash'
import { ConfigurationsService, ValueService } from '@ws-widget/utils'
import { OrgServiceService } from './../../org-service.service'
import { WidgetUserService } from '@ws-widget/collection'
interface OrgSelectiveCourseJson {
  orgs: {
    orgId: string
    orgName: string
    orgHeaderLogo: string
    bannerImage: string,
    banner?: OrgBanner
    semesters: {
      name: string
      courses: string[]
      sourceName?: string
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
  isLoggedIn: boolean = false
  myCourseDisplayConfig = {
    displayType: 'card-mini',
    badges: {
      cneName: false,
      rating: true,
      completionPercentage: true,
      mobilesourceName: true
    },
  }

  myCourseWebDisplayConfig = { ...this.myCourseDisplayConfig }

  constructor(
    private http: HttpClient,
    private orgService: OrgServiceService,
    private configSvc: ConfigurationsService,
    private valueSvc: ValueService,
    private readonly userSvc: WidgetUserService,
  ) { }

  ngOnInit(): void {
    if (this.configSvc.userProfile) {
      this.isLoggedIn = true
    } else {
      this.isLoggedIn = false
    }
    this.orgId = this.configSvc?.userProfile?.rootOrgId || ''
    this.userId = this.configSvc?.userProfile?.userId || ''
    console.log('Root Org ID:', this.orgId)
    console.log('User ID:', this.userId)
    this.loadOrgSelectiveCourses()
  }

  /**
   * Load org-specific courses from S3 and merge with user progress data
   */
  loadOrgSelectiveCourses() {
    this.isLoading = true

    const cachedOrgConfig = this.configSvc.orgSelectiveCourseConfig
    const orgId = this.orgId

    // ✅ Step 1: If cached org config exists, use it directly
    if (cachedOrgConfig && cachedOrgConfig.orgId === orgId) {
      console.log('✅ Using cached org config for:', orgId)
      this.handleOrgData(cachedOrgConfig)
      return
    }

    // ✅ Step 2: Fallback — fetch S3 JSON only if not cached
    const s3Url = `https://aastar-assets.s3.ap-south-1.amazonaws.com/data/org-selective-course.json?cb=${Date.now()}`

    forkJoin({
      s3Data: this.http.get<OrgSelectiveCourseJson>(s3Url),
      userCourses: this.userSvc.fetchUserBatchList(this.userId)
    }).subscribe({
      next: ({ s3Data, userCourses }) => {
        const org = s3Data.orgs.find((o) => o.orgId === orgId)

        if (!org) {
          console.warn('⚠️ No org found for this rootOrgId:', orgId)
          this.isLoading = false
          return
        }

        // cache org config for next time
        this.configSvc.orgSelectiveCourseConfig = org

        // process the data
        this.handleOrgData(org, userCourses)
      },
      error: (err) => {
        console.error('❌ Error fetching S3 org JSON or user courses:', err)
        this.isLoading = false
      }
    })
  }

  private handleOrgData(org: any, userCourses: any[] = []) {
    console.log('🎯 Loaded org config:', org)

    this.orgLogo = org.orgHeaderLogo || ''
    this.bannerImage = org.bannerImage || ''
    this.bannerTitle = org.banner?.title || ''
    this.bannerPoints = org.banner?.points || []

    const allCourseIds = [].concat(...org.semesters.map((sem: any) => sem.courses))
    if (!allCourseIds.length) {
      console.warn('⚠️ No courses found for org', org.orgName)
      this.isLoading = false
      return
    }

    const requests = allCourseIds.map((id: string) =>
      this.orgService.getSearchResultsV7ById(id)
    )

    forkJoin(requests).subscribe({
      next: (responses: any[]) => {
        const allCourses = responses
          .map(r => r?.result?.content?.[0])
          .filter(Boolean)

        const enrichedCourses = allCourses.map(course => {
          const userProgress = userCourses.find(
            (u: any) => u.courseId === course.identifier
          )
          return {
            ...course,
            completionPercentage: userProgress?.completionPercentage ?? 0
          }
        })

        this.courseData = uniqBy(enrichedCourses, 'identifier')
        this.buildSemesterWiseData(org.semesters)
        this.isLoading = false
      },
      error: (err) => {
        console.error('❌ Error fetching course data:', err)
        this.isLoading = false
      }
    })
  }



  /**
   * Build semester-wise structure for UI rendering
   */
  buildSemesterWiseData(semesters: any[]) {
    this.semesterData = semesters.map(sem => ({
      name: sem.name,
      courses: sem.courses
        .map((id: string) => this.courseData.find(c => c.identifier === id))
        .filter(Boolean)
    }))

    console.log('Final Semester Data:', this.semesterData)
  }
}
