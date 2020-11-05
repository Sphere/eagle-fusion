import { Component, Input } from '@angular/core'
import { NsContent } from '@ws-widget/collection'

@Component({
  selector: 'viewer-rdbms-hands-on-container',
  templateUrl: './rdbms-hands-on.component.html',
  styleUrls: ['./rdbms-hands-on.component.scss'],
})
export class RdbmsHandsOnComponent {
  @Input() isFetchingDataComplete = false
  @Input() isErrorOccured = false
  @Input() rDbmsHandsOnData: NsContent.IContent | null = null
  @Input() rDbmsHandsOnManifest: any
  @Input() forPreview = false

  constructor() {}
}
