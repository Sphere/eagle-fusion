import { Component, OnInit, Input, OnChanges } from '@angular/core'
import { ConfigurationsService } from '@ws-widget/utils'
// import { UserMiniProfileService } from '../../mini-profile/user-mini-profile.service'
// import { NsMiniProfile } from '../../mini-profile/mini-profile.model'

@Component({
  selector: 'ws-widget-user-image',
  templateUrl: './user-image.component.html',
  styleUrls: ['./user-image.component.scss'],
})
export class UserImageComponent implements OnInit, OnChanges {
  @Input() email = ''
  @Input() userId: string | null = null
  @Input() userName = ''
  @Input() imageType: 'initial' | 'rounded' | 'name-initial' = 'initial'
  basePicUrl = `/apis/protected/v8/user/profile/graph/photo/`
  errorOccurred = false
  verifiedMicrosoftEmail = ''
  shortName = ''
  imageUrl: string | null = null
  constructor(private configSvc: ConfigurationsService) { }

  ngOnInit() { }

  ngOnChanges() {
    if (
      this.email &&
      this.configSvc.instanceConfig &&
      this.configSvc.instanceConfig.microsoft &&
      this.configSvc.instanceConfig.microsoft.validEmailExtensions
    ) {
      if (
        this.configSvc.instanceConfig.microsoft.validEmailExtensions.some(extension =>
          this.email.includes(extension),
        )
      ) {
        this.verifiedMicrosoftEmail = this.email
      }
    }
    if (this.userName && this.userName !== '  ') {
      const userNameArr = this.userName.split(' ').slice(0, 2)
      this.shortName = userNameArr
        .map(u => u[0])
        .join('')
        .toUpperCase()
    } else {
      this.imageType = 'initial'
    }
  }
}
