import { Component, OnInit, Input } from '@angular/core'
import { NsContent } from '../../_services/widget-content.model'

@Component({
  selector: 'ws-widget-display-content-type',
  templateUrl: './display-content-type.component.html',
  styleUrls: ['./display-content-type.component.scss'],
})
export class DisplayContentTypeComponent implements OnInit {

  @Input() displayContentType: NsContent.EDisplayContentTypes = NsContent.EDisplayContentTypes.DEFAULT
  displayContentTypeEnum = NsContent.EDisplayContentTypes
  constructor() { }

  ngOnInit() {
  }

}
