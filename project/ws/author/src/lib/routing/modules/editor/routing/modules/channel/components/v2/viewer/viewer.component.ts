import { Component, OnInit, Input } from '@angular/core'
import { ChannelStoreService } from '../../../services/store.service'
import { ChannelResolverService } from '../../../services/resolver.service'
import { NsWidgetResolver } from '@ws-widget/resolver/src/public-api'
import { isNotEmptyWidget } from './viewer.function'

@Component({
  selector: 'ws-auth-viewer-v2',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
})
export class ViewerComponent implements OnInit {
  @Input() id = ''
  @Input() isSubmitPressed = false
  widgetData!: NsWidgetResolver.IRenderConfigWithAnyData
  emptyWidget = false
  isDataPresent = false
  constructor(
    private store: ChannelStoreService,
    private channelResolver: ChannelResolverService,
  ) { }

  ngOnInit() {
    this.initiate()
    this.store.update.subscribe((id: string) => {
      if (id === this.id) {
        this.initiate()
      }
    })
  }

  initiate() {
    this.widgetData = this.channelResolver.renderToJSON(this.store.getUpdatedJSON(), this.id)
    this.emptyWidget = !this.widgetData.widgetSubType ? true : false
    try {
      this.isDataPresent = isNotEmptyWidget(this.widgetData)
    } catch {
      this.isDataPresent = false
    }
  }

}
