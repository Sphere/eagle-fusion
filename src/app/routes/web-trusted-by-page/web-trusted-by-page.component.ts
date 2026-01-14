import { Component, Input, OnInit } from '@angular/core'
@Component({
  selector: 'ws-web-trusted-by-page',
  templateUrl: './web-trusted-by-page.component.html',
  styleUrls: ['./web-trusted-by-page.component.scss'],
})
export class WebTrustedByPageComponent implements OnInit {
  @Input() config: any
  constructor() { }

  ngOnInit() {
  }

}
