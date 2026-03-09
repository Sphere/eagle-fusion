import { Injectable } from '@angular/core'
import { ConfigurationsService, LoggerService } from '@ws-widget/utils'
import { LanguageService } from '../../../services/language.service'
@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  userProfileData: any
  constructor(public configSvc: ConfigurationsService,
    private logger: LoggerService,
    private langSvc: LanguageService
  ) { }

  setConfig(profileData: any, profileDetails: any) {
    this.logger.log(profileDetails)
    const config = {
      userName:
        (this.configSvc.nodebbUserProfile && this.configSvc.nodebbUserProfile.username) || '',
      profileData: profileData.professionalDetails,
      language:
        this.configSvc?.unMappedUser?.profileDetails?.preferences?.language !== undefined
          ? this.configSvc.unMappedUser.profileDetails.preferences.language
          : this.langSvc.getCurrentLanguage(),
      id: this.configSvc.unMappedUser.id,
      hostPath: this.configSvc.hostPath,
      isMobileApp: false,
    }

    if (localStorage.getItem('competency')) {
      localStorage.removeItem('competency')
    }
    localStorage.setItem('competency', JSON.stringify(config))
  }
}
