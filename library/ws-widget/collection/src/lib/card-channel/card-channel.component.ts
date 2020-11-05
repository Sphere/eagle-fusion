import { Component, OnInit, Input } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { IChannel } from './card-channel.model'
@Component({
  selector: 'ws-widget-card-channel',
  templateUrl: './card-channel.component.html',
  styleUrls: ['./card-channel.component.scss'],
})
export class CardChannelComponent extends WidgetBaseComponent implements OnInit, NsWidgetResolver.IWidgetData<IChannel> {

  @Input() widgetData!: IChannel

  constructor() {
    super()
  }

  ngOnInit() {
  }
}
