import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, ViewChild, AfterViewInit, HostListener } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { ActivatedRoute, Router } from '@angular/router'
import { NsContent, WidgetContentService } from '@ws-widget/collection'
import { ConfigurationsService, EventService } from '@ws-widget/utils'
import { TFetchStatus } from '@ws-widget/utils/src/public-api'
import { MobileAppsService } from '../../../../../../../src/app/services/mobile-apps.service'
import { SCORMAdapterService } from './SCORMAdapter/scormAdapter'
// import { Interval, Observable, Subscription } from 'rxjs'
import { ViewerUtilService } from '../../../../../../../project/ws/viewer/src/lib/viewer-util.service'

@Component({
  selector: 'viewer-plugin-html',
  templateUrl: './html.component.html',
  styleUrls: ['./html.component.scss'],
})
export class HtmlComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {

  // private mobileOpenInNewTab!: any
  @ViewChild('iframeElem', { static: false }) iframeElem!: ElementRef<HTMLIFrameElement>
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
  urlContains = ''
  mimeType = ''

  @HostListener('window:blur', ['$event'])
  onBlur(): void {
    if (this.urlContains.includes('youtube') && this.htmlContent !== null) {
      const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?
        this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
      const batchId = this.activatedRoute.snapshot.queryParams.batchId ?
        this.activatedRoute.snapshot.queryParams.batchId : this.htmlContent.identifier
      setTimeout(() => {
        const data2 = {
          current: 10,
          max_size: 10,
          mime_type: this.mimeType,
        }
        // @ts-ignore: Object is possibly 'null'.
        this.viewerSvc.realTimeProgressUpdate(this.htmlContent.identifier, data2, collectionId, batchId)
      },         50)

      this.contentSvc.changeMessage('youtube')
    }
  }

  constructor(
    private domSanitizer: DomSanitizer,
    public mobAppSvc: MobileAppsService,
    private scormAdapterService: SCORMAdapterService,
    // private http: HttpClient,
    private router: Router,
    private configSvc: ConfigurationsService,
    private snackBar: MatSnackBar,
    private events: EventService,
    private contentSvc: WidgetContentService,
    private viewerSvc: ViewerUtilService,
    private activatedRoute: ActivatedRoute
  ) {
    (window as any).API = this.scormAdapterService
    // if (window.addEventListener) {
    window.addEventListener('message', this.receiveMessage.bind(this))
  }

