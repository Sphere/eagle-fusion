import { Component, OnInit, Input } from '@angular/core'
import * as FileSaver from 'file-saver'
@Component({
  selector: 'ws-certificate-received',
  templateUrl: './certificate-received.component.html',
  styleUrls: ['./certificate-received.component.scss'],
})
export class CertificateReceivedComponent implements OnInit {
  @Input() certificateData?: any
  constructor() { }

  ngOnInit() {
  }
  convertToJpeg(imgVal: any) {
    if (imgVal.rcCerticate) {
      const fileName = imgVal.name.replace(/\s+/g, '') + '_certificate.jpg'
      fetch(imgVal.downloadUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok')
          }
          return response.blob()
        })
        .then(blob => {
          const blobUrl = URL.createObjectURL(blob)
          const anchor = document.createElement('a')
          anchor.href = blobUrl
          anchor.download = fileName
          anchor.click()
          URL.revokeObjectURL(blobUrl)
        })
        .catch(error => {
          console.error('Image download failed:', error)
        })
    } else {
      const img = new Image()
      const url = imgVal.printUri

      img.onload = function () {
        const canvas: any = document.getElementById('certCanvas') || {}
        const ctx = canvas.getContext('2d')
        const imgWidth = img.width
        const imgHeight = img.height
        canvas.width = imgWidth
        canvas.height = imgHeight
        ctx.drawImage(img, 0, 0, imgWidth, imgHeight)
        let imgURI = canvas
          .toDataURL('image/jpeg')
        const fileName = imgVal.name.replace(/\s+/g, '') + '_certificate.jpg'

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
        FileSaver.saveAs(blob, fileName)
      }
      img.src = url
    }

  }

}
