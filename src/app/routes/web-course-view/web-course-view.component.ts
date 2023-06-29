import { Component, OnInit, Input } from '@angular/core'
import { Router } from '@angular/router'
import { delay, mergeMap } from 'rxjs/operators'
import { of } from 'rxjs'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { UserProfileService } from '../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { SignupService } from '../signup/signup.service'
import forEach from 'lodash/forEach'

@Component({
  selector: 'ws-web-course-view',
  templateUrl: './web-course-view.component.html',
  styleUrls: ['./web-course-view.component.scss'],
})
export class WebCourseViewComponent implements OnInit {
  isUserLoggedIn = false

  @Input() courseData: any
  @Input() enableConfig = false
  @Input()
  displayConfig = {
    displayType: 'card-badges',
    badges: {
      orgIcon: true,
      certification: true,
    }
  }
  constructor(private router: Router,
    private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    private signUpSvc: SignupService
  ) { }
  cometencyData: { name: any; levels: string }[] = []
  ngOnInit() {
    if (localStorage.getItem('loginbtn') || localStorage.getItem('url_before_login')) {
      this.isUserLoggedIn = true
    } else {
      this.isUserLoggedIn = false
    }
    console.log("displayConfig", this.displayConfig)
    if (this.courseData.competencies_v1 && Object.keys(this.courseData.competencies_v1).length > 0) {

      forEach(JSON.parse(this.courseData.competencies_v1), (value: any) => {
        if (value.level) {
          this.cometencyData.push(
            {
              name: value.competencyName,
              levels: ` Level ${value.level}`,
            }
          )
        }
        return this.cometencyData
      })
    }
  }
  clickToRedirect(data: any) {
    if (this.configSvc.userProfile === null) {
      localStorage.setItem(`url_before_login`, `app/toc/` + `${data.identifier}` + `/overview`)
      const url = localStorage.getItem(`url_before_login`) || ''
      this.router.navigateByUrl(url)
    } else {
      this.raiseTelemetry(data)
    }

  }
  raiseTelemetry(data: any) {
    if (this.configSvc.unMappedUser) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).pipe(delay(50), mergeMap((data: any) => {
        return of(data)
      })).subscribe((userDetails: any) => {
        if (userDetails.profileDetails.profileReq.personalDetails.dob !== undefined) {
          // this.events.raiseInteractTelemetry('click', `${this.widgetType}-${this.widgetSubType}`, {
          //   contentId: this.widgetData.content.identifier,
          //   contentType: this.widgetData.content.contentType,
          //   context: this.widgetData.context,
          // })
          this.router.navigateByUrl(`/app/toc/${data.identifier}/overview?primaryCategory=Course`)
        } else {
          const url = `/app/toc/${data.identifier}/overview`
          this.router.navigate(['/app/about-you'], { queryParams: { redirect: url } })
        }
      })
    }
  }
  // For opening Course Page
  navigateToToc(contentIdentifier: any) {
    // this.router.navigateByUrl(`/app/toc/${contentIdentifier}/overview`)
    const url = `app/toc/` + `${contentIdentifier}` + `/overview`
    if (this.configSvc.userProfile === null) {
      this.signUpSvc.keyClockLogin()
      // localStorage.setItem(`url_before_login`, url)
      // this.router.navigateByUrl('app/login')
    } else {
      if (this.configSvc.unMappedUser) {
        this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).pipe(delay(500), mergeMap((data: any) => {
          return of(data)
        })).subscribe((userDetails: any) => {
          if (userDetails.profileDetails.profileReq.personalDetails.dob !== undefined) {

            // location.href = url
            this.router.navigateByUrl(url)
          } else {
            const courseUrl = `/app/toc/${contentIdentifier}/overview`
            this.router.navigate(['/app/about-you'], { queryParams: { redirect: courseUrl } })
          }
        })
      }
    }

  }
}
