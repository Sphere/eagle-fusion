import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core'
import { NavigationExtras, Router } from '@angular/router'
import { filter, includes, uniqBy } from 'lodash'
import { MatDialog } from '@angular/material/dialog'
import { OrgServiceService } from '../../../../project/ws/app/src/lib/routes/org/org-service.service'
import { ScrollService } from '../../services/scroll.service'
import { ConfigurationsService } from '@ws-widget/utils'
import { WidgetContentService } from '@ws-widget/collection'
import { PlaylistService } from '../../services/playlist.service'

@Component({
  selector: 'ws-web-public-container',
  templateUrl: './web-public-container.component.html',
  styleUrls: ['./web-public-container.component.scss'],
})
export class WebPublicComponent implements OnInit {
  myCourse: any
  topCertifiedCourse: any = []
  featuredCourse: any = []
  cneCourse: any = []
  videoData: any
  homeFeatureData: any
  homeFeature: any
  userId: any
  firstName: any
  topCertifiedCourseIdentifier: any = []
  featuredCourseIdentifier: any = []
  cneCoursesIdentifier: any = []
  @Input() userEnrollCourse: any
  // languageIcon = '../../../fusion-assets/images/lang-icon.png'
  langDialog: any
  preferedLanguage: any = { id: 'en', lang: 'English' }
  displayConfig: any
  coursesForYou: any[] = []
  coursesForUP: any[] = []
  isLoading = false
  @ViewChild('scrollToCneCourses', { static: false }) scrollToCneCourses!: ElementRef
  userEnrolledDisplayConfig: { displayType: string; badges: { certification: boolean; rating: boolean; completionPercentage: boolean } } | undefined
  forYouCourseDisplayConfig: { displayType: string; badges: { certification: boolean; rating: boolean; sourceName: boolean } } | undefined
  CNECourseDisplayConfig: any
  @Input() isEkshamata: any
  isUpLogin: boolean = false
  configData: any
  constructor(
    private router: Router,
    // private http: HttpClient,
    public dialog: MatDialog,
    private orgService: OrgServiceService,
    public scrollService: ScrollService,
    private configSvc: ConfigurationsService,
    private contentSvc: WidgetContentService,
    private playlistSvc: PlaylistService
    // private elementRef: ElementRef
  ) {
  }

