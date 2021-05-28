import { Component, Input, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { BtnPageBackService } from './btn-page-back.service'
type TUrl = undefined | 'none' | 'back' | string
@Component({
  selector: 'ws-widget-btn-page-back',
  templateUrl: './btn-page-back.component.html',
  styleUrls: ['./btn-page-back.component.scss'],
})
export class BtnPageBackComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<{ url: TUrl }> {
  @Input() widgetData: { url: TUrl, titles?: NsWidgetResolver.ITitle[], queryParams?: any } = { url: 'none', titles: [] }
  @Input() playerScreen: any
  presentUrl = ''
  showBackIcon = false
  constructor(
    private btnBackSvc: BtnPageBackService,
    private router: Router,
  ) {
    super()
  }

  ngOnInit() {
    this.presentUrl = this.router.url
    if (this.widgetData && this.widgetData.url) {
      if (this.widgetData.url.indexOf('overview') > -1) {
        this.showBackIcon = true
      }
    }

  }

  get backUrl(): { fragment?: string; routeUrl: string; queryParams: any } {

    if (this.presentUrl === '/page/explore') {
      return {
        queryParams: undefined,
        routeUrl: '/page/home',
      }
    }
    if (this.widgetData.url === 'home') {
      return {
        queryParams: undefined,
        routeUrl: '/page/home',
      }
    }

    if (this.widgetData.url === 'doubleBack') {
      return {
        fragment: this.btnBackSvc.getLastUrl(2).fragment,
        queryParams: this.btnBackSvc.getLastUrl(2).queryParams,
        routeUrl: this.btnBackSvc.getLastUrl(2).route,
      }
    } if (this.widgetData.url === 'back') {
      return {
        fragment: this.btnBackSvc.getLastUrl().fragment,
        queryParams: this.btnBackSvc.getLastUrl().queryParams,
        routeUrl: this.btnBackSvc.getLastUrl().route,
      }
    }
    if (this.widgetData.url !== 'back' && this.widgetData.url !== 'doubleBack') {

      this.btnBackSvc.checkUrl(this.widgetData.url)

    }

    return {
      queryParams: undefined,
      routeUrl: this.widgetData.url ? this.widgetData.url : '/app/home',
    }
  }

}
