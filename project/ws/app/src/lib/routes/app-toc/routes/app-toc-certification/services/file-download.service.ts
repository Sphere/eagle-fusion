import { Injectable, Inject } from '@angular/core'
import { Observable, of, throwError } from 'rxjs'
import { WINDOW } from './window.service'
import { DOCUMENT } from '@angular/common'

@Injectable()
export class FileDownloadService {
  constructor(
    @Inject(WINDOW) private window: Window,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  base64ToBlob(base64String: string): Blob | null {
    try {
      const byteString = this.window.atob(base64String)
      const arrayBuffer: ArrayBuffer = new ArrayBuffer(byteString.length)
      const int8Array: Uint8Array = new Uint8Array(arrayBuffer)

      for (let i = 0; i < byteString.length; i += 1) {
        int8Array[i] = byteString.charCodeAt(i)
      }

      const blob = new Blob([int8Array])

      return blob
    } catch (e) {
      return null
    }
  }

  saveBlobToDevice(blob: Blob, documentName: string): boolean {
    try {
      // IE Download
      if (this.window.navigator && this.window.navigator.msSaveOrOpenBlob) {
        this.window.navigator.msSaveOrOpenBlob(blob, documentName)
        return true
      }

      // For other browsers
      const file: File = new File([blob], documentName)

      const downloadLink = this.document.createElement('a')
      downloadLink.style.display = 'none'
      this.document.body.appendChild(downloadLink)
      downloadLink.setAttribute('href', this.window.URL.createObjectURL(file))
      downloadLink.setAttribute('download', documentName)
      downloadLink.click()
      this.document.body.removeChild(downloadLink)

      return true
    } catch (e) {
      return false
    }
  }

  saveFile(base64String: string, documentName: string): Observable<any> {
    const blob = this.base64ToBlob(base64String)

    if (!blob) {
      return throwError({})
    }

    return this.saveBlobToDevice(blob, documentName) ? of({}) : throwError({})
  }
}
