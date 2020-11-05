// import { ISelectorResponsive, NsGalleryView } from '@ws-widget/collection'
import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material'
import { NsWidgetResolver } from '@ws-widget/resolver/src/public-api'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { COLUMN_WIDTH } from '../../input/image-v2/image-v2.constant'

@Component({
  selector: 'ws-auth-input-v2',
  templateUrl: './input-v2.component.html',
  styleUrls: ['./input-v2.component.scss'],
})
export class InputV2Component implements OnInit {
  isSubmitPressed = false
  identifier: string
  widget!: NsWidgetResolver.IRenderConfigWithAnyData
  size: 1 | 2 | 3 | 4 = 1
  commonConfig = false
  commonProp: any
  columnWidth = COLUMN_WIDTH
  heightProp: 'auto' | 'standard' | 'custom' = 'auto'
  widthProp: 'auto' | 'standard' | 'custom' = 'auto'
  heightUnit = 'px'
  height: any = null
  widthUnit = 'px'
  width: any = null
  marginLeftUnit = 'px'
  marginLeft = null
  marginRightUnit = 'px'
  marginRight = null
  marginTopUnit = 'px'
  marginTop = null
  marginBottomUnit = 'px'
  marginBottom = null
  paddingLeftUnit = 'px'
  paddingLeft = null
  paddingRightUnit = 'px'
  paddingRight = null
  paddingTopUnit = 'px'
  paddingTop = null
  paddingBottomUnit = 'px'
  paddingBottom = null
  isMarginAvailable = false

