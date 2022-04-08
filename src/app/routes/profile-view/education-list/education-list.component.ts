import { Component, OnInit } from '@angular/core'
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/public-api'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import * as _ from 'lodash'
@Component({
  selector: 'ws-education-list',
  templateUrl: './education-list.component.html',
  styleUrls: ['./education-list.component.scss'],
})
export class EducationListComponent implements OnInit {
  academicsArray: any[] = []
  constructor(private configSvc: ConfigurationsService,
              private userProfileSvc: UserProfileService) {

  }

  ngOnInit() {
    if (this.configSvc.userProfile) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        (data: any) => {
          if (data && _.get(data, 'profileDetails.profileReq.academics')) {
            this.academicsArray = _.get(data, 'profileDetails.profileReq.academics')
          }
        })
    }
  }

}