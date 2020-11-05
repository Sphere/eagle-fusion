import { Component, OnInit, Input } from '@angular/core'
import { NsContent } from '@ws-widget/collection'

@Component({
  selector: 'ws-app-toc-certification-iap-card',
  templateUrl: './iap-card.component.html',
  styleUrls: ['./iap-card.component.scss'],
})
export class IapCardComponent implements OnInit {
  @Input() content?: NsContent.IContent

  constructor() {}

  ngOnInit() {}
}
