import { NestedTreeControl } from '@angular/cdk/tree'
import {
  Component, EventEmitter, OnDestroy, OnInit, Output, Input, ViewChild, ElementRef, AfterViewInit, OnChanges,
} from '@angular/core'
import { MatTreeNestedDataSource } from '@angular/material'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import { ActivatedRoute } from '@angular/router'
import {
  // ContentProgressService,
  NsContent,
  VIEWER_ROUTE_FROM_MIME,
  WidgetContentService,
} from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import {
  // LoggerService,
  ConfigurationsService,
  UtilityService,
} from '@ws-widget/utils'
import { of, Subscription } from 'rxjs'
import { delay } from 'rxjs/operators'
import { ViewerDataService } from '../../viewer-data.service'
import { ViewerUtilService } from '../../viewer-util.service'

interface IViewerTocCard {
  identifier: string
  completionPercentage: number
  completionStatus: number
  viewerUrl: string
  thumbnailUrl: string
  title: string
  duration: number
  type: string
  complexity: string
  children: null | IViewerTocCard[]
}

export type TCollectionCardType = 'content' | 'playlist' | 'goals'

interface ICollectionCard {
  type: TCollectionCardType | null
  id: string
  title: string
  thumbnail: string
  subText1: string
  subText2: string
  duration: number
  redirectUrl: string | null
}

