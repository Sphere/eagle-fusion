import { Component, Input } from '@angular/core'
import { NsContent } from '@ws-widget/collection'

@Component({
  selector: 'viewer-html-picker-container',
  templateUrl: './html-picker.component.html',
  styleUrls: ['./html-picker.component.scss'],
})
export class HtmlPickerComponent {
  @Input() isFetchingDataComplete = false
  @Input() isErrorOccured = false
  @Input() htmlPickerData: NsContent.IContent | null = null
  @Input() htmlPickerManifest: any
  @Input() forPreview = false

  constructor() {}
}
