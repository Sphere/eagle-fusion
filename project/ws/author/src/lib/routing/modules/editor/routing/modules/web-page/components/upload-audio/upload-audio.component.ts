import { Component, OnInit, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material'
import { CONTENT_BASE_WEBHOST_ASSETS } from '@ws/author/src/lib/constants/apiEndpoints'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { UploadService } from '@ws/author/src/lib/routing/modules/editor/shared/services/upload.service'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'
// import { AuthInitService } from '../../../../../../../../services/init.service'
import { IAudioObj } from '../../interface/page-interface'

export interface IUsersData {
  name?: string
  id: string
  srclang: string
  languages: any[]
}
@Component({
  selector: 'ws-auth-upload-audio',
  templateUrl: './upload-audio.component.html',
  styleUrls: ['./upload-audio.component.scss'],
})

export class UploadAudioComponent implements OnInit {

  fileSelected = null
  uploadedAudio: IAudioObj = {
    title: '',
    URL: '',
    label: '',
    srclang: '',
  }
  allLanguages: any[] = []
  file?: File
  isUploading = false
  // duration = 0

  constructor(
    private snackBar: MatSnackBar,
    private uploadService: UploadService,
    private loaderService: LoaderService,
    @Inject(MAT_DIALOG_DATA) public data: IUsersData,
    public dialogRef: MatDialogRef<UploadAudioComponent>,
  ) {
    this.uploadedAudio.srclang = this.data.srclang
  }

  ngOnInit() {
    this.allLanguages = this.data.languages
  }

  onDrop(file: any) {
    const fileName = file.name.replace(/[^A-Za-z0-9.]/g, '')
    if (!fileName.toLowerCase().endsWith('.mp3')) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.INVALID_FORMAT,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
    } else {
      this.file = file
      // this.getDuration()
      this.upload()
    }
  }

  // getDuration() {
  //   const content = document.createElement('audio')
  //   content.preload = 'metadata'
  //   // this.enableUpload = false
  //   content.onloadedmetadata = () => {
  //     window.URL.revokeObjectURL(content.src)
  //     this.duration = Math.round(content.duration)
  //     // console.log(this.duration)
  //     //      this.enableUpload = true
  //   }
  //   content.src = URL.createObjectURL(this.file)
  // }

  upload() {
    const formdata = new FormData()
    formdata.append(
      'content',
      this.file as Blob,
      (this.file as File).name.replace(/[^A-Za-z0-9.]/g, ''),
    )
    this.loaderService.changeLoad.next(true)
    this.isUploading = true
    this.uploadService
      .upload(
        formdata, {
          contentId: this.data.id,
          contentType: CONTENT_BASE_WEBHOST_ASSETS,
        })
      .subscribe(
        v => {
          if (v.code) {
            this.isUploading = false
            this.loaderService.changeLoad.next(false)
            this.snackBar.openFromComponent(NotificationComponent, {
              data: {
                type: Notify.UPLOAD_SUCCESS,
              },
              duration: NOTIFICATION_TIME * 1000,
            })
            this.uploadedAudio.title = v.artifactURL.slice(v.artifactURL.lastIndexOf('/') + 1, v.artifactURL.length)
            this.uploadedAudio.label = this.allLanguages.filter(e => e.srclang === this.uploadedAudio.srclang)[0].label
            const splitUrl = (v.artifactURL || v.authArtifactUrl).split('/')
            const hostURL = `${splitUrl[0]}//${splitUrl[2]}`
            this.uploadedAudio.URL = (v.artifactURL || v.authArtifactUrl).replace(hostURL, '')
            this.dialogRef.close(this.uploadedAudio)
          }
        },
        () => {
          this.isUploading = false
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

}