@Component({
  selector: 'viewer-viewer-toc',
  templateUrl: './viewer-toc.component.html',
  styleUrls: ['./viewer-toc.component.scss'],
})
export class ViewerTocComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Output() hidenav = new EventEmitter<boolean>()
  @Input() forPreview = false
  @Input() resourceChanged = ''
  @ViewChild('highlightItem', { static: false }) highlightItem!: ElementRef<any>
  @ViewChild('outer', { static: false }) outer!: ElementRef<any>
  @ViewChild('ulTree', { static: false }) ulTree!: ElementRef<any>
  @Input() batchId!: string | null
  searchCourseQuery = ''
  hideSideNav = false
  reverse = ''
  greenTickIcon = '/fusion-assets/images/green-checked3.svg'
  collectionId = ''
  resourceContentType: any
  disabledNode: boolean
  constructor(
    private activatedRoute: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    // private logger: LoggerService,
    private contentSvc: WidgetContentService,
    private utilitySvc: UtilityService,
    private viewerDataSvc: ViewerDataService,
    private viewSvc: ViewerUtilService,
    private configSvc: ConfigurationsService
    // private contentProgressSvc: ContentProgressService
  ) {
    this.nestedTreeControl = new NestedTreeControl<IViewerTocCard>(this._getChildren)
    this.nestedDataSource = new MatTreeNestedDataSource()
    this.disabledNode = this.viewerDataSvc.getNode()
  }
  resourceId: string | null = null
  collection: IViewerTocCard | null = null
  queue: IViewerTocCard[] = []
  tocMode: 'FLAT' | 'TREE' = 'TREE'
  nestedTreeControl: NestedTreeControl<IViewerTocCard>
  nestedDataSource: MatTreeNestedDataSource<IViewerTocCard>
  defaultThumbnail: SafeUrl | null = null
  isFetching = true
  pathSet = new Set()
  contentProgressHash: { [id: string]: number } | null = null
  errorWidgetData: NsWidgetResolver.IRenderConfigWithTypedData<any> = {
    widgetType: 'errorResolver',
    widgetSubType: 'errorResolver',
    widgetData: {
      errorType: '',
    },
  }
  enumContentTypes = NsContent.EDisplayContentTypes
  collectionCard: ICollectionCard | null = null
  isErrorOccurred = false
  private paramSubscription: Subscription | null = null
  private viewerDataServiceSubscription: Subscription | null = null
  message!: string
  subscription: Subscription | null = null

  hasNestedChild = (_: number, nodeData: IViewerTocCard) =>
    nodeData && nodeData.children && nodeData.children.length
  private _getChildren = (node: IViewerTocCard) => {
    return node && node.children ? node.children : []
  }

  ngOnInit() {

    if (this.configSvc.instanceConfig) {
      this.defaultThumbnail = this.domSanitizer.bypassSecurityTrustResourceUrl(
        this.configSvc.instanceConfig.logos.defaultContent,
      )
    }
    this.paramSubscription = this.activatedRoute.queryParamMap.subscribe(async params => {
      this.batchId = params.get('batchId')
      const collectionId = params.get('collectionId')
      const collectionType = params.get('collectionType')
      if (collectionId && collectionType) {
        if (
          collectionType.toLowerCase() ===
          NsContent.EMiscPlayerSupportedCollectionTypes.PLAYLIST.toLowerCase()
        ) {
          this.collection = await this.getPlaylistContent(collectionId, collectionType)
        } else if (
          collectionType.toLowerCase() === NsContent.EContentTypes.MODULE.toLowerCase() ||
          collectionType.toLowerCase() === NsContent.EContentTypes.COURSE.toLowerCase() ||
          collectionType.toLowerCase() === NsContent.EContentTypes.PROGRAM.toLowerCase()
        ) {
          this.collection = await this.getCollection(collectionId, collectionType)
        } else {
          this.isErrorOccurred = true
        }
        if (this.collection) {
          this.queue = this.utilitySvc.getLeafNodes(this.collection, [])
        }
      }
      if (this.resourceId) {
        this.processCurrentResourceChange()
      }
    })

    this.viewerDataServiceSubscription = this.viewerDataSvc.changedSubject.subscribe(_data => {
      if (this.resourceId !== this.viewerDataSvc.resourceId) {
        this.resourceId = this.viewerDataSvc.resourceId
        this.processCurrentResourceChange()
        this.checkIndexOfResource()
      }
    })
  }

  checkIndexOfResource() {
    if (this.collection) {
      const index = this.queue.findIndex(x => x.identifier === this.resourceId)
      this.scrollToUserView(index)
    }
  }
  async ngOnChanges() {
    await this.contentSvc.currentMessage.subscribe(
      (data: any) => {
        if (data) {
          this.ngOnInit()
        }
      })
  }
  scrollToUserView(index: number) {

    setTimeout(() => {
      if (index > 3) {
        if (this.highlightItem.nativeElement.classList.contains('li-active')) {

          const highlightItemOffset = this.highlightItem.nativeElement.offsetTop
          const outerClientHeight = this.outer.nativeElement.clientHeight
          const liItemHeight = this.highlightItem.nativeElement.clientHeight

          if (outerClientHeight < (highlightItemOffset + liItemHeight)) {
            this.outer.nativeElement.scrollTop = this.highlightItem.nativeElement.offsetTop

          } else {
            this.outer.nativeElement.scrollTop = 0
          }

          if (highlightItemOffset > 535 && this.reverse === 'next') {

            this.outer.nativeElement.scrollTop = this.highlightItem.nativeElement.offsetTop
            this.outer.nativeElement.scrollTop = window.innerHeight
            this.highlightItem.nativeElement.offsetTop = 300
            this.highlightItem.nativeElement.scrollTop = 300
            if (highlightItemOffset - window.innerHeight > 80) {
              window.scrollTo(0, 80)
            }
          } else {

            if (this.highlightItem.nativeElement.offsetTop + this.outer.nativeElement.offsetTop > window.innerHeight) {
              this.outer.nativeElement.scrollTop = this.highlightItem.nativeElement.offsetTop
            }

          }
        }

      }
    }, 300)
  }

  ngAfterViewInit() {

    setTimeout(() => {
      this.checkIndexOfResource()
    }, 300)
  }
  // updateSearchModel(value) {
  //   this.searchModel = value
  //   // this.searchModelChange.emit(this.searchModel)
  // }
  sendStatus(content: any) {
    this.viewSvc.editResourceData(content)
    if (window.innerWidth < 600) {
      this.minimizenav()
    }

  }

  // private getContentProgressHash() {
  //   this.contentProgressSvc.getProgressHash().subscribe(progressHash => {
  //     this.contentProgressHash = progressHash
  //   })
  // }
  // @HostListener('window:resize', ['$event'])
  // onResize(event: any) {
  //   if (event.target.innerWidth < 600) {
  //     this.minimizenav()
  //   }
  // }
  ngOnDestroy() {
    if (this.paramSubscription) {
      this.paramSubscription.unsubscribe()
    }
    if (this.viewerDataServiceSubscription) {
      this.viewerDataServiceSubscription.unsubscribe()
    }
    // if(this.subscription) {
    //   this.subscription.unsubscribe();
    // }

  }
  changeTocMode() {
    if (this.tocMode === 'FLAT') {
      this.tocMode = 'TREE'
      // this.processCollectionForTree()
    } else {
      this.tocMode = 'FLAT'
    }
  }

  private processCurrentResourceChange() {
    if (this.collection && this.resourceId) {
      this.processCollectionForTree()
      this.expandThePath()
      // this.getContentProgressHash()
    }
  }
  private async getCollection(
    collectionId: string,
    _collectionType: string,
  ): Promise<IViewerTocCard | null> {
    try {
      let content: NsContent.IContent = await (this.forPreview
        ? this.contentSvc.fetchAuthoringContent(collectionId)
        : this.contentSvc.fetchContent(collectionId, 'detail')
      ).toPromise()
      content = content.result.content
      if (content && content.gatingEnabled) {
        this.viewerDataSvc.setNode(content.gatingEnabled)
      }
      this.resourceContentTypeFunct(content.mimeType)
      this.collectionCard = this.createCollectionCard(content)
      const viewerTocCardContent = this.convertContentToIViewerTocCard(content)
      this.isFetching = false
      return viewerTocCardContent
    } catch (err) {
      switch (err.status) {
        case 403: {
          this.errorWidgetData.widgetData.errorType = 'accessForbidden'
          break
        }
        case 404: {
          this.errorWidgetData.widgetData.errorType = 'notFound'
          break
        }
        case 500: {
          this.errorWidgetData.widgetData.errorType = 'internalServer'
          break
        }
        case 503: {
          this.errorWidgetData.widgetData.errorType = 'serviceUnavailable'
          break
        }
        default: {
          this.errorWidgetData.widgetData.errorType = 'somethingWrong'
          break
        }
      }
      this.isFetching = false
      return null
    }
  }

  private async getPlaylistContent(
    collectionId: string,
    _collectionType: string,
  ): Promise<IViewerTocCard | null> {
    try {
      const playlistFetchResponse = await this.contentSvc
        .fetchCollectionHierarchy('playlist', collectionId, 0, 1000)
        .toPromise()

      const content: NsContent.IContent = playlistFetchResponse.data
      this.resourceContentTypeFunct(content.mimeType)
      this.collectionCard = this.createCollectionCard(content)
      const viewerTocCardContent = this.convertContentToIViewerTocCard(content)
      this.isFetching = false
      return viewerTocCardContent
    } catch (err) {
      switch (err.status) {
        case 403: {
          this.errorWidgetData.widgetData.errorType = 'accessForbidden'
          break
        }
        case 404: {
          this.errorWidgetData.widgetData.errorType = 'notFound'
          break
        }
        case 500: {
          this.errorWidgetData.widgetData.errorType = 'internalServer'
          break
        }
        case 503: {
          this.errorWidgetData.widgetData.errorType = 'serviceUnavailable'
          break
        }
        default: {
          this.errorWidgetData.widgetData.errorType = 'somethingWrong'
          break
        }
      }
      this.isFetching = false
      return null
    }
  }

  private convertContentToIViewerTocCard(content: NsContent.IContent): IViewerTocCard {
    this.resourceContentTypeFunct(content.mimeType)
    return {
      identifier: content.identifier,
      viewerUrl: `${this.forPreview ? '/author' : ''}/viewer/${VIEWER_ROUTE_FROM_MIME(
        content.mimeType,
      )}/${content.identifier}`,
      thumbnailUrl: content.appIcon,
      title: content.name,
      duration: content.duration,
      type: this.resourceContentType,
      complexity: content.complexityLevel,
      // tslint:disable
      completionPercentage: content.completionPercentage!,
      completionStatus: content.completionStatus!,
      // tslint:enable
      children:
        Array.isArray(content.children) && content.children.length
          ? content.children.map(child => this.convertContentToIViewerTocCard(child))
          : null,

    }
  }

  private createCollectionCard(
    collection: NsContent.IContent | NsContent.IContentMinimal,
  ): ICollectionCard {
    this.resourceContentTypeFunct(collection.mimeType)
    return {
      type: this.resourceContentType,
      id: collection.identifier,
      title: collection.name,
      thumbnail: this.forPreview
        ? this.viewSvc.getAuthoringUrl(collection.appIcon)
        : collection.appIcon,
      subText1: collection.resourceType ? collection.resourceType : collection.contentType,
      subText2: collection.complexityLevel,
      duration: collection.duration,
      redirectUrl: this.getCollectionTypeRedirectUrl(
        collection.identifier,
        collection.displayContentType,
      ),
    }
  }

  private getCollectionTypeRedirectUrl(
    identifier: string,
    contentType: string = '',
    displayContentType?: NsContent.EDisplayContentTypes,
  ): string | null {
    let url: string | null
    switch (displayContentType) {
      case NsContent.EDisplayContentTypes.PROGRAM:
      case NsContent.EDisplayContentTypes.COURSE:
      case NsContent.EDisplayContentTypes.MODULE:
        url = `${this.forPreview ? '/author' : '/app'}/toc/${identifier}/overview`
        break
      case NsContent.EDisplayContentTypes.GOALS:
        url = `/app/goals/${identifier}`
        break
      case NsContent.EDisplayContentTypes.PLAYLIST:
        url = `/app/playlist/${identifier}`
        break
      default:
        url = null
    }
    if (contentType) {
      url = `${url}?primaryCategory=${contentType}`
    }
    return url
  }

  private processCollectionForTree() {
    if (this.collection && this.collection.children) {
      let userId
      if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId || ''
      }
      const req: NsContent.IContinueLearningDataReq = {
        request: {
          userId,
          batchId: this.batchId,
          courseId: this.collection.identifier || '',
          contentIds: [],
          fields: ['progressdetails'],
        },
      }
      this.contentSvc.fetchContentHistoryV2(req).subscribe(
        data => {
          if (this.collection && this.collection.children) {
            const mergeData = (collection: any) => {

              collection.map((child1: any, index: any, element: any) => {
                const foundContent = data['result']['contentList'].find((el1: any) => el1.contentId === child1.identifier)
                if (foundContent) {
                  child1.completionPercentage = foundContent.completionPercentage === undefined ? 0 : foundContent.completionPercentage
                  child1.completionStatus = foundContent.status
                  if (this.viewerDataSvc.getNode() && child1.completionPercentage === undefined) {
                    child1.disabledNode = false
                  }
                } else if (this.viewerDataSvc.getNode()) {
                  if (index === 0) {
                    element[index].disabledNode = false
                  } else {
                    element[index].disabledNode = true
                  }

                }
                if (child1.completionPercentage === 100) {
                  if (element && element[index + 1]) {
                    element[index + 1].disabledNode = false
                  }

                }

                if (child1['children']) {

                  child1['children'].map((child2: any, cindex: any) => {
                    // tslint:disable-next-line:max-line-length
                    const foundContent2 = data['result']['contentList'].find((el2: any) => el2.contentId === child2.identifier)
                    if (foundContent2) {
                      child2.completionPercentage = foundContent2.completionPercentage
                      child2.completionStatus = foundContent2.status

                      // tslint:disable-next-line:max-line-length
                    } else if (element[index - 1] && element[index - 1].children[element[index - 1].children.length - 1].completionPercentage === 100) {
                      if (element[index].children.length > 0) {
                        if (cindex === 0) {
                          element[index].children[cindex].disabledNode = false
                        } else {
                          if (element[index].children[cindex - 1] && element[index].children[cindex - 1].completionPercentage === 100) {

                            element[index].children[cindex].disabledNode = false
                          } else {
                            element[index].children[cindex].disabledNode = true
                          }

                        }
                        return
                      }
                      // tslint:disable-next-line: max-line-length
                    } else if (element[index - 1] && element[index - 1].children[element[index - 1].children.length - 1].completionPercentage !== 100) {
                      if (element[index].children.length > 0) {

                        if (element[index].children[cindex - 1] && element[index].children[cindex - 1].completionPercentage === 100) {

                          element[index].children[cindex].disabledNode = false
                        } else {
                          element[index].children[cindex].disabledNode = true
                        }
                        return
                      }
                    } else {

                      if (element[index].children[cindex - 1].completionPercentage !== 100) {
                        element[index].children[cindex].disabledNode = true
                      }
                    }
                  })
                }
              })
            }
            mergeData(this.collection.children)
          }
          this.updateResourceChange()
        },
        (error: any) => {
          // tslint:disable-next-line:no-console
          console.log('CONTENT HISTORY FETCH ERROR >', error)
        },
      )
      this.nestedDataSource.data = this.collection.children
      this.pathSet = new Set()
      // if (this.resourceId && this.tocMode === 'TREE') {
      if (this.resourceId) {
        of(true)
          .pipe(delay(2000))
          .subscribe(() => {
            this.expandThePath()

          })
      }
    }
  }
  updateResourceChange() {
    const currentIndex = this.queue.findIndex(c => c.identifier === this.resourceId)
    const next = currentIndex + 1 < this.queue.length ? this.queue[currentIndex + 1].viewerUrl : null
    const prev = currentIndex - 1 >= 0 ? this.queue[currentIndex - 1].viewerUrl : null
    const nextTitle = currentIndex + 1 < this.queue.length ? this.queue[currentIndex + 1].title : null
    const prevTitle = currentIndex - 1 >= 0 ? this.queue[currentIndex - 1].title : null
    const currentPercentage = currentIndex < this.queue.length ? this.queue[currentIndex].completionPercentage : null
    const prevCompletionPercentage = currentIndex - 1 >= 0 ? this.queue[currentIndex - 1].completionPercentage : null
    // tslint:disable-next-line:object-shorthand-properties-first
    this.viewerDataSvc.updateNextPrevResource({ isValid: Boolean(this.collection), prev, prevTitle, nextTitle, next, currentPercentage, prevCompletionPercentage })
  }
  resourceContentTypeFunct(type: any) {
    if (type === 'application/vnd.ekstep.content-collection' || type === 'application/pdf') {
      this.resourceContentType = 'Lecture'
    } else if (type === 'application/quiz' || type === 'application/json') {
      this.resourceContentType = 'Assessment'
    } else if (type === 'application/html' || type === 'application/vnd.ekstep.html-archive') {
      this.resourceContentType = 'Scrom'
    } else if (type === 'application/x-mpegURL' || type === 'video/mp4') {
      this.resourceContentType = 'Video'
    } else if (type === 'audio/mpeg') {
      this.resourceContentType = 'Audio'
    } else if (type === 'video/x-youtube' || type === 'text/x-url' || type === 'application/web-module') {
      this.resourceContentType = 'Link'
    } else {
      this.resourceContentType = 'Course'
    }
  }

  expandThePath() {
    if (this.collection && this.resourceId) {
      const path = this.utilitySvc.getPath(this.collection, this.resourceId)
      this.pathSet = new Set(path.map((u: { identifier: any }) => u.identifier))
      path.forEach((node: IViewerTocCard) => {
        this.nestedTreeControl.expand(node)
      })
    }
  }

  minimizenav() {
    this.hidenav.emit(false)
    this.hideSideNav = !this.hideSideNav
  }

  public progressColor(): string {
    return '#1D8923'
  }
}
