import { Component, OnInit, Input } from '@angular/core'
import { Router } from '@angular/router'
import { delay, mergeMap } from 'rxjs/operators'
import { of } from 'rxjs'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { UserProfileService } from '../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'

@Component({
  selector: 'ws-mobile-course-view',
  templateUrl: './mobile-course-view.component.html',
  styleUrls: ['./mobile-course-view.component.scss'],
})
export class MobileCourseViewComponent implements OnInit {

  @Input() courseData: any
  @Input() enableConfig = false
  constructor(private router: Router,
              private configSvc: ConfigurationsService,
              private userProfileSvc: UserProfileService
  ) { }

  ngOnInit() {
  }

  // For opening Course Page
  navigateToToc(contentIdentifier: any) {
    // this.router.navigateByUrl(`/app/toc/${contentIdentifier}/overview`)

    const url = `app/toc/` + `${contentIdentifier}` + `/overview`
    if (localStorage.getItem('telemetrySessionId') === null && localStorage.getItem('loginbtn') === null) {
      localStorage.setItem(`url_before_login`, url)
      this.router.navigateByUrl('app/login')
    } else {
      if (this.configSvc.unMappedUser) {
        this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).pipe(delay(500), mergeMap((data: any) => {
          return of(data)
        })).subscribe((userDetails: any) => {
          if (userDetails.profileDetails.profileReq.personalDetails.dob !== undefined) {
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
