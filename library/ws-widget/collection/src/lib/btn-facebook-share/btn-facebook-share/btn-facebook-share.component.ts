import { Component, OnInit, Input } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
import { ConfigurationsService } from '../../../../../utils/src/public-api'

@Component({
  selector: 'ws-widget-btn-facebook-share',
  templateUrl: './btn-facebook-share.component.html',
  styleUrls: ['./btn-facebook-share.component.scss'],
})
export class BtnFacebookShareComponent implements OnInit {
  @Input() url = location.href
  isSocialMediaFacebookShareEnabled = false
  constructor(private sanitizer: DomSanitizer, private configSvc: ConfigurationsService) {}

  ngOnInit() {
    if (this.configSvc.restrictedFeatures) {
      this.isSocialMediaFacebookShareEnabled = !this.configSvc.restrictedFeatures.has(
        'socialMediaFacebookShare',
      )
    }
  }

  get sanitizeFbUrl() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.facebook.com/plugins/share_button.php?href=${this.url}&layout=button&size=large`,
    )
  }
}
