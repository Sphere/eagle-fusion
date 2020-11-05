import { Component, OnInit, Input } from '@angular/core'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { WidgetBaseComponent } from '../widget-base.component'
@Component({
  selector: 'ws-resolver-restricted',
  templateUrl: './restricted.component.html',
  styleUrls: ['./restricted.component.scss'],
})
export class RestrictedComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<any> {
  @Input() widgetData!: any
  showData = true

  ngOnInit() {}
}
