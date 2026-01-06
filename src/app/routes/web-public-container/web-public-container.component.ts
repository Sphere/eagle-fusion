import { HttpClient } from '@angular/common/http'
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input } from '@angular/core'
import { NavigationExtras, Router } from '@angular/router'
import { filter, includes, uniqBy } from 'lodash'
import { MatDialog } from '@angular/material/dialog'
import { Subject, of } from 'rxjs'
import { OrgServiceService } from '../../../../project/ws/app/src/lib/routes/org/org-service.service'
import { ScrollService } from '../../services/scroll.service'
import { ConfigurationsService } from '@ws-widget/utils'
import { WidgetContentService } from '@ws-widget/collection'
// import { environment } from 'src/environments/environment'
import { catchError, switchMap, takeUntil } from 'rxjs/operators'

@Component({
  selector: 'ws-web-public-container',
  templateUrl: './web-public-container.component.html',
  styleUrls: ['./web-public-container.component.scss'],
})
export class WebPublicComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>()
  private courseRecommendationTimeout: any

  topCertifiedCourse: any = []
  featuredCourse: any = []
  cneCourse: any = []
  topCertifiedCourseIdentifier: any = []
  featuredCourseIdentifier: any = []
  cneCoursesIdentifier: any = []
  @Input() userEnrollCourse: any
  preferedLanguage: any = { id: 'en', lang: 'English' }
  coursesForYou: any[] = []
  coursesForUP: any[] = []
  isLoading = false
  @ViewChild('scrollToCneCourses', { static: false }) scrollToCneCourses?: ElementRef
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
    private contentSvc: WidgetContentService
  ) {
  }

  ngOnInit() {
    this.setUserEnrolledDisplayConfig()
    if (this.isEkshamata) {
      this.showTopCourses()
    }
    this.fetchCourseRecommendations()
    this.handleScrollEvents()
    this.fetchEnvironmentConfigurations()
  }
  showTopCourses() {
    this.topCertifiedCourse = []
    if (this.configSvc.hostedInfo?.featuredCourseIdentifier) {
      this.isUpLogin = true
      this.orgService.getTopLiveSearchResults(this.configSvc.hostedInfo.featuredCourseIdentifier, this.preferedLanguage.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (results: any) => {
            if (results?.result?.content?.length > 0) {
              this.formatForYouUPCourses(results.result.content)
            }
          },
          (err) => {
            console.error('Error fetching top courses:', err)
          }
        )
    }
  }
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
    this.userEnrolledDisplayConfig = {
      displayType: 'card-mini',
      badges: {
        certification: true,
        rating: true,
        completionPercentage: true
      }
    }
  }

  private fetchCourseRecommendations() {
    this.isLoading = true
    const RECOMMENDATION_TIMEOUT = 30000

    this.courseRecommendationTimeout = setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false
        console.warn('Course recommendation API call timed out')
      }
    }, RECOMMENDATION_TIMEOUT)

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
        const lang = this.configSvc.unMappedUser.profileDetails.preferences.language
        const forYouRequestData = {
          designation: designation,
          orgId: this.configSvc?.userProfile?.rootOrgId,
          language: lang
        }

        this.contentSvc.COURSE_RECOMMENDATION_V2(forYouRequestData)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            (res) => {
              if (this.courseRecommendationTimeout) {
                clearTimeout(this.courseRecommendationTimeout)
              }
              this.formatForYouCourses(res)
              this.isLoading = false
            },
            (err) => {
              if (this.courseRecommendationTimeout) {
                clearTimeout(this.courseRecommendationTimeout)
              }
              console.error('Error fetching course recommendations:', err)
              this.coursesForYou = []
              this.isLoading = false
            }
          )
      }
    } else {
      if (this.courseRecommendationTimeout) {
        clearTimeout(this.courseRecommendationTimeout)
      }
      this.isLoading = false
    }
  }

  private handleScrollEvents() {
    this.scrollService.scrollToDivEvent
      .pipe(takeUntil(this.destroy$))
      .subscribe((targetDivId: string) => {
        if (targetDivId === 'scrollToCneCourses' && this.scrollToCneCourses) {
          this.scrollService.scrollToElement(this.scrollToCneCourses.nativeElement)
        }
      })
  }

  private fetchEnvironmentConfigurations() {
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
        console.error('Error fetching environment configurations:', error)
        return of({ result: { content: [] } })
      }),
      takeUntil(this.destroy$)
    ).subscribe((results: any) => {
      if (results?.result?.content && results.result.content.length > 0) {
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

  ngOnDestroy() {
    if (this.courseRecommendationTimeout) {
      clearTimeout(this.courseRecommendationTimeout)
    }
    this.destroy$.next()
    this.destroy$.complete()
  }

}
