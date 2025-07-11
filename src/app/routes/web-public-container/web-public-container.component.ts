import { HttpClient } from '@angular/common/http'
import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core'
import { NavigationExtras, Router } from '@angular/router'
import filter from 'lodash/filter'
import includes from 'lodash/includes'
// import reduce from 'lodash/reduce'
import uniqBy from 'lodash/uniqBy'
import { MatDialog } from '@angular/material/dialog'
import { of } from 'rxjs'
import { OrgServiceService } from '../../../../project/ws/app/src/lib/routes/org/org-service.service'
import { ScrollService } from '../../services/scroll.service'
import { ConfigurationsService } from '@ws-widget/utils'
import { WidgetContentService } from '@ws-widget/collection'
// import { environment } from 'src/environments/environment'
import { catchError, switchMap } from 'rxjs/operators'

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
  constructor(
    private router: Router,
    private http: HttpClient,
    public dialog: MatDialog,
    private orgService: OrgServiceService,
    public scrollService: ScrollService,
    private configSvc: ConfigurationsService,
    private contentSvc: WidgetContentService,
    // private elementRef: ElementRef
  ) {
  }

  async ngOnInit() {
    // Set up user enrolled display configurations
    this.setUserEnrolledDisplayConfig()
    if (this.isEkshamata) {
      this.showTopCourses()
    }
    // Fetch course recommendations if professional details are available
    this.fetchCourseRecommendations()

    // Handle scroll events
    this.handleScrollEvents()

    // Fetch configuration data based on the environment
    this.fetchEnvironmentConfigurations()
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
  private setUserEnrolledDisplayConfig() {
    if (this.userEnrollCourse && this.userEnrollCourse.length > 0) {
      this.userEnrolledDisplayConfig = {
        displayType: 'card-mini',
        badges: {
          certification: true,
          rating: true,
          completionPercentage: true
        }
      }
    } else {
      this.userEnrolledDisplayConfig = {
        displayType: 'card-mini',
        badges: {
          certification: true,
          rating: true,
          completionPercentage: true
        }
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

    if (
      this.configSvc.unMappedUser &&
      this.configSvc.unMappedUser.profileDetails &&
      this.configSvc.unMappedUser.profileDetails.profileReq &&
      this.configSvc.unMappedUser.profileDetails.profileReq.professionalDetails
    ) {
      const professionalDetails = this.configSvc.unMappedUser.profileDetails.profileReq.professionalDetails[0]
      if (professionalDetails) {
        const designation =
          professionalDetails.designation === ''
            ? professionalDetails.profession
            : professionalDetails.designation

        this.contentSvc.fetchCourseRemommendations(designation).subscribe(
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


    // const url = environment.production ? 'mobile-home.json' : 'mobile-home-stage.json'
    const url = 'mobile-home.json'

    this.http.get(`assets/configurations/${url}`).pipe(
      switchMap((configData: any) => {
        const identifiers = [
          ...configData.topCertifiedCourseIdentifier,
          ...configData.cneCoursesIdentifier,
          ...configData.featuredCourseIdentifier
        ]
        this.topCertifiedCourseIdentifier = configData.topCertifiedCourseIdentifier
        this.cneCoursesIdentifier = configData.cneCoursesIdentifier
        this.featuredCourseIdentifier = configData.featuredCourseIdentifier
        return this.orgService.getTopLiveSearchResults(identifiers, this.preferedLanguage.id)
      }),
      catchError((error) => {
        // Handle error if needed
        return of(error) // Returning a default observable in case of error
      })
    ).subscribe((results: any) => {
      if (results.result.content.length > 0) {
        this.formatTopCertifiedCourseResponse(results)
        this.formatcneCourseResponse(results)
      }
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
  formatcneCourseResponse(res: any) {

    const cneCourse = filter(res.result.content, ckey => {
      return includes(this.cneCoursesIdentifier, ckey.identifier)
    })
    this.cneCourse = uniqBy(cneCourse, 'identifier')
    if (this.cneCourse.length > 0) {
      this.CNECourseDisplayConfig = {
        displayType: 'card-badges',
        badges: {
          cneName: true,
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

  formatTopCertifiedCourseResponse(res: any) {

    const topCertifiedCourse = filter(res.result.content, ckey => {
      return includes(this.topCertifiedCourseIdentifier, ckey.identifier)
    })

    this.topCertifiedCourse = uniqBy(topCertifiedCourse, 'identifier')
    if (this.topCertifiedCourse.length > 0) {
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
