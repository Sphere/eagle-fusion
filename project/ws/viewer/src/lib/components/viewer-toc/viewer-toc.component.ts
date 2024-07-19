import { NestedTreeControl } from '@angular/cdk/tree'
import {
  NgModule,
  Component, EventEmitter, OnDestroy, OnInit, Output, Input, ViewChild, ElementRef, AfterViewInit, OnChanges,
} from '@angular/core'
import { MatTreeNestedDataSource, MatTooltipModule, MatDialog, MatDialogRef } from '@angular/material'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import { ActivatedRoute, Router } from '@angular/router'
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
import { PlayerStateService } from '../../player-state.service'
import { isNull, isEmpty } from 'lodash'
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
import { IndexedDBService } from 'src/app/online-indexed-db.service'

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
@NgModule({
  imports: [
    MatTooltipModule,

  ],
})
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
  collectionId: any = ''
  resourceContentType: any
  disabledNode: boolean
  currentContentType: any = ''
  heirarchy: any
  constructor(
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    // private logger: LoggerService,
    private contentSvc: WidgetContentService,
    private utilitySvc: UtilityService,
    private viewerDataSvc: ViewerDataService,
    private viewSvc: ViewerUtilService,
    private configSvc: ConfigurationsService,
    // private contentProgressSvc: ContentProgressService,
    private playerStateService: PlayerStateService,
    public router: Router,
    public dialog: MatDialog,
    private onlineIndexedDbService: IndexedDBService
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
  // tslint:disable-next-line
  hasNestedChild = (_: number, nodeData: IViewerTocCard) =>
    nodeData && nodeData.children && nodeData.children.length
  private _getChildren = (node: IViewerTocCard) => {
    return node && node.children ? node.children : []
  }

  ngOnInit() {

    this.isLoading = true
    if (this.configSvc.instanceConfig) {
      this.defaultThumbnail = this.domSanitizer.bypassSecurityTrustResourceUrl(
        this.configSvc.instanceConfig.logos.defaultContent,
      )
    }
    this.paramSubscription = this.activatedRoute.queryParamMap.subscribe(async params => {
      this.batchId = params.get('batchId')
      const collectionId = params.get('collectionId')
      this.collectionId = params.get('collectionId')
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
        if (this.currentContentType == 'Video') {
          if (this.playerStateService.isResourceCompleted()) {
            const nextResource = this.playerStateService.getNextResource()
            if (!(isNull(nextResource) || isEmpty(nextResource))) {
              this.router.navigate([nextResource], { preserveQueryParams: true })
              this.playerStateService.trigger$.complete()

            } else {
              this.router.navigate([`/app/toc/${this.collectionId}/overview`], {
                queryParams: {
                  primaryCategory: 'Course',
                  batchId: this.batchId,
                },
              })
            }

          }
        }
      }

    })

    this.viewerDataServiceSubscription = this.viewerDataSvc.changedSubject.subscribe(_data => {
      console.log(_data, '180')
      if (this.resourceId !== this.viewerDataSvc.resourceId) {
        this.resourceId = this.viewerDataSvc.resourceId
        this.processCurrentResourceChange()
        this.checkIndexOfResource()
      }
    })
    this.viewerDataServiceSubscription = this.viewerDataSvc.scromChangeSubject.subscribe(data => {
      console.log(data, '188')
      if (data) {
        //
        // console.log(this.playerStateService.trigger$.getValue())
        if (this.playerStateService.trigger$.getValue() === undefined || this.playerStateService.trigger$.getValue() === 'not-triggered') {
          this.scromUpdateCheck(data)

          // console.log("player state", this.playerStateService.isResourceCompleted(), this.playerStateService.getNextResource())
          setTimeout(() => {
            if (this.playerStateService.isResourceCompleted()) {
              const nextResource = this.playerStateService.getNextResource()
              if (!(isNull(nextResource) || isEmpty(nextResource))) {
                this.router.navigate([nextResource], { preserveQueryParams: true })
                this.playerStateService.trigger$.complete()

              } else {
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
  downloadResource(content: any) {
    const fileUrl = content.artifactUrl
    console.log('fileUrl: ', content)
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
        // this.collection = await this.getPlaylistContent(collectionId, collectionType)
      } else if (
        collectionType.toLowerCase() === NsContent.EContentTypes.MODULE.toLowerCase() ||
        collectionType.toLowerCase() === NsContent.EContentTypes.COURSE.toLowerCase() ||
        collectionType.toLowerCase() === NsContent.EContentTypes.PROGRAM.toLowerCase()
      ) {
        // this.collection = await this.getCollection(collectionId, collectionType)
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
  ngOnChanges() {
    this.change = this.contentSvc.currentMessage.subscribe(async (data: any) => {
      if (data) {
        this.isLoading = true
        this.currentContentType = await data.type
        this.processCollectionForTree(data)
        // this.ngOnInit()
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
    content['openOverviewDialog'] = content.type === 'Assessment'
    this.viewSvc.editResourceData(content)
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
    if (this.change) {
      this.change.unsubscribe()
    }
    if (this.progresSub) {
      this.progresSub.unsubscribe()
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
  async processData(data?: any) {
    this.isLoading = true
    if (this.collection) {
      this.queue = this.utilitySvc.getLeafNodes(this.collection, [])
    }

    if (this.collection && this.collection.children) {
      const mergeData = (collection: any) => {

        collection.map((child1: any, index: any, element: any) => {
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
              } else if (element[index - 1] && element[index - 1].children[element[index - 1].children.length - 1].completionPercentage === 100) {
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

                if (element[index].children[cindex - 1] && element[index].children[cindex - 1].completionPercentage !== 100) {
                  if (this.viewerDataSvc.getNode()) {
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
    let courseId = urlParams[3]
    let userID = this.configSvc.userProfile!.userId
    //let cId = this.activatedRoute.snapshot.queryParams.contentId

    arr2.forEach((obj2: any) => {
      const obj1 = arr1.find((o: any) => o.contentId === obj2.contentId)

      if (obj1) {
        // Update the existing object in arr1 if the keyToUpdate value is different
        if (obj1[keyToUpdate] !== obj2[keyToUpdate]) {
          obj1[keyToUpdate] = obj2[keyToUpdate]
        }
      } else {
        // Add the new object from arr2 to arr1
        arr1.push(obj2)
      }
    })
    console.log(arr1, 'arr1')
    console.log(userID, courseId)
    this.onlineIndexedDbService.insertData(userID, this.collectionId, 'onlineCourseProgress', arr1).subscribe(
      () => {
        console.log('Data inserted successfully2')
      },
      (error) => {
        console.error('Error inserting data:', error)
      }
    )
    const aggregateValue = this.calculateAggregate(arr1, 'completionPercentage')
    console.log('Aggregate value:', aggregateValue)
    console.log(this.heirarchy, 'content')
    let uniqueIdsOfType = this.uniqueIdsByContentType(this.heirarchy!.children, 'Resource')
    console.log(uniqueIdsOfType.length, this.heirarchy!.childNodes.length) // Output: [1, 3]
    let percentage = Math.round((aggregateValue) / (uniqueIdsOfType.length * 100) * 100)
    console.log(percentage, 'percentage', Math.min(Math.max(percentage, 0), 100))
    let progress = Math.min(Math.max(percentage, 0), 100)
    return progress
  }
  calculateAggregate(arr: any, field: string): number {
    let val = arr.reduce((total: number, obj: any) => total + obj[field], 0)
    console.log(val)
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
    console.log(content, 'processCollectionForTree')
    if (content && content.contentList) {
      console.log(content)
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

      let rating = await this.contentSvc.readCourseRating(req).then((res: any) => {
        if (res && res.params.status === 'success') {
          console.log(Object(res.result).length)
          console.log(res.result)
          return res.result
        }
      })
      this.onlineIndexedDbService.getRecordFromTable('onlineCourseProgress', this.configSvc.userProfile!.userId, this.collectionId).subscribe(async (record) => {
        console.log('Record:', record)
        rowData = await record
        let dat = JSON.parse(rowData.data)
        console.log(dat, 'dat')
        if (dat && dat.length) {
          optmisticPercentage = await this.updateKeyIfMatch(dat, content.contentList, 'completionPercentage')
        }

        console.log(rating, optmisticPercentage)
        if (content.type === 'Video' || content.type === 'Scorm') {
          if (this.playerStateService.isResourceCompleted()) {
            const nextResource = this.playerStateService.getNextResource()

            if (!(isEmpty(nextResource) || isNull(nextResource))) {
              if (content.type === "Scorm") {
                this.router.navigate([nextResource], { preserveQueryParams: true })
                this.playerStateService.trigger$.complete()
              }
            } else if (this.contentSvc.showConformation) {
              const data = {
                courseId: this.collectionId,
              }
              console.log("data", this.collectionId, data)
              const isDialogOpen = this.dialog.openDialogs.length > 0
              let confirmdialog: MatDialogRef<ConfirmmodalComponent> | undefined

              // If the dialog is not already open, open it
              if (!isDialogOpen && optmisticPercentage === 100 && Object.keys(rating).length === 0) {
                confirmdialog = this.dialog.open(ConfirmmodalComponent, {
                  width: '300px',
                  height: '405px',
                  panelClass: 'overview-modal',
                  disableClose: true,
                  data: { request: data, message: 'Congratulations!, you have completed the course' },
                })
              }

              if (confirmdialog) {
                confirmdialog.afterClosed().subscribe((res: any) => {
                  if (res && res.event === 'CONFIRMED') {
                    this.dialog.closeAll()
                    this.router.navigate([`/app/toc/${this.collectionId}/overview`], {
                      queryParams: {
                        primaryCategory: 'Course',
                        batchId: this.batchId,
                      },
                    })
                  }
                })
              }

            }
          } else {
            this.router.navigate([`/app/toc/${this.collectionId}/overview`], {
              queryParams: {
                primaryCategory: 'Course',
                batchId: this.batchId,
              },
            })
          }
        } else {
          if (this.playerStateService.isResourceCompleted()) {
            if (isNull(this.playerStateService.getNextResource()) || isEmpty(this.playerStateService.getNextResource())
              && this.contentSvc.showConformation) {
              const data = {
                courseId: this.collectionId,
              }
              console.log("data", this.collectionId, data)
              // Check if the dialog is already open
              const isDialogOpen = this.dialog.openDialogs.length > 0
              let confirmdialog: MatDialogRef<ConfirmmodalComponent> | undefined
              console.log(optmisticPercentage, Object.keys(rating).length)
              // If the dialog is not already open, open it
              if (!isDialogOpen && optmisticPercentage === 100 && Object.keys(rating).length === 0) {
                confirmdialog = this.dialog.open(ConfirmmodalComponent, {
                  width: '300px',
                  height: '405px',
                  panelClass: 'overview-modal',
                  disableClose: true,
                  data: { request: data, message: 'Congratulations!, you have completed the course' },
                })
              } else {
                if (optmisticPercentage === 100) {
                  this.router.navigate([`/app/toc/${this.collectionId}/overview`], {
                    queryParams: {
                      primaryCategory: 'Course',
                      batchId: this.batchId,
                    },
                  })
                }
              }

              if (confirmdialog) {
                confirmdialog.afterClosed().subscribe((res: any) => {
                  if (res && res.event === 'CONFIRMED') {
                    this.dialog.closeAll()
                    this.router.navigate([`/app/toc/${this.collectionId}/overview`], {
                      queryParams: {
                        primaryCategory: 'Course',
                        batchId: this.batchId,
                      },
                    })
                  }
                })
              }
            } else {
              console.log('lll')
            }
          }
        }
      }, (error) => {
        console.error('Error:', error)
        // const targetUrl = this.router.url
        // const urlParams = targetUrl.split('/')
        // let courseId = urlParams[3]
        let userID = this.configSvc.userProfile!.userId
        this.onlineIndexedDbService.insertData(userID, this.collectionId, 'onlineCourseProgress', content.contentList).subscribe(
          (dat: any) => {
            console.log('Data inserted successfully1', dat)
            console.log(userID, this.collectionId)
            this.onlineIndexedDbService.getRecordFromTable('onlineCourseProgress', userID, this.collectionId).subscribe(async (record) => {
              console.log('Record:', record)
              rowData = await record
              let dat = JSON.parse(rowData.data)
              console.log(dat)
              if (dat && dat.length) {
                optmisticPercentage = this.updateKeyIfMatch(dat, content.contentList, 'completionPercentage')
                console.log(optmisticPercentage, 'foundContent', '873')
              }
            }, (error) => {
              console.error('Error:', error)
            })
          },
          (error) => {
            console.error('Error inserting data:', error)
          }
        )
      })
    } else {
      if (this.collection && this.collection.children) {
        this.isLoading = true
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
        this.progresSub = this.contentSvc.fetchContentHistoryV2(req).subscribe(async data => {
          // tslint:disable-next-line: no-console
          console.log(data['result']['contentList'])
          if (this.collection && this.collection.children) {
            const mergeData = (collection: any) => {

              collection.map(async (child1: any, index: any, element: any) => {
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
                      console.log('entered')
                      child2.disabledNode = false

                    } else if (element[index - 1] && element[index - 1].children[element[index - 1].children.length - 1].completionPercentage === 100) {
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

                      if (element[index].children[cindex - 1] && element[index].children[cindex - 1].completionPercentage !== 100) {
                        if (this.viewerDataSvc.getNode()) {
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
          this.updateResourceChange()
        },
          (error: any) => {
            // tslint:disable-next-line:no-console
            console.log('CONTENT HISTORY FETCH ERROR >', error)
          },
        )
        // tslint:disable-next-line: no-console
        console.log(this.collection.children)
        this.nestedDataSource.data = this.collection.children
        this.pathSet = new Set()
        // if (this.resourceId && this.tocMode === 'TREE') {
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
  async updateResourceChange() {
    const currentIndex = await this.queue.findIndex(c => c.identifier === this.resourceId)
    const firstResource = (this.queue && this.queue[0]) ? this.queue[0].viewerUrl : ''
    const next = currentIndex + 1 < this.queue.length ? this.queue[currentIndex + 1].viewerUrl : null
    const nextContentId = currentIndex + 1 < this.queue.length ? this.queue[currentIndex + 1].identifier : null
    const prev = currentIndex - 1 >= 0 ? this.queue[currentIndex - 1].viewerUrl : null
    const nextTitle = currentIndex + 1 < this.queue.length ? this.queue[currentIndex + 1].title : null
    const prevTitle = currentIndex - 1 >= 0 ? this.queue[currentIndex - 1].title : null
    const currentPercentage = currentIndex < this.queue.length && this.queue[currentIndex] ? this.queue[currentIndex]!.completionPercentage! : null
    console.log(this.queue[currentIndex]!.completionPercentage)
    const prevPercentage = currentIndex - 1 >= 0 ? this.queue[currentIndex - 1].completionPercentage! : null
    // tslint:disable-next-line:object-shorthand-properties-first
    this.playerStateService.setState({
      isValid: Boolean(this.collection),
      // tslint:disable-next-line:object-shorthand-properties-first
      prev, prevTitle, nextTitle, next, currentPercentage, prevPercentage, nextContentId, firstResource
    })
    this.isLoading = false
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
      // this.isLoading = false
    }
  }

  // minimizenav() {
  //   this.hidenav.emit(false)
  //   this.hideSideNav = !this.hideSideNav
  // }

  public progressColor(): string {
    return '#1D8923'
  }
}