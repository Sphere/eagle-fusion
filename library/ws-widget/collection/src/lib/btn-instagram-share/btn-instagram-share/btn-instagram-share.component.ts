import { Component, OnInit, Input } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
import { ConfigurationsService } from '../../../../../utils/src/public-api'

@Component({
  selector: 'ws-widget-btn-instagram-share',
  templateUrl: './btn-instagram-share.component.html',
  styleUrls: ['./btn-instagram-share.component.scss'],
})
export class BtnInstagramShareComponent implements OnInit {
  @Input() url = location.href
  isSocialMediaInstagramShareEnabled = false
  constructor(private sanitizer: DomSanitizer, private cofigSvc: ConfigurationsService) { }

  ngOnInit() {
    if (this.cofigSvc.restrictedFeatures) {
      this.isSocialMediaInstagramShareEnabled = !this.cofigSvc.restrictedFeatures.has(
        'socialMediaInstagramShare'
      )
    }
  }
  get sanitizeInstaUrl() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.facebook.com/plugins/share_button.php?href=${this.url}&layout=button&size=large`,
    )
  }

}
