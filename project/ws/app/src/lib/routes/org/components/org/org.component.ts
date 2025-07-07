import {
  // AuthKeycloakService,
  ConfigurationsService, ValueService
} from '@ws-widget/utils'
import { OrgServiceService } from './../../org-service.service'
import { Component, OnInit, ViewChild, OnDestroy, HostListener } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { MdePopoverTrigger } from '@material-extended/mde'
import forEach from 'lodash/forEach'
import get from 'lodash/get'
import { HttpClient } from '@angular/common/http'
import { forkJoin } from 'rxjs'
import { WidgetUserService } from '@ws-widget/collection'

@Component({
  selector: 'ws-app-org',
  templateUrl: './org.component.html',
  styleUrls: ['./org.component.scss'],
})
export class OrgComponent implements OnInit, OnDestroy {
  @ViewChild('target', { static: false }) target!: MdePopoverTrigger
  //defaultUrl = '/fusion-assets/images/frame-156.svg'
  orgName!: string
  courseData!: any
  routeSubscription: any
  orgData: any
  currentOrgData: any
  showEndPopup = false
  btnText = ''
  courseCount = 0
  cardLimit = 5
  cometencyData: { identifier: string, name: any; levels: string }[] = []
  rating = 4
  starCount = 5
  stars: number[] = [1, 2, 3, 4, 5];
  color = 'accent'
  ratingArr: any = []
  index = 0
  link: string = ''
  competency_offered: any = 0
  formattedAbout!: string
  averageRating: any = ''
  totalRatings: any = ''
  userEnrollCourse: any
  orgUserCourseEnrolled: any = 0
  myCourseDisplayConfig: any
  isMobile = false
  isXSmall$ = this.valueSvc.isXSmall$
  showAllUserEnrollCourses: boolean = false;

