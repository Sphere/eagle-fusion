import { Component, Inject, OnInit } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { AUTHORING_CONTENT_BASE, CONTENT_BASE_WEBHOST_ASSETS } from '@ws/author/src/lib/constants/apiEndpoints'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { UploadService } from '@ws/author/src/lib/routing/modules/editor/shared/services/upload.service'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { FILE_MAX_SIZE } from './../../../../../../../../../constants/upload'
import { IWidgetAuthor } from './../../../interface/widget'

@Component({
  selector: 'ws-auth-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
})
export class InputComponent implements OnInit {
  widget: IWidgetAuthor
  parentType: string
  isSubmitPressed = false
  identifier = ''
  canShowEdit = false
  canShowParent = false
  showInfo = ''
  directEdit = false
  constructor(
    private uploadService: UploadService,
    private loader: LoaderService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<InputComponent>,
    @Inject(MAT_DIALOG_DATA) data: { widget: IWidgetAuthor, parentType: string, identifier: string },
  ) {
    this.widget = data.widget
    this.parentType = data.parentType
    this.identifier = data.identifier
  }

  ngOnInit() {
    if (['gridLayout', 'selectorResponsive', 'galleryView'].indexOf(this.parentType) > -1) {
      this.canShowParent = true
    }
    if (
      [
        'gridLayout',
        'cardBreadcrumb',
        'playerVideo',
        'playerAudio',
        'elementHtml',
        'pageEmbedded',
        'sliderBanners',
        'imageMapResponsive',
        'galleryView',
        'contentStripMultiple',
        'videoWrapper',
        '',
      ].indexOf(this.widget.widgetSubType) > -1
    ) {
      this.canShowEdit = true
    }
  }

  close() {
    this.dialogRef.close(this.widget)
  }

  save() {
    this.dialogRef.close({ data: this.widget })
  }

  update(data: { content: IWidgetAuthor, isValid: boolean }) {
    if (data && data.content && JSON.stringify(data.content) !== JSON.stringify(this.widget.data)) {
      this.widget.data = JSON.parse(JSON.stringify(data.content))
    }
    this.widget.isValid = data.isValid
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
    this.uploadService.upload(
      formdata,
      { contentId: this.identifier, contentType: CONTENT_BASE_WEBHOST_ASSETS },
    ).subscribe(
      data => {
        if (data.code) {
          this.loader.changeLoad.next(false)
          this.widget.addOnData.thumbnail = `${AUTHORING_CONTENT_BASE}${encodeURIComponent(
            `/${data.artifactURL.split('/').slice(3).join('/')}`)}`
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
