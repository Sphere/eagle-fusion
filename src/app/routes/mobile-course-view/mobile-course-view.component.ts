import { Component, OnInit, Input } from '@angular/core'
import { Router } from '@angular/router'
import { delay, mergeMap } from 'rxjs/operators'
import { of } from 'rxjs'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { UserProfileService } from '../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { SignupService } from '../signup/signup.service'
import forEach from 'lodash/forEach'
import { Title } from '@angular/platform-browser'
import * as _ from 'lodash'

@Component({
  selector: 'ws-mobile-course-view',
  templateUrl: './mobile-course-view.component.html',
  styleUrls: ['./mobile-course-view.component.scss'],
})
export class MobileCourseViewComponent implements OnInit {

  @Input() courseData: any
  @Input() enableConfig = false
  isLoggedIn = false

  @Input()
  displayConfig = {
    displayType: 'card-badges',
    badges: {
      orgIcon: true,
      certification: true,
    },
  }
  constructor(private router: Router,
    private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    private signUpSvc: SignupService,
    private titleService: Title
  ) { }
  cometencyData: { name: any; levels: string }[] = []
  ngOnInit() {
    if (this.configSvc.userProfile) {
      this.isLoggedIn = true
    } else {
      this.isLoggedIn = false
    }
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
  login(data: any) {
    const name = `${data.name} - Aastrika`
    this.titleService.setTitle(name)
    this.router.navigate(['/public/toc/overview'], {
      state: {
        tocData: data,
      },
      queryParams: {
        courseId: data.identifier,
      },
    })
    localStorage.setItem('tocData', JSON.stringify(data))
    localStorage.setItem(`url_before_login`, `app/toc/` + `${data.identifier}` + `/overview`)
  }
  redirectPage(course: any) {
    if (this.isLoggedIn) {
      console.log('yes here')
      this.navigateToToc(course.identifier)
    } else {
      console.log('else')
      this.login(course)
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
          if (this.userProfileSvc.isBackgroundDetailsFilled(_.get(userDetails, 'profileDetails.profileReq'))) {

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
