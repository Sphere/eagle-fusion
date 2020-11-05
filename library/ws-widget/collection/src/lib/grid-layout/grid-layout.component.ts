import { Component, OnInit, Input } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import {
  IGridLayoutData,
  IGridLayoutProcessedData,
  responsiveSuffix,
  sizeSuffix,
  IGridLayoutDataMain,
} from './grid-layout.model'
@Component({
  selector: 'ws-widget-grid-layout',
  templateUrl: './grid-layout.component.html',
  styleUrls: ['./grid-layout.component.scss'],
})
export class GridLayoutComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<IGridLayoutDataMain> {
  @Input() widgetData!: IGridLayoutDataMain
  containerClass = ''
  processed: IGridLayoutProcessedData[][] = []
  loginPage = false

  ngOnInit() {
    const url = window.location.href
    if (url.indexOf('login') > 0) {
      this.loginPage = true
    }
    if (this.widgetData.gutter != null) {
      this.containerClass = `-mx-${this.widgetData.gutter}`
    }
    const gutterAdjustment = this.widgetData.gutter !== null ? `p-${this.widgetData.gutter}` : ''
    this.processed = this.widgetData.widgets.map(row =>
      row.map(
        (col: IGridLayoutData): IGridLayoutProcessedData => ({
          className: Object.entries(col.dimensions).reduce(
            (agg, [k, v]) =>
              `${agg} ${(responsiveSuffix as { [id: string]: string })[k]}:${sizeSuffix[v]}`,
            `${col.className} w-full ${gutterAdjustment}`,
          ),
          styles: col.styles,
          widget: col.widget,
        }),
      ),
    )
  }
}
