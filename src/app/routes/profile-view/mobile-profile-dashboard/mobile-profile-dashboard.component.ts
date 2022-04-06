import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material'
import { Router } from '@angular/router'
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/public-api'
import { IUserProfileDetailsFromRegistry } from '../../../../../project/ws/app/src/lib/routes/user-profile/models/user-profile.model'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { MobileAboutPopupComponent } from '../../mobile-about-popup/mobile-about-popup.component'
import { ProfileSelectComponent } from '../profile-select/profile-select.component'

@Component({
  selector: 'ws-mobile-profile-dashboard',
  templateUrl: './mobile-profile-dashboard.component.html',
  styleUrls: ['./mobile-profile-dashboard.component.scss']
})
export class MobileProfileDashboardComponent implements OnInit {
  showMobileView: boolean = false
  showAcademicElse = false
  userProfileData!: IUserProfileDetailsFromRegistry
  academicsArray: any[] = []
  certificates: any
  constructor(
    private configSvc: ConfigurationsService,
    private router: Router,
    public dialog: MatDialog,
    private userProfileSvc: UserProfileService,
  ) {

    if (this.configSvc.userProfile) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        (data: any) => {
          if (data) {
            this.userProfileData = data.profileDetails.profileReq
            if (this.userProfileData.academics && Array.isArray(this.userProfileData.academics)) {
              this.academicsArray = this.userProfileData.academics
            }
          }
        })
    }
    this.certificates = [
      {
        "certificateImage": "/fusion-assets/images/certificate1.png",
        "Coursename": "Respectful Maternity Care"
      },
      {
        "certificateImage": "/fusion-assets/images/certificate1.png",
        "Coursename": "Manyata for Mothers "
      }]
  }

  ngOnInit() {
  }

  openAboutDialog() {
    let dialogRef = this.dialog.open(MobileAboutPopupComponent, {
      width: "263px",
      data: this.userProfileData.personalDetails.about
    })

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result)
    })
  }

  openProfileDialog(): void {
    let dialogRef = this.dialog.open(ProfileSelectComponent, {
      width: '600px'
    })
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result)
    })
  }

  eductionEdit() {
    this.router.navigate([`app/education-list`])
  }

  workInfoEdit() {
    this.router.navigate([`app/workinfo-list`])
  }
}
