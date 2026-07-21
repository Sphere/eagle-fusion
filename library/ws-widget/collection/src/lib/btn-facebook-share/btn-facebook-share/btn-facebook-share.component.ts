import { Component, OnInit, Input } from '@angular/core'
import { ConfigurationsService, SafeResourceUrlService } from '../../../../../utils/src/public-api'

@Component({
    standalone: false,
    selector: 'ws-widget-btn-facebook-share',
    templateUrl: './btn-facebook-share.component.html',
    styleUrls: ['./btn-facebook-share.component.scss'],
    
})
export class BtnFacebookShareComponent implements OnInit {
  @Input() url = location.href
  isSocialMediaFacebookShareEnabled = false
  constructor(private safeResourceUrlSvc: SafeResourceUrlService, private configSvc: ConfigurationsService) {}

  ngOnInit() {
    if (this.configSvc.restrictedFeatures) {
      this.isSocialMediaFacebookShareEnabled = !this.configSvc.restrictedFeatures.has(
        'socialMediaFacebookShare',
      )
    }
  }

  get sanitizeFbUrl() {
    return this.safeResourceUrlSvc.trust(
      `https://www.facebook.com/plugins/share_button.php?href=${encodeURIComponent(this.url)}&layout=button&size=large`,
    )
  }
}
