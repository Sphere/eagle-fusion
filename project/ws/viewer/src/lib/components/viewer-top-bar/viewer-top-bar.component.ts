import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, OnChanges } from '@angular/core'
import { SafeUrl } from '@angular/platform-browser'
import { ActivatedRoute } from '@angular/router'
import { ConfigurationsService, NsPage, SafeResourceUrlService, ValueService } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import { ViewerDataService } from '../../viewer-data.service'
import { PlayerStateService } from '../../player-state.service'
import { WidgetContentService } from '@ws-widget/collection/src/lib/_services/widget-content.service'
import { ViewerUtilService } from '../../viewer-util.service'
import { NsContent } from '@ws-widget/collection/src/lib/_services/widget-content.model'
@Component({
  standalone: false,
  selector: 'viewer-viewer-top-bar',
  templateUrl: './viewer-top-bar.component.html',
  styleUrls: ['./viewer-top-bar.component.scss'],

})
export class ViewerTopBarComponent implements OnInit, OnChanges, OnDestroy {
  @Input() frameReference: any
  @Input() forPreview = false
  @Output() toggle = new EventEmitter()
  private viewerDataServiceSubscription: Subscription | null = null
  private paramSubscription: Subscription | null = null
  private viewerDataServiceResourceSubscription: Subscription | null = null
  appIcon: SafeUrl | null = null
  isTypeOfCollection = false
  collectionType: string | null = null
  prevResourceUrl: string | null = null
  nextResourceUrl: string | null = null
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  resourceId: string = (this.viewerDataSvc.resourceId as string) || ''
  resourceName: string | null = this.viewerDataSvc.resource ? this.viewerDataSvc.resource.name : ''
  collectionId = ''
  logo = true
  isPreview = false
  collection: any
  collectionCard: any
  @Input() screenContent: NsContent.IContent | null = null
  public isInFullScreen = false
  obj: NsContent.IContent | null = null
  isAuthor = false
  @Output() fsState: EventEmitter<boolean> = new EventEmitter()
  isSmall = false
  collectionIdentifier: any
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly safeResourceUrlSvc: SafeResourceUrlService,
    private readonly configSvc: ConfigurationsService,
    private readonly viewerDataSvc: ViewerDataService,
    private readonly playerStateSvc: PlayerStateService,
    private readonly valueSvc: ValueService,
    private readonly contentSvc: WidgetContentService,
    private readonly viewerSvc: ViewerUtilService
  ) {
  }

  ngOnChanges() {
    if (this.screenContent !== null) {
      this.obj = this.screenContent
    }

  }

  ngOnInit() {
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      this.isSmall = isXSmall
    })
    if (window.location.href.includes('/author/')) {
      this.isAuthor = true
    }
    this.isTypeOfCollection = this.activatedRoute.snapshot.queryParams.collectionType ? true : false
    this.collectionType = this.activatedRoute.snapshot.queryParams.collectionType

    const collectionId = this.activatedRoute.snapshot.queryParams.collectionId
    this.collectionIdentifier = collectionId
    const collectionType = this.activatedRoute.snapshot.queryParams.collectionType
    if (collectionId && collectionType) {
      this.paramSubscription = this.activatedRoute.queryParamMap.subscribe(params => {
        void (async () => {
          this.collectionId = params.get('collectionId') as string
          this.isPreview = params.get('preview') === 'true' ? true : false
        })()
      })
      try {
        this.contentSvc
          .fetchContent(collectionId).subscribe((data: any) => {
            this.collection = data.result.content
            if (this.configSvc.instanceConfig) {
              this.appIcon = this.safeResourceUrlSvc.trust(
                this.configSvc.instanceConfig.logos.appBottomNav,
              )
            }
            // tslint:disable-next-line:no-shadowed-variable
            this.viewerDataServiceSubscription = this.playerStateSvc.playerState.subscribe(data => {
              this.prevResourceUrl = data.prevResource
              this.nextResourceUrl = data.nextResource
              if (this.resourceId !== this.viewerDataSvc.resourceId) {
                this.resourceId = this.viewerDataSvc.resourceId as string
                this.resourceName = this.viewerDataSvc.resource ? this.viewerDataSvc.resource.name : ''
              }
            })

            this.viewerDataServiceResourceSubscription = this.viewerDataSvc.changedSubject.subscribe(
              _data => {
                this.resourceId = this.viewerDataSvc.resourceId as string
                this.resourceName = this.viewerDataSvc.resource ? this.viewerDataSvc.resource.name : ''
              },
            )
            this.viewerSvc.castResource.subscribe(user => this.screenContent = user)
          })
      } catch (e) {
        // TODO  this.logger.log(e)
      }
    }

  }

  fullScreenState(state: boolean) {
    this.isInFullScreen = state
    this.fsState.emit(state)
  }

  ngOnDestroy() {
    if (this.viewerDataServiceSubscription) {
      this.viewerDataServiceSubscription.unsubscribe()
    }
    if (this.paramSubscription) {
      this.paramSubscription.unsubscribe()
    }
    if (this.viewerDataServiceResourceSubscription) {
      this.viewerDataServiceResourceSubscription.unsubscribe()
    }
  }

  toggleSideBar() {
    this.toggle.emit()
  }

  back() {
    try {
      if (window.self !== window.top) {
        return
      }
      window.history.back()
    } catch (_ex) {
      window.history.back()
    }

  }
}
