import { Component, OnInit, Input } from '@angular/core'

import { TCertificationRequestType } from '../../../../../app-toc/routes/app-toc-certification/models/certification.model'

@Component({
  selector: 'ws-app-request-item-type',
  templateUrl: './request-item-type.component.html',
  styleUrls: ['./request-item-type.component.scss'],
})
export class RequestItemTypeComponent implements OnInit {
  @Input() itemType!: TCertificationRequestType

  constructor() {}

  ngOnInit() {}
}
