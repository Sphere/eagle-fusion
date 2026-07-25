import { NestedTreeControl } from '@angular/cdk/tree'
import {
  Component, EventEmitter, OnDestroy, OnInit, Output, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, ChangeDetectorRef,
  ChangeDetectionStrategy, NgZone,
} from '@angular/core'
import { MatTreeNestedDataSource } from '@angular/material/tree'
import { MatDialog, MatDialogRef } from '@angular/material/dialog'
import { SafeUrl } from '@angular/platform-browser'
import { ActivatedRoute, ParamMap, Router } from '@angular/router'
import {
  NsContent,
  VIEWER_ROUTE_FROM_MIME,
  WidgetContentService,
} from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import {
  ConfigurationsService,
  LoggerService,
  SafeResourceUrlService,
  UtilityService,
} from '@ws-widget/utils'
import { of, Subscription } from 'rxjs'
import { catchError, delay } from 'rxjs/operators'
import { ViewerDataService } from '../../viewer-data.service'
import { ViewerUtilService } from '../../viewer-util.service'
import { isNull, isEmpty } from 'lodash-es'
import { PlayerStateService, buildPlayerStateForResource } from '../../player-state.service'
import { saveAs } from 'file-saver'
import { ConfirmmodalComponent } from 'project/ws/viewer/src/lib/plugins/quiz/confirm-modal-component'
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
  artifactUrl: string
  showDownloadBtn: string
}
import { HttpClient } from '@angular/common/http'
import { IndexedDBService } from 'src/app/services/online-indexed-db.service'
import { QuizService } from '../../plugins/quiz/quiz.service'
import { CongratulationsPopupComponent } from '../../plugins/quiz/components/congratulations-popup/congratulations-popup.component'
import { CompleteCoursesModalComponent } from '../../plugins/quiz/components/complete-courses-modal/complete-courses-modal.component'
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
  standalone: false,
  selector: 'viewer-viewer-toc',
  templateUrl: './viewer-toc.component.html',
  styleUrls: ['./viewer-toc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  collectionId: any = ''
  resourceContentType: any
  disabledNode: boolean
  currentContentType: any = ''
  heirarchy: any
  isAsha = false
  constructor(
    private readonly http: HttpClient,
    private readonly activatedRoute: ActivatedRoute,
    private readonly safeResourceUrlSvc: SafeResourceUrlService,
    private readonly contentSvc: WidgetContentService,
    private readonly utilitySvc: UtilityService,
    private readonly viewerDataSvc: ViewerDataService,
    private readonly viewSvc: ViewerUtilService,
    private readonly configSvc: ConfigurationsService,
    private readonly playerStateService: PlayerStateService,
    public router: Router,
    public dialog: MatDialog,
    private readonly onlineIndexedDbService: IndexedDBService,
    public quizService: QuizService,
    private readonly cdr: ChangeDetectorRef,
    private readonly ngZone: NgZone,
    private readonly logger: LoggerService
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
  change: Subscription | null = null
  progresSub: Subscription | null = null
  message!: string
  subscription: Subscription | null = null
  isLoading = true
  private cachedRating: any = null  // Cache rating to avoid repeated API calls
  // tslint:disable-next-line
  hasNestedChild = (_: number, nodeData: IViewerTocCard) =>
    nodeData && nodeData.children && nodeData.children.length
  private readonly _getChildren = (node: IViewerTocCard) => {
    return node && node.children ? node.children : []
  }

  ngOnInit() {

    this.isLoading = true
    if (this.configSvc.instanceConfig) {
      this.defaultThumbnail = this.safeResourceUrlSvc.trust(
        this.configSvc.instanceConfig.logos.defaultContent,
      )
    }
    this.paramSubscription = this.activatedRoute.queryParamMap.subscribe(params => {
      void this.handleQueryParams(params)
    })

    this.viewerDataServiceSubscription = this.viewerDataSvc.changedSubject.subscribe(_data => {
      this.logger.log(_data, '180')
      if (this.resourceId !== this.viewerDataSvc.resourceId) {
        this.resourceId = this.viewerDataSvc.resourceId
        // Restore course gating — individual resources don't carry the gatingEnabled flag
        if (this.heirarchy) {
          this.viewerDataSvc.setNode(this.heirarchy.gatingEnabled)
        }
        this.seedPlayerStateForCurrentResource()
        setTimeout(() => {
          this.processCurrentResourceChange()
          this.checkIndexOfResource()
        }, 0)
      }
    })
    this.viewerDataServiceSubscription = this.viewerDataSvc.scromChangeSubject.subscribe(data => {
      this.logger.log(data, '188')
      if (data) {
        if (this.playerStateService.trigger$.getValue() === undefined || this.playerStateService.trigger$.getValue() === 'not-triggered') {
          this.scromUpdateCheck(data)

          setTimeout(() => {
            if (this.playerStateService.isResourceCompleted()) {

              const nextResource = this.playerStateService.getNextResource()
              if (!(isNull(nextResource) || isEmpty(nextResource))) {
                this.router.navigate([nextResource], { queryParamsHandling: 'preserve' })
                this.playerStateService.trigger$.complete()

              } else if (this.isAsha) {
                this.completeCourseNavigation()
              } else {
                alert('No more resources to play')
                this.router.navigate([`/app/toc/${this.collectionId}/overview`], {
                  queryParams: {
                    primaryCategory: 'Course',
                    batchId: this.batchId,
                  },
                })
              }

            }
          }, 500)
        }
      }

    })
  }

  private async handleQueryParams(params: ParamMap) {
    this.batchId = params.get('batchId')
    this.collectionId = params.get('collectionId')
    // isAsha isn't always propagated onto the viewer route, so also fall back to the ASHA
    // context on contentSvc (set when an ASHA course is launched). Validate that context
    // against the CURRENT course (contentid === collectionId) — otherwise a stale ASHA
    // context from a previous session would wrongly treat a normal course as ASHA and
    // pop the CompleteCoursesModalComponent. The ASHA modal is strictly ASHA-only.
    const ashaContext = this.contentSvc.getAshaData()
    const ashaContextMatchesCourse = !!(ashaContext && ashaContext.isAsha &&
      String(ashaContext.contentid) === String(this.collectionId))
    this.isAsha = params.get('isAsha') === 'true' || ashaContextMatchesCourse

    if (this.collectionId) {
      localStorage.setItem('collectionId', this.collectionId)
    }
    await this.resolveCollectionFromParams(params)
    this.handlePostCollectionResourceNavigation()
  }

  private async resolveCollectionFromParams(params: ParamMap) {
    const collectionId = params.get('collectionId')
    const collectionType = params.get('collectionType')
    if (!collectionId || !collectionType) {
      return
    }
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
    setTimeout(() => {
      this.isFetching = false
      this.cdr.markForCheck()
    }, 0)
  }

  private handlePostCollectionResourceNavigation() {
    if (!this.resourceId) {
      return
    }
    this.processCurrentResourceChange()
    if (this.currentContentType !== 'Video' || !this.playerStateService.isResourceCompleted()) {
      return
    }
    const nextResource = this.playerStateService.getNextResource()
    if (!(isNull(nextResource) || isEmpty(nextResource))) {
      this.router.navigate([nextResource], { queryParamsHandling: 'preserve' })
      this.playerStateService.trigger$.complete()
    } else if (this.isCurrentResourceLastLeaf()) {
      // Only return to the overview when the completed video is genuinely
      // the final leaf. Previously an unresolved next-resource (empty
      // string, e.g. before playerState is populated) also fell here and
      // bounced a completed mid-course video back to the TOC.
      this.router.navigate([`/app/toc/${this.collectionId}/overview`], {
        queryParams: {
          primaryCategory: 'Course',
          batchId: this.batchId,
        },
      })
    }
  }

  downloadResource(content: any) {
    const fileUrl = content.artifactUrl
    this.logger.log('fileUrl: ', content)
    // Make the HTTP GET request
    this.http.get(fileUrl, {
      responseType: 'blob', // Set the response type as blob
    })
      .subscribe((response: Blob) => {
        // Save the file using FileSaver
        saveAs(response, content.title) // Replace 'filename.ext' with your desired file name and extension
      })
  }
  async scromUpdateCheck(data: any) {
    this.batchId = data.batchId
    const collectionId = data.collectionId
    const collectionType = data.collectionType
    if (collectionId && collectionType) {
      if (
        collectionType.toLowerCase() ===
        NsContent.EMiscPlayerSupportedCollectionTypes.PLAYLIST.toLowerCase()
      ) {
      } else if (
        collectionType.toLowerCase() === NsContent.EContentTypes.MODULE.toLowerCase() ||
        collectionType.toLowerCase() === NsContent.EContentTypes.COURSE.toLowerCase() ||
        collectionType.toLowerCase() === NsContent.EContentTypes.PROGRAM.toLowerCase()
      ) {
      } else {
        this.isErrorOccurred = true
      }
      if (this.collection) {
        this.queue = this.utilitySvc.getLeafNodes(this.collection, [])
      }
    }
    this.processCurrentResourceChange()
    this.checkIndexOfResource()
  }

  checkIndexOfResource() {
    if (this.collection) {
      const index = this.queue.findIndex(x => x.identifier === this.resourceId)
      this.scrollToUserView(index)
    }
  }

  /**
   * True only when the current resource is the last leaf node in the collection
   * queue. Used to decide whether a completed video should return to the course
   * overview — we must not bounce back to the TOC for mid-course resources just
   * because the next resource couldn't be resolved yet.
   */
  private isCurrentResourceLastLeaf(): boolean {
    if (!this.queue || !this.queue.length || !this.resourceId) {
      return false
    }
    const index = this.queue.findIndex(x => x.identifier === this.resourceId)
    return index >= 0 && index === this.queue.length - 1
  }
  ngOnChanges() {
    this.change = this.contentSvc.currentMessage.subscribe((data: any) => {
      if (data) {
        this.currentContentType = data.type
        if (data.type === 'scorm') {
          localStorage.setItem('contentId', window.location.href)
        } else {
          localStorage.removeItem('contentId')
        }
        this.processCollectionForTree(data)

        if (data.contentList && this.collection && this.collection.children) {
          this.updateTreeNodesWithProgress(this.collection.children, data.contentList)
          this.nestedDataSource.data = [...this.collection.children]
          this.ngZone.run(() => {
            this.updateResourceChange()
            this.cdr.detectChanges()
          })
        }
      }
    })
  }

  /**
   * Update tree node completionPercentage values from progress message data
   * **CRITICAL**: Without this, the UI doesn't show the green tick even though storage is updated
   */
  private updateTreeNodesWithProgress(nodes: IViewerTocCard[], contentListData: any[]): void {
    if (!nodes || !contentListData) return

    nodes.forEach((node: IViewerTocCard) => {
      // Find matching content in the new progress data
      const matchingContent = contentListData.find((item: any) => item.contentId === node.identifier)
      if (matchingContent && matchingContent.completionPercentage !== undefined) {
        // **CRITICAL**: Update the tree node's completionPercentage immediately
        // This triggers Angular change detection and shows the progress circle/tick in the UI
        node.completionPercentage = matchingContent.completionPercentage
        node.completionStatus = matchingContent.status ?? node.completionStatus ?? 0
        this.logger.log(`Updated tree node: ${node.identifier} completionPercentage: ${node.completionPercentage}, status: ${node.completionStatus}`)
      }

      // Recursively update child nodes
      if (node.children && node.children.length > 0) {
        this.updateTreeNodesWithProgress(node.children, contentListData)
      }
    })
  }
  scrollToUserView(index: number) {

    setTimeout(() => {
      if (index > 3) {
        if (this.highlightItem?.nativeElement?.classList.contains('li-active')) {

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
      this.isFetching = false
      this.checkIndexOfResource()
    }, 300)
  }
  sendStatus(content: any) {
    content['openOverviewDialog'] = content.type === 'Assessment'
    this.viewSvc.editResourceData(content)
  }

  ngOnDestroy() {
    if (this.paramSubscription) {
      this.paramSubscription.unsubscribe()
    }
    if (this.viewerDataServiceSubscription) {
      this.viewerDataServiceSubscription.unsubscribe()
    }
    if (this.change) {
      this.change.unsubscribe()
    }
    if (this.progresSub) {
      this.progresSub.unsubscribe()
    }

  }
  changeTocMode() {
    if (this.tocMode === 'FLAT') {
      this.tocMode = 'TREE'
    } else {
      this.tocMode = 'FLAT'
    }
  }

  private processCurrentResourceChange() {
    if (this.collection && this.resourceId) {
      this.processCollectionForTree()
      this.expandThePath()
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
      this.heirarchy = content
      // Always set gating flag, even if false (previous course gating flag must be reset)
      if (content) {
        this.viewerDataSvc.setNode(content.gatingEnabled)
      }
      this.resourceContentTypeFunct(content.mimeType)
      this.collectionCard = this.createCollectionCard(content)
      const viewerTocCardContent = this.convertContentToIViewerTocCard(content)
      return viewerTocCardContent
    } catch (err: any) {
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
      return viewerTocCardContent
    } catch (err: any) {
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
      artifactUrl: content.artifactUrl,
      showDownloadBtn: content.showDownloadBtn || 'No',
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
    contentType = '',
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
  async processData(data?: any) {
    this.logger.log(data, 'data')
    this.isLoading = true
    if (this.collection) {
      this.queue = this.utilitySvc.getLeafNodes(this.collection, [])
    }

    if (this.collection && this.collection.children) {
      const mergeData = (collection: any) => {
        this.logger.log(data, 'ssssssssssss')
        collection.forEach((child1: any, index: any, element: any) => {
          const foundContent = data.find((el1: any) => el1.contentId === child1.identifier)

          if (foundContent) {
            child1.completionPercentage = foundContent.completionPercentage === undefined ? 0 : foundContent.completionPercentage
            child1.completionStatus = foundContent.status
            if (this.viewerDataSvc.getNode() && child1.completionPercentage === undefined) {
              child1.disabledNode = false
            }
          } else if (this.viewerDataSvc.getNode()) {
            if (index === 0) {
              element[index].disabledNode = false
              if (child1.completionPercentage === 100) {
                if (element && element[index + 1]) {
                  element[index + 1].disabledNode = false
                }
              }
            } else {
              if (element[index + 1]) {
                element[index + 1].disabledNode = true
              }
            }
          }
          if (child1.completionPercentage === 100) {
            if (element && element[index + 1]) {
              element[index + 1].disabledNode = false
            }
          } else {
            if (element[index + 1]) {
              element[index + 1].disabledNode = this.viewerDataSvc.getNode()
            }
          }

          if (child1['children']) {

            child1['children'].map((child2: any, cindex: any) => {
              // tslint:disable-next-line:max-line-length
              const foundContent2 = data.find((el2: any) => el2.contentId === child2.identifier)
              if (foundContent2) {
                child2.completionPercentage = foundContent2.completionPercentage
                child2.completionStatus = foundContent2.status

                // tslint:disable-next-line:max-line-length
              } else if (element[index - 1]?.children?.[element[index - 1]?.children?.length - 1]?.completionPercentage === 100) {
                if (element[index].children.length > 0) {
                  if (cindex === 0) {
                    element[index].children[cindex].disabledNode = false
                  } else {
                    if (element[index].children[cindex - 1] && element[index].children[cindex - 1].completionPercentage === 100) {

                      element[index].children[cindex].disabledNode = false
                    } else {
                      if (this.viewerDataSvc.getNode()) {
                        element[index].children[cindex].disabledNode = true
                      } else {
                        element[index].children[cindex].disabledNode = false
                      }

                    }

                  }
                  return
                }
                // tslint:disable-next-line: max-line-length
              } else if (
                element[index - 1]?.children?.length &&
                element[index - 1]?.children?.[element[index - 1].children.length - 1]?.completionPercentage !== 100) {
                if (element[index].children.length > 0) {

                  if (element[index].children[cindex - 1] && element[index].children[cindex - 1].completionPercentage === 100) {

                    element[index].children[cindex].disabledNode = false
                  } else {
                    if (this.viewerDataSvc.getNode()) {
                      element[index].children[cindex].disabledNode = true
                    } else {
                      element[index].children[cindex].disabledNode = false
                    }

                  }
                  return
                }
              } else {

                if (element[index].children[cindex - 1]) {
                  if (element[index].children[cindex - 1].completionPercentage === 100) {
                    element[index].children[cindex].disabledNode = false
                  } else if (this.viewerDataSvc.getNode()) {
                    element[index].children[cindex].disabledNode = true
                  } else {
                    element[index].children[cindex].disabledNode = false
                  }
                }
              }
            })
          }
        })
      }
      mergeData(this.collection.children)
    }
    // this.isLoading = false
    this.updateResourceChange()
  }

  updateKeyIfMatch(arr1: any, arr2: any, keyToUpdate: string): number {
    const targetUrl = this.router.url
    const urlParams = targetUrl.split('/')
    const courseId = urlParams[3]
    const userID = this.configSvc.userProfile!.userId

    arr2.forEach((obj2: any) => {
      const obj1 = arr1.find((o: any) => o.contentId === obj2.contentId)

      if (obj1) {
        // Update the existing object in arr1 if the keyToUpdate value is different AND obj2 has the value
        // **CRITICAL**: Only update if obj2[keyToUpdate] is defined - this prevents undefined from wiping out existing values
        if (obj2[keyToUpdate] !== undefined && obj1[keyToUpdate] !== obj2[keyToUpdate]) {
          this.logger.log(`Updating ${obj2.contentId} ${keyToUpdate}: ${obj1[keyToUpdate]} → ${obj2[keyToUpdate]}`)
          obj1[keyToUpdate] = obj2[keyToUpdate]
        }
      } else {
        // Add the new object from arr2 to arr1
        arr1.push(obj2)
      }
    })
    this.logger.log(arr1, 'arr1')
    this.logger.log(userID, courseId)
    this.onlineIndexedDbService.insertData(userID, this.collectionId, 'onlineCourseProgress', arr1).subscribe(
      () => {
        this.logger.log('Data inserted successfully2')
      },
      error => {
        this.logger.error('Error inserting data:', error)
      }
    )
    const uniqueIdsOfType = this.uniqueIdsByContentType(this.heirarchy!.children, 'Resource')
    this.logger.log(uniqueIdsOfType.length, this.heirarchy!.childNodes.length) // Output: [1, 3]
    // Only aggregate progress for resources that still exist in the current course
    // hierarchy. Editing a live course leaves orphaned progress records for removed
    // resources; their 100% would otherwise inflate the numerator (e.g. 5×100 over a
    // 5-resource course reads as 100%), making the viewer think the whole course is
    // complete and bounce the learner to the overview the moment a still-incomplete
    // resource (e.g. भाग 2-1) loads.
    const currentResourceIds = new Set(uniqueIdsOfType)
    const relevantProgress = arr1.filter((o: any) => currentResourceIds.has(o.contentId))
    const aggregateValue = this.calculateAggregate(relevantProgress, 'completionPercentage')
    this.logger.log('Aggregate value:', aggregateValue)
    this.logger.log(this.heirarchy, 'content')
    const denominator = uniqueIdsOfType.length * 100
    const percentage = denominator ? Math.round((aggregateValue) / denominator * 100) : 0
    this.logger.log(percentage, 'percentage', Math.min(Math.max(percentage, 0), 100))
    const progress = Math.min(Math.max(percentage, 0), 100)
    return progress
  }
  calculateAggregate(arr: any, field: string): number {
    const val = arr.reduce((total: number, obj: any) => total + (Number(obj[field]) || 0), 0)
    this.logger.log(val)
    return val
  }

  uniqueIdsByContentType(obj: any, contentType: any, uniqueIds = new Set()) {
    // Check if the current object is an array
    if (Array.isArray(obj)) {
      // If array, recursively call extractUniqueIds for each element
      obj.forEach(item => this.uniqueIdsByContentType(item, contentType, uniqueIds))
    } else if (typeof obj === 'object' && obj !== null) {
      // If object, check if it has contentType and add id to uniqueIds if contentType matches
      if (obj.contentType === contentType && obj.identifier !== undefined) {
        uniqueIds.add(obj.identifier)
      }
      // Recursively call extractUniqueIds for each property value
      Object.values(obj).forEach(value => this.uniqueIdsByContentType(value, contentType, uniqueIds))
    }
    // Return uniqueIds as an array (if needed)
    return [...uniqueIds]

  }
  private async processCollectionForTree(content?: any) {
    this.logger.log(content, 'processCollectionForTree')
    // Restore course gating flag — resolver resets it on every resource navigation,
    // and individual resources don't carry gatingEnabled (only the course collection does)
    if (this.heirarchy) {
      this.viewerDataSvc.setNode(this.heirarchy.gatingEnabled)
    }
    if (content && content.contentList) {
      this.logger.log(content)
      await this.processData(content.contentList)

      let req
      let rowData: any
      let optmisticPercentage: any
      req = {
        request: {
          userId: [this.configSvc.userProfile!.userId],
          activityId: this.collectionId,
          activityType: "Course",
        },
      }

      // Use cached rating to avoid repeated API calls during progress updates
      let rating = this.cachedRating
      if (!this.cachedRating) {
        rating = await this.contentSvc.readCourseRating(req).then((res: any) => {
          if (res && res.params.status === 'success') {
            // Cache the rating result
            this.cachedRating = res.result
            return res.result
          }
        })
      }
      this.onlineIndexedDbService.getRecordFromTable('onlineCourseProgress', this.configSvc.userProfile!.userId, this.collectionId).subscribe(record => {
        void (async () => {
          this.logger.log('Record:', record)
          rowData = await record
          const dat = JSON.parse(rowData.data)
          this.logger.log(dat, 'dat')
          if (dat && dat.length) {
            optmisticPercentage = await this.updateKeyIfMatch(dat, content.contentList, 'completionPercentage')
          }

          this.logger.log(rating, optmisticPercentage)

          if (content.type) {
            if (this.playerStateService.isResourceCompleted()) {
              const nextResource = this.playerStateService.getNextResource()
              this.logger.log(nextResource)
              const regex = /do_\d+/ // Regular expression to match "do_" followed by one or more digits
              const match = nextResource.match(regex)
              let foundObject: any
              if (match) {
                this.logger.log(match[0]) // Output: "do_11357407388494233611489"
                this.logger.log(this.collection!.children)
                foundObject = this.collection!.children!.find(obj => obj.identifier === match[0])
                if (foundObject) {
                  this.logger.log(foundObject) // Output the object if a match is found
                } else {
                  this.logger.log('No matching object found')
                }
              } else {
                this.logger.log('No match found')
              }
              if (!(isEmpty(nextResource) || isNull(nextResource))) {

                if (content.type === "scorm" || content.type === "assessment" || content.type === "quiz") {
                  this.logger.log(foundObject, 'foundObject')
                  if (!foundObject || (foundObject.type !== "Scrom" && foundObject.completionPercentage === 100)) {
                    this.router.navigate([nextResource], { queryParamsHandling: 'preserve' }).then(success => {
                      if (success) {
                        this.playerStateService.trigger$.complete()
                      }
                    }).catch(error => {
                      this.logger.error('Navigation error:', error)
                    })
                  } else {
                    // External navigation or fallback
                    this.isLoading = true
                    const modifiedString = nextResource.replace('/', '')
                    const url = `${document.baseURI}${modifiedString}?primaryCategory=Learning%20Resource&collectionId=${this.collection!.identifier}&collectionType=Course&batchId=${this.batchId}`
                    this.logger.log('Redirecting to URL:', url)

                    setTimeout(() => {
                      window.location.href = url
                    }, 30)

                    setTimeout(() => {
                      this.isLoading = false
                    }, 60)
                  }
                }
              } else if (this.contentSvc.showConformation) {
                let finalCompetencies = []
                if (this.heirarchy && this.heirarchy.competencies_v1 && this.heirarchy.competencies_v1.length > 0) {
                  const competencies_v1 = JSON.parse(this.heirarchy.competencies_v1)

                  finalCompetencies = competencies_v1.map((competency: any) => {
                    return {
                      competencyName: competency.competencyName,
                      competencyLevel: competency.level,
                      competencyId: competency.competencyId,
                    }
                  })
                  this.logger.log("finalCompetencies", finalCompetencies)
                }
                const data = {
                  courseId: this.collectionId,
                }
                this.logger.log("data", this.collectionId, data)
                const isDialogOpen = this.dialog.openDialogs.length > 0
                let confirmdialog: MatDialogRef<ConfirmmodalComponent> | undefined

                // If the dialog is not already open, open it
                if (!isDialogOpen && optmisticPercentage === 100 && Object.keys(rating).length === 0 && data) {
                  if (finalCompetencies.length > 0) {
                    finalCompetencies.forEach((competency: any) => {
                      this.updatePassbookEntryPassbook(data, competency)
                    })
                  }

                  const delay = this.resourceContentType.toLowerCase().includes('video') ? 2000 : 0
                  setTimeout(() => {
                    this.openCongratulationPopup().then(isCompleted => {
                      if (isCompleted) {
                        confirmdialog = this.dialog.open(ConfirmmodalComponent, {
                          width: '300px',
                          height: '420px',
                          panelClass: 'overview-modal',
                          backdropClass: 'overview-backdrop',
                          disableClose: true,
                          data: { request: data, message: 'Congratulations!, you have completed the course' },
                        })

                        if (confirmdialog) {
                          confirmdialog.afterClosed().subscribe((res: any) => {
                            if (res && res.event === 'CONFIRMED') {
                              this.completeCourseNavigation()
                            }
                          })
                        }
                      }
                    })
                  }, delay)
                }
              } else {
                let finalCompetencies = []
                if (this.heirarchy && this.heirarchy.competencies_v1 && this.heirarchy.competencies_v1.length > 0) {
                  const competencies_v1 = JSON.parse(this.heirarchy.competencies_v1)

                  finalCompetencies = competencies_v1.map((competency: any) => {
                    return {
                      competencyName: competency.competencyName,
                      competencyLevel: competency.level,
                      competencyId: competency.competencyId,
                    }
                  })
                  this.logger.log("finalCompetencies", finalCompetencies)
                }
                this.logger.log(rating, optmisticPercentage)
                const data = {
                  courseId: this.collectionId,
                }
                this.logger.log("data", this.collectionId, data)
                const isDialogOpen = this.dialog.openDialogs.length > 0
                let confirmdialog: MatDialogRef<ConfirmmodalComponent> | undefined

                // If the dialog is not already open, open it
                if (!isDialogOpen && optmisticPercentage === 100 && Object.keys(rating).length === 0) {
                  if (finalCompetencies.length > 0) {
                    finalCompetencies.forEach((competency: any) => {
                      this.updatePassbookEntryPassbook(data, competency)
                    })
                  }

                  const delay = this.resourceContentType.toLowerCase().includes('video') ? 2000 : 0
                  setTimeout(() => {
                    this.openCongratulationPopup().then(isCompleted => {
                      if (isCompleted) {
                        confirmdialog = this.dialog.open(ConfirmmodalComponent, {
                          width: '300px',
                          height: '420px',
                          panelClass: 'overview-modal',
                          backdropClass: 'overview-backdrop',
                          disableClose: true,
                          data: { request: data, message: 'Congratulations!, you have completed the course' },
                        })

                        if (confirmdialog) {
                          confirmdialog.afterClosed().subscribe((res: any) => {
                            if (res && res.event === 'CONFIRMED') {
                              this.completeCourseNavigation()
                            }
                          })
                        }
                      }
                    })
                  }, delay)
                }
                if (optmisticPercentage === 100 && Object.keys(rating).length > 0) {
                  this.completeCourseNavigation()
                }

              }
            } else {
              this.logger.log(rating, optmisticPercentage)
              if (optmisticPercentage === 100) {
                this.completeCourseNavigation()
              }
            }
          } else {
            if (this.playerStateService.isResourceCompleted()) {
              if (isNull(this.playerStateService.getNextResource()) || isEmpty(this.playerStateService.getNextResource())
                && this.contentSvc.showConformation) {
                let finalCompetencies = []
                if (this.heirarchy && this.heirarchy.competencies_v1 && this.heirarchy.competencies_v1.length > 0) {
                  const competencies_v1 = JSON.parse(this.heirarchy.competencies_v1)

                  finalCompetencies = competencies_v1.map((competency: any) => {
                    return {
                      competencyName: competency.competencyName,
                      competencyLevel: competency.level,
                      competencyId: competency.competencyId,
                    }
                  })
                  this.logger.log("finalCompetencies", finalCompetencies)
                }
                const data = {
                  courseId: this.collectionId,
                }
                this.logger.log("data", this.collectionId, data)
                // Check if the dialog is already open
                const isDialogOpen = this.dialog.openDialogs.length > 0
                let confirmdialog: MatDialogRef<ConfirmmodalComponent> | undefined
                this.logger.log(optmisticPercentage, Object.keys(rating).length)
                if (!isDialogOpen && optmisticPercentage === 100 && Object.keys(rating).length === 0) {
                  if (finalCompetencies.length > 0) {
                    finalCompetencies.forEach((competency: any) => {
                      this.updatePassbookEntryPassbook(data, competency)
                    })
                  }

                  const delay = this.resourceContentType.toLowerCase().includes('video') ? 2000 : 0
                  setTimeout(() => {
                    this.openCongratulationPopup().then(isCompleted => {
                      if (isCompleted) {
                        confirmdialog = this.dialog.open(ConfirmmodalComponent, {
                          width: '300px',
                          height: '420px',
                          panelClass: 'overview-modal',
                          backdropClass: 'overview-backdrop',
                          disableClose: true,
                          data: { request: data, message: 'Congratulations!, you have completed the course' },
                        })

                        if (confirmdialog) {
                          confirmdialog.afterClosed().subscribe((res: any) => {
                            if (res && res.event === 'CONFIRMED') {
                              this.completeCourseNavigation()
                            }
                          })
                        }
                      }
                    })
                  }, delay)
                } else {
                  if (optmisticPercentage === 100) {
                    this.completeCourseNavigation()
                  }
                }
              } else {
                this.logger.log('lll', dat)
                const nextResource = this.playerStateService.getNextResource()
                const regex = /do_\d+/
                const match: any = nextResource.match(regex)
                this.logger.log(match[0])
                const courseData1 = await this.contentSvc.fetchContent(this.resourceId!).toPromise()
                const courseData2 = await this.contentSvc.fetchContent(match[0]).toPromise()
                this.logger.log(courseData2)
                const foundContent1 = dat.find((el1: any) => el1.contentId === this.resourceId)

                const foundContent2 = dat.find((el2: any) => el2.contentId === match[0])
                this.logger.log(foundContent1, foundContent2)
                this.logger.log(nextResource, this.resourceId)
                if (
                  foundContent1.completionPercentage === 100 &&
                  (courseData1.mimeType === 'application/json')
                  &&
                  (!foundContent2 || foundContent2.completionPercentage === 0)
                ) {
                  this.router.navigate([nextResource], { queryParamsHandling: 'preserve' })
                }
              }
            }
          }
        })()
      }, error => {
        this.logger.error('Error:', error)
        const userID = this.configSvc.userProfile!.userId
        this.onlineIndexedDbService.insertData(userID, this.collectionId, 'onlineCourseProgress', content.contentList).subscribe(
          (dat: any) => {
            this.logger.log('Data inserted successfully1', dat)
            this.onlineIndexedDbService.getRecordFromTable('onlineCourseProgress', userID, this.collectionId).subscribe(record => {
              void (async () => {
                this.logger.log('Record:', record)
                rowData = await record
                const dat = JSON.parse(rowData.data)
                this.logger.log(dat)
                if (dat && dat.length) {
                  optmisticPercentage = this.updateKeyIfMatch(dat, content.contentList, 'completionPercentage')
                  this.logger.log(optmisticPercentage, 'foundContent', '942')
                  if (content.type === "scorm" || content.type === "assessment" || content.type === "quiz") {
                    if (this.playerStateService.isResourceCompleted()) {
                      const nextResource = this.playerStateService.getNextResource()
                      if (!(isEmpty(nextResource) || isNull(nextResource))) {
                        this.router.navigate([nextResource], { queryParamsHandling: 'preserve' }).then(success => {
                          if (success) {
                            this.playerStateService.trigger$.complete()
                          }
                        }).catch(error => {
                          this.logger.error('Navigation error:', error)
                        })
                      }
                    }
                  }

                }
              })()
            }, error => {
              this.logger.error('Error:', error)
            })
          },
          error => {
            this.logger.error('Error inserting data:', error)
          }
        )
      })
    } else {
      if (this.collection && this.collection.children) {
        this.isLoading = true
        const resourceData = await this.contentSvc.fetchContent(this.resourceId!).toPromise()
        this.logger.log(resourceData, 'resourceData')
        this.logger.log(resourceData.result.content.mimeType)
        if (resourceData.result.content.mimeType !== 'application/vnd.ekstep.html-archive') {
          localStorage.removeItem('contentId')
        }
        let userId
        if (this.configSvc.userProfile) {
          userId = this.configSvc.userProfile.userId || ''
        }
        const req: NsContent.IContinueLearningDataReq = {
          request: {
            userId,
            batchId: this.batchId,
            courseId: this.collection.identifier || '',
            contentIds: this.queue && this.queue.length > 0 ? this.queue.map((item: any) => item.identifier) : [],
            fields: ['progressdetails'],
          },
        }
        this.progresSub = this.contentSvc.fetchContentHistoryV2(req).subscribe(data => {
          void (async () => {
            // tslint:disable-next-line: no-console
            this.logger.log(data['result']['contentList'])
            // Ensure gating state is restored from the course hierarchy before mergeData runs
            // (resolver resets gatingEnabled per resource, individual resources don't carry the flag)
            if (this.heirarchy) {
              this.viewerDataSvc.setNode(this.heirarchy.gatingEnabled)
            }
            if (this.collection && this.collection.children) {
              const mergeData = (collection: any) => {

                collection.forEach((child1: any, index: any, element: any) => {
                  void (async () => {
                    const foundContent = await data['result']['contentList'].find((el1: any) => el1.contentId === child1.identifier)

                    if (foundContent) {
                      child1.completionPercentage = foundContent.completionPercentage === undefined ? 0 : foundContent.completionPercentage
                      child1.completionStatus = foundContent.status
                      if (this.viewerDataSvc.getNode() && child1.completionPercentage === undefined) {
                        child1.disabledNode = false
                      }
                    } else if (this.viewerDataSvc.getNode()) {
                      if (index === 0) {
                        element[index].disabledNode = false
                        if (child1.completionPercentage === 100) {
                          if (element && element[index + 1]) {
                            element[index + 1].disabledNode = false
                          }
                        }
                      } else {
                        if (element[index + 1]) {
                          element[index + 1].disabledNode = true
                        }
                      }
                    }
                    if (child1.completionPercentage === 100) {
                      if (element && element[index + 1]) {
                        element[index + 1].disabledNode = false
                      }
                    } else {
                      if (element[index + 1]) {
                        element[index + 1].disabledNode = this.viewerDataSvc.getNode()
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
                        } else if (this.viewerDataSvc.getNode() && this.viewerDataSvc.resourceId === child2.identifier) {
                          this.logger.log('entered')
                          child2.disabledNode = false

                        } else if (
                          element[index - 1]?.children?.length &&
                          element[index - 1].children[element[index - 1].children.length - 1]?.completionPercentage === 100) {
                          if (element[index].children.length > 0) {
                            if (cindex === 0) {
                              element[index].children[cindex].disabledNode = false
                            } else {
                              if (element[index].children[cindex - 1] && element[index].children[cindex - 1].completionPercentage === 100) {

                                element[index].children[cindex].disabledNode = false
                              } else {
                                if (this.viewerDataSvc.getNode()) {
                                  element[index].children[cindex].disabledNode = true
                                } else {
                                  element[index].children[cindex].disabledNode = false
                                }

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
                              if (this.viewerDataSvc.getNode()) {
                                element[index].children[cindex].disabledNode = true
                              } else {
                                element[index].children[cindex].disabledNode = false
                              }

                            }
                            return
                          }
                        } else {

                          if (element[index].children[cindex - 1]) {
                            if (element[index].children[cindex - 1].completionPercentage === 100) {
                              element[index].children[cindex].disabledNode = false
                            } else if (this.viewerDataSvc.getNode()) {
                              element[index].children[cindex].disabledNode = true
                            } else {
                              element[index].children[cindex].disabledNode = false
                            }
                          }
                        }
                      })
                    }
                  })()
                })
              }
              mergeData(this.collection.children)
            }
            this.updateResourceChange()
          })()
        },
          (error: any) => {
            // tslint:disable-next-line:no-console
            this.logger.log('CONTENT HISTORY FETCH ERROR >', error)
          },
        )
        // tslint:disable-next-line: no-console
        this.logger.log(this.collection.children)
        this.nestedDataSource.data = this.collection.children
        this.pathSet = new Set()
        this.cdr.markForCheck()
        if (this.resourceId) {
          of(true)
            .pipe(delay(200))
            .subscribe(() => {
              this.expandThePath()

            })
        }
      }
    }
  }
  async openCongratulationPopup(): Promise<boolean> {
    const dialogRef = this.dialog.open(CongratulationsPopupComponent, {
      panelClass: 'congratulations-dialog',
      width: '360px',
      maxWidth: '90vw',
      data: {
        collectionId: this.collectionId,
      },
    })

    const result = await dialogRef.afterClosed().toPromise()
    return !!result?.completed
  }

  /**
   * After a course is completed and the congratulations flow is confirmed, either route to
   * the course overview (normal courses) or, for ASHA courses, open the complete-courses
   * modal so the learner can move to the next competency level's course.
   */
  private completeCourseNavigation() {
    // ASHA is the only case that diverges: close the completion dialogs and show the
    // complete-courses modal in the viewer. Every other (non-ASHA) case behaves exactly as
    // before — route straight to the course overview.
    if (this.isAsha) {
      this.dialog.closeAll()
      this.openAshaModal()
      return
    }
    this.router.navigate([`/app/toc/${this.collectionId}/overview`], {
      queryParams: {
        primaryCategory: 'Course',
        batchId: this.batchId,
      },
    })
  }

  /**
   * Web equivalent of the mobile app's openAshaModal: works out whether a distinct next
   * level course exists and opens the complete-courses modal accordingly. On "start next
   * course" it routes into that course; on "close" it returns to the ASHA home.
   */
  openAshaModal() {
    const currentAshaCardData = this.contentSvc.getAshaCardData()
    const currentAshaData = this.contentSvc.getAshaData()
    // Without the ASHA card/progress context we can't resolve the next level — go home.
    if (!currentAshaCardData || !currentAshaData || !currentAshaCardData.levels) {
      this.router.navigate(['page/home'])
      return
    }
    const currentLevel = Number(currentAshaData.competencylevel)
    const currentCourse = JSON.stringify(
      currentAshaCardData.levels.find((l: any) => Number(l.level) === currentLevel)?.course
    )
    // Walk forward to the next level whose course differs from the current one.
    let nextLevel = currentLevel + 1
    let nextData = false
    while (nextLevel <= 5) {
      const nextLevelData = currentAshaCardData.levels.find((l: any) => Number(l.level) === nextLevel)
      if (!nextLevelData) {
        break
      }
      if (JSON.stringify(nextLevelData.course) !== currentCourse) {
        nextData = true
        break
      }
      nextLevel++
    }
    const assessmentModelOpen = this.dialog.getDialogById('assessmentModel')
    const openDilogRef = this.dialog.getDialogById('confirmModal')
    const openCompleteCoursesModalRef = this.dialog.getDialogById('completeCoursesModal')
    if (assessmentModelOpen) {
      assessmentModelOpen.close()
    }
    if (openDilogRef) {
      openDilogRef.close()
    }
    if (!openCompleteCoursesModalRef) {
      const ashaCourses = this.dialog.open(CompleteCoursesModalComponent, {
        id: 'completeCoursesModal',
        width: '542px',
        panelClass: 'assesment-modal',
        disableClose: true,
        data: {
          navigateNextCourse: nextData,
          competencyId: currentAshaData.competencyid,
          competencyLevel: currentAshaData.competencylevel,
          currentAshaCardData,
          nextLevelId: nextLevel,
        },
      })
      ashaCourses.afterClosed().subscribe((res: any) => {
        if (res && res.event === 'CLOSE') {
          this.dialog.closeAll()
          this.router.navigate(['page/home'])
        }
        if (res && res.event === 'STARTNEXTCOURSE') {
          this.navigateToNextAshaCourses(currentAshaCardData, res)
        }
      })
    }
  }

  /**
   * Resolve the next level's course id (matching competency, level and language), fetch its
   * live batch, seed the ASHA context and navigate into that course's overview.
   */
  navigateToNextAshaCourses(currentAshaCardData: any, data: any) {
    let nextCourseId: any
    // Compare as strings — competency ids may be UUIDs, so Number() would coerce to NaN
    // and the level lookup (and therefore the whole "start next level" navigation) fails.
    const competencyId = data.competencyId
    const nextLevelId = Number(data.nextLevelId)
    const currentLang = currentAshaCardData.lang
    if (competencyId && nextLevelId) {
      const nextLevel = (currentAshaCardData.levels || []).find(
        (level: any) => String(level.competencyId) === String(competencyId) && Number(level.level) === nextLevelId
      )
      if (nextLevel) {
        const course = (nextLevel.course || []).find((c: any) => c.lang === currentLang)
        // Fall back to the first course for the level if there's no exact language match.
        nextCourseId = course ? course.id : (nextLevel.course && nextLevel.course[0] ? nextLevel.course[0].id : null)
      }
    }
    if (!nextCourseId) {
      this.router.navigate(['page/home'])
      return
    }
    this.contentSvc.getFilteredCourseSearchResults(nextCourseId).subscribe((res: any) => {
      const navigationdata = res && res.result && res.result.content ? res.result.content[0] : null
      const batchId = navigationdata && navigationdata.batches ? navigationdata.batches[0]?.batchId : undefined
      if (!navigationdata) {
        this.router.navigate(['page/home'])
        return
      }
      const ashaData = {
        isAsha: true,
        userid: this.configSvc.userProfile?.userId || '',
        batchid: batchId,
        contentid: navigationdata.identifier,
        competencylevel: nextLevelId,
        completionpercentage: 0,
        progress: 'course',
        competencyid: competencyId,
      }
      this.contentSvc.setAshaData(ashaData)
      this.router.navigate([`/app/toc/${navigationdata.identifier}/overview`], {
        queryParams: {
          primaryCategory: 'course',
          batchId,
          competencyid: competencyId,
          levelId: nextLevelId,
          courseid: navigationdata.identifier,
          isAsha: true,
        },
      })
    })
  }
  /**
   * Seed playerState with the CURRENT resource's own known completion the moment we
   * navigate to it, instead of blanking it to null.
   *
   * Blanking to null left the Next button disabled when revisiting an already-completed
   * resource: processCurrentResourceChange() doesn't re-fetch progress (so
   * updateResourceChange never runs), and a player already at 100% sends no fresh
   * progress message — so null was never restored. The queue node is the same object
   * that drives the completion tick, so reading its completionPercentage keeps the Next
   * gate in sync with the tick for every content type. Indexing by the new resourceId
   * means we never inherit the previous resource's percentage.
   */
  seedPlayerStateForCurrentResource() {
    this.playerStateService.setState(
      buildPlayerStateForResource(this.queue, this.resourceId, Boolean(this.collection)),
    )
  }
  updateResourceChange() {
    const currentIndex = this.queue.findIndex(c => c.identifier === this.resourceId)
    const firstResource = (this.queue && this.queue[0]) ? this.queue[0].viewerUrl : ''
    const next = currentIndex + 1 < this.queue.length ? this.queue[currentIndex + 1].viewerUrl : null
    const nextContentId = currentIndex + 1 < this.queue.length ? this.queue[currentIndex + 1].identifier : null
    const prev = currentIndex - 1 >= 0 ? this.queue[currentIndex - 1].viewerUrl : null
    const nextTitle = currentIndex + 1 < this.queue.length ? this.queue[currentIndex + 1].title : null
    const prevTitle = currentIndex - 1 >= 0 ? this.queue[currentIndex - 1].title : null
    const currentPercentage = currentIndex >= 0 && this.queue[currentIndex] ? this.queue[currentIndex].completionPercentage ?? null : null
    const prevPercentage = currentIndex - 1 >= 0 ? this.queue[currentIndex - 1].completionPercentage ?? null : null
    this.playerStateService.setState({
      isValid: Boolean(this.collection),
      prev, prevTitle, nextTitle, next, currentPercentage, prevPercentage, nextContentId, firstResource,
    })
    this.isLoading = false
    this.cdr.markForCheck()
  }

  updatePassbookEntryPassbook(data: any, competency: any) {
    this.logger.log("data", data, competency, this.heirarchy)
    const formatedData = {
      request: {
        userId: this.configSvc.userProfile!.userId,
        typeName: 'competency',
        competencyDetails: [
          {
            // Send competencyId as a string. competencies_v1 parses it as a
            // number, but the passbook API expects a string (the working
            // selfAssessment call sends "106", not 106) — a number triggers a
            // backend BAD_REQUEST: "Failed to update passbook details".
            competencyId: competency.competencyId?.toString(),
            additionalParams: {
              competencyName: competency.competencyName,
            },
            acquiredDetails: {
              acquiredChannel: 'course',
              competencyLevelId: competency.competencyLevel,
              // effectiveDate: "2023-02-09 9:46:12",
              additionalParams: {
                courseName: this.heirarchy.name,
                competencyName: competency.competencyName,
                courseId: data.courseId,
                ResourseId: '',
              },
            },
          },
        ],
      },
    }
    this.quizService
      .updatePassbook(formatedData)
      .pipe(
        catchError(error => {
          this.logger.error('Update passbook failed:', error)
          return of(null)
        })
      )
      .subscribe(res => {
        this.logger.log('Passbook updated successfully', res)
      })

  }

  resourceContentTypeFunct(type: any): void {
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
      Promise.resolve().then(() => this.cdr?.markForCheck())
    }
  }

  public progressColor(): string {
    return '#1D8923'
  }
}