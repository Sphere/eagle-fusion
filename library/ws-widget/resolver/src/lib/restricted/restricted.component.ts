import { Component, Input } from '@angular/core'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { WidgetBaseComponent } from '../widget-base.component'
@Component({
  standalone: false,
  selector: 'ws-resolver-restricted',
  templateUrl: './restricted.component.html',
  styleUrls: ['./restricted.component.scss'],

})
export class RestrictedComponent extends WidgetBaseComponent
  implements NsWidgetResolver.IWidgetData<any> {
  @Input() widgetData!: any
  showData = true

}
