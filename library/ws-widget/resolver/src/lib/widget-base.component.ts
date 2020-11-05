import { AfterViewInit, Component, HostBinding, Input } from '@angular/core'
import { SafeStyle } from '@angular/platform-browser'
import { NsWidgetResolver } from './widget-resolver.model'
type TWidgetBase = Omit<NsWidgetResolver.IWidgetData<any>, 'widgetData'>

@Component({
  selector: 'ws-resolver-base',
  template: 'Base Component',
})
export class WidgetBaseComponent implements TWidgetBase, AfterViewInit {
  @Input() widgetType = ''
  @Input() widgetSubType = ''
  @Input() widgetHostClass?: string

  @Input()
  @HostBinding('id')
  public widgetInstanceId?: string

  @Input()
  @HostBinding('style')
  public widgetSafeStyle?: SafeStyle

  @Input()
  @HostBinding('class') className?: string

  updateBaseComponent(
    widgetType: string,
    widgetSubType: string,
    widgetInstanceId?: string,
    widgetHostClass?: string,
    widgetSafeStyle?: SafeStyle,
  ) {
    this.widgetType = widgetType
    this.widgetSubType = widgetSubType
    this.widgetInstanceId = widgetInstanceId
    this.widgetHostClass = widgetHostClass
    this.widgetSafeStyle = widgetSafeStyle
    if (this.widgetHostClass) {
      this.className = `${this.className} ${this.widgetHostClass}`
    }
  }

  ngAfterViewInit() {
    const hash: any = window.location.hash ? window.location.hash.split('#')[1] : ''
    if (hash && !isNaN(hash) && hash === this.widgetInstanceId) {
      setTimeout(
        () => {
          const element = document.getElementById(this.widgetInstanceId || '')
          if (element) {
            element.scrollIntoView()
          }
        },
        200,
      )
    }
  }
}
