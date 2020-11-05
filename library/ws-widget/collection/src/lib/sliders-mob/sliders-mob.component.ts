import { Component, Input, OnInit } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { interval, Subscription } from 'rxjs'
import { EventService } from '../../../../utils/src/public-api'
import { ICarousel } from '../sliders/sliders.model'

@Component({
  selector: 'ws-widget-sliders-mob',
  templateUrl: './sliders-mob.component.html',
  styleUrls: ['./sliders-mob.component.scss'],
})
export class SlidersMobComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<ICarousel[]> {
  @Input() widgetData!: ICarousel[]

  currentIndex = 0
  slideInterval: Subscription | null = null

  constructor(private events: EventService) {
    super()
  }

  ngOnInit() {
    this.reInitiateSlideInterval()
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
    if (
      (currentData.redirectUrl && currentData.redirectUrl.includes('mailto')) ||
      this.widgetData[this.currentIndex].openInNewTab
    ) {
      return true
    }
    return false
  }

  openInNewTab() {
    const currentData = this.widgetData[this.currentIndex]
    if (
      (currentData.redirectUrl && currentData.redirectUrl.includes('mailto')) ||
      this.widgetData[this.currentIndex].openInNewTab
    ) {
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
