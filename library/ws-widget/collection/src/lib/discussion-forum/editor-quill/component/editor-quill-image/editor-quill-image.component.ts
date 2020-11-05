import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core'

import { IMAGE_SUPPORT_TYPES, IMAGE_MAX_SIZE } from '@ws/author/src/lib/constants/upload'
import { MatSnackBar } from '@angular/material'

import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { NotificationComponent } from './../notification/notification.component'
// import { LoaderService } from '@ws/author/src/public-api'
import { WsDiscussionForumService } from './../../../ws-discussion-forum.services'

import { CONTENT_BASE_WEBHOST_ASSETS, CONTENT_BASE_STATIC, CONTENT_BASE_STREAM, CONTENT_BASE_WEBHOST,
  AUTHORING_CONTENT_BASE } from '@ws/author/src/lib/constants/apiEndpoints'

@Component({
  selector: 'ws-widget-editor-quill-image',
  templateUrl: './editor-quill-image.component.html',
  styleUrls: ['./editor-quill-image.component.scss'],
})
export class EditorQuillImageComponent implements OnInit {
  @Output() textData = new EventEmitter<{
    isValid: boolean
    htmlText: any
  }>()

  @Input() htmlText = ''
  @Input() minLength = '1'
  @Input() post ?= false
  @Input() id = ''

  reset = false
  placeholder = 'Ask a question, or add something you found helpful'
  editor: any

  @Input() location:
    | typeof CONTENT_BASE_STATIC
    | typeof CONTENT_BASE_STREAM
    | typeof CONTENT_BASE_WEBHOST
    | typeof CONTENT_BASE_WEBHOST_ASSETS = CONTENT_BASE_WEBHOST_ASSETS

  constructor(
    private snackBar: MatSnackBar,
    private wsDiscussionService: WsDiscussionForumService,
    // private loaderService: LoaderService,
  ) { }

  ngOnInit() {
    if (this.post) {
      this.placeholder = 'Add a post ...'
    }
  }

  onContentChanged(editorEvent: any) {
    this.textData.emit({
      isValid: true,
      htmlText: editorEvent.html,
    })
  }

  resetEditor() {
    this.reset = true
    setTimeout(() => {
      this.reset = false
    },         0)
  }

  getEditorInstance(editorInstance: any) {
    this.editor = editorInstance
    const toolbar = editorInstance.getModule('toolbar')
    toolbar.addHandler('image', this.imageHandler)
  }

  imageHandler = () => {
    const input = <HTMLInputElement>document.getElementById('fileInputField')
    input.onchange = () => {
      let file: File
      if (input.files) {
        file = input.files[0]
        const fileExtension = file.name.toLowerCase().split('.')
        if (IMAGE_SUPPORT_TYPES.indexOf(`.${fileExtension[fileExtension.length - 1]}`) > -1) {
          if (file.size > IMAGE_MAX_SIZE) {
            this.snackBar.openFromComponent(NotificationComponent, {
              data: {
                type: Notify.SIZE_ERROR,
              },
              duration: NOTIFICATION_TIME * 1000,
            })
            return
          }

          const form = new FormData()
          form.set('content', file, file.name.replace(/[^A-Za-z0-9.]/g, ''))
          // this.loaderService.changeLoad.next(true)
            this.wsDiscussionService
            .upload(form, { contentId: this.id , contentType: this.location })
            .subscribe(
              data => {
                if (data.code) {
                  const url = data.artifactURL
                  const range = this.editor.getSelection()
                  this.editor.insertEmbed(range, 'image' ,
                                          `${AUTHORING_CONTENT_BASE}${encodeURIComponent(url)}`,
                  )

                  this.snackBar.openFromComponent(NotificationComponent, {
                    data: {
                      type: Notify.UPLOAD_SUCCESS,
                    },
                    duration: NOTIFICATION_TIME * 1000,
                  })
                  // this.loaderService.changeLoad.next(false)
                }
              },
              () => {
                // this.loaderService.changeLoad.next(false)
                this.snackBar.openFromComponent(NotificationComponent, {
                  data: {
                    type: Notify.UPLOAD_FAIL,
                  },
                  duration: NOTIFICATION_TIME * 1000,
                })
              },
            )
        } else {
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.INVALID_FORMAT,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
          return
        }
      }
    },
      input.click()
  }
}
