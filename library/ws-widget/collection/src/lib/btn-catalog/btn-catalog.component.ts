import { Component, Input } from '@angular/core'
import { TreeCatalogService } from '../tree-catalog/tree-catalog.service'
import { TFetchStatus } from '@ws-widget/utils'
import { NSSearch } from '../_services/widget-search.model'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { AwsAnalyticsService } from '../../../../../../project/ws/viewer/src/lib/aws-analytics.service'

@Component({
  selector: 'ws-widget-btn-catalog',
  templateUrl: './btn-catalog.component.html',
  styleUrls: ['./btn-catalog.component.scss'],
})
export class BtnCatalogComponent extends WidgetBaseComponent
  implements NsWidgetResolver.IWidgetData<any> {

  @Input() widgetData!: any
  catalogItems: NSSearch.IFilterUnitContent[] | null = null
  catalogFetchStatus: TFetchStatus = 'none'
  loginPage = false
  pageUrl: any
  eventName: any

  constructor(private catalogSvc: TreeCatalogService,
              private awsAnalyticsService: AwsAnalyticsService) {
    super()
    const url = window.location.href
    if (url.indexOf('login') > 0) {
      this.loginPage = true
    }
  }

  getCatalog() {
    this.catalogFetchStatus = 'fetching'
    this.catalogSvc.getFullCatalog().subscribe(
      (catalog: NSSearch.IFilterUnitContent[]) => {
        this.catalogFetchStatus = 'done'
        if (catalog.length === 1 && catalog[0].children) {
          this.catalogItems = catalog[0].children
        } else {
          this.catalogItems = catalog
        }
      },
      () => this.catalogFetchStatus = 'error',
    )
    this.pageUrl = window.location.href

    if (this.pageUrl.indexOf('login') > 0) {
      this.eventName = 'PHP1_Category'
    } else {
      this.eventName = 'H2_Category'
    }

    const attr = {
      name: this.eventName,
      attributes: {},
    }
    this.awsAnalyticsService.callAnalyticsEndpointServiceWithoutAttribute(attr)
  }
}
