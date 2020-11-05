import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { ISelectorResponsiveUnit, NsGalleryView } from '@ws-widget/collection/src/public-api'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { WIDGET_LIBRARY } from '../../../constants/widet'

@Component({
  selector: 'ws-auth-image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.scss'],
})
export class ImageGalleryComponent implements OnInit {
  @Output() data = new EventEmitter<{
    content: NsGalleryView.IWidgetGalleryView
    isValid: boolean
  }>()

  @Input() content!: NsGalleryView.IWidgetGalleryView
  @Input() identifier = ''
  @Input() isSubmitPressed = false
  @Input() size = 1
  index = 0
  isCommon = true
  currentStrip!: NsGalleryView.ICardMenu

  constructor() {}

  ngOnInit() {
    this.currentStrip = this.content.cardMenu[this.index]
  }

  onIndexChange(index: number) {
    this.currentStrip = this.content.cardMenu[index]
  }

  // getType(i: number) {
  //   const minWidth = this.content.cardMenu[i].minWidth
  //   const maxWidth = this.content.cardMenu[i].maxWidth

  //   if (minWidth === 0 && maxWidth === 480) {
  //     return 'mob'
  //   } else if (minWidth === 481 && maxWidth === 840) {
  //     return 'tab'
  //   } else if (minWidth === 841) {
  //     return 'desktop'
  //   }
  //   return `${minWidth}px - ${maxWidth}px`
  // }

  removeStrip() {
    this.content.cardMenu.splice(this.index, 1)
    if (this.index >= this.content.cardMenu.length && this.index === 0) {
      this.addStrip(false)
    } else if (this.index >= this.content.cardMenu.length) {
      this.index = this.index - 1
      this.onIndexChange(this.index)
    } else {
      this.onIndexChange(this.index)
    }
  }

  addStrip(increaseIndex = true) {
    const strip: ISelectorResponsiveUnit = {
      minWidth: 0,
      maxWidth: 0,
      widget: this.generateWidget(),
    }
    this.content.cardMenu.push(strip)
    this.currentStrip = strip
    this.onIndexChange(increaseIndex ? this.content.cardMenu.length - 1 : this.index)
  }

  generateWidget(): NsWidgetResolver.IRenderConfigWithAnyData {
    if (this.content.type === 'imageMap') {
      return this.getEmptyData('map')
    }
    const widget = this.getEmptyData('image')
    widget.widgetData.type = this.content.subType
    return widget
  }

  getEmptyData(type: string): any {
    let size = 'one'
    switch (this.size) {
      case 1:
        size = 'one_'
        break
      case 2:
        size = 'two_'
        break
      case 3:
        size = 'three_'
        break
      case 4:
        size = 'four_'
        break
      default:
        size = 'one_'
    }
    const data = JSON.parse(
      JSON.stringify(WIDGET_LIBRARY[`${size}${type}` as keyof typeof WIDGET_LIBRARY]),
    )
    data.widgetData = data.data
    delete data.data
    return data
  }
}
