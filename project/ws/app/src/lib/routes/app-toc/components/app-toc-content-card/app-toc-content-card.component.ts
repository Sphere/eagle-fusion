import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core'
import { Router, ActivatedRoute, Params } from '@angular/router'
import { NsContent, viewerRouteGenerator } from '@ws-widget/collection'
import { ConfigurationsService } from '@ws-widget/utils'
import { NsAppToc } from '../../models/app-toc.model'

@Component({
  selector: 'ws-app-toc-content-card',
  templateUrl: './app-toc-content-card.component.html',
  styleUrls: ['./app-toc-content-card.component.scss'],
})
export class AppTocContentCardComponent implements OnInit, OnChanges {
  @Input() content: NsContent.IContent | null = null
  @Input() expandAll = false
  @Input() rootId!: string
  @Input() rootContentType!: string
  @Input() forPreview = false
  @Input() batchId!: string
  @Output() expandChild = new EventEmitter<any>()
  contentId!: string
  hasContentStructure = false
  resourceContentType: any
  enumContentTypes = NsContent.EDisplayContentTypes
  contentStructure: NsAppToc.ITocStructure = {
    assessment: 0,
    course: 0,
    handsOn: 0,
    interactiveVideo: 0,
    learningModule: 0,
    other: 0,
    pdf: 0,
    podcast: 0,
    quiz: 0,
    video: 0,
    webModule: 0,
    webPage: 0,
    youtube: 0,
  }
  defaultThumbnail = ''
  viewChildren = false
  greenTickIcon = '/fusion-assets/images/green-checked3.svg'
  redTickIcon = '/fusion-assets/images/red-tick.svg'
  constructor(
    private configSvc: ConfigurationsService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.evaluateImmediateChildrenStructure()
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.defaultThumbnail = instanceConfig.logos.defaultContent
    }
    this.route.queryParams.subscribe((params: Params) => {
      this.batchId = params['batchId']
      this.contentId = params['contentId']
    })
  }
  ngOnChanges(changes: SimpleChanges) {
    for (const property in changes) {
      if (property === 'expandAll') {
        this.viewChildren = this.expandAll
      }
    }
  }

  resourceContentTypeFunct(type: any) {
    if (type === 'application/vnd.ekstep.content-collection') {
      this.resourceContentType = 'Topic'
    } else if (type === 'application/pdf') {
      this.resourceContentType = 'PDF'
    } else if (type === 'application/quiz' || type === 'application/json') {
      this.resourceContentType = 'Assessment'
    } else if (type === 'application/html' || type === 'application/vnd.ekstep.html-archive') {
      this.resourceContentType = 'Scorm'
    } else if (type === 'application/x-mpegURL' || type === 'video/mp4') {
      this.resourceContentType = 'Video'
    } else if (type === 'audio/mpeg') {
      this.resourceContentType = 'Audio'
    } else if (type === 'video/x-youtube' || type === 'text/x-url' || type === 'application/web-module') {
      this.resourceContentType = 'Link'
    } else { this.resourceContentType = 'Course' }
  }

  reDirect(content: any) {
    // tslint:disable-next-line:max-line-length
    const url = `${content.url}?primaryCategory=${content.queryParams.primaryCategory}&collectionId=${content.queryParams.collectionId}&collectionType=${content.queryParams.collectionType}&batchId=${content.queryParams.batchId}`
    this.router.navigateByUrl(`${url}`)
  }
  get isCollection(): boolean {
    if (this.content) {
      this.resourceContentTypeFunct(this.content.mimeType)
      return this.content.mimeType === NsContent.EMimeTypes.COLLECTION
    }
    return false
  }
  get isResource(): boolean {
    if (this.content) {
      return (
        this.content.contentType === 'Resource' || this.content.contentType === 'Knowledge Artifact'
      )
    }
    return false
  }
  get resourceLink(): { url: string; queryParams: { [key: string]: any } } {
    if (this.content) {
      return viewerRouteGenerator(
        this.content.identifier,
        this.content.mimeType,
        this.rootId,
        this.rootContentType,
        this.forPreview,
        this.content.primaryCategory,
        this.batchId
      )
    }
    return { url: '', queryParams: {} }
  }
  private evaluateImmediateChildrenStructure() {
    // if (this.content && this.content.children.length) {
    if (this.content && this.content.children && this.content.children.length) {
      this.content.children.forEach((child: NsContent.IContent) => {
        if (child.contentType === NsContent.EContentTypes.COURSE) {
          this.contentStructure.course += 1
        } else if (child.contentType === NsContent.EContentTypes.KNOWLEDGE_ARTIFACT) {
          this.contentStructure.other += 1
        } else if (child.contentType === NsContent.EContentTypes.MODULE) {
          this.contentStructure.learningModule += 1
        } else if (child.contentType === NsContent.EContentTypes.RESOURCE) {
          switch (child.mimeType) {
            case NsContent.EMimeTypes.HANDS_ON:
              this.contentStructure.handsOn += 1
              break
            case NsContent.EMimeTypes.MP3:
              this.contentStructure.podcast += 1
              break
            case NsContent.EMimeTypes.MP4:
            case NsContent.EMimeTypes.M3U8:
              this.contentStructure.video += 1
              break
            case NsContent.EMimeTypes.INTERACTION:
              this.contentStructure.interactiveVideo += 1
              break
            case NsContent.EMimeTypes.PDF:
              this.contentStructure.pdf += 1
              break
            case NsContent.EMimeTypes.HTML:
              this.contentStructure.webPage += 1
              break
            case NsContent.EMimeTypes.QUIZ:

              this.contentStructure.assessment += 1

              break
            case NsContent.EMimeTypes.WEB_MODULE:
              this.contentStructure.webModule += 1
              break
            case NsContent.EMimeTypes.YOUTUBE:
              this.contentStructure.youtube += 1
              break
            default:
              this.contentStructure.other += 1
              break
          }
        }
      })
    }
    for (const key in this.contentStructure) {
      if (this.contentStructure[key] > 0) {
        this.hasContentStructure = true
      }
    }
  }

  get contextPath() {
    return {
      contextId: this.rootId,
      contextPath: this.rootContentType,
      batchId: this.batchId,
    }
  }

  public progressColor(content: number) {
    // tslint:disable
    if (content <= 30) {
      return '#D13924'
    } else if (content > 30 && content <= 70) {
      return '#E99E38'
    } else {
      return '#1D8923'
    }
    // tslint:enable
  }

  public contentTrackBy(_index: number, content: NsContent.IContent) {
    if (!content) {
      return null
    }
    return content.identifier
  }

  expandView() {
    console.log("expand")
    this.expandChild.emit(true)
  }
}
