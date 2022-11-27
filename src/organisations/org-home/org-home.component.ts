import { Component, OnInit } from '@angular/core'
import { OrgServiceService } from './../org-home-service.service'
import { ConfigurationsService } from '@ws-widget/utils'
import { Router } from '@angular/router'
import { delay, mergeMap } from 'rxjs/operators'
import { of } from 'rxjs'
import { SignupService } from '../../app/routes/signup/signup.service'
import { UserProfileService } from '../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import _ from 'lodash'
@Component({
  selector: 'ws-org-home',
  templateUrl: './org-home.component.html',
  styleUrls: ['./org-home.component.scss'],
})
export class OrgHomeComponent implements OnInit {
  courses: any
  resultResponse: any
  resultEnroll: any
  contentId: any = []
  language: any = ""
  enrollData: any = true


  constructor(
    private router: Router,
    private orgService: OrgServiceService,
    private userProfileSvc: UserProfileService,
    private configSvc: ConfigurationsService,
    private signUpSvc: SignupService) {
  }

  ngOnInit() {
    this.getCourseDetails(this.language)
  }

  getCourseDetails(language: string) {
    let courseArray: any = []
    this.orgService.getLiveSearchResults(language).subscribe((response: any) => {
      this.resultResponse = response.result.content
      courseArray = this.resultResponse.map((identifierValue: { identifier: any }) => identifierValue.identifier)
      let userId = ''
      let enrollmentArr: any = []
      if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId || ''

        this.orgService.fetchUserBatchList(userId).subscribe((responseEnrollment: any) => {
          // tslint:disable-next-line:max-line-length
          enrollmentArr = responseEnrollment.filter((enrollment: { contentId: any }) => courseArray.includes(enrollment.contentId))
          enrollmentArr = _.orderBy(enrollmentArr, ['dateTime'], ['desc'])
          this.resultEnroll = [enrollmentArr[0]]
          if (this.resultEnroll.length > 0) { this.enrollData = false }
          console.log("this.enrollData >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>" + this.enrollData)
        })
      }
      console.log("this.enrollData >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>" + this.enrollData)
      return courseArray
    })
  }

  navigateToToc(contentIdentifier: any) {
    const url = `app/toc/` + `${contentIdentifier}` + `/overview`
    if (this.configSvc.userProfile === null) {
      this.signUpSvc.keyClockLogin()
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