  constructor(private activateRoute: ActivatedRoute,
    private orgService: OrgServiceService,
    private router: Router,
    private http: HttpClient,
    // private authSvc: AuthKeycloakService,
    private configSvc: ConfigurationsService,
    private readonly userSvc: WidgetUserService,
    private valueSvc: ValueService,
  ) {
    this.valueSvc.isXSmall$.subscribe(isMobile => (this.isMobile = isMobile))


  }
  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    console.log(event)
    //window.location.href = '/public/home'
    let url = sessionStorage.getItem('currentURL')
    if (url) {
      location.href = url
    }
    //window.history.go(-1)
  }
  ngOnInit() {
    for (this.index = 0; this.index < this.starCount; this.index++) {
      this.ratingArr.push(this.index)
    }

    this.orgName = this.activateRoute.snapshot.queryParams.orgId

    this.http.get('https://aastar-app-assets.s3.ap-south-1.amazonaws.com/orgMeta.json', { responseType: 'text' })
      .subscribe(
        (results: any) => {
          try {
            const currentOrg = this.orgName.trim()
            const parsedResults = JSON.parse(results)
            this.orgData = parsedResults.sources
            this.currentOrgData = this.orgData.filter(
              (org: any) =>
                org.sourceName === currentOrg
            )
            if (this.currentOrgData) {
              this.currentOrgData = this.currentOrgData[0]
              this.formattedAbout = this.formatAbout(this.currentOrgData.about)
              // console.log("this.currentOrgData", this.currentOrgData)
              if (this.currentOrgData && this.currentOrgData.closedCoursesList) {
                console.log("this.currentOrgData.closedCoursesList", this.currentOrgData.closedCoursesList)
                this.orgService.getSearchResultsById(this.currentOrgData.closedCoursesList).subscribe((result: any) => {
                  this.courseData = result.result.content
                  this.courseCount = this.courseData
                  if (this.courseData) {
                    this.courseData.forEach((course: any) => {
                      if (course && course.competencies_v1 && course.competencies_v1.length > 0) {
                        forEach(JSON.parse(get(course, 'competencies_v1')), (value: any) => {
                          //console.log("value", value)
                          if (value.level) {
                            this.cometencyData.push(
                              {
                                identifier: course.identifier,
                                name: value.competencyName,
                                levels: ` Level ${value.level}`,
                              }
                            )
                          }
                          return this.cometencyData
                        })
                      }
                    })
                    // console.log("this.cometencyData", this.cometencyData)

                  }
                })
              } else {
                this.orgService.getSearchResults(this.orgName).subscribe((result: any) => {
                  this.courseData = result.result.content.filter(
                    (org: any) => org.sourceName === this.orgName
                  )
                  this.courseCount = this.courseData
                  console.log("this.courseData", this.courseData)
                  if (this.courseData && this.courseData.length > 0) {
                    this.courseData.forEach((course: any) => {
                      if (course && course.competencies_v1 && course.competencies_v1.length > 0) {
                        forEach(JSON.parse(get(course, 'competencies_v1')), (value: any) => {
                          //console.log("value", value)
                          if (value.level) {
                            this.cometencyData.push(
                              {
                                identifier: course.identifier,
                                name: value.competencyName,
                                levels: ` Level ${value.level}`,
                              }
                            )
                          }
                          return this.cometencyData
                        })
                      }
                    })
                    // console.log("this.cometencyData", this.cometencyData)
                  } else {
                    console.log("this.courseData", this.courseData)

                    this.orgService.getSearchResults(this.currentOrgData.taggedSourceName).subscribe((result: any) => {
                      this.courseData = result.result.content.filter(
                        (org: any) => org.sourceName === this.currentOrgData.taggedSourceName
                      )
                      this.courseCount = this.courseData
                      console.log("this.courseData", this.courseData)
                      if (this.courseData && this.courseData.length > 0) {
                        console.log('l')
                        this.courseData.forEach((course: any) => {
                          if (course && course.competencies_v1 && course.competencies_v1.length > 0) {
                            forEach(JSON.parse(get(course, 'competencies_v1')), (value: any) => {
                              //console.log("value", value)
                              if (value.level) {
                                this.cometencyData.push(
                                  {
                                    identifier: course.identifier,
                                    name: value.competencyName,
                                    levels: ` Level ${value.level}`,
                                  }
                                )
                              }
                              return this.cometencyData
                            })
                          }
                        })
                      }
                    })
                  }
                })
              }
            }
          } catch (e) {
            console.error('Error parsing JSON', e)
          }
        },
        (error) => {
          console.error('HTTP error', error)
        }
      )
    console.log("this.currentOrgData", this.currentOrgData)
    let userId
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId
    } else {
      userId = this.configSvc.unMappedUser.id
    }
    if (this.orgName === 'Tamil Nadu Nurses and Midwives Council (TNNMC)') {
      forkJoin([this.userSvc.fetchUserBatchList(userId)]).pipe().subscribe((res: any) => {

        console.log("res: ", res)
        this.formatmyCourseResponse(res[0])
      })
    }

    this.orgService.getEnroledUserForCourses(this.orgName).subscribe((userEnrolled) => {
      if (userEnrolled && userEnrolled.length > 0) {
        this.orgUserCourseEnrolled = userEnrolled[0].enrolled_users || []
        this.competency_offered = userEnrolled[0].competency_offered || undefined
      }
    })
    console.log("this.currentOrgData.closedCoursesList", this.currentOrgData)


    // this.orgService.getDatabyOrgId().then((data: any) => {
    //   console.log(data)
    //   this.courseData = data
    //   this.courseCount = this.courseData.result.length
    // })
    // console.log(this.configSvc)
    // this.configSvc.unMappedUser!.identifier ? this.btnText = 'View Course' : this.btnText = 'Login'
    this.configSvc.unMappedUser! == undefined ? this.btnText = 'Login' : this.btnText = 'View Course'
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
    }
  }
  formatmyCourseResponse(res: any) {
    const myCourse: any = []
    let myCourseObject = {}

    res.forEach((key: any) => {
      if (key.completionPercentage !== 100) {
        myCourseObject = {
          identifier: key.content.identifier,
          appIcon: key.content.appIcon,
          thumbnail: key.content.thumbnail,
          name: key.content.name,
          dateTime: key.dateTime,
          completionPercentage: key.completionPercentage,
          sourceName: key.content.sourceName,
          issueCertification: key.content.issueCertification,
          averageRating: key.content.averageRating
        }

      } else {
        myCourseObject = {
          identifier: key.content.identifier,
          appIcon: key.content.appIcon,
          thumbnail: key.content.thumbnail,
          name: key.content.name,
          dateTime: key.dateTime,
          completionPercentage: key.completionPercentage,
          sourceName: key.content.sourceName,
          issueCertification: key.content.issueCertification,
          averageRating: key.content.averageRating

        }

      }
      myCourse.push(myCourseObject)

    })
    this.userEnrollCourse = myCourse
    if (this.userEnrollCourse.length > 0) {
      this.myCourseDisplayConfig = {
        displayType: 'card-mini',
        badges: {
          rating: true,
          completionPercentage: true,
          certification: true,
          mobilesourceName: this.isMobile ? true : false
        },
      }
    }
  }
  getStarImage(index: number, averageRating: number): string {
    const fullStarUrl = '/fusion-assets/icons/toc_star.png'
    const halfStarUrl = '/fusion-assets/icons/Half_star1.svg'
    const emptyStarUrl = '/fusion-assets/icons/empty_star.png'

    const decimalPart = averageRating - Math.floor(averageRating) // Calculate the decimal part of the average rating
    if (index + 1 <= Math.floor(averageRating)) {
      return fullStarUrl // Full star
    } else if (decimalPart >= 0.1 && decimalPart <= 0.9 && index === Math.floor(averageRating)) {
      return halfStarUrl // Half star
    } else {
      return emptyStarUrl // Empty star
    }
  }

  formatAbout(text: string): string {
    if (!text) return text
    return text
      .replace(/\n/g, '<br>')
      .replace(/\u2022/g, '&bull;')
      .replace(/\\u2019/g, '&#8217;') // right single quotation mark
      .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;') // replace tab with spaces for proper alignment
  }
  add(a: number, b: number): number {
    return a + b
  }

  redirect() {
    let url = sessionStorage.getItem('currentURL')
    if (url) {
      location.href = url
    } else {

      let local = (this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails!.preferences && this.configSvc.unMappedUser!.profileDetails!.preferences!.language !== undefined) ? this.configSvc.unMappedUser.profileDetails.preferences.language : location.href.includes('/hi/') === true ? 'hi' : 'en'
      let url1 = local === 'hi' ? 'hi' : ""
      console.log(url1)
      let url3 = `${document.baseURI}`
      if (url3.includes('hi')) {
        url3 = url3.replace(/hi\//g, '')
      }
      let url = url1 === 'hi' ? '/page/home' : 'page/home'
      this.router.navigateByUrl(`${url1}${url}`)
      //location.href = `${url3}${url1}${url}`
    }
  }

  toggleCardLimit() {
    if (this.cardLimit === 5) {
      this.cardLimit = this.courseData.length
    } else {
      this.cardLimit = 5
    }
  }
  gotoOverview(identifier: any) {
    sessionStorage.setItem('cURL', location.href)
    // if (this.configSvc.isAuthenticated) {
    this.router.navigate([`/app/toc/${identifier}/overview`])
    // } else {
    // const url = `/app/toc/${identifier}/overview`
    // localStorage.setItem('selectedCourse', url)
    // this.authSvc.login('S', url)
    // }
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
    } else {
      // console.log('this.showEndPopup', this.showEndPopup)
    }
  }
  loginRedirect(contentId: any) {
    // if (this.configSvc.isAuthenticated) {
    this.router.navigateByUrl(`/app/toc/${contentId}/overview`)
    // } else {
    //   const url = `/app/toc/${contentId}/overview`
    //   localStorage.setItem('selectedCourse', url)
    //   this.authSvc.login(key, url)
    // }
  }
  ngOnDestroy() {
    this.orgService.hideHeaderFooter.next(false)
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe()
    }
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

}