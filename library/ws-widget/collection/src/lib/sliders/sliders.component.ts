import { Component, Input, OnInit } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { ICarousel } from './sliders.model'
import { Subscription, interval } from 'rxjs'
import { EventService } from '../../../../utils/src/public-api'
import { AwsAnalyticsService } from '../../../../../../project/ws/viewer/src/lib/aws-analytics.service'

@Component({
  selector: 'ws-widget-sliders',
  templateUrl: './sliders.component.html',
  styleUrls: ['./sliders.component.scss'],
})
export class SlidersComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<ICarousel[]> {
  @Input() widgetData!: any

  currentIndex = 0
  slideInterval: Subscription | null = null
  pageTrackUrl: any

  constructor(private events: EventService,
              private awsAnalyticsService: AwsAnalyticsService
  ) {
    super()
  }

  ngOnInit() {
    this.reInitiateSlideInterval()
    if (!this.widgetData) {
      // tslint:disable-next-line:max-line-length
      this.widgetData = '[{"banners":{"l":"assets/instances/eagle/banners/home/1/l.png","m":"assets/instances/eagle/banners/home/1/l.png","s":"assets/instances/eagle/banners/home/1/l.png","xl":"assets/instances/eagle/banners/home/1/xl.png","xs":"assets/instances/eagle/banners/home/1/xs.png","xxl":"assets/instances/eagle/banners/home/1/xl.png"},"redirectUrl":"/app/goals/me/all","queryParams":{"q":"Salesforce","lang":"en","f":"{}"},"title":""},{"banners":{"l":"assets/instances/eagle/banners/home/2/l.png","m":"assets/instances/eagle/banners/home/2/l.png","s":"assets/instances/eagle/banners/home/2/l.png","xl":"assets/instances/eagle/banners/home/2/xl.png","xs":"assets/instances/eagle/banners/home/2/xs.png","xxl":"assets/instances/eagle/banners/home/2/xl.png"},"redirectUrl":"/app/goals/me/all","queryParams":{"q":"Salesforce","lang":"en","f":"{}"},"title":""},{"banners":{"l":"assets/instances/eagle/banners/home/3/l.png","m":"assets/instances/eagle/banners/home/3/s.png","s":"assets/instances/eagle/banners/home/3/s.png","xl":"assets/instances/eagle/banners/home/3/xl.png","xs":"assets/instances/eagle/banners/home/3/xs.png","xxl":"assets/instances/eagle/banners/home/3/xl.png"},"redirectUrl":"/app/goals/me/all","queryParams":{"q":"Salesforce","lang":"en","f":"{}"},"title":""}]'
    }
    this.pageTrackUrl = window.location.href
  }
  reInitiateSlideInterval() {
    if (this.widgetData.length > 1) {
      try {
        if (this.slideInterval) {
          this.slideInterval.unsubscribe()
        }
      } catch (e) {
      } finally {
        this.slideInterval = interval(8000).subscribe(() => {
          if (this.currentIndex === this.widgetData.length - 1) {
            this.currentIndex = 0
          } else {
            this.currentIndex += 1
          }
        })
      }
    }
  }
  slideTo(index: number) {
    if (index >= 0 && index < this.widgetData.length) {
      this.currentIndex = index
    } else if (index === this.widgetData.length) {
      this.currentIndex = 0
    } else {
      this.currentIndex = this.widgetData.length + index
    }
    this.reInitiateSlideInterval()
    if (this.pageTrackUrl.indexOf('login') > 0) {
      this.eventTrack('PHP5_UserEventNextBanner')
    } else {
      this.eventTrack('HP2_HomeNextBanner')
    }
  }

  get isOpenInNewTab() {
    const currentData = this.widgetData[this.currentIndex]
    if (currentData.redirectUrl && currentData.redirectUrl.includes('mailto') || this.widgetData[this.currentIndex].openInNewTab) {
      return true
    } return false
  }

  openInNewTab() {
    const currentData = this.widgetData[this.currentIndex]
    if (currentData.redirectUrl && currentData.redirectUrl.includes('mailto') || this.widgetData[this.currentIndex].openInNewTab) {
      window.open(currentData.redirectUrl)
    }
  }
  raiseTelemetry(bannerUrl: string) {
    this.openInNewTab()
    const path = window.location.pathname.replace('/', '')
    const url = path + window.location.search

    this.events.raiseInteractTelemetry('click', 'banner', {
      pageUrl: url,
      bannerRedirectUrl: bannerUrl,
    })

    if (this.pageTrackUrl.indexOf('login') > 0) {
      this.eventTrack('PHP4_UserEventBanner')
    } else {
      this.eventTrack('HP1_BannerView')
    }
  }

  eventTrack(str: string) {
    const attr = {
      name: str,
      attributes: {},
    }
    this.awsAnalyticsService.callAnalyticsEndpointServiceWithoutAttribute(attr)
  }
}
