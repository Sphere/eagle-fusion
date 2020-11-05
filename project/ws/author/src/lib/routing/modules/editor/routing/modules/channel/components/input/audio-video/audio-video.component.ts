import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { IWidgetsPlayerMediaData, NsContent } from '@ws-widget/collection'
import {
  AUTHORING_CONTENT_BASE,
  CONTENT_BASE_WEBHOST_ASSETS,
} from '@ws/author/src/lib/constants/apiEndpoints'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { IMAGE_MAX_SIZE, VIDEO_MAX_SIZE } from '@ws/author/src/lib/constants/upload'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { UploadService } from '@ws/author/src/lib/routing/modules/editor/shared/services/upload.service'
import { AuthInitService } from '@ws/author/src/lib/services/init.service'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'

interface ISubtitle {
  srclang: string
  label: string
}

@Component({
  selector: 'ws-auth-audio-video',
  templateUrl: './audio-video.component.html',
  styleUrls: ['./audio-video.component.scss'],
})
export class AudioVideoComponent implements OnChanges, OnInit {
  @Input() isSubmitPressed = false
  @Input() content!: IWidgetsPlayerMediaData
  @Output() data = new EventEmitter<{ content: IWidgetsPlayerMediaData; isValid: boolean }>()
  selectedSubtitle: ISubtitle = {} as any
  subTitles!: ISubtitle
  @Input() isVideo = false
  @Input() identifier = ''
  @Input() inputType!: 'upload' | 'id'
  backUpType: 'upload' | 'id' = 'upload'

  pickerContentData = {
    preselected: new Set(),
    enablePreselected: true,
    availableFilters: ['contentType'],
  }
  contentId: string[] = []
  filters = {
    mimeType: ['video/mp4', 'application/x-mpegURL'],
    contentType: ['Resource'],
  }
  constructor(
    private snackBar: MatSnackBar,
    private uploadService: UploadService,
    private authInitService: AuthInitService,
    private loader: LoaderService,
  ) {}

  ngOnInit() {}

  ngOnChanges() {
    this.initData()
  }
  initData() {
    if (this.content.identifier && this.inputType === 'id') {
      this.contentId = [this.content.identifier]
      this.pickerContentData = {
        preselected: new Set([this.content.identifier]),
        enablePreselected: true,
        availableFilters: ['contentType'],
      }
    } else if (!this.content.identifier && this.inputType === 'upload') {
      this.content.identifier = ''
      this.contentId = []
      this.pickerContentData = {
        preselected: new Set(),
        enablePreselected: true,
        availableFilters: ['contentType'],
      }
    }
    if (!this.content.subtitles) {
      this.content.subtitles = []
    }
    this.subTitles = this.authInitService.ordinals.subTitles

    this.data.emit({
      content: this.content,
      isValid: this.content.url ? true : false,
    })
    // if (this.content.url && !this.content.identifier) {
    //   this.inputType = 'upload'
    // } else if (this.content.identifier) {
    //   this.inputType = 'id'
    // }
    // this.backUpType = this.inputType
    // if (this.content.identifier) {
    //   this.contentId = [this.content.identifier]
    // }
  }

  update(key: string, value: any) {
    this.content[key as keyof IWidgetsPlayerMediaData] = value
    this.data.emit({
      content: this.content,
      isValid: this.content.url ? true : false,
    })
  }

  removeSubtitle(index: number) {
    // tslint:disable-next-line: semicolon
    ; (this.content.subtitles || []).splice(index, 1)
    this.update('subtitles', this.content.subtitles)
  }

  upload(file: File, type: 'video' | 'image' | 'subtitle' | 'audio') {
    const formdata = new FormData()
    const fileName = file.name.replace(/[^A-Za-z0-9.]/g, '')
    if (
      (!fileName.toLowerCase().endsWith('.mp4') && type === 'video') ||
      (!(file.type.indexOf('image/') > -1) && type === 'image') ||
      (!fileName.toLowerCase().endsWith('.vtt') && type === 'subtitle') ||
      (!fileName.toLowerCase().endsWith('.mp3') && type === 'audio')
    ) {
      this.selectedSubtitle = undefined as any
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.INVALID_FORMAT,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
      return
    }

    if (
      (file.type.indexOf('image/') > -1 && file.size > IMAGE_MAX_SIZE) ||
      (fileName.toLowerCase().endsWith('.mp3') && file.size > VIDEO_MAX_SIZE) ||
      (fileName.toLowerCase().endsWith('.mp4') && file.size > VIDEO_MAX_SIZE)
    ) {
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
      .upload(
        formdata,
        // tslint:disable-next-line:align
        { contentId: this.identifier, contentType: CONTENT_BASE_WEBHOST_ASSETS },
      )
      .subscribe(
        data => {
          if (data.code) {
            this.loader.changeLoad.next(false)
            const url = `${AUTHORING_CONTENT_BASE}${encodeURIComponent(
              `/${(data.artifactURL || data.authArtifactUrl || data.authArtifactURL || '')
                .split('/')
                .slice(3)
                .join('/')}`,
            )}`
            if (type === 'image') {
              this.update('posterImage', url)
            } else if (type === 'video' || type === 'audio') {
              this.update('url', url)
            } else {
              // tslint:disable-next-line: semicolon
              ; (this.content.subtitles || []).push({
                url,
                srclang: this.selectedSubtitle.srclang,
                label: this.selectedSubtitle.label,
              })
              this.subTitles = this.authInitService.ordinals.subTitles.filter(
                (v: ISubtitle) =>
                  !(this.content.subtitles || []).find((j: ISubtitle) => j.srclang === v.srclang),
              )
              this.subTitles = this.selectedSubtitle = undefined as any
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

  onContentSelection(
    event?: { content: Partial<NsContent.IContent>; checked: boolean },
    ids?: string[],
  ) {
    if (event && event.checked) {
      this.pickerContentData = {
        preselected: new Set([event.content.identifier]),
        enablePreselected: true,
        availableFilters: ['contentType'],
      }
      this.content.identifier = event.content.identifier || ''
    } else {
      this.pickerContentData = {
        preselected: new Set(ids && ids.length >= 1 ? [ids[0]] : []),
        enablePreselected: true,
        availableFilters: ['contentType'],
      }
      this.content.identifier = ids && ids.length >= 1 ? ids[0] : ''
    }
    this.contentId = this.content.identifier ? [this.content.identifier] : []
  }
}
