import { Component, OnInit } from '@angular/core'
import { forkJoin, of } from 'rxjs'
import { catchError, switchMap } from 'rxjs/operators'
import filter from 'lodash/filter'
import includes from 'lodash/includes'
// import reduce from 'lodash/reduce'
import uniqBy from 'lodash/uniqBy'
import { HttpClient } from '@angular/common/http'
import { OrgServiceService } from '../../../org/org-service.service'
import { ValueService, ConfigurationsService } from '@ws-widget/utils'
import { ActivatedRoute } from '@angular/router'
import { WidgetContentService, WidgetUserService } from '@ws-widget/collection'

@Component({
  selector: 'ws-app-view-all',
  templateUrl: './view-all.component.html',
  styleUrls: ['./view-all.component.scss'],
})
export class ViewAllComponent implements OnInit {
  courseType: string | null = null;
  topCertifiedCourseIdentifier: any = []
  featuredCourseIdentifier: any = []
  cneCoursesIdentifier: any = []
  topCertifiedCourse: any = []
  featuredCourse: any = []
  cneCourse: any = []
  coursesForYou: any[] = []
  preferedLanguage: any = { id: 'en', lang: 'English' }
  isLtMedium$ = this.valueSvc.isLtMedium$
  isXSmall$ = this.valueSvc.isXSmall$
  resultsDisplayType: 'basic' | 'advanced' = 'advanced'
  searchResults!: any
  searchRequestStatus = 'none'
  userId: any
  constructor(
    private readonly http: HttpClient,
    private readonly orgService: OrgServiceService,
    private readonly valueSvc: ValueService,
    private readonly route: ActivatedRoute,
    private readonly contentSvc: WidgetContentService,
    private readonly configSvc: ConfigurationsService,
    private readonly userSvc: WidgetUserService,
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.courseType = params['courseType'] || 'defaultCourseType' // Use a default if needed
      console.log('Course Type:', this.courseType)
      this.fetchEnvironmentConfigurations()
    })
  }


  formatTopCertifiedCourseResponse(res: any) {

    const topCertifiedCourse = filter(res.result.content, ckey => {
      return includes(this.topCertifiedCourseIdentifier, ckey.identifier)
    })

    this.searchResults = uniqBy(topCertifiedCourse, 'identifier')
    console.log("searchResults:", this.searchResults)
  }
  fetchEnvironmentConfigurations() {
    const url = 'mobile-home.json'
    this.searchRequestStatus = 'fetching'

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
        if (this.courseType === 'topCourse') {
          this.searchRequestStatus = 'done'
          this.formatTopCertifiedCourseResponse(results)
        } else if (this.courseType === 'formatForYouCourses') {
          this.searchRequestStatus = 'fetching'
          if (this.configSvc.unMappedUser?.profileDetails?.profileReq?.professionalDetails) {
            // Your logic here
            const professionalDetails = this.configSvc.unMappedUser.profileDetails.profileReq.professionalDetails[0]
            if (professionalDetails) {
              const designation = professionalDetails.designation === '' ? professionalDetails.profession : professionalDetails.designation
              this.contentSvc.fetchCourseRemommendations(designation).subscribe(
                (res) => {
                  this.formatForYouCourses(res)
                  this.searchRequestStatus = 'done'
                },
                (err) => {
                  if ([500, 400, 419].includes(err.status)) {
                    this.coursesForYou = []
                    this.searchRequestStatus = 'done'
                  }
                }
              )
            }
          }
          // this.formatForYouCourses(results)
        } else {
          this.searchRequestStatus = 'done'
          this.formatcneCourseResponse(results)
        }
      } else if (this.courseType === 'continueLearning') {
        this.searchRequestStatus = 'fetching'
        if (this.configSvc.userProfile) {
          this.userId = this.configSvc.userProfile.userId || ''
          forkJoin([this.userSvc.fetchUserBatchList(this.userId)]).pipe().subscribe((res: any) => {
            console.log("res: ", res)
            this.formatmyCourseResponse(res[0])
          })
        }
      }
    })
  }
  formatmyCourseResponse(res: any) {
    const myCourse: any = []
    let myCourseObject = {}

    res.forEach((key: any) => {

      myCourseObject = {
        identifier: key.content.identifier,
        appIcon: key.content.appIcon,
        posterImage: key.content.posterImage,
        thumbnail: key.content.thumbnail,
        name: key.content.name,
        dateTime: key.dateTime,
        completionPercentage: key.completionPercentage,
        sourceName: key.content.sourceName,
        issueCertification: key.content.issueCertification,
        averageRating: key.content.averageRating,
        duration: key.content.duration,
        competencies_v1: key.content.competencies_v1,
        status: key.content.status,
        contentType: key.content.contentType,
        lastUpdatedOn: key.content.lastUpdatedOn
      }

      myCourse.push(myCourseObject)
    })
    this.searchRequestStatus = 'done'
    this.searchResults = myCourse
  }
  contentTrackBy(item: any) {
    return item.identifier
  }
  formatcneCourseResponse(res: any) {
    console.log("res", res, this.cneCoursesIdentifier)
    const cneCourse = filter(res.result.content, ckey => {
      return includes(this.cneCoursesIdentifier, ckey.identifier)
    })
    this.searchResults = uniqBy(cneCourse, 'identifier')
  }


  formatFeaturedCourseResponse(res: any) {
    const featuredCourse = filter(res.result.content, ckey => {
      return includes(this.featuredCourseIdentifier, ckey.identifier)
    })
    this.featuredCourse = uniqBy(featuredCourse, 'identifier')
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

    this.searchResults = myCourse

  }
  // NOSONAR - This commented code is intentional
  // formatForYouCourses(results: any, res: any) {
  //   const myCourse: any = []
  //   console.log("res", res)

  //   res.forEach((key: any) => {
  //     myCourse.push(key.course_id)
  //   })
  //   console.log("myCourse", myCourse, results.result.content)
  //   const forYouCourse = filter(results.result.content, ckey => {
  //     return includes(myCourse, ckey.identifier)
  //   })
  // NOSONAR - This commented code is intentional
  //   this.searchResults = uniqBy(forYouCourse, 'identifier')

  // NOSONAR - This commented code is intentional
  //   // // this.searchResults = myCourse
  //   // console.log("myCourse", myCourse)
  // }
}
