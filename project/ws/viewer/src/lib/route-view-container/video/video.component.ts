import { Component, Input, OnInit } from '@angular/core'
import { NsContent, IWidgetsPlayerMediaData, NsDiscussionForum } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ActivatedRoute } from '@angular/router'
import { ConfigurationsService } from '../../../../../../../library/ws-widget/utils/src/public-api'
import { PlayerStateService } from '../../player-state.service'

@Component({
  selector: 'viewer-video-container',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
})
export class VideoComponent implements OnInit {
  @Input() isScreenSizeSmall = false
  @Input() isNotEmbed = true
  @Input() isFetchingDataComplete = false
  @Input() forPreview = false
  @Input() videoData: NsContent.IContent | null = null
  @Input() widgetResolverVideoData: NsWidgetResolver.IRenderConfigWithTypedData<
    IWidgetsPlayerMediaData
  > | null = null
  @Input() discussionForumWidget: NsWidgetResolver.IRenderConfigWithTypedData<
    NsDiscussionForum.IDiscussionForumInput
  > | null = null
  @Input() isPreviewMode = false
  isTypeOfCollection = false
  isRestricted = false
  prevResourceUrl: string | null = null
  nextResourceUrl: string | null = null
  currentCompletionPercentage: number | null = null
  collectionType: any
  viewerDataServiceSubscription: any
  prevTitle: string | null | undefined
  nextTitle: string | null | undefined
  collectionIdentifier: any

  constructor(private activatedRoute: ActivatedRoute, private configSvc: ConfigurationsService,
              private viewerDataSvc: PlayerStateService) { }

  ngOnInit() {
    if (this.configSvc.restrictedFeatures) {
      this.isRestricted =
        !this.configSvc.restrictedFeatures.has('disscussionForum')
    }
    this.isTypeOfCollection = this.activatedRoute.snapshot.queryParams.collectionType ? true : false
    this.collectionType = this.activatedRoute.snapshot.queryParams.collectionType

    this.viewerDataServiceSubscription = this.viewerDataSvc.playerState.subscribe(data => {
      this.prevTitle = data.previousTitle
      this.nextTitle = data.nextResTitle
      this.prevResourceUrl = data.prevResource
      this.nextResourceUrl = data.nextResource
      this.currentCompletionPercentage = data.currentCompletionPercentage
    })
    const collectionId = this.activatedRoute.snapshot.queryParams.collectionId
    this.collectionIdentifier = collectionId
  }
  isProgressCheck(): boolean {
    if (typeof this.currentCompletionPercentage === 'undefined' && this.currentCompletionPercentage !== 100) {
      return false
    }
    return true
  }
  stopPropagation() {
    return
  }
}
