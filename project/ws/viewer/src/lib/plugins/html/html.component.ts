import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { Router } from '@angular/router'
import { NsContent } from '@ws-widget/collection'
import { ConfigurationsService, EventService } from '@ws-widget/utils'
import { TFetchStatus } from '@ws-widget/utils/src/public-api'
import { MobileAppsService } from '../../../../../../../src/app/services/mobile-apps.service'
import { SCORMAdapterService } from './SCORMAdapter/scormAdapter'

@Component({
  selector: 'viewer-plugin-html',
  templateUrl: './html.component.html',
  styleUrls: ['./html.component.scss'],
})
export class HtmlComponent implements OnInit, OnChanges, OnDestroy {

  // private mobileOpenInNewTab!: any

  @ViewChild('mobileOpenInNewTab', { read: ElementRef, static: false }) mobileOpenInNewTab !: ElementRef<HTMLAnchorElement>
  @Input() htmlContent: NsContent.IContent | null = null
  iframeUrl: SafeResourceUrl | null = null

  showIframeSupportWarning = false
  showIsLoadingMessage = false
  showUnBlockMessage = false
  pageFetchStatus: TFetchStatus | 'artifactUrlMissing' = 'fetching'
  isUserInIntranet = false
  intranetUrlPatterns: string[] | undefined = []
  isIntranetUrl = false
  progress = 100

  iframeName = `piframe_${Date.now()}`


  constructor(
    private domSanitizer: DomSanitizer,
    public mobAppSvc: MobileAppsService,
    private scormAdapterService: SCORMAdapterService,
    // private http: HttpClient,
    private router: Router,
    private configSvc: ConfigurationsService,
    private snackBar: MatSnackBar,
    private events: EventService,
  ) {
    (window as any).API = this.scormAdapterService
    // if (window.addEventListener) {
    window.addEventListener('message', this.receiveMessage.bind(this))
  }

