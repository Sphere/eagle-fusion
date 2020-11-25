import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { ValueService } from '@ws-widget/utils/src/public-api'
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  TemplateRef,
} from '@angular/core'
import { FormBuilder, FormGroup } from '@angular/forms'
import { MatSnackBar } from '@angular/material'
import { MatDialog } from '@angular/material/dialog'
import {
  CONTENT_BASE_STATIC,
  CONTENT_BASE_STREAM,
  CONTENT_BASE_WEBHOST,
} from '@ws/author/src/lib/constants/apiEndpoints'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { VIDEO_MAX_SIZE } from '@ws/author/src/lib/constants/upload'
import { NSContent } from '@ws/author/src/lib/interface/content'
import { IprDialogComponent } from '@ws/author/src/lib/modules/shared/components/ipr-dialog/ipr-dialog.component'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { EditorContentService } from '@ws/author/src/lib/routing/modules/editor/services/editor-content.service'
import { UploadService } from '@ws/author/src/lib/routing/modules/editor/shared/services/upload.service'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { of } from 'rxjs'
import { ConfirmDialogComponent } from '@ws/author/src/lib/modules/shared/components/confirm-dialog/confirm-dialog.component'
import { mergeMap, tap } from 'rxjs/operators'
import { IFormMeta } from './../../../../../../../../interface/form'
import { AuthInitService } from './../../../../../../../../services/init.service'

