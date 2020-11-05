import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { NsGalleryView } from '@ws-widget/collection/src/public-api'
import { NsWidgetResolver } from '@ws-widget/resolver'
import {
  AUTHORING_CONTENT_BASE,
  CONTENT_BASE_WEBHOST_ASSETS,
} from '@ws/author/src/lib/constants/apiEndpoints'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { UploadService } from '@ws/author/src/lib/routing/modules/editor/shared/services/upload.service'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { WIDGET_LIBRARY } from '../../../constants/widet'
import { FILE_MAX_SIZE } from './../../../../../../../../../constants/upload'

@Component({
  selector: 'ws-auth-gallery-v2',
  templateUrl: './gallery-v2.component.html',
  styleUrls: ['./gallery-v2.component.scss'],
})
export class GalleryV2Component implements OnInit {
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
  seriesAtEnd = true

  constructor(
    private uploadService: UploadService,
    private loader: LoaderService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.currentStrip = this.content.cardMenu[this.index]
    if (this.content.type === 'image' && !this.content.designVal) {
      this.content.designVal = 'set2'
    }
  }

  onIndexChange(index: number) {
    this.index = index
    this.currentStrip = this.content.cardMenu[index]
  }

  removeStrip() {
    this.content.cardMenu.splice(this.index, 1)
    if (this.index >= this.content.cardMenu.length && this.index === 0) {
      this.addEnd(false)
    } else if (this.index >= this.content.cardMenu.length) {
      this.index = this.index - 1
      this.onIndexChange(this.index)
    } else {
      this.onIndexChange(this.index)
    }
  }

  addfront() {
    const strip = this.addStrip()
    this.content.cardMenu.unshift(strip)
    this.currentStrip = strip
    this.index = 0
    this.onIndexChange(this.index)
  }

  addEnd(increaseIndex = true) {
    const strip = this.addStrip()
    this.content.cardMenu.push(strip)
    this.currentStrip = strip
    this.index = increaseIndex ? this.content.cardMenu.length - 1 : this.index
    this.onIndexChange(this.index)
  }

  addStrip(): NsGalleryView.ICardMenu {
    const strip: NsGalleryView.ICardMenu = {
      cardData: {
        title: '',
        description: '',
        thumbnail: '',
      },
      widget: this.generateWidget(),
    }
    return strip
  }

  metaUpdate(key: 'title' | 'description' | 'thumbnail', value: string) {
    if (this.currentStrip.cardData) {
      this.currentStrip.cardData[key] = value
    } else {
      this.currentStrip.cardData = {
        title: '',
        description: '',
        thumbnail: '',
        [key]: value,
      }
    }
  }

  upload(file: File) {
    const formdata = new FormData()
    const fileName = file.name.replace(/[^A-Za-z0-9.]/g, '')
    if (!(file.type.indexOf('image/') > -1)) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.INVALID_FORMAT,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
      return
    }

    if (file.type.indexOf('image/') > -1 && file.size > FILE_MAX_SIZE) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.SIZE_ERROR,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
      return
    }

    formdata.append('content', file, fileName)
    this.loader.changeLoad.next(true)
    this.uploadService
      .upload(formdata, { contentId: this.identifier, contentType: CONTENT_BASE_WEBHOST_ASSETS })
      .subscribe(
        data => {
          if (data.code) {
            this.loader.changeLoad.next(false)
            this.metaUpdate(
              'thumbnail',
              `${AUTHORING_CONTENT_BASE}${encodeURIComponent(
                `/${data.artifactURL.split('/').slice(3).join('/')}`,
              )}`,
            )
            this.snackBar.openFromComponent(NotificationComponent, {
              data: {
                type: Notify.UPLOAD_SUCCESS,
              },
              duration: NOTIFICATION_TIME * 1000,
            })
          }
        },
        () => {
          this.loader.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.UPLOAD_FAIL,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
        },
      )
  }

  generateWidget(): NsWidgetResolver.IRenderConfigWithAnyData {
    if (this.content.type === 'video') {
      return this.getEmptyData('wrapper')
    }
    if (this.content.type === 'audio') {
      return this.getEmptyData('audio')
    }
    if (this.content.type === 'iframe') {
      return this.getEmptyData('iframe')
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
