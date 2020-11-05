import { Component, OnInit } from '@angular/core'
import { TenantAdminService } from '../../../tenant-admin.service'

@Component({
  selector: 'ws-admin-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  cards: any = [
    {
      key: 'banner',
      title: 'Banner',
    },
    {
      key: 'content_strip',
      title: 'GLC Recommendations',
    },
  ]

  homeJson: any | null = null
  widgets: any = []
  strips: any = []
  loading = true
  constructor(
    private tenantAdminSvc: TenantAdminService,
  ) { }

  async getHomeJson() {
    this.loading = true
    this.homeJson = await this.tenantAdminSvc.fetchJson('/assets/configurations/localhost_3000/page/home.json')
    this.loading = false
  }

  getWidget() {
    const rows = this.homeJson.pageLayout.widgetData.widgets
    const widgets = []
    for (const row of rows) {
      for (const col of row) {
        widgets.push(col.widget)
      }
    }
    return widgets
  }

  getStrip(key: string) {
    const widgets = this.getWidget()
    for (const widget of widgets) {
      if (widget.widgetSubType === 'contentStripMultiple') {
        for (const strip of widget.widgetData.strips) {
          if (strip.key === key) {
            return strip
          }
        }
      }
    }
  }

  getBanner() {
    const widgets = this.getWidget()
    for (const widget of widgets) {
      if (widget.widgetSubType === 'sliderBanners') {
        return widget.widgetData
      }
    }
    return []
  }

  ngOnInit() {
    this.getHomeJson()
  }
}
