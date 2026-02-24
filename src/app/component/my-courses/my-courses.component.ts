import { Component, OnInit, OnDestroy } from '@angular/core'
import { NsContent, WidgetContentService } from '@ws-widget/collection'
import { ConfigurationsService, ValueService } from '@ws-widget/utils'
import { SignupService } from 'src/app/routes/signup/signup.service'
import { ActivatedRoute, Router } from '@angular/router'
import lodash from 'lodash'
import { PlaylistService } from '../../services/playlist.service'
import { LanguageService } from '../../services/language.service'
import { OrgServiceService } from '../../../../project/ws/app/src/lib/routes/org/org-service.service'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

@Component({
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
  isXSmall$ = this.valueSvc.isXSmall$
  selectedIndex = 0; // Index for the active tab
  yourPlansCourseIdentifier: any[] = []
  config: any
  lang: any
  plyLsData: any
  userEnrolledCourse: any = []
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
  ) { }

  async ngOnInit() {
    this.lang = this.langSvc.getCurrentLanguage()
    this.isLoading = true
    // Load playlist configs
    this.plyLsData = await this.playlistSvc.getPlaylistConfig()
    let res = this.playlistSvc.selectedTabConfig()
    if (res == '') {
      res = await this.playlistSvc.loadPlaylistData()
      this.config = res?.LAYOUT_BODY?.sections?.courseTab
      this.isLoading = false
    } else {
      this.config = res
      this.isLoading = false
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

    // Fetch user courses
    this.contentSvc.fetchUserBatchList(userId).pipe(takeUntil(this.destroy$)).subscribe((courses) => {
      this.userEnrolledCourse = courses
      this.processUserCourses(courses)
      this.updateTabData()
    })

    // Handle professional details
    this.handleProfessionalCourses()
  }

  private processUserCourses(courses: NsContent.ICourse[]) {
    this.startedCourse = []
    this.completedCourse = []

    courses.forEach(course => {
      const competency = lodash.get(course, 'content.competency', false)

      if (!course?.content?.identifier || competency !== false) return

      const courseObj = {
        identifier: course.content.identifier,
        appIcon: course.content.appIcon,
        thumbnail: course.content.thumbnail,
        name: course.content.name,
        dateTime: course.dateTime,
        completionPercentage: course.completionPercentage,
        sourceName: course.content.sourceName,
        issueCertification: course.content.issueCertification,
        posterImage: course.content.posterImage,
      }

      if (course.completionPercentage !== 100) {
        this.startedCourse.push(courseObj)
      } else {
        this.completedCourse.push(courseObj)
      }
    })

    this.startedCourse.sort((a, b) => +new Date(b.dateTime) - +new Date(a.dateTime))
    this.completedCourse.sort((a, b) => +new Date(b.dateTime) - +new Date(a.dateTime))
  }

  private handleProfessionalCourses() {
    const profDet =
      this.configSvc?.unMappedUser?.profileDetails?.profileReq?.professionalDetails

    if (!profDet) {
      this.coursesForYou = []
      this.isLoading = false
      return
    }

    const professionalDetails = profDet[0]
    const designation =
      professionalDetails.designation || professionalDetails.profession

    this.plyLsData.forEach(element => {
      if (
        element.orgId === this.configSvc.userProfile.rootOrgId &&
        element.role.map(r => r.toLowerCase()).includes(designation.toLowerCase()) &&
        element.playlistId === 'YOUR_PLANS_PLAYLIST' &&
        element.language === this.lang
      ) {
        this.yourPlansCourseIdentifier = element.dataSource.payload

        this.orgService
          .getTopLiveSearchResults(this.yourPlansCourseIdentifier, this.lang)
          .subscribe((results: any) => {
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
            this.isLoading = false
          })
      }
    })
  }

  private updateTabData() {
    if (!this.config?.tabMenu) return

    this.config.tabMenu.forEach((tab: any) => {
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
    })
    this.isLoading = false
  }

  tabClick() {
    this.selectedIndex = 1
  }


  async navigateToToc(contentIdentifier: any) {
    sessionStorage.setItem('cURL', location.href)
    // ✅ NO language prefix in URLs - ngx-translate handles language via localStorage
    const baseUrl = document.baseURI.replace(/\/hi\//g, '').replace(/\/$/, '')
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
}