  constructor(
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA)
    data: { widget: NsWidgetResolver.IRenderConfigWithAnyData; identifier: string; size: 1 | 2 | 3 | 4 },
    public dialogRef: MatDialogRef<InputV2Component>,
  ) {
    this.widget = data.widget
    this.identifier = data.identifier
    this.size = data.size || 1
  }

  ngOnInit() {

    this.commonProp = {
      ...(this.widget.widgetHostStyle || {}),
    }
    // if (!this.commonProp.height) {
    //   this.commonProp.height = '472px'
    // }
    // if (!this.commonProp.width) {
    //   this.commonProp.width = `${this.size * 331}px`
    // }
    this.heightProp = this.commonProp.height ?
      this.commonProp.height === '472px' ?
        'standard' : 'custom' : 'auto'
    this.widthProp = this.commonProp.width ?
      this.commonProp.width === `${this.size * 331}px` ?
        'standard' : 'custom' : 'auto'
    this.assignCssProp()
    this.checkWidgetType(this.widget, undefined, true)
  }

  // close() {
  //   this.getCssStyle()
  //   const style: any = { ...this.commonProp }

  //   if (Object.keys(style).length) {
  //     Object.keys(style).forEach(v => {
  //       if (!style[v]) {
  //         delete style[v]
  //       }
  //     })
  //   }
  //   this.widget.widgetHostStyle = style

  //   if (this.widget.widgetSubType === 'pageEmbedded') {
  //     this.widget.widgetData.containerStyle = style
  //   }
  //   if (this.widget.widgetSubType === 'sliderBanners') {
  //     delete (this.widget.widgetHostStyle || {}).height
  //     delete (this.widget.widgetHostStyle || {}).width
  //   }
  //   this.dialogRef.close(this.widget)
  // }

  close() {
    this.getCssStyle()
    const style: any = { ...this.commonProp }
    const parentStyle: any = {}
    const childrenStyle: any = {}
    if (Object.keys(style).length) {
      Object.keys(style).forEach(v => {
        if ((v === 'height') || (v === 'width')) {
          parentStyle[v] = style[v]
        } else {
          childrenStyle[v] = style[v]
        }
        if (!style[v]) {
          delete style[v]
        }
      })
    }
    this.widget.widgetHostStyle = { ...parentStyle }
    if (this.widget.widgetSubType === 'sliderBanners') {
      delete (this.widget.widgetHostStyle || {}).height
      delete (this.widget.widgetHostStyle || {}).width
    }
    this.checkWidgetType(this.widget, childrenStyle)
    // this.checkWidgetType(this.widget)
    this.dialogRef.close(this.widget)
  }
  update(data: NsWidgetResolver.IRenderConfigWithAnyData) {
    this.widget.widgetData = data
  }

  copyId() {
    const selBox = document.createElement('textarea')
    selBox.style.position = 'fixed'
    selBox.style.left = '0'
    selBox.style.top = '0'
    selBox.style.opacity = '0'
    selBox.value = this.widget.widgetInstanceId || ''
    document.body.appendChild(selBox)
    selBox.focus()
    selBox.select()
    document.execCommand('copy')
    document.body.removeChild(selBox)
    this.snackBar.openFromComponent(NotificationComponent, {
      data: {
        type: Notify.COPY,
      },
      duration: NOTIFICATION_TIME * 1000,
    })
  }

  setStyle(key: 'height' | 'width') {
    if (key === 'height') {
      this.height = this.heightProp === 'auto' ? null : this.heightProp === 'standard' ? 472 : 0
    } else {
      this.width = this.widthProp === 'auto' ? null : this.widthProp === 'standard' ?
        this.size * 331 : 0
    }
  }

  assignCssProp() {
    if (this.commonProp.height) {
      this.heightUnit = this.commonProp.height.replace(/[0-9]/g, '')
      this.height = this.commonProp.height.replace(/[^0-9]/g, '')
    }
    if (this.commonProp.width) {
      this.widthUnit = this.commonProp.width.replace(/[0-9]/g, '')
      this.width = this.commonProp.width.replace(/[^0-9]/g, '')
    }
    if (this.commonProp['margin-left']) {
      this.marginLeftUnit = this.commonProp['margin-left'].replace(/[0-9]/g, '')
      this.marginLeft = this.commonProp['margin-left'].replace(/[^0-9]/g, '')
    } if (this.commonProp['margin-right']) {
      this.marginRightUnit = this.commonProp['margin-right'].replace(/[0-9]/g, '')
      this.marginRight = this.commonProp['margin-right'].replace(/[^0-9]/g, '')
    }
    if (this.commonProp['margin-top']) {
      this.marginTopUnit = this.commonProp['margin-top'].replace(/[0-9]/g, '')
      this.marginTop = this.commonProp['margin-top'].replace(/[^0-9]/g, '')
    }
    if (this.commonProp['margin-bottom']) {
      this.marginBottomUnit = this.commonProp['margin-bottom'].replace(/[0-9]/g, '')
      this.marginBottom = this.commonProp['margin-bottom'].replace(/[^0-9]/g, '')
    }
    if (this.commonProp['padding-left']) {
      this.paddingLeftUnit = this.commonProp['padding-left'].replace(/[0-9]/g, '')
      this.paddingLeft = this.commonProp['padding-left'].replace(/[^0-9]/g, '')
    } if (this.commonProp['padding-right']) {
      this.paddingRightUnit = this.commonProp['padding-right'].replace(/[0-9]/g, '')
      this.paddingRight = this.commonProp['padding-right'].replace(/[^0-9]/g, '')
    }
    if (this.commonProp['padding-top']) {
      this.paddingTopUnit = this.commonProp['padding-top'].replace(/[0-9]/g, '')
      this.paddingTop = this.commonProp['padding-top'].replace(/[^0-9]/g, '')
    }
    if (this.commonProp['padding-bottom']) {
      this.paddingBottomUnit = this.commonProp['padding-bottom'].replace(/[0-9]/g, '')
      this.paddingBottom = this.commonProp['padding-bottom'].replace(/[^0-9]/g, '')
    }
  }

  getCssStyle() {
    if (this.height || this.height === 0) {
      this.commonProp.height = `${this.height}${this.heightUnit}`
    } else {
      delete this.commonProp.height
    }
    if (this.width || this.width === 0) {
      this.commonProp.width = `${this.width}${this.widthUnit}`
    } else {
      delete this.commonProp.width
    }
    if (this.marginRight || this.marginRight === 0) {
      this.commonProp['margin-right'] = `${this.marginRight}${this.marginRightUnit}`
    } else {
      delete this.commonProp['margin-right']
    }
    if (this.marginLeft || this.marginLeft === 0) {
      this.commonProp['margin-left'] = `${this.marginLeft}${this.marginLeftUnit}`
    } else {
      delete this.commonProp['margin-left']
    }
    if (this.marginTop || this.marginTop === 0) {
      this.commonProp['margin-top'] = `${this.marginTop}${this.marginTopUnit}`
    } else {
      delete this.commonProp['margin-top']
    }
    if (this.marginBottom || this.marginBottom === 0) {
      this.commonProp['margin-bottom'] = `${this.marginBottom}${this.marginBottomUnit}`
    } else {
      delete this.commonProp['margin-bottom']
    }
    if (this.paddingRight || this.paddingRight === 0) {
      this.commonProp['padding-right'] = `${this.paddingRight}${this.paddingRightUnit}`
    } else {
      delete this.commonProp['padding-right']
    }
    if (this.paddingLeft || this.paddingLeft === 0) {
      this.commonProp['padding-left'] = `${this.paddingLeft}${this.paddingLeftUnit}`
    } else {
      delete this.commonProp['padding-left']
    }
    if (this.paddingTop || this.paddingTop === 0) {
      this.commonProp['padding-top'] = `${this.paddingTop}${this.paddingTopUnit}`
    } else {
      delete this.commonProp['padding-top']
    }
    if (this.paddingBottom || this.paddingBottom === 0) {
      this.commonProp['padding-bottom'] = `${this.paddingBottom}${this.paddingBottomUnit}`
    } else {
      delete this.commonProp['padding-bottom']
    }
  }

  checkWidgetType(
    widgetData: NsWidgetResolver.IRenderConfigWithAnyData,
    style?: any,
    read = false,
  ): NsWidgetResolver.IRenderConfigWithAnyData {
    switch (widgetData.widgetSubType) {
    case 'selectorResponsive':
      if (widgetData.widgetData.selectFrom) {
        for (let index = 0; index < widgetData.widgetData.selectFrom.length; index = index + 1) {
          if (widgetData.widgetData.selectFrom[index].widget.widgetSubType) {
            widgetData.widgetData.selectFrom[index].widget = this.checkWidgetType(
                widgetData.widgetData.selectFrom[index].widget,
                style,
                read)
          }
        }
      }
      return widgetData
    case 'pageEmbedded':
    case 'galleryView':
    case 'elementHtml':
    case 'pageEmbedded':
      this.isMarginAvailable = true
      return this.setMarginContainerStyle(widgetData, style, read)
    case 'sliderBanners':
    case 'contentStripMultiple':
    case 'contentStripSingle':
    case 'imageMapResponsive':
    case 'cardBreadcrumb':
    case 'playerVideo':
      this.isMarginAvailable = false
      return widgetData
    default:
      return widgetData
    }
  }

  setMarginContainerStyle(
    widget: NsWidgetResolver.IRenderConfigWithAnyData,
    style?: any,
    read = false): NsWidgetResolver.IRenderConfigWithAnyData {
    let stylePresent: any = {}
    if (widget && widget.widgetData && !read) {
      widget.widgetData.containerStyle = {
        ...widget.widgetData.containerStyle || {},
        ...style,
      }
    }
    if (read) {
      stylePresent = { ...widget.widgetData.containerStyle }
      this.setStyleProperties(stylePresent)
    }

    return widget
  }

  setMarginHostStyle(
    widget: NsWidgetResolver.IRenderConfigWithAnyData,
    style?: any,
    read = false): NsWidgetResolver.IRenderConfigWithAnyData {
    let stylePresent: any = {}
    if (widget && widget.widgetData && !read) {
      widget.widgetHostStyle = {
        ...widget.widgetHostStyle || {},
        ...style,
      }
    }
    if (read) {
      stylePresent = { ...widget.widgetHostStyle }
      this.setStyleProperties(stylePresent)
    }
    return widget
  }

  setStyleProperties(style: any) {
    if (Object.keys(style).length) {
      Object.keys(style).forEach(v => {
        if (v === 'height') {
          this.height = style[v].match(/\d+/)[0]
          this.heightUnit = style[v].split(/\d+/)[1]
        } else if (v === 'height') {
          this.width = style[v].match(/\d+/)[0]
          this.widthUnit = style[v].split(/\d+/)[1]
        } else if (v === 'margin-right') {
          this.marginRight = style[v].match(/\d+/)[0]
          this.marginRightUnit = style[v].split(/\d+/)[1]
        } else if (v === 'margin-left') {
          this.marginLeft = style[v].match(/\d+/)[0]
          this.marginLeftUnit = style[v].split(/\d+/)[1]
        } else if (v === 'margin-top') {
          this.marginTop = style[v].match(/\d+/)[0]
          this.marginTopUnit = style[v].split(/\d+/)[1]
        } else if (v === 'margin-bottom') {
          this.marginBottom = style[v].match(/\d+/)[0]
          this.marginBottomUnit = style[v].split(/\d+/)[1]
        } else if (v === 'padding-right') {
          this.paddingRight = style[v].match(/\d+/)[0]
          this.paddingRightUnit = style[v].split(/\d+/)[1]
        } else if (v === 'padding-left') {
          this.paddingLeft = style[v].match(/\d+/)[0]
          this.paddingLeftUnit = style[v].split(/\d+/)[1]
        } else if (v === 'padding-top') {
          this.paddingTop = style[v].match(/\d+/)[0]
          this.paddingTopUnit = style[v].split(/\d+/)[1]
        } else if (v === 'padding-bottom') {
          this.paddingBottom = style[v].match(/\d+/)[0]
          this.paddingBottomUnit = style[v].split(/\d+/)[1]
        }
      })
    }
    this.getCssStyle()
  }
}
