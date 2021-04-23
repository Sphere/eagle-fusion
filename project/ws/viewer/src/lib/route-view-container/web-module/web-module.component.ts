import { Component, Input, OnInit, Output, EventEmitter, AfterViewInit } from '@angular/core'
import { NsContent, NsDiscussionForum } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ActivatedRoute } from '@angular/router'
import { ConfigurationsService, ValueService } from '../../../../../../../library/ws-widget/utils/src/public-api'
import { ViewerDataService } from '../../viewer-data.service'

@Component({
  selector: 'viewer-web-module-container',
  templateUrl: './web-module.component.html',
  styleUrls: ['./web-module.component.scss'],
})
export class WebModuleComponent implements OnInit, AfterViewInit {
  @Input() isFetchingDataComplete = false
  @Input() isErrorOccured = false
  @Input() forPreview = false
  @Input() webmoduleData: NsContent.IContent | null = null
  @Input() webmoduleManifest: any
  @Input() discussionForumWidget: NsWidgetResolver.IRenderConfigWithTypedData<
    NsDiscussionForum.IDiscussionForumInput
  > | null = null
  @Input() isPreviewMode = false
  @Output() reload: EventEmitter<boolean> = new EventEmitter()
  isTypeOfCollection = false
  collectionId: string | null = null
  isRestricted = false
  prevResourceUrl: string | null = null
  nextResourceUrl: string | null = null
  collectionType: any
  viewerDataServiceSubscription: any
  prevTitle: string | null | undefined
  nextTitle: string | null | undefined
  isSmall = false
  collectionIdentifier: any

  constructor(private activatedRoute: ActivatedRoute, private configSvc: ConfigurationsService,
    private viewerDataSvc: ViewerDataService, private valueSvc: ValueService) {
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      this.isSmall = isXSmall
    })
  }

  ngOnInit() {
    if (this.configSvc.restrictedFeatures) {
      this.isRestricted =
        !this.configSvc.restrictedFeatures.has('disscussionForum')
    }
    this.isTypeOfCollection = this.activatedRoute.snapshot.queryParams.collectionType ? true : false
    if (this.isTypeOfCollection) {
      this.collectionId = this.activatedRoute.snapshot.queryParams.collectionId
    }
    this.viewerDataServiceSubscription = this.viewerDataSvc.tocChangeSubject.subscribe(data => {

      this.prevTitle = data.previousTitle
      this.nextTitle = data.nextResTitle
      this.prevResourceUrl = data.prevResource
      this.nextResourceUrl = data.nextResource
    })
    const collectionId = this.activatedRoute.snapshot.queryParams.collectionId
    this.collectionIdentifier = collectionId
  }

  ngAfterViewInit() {
    this.activatedRoute.data.subscribe(data => {
      if (data.resourceType === 'web-module' && this.webmoduleData) {
        if (this.activatedRoute.snapshot.params.resourceId !== this.webmoduleData.identifier) {
          this.reload.emit(true)
        }
      }
    })
  }
}
