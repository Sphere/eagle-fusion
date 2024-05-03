import { HttpClient } from '@angular/common/http'
import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core'
import { NavigationExtras, Router } from '@angular/router'
import filter from 'lodash/filter'
import includes from 'lodash/includes'
// import reduce from 'lodash/reduce'
import uniqBy from 'lodash/uniqBy'
import { MatDialog } from '@angular/material'
import { forkJoin } from 'rxjs'
import { OrgServiceService } from '../../../../project/ws/app/src/lib/routes/org/org-service.service'
import { ScrollService } from '../../services/scroll.service'
import { ConfigurationsService } from '@ws-widget/utils'
import { WidgetContentService } from '@ws-widget/collection'

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
  isLoading = false
  @ViewChild('scrollToCneCourses', { static: false }) scrollToCneCourses!: ElementRef
  userEnrolledDisplayConfig: { displayType: string; badges: { certification: boolean; rating: boolean; completionPercentage: boolean } } | undefined
  forYouCourseDisplayConfig: { displayType: string; badges: { certification: boolean; rating: boolean; sourceName: boolean } } | undefined
  CNECourseDisplayConfig: any
  constructor(
    private router: Router,
    private http: HttpClient,
    public dialog: MatDialog,
    private orgService: OrgServiceService,
    private scrollService: ScrollService,
    private configSvc: ConfigurationsService,
    private contentSvc: WidgetContentService,
    // private elementRef: ElementRef
  ) {
  }

  async ngOnInit() {
    if (this.userEnrollCourse && this.userEnrollCourse.length > 0) {
      this.userEnrolledDisplayConfig = {
        displayType: 'card-mini',
        badges: {
          certification: true,
          rating: true,
          completionPercentage: true
        },
      }
    }
    if (this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails.profileReq && this.configSvc.unMappedUser!.profileDetails!.profileReq!.professionalDetails) {
      const professionalDetails = this.configSvc.unMappedUser!.profileDetails!.profileReq!.professionalDetails[0]
      if (professionalDetails) {
        this.isLoading = true
        const designation = professionalDetails.designation === '' ? professionalDetails.profession : professionalDetails.designation
        this.contentSvc
          .fetchCourseRemommendations(designation).pipe().subscribe((res) => {
            console.log(res, 'res')
            this.formatForYouCourses(res)
            this.isLoading = false
          }, err => {
            console.log(err, err.status === 500)
            if (err.status === 500 || err.status === 400 || err.status === 419) {
              this.coursesForYou = []
              this.isLoading = false
            }
          }
          )
      }
    }


    this.scrollService.scrollToDivEvent.subscribe((targetDivId: string) => {
      if (targetDivId === 'scrollToCneCourses') {
        this.scrollService.scrollToElement(this.scrollToCneCourses.nativeElement)
      }
    })
    forkJoin([this.orgService.getLiveSearchResults(this.preferedLanguage.id),
    await this.http.get(`assets/configurations/mobile-home.json`)]).pipe().subscribe((res: any) => {

      this.homeFeature = res[0].userLoggedInSection
      this.topCertifiedCourseIdentifier = res[1].topCertifiedCourseIdentifier
      this.cneCoursesIdentifier = res[1].cneCoursesIdentifier

      this.featuredCourseIdentifier = res[1].featuredCourseIdentifier
      if (res[0].result.content.length > 0) {
        this.formatTopCertifiedCourseResponse(res[0])
        // this.formatFeaturedCourseResponse(res[0])
        this.formatcneCourseResponse(res[0])

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
    console.log("yes course", cneCourse)
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
  viewAllCourse() {
    this.router.navigateByUrl(`app/search/learning`)
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
