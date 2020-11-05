import { Component, OnInit } from '@angular/core'
import { ConfigurationsService } from '@ws-widget/utils/src/public-api'

@Component({
  selector: 'ws-app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss'],
})
export class ProfileSettingsComponent implements OnInit {
  hiddenFeatures: string[] = []
  showAchievementsTab = false
  constructor(private configSvc: ConfigurationsService) { }

  ngOnInit() {
    if (this.configSvc.profileSettings) {
      this.hiddenFeatures = this.configSvc.profileSettings
    }
  }

  updateStatus(feature: string) {
    if (this.hiddenFeatures.includes(feature)) {
      this.hiddenFeatures = this.hiddenFeatures.filter(obj => obj !== feature)
    } else {
      this.hiddenFeatures.push(feature)
    }
    this.configSvc.prefChangeNotifier.next({ profileSettings: this.hiddenFeatures })
  }

}
