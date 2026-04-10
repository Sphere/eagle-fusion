import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, ViewChild, AfterViewInit, HostListener } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { ActivatedRoute, Router } from '@angular/router'
import { NsContent, WidgetContentService } from '@ws-widget/collection'
import { ConfigurationsService, EventService, LoggerService, TelemetryService } from '@ws-widget/utils'
import { TFetchStatus } from '@ws-widget/utils/src/public-api'
import { MobileAppsService } from '../../../../../../../src/app/services/mobile-apps.service'
import { SCORMAdapterService } from './SCORMAdapter/scormAdapter'
import { take } from 'rxjs/operators'
import { ViewerUtilService } from '../../../../../../../project/ws/viewer/src/lib/viewer-util.service'
import { Subscription } from 'rxjs'
@Component({
    standalone: false,
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
  contentData: any
  ent = false
  scormInitializedIds = new Set<string>()
  currentProcessingContentId: string | null = null
  contentHistorySubscription: Subscription | null = null
  @HostListener('window:blur', [])
  onBlur(): void {
    if (this.urlContains.includes('youtube') && this.htmlContent !== null) {
      const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?
        this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
      const batchId = this.activatedRoute.snapshot.queryParams.batchId ?
        this.activatedRoute.snapshot.queryParams.batchId : this.htmlContent.identifier

      this.telemetrySvc.start('youtube', 'youtube-start', 'player')

      setTimeout(() => {
        const completionPercentage = 100
        const data2 = {
          current: 10,
          max_size: 10,
          mime_type: this.mimeType,
          completionPercentage: completionPercentage,
          status: 2,
        }
        // @ts-ignore: Object is possibly 'null'.
        this.viewerSvc.realTimeProgressUpdateV3(this.htmlContent.identifier, data2, collectionId, batchId).subscribe(
          () => { /* success - fire and forget */ },
          error => { this.logger.warn('Progress update failed:', error) }
        )
        // Pre-calculate telemetry and send message without waiting for API response
        const telemetryData = {
          contentId: this.htmlContent?.identifier,
          completionPercentage: completionPercentage,
          status: 2,
          mimeType: 'youtube',
          batchId: batchId,
        }
        this.viewerSvc.generateInteractTelemetry('progress-update-success', telemetryData)
        const result = { contentId: this.htmlContent?.identifier, ...data2, type: 'youtube' }
        this.contentSvc.changeMessage(result)
      }, 50)
      const courseID = this.activatedRoute.snapshot.queryParams.collectionId ?
        this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
      if (this.htmlContent) {
        const data1: any = {
          "id": this.htmlContent.identifier,
          "type": "youtube",
          "version": "",
          "rollup": {
            "l1": collectionId || courseID,
            "l2": this.htmlContent.identifier,
          },
        }
        const extras: any = {
          values: [{
            courseID: courseID,
            contentId: this.htmlContent.identifier,
            name: this.htmlContent.name,
            moduleId: this.getModuleId(courseID, this.htmlContent.parent),
          }],
        }
        this.telemetrySvc.end('youtube', 'youtube-close', 'player', data1, extras)
      }
      // this.contentSvc.changeMessage('youtube')
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
    private activatedRoute: ActivatedRoute,
    private telemetrySvc: TelemetryService,
    private logger: LoggerService
  ) {
    (window as any).API = this.scormAdapterService
    // if (window.addEventListener) {
    window.addEventListener('message', this.receiveMessage.bind(this))
  }

  ngOnInit() {
    // this.mobAppSvc.simulateMobile()
    // if (this.htmlContent && this.htmlContent.identifier) {
    //   this.logger.log(this.htmlContent.identifier)
    //   this.scormAdapterService.contentId = this.htmlContent.identifier
    //   // this.scormAdapterService.loadData()
    //   this.scormAdapterService.loadDataV2()
    // }

  }
  ngAfterViewInit() {

    this.scormAdapterService.contentId = this.htmlContent!.identifier
    this.scormAdapterService.htmlName = this.htmlContent!.name
    this.scormAdapterService.parent = this.htmlContent!.parent ? this.htmlContent!.parent : undefined
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.receiveMessage)
    // Cleanup tracking and subscriptions
    if (this.contentHistorySubscription) {
      this.contentHistorySubscription.unsubscribe()
    }
    this.scormInitializedIds.clear()
    this.currentProcessingContentId = null
  }

  executeForms() {
    if (this.urlContains.includes('docs.google') && this.htmlContent !== null) {
      const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?
        this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
      const batchId = this.activatedRoute.snapshot.queryParams.batchId ?
        this.activatedRoute.snapshot.queryParams.batchId : this.htmlContent.identifier
      setTimeout(() => {
        const completionPercentage = 100
        const data2 = {
          current: 10,
          max_size: 10,
          mime_type: this.mimeType,
          completionPercentage: completionPercentage,
          status: 2,
        }
        // @ts-ignore: Object is possibly 'null'.
        this.viewerSvc.realTimeProgressUpdateV3(this.htmlContent.identifier, data2, collectionId, batchId).subscribe(
          () => { /* success - fire and forget */ },
          error => { this.logger.warn('Progress update failed:', error) }
        )
        // Pre-calculate telemetry and send message without waiting for API response
        const telemetryData = {
          contentId: this.htmlContent?.identifier,
          completionPercentage: completionPercentage,
          status: 2,
          mimeType: 'docs.google',
          batchId: batchId,
        }
        this.viewerSvc.generateInteractTelemetry('progress-update-success', telemetryData)
        const result = { contentId: this.htmlContent?.identifier, ...data2, type: 'docs.google' }
        this.contentSvc.changeMessage(result)
      }, 50)

      const courseID = this.activatedRoute.snapshot.queryParams.collectionId ?
        this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
      if (this.htmlContent) {
        const data1: any = {
          "id": this.htmlContent.identifier,
          "type": "docs.google",
          "version": "",
          "rollup": {
            "l1": collectionId || courseID,
            "l2": this.htmlContent.identifier,
          },
        }
        const extras: any = {
          values: [{
            courseID: courseID,
            contentId: this.htmlContent.identifier,
            name: this.htmlContent.name,
            moduleId: this.getModuleId(courseID, this.htmlContent.parent),
          }],
        }
        this.telemetrySvc.end('docs.google', 'docs.google-close', 'player', data1, extras)
      }

      // this.contentSvc.changeMessage('docs.google')
    }
  }


  mergeProgressDetails(obj1: any, obj2: any) {
    // Create a new object to store the merged results
    const mergedObj = { ...obj1 }

    // Loop through the keys in obj2
    for (const key in obj2) {
      if (obj2.hasOwnProperty(key)) {
        // If the key exists in obj1, accept the latest value from obj2
        if (mergedObj.hasOwnProperty(key)) {
          mergedObj[key] = obj2[key]
        } else {
          // If the key doesn't exist in obj1, add it from obj2
          mergedObj[key] = obj2[key]
        }
      }
    }

    return mergedObj
  }
  async ngOnChanges() {
    // CRITICAL: Guard must be at the VERY START - prevents ANY processing if already processing this content
    if (this.htmlContent && this.htmlContent.identifier) {
      if (this.currentProcessingContentId === this.htmlContent.identifier) {
        // Already processing this exact content - block all further processing
        return
      }

      // Mark this content as being processed - PREVENT re-entry
      this.currentProcessingContentId = this.htmlContent.identifier

      // Unsubscribe from any previous subscription to prevent duplicate API calls
      if (this.contentHistorySubscription) {
        this.contentHistorySubscription.unsubscribe()
        this.contentHistorySubscription = null
      }

      this.scormAdapterService.contentId = this.htmlContent!.identifier
      this.scormAdapterService.htmlName = this.htmlContent!.name
      this.scormAdapterService.parent = this.htmlContent!.parent ? this.htmlContent!.parent : undefined
      let userId
      if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId || ''
      }

      // Skip fetchContentHistoryV2 for SCORM - let SCORM adapter handle it
      if (this.htmlContent.mimeType === 'application/vnd.ekstep.html-archive') {
        // SCORM content will be handled in the SCORM-specific section below
      } else {
        const req: NsContent.IContinueLearningDataReq = {
          request: {
            userId,
            batchId: this.activatedRoute.snapshot.queryParams.batchId,
            courseId: this.activatedRoute.snapshot.queryParams.collectionId || '',
            contentIds: this.htmlContent ? [this.htmlContent.identifier] : [],
            fields: ['progressdetails'],
          },
        }
        this.logger.log(req, 'req')
        // Store subscription to allow cleanup if needed
        this.contentHistorySubscription = this.contentSvc.fetchContentHistoryV2(req).pipe(
          take(1)
        ).subscribe(
          async data => {
            // Only process if we're still handling this content
            if (this.currentProcessingContentId === this.htmlContent!.identifier && this.htmlContent && data) {
              this.logger.log(this.htmlContent.identifier)
              this.contentData = await data['result']['contentList'].find((obj: any) => obj.contentId === this.htmlContent!.identifier)
              //this.logger.log(this.contentData, this.contentData.completionPercentage, 'wee')
              //this.ent = true
              if ((this.contentData && this.contentData.completionPercentage === 100 && this.htmlContent.mimeType !== 'application/vnd.ekstep.html-archive' && this.htmlContent.mimeType !== 'text/x-url')) {
                const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?
                  this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
                const batchId = this.activatedRoute.snapshot.queryParams.batchId ?
                  this.activatedRoute.snapshot.queryParams.batchId : this.htmlContent.identifier

                const completionPercentage = 100
                const data1 = {
                  current: 1,
                  max_size: 1,
                  mime_type: this.mimeType,
                  completionPercentage: completionPercentage,
                  status: 2,
                }
                this.logger.log('here')
                this.viewerSvc
                  .realTimeProgressUpdateV3(this.htmlContent.identifier, data1, collectionId, batchId).subscribe(
                    () => { /* success - fire and forget */ },
                    error => { this.logger.warn('Progress update failed:', error) }
                  )
                // Pre-calculate telemetry and send message without waiting for API response
                const telemetryData = {
                  contentId: this.htmlContent?.identifier,
                  completionPercentage: completionPercentage,
                  status: 2,
                  mimeType: 'html',
                  batchId: batchId,
                }
                this.viewerSvc.generateInteractTelemetry('progress-update-success', telemetryData)
                const result = { contentId: this.htmlContent?.identifier, ...data1, type: 'html' }
                this.contentSvc.changeMessage(result)
              }
            }
          })
      }

      this.urlContains = this.htmlContent.artifactUrl
      const courseId = this.activatedRoute.snapshot.queryParams.collectionId ?
        this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
      const obj = {
        "id": this.htmlContent.identifier,
        "type": "docs.google",
        "version": "",
        "rollup": {
          "l1": courseId,
          "l2": this.htmlContent.identifier,
        },
      }
      const extras: any = {
        values: [{
          resourceID: this.htmlContent.identifier,
          courseID: courseId,
          moduleID: this.getModuleId(courseId, this.htmlContent.parent),
        }],
      }
      this.telemetrySvc.end('player', 'view', 'player', obj, extras)
    }

    if (this.urlContains.includes('docs.google') && this.htmlContent !== null) {
      this.telemetrySvc.start('docs.google', 'docs.google-start', 'player')
      this.executeForms()
    }

    if (this.htmlContent && this.htmlContent.identifier && this.htmlContent.mimeType === 'application/vnd.ekstep.html-archive') {
      // Only initialize SCORM if NOT ALREADY PROCESSED FOR THIS CONTENT ID
      // The guard at the start of ngOnChanges should prevent this from running multiple times
      if (!this.scormInitializedIds.has(this.htmlContent.identifier)) {
        // Mark as initializing to prevent duplicate calls
        this.scormInitializedIds.add(this.htmlContent.identifier)

        localStorage.setItem('contentId', window.location.href)

        // Initialize SCORM directly without fetching history - adapter handles its own communication
        const scorminit = this.scormAdapterService.LMSInitialize()
        this.logger.log(scorminit, 'scorminit')
        this.telemetrySvc.start('scorm', 'scorm-start', 'player')

        const courseID = this.activatedRoute.snapshot.queryParams.collectionId ?
          this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
        if (this.htmlContent) {
          const data: any = {
            "id": this.htmlContent.identifier,
            "type": "scrom",
            "version": "",
            "rollup": {
              "l1": courseID,
              "l2": this.htmlContent.identifier,
            },
          }
          const extras: any = {
            values: [{
              courseID: courseID,
              contentId: this.htmlContent.identifier,
              name: this.htmlContent.name,
              moduleId: this.getModuleId(courseID, this.htmlContent.parent),
            }],
          }
          this.telemetrySvc.end('scorm', 'scorm-close', 'player', data, extras)
        }
      }
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
          if (this.htmlContent.mimeType === 'text/x-url' && (!this.contentData || this.contentData.completionPercentage === 0)) {
            const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?
              this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
            const batchId = this.activatedRoute.snapshot.queryParams.batchId ?
              this.activatedRoute.snapshot.queryParams.batchId : this.htmlContent.identifier

            this.telemetrySvc.start('html/x-url', 'html/x-url-start', 'player')

            const completionPercentage = 100
            const data1 = {
              current: 1,
              max_size: 1,
              mime_type: this.htmlContent.mimeType,
              completionPercentage: completionPercentage,
              status: 2,
            }

            setTimeout(() => {
              if (this.htmlContent) {
                this.viewerSvc
                  .realTimeProgressUpdateV3(this.htmlContent.identifier, data1, collectionId, batchId).subscribe(
                    () => { /* success - fire and forget */ },
                    error => { this.logger.warn('Progress update failed:', error) }
                  )
                // Pre-calculate telemetry and send message without waiting for API response
                const telemetryData = {
                  contentId: this.htmlContent?.identifier,
                  completionPercentage: completionPercentage,
                  status: 2,
                  mimeType: 'html',
                  batchId: batchId,
                }
                this.viewerSvc.generateInteractTelemetry('progress-update-success', telemetryData)
                const result = { contentId: this.htmlContent?.identifier, ...data1, type: 'html' }
                this.contentSvc.changeMessage(result)
              }
            }, 50)

            const courseID = this.activatedRoute.snapshot.queryParams.collectionId ?
              this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
            if (this.htmlContent) {
              const data2: any = {
                "id": this.htmlContent.identifier,
                "type": "html/x-url",
                "version": "",
                "rollup": {
                  "l1": collectionId || courseID,
                  "l2": this.htmlContent.identifier,
                },
              }
              const extras: any = {
                values: [{
                  courseID: courseID,
                  contentId: this.htmlContent.identifier,
                  name: this.htmlContent.name,
                  moduleId: this.getModuleId(courseID, this.htmlContent.parent),
                }],
              }
              this.telemetrySvc.end('html/x-url', 'html/x-url-close', 'player', data2, extras)
            }
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
                this.logger.log(err)
              })
          }
        } else {
          if (this.htmlContent && this.htmlContent.artifactUrl) {
            let streamingUrl = this.htmlContent.streamingUrl

            // Log the original URL for debugging
            this.logger.log('[SCORM] Original streamingUrl:', streamingUrl)

            // Extract the path part after the domain for all URLs and use proxy
            if (streamingUrl.includes('https://static.sphere.aastrika.org')) {
              // CDN domain: extract path after 'https://static.sphere.aastrika.org' (35 chars)
              streamingUrl = streamingUrl.substring(35)
            } else if (streamingUrl.includes('https://sunbirdcontent-stage.s3-ap-south-1.amazonaws.com')) {
              // S3 stage domain: extract path after domain (56 chars)
              streamingUrl = streamingUrl.substring(56)
            } else {
              // Fallback for other S3 or cloud domains
              streamingUrl = streamingUrl.substring(50)
            }

            // Ensure path starts with /
            if (!streamingUrl.startsWith('/')) {
              streamingUrl = '/' + streamingUrl
            }

            const entryPoint = this.htmlContent.entryPoint || ''
            const newUrl = `/apis/proxies/v8/getContents${streamingUrl}${entryPoint}`
            this.logger.log('[SCORM] Using proxy URL:', newUrl, { streamingUrl, entryPoint })
            this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(newUrl)
            // let artifactUrl = this.htmlContent.streamingUrl.substring(51)
            // this.viewerSvc.scormUpdate(this.htmlContent.artifactUrl).toPromise()
            //   .then((res: string) => {
            //     /* tslint:disable-next-line */
            //     this.logger.log(res)
            //     this.logger.log(res['result']['content']['streamingUrl'].substring(51))
            //     this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.htmlContent.artifactUrl}`)
            //   })
            //   .catch((err: any) => {
            //     /* tslint:disable-next-line */
            //     this.logger.log(err)
            //   })
            // this.contentSvc
            //   .fetchHierarchyContent(this.htmlContent.identifier)
            //   .toPromise()
            //   .then((res: any) => {
            //     this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(`${res['result']['content']['streamingUrl']}`)
            //   })
            //   .catch((err: any) => {
            //     /* tslint:disable-next-line */
            //     this.logger.log(err)
            //   })
          }
        }

        if (this.htmlContent.entryPoint && this.htmlContent.entryPoint.includes('lms') === false) {
          // const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?
          //   this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
          // const batchId = this.activatedRoute.snapshot.queryParams.batchId ?
          //   this.activatedRoute.snapshot.queryParams.batchId : this.htmlContent.identifier

          this.telemetrySvc.start('html/lms', 'html/lms-start', 'player')

          const data1 = {
            current: 1,
            max_size: 1,
            mime_type: this.mimeType,
          }
          this.logger.log('timeout', this.contentData, data1)
          setTimeout(() => {
            if (this.htmlContent) {
              // this.viewerSvc
              //   .realTimeProgressUpdate(this.htmlContent.identifier, data1, collectionId, batchId).subscribe((data: any) => {
              //     this.logger.log(data.result.contentList)
              //     const result = data.result
              //     result['type'] = 'html'
              //     this.contentSvc.changeMessage(result)
              //   })
              // this.contentSvc.changeMessage('html')
            }
          }, 50)

          const courseID = this.activatedRoute.snapshot.queryParams.collectionId ?
            this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
          if (this.htmlContent) {
            const data2: any = {
              "id": this.htmlContent.identifier,
              "type": "html/lms",
              "version": "",
              "rollup": {
                "l1": courseID,
                "l2": this.htmlContent.identifier,
              },
            }
            const extras: any = {
              values: [{
                courseID: courseID,
                contentId: this.htmlContent.identifier,
                name: this.htmlContent.name,
                moduleId: this.getModuleId(courseID, this.htmlContent.parent),
              }],
            }
            this.telemetrySvc.end('html/lms', 'html/lms-close', 'player', data2, extras)
          }

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
      this.logger.log(this.htmlContent.identifier)
      this.events.raiseInteractTelemetry(data.event, 'scrom', 'scrom-content', {
        id: this.htmlContent.identifier,
        verison: "",
        rollup: {},
        ...data,
      }, { values: [{ contentId: this.htmlContent.identifier }] })
    }
  }
  receiveMessage(msg: any) {
    // /* tslint:disable-next-line */
    // this.logger.log("msg=>", msg)
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

      this.telemetrySvc.start('html/open-in-newtab', 'html/open-in-newtab-start', 'player')

      const completionPercentage = 100
      const data1 = {
        current: 1,
        max_size: 1,
        mime_type: this.mimeType,
        completionPercentage: completionPercentage,
        status: 2,
      }

      setTimeout(() => {
        if (this.htmlContent) {
          this.viewerSvc
            .realTimeProgressUpdateV3(this.htmlContent.identifier, data1, collectionId, batchId).subscribe(
              () => { /* success - fire and forget */ },
              error => { this.logger.warn('Progress update failed:', error) }
            )
          // Pre-calculate telemetry and send message without waiting for API response
          const telemetryData = {
            contentId: this.htmlContent?.identifier,
            completionPercentage: completionPercentage,
            status: 2,
            mimeType: 'html',
            batchId: batchId,
          }
          this.viewerSvc.generateInteractTelemetry('progress-update-success', telemetryData)
          const result = {
            contentList: [{ contentId: this.htmlContent?.identifier, completionPercentage: completionPercentage, status: 2 }],
            type: 'html',
          }
          this.contentSvc.changeMessage(result)
        }
      }, 50)

      const courseID = this.activatedRoute.snapshot.queryParams.collectionId ?
        this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
      if (this.htmlContent) {
        const data2: any = {
          "id": this.htmlContent.identifier,
          "type": "html/open-in-newtab",
          "version": "",
          "rollup": {
            "l1": collectionId || courseID,
            "l2": this.htmlContent.identifier,
          },
        }
        const extras: any = {
          values: [{
            courseID: this.activatedRoute.snapshot.queryParams.collectionId ?
              this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier,
            contentId: this.htmlContent.identifier,
            name: this.htmlContent.name,
            moduleId: this.getModuleId(courseID, this.htmlContent.parent),
          }],
        }
        this.telemetrySvc.end('html/open-in-newtab', 'html/open-in-newtab-close', 'player', data2, extras)
      }
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

  getModuleId(courseID: any, parent: any): string | null {
    const moduleID: string | null = parent && parent !== courseID ? parent : null
    return moduleID
  }
}
