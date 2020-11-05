import { Component, OnInit, Input } from '@angular/core'
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser'
import { ConfigurationsService } from '../../../../../utils/src/public-api'

@Component({
  selector: 'ws-widget-btn-twitter-share',
  templateUrl: './btn-twitter-share.component.html',
  styleUrls: ['./btn-twitter-share.component.scss'],
})
export class BtnTwitterShareComponent implements OnInit {
  @Input() url: SafeResourceUrl | null = null
  @Input() message = ''
  isSocialMediaTwitterShareEnabled = false
  constructor(private sanitizer: DomSanitizer, private configSvc: ConfigurationsService) {}

  ngOnInit() {
    if (this.configSvc.restrictedFeatures) {
      this.isSocialMediaTwitterShareEnabled = !this.configSvc.restrictedFeatures.has(
        'socialMediaTwitterShare',
      )
    }
  }

  get sanitizeTwitterUrl() {
    // &text=${this.message}%0A
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      // tslint:disable-next-line: max-line-length
      `https://platform.twitter.com/widgets/tweet_button.c63890edc4243ee77048d507b181eeec.en.html#dnt=false&id=twitter-widget-2&lang=en&original_referer=${this.url}&size=l&type=share&url=${this.url}`,
    )
  }
}
