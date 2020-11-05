import { Component, Input, OnInit } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'

@Component({
  selector: 'ws-widget-player-web-pages',
  templateUrl: './player-web-pages.component.html',
  styleUrls: ['./player-web-pages.component.scss'],
})
export class PlayerWebPagesComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<any> {
  @Input() widgetData!: any

  ngOnInit() {}
}
