import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { ISelectorResponsive, ISelectorResponsiveUnit } from '@ws-widget/collection/src/public-api'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { WIDGET_LIBRARY } from '../../../constants/widet'
import { ImageMapComponent } from './../image-map/image-map.component'

@Component({
  selector: 'ws-auth-selector-responsive-v2',
  templateUrl: './selector-responsive-v2.component.html',
  styleUrls: ['./selector-responsive-v2.component.scss'],
})
export class SelectorResponsiveV2Component implements OnInit {
  @Output() data = new EventEmitter<{
    content: ISelectorResponsive
    isValid: boolean
  }>()

  @ViewChild(ImageMapComponent, { static: false }) imageMapComponent!: ImageMapComponent

  @Input() content!: ISelectorResponsive
  @Input() identifier = ''
  @Input() isSubmitPressed = false
  @Input() size = 1
  currentSize = 1
  index = 0
  // isCommon = true
  currentStrip!: ISelectorResponsiveUnit

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
    this.currentStrip = this.content.selectFrom[this.index]
    // this.isCommon = this.content.selectFrom.length === 1
    if (this.content.selectFrom.length === 1) {
      this.setDifferentScreenType()
    }
  }

  onIndexChange(index: number) {
    this.index = index
    this.currentStrip = this.content.selectFrom[index]
    const size = this.getType(index)
    if (size === 'mob') {
      this.currentSize = 1
    } else if (size === 'desktop') {
      this.currentSize = this.size
    } else if (size === 'tab' || size === 'tabDesktop') {
      this.currentSize = 2
    } else {
      this.currentSize = this.size
    }
    if (this.content.type === 'imageMap') {
      setTimeout(() => {
        if (this.imageMapComponent) {
          this.imageMapComponent.ngOnInit()
          setTimeout(() => this.imageMapComponent.ngAfterViewInit(), 100)
        }
      },         10)
    }
  }

  getType(i: number, sendCustom = false) {
    const minWidth = this.content.selectFrom[i].minWidth
    const maxWidth = this.content.selectFrom[i].maxWidth

    if (minWidth === 0 && maxWidth === 480) {
      return 'mob'
    }
    if (minWidth === 481 && maxWidth === 840) {
      return 'tab'
    }
    if (minWidth === 841 && maxWidth === 500090000) {
      return 'desktop'
    }
    if (minWidth === 0 && maxWidth === 500090000) {
      return 'common'
    }
    if (minWidth === 481 && maxWidth === 500090000) {
      return 'tabDesktop'
    }
    return sendCustom ? 'custom' : `${minWidth}px - ${maxWidth}px`
  }

  setScreenWidth(value: any) {
    switch (value.value) {
      case 'mob':
        this.currentStrip.minWidth = 0
        this.currentStrip.maxWidth = 480
        break
      case 'tabDesktop':
        this.currentStrip.minWidth = 481
        this.currentStrip.maxWidth = 500090000
        break
      case 'tab':
        this.currentStrip.minWidth = 481
        this.currentStrip.maxWidth = 840
        break
      case 'desktop':
        this.currentStrip.minWidth = 841
        this.currentStrip.maxWidth = 500090000
        break
      case 'custom':
        this.currentStrip.minWidth = 0
        this.currentStrip.maxWidth = 500090000
        break
    }
  }

  setDifferentScreenType() {
    // const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    //   width: '350px',
    //   data: 'dialog',
    // })

    // dialogRef.afterClosed().subscribe(result => {
    // if (result) {
    // if (this.isCommon) {
    //   this.currentStrip.minWidth = 0
    //   this.currentStrip.maxWidth = 500090000
    //   this.content.selectFrom = [this.currentStrip]
    // } else {
    if (this.size === 2) {
      this.currentStrip.minWidth = 481
      this.currentStrip.maxWidth = 500090000
      this.content.selectFrom = [this.currentStrip]
      this.addStrip(false)
      this.content.selectFrom[1].maxWidth = 480
      this.content.selectFrom[1].minWidth = 0
    } else if (this.size > 2) {
      this.currentStrip.minWidth = 841
      this.currentStrip.maxWidth = 500090000
      this.content.selectFrom = [this.currentStrip]
      this.addStrip(false)
      this.content.selectFrom[1].maxWidth = 840
      this.content.selectFrom[1].minWidth = 481
      this.addStrip(false)
      this.content.selectFrom[2].maxWidth = 480
      this.content.selectFrom[2].minWidth = 0
    }

    // } else {
    //   this.isCommon = !this.isCommon
  }

  removeStrip() {
    this.content.selectFrom.splice(this.index, 1)
    if (this.index >= this.content.selectFrom.length && this.index === 0) {
      this.addStrip(false)
    } else if (this.index >= this.content.selectFrom.length) {
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
    this.content.selectFrom.push(strip)
    this.currentStrip = strip
    this.onIndexChange(increaseIndex ? this.content.selectFrom.length - 1 : this.index)
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
    const data = JSON.parse(
      JSON.stringify(WIDGET_LIBRARY[`solo_${type}` as keyof typeof WIDGET_LIBRARY]),
    )
    return data
  }
}
