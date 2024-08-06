import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, ViewChild, AfterViewInit, HostListener } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { ActivatedRoute, Router } from '@angular/router'
import { NsContent, WidgetContentService } from '@ws-widget/collection'
import { ConfigurationsService, EventService, TelemetryService } from '@ws-widget/utils'
import { TFetchStatus } from '@ws-widget/utils/src/public-api'
import { MobileAppsService } from '../../../../../../../src/app/services/mobile-apps.service'
import { SCORMAdapterService } from './SCORMAdapter/scormAdapter'
// import { Interval, Observable, Subscription } from 'rxjs'
import { ViewerUtilService } from '../../../../../../../project/ws/viewer/src/lib/viewer-util.service'
import * as dayjs from 'dayjs'
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
  contentData: any
  ent = false
  @HostListener('window:blur', ['$event'])
  onBlur(): void {
    if (this.urlContains.includes('youtube') && this.htmlContent !== null) {
      const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?
        this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
      const batchId = this.activatedRoute.snapshot.queryParams.batchId ?
        this.activatedRoute.snapshot.queryParams.batchId : this.htmlContent.identifier

      this.telemetrySvc.start('youtube', 'youtube-start', this.activatedRoute.snapshot.queryParams.collectionId ?
        this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier)

      setTimeout(() => {
        const data2 = {
          current: 10,
          max_size: 10,
          mime_type: this.mimeType,
        }
        // @ts-ignore: Object is possibly 'null'.
        this.viewerSvc.realTimeProgressUpdate(this.htmlContent.identifier, data2, collectionId, batchId).subscribe((data: any) => {
          console.log(data.result.contentList)
          const result = data.result
          result['type'] = 'youtube'
          this.contentSvc.changeMessage(result)
        })

      }, 50)
      const courseID = this.activatedRoute.snapshot.queryParams.collectionId ?
        this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
      if (this.htmlContent) {
        const data1: any = {
          courseID: courseID,
          contentId: this.htmlContent.identifier,
          name: this.htmlContent.name,
          moduleId: this.getModuleId(courseID, this.htmlContent.parent),
        }
        this.telemetrySvc.end('youtube', 'youtube-close', this.activatedRoute.snapshot.queryParams.collectionId ?
          this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier, data1)
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

    this.scormAdapterService.contentId = this.htmlContent!.identifier
    this.scormAdapterService.htmlName = this.htmlContent!.name
    this.scormAdapterService.parent = this.htmlContent!.parent ? this.htmlContent!.parent : undefined
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
        this.viewerSvc.realTimeProgressUpdate(this.htmlContent.identifier, data2, collectionId, batchId).subscribe((data: any) => {
          console.log(data.result.contentList)
          const result = data.result
          result['type'] = 'docs.google'
          this.contentSvc.changeMessage(result)
        })
      }, 50)

      const courseID = this.activatedRoute.snapshot.queryParams.collectionId ?
        this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
      if (this.htmlContent) {
        const data1: any = {
          courseID: courseID,
          contentId: this.htmlContent.identifier,
          name: this.htmlContent.name,
          moduleId: this.getModuleId(courseID, this.htmlContent.parent),
        }
        this.telemetrySvc.end('docs.google', 'docs.google-close', this.activatedRoute.snapshot.queryParams.collectionId ?
          this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier, data1)
      }

      // this.contentSvc.changeMessage('docs.google')
    }
  }
  async ngOnChanges() {
    if (this.htmlContent && this.htmlContent.identifier) {

      this.scormAdapterService.contentId = this.htmlContent!.identifier
      this.scormAdapterService.htmlName = this.htmlContent!.name
      this.scormAdapterService.parent = this.htmlContent!.parent ? this.htmlContent!.parent : undefined
      let userId
      if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId || ''
      }
      const req: NsContent.IContinueLearningDataReq = {
        request: {
          userId,
          batchId: this.activatedRoute.snapshot.queryParams.batchId,
          courseId: this.activatedRoute.snapshot.queryParams.collectionId || '',
          contentIds: [],
          fields: ['progressdetails'],
        },
      }
      console.log(req, 'req')
      this.contentSvc.fetchContentHistoryV2(req).subscribe(
        async data => {
          if (this.htmlContent && data) {
            this.contentData = []
            console.log(this.htmlContent.identifier)
            this.contentData = await data['result']['contentList'].find((obj: any) => obj.contentId === this.htmlContent!.identifier)
            //console.log(this.contentData, this.contentData.completionPercentage, 'wee')
            //this.ent = true
            if ((this.contentData && this.contentData.completionPercentage === 100 && this.htmlContent.mimeType !== 'application/vnd.ekstep.html-archive')) {
              const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?
                this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
              const batchId = this.activatedRoute.snapshot.queryParams.batchId ?
                this.activatedRoute.snapshot.queryParams.batchId : this.htmlContent.identifier

              const data1 = {
                current: 1,
                max_size: 1,
                mime_type: this.mimeType,
              }
              console.log('here')
              this.viewerSvc
                .realTimeProgressUpdate(this.htmlContent.identifier, data1, collectionId, batchId).subscribe((data: any) => {
                  console.log(data.result.contentList)
                  const result = data.result
                  result['type'] = 'html'
                  this.contentSvc.changeMessage(result)
                })
              this.contentSvc.changeMessage('html')
            }
          }
        })

      this.urlContains = this.htmlContent.artifactUrl
      const courseId = this.activatedRoute.snapshot.queryParams.collectionId ?
        this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
      const obj = {
        resourceID: this.htmlContent.identifier,
        courseID: courseId,
        moduleID: this.getModuleId(courseId, this.htmlContent.parent),
      }
      this.telemetrySvc.end('player', 'view', '', obj)
    }

    if (this.urlContains.includes('docs.google') && this.htmlContent !== null) {
      this.telemetrySvc.start('docs.google', 'docs.google-start', this.activatedRoute.snapshot.queryParams.collectionId ?
        this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier)
      this.executeForms()
    }

    if (this.htmlContent && this.htmlContent.identifier && this.htmlContent.mimeType === 'application/vnd.ekstep.html-archive') {
      let userId
      if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId || ''
      }
      const req: NsContent.IContinueLearningDataReq = {
        request: {
          userId,
          batchId: this.activatedRoute.snapshot.queryParams.batchId,
          courseId: this.activatedRoute.snapshot.queryParams.collectionId || '',
          contentIds: [],
          fields: ['progressdetails'],
        },
      }
      // console.log(req)
      this.contentSvc.fetchContentHistoryV2(req).subscribe(
        async data => {
          let scorminit = this.scormAdapterService.LMSInitialize()
          console.log(scorminit, 'scorminit')
          if (this.htmlContent && data) {
            let progressData: any
            progressData = await this.scormAdapterService.initValue()
            if (Object.keys(progressData).length === 1) {
              progressData["cmi.core.exit"] = "suspend"
              progressData["cmi.core.lesson_status"] = "incomplete"
              progressData["errors"] = "[]"
            }
            console.log(progressData, 'progressData')
            let contentData: any
            contentData = await data['result']['contentList'].find((obj: any) => obj.contentId === this.htmlContent!.identifier)
            console.log(this.htmlContent.identifier, contentData, '1')
            // this.contentData =  data['result']['contentList'].find((obj: any) => obj.contentId === this.htmlContent!.identifier)
            console.log(contentData, this.htmlContent, this.ent, 'ent')
            if (contentData && contentData.completionPercentage === 0) {
              let req: any
              if (this.configSvc.userProfile) {
                req = {
                  request: {
                    userId: this.configSvc.userProfile.userId || '',
                    contents: [
                      {
                        contentId: this.htmlContent!.identifier,
                        batchId: this.activatedRoute.snapshot.queryParamMap.get('batchId') || '',
                        courseId: this.activatedRoute.snapshot.queryParams.collectionId || '',
                        status: this.activatedRoute.snapshot.queryParams.collectionId !== "do_11390679694610432011" ? 1 : 2,
                        lastAccessTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss:SSSZZ'),
                        progressdetails: Object.keys(contentData.progressdetails).length > 1 ? contentData.progressdetails : progressData,
                        completionPercentage: this.activatedRoute.snapshot.queryParams.collectionId !== "do_11390679694610432011" ? 0 : 100
                      }
                    ],
                  },
                }
                console.log(req)
                console.log(`}`, '273')
                this.viewerSvc.initUpdate(req).subscribe(async (data: any) => {
                  let res = await data
                  console.log(res)
                })
              }
            } else {
              this.scormAdapterService.contentId = this.htmlContent.identifier
              this.scormAdapterService.htmlName = this.htmlContent.name
              this.scormAdapterService.parent = this.htmlContent!.parent ? this.htmlContent.parent : undefined

              if (contentData && contentData.completionPercentage === 100) {
                console.log('scorm here', contentData.progressdetails)
                let req: any
                if (this.configSvc.userProfile) {
                  req = {
                    request: {
                      userId: this.configSvc.userProfile.userId || '',
                      contents: [
                        {
                          contentId: this.htmlContent!.identifier,
                          batchId: this.activatedRoute.snapshot.queryParamMap.get('batchId') || '',
                          courseId: this.activatedRoute.snapshot.queryParams.collectionId || '',
                          status: 2,
                          lastAccessTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss:SSSZZ'),
                          progressdetails: Object.keys(contentData.progressdetails).length > 1 ? contentData.progressdetails : progressData,
                          completionPercentage: 100
                        }
                      ],
                    },
                  }
                  console.log(req)
                  console.log(`{}`, '296')
                  this.viewerSvc.initUpdate(req).subscribe(async (data: any) => {
                    let res = await data
                    console.log(res)
                  })
                }
              } else {
                if (contentData === undefined) {
                  let req: any
                  if (this.configSvc.userProfile) {
                    req = {
                      request: {
                        userId: this.configSvc.userProfile.userId || '',
                        contents: [
                          {
                            contentId: this.htmlContent!.identifier,
                            batchId: this.activatedRoute.snapshot.queryParamMap.get('batchId') || '',
                            courseId: this.activatedRoute.snapshot.queryParams.collectionId || '',
                            status: this.activatedRoute.snapshot.queryParams.collectionId !== "do_11390679694610432011" ? 1 : 2,
                            lastAccessTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss:SSSZZ'),
                            progressdetails: progressData,
                            completionPercentage: this.activatedRoute.snapshot.queryParams.collectionId !== "do_11390679694610432011" ? 0 : 100
                          }
                        ],
                      },
                    }
                    console.log(req)
                    console.log(`{}`, '333')
                    this.viewerSvc.initUpdate(req).subscribe(async (data: any) => {
                      let res = await data
                      console.log(res)
                      if (res) {
                        let result = {}
                        result = data.result
                        result["type"] = 'scorm'
                        this.contentSvc.changeMessage(result)
                      }
                    })
                  }
                } else {
                  console.log('342')
                  this.scormAdapterService.loadDataV2()
                }
              }
            }
          }
        })
      this.telemetrySvc.start('scorm', 'scorm-start', this.activatedRoute.snapshot.queryParams.collectionId ?
        this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier)

      // this.contentSvc.changeMessage('scorm')
      // this.scormAdapterService.contentId = this.htmlContent.identifier
      // this.scormAdapterService.htmlName = this.htmlContent.name
      // this.scormAdapterService.parent = this.htmlContent!.parent ? this.htmlContent.parent : undefined
      // // this.scormAdapterService.loadData()
      // this.scormAdapterService.loadDataV2()
      const courseID = this.activatedRoute.snapshot.queryParams.collectionId ?
        this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
      if (this.htmlContent) {
        const data: any = {
          courseID: courseID,
          contentId: this.htmlContent.identifier,
          name: this.htmlContent.name,
          moduleId: this.getModuleId(courseID, this.htmlContent.parent),
        }
        this.telemetrySvc.end('scorm', 'scorm-close', this.activatedRoute.snapshot.queryParams.collectionId ?
          this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier, data)
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
          if (this.htmlContent.mimeType === 'text/x-url') {
            const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?
              this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
            const batchId = this.activatedRoute.snapshot.queryParams.batchId ?
              this.activatedRoute.snapshot.queryParams.batchId : this.htmlContent.identifier

            this.telemetrySvc.start('html/x-url', 'html/x-url-start', this.activatedRoute.snapshot.queryParams.collectionId ?
              this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier)

            const data1 = {
              current: 1,
              max_size: 1,
              mime_type: this.htmlContent.mimeType,
            }

            setTimeout(() => {
              if (this.htmlContent) {
                this.viewerSvc
                  .realTimeProgressUpdate(this.htmlContent.identifier, data1, collectionId, batchId).subscribe((data: any) => {
                    console.log(data.result.contentList)
                    const result = data.result
                    result['type'] = 'html'
                    this.contentSvc.changeMessage(result)
                  })
                // this.contentSvc.changeMessage('html')
              }
            }, 50)

            const courseID = this.activatedRoute.snapshot.queryParams.collectionId ?
              this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
            if (this.htmlContent) {
              const data2: any = {
                courseID: courseID,
                contentId: this.htmlContent.identifier,
                name: this.htmlContent.name,
                moduleId: this.getModuleId(courseID, this.htmlContent.parent),
              }
              this.telemetrySvc.end('html/x-url', 'html/x-url-close', this.activatedRoute.snapshot.queryParams.collectionId ?
                this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier, data2)
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
                console.log(err)
              })
          }
        } else {
          if (this.htmlContent && this.htmlContent.artifactUrl) {
            // const streamingUrl = this.htmlContent.streamingUrl.substring(51)
            let streamingUrl = this.htmlContent.streamingUrl
            streamingUrl = streamingUrl.includes(
              'https://sunbirdcontent-stage.s3-ap-south-1.amazonaws.com'
            )
              ? streamingUrl.substring(56)
              : streamingUrl.substring(50)
            const entryPoint = this.htmlContent.entryPoint || ''
            const newUrl = `/apis/proxies/v8/getContents${streamingUrl}${entryPoint}`
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
          // const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?
          //   this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
          // const batchId = this.activatedRoute.snapshot.queryParams.batchId ?
          //   this.activatedRoute.snapshot.queryParams.batchId : this.htmlContent.identifier

          this.telemetrySvc.start('html/lms', 'html/lms-start', this.activatedRoute.snapshot.queryParams.collectionId ?
            this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier)

          const data1 = {
            current: 1,
            max_size: 1,
            mime_type: this.mimeType,
          }
          console.log('timeout', this.contentData, data1)
          setTimeout(() => {
            if (this.htmlContent) {
              // this.viewerSvc
              //   .realTimeProgressUpdate(this.htmlContent.identifier, data1, collectionId, batchId).subscribe((data: any) => {
              //     console.log(data.result.contentList)
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
              courseID: courseID,
              contentId: this.htmlContent.identifier,
              name: this.htmlContent.name,
              moduleId: this.getModuleId(courseID, this.htmlContent.parent),
            }
            this.telemetrySvc.end('html/lms', 'html/lms-close', this.activatedRoute.snapshot.queryParams.collectionId ?
              this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier, data2)
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

      this.telemetrySvc.start('html/open-in-newtab', 'html/open-in-newtab-start', this.activatedRoute.snapshot.queryParams.collectionId ?
        this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier)

      const data1 = {
        current: 1,
        max_size: 1,
        mime_type: this.mimeType,
      }

      setTimeout(() => {
        if (this.htmlContent) {
          this.viewerSvc
            .realTimeProgressUpdate(this.htmlContent.identifier, data1, collectionId, batchId).subscribe((data: any) => {
              console.log(data.result.contentList)
              const result = data.result
              result['type'] = 'html'
              this.contentSvc.changeMessage(result)
            })
          // this.contentSvc.changeMessage('html')
        }
      }, 50)

      const courseID = this.activatedRoute.snapshot.queryParams.collectionId ?
        this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
      if (this.htmlContent) {
        const data2: any = {
          courseID: this.activatedRoute.snapshot.queryParams.collectionId ?
            this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier,
          contentId: this.htmlContent.identifier,
          name: this.htmlContent.name,
          moduleId: this.getModuleId(courseID, this.htmlContent.parent),
        }
        this.telemetrySvc.end('html/open-in-newtab', 'html/open-in-newtab-close', this.activatedRoute.snapshot.queryParams.collectionId ?
          this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier, data2)
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
    let moduleID: string | null = parent && parent !== courseID ? parent : null
    return moduleID
  }
}
