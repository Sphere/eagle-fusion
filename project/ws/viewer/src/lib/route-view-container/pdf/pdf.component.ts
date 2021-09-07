import { ViewerDataService } from './../../viewer-data.service'
import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core'
import { NsContent, NsDiscussionForum } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ActivatedRoute } from '@angular/router'
import { ValueService, ConfigurationsService } from '@ws-widget/utils'
import { AwsAnalyticsService } from '@ws/viewer/src/lib/aws-analytics.service'

@Component({
  selector: 'viewer-pdf-container',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.scss'],
})
export class PdfComponent implements OnInit {
  @Input() isFetchingDataComplete = false
  @Input() pdfData: NsContent.IContent | null = null
  @Input() forPreview = false
  @Input() widgetResolverPdfData: any = {
    widgetType: 'player',
    widgetSubType: 'playerPDF',
    widgetData: {
      pdfUrl: '',
      identifier: '',
      disableTelemetry: false,
      hideControls: true,
    },
  }
  @Input() isPreviewMode = false
  @Input() discussionForumWidget: NsWidgetResolver.IRenderConfigWithTypedData<
    NsDiscussionForum.IDiscussionForumInput
  > | null = null
  isTypeOfCollection = false
  isRestricted = false
  prevResourceUrl: string | null = null
  nextResourceUrl: string | null = null
  viewerDataServiceSubscription: any
  collectionType: any
  prevTitle: string | null | undefined
  nextTitle: string | null | undefined
  @ViewChild('navpdf', { static: false }) navpdf!: ElementRef
  isSmall = false
  collectionIdentifier: any

  constructor(private activatedRoute: ActivatedRoute, private configSvc: ConfigurationsService,
              private viewerDataSvc: ViewerDataService, private valueSvc: ValueService,
              private awsAnalyticsService: AwsAnalyticsService) {
    this.valueSvc.isLtMedium$.subscribe(isXSmall => {
      this.isSmall = isXSmall
    })
  }

  ngOnInit() {
    if (this.configSvc.restrictedFeatures) {
      this.isRestricted =
        !this.configSvc.restrictedFeatures.has('disscussionForum')
    }

    this.isTypeOfCollection = this.activatedRoute.snapshot.queryParams.collectionType ? true : false
    this.collectionType = this.activatedRoute.snapshot.queryParams.collectionType

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
