import { Component, Input } from '@angular/core'
import { NsContent } from '@ws-widget/collection'

@Component({
  selector: 'viewer-certification-container',
  templateUrl: './certification.component.html',
  styleUrls: ['./certification.component.scss'],
})
export class CertificationComponent {
  @Input() isFetchingDataComplete = false
  @Input() forPreview = false
  @Input() certificationData: NsContent.IContent | null = null
  constructor() {}
}
