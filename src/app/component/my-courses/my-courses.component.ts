import { Component, OnInit } from '@angular/core'
import { NsContent, WidgetContentService } from '@ws-widget/collection'
import { ConfigurationsService } from '@ws-widget/utils'
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
  displayConfig = {
    displayType: 'card-badges',
    badges: {
      orgIcon: true,
      certification: false,
      isCertified: true
    }
  }

  constructor(
    private configSvc: ConfigurationsService,
    private contentSvc: WidgetContentService,
    private signupService: SignupService,
    private router: Router,
  ) { }

  ngOnInit() {
    let userId
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || ''
    }
    console.log()
    this.contentSvc.fetchUserBatchList(userId).subscribe(
      (courses: NsContent.ICourse[]) => {
        console.log(courses)

        courses.forEach((key) => {
          if (key.completionPercentage !== 100) {
            const myCourseObject = {
              identifier: key.content.identifier,
              appIcon: key.content.appIcon,
              thumbnail: key.content.thumbnail,
              name: key.content.name,
              dateTime: key.dateTime,
              completionPercentage: key.completionPercentage,
            }

            this.startedCourse.push(myCourseObject)
          } else {
            const completedCourseObject = {
              identifier: key.content.identifier,
              appIcon: key.content.appIcon,
              thumbnail: key.content.thumbnail,
              name: key.content.name,
              dateTime: key.dateTime,
              completionPercentage: key.completionPercentage,
            }

            this.completedCourse.push(completedCourseObject)

          }
        })
        console.log(this.startedCourse, 'c', this.startedCourse.length)
        console.log(this.completedCourse, 'aa', this.completedCourse.length)
      })
    if (this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails.profileReq && this.configSvc.unMappedUser!.profileDetails!.profileReq!.professionalDetails) {
      const professionalDetails = this.configSvc.unMappedUser!.profileDetails!.profileReq!.professionalDetails[0]
      if (professionalDetails) {
        const designation = professionalDetails.designation === '' ? professionalDetails.profession : professionalDetails.designation
        this.contentSvc
          .fetchCourseRemommendations(designation).pipe().subscribe((res) => {
            console.log(res, 'res')
            this.coursesForYou = res
          })
      }
    }
  }
  tabClick() {
    let ee = document.getElementById('mat-tab-label-0-1')
    console.log(ee)
    // @ts-ignore: Object is possibly 'null'.
    document.getElementById('mat-tab-label-0-1').click()

  }


  async navigateToToc(contentIdentifier: any) {
    let local = (this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails!.preferences && this.configSvc.unMappedUser!.profileDetails!.preferences!.language !== undefined) ? this.configSvc.unMappedUser.profileDetails.preferences.language : location.href.includes('/hi/') === true ? 'hi' : 'en'
    let url1 = local === 'hi' ? 'hi' : ""
    let url3 = `${document.baseURI}`
    if (url3.includes('hi')) {
      url3 = url3.replace(/hi\//g, '')
    }
    let url = `/app/toc/` + `${contentIdentifier}` + `/overview`
    //this.commonUtilService.addLoader()
    const result = await this.signupService.getUserData()
    // this.commonUtilService.removeLoader()
    if (this.configSvc.unMappedUser) {
      //this.commonUtilService.addLoader()
      if (result && result.profileDetails!.profileReq!.personalDetails!.dob) {
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
