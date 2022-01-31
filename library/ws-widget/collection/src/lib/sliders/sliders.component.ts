import { Component, Input, OnInit, HostListener } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { ICarousel } from './sliders.model'
import { Subscription, interval } from 'rxjs'
import { EventService } from '../../../../utils/src/public-api'
import { Router } from '@angular/router'

@Component({
  selector: 'ws-widget-sliders',
  templateUrl: './sliders.component.html',
  styleUrls: ['./sliders.component.scss'],
})
export class SlidersComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<ICarousel[]> {
  @Input() widgetData!: any
  screenSize = 'medium'
  currentIndex = 0
  slideInterval: Subscription | null = null

  constructor(private events: EventService, private router: Router) {
    super()
  }

  ngOnInit() {
    this.reInitiateSlideInterval()
    if (!this.widgetData) {
      // tslint:disable-next-line:max-line-length
      this.widgetData = '[{"banners":{"l":"assets/instances/eagle/banners/home/1/l.png","m":"assets/instances/eagle/banners/home/1/l.png","s":"assets/instances/eagle/banners/home/1/l.png","xl":"assets/instances/eagle/banners/home/1/xl.png","xs":"assets/instances/eagle/banners/home/1/xs.png","xxl":"assets/instances/eagle/banners/home/1/xl.png"},"redirectUrl":"/app/goals/me/all","queryParams":{"q":"Salesforce","lang":"en","f":"{}"},"title":""},{"banners":{"l":"assets/instances/eagle/banners/home/2/l.png","m":"assets/instances/eagle/banners/home/2/l.png","s":"assets/instances/eagle/banners/home/2/l.png","xl":"assets/instances/eagle/banners/home/2/xl.png","xs":"assets/instances/eagle/banners/home/2/xs.png","xxl":"assets/instances/eagle/banners/home/2/xl.png"},"redirectUrl":"/app/goals/me/all","queryParams":{"q":"Salesforce","lang":"en","f":"{}"},"title":""},{"banners":{"l":"assets/instances/eagle/banners/home/3/l.png","m":"assets/instances/eagle/banners/home/3/s.png","s":"assets/instances/eagle/banners/home/3/s.png","xl":"assets/instances/eagle/banners/home/3/xl.png","xs":"assets/instances/eagle/banners/home/3/xs.png","xxl":"assets/instances/eagle/banners/home/3/xl.png"},"redirectUrl":"/app/goals/me/all","queryParams":{"q":"Salesforce","lang":"en","f":"{}"},"title":""}]'
    }

    if (this.router.url === '/page/home') {
      if (window.innerWidth <= 600) {
        this.screenSize = 'less'
      } else {
        this.screenSize = 'medium'
      }
    }
    if (this.router.url === '/public/home') {
      if (window.innerWidth <= 600) {
        this.screenSize = 'medium'
      }
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.router.url === '/page/home') {
      if (event.target.innerWidth <= 600) {
        this.screenSize = 'less'
      } else {
        this.screenSize = 'medium'
      }
    }
    if (this.router.url === '/public/home') {
      if (window.innerWidth <= 600) {
        this.screenSize = 'medium'
      }
    }
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
  }
}
