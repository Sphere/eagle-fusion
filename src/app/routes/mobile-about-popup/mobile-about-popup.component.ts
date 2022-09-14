import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material'
import * as _ from 'lodash'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { UserProfileService } from '../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { constructReq } from '../profile-view/request-util'

@Component({
  selector: 'ws-mobile-about-popup',
  templateUrl: './mobile-about-popup.component.html',
  styleUrls: ['./mobile-about-popup.component.scss'],
})
export class MobileAboutPopupComponent implements OnInit {
  aboutForm: FormGroup
  userProfileData!: any
  userID = ''
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>

  constructor(public dialogRef: MatDialogRef<MobileAboutPopupComponent>,
              private configSvc: ConfigurationsService,
              private userProfileSvc: UserProfileService,
              private matSnackBar: MatSnackBar,
              @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.aboutForm = new FormGroup({
      about: new FormControl('', [Validators.required, Validators.maxLength(500)]),
    })
  }
  ngOnInit() {
    this.getUserDetails()
    this.updateForm()
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
  updateForm() {
    this.aboutForm.patchValue({
      about: this.data,
    })
  }

  onSubmit(form: any) {
    if (this.configSvc.userProfile) {
      this.userID = this.configSvc.userProfile.userId || ''
    }
    const profileRequest = constructReq(form, this.userProfileData)
    const reqUpdate = {
      request: {
        userId: this.userID,
        profileDetails: profileRequest,
      },
    }
    this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(
      (res: any) => {
        if (res) {
          this.openSnackBar(this.toastSuccess.nativeElement.value)
          this.userProfileSvc._updateuser.next('true')
          this.dialogRef.close()
        }
      })
  }

  private openSnackBar(message: string) {
    this.matSnackBar.open(message)
  }

  closeClick() {
    this.dialogRef.close()
  }
}