  ngOnInit() {
    // this.mobAppSvc.simulateMobile()
    // if (this.htmlContent && this.htmlContent.identifier) {
    //   console.log(this.htmlContent.identifier)
    //   this.scormAdapterService.contentId = this.htmlContent.identifier
    //   // this.scormAdapterService.loadData()
    //   this.scormAdapterService.loadDataV2()
    // }

  }
  ngAfterViewInit() {
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.receiveMessage)
    // window.removeEventListener('onmessage', this.receiveMessage)
  }

  executeForms() {
    if (this.urlContains.includes('docs.google') && this.htmlContent !== null) {
      const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?
        this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
      const batchId = this.activatedRoute.snapshot.queryParams.batchId ?
        this.activatedRoute.snapshot.queryParams.batchId : this.htmlContent.identifier
      setTimeout(() => {
        const data2 = {
          current: 10,
          max_size: 10,
          mime_type: this.mimeType,
        }
        // @ts-ignore: Object is possibly 'null'.
        this.viewerSvc.realTimeProgressUpdate(this.htmlContent.identifier, data2, collectionId, batchId)
      },         50)

      this.contentSvc.changeMessage('docs.google')
    }
  }
  ngOnChanges() {
    if (this.htmlContent && this.htmlContent.identifier) {
      this.urlContains = this.htmlContent.artifactUrl
    }

    if (this.urlContains.includes('docs.google') && this.htmlContent !== null) {
      this.executeForms()
    }

    if (this.htmlContent && this.htmlContent.identifier && this.htmlContent.mimeType === 'application/vnd.ekstep.html-archive') {
      this.contentSvc.changeMessage('scorm')
      this.scormAdapterService.contentId = this.htmlContent.identifier
      // this.scormAdapterService.loadData()
      this.scormAdapterService.loadDataV2()
    }

    this.isIntranetUrl = false
    this.progress = 100
    this.pageFetchStatus = 'fetching'
    this.showIframeSupportWarning = false
    this.intranetUrlPatterns = this.configSvc.instanceConfig
      ? this.configSvc.instanceConfig.intranetIframeUrls
      : []

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
          if (this.htmlContent.mimeType === 'text/x-url') {
            const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?
              this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
            const batchId = this.activatedRoute.snapshot.queryParams.batchId ?
              this.activatedRoute.snapshot.queryParams.batchId : this.htmlContent.identifier
            const data1 = {
              current: 1,
              max_size: 1,
              mime_type: this.htmlContent.mimeType,
            }

            setTimeout(() => {
              if (this.htmlContent) {
                this.viewerSvc
                  .realTimeProgressUpdate(this.htmlContent.identifier, data1, collectionId, batchId)
                this.contentSvc.changeMessage('html')
              }
            },         50)
          }
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

      this.showIsLoadingMessage = false

      if (this.htmlContent.isIframeSupported !== 'No') {
        setTimeout(
          () => {
            if (this.pageFetchStatus === 'fetching' && !this.urlContains.includes('docs.google')) {
              this.showIsLoadingMessage = true
            }
          },
          3000,
        )
      }

      if (this.htmlContent.mimeType === 'application/vnd.ekstep.html-archive') {
        this.mimeType = this.htmlContent.mimeType
        if (this.htmlContent.status !== 'Live') {
          if (this.htmlContent && this.htmlContent.artifactUrl) {
            this.contentSvc
              .fetchHierarchyContent(this.htmlContent.identifier)
              .toPromise()
              .then((res: any) => {

                let url = res['result']['content']['streamingUrl']
                if (res['result']['content']['entryPoint']) {
                  url = url + res['result']['content']['entryPoint']

                }
                this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(url)
              })
              .catch((err: any) => {
                /* tslint:disable-next-line */
                console.log(err)
              })
          }
        } else {
          if (this.htmlContent && this.htmlContent.artifactUrl) {
            const streamingUrl = this.htmlContent.streamingUrl.substring(51)
            const entryPoint = this.htmlContent.entryPoint || ''
            const newUrl = `/apis/proxies/v8/getContents/${streamingUrl}${entryPoint}`
            this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(`${newUrl}`)
            // let artifactUrl = this.htmlContent.streamingUrl.substring(51)
            // this.viewerSvc.scormUpdate(this.htmlContent.artifactUrl).toPromise()
            //   .then((res: string) => {
            //     /* tslint:disable-next-line */
            //     console.log(res)
            //     console.log(res['result']['content']['streamingUrl'].substring(51))
            //     this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.htmlContent.artifactUrl}`)
            //   })
            //   .catch((err: any) => {
            //     /* tslint:disable-next-line */
            //     console.log(err)
            //   })
            // this.contentSvc
            //   .fetchHierarchyContent(this.htmlContent.identifier)
            //   .toPromise()
            //   .then((res: any) => {
            //     this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(`${res['result']['content']['streamingUrl']}`)
            //   })
            //   .catch((err: any) => {
            //     /* tslint:disable-next-line */
            //     console.log(err)
            //   })
          }
        }

        if (this.htmlContent.entryPoint && this.htmlContent.entryPoint.includes('lms') === false) {
          const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?
            this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
          const batchId = this.activatedRoute.snapshot.queryParams.batchId ?
            this.activatedRoute.snapshot.queryParams.batchId : this.htmlContent.identifier
          const data1 = {
            current: 1,
            max_size: 1,
            mime_type: this.mimeType,
          }

          setTimeout(() => {
            if (this.htmlContent) {
              this.viewerSvc
                .realTimeProgressUpdate(this.htmlContent.identifier, data1, collectionId, batchId)
              this.contentSvc.changeMessage('html')
            }
          },         50)
        }

      } else {
        this.mimeType = this.htmlContent.mimeType
        this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
          this.htmlContent.artifactUrl)
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
      const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?
        this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
      const batchId = this.activatedRoute.snapshot.queryParams.batchId ?
        this.activatedRoute.snapshot.queryParams.batchId : this.htmlContent.identifier
      const data1 = {
        current: 1,
        max_size: 1,
        mime_type: this.mimeType,
      }

      setTimeout(() => {
        if (this.htmlContent) {
          this.viewerSvc
            .realTimeProgressUpdate(this.htmlContent.identifier, data1, collectionId, batchId)
          this.contentSvc.changeMessage('html')
        }
      },         50)

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
