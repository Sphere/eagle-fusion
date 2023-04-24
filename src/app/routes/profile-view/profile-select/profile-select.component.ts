import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import {
  // MatDialog,
  MatDialogRef, MatSnackBar,
} from '@angular/material'
import { IMAGE_MAX_SIZE, IMAGE_SUPPORT_TYPES } from '@ws/author/src/lib/constants/upload'
// import { ImageCropComponent } from '@ws-widget/utils/src/public-api'
// import { LoaderService } from '../../../../../project/ws/author/src/public-api'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { FormControl, FormGroup } from '@angular/forms'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/public-api'
import { constructReq } from '../request-util'

@Component({
  selector: 'ws-profile-select',
  templateUrl: './profile-select.component.html',
  styleUrls: ['./profile-select.component.scss'],
})
export class ProfileSelectComponent implements OnInit {
  imageTypes = IMAGE_SUPPORT_TYPES
  photoUrl!: string | ArrayBuffer | null
  createUserForm: FormGroup
  userProfileData!: any
  userID: any
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>

  imgJson = [
    { url: '../../../../fusion-assets/images/Group 205.png' },
    { url: '../../../../fusion-assets/images/Group 206.png' },
    { url: '../../../../fusion-assets/images/Group 211.png' },
    { url: '../../../../fusion-assets/images/Group 212.png' },
    { url: '../../../../fusion-assets/images/Group 213.png' },
  ]

  constructor(public dialogRef: MatDialogRef<ProfileSelectComponent>,
              private snackBar: MatSnackBar,
              private userProfileSvc: UserProfileService,
              private configSvc: ConfigurationsService,
    // private dialog: MatDialog,
    // private loader: LoaderService,
  ) {
    this.createUserForm = new FormGroup({
      photo: new FormControl('', []),
    })
  }

  ngOnInit() {
    this.getUserDetails()
  }

  closeDialog() {
    this.dialogRef.close()
  }

  uploadProfileImg(file: File) {
    // const formdata = new FormData()
    const fileName = file.name.replace(/[^A-Za-z0-9.]/g, '')
    if (
      !(
        IMAGE_SUPPORT_TYPES.indexOf(
          `.${fileName
            .toLowerCase()
            .split('.')
            .pop()}`,
        ) > -1
      )
    ) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.INVALID_FORMAT,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
      return
    }

    if (file.size > IMAGE_MAX_SIZE) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.SIZE_ERROR,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
      return
    }

    // const dialogRef = this.dialog.open(ImageCropComponent, {
    //   width: '70%',
    //   data: {
    //     isRoundCrop: true,
    //     imageFile: file,
    //     width: 265,
    //     height: 150,
    //     isThumbnail: true,
    //     imageFileName: fileName,
    //   },
    // })

    // dialogRef.afterClosed().subscribe({
    //   next: (result: File) => {
    //     if (result) {
    //       formdata.append('content', result, fileName)
    //       this.loader.changeLoad.next(true)
    //       const reader = new FileReader()
    //       reader.readAsDataURL(result)
    //       reader.onload = _event => {
    //         this.photoUrl = reader.result
    //         this.createUserForm.controls['photo'].setValue(this.photoUrl)
    //         this.onSubmit(this.createUserForm)
    //       }
    //     }
    //   },
    // })
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

  selectProfile(img: any) {
    this.createUserForm.controls['photo'].setValue(img)
    this.onSubmit(this.createUserForm)
  }

  onSubmit(form: any) {
    if (this.configSvc.userProfile) {
      this.userID = this.configSvc.userProfile.userId || ''
    }
    const profileRequest = constructReq(form.value, this.userProfileData)
    const reqUpdate = {
      request: {
        userId: this.userID,
        profileDetails: profileRequest,
      },
    }
    this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(
      (res: any) => {
        if (res) {
          this.userProfileSvc._updateuser.next('true')
          this.dialogRef.close()
        }
      })
  }
}
