import { Component, OnInit, Input } from '@angular/core'
import { NsContent } from '../../_services/widget-content.model'

@Component({
  selector: 'ws-widget-display-content-type-icon',
  templateUrl: './display-content-type-icon.component.html',
  styleUrls: ['./display-content-type-icon.component.scss'],
})
export class DisplayContentTypeIconComponent implements OnInit {

  @Input() displayContentType: NsContent.EDisplayContentTypes = NsContent.EDisplayContentTypes.DEFAULT
  displayContentTypeEnum = NsContent.EDisplayContentTypes
  constructor() { }

  ngOnInit() {
  }

}
