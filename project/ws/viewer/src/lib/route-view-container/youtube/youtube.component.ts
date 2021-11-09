import { Component, Input, OnInit } from '@angular/core'
import { NsContent, IWidgetsPlayerMediaData, NsDiscussionForum } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ActivatedRoute } from '@angular/router'
import { ConfigurationsService } from '../../../../../../../library/ws-widget/utils/src/public-api'
import { ViewerDataService } from '../../viewer-data.service'
import { AwsAnalyticsService } from '@ws/viewer/src/lib/aws-analytics.service'

@Component({
  selector: 'viewer-youtube-container',
  templateUrl: './youtube.component.html',
  styleUrls: ['./youtube.component.scss'],
})
export class YoutubeComponent implements OnInit {
  @Input() isScreenSizeSmall = false
  @Input() isFetchingDataComplete = false
  @Input() forPreview = false
  @Input() youtubeData: NsContent.IContent | null = null
  @Input() widgetResolverYoutubeData: NsWidgetResolver.IRenderConfigWithTypedData<
    IWidgetsPlayerMediaData
  > | null = null
  @Input() discussionForumWidget: NsWidgetResolver.IRenderConfigWithTypedData<
    NsDiscussionForum.IDiscussionForumInput
  > | null = null
  @Input() isScreenSizeLtMedium = false
  @Input() isPreviewMode = false
  isTypeOfCollection = false
  isRestricted = false
  prevResourceUrl: string | null = null
  nextResourceUrl: string | null = null
  collectionType: any
  viewerDataServiceSubscription: any
  prevTitle: string | null | undefined
  nextTitle: string | null | undefined
  collectionIdentifier!: string

  constructor(private activatedRoute: ActivatedRoute, private configSvc: ConfigurationsService,
              private viewerDataSvc: ViewerDataService,
              private awsAnalyticsService: AwsAnalyticsService) { }

  ngOnInit() {

    if (this.configSvc.restrictedFeatures) {
      this.isRestricted =
        !this.configSvc.restrictedFeatures.has('disscussionForum')
    }
    this.isTypeOfCollection = this.activatedRoute.snapshot.queryParams.collectionType ? true : false
    this.viewerDataServiceSubscription = this.viewerDataSvc.tocChangeSubject.subscribe(data => {

      this.prevTitle = data.previousTitle
      this.nextTitle = data.nextResTitle
      this.prevResourceUrl = data.prevResource
      this.nextResourceUrl = data.nextResource
    })
    const collectionId = this.activatedRoute.snapshot.queryParams.collectionId
    this.collectionIdentifier = collectionId
  }

  setPrevClick() {
    this.viewerDataSvc.setClikedItem('prev')
    if (this.prevResourceUrl) { this.createAWSAnalyticsEventAttribute(this.prevResourceUrl) }
  }

  setNextClick() {
    this.viewerDataSvc.setClikedItem('next')
    if (this.nextResourceUrl) { this.createAWSAnalyticsEventAttribute(this.nextResourceUrl) }
  }

  createAWSAnalyticsEventAttribute(resourceUrl: string) {
    let courseId = ''
    if (resourceUrl) {
      courseId = resourceUrl.slice(resourceUrl.indexOf('lex_'))
    }

    const attr = {
      name: 'PL1_ChildResourceVisit',
      attributes: { CourseId: courseId },
    }
    const endPointAttr = {
      CourseId: [courseId],
    }
    this.awsAnalyticsService.callAnalyticsEndpointService(attr, endPointAttr)
  }

}
