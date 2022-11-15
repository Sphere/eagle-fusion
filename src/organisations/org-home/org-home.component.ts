import { Component, OnInit } from '@angular/core'
import { OrgServiceService } from './../org-home-service.service'
import { ConfigurationsService } from '@ws-widget/utils'
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

  constructor(private orgService: OrgServiceService, private configSvc: ConfigurationsService) {
  }

  ngOnInit() {
    let courseArray: any = []
    this.orgService.getLiveSearchResults().subscribe((response: any) => {
      this.resultResponse = response.result.content
      courseArray = this.resultResponse.map((identifierValue: { identifier: any }) => identifierValue.identifier)
      let userId = ''
      let enrollmentArr: any = []
      if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId || ''

        this.orgService.fetchUserBatchList(userId).subscribe((responseEnrollment: any) => {
          // tslint:disable-next-line:max-line-length
          enrollmentArr = responseEnrollment.filter((enrollment: { contentId: any }) => courseArray.includes(enrollment.contentId))
          this.resultEnroll = enrollmentArr
        })
      }
    })
  }

  getCourseDetails() {
    this.orgService.getDatabyOrgId().then((response: any) => {
      // tslint:disable-next-line:no-console
      console.log('Total course >>>>>>>>>>>>>>>>' + response)
    })
  }

}
