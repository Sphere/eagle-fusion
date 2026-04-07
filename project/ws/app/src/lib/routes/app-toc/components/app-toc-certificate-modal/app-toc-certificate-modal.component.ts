import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { WidgetContentService } from '@ws-widget/collection'
import * as FileSaver from 'file-saver'
import { DomSanitizer } from '@angular/platform-browser'
import { LoggerService } from '../../../../../../../../../library/ws-widget/utils/src/public-api'

@Component({
  selector: 'ws-app-app-toc-certificate-modal',
  templateUrl: './app-toc-certificate-modal.component.html',
  styleUrls: ['./app-toc-certificate-modal.component.scss'],
})
export class AppTocCertificateModalComponent implements OnInit {
  img: any = ''
  isLoading = true
  constructor(
    public dialogRef: MatDialogRef<AppTocCertificateModalComponent>,
    @Inject(MAT_DIALOG_DATA) public content: any,
    private contentSvc: WidgetContentService,
    private sanitizer: DomSanitizer,
    private logger: LoggerService
  ) { }

  ngOnInit() {
    this.logger.log(this.content)
    this.contentSvc.downloadCertificateAPI(this.content.content).toPromise().then(async (response: any) => {
      if (response.responseCode) {
        const url = await response.result.printUri
        this.img = this.sanitizer.bypassSecurityTrustUrl(url)
        this.isLoading = false
      }
    })
  }
  downloadCertificate(content: any) {
    const self = this
    this.contentSvc.downloadCertificateAPI(content.content).toPromise().then(async (response: any) => {
      if (response.responseCode) {
        const img = new Image()
        const name = this.content.tocConfig
        const url = await response.result.printUri
        this.logger.log("response", response.result)
        this.isLoading = false
        const that = this
        img.onload = function () {
          const defaultWidth = 1350
          const defaultHeight = 880
          const canvas: any = document.getElementById('certCanvas') || {}
          const ctx = canvas.getContext('2d')
          that.logger.log("img.width", img.width)
          const imgWidth = img.width
          const imgHeight = img.height

          if (imgWidth < 1000 && imgHeight < 600) {
            canvas.width = defaultWidth
            canvas.height = defaultHeight
            ctx.drawImage(img, 0, 0, defaultWidth, defaultHeight)
          } else {
            canvas.width = imgWidth
            canvas.height = imgHeight
            ctx.drawImage(img, 0, 0, imgWidth, imgHeight)
          }
          let imgURI = canvas
            .toDataURL('image/jpeg')
          that.logger.log("imgWidth", canvas.width, "imgHeight", canvas.height)

          imgURI = decodeURIComponent(imgURI.replace('data:image/jpeg,', ''))
          const arr = imgURI.split(',')
          const mime = arr[0].match(/:(.*?);/)[1]
          const bstr = atob(arr[1])
          let n = bstr.length
          const u8arr = new Uint8Array(n)
          while (n) {
            n = n - 1
            u8arr[n] = bstr.charCodeAt(n)
          }
          const blob = new Blob([u8arr], { type: mime })
          FileSaver.saveAs(blob, `${name}`)
          if (localStorage.getItem(`certificate_downloaded_${self.content ? self.content.identifier : ''}`)) {
            localStorage.removeItem(`certificate_downloaded_${self.content ? self.content.identifier : ''}`)
          }
        }
        img.src = url
      }
    })
  }

}
