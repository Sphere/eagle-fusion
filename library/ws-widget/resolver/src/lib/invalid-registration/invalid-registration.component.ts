import { Component, OnInit, Input } from '@angular/core'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { WidgetBaseComponent } from '../widget-base.component'
@Component({
  selector: 'ws-resolver-invalid-registration',
  templateUrl: './invalid-registration.component.html',
  styleUrls: ['./invalid-registration.component.scss'],
})
export class InvalidRegistrationComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<any> {
  @Input() widgetData!: any
  showData = true
  ngOnInit() {}
}
