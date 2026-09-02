import { Component, OnInit, Input } from '@angular/core'
import { SafeResourceUrl } from '@angular/platform-browser'
import { ConfigurationsService } from '../../../../../utils/src/public-api'

@Component({
    standalone: false,
    selector: 'ws-widget-btn-whatsapp-share',
    templateUrl: './btn-whatsapp-share.component.html',
    styleUrls: ['./btn-whatsapp-share.component.scss'],
    
})
export class BtnWhatsappShareComponent implements OnInit {
  @Input() url: SafeResourceUrl | null = null

  isSocialMediaWhatsappShareEnabled = false
  constructor(private readonly cofigSvc: ConfigurationsService) { }

  ngOnInit() {
    if (this.cofigSvc.restrictedFeatures) {
      this.isSocialMediaWhatsappShareEnabled = !this.cofigSvc.restrictedFeatures.has(
        'socialMediaWhatsappShare'
      )
    }
  }
}
