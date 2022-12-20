import { Injectable } from '@angular/core'
import { ConfigurationsService } from '@ws-widget/utils'
@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  userProfileData: any
  constructor(
    public configSvc: ConfigurationsService,
  ) {

  }

  setConfig(profileData: any) {
    const config = {
      userName: (this.configSvc.nodebbUserProfile && this.configSvc.nodebbUserProfile.username) || '',
      profileData: (profileData.professionalDetails),
      hostPath: this.configSvc.hostPath
    }

    localStorage.setItem('competency', JSON.stringify(config))
  }

}