  ngOnInit() {
    // this.mobAppSvc.simulateMobile()
    if (this.htmlContent && this.htmlContent.identifier) {
      this.scormAdapterService.contentId = this.htmlContent.identifier
      this.scormAdapterService.loadData()
    }
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.receiveMessage)
    // window.removeEventListener('onmessage', this.receiveMessage)
  }

  ngOnChanges() {
    this.isIntranetUrl = false
    this.progress = 100
    this.pageFetchStatus = 'fetching'
    this.showIframeSupportWarning = false
    this.intranetUrlPatterns = this.configSvc.instanceConfig
      ? this.configSvc.instanceConfig.intranetIframeUrls
      : []

    // //console.log(this.htmlContent)
    let iframeSupport: boolean | string | null =
      this.htmlContent && this.htmlContent.isIframeSupported
    if (this.htmlContent && this.htmlContent.artifactUrl) {
      if (this.htmlContent.artifactUrl.startsWith('http://') && this.htmlContent.isExternal) {
        this.htmlContent.isIframeSupported = 'No'
      }
      if (typeof iframeSupport !== 'boolean') {
        iframeSupport = this.htmlContent.isIframeSupported.toLowerCase()
        if (iframeSupport === 'no') {
          this.showIframeSupportWarning = true
          setTimeout(
            () => {
              this.openInNewTab()
            },
            3000,
          )
          setInterval(
            () => {
              this.progress -= 1
            },
            30,
          )
        } else if (iframeSupport === 'maybe') {
          this.showIframeSupportWarning = true
        } else {
          this.showIframeSupportWarning = false
        }
      }
      if (this.intranetUrlPatterns && this.intranetUrlPatterns.length) {
        this.intranetUrlPatterns.forEach(iup => {
          if (this.htmlContent && this.htmlContent.artifactUrl) {
            if (this.htmlContent.artifactUrl.startsWith(iup)) {
              this.isIntranetUrl = true
            }
          }
        })
      }
      // if (this.htmlContent.isInIntranet || this.isIntranetUrl) {
      //   this.checkIfIntranet().subscribe(
      //     data => {
      //       //console.log(data)
      //       this.isUserInIntranet = data ? true : false
      //       //console.log(this.isUserInIntranet)
      //     },
      //     () => {
      //       this.isUserInIntranet = false
      //       //console.log(this.isUserInIntranet)
      //     },
      //   )
      // }
      this.showIsLoadingMessage = false
      if (this.htmlContent.isIframeSupported !== 'No') {
        setTimeout(
          () => {
            if (this.pageFetchStatus === 'fetching') {
              this.showIsLoadingMessage = true
            }
          },
          3000,
        )
      }


      if (this.htmlContent.mimeType === 'application/vnd.ekstep.html-archive') {
        if (this.htmlContent.status !== 'Live') {
          this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
            `https://igot.blob.core.windows.net/content/content/html/${this.htmlContent.identifier}-latest/index.html`
          )
        } else {
          this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
            `https://igot.blob.core.windows.net/content/content/html/${this.htmlContent.identifier}-snapshot/index.html`
          )
        }
      } else {
        this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
          this.htmlContent.artifactUrl,
        )
      }


    } else if (this.htmlContent && this.htmlContent.artifactUrl === '') {
      this.iframeUrl = null
      this.pageFetchStatus = 'artifactUrlMissing'
    } else {
      this.iframeUrl = null
      this.pageFetchStatus = 'error'
    }
  }

  // backToDetailsPage() {
  //   this.router.navigate([
  //     `/app/toc/${this.htmlContent ? this.htmlContent.identifier : ''}/overview`,
  //   ])
  // }

  backToDetailsPage() {
    this.router.navigate(
      [`/app/toc/${this.htmlContent ? this.htmlContent.identifier : ''}/overview`],
      { queryParams: { primaryCategory: this.htmlContent ? this.htmlContent.primaryCategory : '' } })
  }


  raiseTelemetry(data: any) {
    if (this.htmlContent) {
      /* tslint:disable-next-line */
      console.log(this.htmlContent.identifier)
      this.events.raiseInteractTelemetry(data.event, 'scrom', {
        contentId: this.htmlContent.identifier,
        ...data,
      })
    }
  }

  receiveMessage(msg: any) {
    // /* tslint:disable-next-line */
    // console.log("msg=>", msg)
    if (msg.data) {
      this.raiseTelemetry(msg.data)
    } else {
      this.raiseTelemetry({
        event: msg.message,
        id: msg.id,
      })
    }
  }

  openInNewTab() {
    if (this.htmlContent) {
      if (this.mobAppSvc && this.mobAppSvc.isMobile) {
        // window.open(this.htmlContent.artifactUrl)
        setTimeout(
          () => {
            this.mobileOpenInNewTab.nativeElement.click()
          },
          0,
        )
      } else {
        const width = window.outerWidth
        const height = window.outerHeight
        const isWindowOpen = window.open(
          this.htmlContent.artifactUrl,
          '_blank',
          `toolbar=yes,
             scrollbars=yes,
             resizable=yes,
             menubar=no,
             location=no,
             addressbar=no,
             top=${(15 * height) / 100},
             left=${(2 * width) / 100},
             width=${(65 * width) / 100},
             height=${(70 * height) / 100}`,
        )
        if (isWindowOpen === null) {
          const msg = 'The pop up window has been blocked by your browser, please unblock to continue.'
          this.snackBar.open(msg)
        }
      }
    }
  }
  dismiss() {
    this.showIframeSupportWarning = false
    this.isIntranetUrl = false
  }

  onIframeLoadOrError(evt: 'load' | 'error', iframe?: HTMLIFrameElement, event?: any) {
    if (evt === 'error') {
      this.pageFetchStatus = evt
    }
    if (evt === 'load' && iframe && iframe.contentWindow) {
      if (event && iframe.onload) {
        iframe.onload(event)
      }
      iframe.onload = (data => {
        if (data.target) {
          this.pageFetchStatus = 'done'
          this.showIsLoadingMessage = false
        }
      })
    }
  }
}
