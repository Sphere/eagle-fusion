import { Component, Input, OnInit } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'

interface ILinearWidgets {
  widgets: NsWidgetResolver.IRenderConfigWithAnyData[]
}
@Component({
  selector: 'ws-widget-layout-linear',
  templateUrl: './layout-linear.component.html',
  styleUrls: ['./layout-linear.component.scss'],
})
export class LayoutLinearComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<ILinearWidgets> {
  @Input() widgetData!: ILinearWidgets

  ngOnInit() {}
}
