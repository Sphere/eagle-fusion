import { Component, OnInit } from '@angular/core'
import { NsContent, WidgetContentService } from '@ws-widget/collection'
import { ConfigurationsService, ValueService } from '@ws-widget/utils'
import { SignupService } from 'src/app/routes/signup/signup.service'
import { Router } from '@angular/router'

@Component({
  selector: 'ws-my-courses',
  templateUrl: './my-courses.component.html',
  styleUrls: ['./my-courses.component.scss'],
})
export class MyCoursesComponent implements OnInit {
  startedCourse: any[] = []
  completedCourse: any[] = []
  coursesForYou: any[] = []
  isLoading = false
  displayConfig = {
    displayType: 'card-badges',
    badges: {
      orgIcon: true,
      certification: false,
      isCertified: true
    }
  }
  isXSmall$ = this.valueSvc.isXSmall$
  myCourseDisplayConfig: any
  myCourseWebDisplayConfig: any
  coursesForYouDisplayConfig: any
  completedWebCourseDisplayConfig: any
  completedCourseDisplayConfig: any
  constructor(
    private configSvc: ConfigurationsService,
    private contentSvc: WidgetContentService,
    private signupService: SignupService,
    public router: Router,
    private valueSvc: ValueService,
  ) { }

  ngOnInit() {
    if (sessionStorage.getItem('cURL')) {
      sessionStorage.removeItem('cURL')
    }
    let userId
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || ''
    }

    this.isLoading = true
    this.contentSvc.fetchUserBatchList(userId).subscribe(
      (courses: NsContent.ICourse[]) => {
        console.log("courses", courses)

        courses.forEach((key) => {
          if (key.completionPercentage !== 100) {
            const myCourseObject = {
              identifier: key.content.identifier,
              appIcon: key.content.appIcon,
              thumbnail: key.content.thumbnail,
              name: key.content.name,
              dateTime: key.dateTime,
              completionPercentage: key.completionPercentage,
              sourceName: key.content.sourceName,
              issueCertification: key.content.issueCertification
            }

            this.startedCourse.push(myCourseObject)
            this.isLoading = false
          } else {
            const completedCourseObject = {
              identifier: key.content.identifier,
              appIcon: key.content.appIcon,
              thumbnail: key.content.thumbnail,
              name: key.content.name,
              dateTime: key.dateTime,
              completionPercentage: key.completionPercentage,
              sourceName: key.content.sourceName,
              issueCertification: key.content.issueCertification
            }

            this.completedCourse.push(completedCourseObject)
          }
        })

        // Sort courses based on dateTime in descending order
        this.startedCourse.sort((a, b) => {
          const dateTimeA = new Date(a.dateTime).getTime()
          const dateTimeB = new Date(b.dateTime).getTime()
          return dateTimeB - dateTimeA
        })

        this.completedCourse.sort((a, b) => {
          const dateTimeA = new Date(a.dateTime).getTime()
          const dateTimeB = new Date(b.dateTime).getTime()
          return dateTimeB - dateTimeA
        })
        if (this.startedCourse.length > 0) {
          this.myCourseDisplayConfig = {
            displayType: 'card-mini',
            badges: {
              certification: true,
              rating: true,
              completionPercentage: true,
              mobilesourceName: true
            },
          }
          this.myCourseWebDisplayConfig = {
            displayType: 'card-mini',
            badges: {
              certification: true,
              rating: true,
              completionPercentage: true,
              resume: true,
            },
          }
        }
        if (this.completedCourse.length > 0) {
          this.completedCourseDisplayConfig = {
            displayType: 'card-mini',
            badges: {
              rating: true,
              mobilesourceName: true,
              sourceLine: true,
            },
          }
          this.completedWebCourseDisplayConfig = {
            displayType: 'card-mini',
            badges: {
              rating: true,
              viewAll: true,
              mobilesourceName: true,
              sourceLine: true,
            },
          }
        }
        // console.log(this.startedCourse, 'c', this.startedCourse.length)
        // console.log(this.completedCourse, 'aa', this.completedCourse.length)

      })
    if (this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails.profileReq && this.configSvc.unMappedUser!.profileDetails!.profileReq!.professionalDetails) {
      const professionalDetails = this.configSvc.unMappedUser!.profileDetails!.profileReq!.professionalDetails[0]
      if (professionalDetails) {
        const designation = professionalDetails.designation === '' ? professionalDetails.profession : professionalDetails.designation
        this.contentSvc
          .fetchCourseRemommendations(designation).pipe().subscribe((res) => {
            //console.log(res, 'res')
            this.coursesForYou = res
            this.isLoading = false

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
              this.coursesForYouDisplayConfig = {
                displayType: 'card-badges',
                badges: {
                  certification: true,
                  sourceName: true,
                  rating: true
                },
              }

            }
          }, err => {
            console.log(err, err.status === 500)
            if (err.status === 500 || err.status === 400 || err.status === 419) {
              this.coursesForYou = []
              this.isLoading = false
            }
          }

          )
      }
    } else {
      this.coursesForYou = []
      this.isLoading = false
    }
  }
  tabClick() {
    const tabElement = document.getElementById('mat-tab-label-0-1')
    if (tabElement) {
      tabElement.click()
    }
  }


  async navigateToToc(contentIdentifier: any) {
    sessionStorage.setItem('cURL', location.href)
    let local = (this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails!.preferences && this.configSvc.unMappedUser!.profileDetails!.preferences!.language !== undefined) ? this.configSvc.unMappedUser.profileDetails.preferences.language : location.href.includes('/hi/') === true ? 'hi' : 'en'
    let url1 = local === 'hi' ? 'hi' : ""
    let url3 = `${document.baseURI}`
    if (url3.includes('hi')) {
      url3 = url3.replace(/hi\//g, '')
    }
    let url = url1 === 'hi' ? `/app/toc/` + `${contentIdentifier}` + `/overview` : `app/toc/` + `${contentIdentifier}` + `/overview`
    //this.commonUtilService.addLoader()
    const result = await this.signupService.getUserData()
    // this.commonUtilService.removeLoader()
    if (this.configSvc.unMappedUser) {
      //this.commonUtilService.addLoader()
      if (result && result.profileDetails!.profileReq && result.profileDetails!.profileReq!.personalDetails!.dob) {
        location.href = `${url3}${url1}${url}`
      } else {
        if (localStorage.getItem('url_before_login')) {
          const courseUrl = localStorage.getItem('url_before_login')
          this.router.navigate(['/app/about-you'], { queryParams: { redirect: courseUrl } })
          // window.location.assign(`${location.origin}/${this.lang}/${url}/${courseUrl}`)
        } else {
          let url = '/page/home'
          let url4 = `${document.baseURI}`
          if (url4.includes('hi')) {
            url1 = ''
          }
          this.router.navigate(['/app/about-you'], { queryParams: { redirect: `${url1}${url}` } })
        }
      }
    }
  }
}
