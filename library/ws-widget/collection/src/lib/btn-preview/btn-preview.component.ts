import { Component, Input, OnInit } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'

@Component({
  selector: 'ws-widget-btn-preview',
  templateUrl: './btn-preview.component.html',
  styleUrls: ['./btn-preview.component.scss'],
})
export class BtnPreviewComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<any> {
  @Input() widgetData!: any
  ngOnInit(): void {
  }

}
