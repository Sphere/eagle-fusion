import { NestedTreeControl } from '@angular/cdk/tree'
import { Component, EventEmitter, OnDestroy, OnInit, Output, Input, ViewChild, AfterViewInit, ElementRef } from '@angular/core'
import { MatTreeNestedDataSource } from '@angular/material'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import { ActivatedRoute } from '@angular/router'
import {
  ContentProgressService,
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
  viewerUrl: string
  thumbnailUrl: string
  title: string
  duration: number
  type: string
  complexity: string
  progress: any
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
  LOGO: any
}

@Component({
  selector: 'viewer-viewer-toc',
  templateUrl: './viewer-toc.component.html',
  styleUrls: ['./viewer-toc.component.scss'],
})
export class ViewerTocComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() hidenav = new EventEmitter<boolean>()
  @Input() forPreview = false
  @ViewChild('highlightItem', { static: false }) highlightItem!: ElementRef<any>
  @ViewChild('outer', { static: false }) outer!: ElementRef<any>
  @ViewChild('ulTree', { static: false }) ulTree!: ElementRef<any>
  searchCourseQuery = ''
  hideSideNav = false
  reverse = ''
  LOGO = '/fusion-assets/images/green-checked3.svg'

  constructor(
    private activatedRoute: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    // private logger: LoggerService,
    private contentSvc: WidgetContentService,
    private utilitySvc: UtilityService,
    private viewerDataSvc: ViewerDataService,
    private viewSvc: ViewerUtilService,
    private configSvc: ConfigurationsService,
    private contentProgressSvc: ContentProgressService,
  ) {
    this.nestedTreeControl = new NestedTreeControl<IViewerTocCard>(this._getChildren)
    this.nestedDataSource = new MatTreeNestedDataSource()
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
        this.checkIndexOfResource()
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
      this.updateNavigation()
      this.scrollToUserView(index)
    }
  }

  updateNavigation() {
    this.viewerDataSvc.getPrevClick.subscribe(data => {
      this.reverse = data
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
    }, 3000)
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.checkIndexOfResource()
    }, 3000)
  }

  // updateSearchModel(value) {
  //   this.searchModel = value
  //   // this.searchModelChange.emit(this.searchModel)
  // }
  sendStatus(content: any) {
    this.viewSvc.editResourceData(content)
  }

  private getContentProgressHash() {
    this.contentProgressSvc.getProgressHash().subscribe(progressHash => {
      this.contentProgressHash = progressHash
    })
  }

  ngOnDestroy() {
    if (this.paramSubscription) {
      this.paramSubscription.unsubscribe()
    }
    if (this.viewerDataServiceSubscription) {
      this.viewerDataServiceSubscription.unsubscribe()
    }
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
      const currentIndex = this.queue.findIndex(c => c.identifier === this.resourceId)
      const next = currentIndex + 1 < this.queue.length ? this.queue[currentIndex + 1].viewerUrl : null
      const prev = currentIndex - 1 >= 0 ? this.queue[currentIndex - 1].viewerUrl : null
      const nextTitle = currentIndex + 1 < this.queue.length ? this.queue[currentIndex + 1].title : null
      const prevTitle = currentIndex - 1 >= 0 ? this.queue[currentIndex - 1].title : null
      // tslint:disable-next-line:object-shorthand-properties-first
      this.viewerDataSvc.updateNextPrevResource({ isValid: Boolean(this.collection), prev, prevTitle, nextTitle, next })
      this.processCollectionForTree()
      this.expandThePath()
      this.getContentProgressHash()
    }
  }
  private async getCollection(
    collectionId: string,
    _collectionType: string,
  ): Promise<IViewerTocCard | null> {
    try {
      const content: NsContent.IContent = await (this.forPreview
        ? this.contentSvc.fetchAuthoringContent(collectionId)
        : this.contentSvc.fetchContent(collectionId, 'detail')
      ).toPromise()
      // TODO console.log('content',content);
      this.collectionCard = this.createCollectionCard(content)
      const viewerTocCardContent = this.convertContentToIViewerTocCard(content)
      this.isFetching = false
      // TODO console.log("viewcardTocontent", viewerTocCardContent)
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
    // return {
    //   identifier: content.identifier,
    //   viewerUrl: `/viewer/${VIEWER_ROUTE_FROM_MIME(content.mimeType)}/${content.identifier}`,
    //   thumbnailUrl: content.appIcon,
    //   title: content.name,
    //   duration: content.duration,
    //   type: content.displayContentType,
    //   complexity: content.complexityLevel,
    //   children: Array.isArray(content.children) && content.children.length ?
    //     content.children.map(child => this.convertContentToIViewerTocCard(child)) : null,
    // }
    return {
      identifier: content.identifier,
      viewerUrl: `${this.forPreview ? '/author' : ''}/viewer/${VIEWER_ROUTE_FROM_MIME(
        content.mimeType,
      )}/${content.identifier}`,
      thumbnailUrl: this.forPreview
        ? this.viewSvc.getAuthoringUrl(content.appIcon)
        : content.appIcon,
      title: content.name,
      duration: content.duration,
      type: content.resourceType ? content.resourceType : content.contentType,
      complexity: content.complexityLevel,
      progress: content.progress ? content.progress.progress : '',
      children:
        Array.isArray(content.children) && content.children.length
          ? content.children.map(child => this.convertContentToIViewerTocCard(child))
          : null,
    }
  }

  private createCollectionCard(
    collection: NsContent.IContent | NsContent.IContentMinimal,
  ): ICollectionCard {
    // return {
    //   type: this.getCollectionTypeCard(collection.displayContentType),
    //   id: collection.identifier,
    //   title: collection.name,
    //   thumbnail: collection.appIcon,
    //   subText1: collection.displayContentType || collection.contentType,
    //   subText2: collection.complexityLevel,
    //   duration: collection.duration,
    //   redirectUrl: this.getCollectionTypeRedirectUrl(collection.displayContentType, collection.identifier),
    // }
    return {
      type: this.getCollectionTypeCard(collection.displayContentType),
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

  private getCollectionTypeCard(
    displayContentType?: NsContent.EDisplayContentTypes,
  ): TCollectionCardType | null {
    switch (displayContentType) {
      case NsContent.EDisplayContentTypes.PROGRAM:
      case NsContent.EDisplayContentTypes.COURSE:
      case NsContent.EDisplayContentTypes.MODULE:
        return 'content'
      case NsContent.EDisplayContentTypes.GOALS:
        return 'goals'
      case NsContent.EDisplayContentTypes.PLAYLIST:
        return 'playlist'
      default:
        return null
    }
  }

  private getCollectionTypeRedirectUrl(
    identifier: string,
    displayContentType?: NsContent.EDisplayContentTypes,
  ): string | null {
    switch (displayContentType) {
      case NsContent.EDisplayContentTypes.PROGRAM:
      case NsContent.EDisplayContentTypes.COURSE:
      case NsContent.EDisplayContentTypes.MODULE:
        return `${this.forPreview ? '/author' : '/app'}/toc/${identifier}/overview`
      case NsContent.EDisplayContentTypes.GOALS:
        return `/app/goals/${identifier}`
      case NsContent.EDisplayContentTypes.PLAYLIST:
        return `/app/playlist/${identifier}`
      default:
        return null
    }
  }

  private processCollectionForTree() {
    if (this.collection && this.collection.children) {
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
}
