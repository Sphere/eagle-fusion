import { Component, OnInit } from '@angular/core'
import { IWsOcmJsonResponse } from '../../models/ocm.model'
import { ActivatedRoute } from '@angular/router'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ICarousel } from '@ws-widget/collection'
import { ConfigurationsService } from '@ws-widget/utils'

@Component({
  selector: 'ws-app-ocm-home',
  templateUrl: './ocm-home.component.html',
  styleUrls: ['./ocm-home.component.scss'],
})
export class OcmHomeComponent implements OnInit {
  pageTitle = ''
  widgetBannersRequest: NsWidgetResolver.IRenderConfigWithTypedData<ICarousel[]> | null = null
  ocmRequestData: IWsOcmJsonResponse | null = null
  errorFetchingJson = false

  constructor(private route: ActivatedRoute, public configSvc: ConfigurationsService) {}

  ngOnInit() {
    this.route.data.subscribe(response => {
      if (response.ocmJson.data) {
        this.ocmRequestData = response.ocmJson.data
        if (this.ocmRequestData) {
          this.pageTitle = this.ocmRequestData.pageTitle
          this.widgetBannersRequest = this.ocmRequestData.banners
        }
      } else if (response.ocmJson.error) {
        this.errorFetchingJson = true
      }
    })
  }
}
