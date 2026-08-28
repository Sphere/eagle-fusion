import { Component, Inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { WidgetContentService } from '@ws-widget/collection'
import * as FileSaver from 'file-saver'
import { DomSanitizer } from '@angular/platform-browser'
import { LoggerService } from '../../../../../../../../../library/ws-widget/utils/src/public-api'

@Component({
    standalone: false,
    selector: 'ws-app-app-toc-certificate-modal',
    templateUrl: './app-toc-certificate-modal.component.html',
    styleUrls: ['./app-toc-certificate-modal.component.scss'],

})
export class AppTocCertificateModalComponent implements OnInit, OnDestroy {
  img: any = ''
  isLoading = true
  hasError = false
  isDownloading = false
  downloadFailed = false
  private objectUrls: string[] = []
  constructor(
    public dialogRef: MatDialogRef<AppTocCertificateModalComponent>,
    @Inject(MAT_DIALOG_DATA) public content: any,
    private contentSvc: WidgetContentService,
    private sanitizer: DomSanitizer,
    private logger: LoggerService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadCertificate()
  }

  /**
   * The cert service returns 500 intermittently. Previously the promise had no catch and no
   * else, so any failure left isLoading true and the dialog sat on its shimmer forever with
   * nothing to click. Always resolve into one of three states: preview, error, or closed.
   */
  loadCertificate() {
    this.releaseObjectUrls()
    this.isLoading = true
    this.hasError = false
    this.cdr.detectChanges()

    this.contentSvc.downloadCertificateAPI(this.content.content).toPromise()
      .then((response: any) => {
        const url = response && response.result ? response.result.printUri : ''
        if (!url) {
          // A 200 with no printUri is just as unusable as a 500 — treat it the same.
          throw new Error('Certificate response carried no printUri')
        }
        const src = this.toImageSource(url)
        if (!src) {
          throw new Error('Certificate printUri was not a usable image source')
        }
        this.img = this.sanitizer.bypassSecurityTrustUrl(src)
        this.isLoading = false
      })
      .catch((err: any) => {
        this.logger.error('Certificate preview failed', err)
        this.isLoading = false
        this.hasError = true
      })
      .then(() => this.cdr.detectChanges())
  }

  retry() {
    this.loadCertificate()
  }
  downloadCertificate(content: any) {
    if (this.isDownloading) {
      return
    }
    this.isDownloading = true
    this.downloadFailed = false
    this.cdr.detectChanges()

    this.contentSvc.downloadCertificateAPI(content.content).toPromise()
      .then((response: any) => {
        const url = response && response.result ? response.result.printUri : ''
        if (!url) {
          throw new Error('Certificate response carried no printUri')
        }
        this.logger.log('response', response.result)
        return this.renderAndSave(url)
      })
      .catch((err: any) => {
        this.logger.error('Certificate download failed', err)
        this.downloadFailed = true
      })
      .then(() => {
        this.isDownloading = false
        this.cdr.detectChanges()
      })
  }

  /**
   * Draws the certificate onto the canvas and saves it. Wrapped in a promise so a broken
   * image URL rejects instead of silently doing nothing — img.onerror was unhandled before.
   */
  private renderAndSave(url: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const self = this
      const img = new Image()
      const fileName = this.certificateFileName()
      const that = this
      const src = this.toImageSource(url)
      if (!src) {
        reject(new Error('Certificate printUri was not a usable image source'))
        return
      }
      img.onerror = () => reject(new Error('Certificate image failed to load'))
      img.onload = function () {
        try {
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
          FileSaver.saveAs(blob, fileName)
          if (localStorage.getItem(`certificate_downloaded_${self.content ? self.content.identifier : ''}`)) {
            localStorage.removeItem(`certificate_downloaded_${self.content ? self.content.identifier : ''}`)
          }
          resolve()
        } catch (e) {
          // Canvas/blob work can throw (tainted canvas, missing element) — surface it as a
          // rejection so the caller shows the failure instead of appearing to succeed.
          reject(e)
        }
      }
      img.src = src
    })
  }


  ngOnDestroy() {
    this.releaseObjectUrls()
  }

  /**
   * Turns whatever certreg put in `result.printUri` into something an <img> can actually load.
   *
   * The service returns the certificate as **raw SVG markup** ("<svg width=...>"), not a URL.
   * Assigning that straight to img.src made the browser resolve ~1.9MB of markup as a relative
   * path, and the request died at the first "#" — the certificate's own `fill="url(#gradient)"`
   * reference, which starts a URL fragment. Result: a request to
   * `/%3Csvg%20width=...fill=%22url(` blocked by the browser, and a broken-image icon in the
   * preview and an unusable download.
   *
   * Wrap the markup in an object URL rather than a `data:` URI: at this size percent-encoding
   * would balloon the string to several megabytes in the DOM, and a blob is same-origin so the
   * canvas that downloadCertificate() draws into stays untainted.
   *
   * URLs and data URIs are passed through untouched, so this keeps working if the service is
   * ever changed to return one.
   */
  private toImageSource(printUri: string): string {
    const value = (printUri || '').trim()
    if (!value) {
      return ''
    }
    if (/^(?:data:|blob:|https?:|\/)/i.test(value)) {
      return value
    }
    if (value.startsWith('<svg') || value.startsWith('<?xml')) {
      const objectUrl = URL.createObjectURL(new Blob([value], { type: 'image/svg+xml' }))
      this.objectUrls.push(objectUrl)
      return objectUrl
    }
    return value
  }

  private releaseObjectUrls(): void {
    this.objectUrls.forEach(objectUrl => URL.revokeObjectURL(objectUrl))
    this.objectUrls = []
  }

  /**
   * The saved file previously had no extension at all (the bare course name), so the download
   * landed as an extensionless blob the OS could not open. Course names also carry characters
   * Windows rejects in a filename, such as "/" and ":".
   */
  private certificateFileName(): string {
    const base = (this.content && this.content.tocConfig ? String(this.content.tocConfig) : 'certificate')
      .replace(/[\\/:*?"<>|]+/g, '-')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120) || 'certificate'
    return /\.jpe?g$/i.test(base) ? base : `${base}.jpg`
  }
}
