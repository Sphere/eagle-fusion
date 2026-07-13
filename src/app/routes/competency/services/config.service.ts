import { Injectable } from '@angular/core'
import { ConfigurationsService, LoggerService } from '@ws-widget/utils'
@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  userProfileData: any
  constructor(
    public configSvc: ConfigurationsService,
    private logger: LoggerService,
  ) {
  }

  setConfig(profileData: any, profileDetails: any) {
    this.logger.log(profileDetails)
    const config = {
      userName: (this.configSvc.nodebbUserProfile && this.configSvc.nodebbUserProfile.username) || '',
      profileData: (profileData.professionalDetails),
      language: (this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails!.preferences && this.configSvc.unMappedUser!.profileDetails!.preferences!.language !== undefined) ? this.configSvc.unMappedUser.profileDetails.preferences.language : location.href.includes('/hi/') ? 'hi' : 'en',
      id: this.configSvc.unMappedUser.id,
      hostPath: this.configSvc.hostPath,
    }

    if (localStorage.getItem('competency')) {
      localStorage.removeItem('competency')
    }
    localStorage.setItem('competency', JSON.stringify(config))
  }

}
