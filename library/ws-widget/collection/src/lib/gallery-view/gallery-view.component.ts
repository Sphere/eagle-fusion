import { Component, OnInit, Input } from '@angular/core'
import { WidgetBaseComponent, NsWidgetResolver } from '@ws-widget/resolver'
import { NsGalleryView } from './gallery-view.model'
import { Subscription } from 'rxjs'

@Component({
  selector: 'ws-widget-gallery-view',
  templateUrl: './gallery-view.component.html',
  styleUrls: ['./gallery-view.component.scss'],
})
export class GalleryViewComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<NsGalleryView.IWidgetGalleryView> {
  @Input() widgetData!: NsGalleryView.IWidgetGalleryView

  currentWidget: NsWidgetResolver.IRenderConfigWithAnyData | null = null
  defaultVal = 'set1'
  currentIndex = 0
  slideInterval: Subscription | null = null

  ngOnInit() {
    if (this.widgetData && this.widgetData.designVal && this.widgetData.designVal.length > 0) {
      this.defaultVal = this.widgetData.designVal
    }
    if (this.widgetData && this.widgetData.cardMenu.length && this.defaultVal === 'set1') {
      this.currentWidget = this.widgetData.cardMenu[0].widget
      if (this.widgetData.cardMenu[0].cardData) {
        this.widgetData.cardMenu[0].cardData.currentlyPlaying = true
      }
    }
  }

  changeWidget(card: NsGalleryView.ICardMenu) {
    this.widgetData.cardMenu.forEach(currentCard => {
      if (currentCard.cardData) {
        currentCard.cardData.currentlyPlaying = false
      }
    })
    this.currentWidget = card.widget
    if (card.cardData) {
      card.cardData.currentlyPlaying = true
    }
  }

  slideTo(index: number) {
    if (index >= 0 && index < this.widgetData.cardMenu.length) {
      this.currentIndex = index
    } else if (index === this.widgetData.cardMenu.length) {
      this.currentIndex = 0
    } else {
      this.currentIndex = this.widgetData.cardMenu.length + index
    }
  }
}
