import { Component, OnInit, Input } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { ISelectorResponsive } from './selector-responsive.model'
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout'
import { debounceTime, map, distinctUntilChanged } from 'rxjs/operators'
@Component({
  selector: 'ws-widget-selector-responsive',
  templateUrl: './selector-responsive.component.html',
  styleUrls: ['./selector-responsive.component.scss'],
})
export class SelectorResponsiveComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<ISelectorResponsive | null> {
  @Input() widgetData: ISelectorResponsive | null = null

  activeWidget: NsWidgetResolver.IRenderConfigWithAnyData | null = null

  constructor(private breakpointObserver: BreakpointObserver) {
    super()
  }

  ngOnInit() {
    if (this.widgetData) {
      const mediaQueries = this.widgetData.selectFrom
        .map(u => {
          let str = ''
          if (u.minWidth) {
            str += `(min-width:${u.minWidth}px)`
          }
          if (u.minWidth && u.maxWidth) {
            str += ' and '
          }
          if (u.maxWidth) {
            str += `(max-width:${u.maxWidth}px)`
          }
          return str
        })
        .filter(u => Boolean(u))
      this.breakpointObserver
        .observe(mediaQueries)
        .pipe(
          debounceTime(250),
          map((res: BreakpointState): number => {
            if (res.matches) {
              const index = mediaQueries.findIndex(query => res.breakpoints[query])
              if (index > -1 && this.widgetData) {
                return index
              }
            }
            return -1
          }),
          distinctUntilChanged(),
        )
        .subscribe((index: number) => {
          if (this.widgetData && index >= 0 && index < this.widgetData.selectFrom.length) {
            this.activeWidget = this.widgetData.selectFrom[index].widget
            return
          }
          this.activeWidget = null
        })
    }
  }
}
