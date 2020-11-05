import { Component, OnInit, Input } from '@angular/core'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { WidgetBaseComponent } from '../widget-base.component'
@Component({
  selector: 'ws-resolver-unresolved',
  templateUrl: './unresolved.component.html',
  styleUrls: ['./unresolved.component.scss'],
})
export class UnresolvedComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<any> {
  @Input() widgetData!: any
  showData = true
  previewMode = false
  searchArray = ['preview', 'channel']

  ngOnInit() {
    const url = window.location.href
    this.previewMode = this.searchArray.some((word: string) => {
      return url.indexOf(word) > -1
    })
  }
}
