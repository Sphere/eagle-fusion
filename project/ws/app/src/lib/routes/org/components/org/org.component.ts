import {
  // AuthKeycloakService,
  ConfigurationsService,
} from '@ws-widget/utils'
import { OrgServiceService } from './../../org-service.service'
import { Component, OnInit, ViewChild, OnDestroy, HostListener } from '@angular/core'
import { ActivatedRoute, Router, Data } from '@angular/router'
import { MdePopoverTrigger } from '@material-extended/mde'
import forEach from 'lodash/forEach'
import get from 'lodash/get'

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
  color = 'accent'
  ratingArr: any = []
  index = 0
  link: string = ''
  competency_offered: any = 0
  orgUserCourseEnrolled: any = 0
  constructor(private activateRoute: ActivatedRoute,
    private orgService: OrgServiceService,
    private router: Router,
    // private authSvc: AuthKeycloakService,
    private configSvc: ConfigurationsService) {
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

    // this.orgName = this.activateRoute.snapshot.queryParams.orgId
    // if (this.orgName ) {
    //   this.orgService.hideHeaderFooter.next(true)
    // }
    this.routeSubscription = this.activateRoute.data.subscribe((response: Data) => {
      this.orgName = this.activateRoute.snapshot.queryParams.orgId
      const currentOrg = this.orgName.trim()
      if (response.orgData) {
        this.orgData = response.orgData.data.sources
        this.currentOrgData = this.orgData.filter(
          (org: any) =>
            org.sourceName === currentOrg
        )
        if (this.currentOrgData) {
          this.currentOrgData = this.currentOrgData[0]
          // console.log("this.currentOrgData", this.currentOrgData)
        }
      }
    })
    this.orgService.getEnroledUserForCourses(this.orgName).subscribe((userEnrolled) => {
      if (userEnrolled && userEnrolled.length > 0) {
        this.orgUserCourseEnrolled = userEnrolled[0].enrolled_users || []
        this.competency_offered = userEnrolled[0].competency_offered || undefined
      }
    })
    console.log("this.currentOrgData", this.currentOrgData)
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

    // this.orgService.getDatabyOrgId().then((data: any) => {
    //   console.log(data)
    //   this.courseData = data
    //   this.courseCount = this.courseData.result.length
    // })
    // console.log(this.configSvc)
    // this.configSvc.unMappedUser!.identifier ? this.btnText = 'View Course' : this.btnText = 'Login'
    this.configSvc.unMappedUser! == undefined ? this.btnText = 'Login' : this.btnText = 'View Course'
  }
  add(a: number, b: number): number {
    return a + b
  }

  redirect() {
    let url = sessionStorage.getItem('currentURL')
    if (url) {
      location.href = url
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