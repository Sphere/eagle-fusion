import { Component, OnInit } from '@angular/core'
//import { Router } from '@angular/router'
import { ConfigurationsService, ValueService } from '../../../../../library/ws-widget/utils/src/public-api'
import { IUserProfileDetailsFromRegistry } from '../../../../../project/ws/app/src/lib/routes/user-profile/models/user-profile.model'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { WidgetContentService } from '@ws-widget/collection'
@Component({
  selector: 'ws-work-info-list',
  templateUrl: './work-info-list.component.html',
  styleUrls: ['./work-info-list.component.scss'],
})
export class WorkInfoListComponent implements OnInit {
  userProfileData!: IUserProfileDetailsFromRegistry
  showbackButton = false
  showLogOutIcon = false
  trigerrNavigation = true
  constructor(
    private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    //private router: Router,
    private valueSvc: ValueService,
    private contentSvc: WidgetContentService,
  ) { }

  ngOnInit() {
    this.getUserDetails()
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      if (isXSmall) {
        this.showbackButton = true
        this.showLogOutIcon = false

      } else {
        this.showbackButton = false
        this.showLogOutIcon = false
      }
    })
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
  redirectToWorkInfo(isEdit: any) {

    let ob = {
      "type": "work",
      "edit": isEdit
    }
    console.log(ob)
    sessionStorage.setItem('work', isEdit)
    this.contentSvc.changeWork(ob)
    // this.contentSvc.changeBack('/app/workinfo-list')
    // if (isEdit) {
    //   this.router.navigate([`app/workinfo-edit`], {
    //     queryParams: { isEdit },
    //   })
    // } else {
    //   this.router.navigate([`app/workinfo-edit`])
    // }

  }
}
