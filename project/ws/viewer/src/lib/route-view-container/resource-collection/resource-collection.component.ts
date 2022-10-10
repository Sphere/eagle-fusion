import { Component, Input, OnInit } from '@angular/core'
import { NsContent, NsDiscussionForum } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ActivatedRoute } from '@angular/router'
import { ConfigurationsService } from '../../../../../../../library/ws-widget/utils/src/public-api'
import { PlayerStateService } from '../../player-state.service'
@Component({
  selector: 'viewer-resource-collection-container',
  templateUrl: './resource-collection.component.html',
  styleUrls: ['./resource-collection.component.scss'],
})
export class ResourceCollectionComponent implements OnInit {
  @Input() isFetchingDataComplete = false
  @Input() isErrorOccured = false
  @Input() forPreview = false
  @Input() resourceCollectionData: NsContent.IContent | null = null
  @Input() resourceCollectionManifest: any
  @Input() discussionForumWidget: NsWidgetResolver.IRenderConfigWithTypedData<
    NsDiscussionForum.IDiscussionForumInput
  > | null = null
  @Input() isPreviewMode = false
  isTypeOfCollection = false
  collectionId: string | null = null
  isRestricted = false
  prevResourceUrl: string | null = null
  nextResourceUrl: string | null = null
  collectionType: any
  viewerDataServiceSubscription: any
  prevTitle: string | null | undefined
  nextTitle: string | null | undefined

  constructor(private activatedRoute: ActivatedRoute, private configSvc: ConfigurationsService,
              private viewerDataSvc: PlayerStateService) { }
  ngOnInit() {
    if (this.configSvc.restrictedFeatures) {
      this.isRestricted =
        !this.configSvc.restrictedFeatures.has('disscussionForum')
    }
    this.isTypeOfCollection = this.activatedRoute.snapshot.queryParams.collectionType ? true : false
    if (this.isTypeOfCollection) {
      this.collectionId = this.activatedRoute.snapshot.queryParams.collectionId
    }
    this.viewerDataServiceSubscription = this.viewerDataSvc.playerState.subscribe(data => {

      this.prevTitle = data.previousTitle
      this.nextTitle = data.nextResTitle
      this.prevResourceUrl = data.prevResource
      this.nextResourceUrl = data.nextResource
    })
  }
}
