import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { IWidgetElementHtml } from '@ws-widget/collection'
import { FILE_MAX_SIZE } from '@ws/author/src/lib/constants/upload'
import { CONTENT_BASE_WEBHOST_ASSETS, AUTHORING_CONTENT_BASE } from '@ws/author/src/lib/constants/apiEndpoints'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { UploadService } from '@ws/author/src/lib/routing/modules/editor/shared/services/upload.service'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import mustache from 'mustache'

@Component({
  selector: 'ws-auth-html',
  templateUrl: './html.component.html',
  styleUrls: ['./html.component.scss'],
})
export class HtmlComponent implements OnInit {

  showInfo = ''
  @Input() isSubmitPressed = false
  @Input() content!: IWidgetElementHtml
  @Input() identifier = ''
  location = CONTENT_BASE_WEBHOST_ASSETS
  @Output() data = new EventEmitter<{ content: IWidgetElementHtml, isValid: boolean }>()
  dataType!: 'html' | 'template' | 'templateUrl'

  constructor(
    private snackBar: MatSnackBar,
    private uploadService: UploadService,
    private loader: LoaderService,
  ) { }

  ngOnInit() {
    if (this.content.html) {
      this.dataType = 'html'
    } else if (this.content.template) {
      this.content.html = mustache.render(this.content.template || '', this.content.templateData || {})
        .replace(/&#x2F;/g, '/')
      this.dataType = 'html'
    } else if (this.content.templateUrl) {
      this.dataType = 'templateUrl'
    } else {
      this.dataType = 'html'
    }
    this.data.emit({
      content: this.content,
      isValid: this.content.html || this.content.template || this.content.templateUrl ? true : false,
    })
  }

  update(key: string, value: any) {
    this.data.emit({
      content: {
        ...this.content,
        [key]: value,
      },
      isValid: this.content.html || this.content.template || this.content.templateUrl ? true : false,
    })
    if (key === 'template' || key === 'templateData') {
      this.content.html = mustache.render(this.content.template || '', this.content.templateData || {})
    }
  }

  upload(file: File, type: 'html' | 'json') {
    const formdata = new FormData()
    const fileName = file.name.replace(/[^A-Za-z0-9.]/g, '')
    if ((!(fileName.toLowerCase().endsWith('.html')) && type === 'html') ||
      ((!fileName.toLowerCase().endsWith('.json')) && type === 'json')
    ) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.INVALID_FORMAT,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
      return
    }

    if (file.size > FILE_MAX_SIZE) {
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
    this.uploadService.upload(formdata,
      // tslint:disable-next-line:align
      { contentId: this.identifier, contentType: CONTENT_BASE_WEBHOST_ASSETS }).subscribe(
        data => {
          if (data.code) {
            this.loader.changeLoad.next(false)
            const url = `${AUTHORING_CONTENT_BASE}${encodeURIComponent(data.artifactURL || data.authArtifactUrl)}`
            if (type === 'json') {
              this.update('templateDataUrl', url)
            } {
              this.update('templateUrl', url)
            }
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

}
