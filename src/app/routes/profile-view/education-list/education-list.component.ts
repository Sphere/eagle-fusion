import { Component, OnInit } from '@angular/core'
import { ConfigurationsService, ValueService } from '../../../../../library/ws-widget/utils/src/public-api'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { get } from 'lodash'
import { Router } from '@angular/router'

@Component({
  selector: 'ws-education-list',
  templateUrl: './education-list.component.html',
  styleUrls: ['./education-list.component.scss'],
})
export class EducationListComponent implements OnInit {
  academicsArray: any[] = []
  showbackButton = false
  showLogOutIcon = false
  trigerrNavigation = true
  constructor(private configSvc: ConfigurationsService,
              private userProfileSvc: UserProfileService,
              private router: Router,
              private valueSvc: ValueService) {

  }

  ngOnInit() {
    if (this.configSvc.userProfile) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        (data: any) => {
          if (data && get(data, 'profileDetails.profileReq.academics')) {
            this.academicsArray = get(data, 'profileDetails.profileReq.academics')
          }
        })
    }

    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      if (isXSmall) {
        this.showbackButton = true
        this.showLogOutIcon = true

      } else {
        this.showbackButton = true
        this.showLogOutIcon = false
      }
    })
  }
  redirectTo(isEdit?: any, academic?: any) {
    if (isEdit) {
      this.router.navigate([`app/education-edit`], { queryParams: { ...academic }, skipLocationChange: true })
    } else {
      this.router.navigate([`app/education-edit`])
    }

  }
}
