import { Component, OnInit, Input } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { IIntranetSelector } from './intranet-selector.model'
import { IntranetSelectorService } from './intranet-selector.service'

@Component({
  selector: 'ws-widget-intranet-selector',
  templateUrl: './intranet-selector.component.html',
  styleUrls: ['./intranet-selector.component.scss'],
})
export class IntranetSelectorComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<IIntranetSelector | null> {
  @Input() widgetData: IIntranetSelector | null = null
  public activeWidget: NsWidgetResolver.IRenderConfigWithAnyData | null = null
  constructor(private intranetSelectorSvc: IntranetSelectorService) {
    super()
  }

  ngOnInit() {
    if (this.widgetData) {
      this.intranetSelectorSvc
        .isLoading()
        .then(() => {
          if (this.widgetData && this.widgetData.isIntranet) {
            this.activeWidget = this.widgetData.isIntranet.widget
          } else {
            this.activeWidget = null
          }
        })
        .catch(() => {
          if (this.widgetData && this.widgetData.isNotIntranet) {
            this.activeWidget = this.widgetData.isNotIntranet.widget
          } else {
            this.activeWidget = null
          }
        })
    } else {
      this.activeWidget = null
    }
  }
}
