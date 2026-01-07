import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core'
import { NavigationExtras, Router } from '@angular/router'
import { uniqBy } from 'lodash'
import { MatDialog } from '@angular/material/dialog'
import { OrgServiceService } from '../../../../project/ws/app/src/lib/routes/org/org-service.service'
import { ScrollService } from '../../services/scroll.service'
import { ConfigurationsService, ValueService } from '@ws-widget/utils'
import { forkJoin } from 'rxjs'
import { PlaylistService } from '../../services/playlist.service'
import { LanguageService } from '../../services/language.service'

@Component({
  selector: 'ws-web-public-container',
  templateUrl: './web-public-container.component.html',
  styleUrls: ['./web-public-container.component.scss'],
})
export class WebPublicComponent implements OnInit {
  myCourse: any
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
  langDialog: any
  preferedLanguage: any = { id: 'en', lang: 'English' }
  displayConfig: any
  isLoading = false
  @ViewChild('scrollToCneCourses', { static: false }) scrollToCneCourses!: ElementRef
  userEnrolledDisplayConfig: { displayType: string; badges: { certification: boolean; rating: boolean; completionPercentage: boolean } } | undefined
  forYouCourseDisplayConfig: { displayType: string; badges: { certification: boolean; rating: boolean; sourceName: boolean } } | undefined
  CNECourseDisplayConfig: any
  isUpLogin: boolean = false
  configData: any
  lang: string = ''
  isXSmall$ = this.valueSvc.isXSmall$
  constructor(
    private router: Router,
    public dialog: MatDialog,
    private orgService: OrgServiceService,
    public scrollService: ScrollService,
    private configSvc: ConfigurationsService,
    private playlistSvc: PlaylistService,
    private langSvc: LanguageService,
    private valueSvc: ValueService
  ) {
    this.lang = this.langSvc.getCurrentLanguage()
  }

  async ngOnInit() {
    let plyLsData: any = await this.playlistSvc.getPlaylistConfig()
    console.log("plyLsData", plyLsData)
    let designation = this.configSvc?.unMappedUser?.profileDetails?.profileReq?.professionalDetails[0]?.designation || ''
    plyLsData.forEach(async (element: any) => {
      if (element.orgId == this.configSvc.userProfile.rootOrgId) {
        if (element.role.map(role => role.toLowerCase()).includes(designation.toLowerCase()) && element.playlistId === "YOUR_PLANS_PLAYLIST" && element.language == this.lang) {
          this.yourPlansCourseIdentifier = element.dataSource.payload
        }
        if (element.playlistId === "TOP_COURSE_PLAYLIST") {
          this.topCertifiedCourseIdentifier = element.dataSource.payload
        }
        if (element.playlistId === "CNE_COURSE_PLAYLIST") {
          this.cneCoursesIdentifier = element.dataSource.payload
        }
        if (this.isEkshamata) {
          if (element.playlistId === "FEATURED_COURSE_PLAYLIST") {
            this.featuredCourseIdentifier = element.dataSource.payload
          }
        }
      }
    })
    this.fetchEnvironmentConfigurations()
    console.log("this.configData", this.configData, this.cneCourse, this.topCertifiedCourse)
    let res = this.playlistSvc.getHomeConfig()
    if (res === "") {
      return
    }
    this.configData = res.slice(1, -1)

    // Handle scroll events
    this.handleScrollEvents()
  }

  private handleScrollEvents() {
    this.scrollService.scrollToDivEvent.subscribe((targetDivId: string) => {
      if (targetDivId === 'scrollToCneCourses') {
        this.scrollService.scrollToElement(this.scrollToCneCourses.nativeElement)
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

    const requests = this.lang === 'en'
      ? [
        this.orgService.getTopLiveSearchResults([...defaultIds, ...identifiers], 'en'),
      ]
      : [
        this.orgService.getTopLiveSearchResults(defaultIds, 'en'),
        this.orgService.getTopLiveSearchResults(identifiers, 'hi'),
      ]

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
      this.configData.forEach((element: any) => {
        if (element.playlistConfigId === 'CONTINUE_LEARNING') {
          element.data = this.userEnrollCourse
        } else if (element.playlistConfigId === 'YOUR_PLANS_PLAYLIST') {
          element.data = this.coursesForYou
        } else if (element.playlistConfigId === 'CNE_COURSE_PLAYLIST') {
          element.data = this.cneCourse
        } else if (element.playlistConfigId === 'TOP_COURSE_PLAYLIST') {
          element.data = !this.isEkshamata ? this.topCertifiedCourse : this.coursesForEK
        }
      })
    })
  }


  // For opening Course Page
  raiseTelemetry(contentIdentifier: any) {
    this.router.navigateByUrl(`/app/toc/${contentIdentifier}/overview`)
  }
  // To view all course
  viewAllCourse(courseType: string) {
    if (courseType === 'continueLearning') {
      this.router.navigate(['app/user/my_courses'])
    } else if (courseType === 'formatForYouCourses') {
      this.router.navigate(['app/user/my_courses'], { queryParams: { courseType } })
    } else {
      this.router.navigate(['app/search/topCourse'], { queryParams: { courseType } })
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

}
