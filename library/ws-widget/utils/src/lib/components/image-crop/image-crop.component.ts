import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'

import { ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper'
import { ConfigurationsService } from '../../services/configurations.service'
import { ValueService } from '../../services/value.service'

@Component({
  selector: 'ws-utils-image-crop',
  templateUrl: './image-crop.component.html',
  styleUrls: ['./image-crop.component.scss'],
})
export class ImageCropComponent implements OnInit {

  @Output() data = new EventEmitter<File>()
  isRoundCrop = false
  isNotOfRequiredSize = false
  imageFile!: File
  cropimageFile!: File
  imageFileBase64: any = ''
  width: any = ''
  height: any = ''
  opHeight: any
  opWidth: any
  imageDimensions: any = ''
  croppedHeight: any = ''
  croppedWidth: any = ''
  cropperReadyToStart: any = false
  fileName = ''
  canvasRotation = 0
  transform: ImageTransform = {}
  resetValue = false
  element: any
  isXSmall = false
  isThumbnail = true

  constructor(
    private dialogRef: MatDialogRef<ImageCropComponent>,
    private configSvc: ConfigurationsService,
    private snackBar: MatSnackBar,
    private valueSvc: ValueService,
    @Inject(MAT_DIALOG_DATA) data: {
      isRoundCrop: boolean,
      imageFile: File,
      height: number,
      width: number,
      imageFileName: string
    },
  ) {
    this.isRoundCrop = data.isRoundCrop
    if (data.imageFile) {
      this.imageFile = data.imageFile
    }
    if (data.imageFileName) {
      this.fileName = data.imageFileName
    }
    if (!data.isRoundCrop) {
      if (data.height) {
        this.opHeight = data.height
      }
      if (data.width) {
        this.opWidth = data.width
      }
    }

  }

  ngOnInit() {
    this.thumbnailSizeDetection()
    this.valueSvc.isXSmall$.subscribe((isXSmall: boolean) => {
      this.isXSmall = isXSmall
      if (this.isXSmall) {
        this.dialogRef.updateSize('90%')
      } else {
        this.dialogRef.updateSize('70%')
      }
    })

  }

  // displays the default image
  changeToDefaultImg($event: any) {
    $event.target.src = this.configSvc.instanceConfig ?
      this.configSvc.instanceConfig.logos.defaultContent : ''
  }

  // image cropping event
  imageCropped(event: ImageCroppedEvent) {

    this.imageFileBase64 = event.base64 // store the cropped image as a base64 value
    this.cropimageFile = this.base64ImageToBlob(this.imageFileBase64) // convert the cropped image as a file
    this.croppedHeight = event.height
    this.croppedWidth = event.width

  }

  openSnackBar(message: string) {
    this.snackBar.open(message, undefined, {
      duration: 2000,
    })
  }
  continueToImageCrop() {
    this.isNotOfRequiredSize = false
  }

  // checks if the image is of the correct dimensions
  thumbnailSizeDetection() {
    const fr = new FileReader()
    fr.readAsDataURL(this.imageFile)
    fr.onload = () => { // when file has loaded
      const img = new Image()
      img.src = fr.result as string
      img.onload = () => {
        this.width = img.width
        this.height = img.height
        if (!this.isRoundCrop) {
          if ((this.height === this.opHeight) && (this.width === this.opWidth)) {
            this.openSnackBar('Image is of the required dimensions of the thumbnail, croping is not available!')
            return
          }
          if ((this.height < this.opHeight) || (this.width < this.opWidth)) {
            this.isNotOfRequiredSize = true
          }
        }
      }

    }

  }

  base64ImageToBlob(str: string): File {
    // extract content type and base64 payload from original string

    const pos = str.indexOf(';base64,')
    // var type = str.substring(5, pos);
    const b64 = str.substr(pos + 8)
    // decode base64
    const imageContent = atob(b64)
    // create an ArrayBuffer and a view (as unsigned 8-bit)
    const buffer = new ArrayBuffer(imageContent.length)
    const view = new Uint8Array(buffer)
    // fill the view, using the decoded base64
    for (let n = 0; n < imageContent.length; n = n + 1) {
      view[n] = imageContent.charCodeAt(n)
    }
    // convert ArrayBuffer to Blob
    const blob = new Blob([view], { type: 'image/png' })
    const b: any = blob
    // Cast to a File() type
    b.lastModifiedDate = new Date()
    b.name = this.fileName
    const file = new File([blob], this.fileName, { type: 'image/jpeg' })
    return file

  }

  private flipAfterRotate() {
    const flippedH = this.transform.flipH
    const flippedV = this.transform.flipV
    this.transform = {
      ...this.transform,
      flipH: flippedV,
      flipV: flippedH,
    }
  }

  rotateLeft() {
    this.canvasRotation = this.canvasRotation - 1
    this.flipAfterRotate()
  }

  rotateRight() {
    this.canvasRotation = this.canvasRotation + 1
    this.flipAfterRotate()
  }

  flipHorizontal() {
    this.transform = {
      ...this.transform,
      flipH: !this.transform.flipH,
    }
  }

  zoom(event: any) {
    this.resetValue = false
    this.transform = {
      ...this.transform,
      scale: event.value,
    }
  }

  // calls when apply button is clicked,and returns the cropped image
  croppingImage() {
    this.dialogRef.close(this.cropimageFile)
  }

  reset() {
    this.resetValue = true
    this.canvasRotation = 0
    this.transform = {}
  }
  // closes the dialog box
  close(): void {
    this.dialogRef.close()
  }

}
