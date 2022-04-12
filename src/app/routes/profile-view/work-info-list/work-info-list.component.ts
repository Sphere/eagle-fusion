import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/public-api'
import { IUserProfileDetailsFromRegistry } from '../../../../../project/ws/app/src/lib/routes/user-profile/models/user-profile.model'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'

@Component({
  selector: 'ws-work-info-list',
  templateUrl: './work-info-list.component.html',
  styleUrls: ['./work-info-list.component.scss'],
})
export class WorkInfoListComponent implements OnInit {
  userProfileData!: IUserProfileDetailsFromRegistry
  constructor(private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    private router: Router) { }

  ngOnInit() {
    this.getUserDetails()
  }
  getUserDetails() {
    if (this.configSvc.userProfile) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        (data: any) => {
          if (data) {
            this.userProfileData = data.profileDetails.profileReq
          }
        })
    }
  }
  redirectToWorkInfo(isEdit?: any) {
    if (isEdit) {
      this.router.navigate([`app/workinfo-edit`], {
        queryParams: { isEdit },
      })
    } else {
      this.router.navigate([`app/workinfo-edit`])
    }

  }
}
