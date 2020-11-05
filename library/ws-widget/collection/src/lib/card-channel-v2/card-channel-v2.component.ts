import { Component, OnInit, OnChanges, Input } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { NsContent } from '../_services/widget-content.model'
// import { widgetData } from '../../../../../../project/ws/app/src/lib/routes/learning-path/dynamic-network/utils/dynamic-network-data'

@Component({
  selector: 'ws-widget-card-channel-v2',
  templateUrl: './card-channel-v2.component.html',
  styleUrls: ['./card-channel-v2.component.scss'],
})
export class CardChannelV2Component
  extends WidgetBaseComponent
  implements OnInit, OnChanges, NsWidgetResolver.IWidgetData<NsContent.IContent> {

  @Input() widgetData!: NsContent.IContent

  constructor() {
    super()
  }

  ngOnInit() {
  }

  ngOnChanges() {
  }
}
