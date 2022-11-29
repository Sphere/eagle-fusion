import { Injectable } from '@angular/core'
import { ConfigurationsService } from '@ws-widget/utils'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  userProfileData: any
  constructor(
    public configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
  ) {

  }

  // getProfileDetails() {
  //   this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
  //     (data: any) => {
  //       console.log(data)
  //       if (data) {
  //         this.userProfileData = data.profileDetails.profileReq
  //       }
  //     }
  //   )
  //   return this.userProfileData
  // }
  setConfig(profileData: any) {


    // console.log(this.configSvc.userProfileV2)
    const config = {
      userName: (this.configSvc.nodebbUserProfile && this.configSvc.nodebbUserProfile.username) || '',
      profileData: (profileData.professionalDetails[0].designation)
    }

    localStorage.setItem('competency', JSON.stringify(config))
  }

}