  async ngOnInit() {
    let plyLsData: any = await this.playlistSvc.getPlaylistConfig(this.configSvc?.userProfile?.rootOrgId)
    console.log("plyLsData", plyLsData)
    let designation = this.configSvc?.unMappedUser?.profileDetails?.profileReq?.professionalDetails[0]?.designation || ''
    console.log("designation", designation)
    // element.role.map(role => role.toLowerCase()).includes(designation.toLowerCase())
    plyLsData.forEach(async (element: any) => {
      if (element.orgId == this.configSvc.userProfile.rootOrgId) {
        if (element.playlistId === "TOP_COURSE_PLAYLIST") {
          this.topCertifiedCourseIdentifier = element.dataSource.payload
        }
        if (element.playlistId === "CNE_COURSE_PLAYLIST") {
          this.cneCoursesIdentifier = element.dataSource.payload
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

    if (this.isEkshamata) {
      this.showTopCourses()
    }
    // Fetch course recommendations if professional details are available
    this.fetchCourseRecommendations()

    // Handle scroll events
    this.handleScrollEvents()
  }
  showTopCourses() {
    this.topCertifiedCourse = []
    console.log("this.configSvc.hostedInfo", this.configSvc.hostedInfo)
    if (this.configSvc.hostedInfo?.featuredCourseIdentifier) {
      this.isUpLogin = true
      this.orgService.getTopLiveSearchResults(this.configSvc.hostedInfo.featuredCourseIdentifier, this.preferedLanguage.id).subscribe((results: any) => {
        console.log("yes here hostedInfo", results.result.content)
        if (results.result.content.length > 0) {
          this.formatForYouUPCourses(results.result.content)
          console.log("yes here hostedInfo", results.result.content)
        }
      })

    }
  }
  // this.configSvc.hostedInfo
  formatForYouUPCourses(res: any) {
    const myCourse: any = []
    let myCourseObject = {}

    res.forEach((key: any) => {
      myCourseObject = {
        identifier: key.identifier,
        appIcon: key.appIcon,
        thumbnail: key.thumbnail,
        name: key.name,
        sourceName: key.sourceName,
        issueCertification: key.issueCertification
      }

      myCourse.push(myCourseObject)

    })

    this.coursesForUP = myCourse
    if (this.coursesForUP.length > 0) {
      this.forYouCourseDisplayConfig = {
        displayType: 'card-badges',
        badges: {
          certification: true,
          rating: true,
          sourceName: true
        },
      }
    }
  }

  private fetchCourseRecommendations() {
    console.log("Fetching course recommendations...")
    this.isLoading = true

    const timeout = setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false
        console.error("API call timed out.")
      }
    })

    if (this.configSvc?.unMappedUser?.profileDetails?.profileReq?.professionalDetails) {
      const professionalDetails = this.configSvc.unMappedUser.profileDetails.profileReq.professionalDetails[0]
      if (professionalDetails) {
        const designation =
          professionalDetails.designation === ''
            ? professionalDetails.profession
            : professionalDetails.designation
        const lang = this.configSvc.unMappedUser.profileDetails.preferences.language
        const forYouRequestData = {
          designation: designation,
          orgId: this.configSvc?.userProfile?.rootOrgId,
          language: lang
        }

        this.contentSvc.COURSE_RECOMMENDATION_V2(forYouRequestData).subscribe(
          (res) => {
            clearTimeout(timeout) // Clear timeout on success
            this.formatForYouCourses(res)
            this.isLoading = false
          },
          (err) => {
            clearTimeout(timeout) // Clear timeout on error
            console.error("Error fetching course recommendations:", err)
            this.coursesForYou = []
            this.isLoading = false
          }
        )
      }
    } else {
      clearTimeout(timeout)
      this.isLoading = false
    }
  }

  private handleScrollEvents() {
    this.scrollService.scrollToDivEvent.subscribe((targetDivId: string) => {
      if (targetDivId === 'scrollToCneCourses') {
        this.scrollService.scrollToElement(this.scrollToCneCourses.nativeElement)
      }
    })
  }

  private fetchEnvironmentConfigurations() {
    const identifiers = [
      ...this.topCertifiedCourseIdentifier,
      ...this.cneCoursesIdentifier,
    ]

    return this.orgService.getTopLiveSearchResults(identifiers, this.preferedLanguage.id)
      .subscribe((results: any) => {
        const content = results?.result?.content || []
        if (!content.length) {
          return
        }
        const cneSet = new Set(this.cneCoursesIdentifier)
        const topCertifiedSet = new Set(this.topCertifiedCourseIdentifier)
        this.cneCourse = uniqBy(
          content.filter(item => cneSet.has(item.identifier)),
          'identifier'
        )
        this.topCertifiedCourse = uniqBy(
          content.filter(item => topCertifiedSet.has(item.identifier)),
          'identifier'
        )
        // Set up user enrolled display configurations
        this.configData.forEach((element: any) => {
          console.log("element.playlistConfigId", element.playlistConfigId)
          if (element.playlistConfigId === "CONTINUE_LEARNING") {
            element.data = this.userEnrollCourse
          } else if (element.playlistConfigId === 'YOUR_PLANS_PLAYLIST') {
            element.data = this.coursesForUP
          } else if (element.playlistConfigId === 'CNE_COURSE_PLAYLIST') {
            element.data = this.cneCourse
          } else if (element.playlistConfigId === 'TOP_COURSE_PLAYLIST') {
            element.data = this.topCertifiedCourse
          }
        })
      })
  }

  formatForYouCourses(res: any) {
    const myCourse: any = []
    let myCourseObject = {}

    res.forEach((key: any) => {
      myCourseObject = {
        identifier: key.course_id,
        appIcon: key.course_appIcon,
        thumbnail: key.course_thumbnail,
        name: key.course_name,
        sourceName: key.course_sourceName,
        issueCertification: key.course_issueCertification
      }

      myCourse.push(myCourseObject)

    })

    this.coursesForYou = myCourse
    if (this.coursesForYou.length > 0) {
      this.forYouCourseDisplayConfig = {
        displayType: 'card-badges',
        badges: {
          certification: true,
          rating: true,
          sourceName: true
        },
      }
    }
  }
  formatFeaturedCourseResponse(res: any) {
    const featuredCourse = filter(res.result.content, ckey => {
      return includes(this.featuredCourseIdentifier, ckey.identifier)
    })
    this.featuredCourse = uniqBy(featuredCourse, 'identifier')
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
