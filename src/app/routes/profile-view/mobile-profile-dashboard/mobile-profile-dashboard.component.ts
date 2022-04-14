import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material'
import { Router } from '@angular/router'
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/public-api'
import { WidgetContentService } from '../../../../../library/ws-widget/collection/src/public-api'
import { IUserProfileDetailsFromRegistry } from '../../../../../project/ws/app/src/lib/routes/user-profile/models/user-profile.model'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { MobileAboutPopupComponent } from '../../mobile-about-popup/mobile-about-popup.component'
import { ProfileSelectComponent } from '../profile-select/profile-select.component'
import { forkJoin, from } from 'rxjs'
import * as  _ from 'lodash'
import { DomSanitizer } from '@angular/platform-browser'
import { map, mergeMap } from 'rxjs/operators'

@Component({
  selector: 'ws-mobile-profile-dashboard',
  templateUrl: './mobile-profile-dashboard.component.html',
  styleUrls: ['./mobile-profile-dashboard.component.scss'],
})
export class MobileProfileDashboardComponent implements OnInit {
  showMobileView = false
  showAcademicElse = false
  userProfileData!: IUserProfileDetailsFromRegistry
  academicsArray: any[] = []
  certificates: any = []
  imgURI: any = []
  certificateThumbnail: any = []
  photoUrl: any
  image = '/fusion-assets/icons/prof1.png'
  loader = true
  constructor(
    private configSvc: ConfigurationsService,
    private router: Router,
    public dialog: MatDialog,
    private userProfileSvc: UserProfileService,
    private contentSvc: WidgetContentService,
    private domSanitizer: DomSanitizer,
  ) {
  }

  ngOnInit() {
    this.userProfileSvc.updateuser$.pipe().subscribe(item => {
      if (item) {
        this.getUserDetails()
      }
    })
    forkJoin([this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id),
    this.contentSvc.fetchUserBatchList(this.configSvc.unMappedUser.id)]).pipe().subscribe((res: any) => {
      this.loader = false
      this.setAcademicDetail(res[0])
      this.processCertiFicate(res[1])
    })
  }

  processCertiFicate(data: any) {

    const certificateIdArray = _.map(_.flatten(_.filter(_.map(data, 'issuedCertificates'), certificate => {
      return certificate.length > 0
    })),                             'identifier')
    this.formateRequest(data)
    from(certificateIdArray).pipe(
      map(certId => {
        this.certificateThumbnail.push({ identifier: certId })
        return certId
      }),
      mergeMap(certId =>
        this.contentSvc.getCertificateAPI(certId)
      )
    ).subscribe(() => {
      setTimeout(() => {
        this.contentSvc.updateValue$.subscribe((res: any) => {
          if (res) {
            _.forEach(this.certificates, cvalue => {
              if (res[cvalue.identifier]) {
                cvalue['image'] = this.domSanitizer.bypassSecurityTrustUrl(res[cvalue.identifier])
              }
            })
          }
        })
      },         500)
    })

  }

  formateRequest(data: any) {
    const issuedCertificates = _.reduce(_.flatten(_.filter(_.map(data, 'issuedCertificates'), certificate => {
      return certificate.length > 0
    })),                                (result: any, value) => {
      result.push({
        identifier: value.identifier,
        name: value.name,
      })
      return result
    },                                  [])
    this.certificates = issuedCertificates
  }
  // convertToJpeg(imgVal: any, callback: any) {
  //   const img = new Image()
  //   let url = imgVal.result.printUri

  //   img.onload = function () {
  //     const canvas: any = document.getElementById('certCanvas') || {}
  //     const ctx = canvas.getContext('2d')
  //     const imgWidth = img.width
  //     const imgHeight = img.height
  //     canvas.width = imgWidth
  //     canvas.height = imgHeight
  //     ctx.drawImage(img, 0, 0, imgWidth, imgHeight)
  //     let imgURI = canvas
  //       .toDataURL('image/jpeg')

  //     imgURI = decodeURIComponent(imgURI.replace('data:image/jpeg,', ''))
  //     callback(imgURI)
  //   }
  //   img.src = url
  // }

  openAboutDialog() {
    const dialogRef = this.dialog.open(MobileAboutPopupComponent, {
      width: '450px',
      data: this.userProfileData.personalDetails.about ? this.userProfileData.personalDetails.about : '',
    })

    dialogRef.afterClosed().subscribe(result => {
      // tslint:disable-next-line: no-console
      console.log('The dialog was closed', result)
    })
  }
  setAcademicDetail(data: any) {
    if (data) {
      this.userProfileData = data.profileDetails.profileReq
      if (this.userProfileData.academics && Array.isArray(this.userProfileData.academics)) {
        this.academicsArray = this.userProfileData.academics
      }
    }
  }
  getUserDetails() {
    if (this.configSvc.userProfile) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        (data: any) => {
          if (data) {
            this.loader = false
            this.userProfileData = data.profileDetails.profileReq
            if (this.userProfileData.academics && Array.isArray(this.userProfileData.academics)) {
              this.academicsArray = this.userProfileData.academics
            }
            if (this.userProfileData.personalDetails.photo) {
              this.photoUrl = this.userProfileData.personalDetails.photo
            }
          }
        })
    }
  }

  openProfileDialog(): void {
    const dialogRef = this.dialog.open(ProfileSelectComponent, {
      width: '600px',
    })
    dialogRef.afterClosed().subscribe(result => {
      // tslint:disable-next-line: no-console
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
