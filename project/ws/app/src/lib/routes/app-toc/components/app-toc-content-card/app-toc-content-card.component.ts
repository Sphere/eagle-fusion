import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'
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
  hasContentStructure = false
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
  constructor(private configSvc: ConfigurationsService) {}

  ngOnInit() {
    this.evaluateImmediateChildrenStructure()
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.defaultThumbnail = instanceConfig.logos.defaultContent
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    for (const property in changes) {
      if (property === 'expandAll') {
        this.viewChildren = this.expandAll
      }
    }
  }
  get isCollection(): boolean {
    if (this.content) {
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
      )
    }
    return { url: '', queryParams: {} }
  }
  private evaluateImmediateChildrenStructure() {
    if (this.content && this.content.children.length) {
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
              if (child.resourceType === 'Assessment') {
                this.contentStructure.assessment += 1
              } else {
                this.contentStructure.quiz += 1
              }
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
    }
  }

  public contentTrackBy(_index: number, content: NsContent.IContent) {
    if (!content) {
      return null
    }
    return content.identifier
  }
}
