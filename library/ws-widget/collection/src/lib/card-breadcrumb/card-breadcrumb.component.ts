import { Component, OnInit, Input } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { IWidgetCardBreadcrumb, IBreadcrumbPath } from './card-breadcrumb.model'
import { EventService } from '@ws-widget/utils'

@Component({
  selector: 'ws-widget-card-breadcrumb',
  templateUrl: './card-breadcrumb.component.html',
  styleUrls: ['./card-breadcrumb.component.scss'],
})
export class CardBreadcrumbComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<IWidgetCardBreadcrumb> {
  @Input() widgetData!: IWidgetCardBreadcrumb

  constructor(private events: EventService) {
    super()
  }
  ngOnInit() { }

  encodeUrl(clickUrl: string) {
    if (clickUrl) {
      if (clickUrl.includes('>')) {
        const parentPath = clickUrl.split('>').slice(0, -1).join('>')
        const childPath = clickUrl.split('>').slice(-1)[0]
        const newUrl = `${parentPath}>${encodeURIComponent(childPath)}`
        return newUrl
      }
      return clickUrl
    }
    return null
  }

  raiseTelemetry(clickedItem: IBreadcrumbPath) {
    this.events.raiseInteractTelemetry(
      'click',
      'breadcrumb',
      {
        clickedItem,
        path: this.widgetData.path,
      },
    )
  }
}