@Component({
  selector: 'ws-auth-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent implements OnInit {
  @ViewChild('guideline', { static: false }) guideline!: TemplateRef<HTMLElement>
  @ViewChild('errorFile', { static: false }) errorFile!: TemplateRef<HTMLElement>
  @ViewChild('selectFile', { static: false }) selectFile!: TemplateRef<HTMLElement>
  fileUploadForm!: FormGroup
  iprAccepted = false
  file!: File | null
  mimeType = ''
  currentContent = ''
  enableUpload = true
  duration = 0
  canUpdate = true
  fileUploadCondition = {
    fileName: false,
    eval: false,
    externalReference: false,
    iframe: false,
    isSubmitPressed: false,
    preview: false,
    url: '',
  }
  errorFileList: string[] = []
  fileList: string[] = []
  @Input() isCollectionEditor = false
  @Input() isSubmitPressed = false
  @Input() canTransCode = false
  isMobile = false
  @Output() data = new EventEmitter<any>()

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private contentService: EditorContentService,
    private uploadService: UploadService,
    private loaderService: LoaderService,
    private authInitService: AuthInitService,
    private valueSvc: ValueService,
    private accessService: AccessControlService,
  ) { }

  ngOnInit() {
    this.valueSvc.isXSmall$.subscribe(isMobile => (this.isMobile = isMobile))
    this.currentContent = this.contentService.currentContent
    this.triggerDataChange()
    this.contentService.changeActiveCont.subscribe(data => {
      this.currentContent = data
      this.triggerDataChange()
    })
  }

  triggerDataChange() {
    const updatedMeta = this.contentService.getUpdatedMeta(this.currentContent)
    if (
      !this.isCollectionEditor ||
      (this.isCollectionEditor && updatedMeta.category === 'Resource')
    ) {
      this.assignData(updatedMeta)
    }
  }

  assignData(meta: NSContent.IContentMeta) {
    if (!this.fileUploadForm) {
      this.createForm()
    }
    this.canUpdate = false
    this.fileUploadForm.controls.artifactUrl.setValue(meta.artifactUrl || '')
    this.fileUploadForm.controls.mimeType.setValue(meta.mimeType || 'application/pdf')
    this.fileUploadForm.controls.isIframeSupported.setValue(meta.isIframeSupported || 'Yes')
    this.fileUploadForm.controls.isInIntranet.setValue(meta.isInIntranet || false)
    this.fileUploadForm.controls.isExternal.setValue(meta.isExternal || false)
    this.fileUploadForm.controls.size.setValue(meta.size || 0)
    this.fileUploadForm.controls.duration.setValue(meta.duration || 0)
    this.canUpdate = true
    this.fileUploadForm.markAsPristine()
    this.fileUploadForm.markAsUntouched()
    if (meta.artifactUrl) {
      this.iprAccepted = true
    }
  }

  createForm() {
    this.fileUploadForm = this.formBuilder.group({
      artifactUrl: [],
      isExternal: [],
      isIframeSupported: [],
      isInIntranet: [],
      mimeType: [],
      size: [],
      duration: [],
      downloadUrl: [],
      transcoding: [],
    })
    this.fileUploadForm.valueChanges.subscribe(() => {
      if (this.canUpdate) {
        this.storeData()
      }
    })
    this.fileUploadForm.controls.artifactUrl.valueChanges.subscribe(() => {
      this.iprAccepted = false
    })
  }

  onDrop(file: File) {
    this.fileUploadCondition = {
      fileName: false,
      eval: false,
      externalReference: false,
      iframe: false,
      isSubmitPressed: false,
      preview: false,
      url: '',
    }
    const fileName = file.name.replace(/[^A-Za-z0-9_.]/g, '')
    if (
      !fileName.toLowerCase().endsWith('.pdf') &&
      !fileName.toLowerCase().endsWith('.zip') &&
      !fileName.toLowerCase().endsWith('.mp4') &&
      !fileName.toLowerCase().endsWith('.m4v') &&
      !fileName.toLowerCase().endsWith('.mp3')
    ) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.INVALID_FORMAT,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
    } else if (file.size > VIDEO_MAX_SIZE) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.SIZE_ERROR,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
    } else {
      if (fileName.toLowerCase().endsWith('.mp4')) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          width: this.isMobile ? '90vw' : '600px',
          height: 'auto',
          data: 'transcodeMessage',
        })
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.assignFileValues(file, fileName)
          }
        })
      } else if (fileName.toLowerCase().endsWith('.zip')) {
        const dialogRef = this.dialog.open(this.guideline, {
          width: this.isMobile ? '90vw' : '600px',
          height: 'auto',
        })
        dialogRef.afterClosed().subscribe(_ => {
          if (
            this.fileUploadCondition.fileName &&
            this.fileUploadCondition.iframe &&
            this.fileUploadCondition.eval &&
            this.fileUploadCondition.preview &&
            this.fileUploadCondition.externalReference
          ) {
            this.assignFileValues(file, fileName)
          }
        })
      } else {
        this.assignFileValues(file, fileName)
      }
    }
  }

  assignFileValues(file: File, fileName: string) {
    this.file = file
    this.mimeType = fileName.toLowerCase().endsWith('.pdf')
      ? 'application/pdf'
      : (fileName.toLowerCase().endsWith('.mp4') ||fileName.toLowerCase().endsWith('.m4v'))
        ? 'application/x-mpegURL'
        : fileName.toLowerCase().endsWith('.zip')
          ? 'application/html'
          : 'audio/mpeg'
    if (this.mimeType === 'application/x-mpegURL' || this.mimeType === 'audio/mpeg') {
      this.getDuration()
    } else if (this.mimeType === 'application/html') {
      this.extractFile()
    }
  }

  showIpr() {
    const dialogRef = this.dialog.open(IprDialogComponent, {
      width: '70%',
      data: { iprAccept: this.iprAccepted },
    })
    dialogRef.afterClosed().subscribe(result => {
      this.iprAccepted = result
    })
  }

  iprChecked() {
    this.iprAccepted = !this.iprAccepted
  }

  clearUploadedFile() {
    this.fileUploadForm.controls.artifactUrl.setValue(null)
    this.file = null
    this.duration = 0
    this.mimeType = ''
  }

  triggerUpload() {
    if (!this.file) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.UPLOAD_FILE,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
    } else if (!this.iprAccepted) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.IPR_DECLARATION,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
    } else {
      this.upload()
    }
  }

  upload() {
    const formdata = new FormData()
    formdata.append(
      'content',
      this.file as Blob,
      (this.file as File).name.replace(/[^A-Za-z0-9_.]/g, ''),
    )
    this.loaderService.changeLoad.next(true)
    this.uploadService
      .upload(
        formdata,
        {
          contentId: this.currentContent,
          contentType:
            this.mimeType === 'application/pdf'
              ? CONTENT_BASE_STATIC
              : this.mimeType === 'application/html'
                ? CONTENT_BASE_WEBHOST
                : CONTENT_BASE_STREAM,
        },
        undefined,
        this.mimeType === 'application/html',
      )
      .pipe(
        tap(v => {
          this.canUpdate = false
          let url = ''
          if (this.mimeType === 'application/html') {
            // tslint:disable-next-line:max-line-length
            url = `${document.location.origin}/content-store/${this.accessService.rootOrg}/${this.accessService.org}/Public/${this.currentContent}/web-hosted/${this.fileUploadCondition.url}`
          } else {
            url = (v.authArtifactURL || v.artifactURL).replace(/%2F/g, '/')
          }
          this.fileUploadForm.controls.artifactUrl.setValue(url)
          this.fileUploadForm.controls.downloadUrl.setValue(v ? v.downloadURL : '')
          this.fileUploadForm.controls.mimeType.setValue(this.mimeType)
          // if (this.mimeType === 'application/x-mpegURL') {
          //   this.fileUploadForm.controls.transcoding.setValue({
          //     lastTranscodedOn: null,
          //     retryCount: 0,
          //     status: 'STARTED',
          //   })
          // }
          this.fileUploadForm.controls.duration.setValue(this.duration)
          this.fileUploadForm.controls.size.setValue((this.file as File).size)
          this.canUpdate = true
        }),
        mergeMap(v => {
          // if (this.mimeType === 'application/x-mpegURL') {
          //   return this.uploadService
          //     .startEncoding(v.authArtifactURL || v.artifactURL, this.currentContent)
          //     .pipe(map(() => v))
          // }
          return of(v)
        }),
      )
      .subscribe(
        _ => {
          this.loaderService.changeLoad.next(false)
          this.storeData()
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.UPLOAD_SUCCESS,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
          this.data.emit('saveAndNext')
        },
        () => {
          this.loaderService.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.UPLOAD_FAIL,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
        },
      )
  }

  storeData() {
    const originalMeta = this.contentService.getOriginalMeta(this.currentContent)
    const currentMeta = this.fileUploadForm.value
    const meta: any = {}
    Object.keys(currentMeta).map(v => {
      if (
        JSON.stringify(currentMeta[v as keyof NSContent.IContentMeta]) !==
        JSON.stringify(originalMeta[v as keyof NSContent.IContentMeta])
      ) {
        if (
          currentMeta[v] ||
          (this.authInitService.authConfig[v as keyof IFormMeta].type === 'boolean' &&
            currentMeta[v] === false)
        ) {
          meta[v] = currentMeta[v]
        } else {
          meta[v] = JSON.parse(
            JSON.stringify(
              this.authInitService.authConfig[v as keyof IFormMeta].defaultValue[
                originalMeta.contentType
                // tslint:disable-next-line: ter-computed-property-spacing
              ][0].value,
            ),
          )
        }
      }
    })
    this.contentService.setUpdatedMeta(meta, this.currentContent)
  }

  getDuration() {
    const content = document.createElement(
      this.mimeType === 'application/x-mpegURL' ? 'video' : 'audio',
    )
    content.preload = 'metadata'
    this.enableUpload = false
    content.onloadedmetadata = () => {
      window.URL.revokeObjectURL(content.src)
      this.duration = Math.round(content.duration)
      this.enableUpload = true
    }
    content.src = URL.createObjectURL(this.file)
  }

  extractFile() {
    this.errorFileList = []
    this.fileList = []
    zip.useWebWorkers = false
    zip.createReader(new zip.BlobReader(this.file as File), (reader: zip.ZipReader) => {
      reader.getEntries((entry: zip.Entry[]) => {
        entry.forEach(element => {
          if (element.filename.match(/[^A-Za-z0-9_.\-\/]/g)) {
            this.errorFileList.push(element.filename)
          } else if (!element.directory) {
            this.fileList.push(element.filename)
          }
        })
        this.processAndShowResult()
      })
    })
  }

  closeDialog() {
    this.dialog.closeAll()
  }

  processAndShowResult() {
    if (this.errorFileList.length) {
      this.file = null
      this.dialog.open(this.errorFile, {
        width: this.isMobile ? '90vw' : '600px',
        height: 'auto',
      })
      setTimeout(() => {
        const error = document.getElementById('errorFiles')
        if (error) {
          for (let i = 0; i < error.children.length; i += 1) {
            error.children[i].innerHTML = error.children[i].innerHTML.replace(
              /[^A-Za-z0-9./]/g,
              match => {
                return `<i style=background-color:red;font-weight:bold>${match}</i>`
              },
            )
          }
        }
      })
    } else {
      this.dialog.open(this.selectFile, {
        width: this.isMobile ? '90vw' : '600px',
        height: 'auto',
      })
    }
  }
}
