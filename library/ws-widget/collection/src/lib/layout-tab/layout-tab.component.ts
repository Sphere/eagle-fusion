import { Component, Input, OnInit, OnDestroy } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { NsWidgetLayoutTab } from './layout-tab.model'
import { Subscription } from 'rxjs'
import { ActivatedRoute, Router, ParamMap } from '@angular/router'
@Component({
  selector: 'ws-widget-layout-tab',
  templateUrl: './layout-tab.component.html',
  styleUrls: ['./layout-tab.component.scss'],
})
export class LayoutTabComponent extends WidgetBaseComponent
  implements OnInit, OnDestroy, NsWidgetResolver.IWidgetData<NsWidgetLayoutTab.ILayout> {
  @Input() widgetData!: NsWidgetLayoutTab.ILayout

  activeIndex = 0
  paramsSubscription: Subscription | null = null
  constructor(private route: ActivatedRoute, private router: Router) {
    super()
  }

  ngOnInit() {
    this.paramsSubscription = this.route.queryParamMap.subscribe((qParamMap: ParamMap) => {
      const key = qParamMap.get('tab')
      if (key && this.widgetData) {
        const index = this.widgetData.tabs
          .map(tab => tab.tabKey)
          .findIndex((tabKey: string) => tabKey === key)
        this.activeIndex = index > -1 ? index : 0
      }
    })
  }

  onIndexChange(index: number) {
    if (this.widgetData && this.widgetData.tabs && index < this.widgetData.tabs.length) {
      this.router.navigate([], { queryParams: { tab: this.widgetData.tabs[index].tabKey } })
    }
  }

  ngOnDestroy() {
    if (this.paramsSubscription) {
      this.paramsSubscription.unsubscribe()
    }
  }
}
