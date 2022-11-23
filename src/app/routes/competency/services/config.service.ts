import { Injectable } from '@angular/core'
import { ConfigurationsService } from '@ws-widget/utils'
@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor(
    public configSvc: ConfigurationsService
  ) {

  }
  setConfig() {
    const config = {
      userName: (this.configSvc.nodebbUserProfile && this.configSvc.nodebbUserProfile.username) || '',
    }
    localStorage.setItem('competency', JSON.stringify(config))
  }

}
