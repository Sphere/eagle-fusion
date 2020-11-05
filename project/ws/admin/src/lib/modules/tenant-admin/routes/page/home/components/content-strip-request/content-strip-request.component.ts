import { Component, OnInit, Input } from '@angular/core'
import { NsContentStripRequest } from '../../models/content-strip-request.model'

@Component({
  selector: 'ws-admin-content-strip-request',
  templateUrl: './content-strip-request.component.html',
  styleUrls: ['./content-strip-request.component.scss'],
})
export class ContentStripRequestComponent implements OnInit {

  @Input() stripData!: any
  contentStripRequestType = NsContentStripRequest.EContentStripRequestTypes
  type: NsContentStripRequest.EContentStripRequestTypes =
    NsContentStripRequest.EContentStripRequestTypes.SEARCH_REQUEST

  constructor() { }

  createRequest(event: any) {
    this.stripData.request = JSON.parse(JSON.stringify(event))
  }

  preSelectedRequestIds() {
    if (this.stripData && this.stripData.request && this.stripData.request.ids) {
      return this.stripData.request.ids
    }
    return []
  }

  ngOnInit() {
  }
}
