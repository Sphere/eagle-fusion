import { AccessControlService } from '@ws/author'
import { Component, OnInit, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'
import { NsContent, NsDiscussionForum, WidgetContentService } from '@ws-widget/collection'
import { WsEvents, EventService } from '@ws-widget/utils'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ActivatedRoute } from '@angular/router'
import { ViewerUtilService } from '../../viewer-util.service'

@Component({
  selector: 'viewer-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.scss'],
})
export class PdfComponent implements OnInit, OnDestroy {
  private dataSubscription: Subscription | null = null
  private viewerDataSubscription: Subscription | null = null
  private telemetryIntervalSubscription: Subscription | null = null
  isFetchingDataComplete = true
  pdfData: NsContent.IContent | null = null
  oldData: NsContent.IContent | null = null
  alreadyRaised = false
  widgetResolverPdfData: any = {
    widgetType: 'player',
    widgetSubType: 'playerPDF',
    widgetData: {
      pdfUrl: '',
      identifier: '',
      disableTelemetry: false,
      hideControls: true,
    },
  }
  isPreviewMode = false
  forPreview = window.location.href.includes('/author/')
  discussionForumWidget: NsWidgetResolver.IRenderConfigWithTypedData<
    NsDiscussionForum.IDiscussionForumInput
  > | null = null
  constructor(
    private activatedRoute: ActivatedRoute,
    private contentSvc: WidgetContentService,
    private viewerSvc: ViewerUtilService,
    private eventSvc: EventService,
    private accessControlSvc: AccessControlService,
  ) {}

  ngOnInit() {
   // TODO console.log('pdf wala')
    if (
      this.activatedRoute.snapshot.queryParamMap.get('preview') &&
      !this.accessControlSvc.authoringConfig.newDesign
    ) {
      this.isPreviewMode = true
      this.viewerDataSubscription = this.viewerSvc
        .getContent(this.activatedRoute.snapshot.paramMap.get('resourceId') || '')
        .subscribe(data => {
          this.pdfData = data
          if (this.pdfData) {
            this.formDiscussionForumWidget(this.pdfData)
            if (this.discussionForumWidget) {
              this.discussionForumWidget.widgetData.isDisabled = true
            }
          }
          this.widgetResolverPdfData.widgetData.pdfUrl = this.pdfData
            ? `/apis/authContent/${encodeURIComponent(this.pdfData.artifactUrl)}`
            : ''
          this.widgetResolverPdfData.widgetData.disableTelemetry = true
          this.isFetchingDataComplete = true
        })
    } else {
      this.dataSubscription = this.activatedRoute.data.subscribe(
        async data => {
          this.pdfData = data.content.data
          // if (this.alreadyRaised && this.oldData) {
          //   this.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, this.oldData)
          // }
          if (this.pdfData) {
            this.formDiscussionForumWidget(this.pdfData)
          }

          if (this.pdfData && this.pdfData.artifactUrl.indexOf('content-store') >= 0) {
            await this.setS3Cookie(this.pdfData.identifier)
          }
          this.widgetResolverPdfData.widgetData.resumePage = 1
          if (this.pdfData && this.pdfData.identifier) {
            if (this.activatedRoute.snapshot.queryParams.collectionId) {
              await this.fetchContinueLearning(
                this.activatedRoute.snapshot.queryParams.collectionId,
                this.pdfData.identifier,
              )
            } else {
              await this.fetchContinueLearning(this.pdfData.identifier, this.pdfData.identifier)
            }
          }
          this.widgetResolverPdfData.widgetData.pdfUrl = this.pdfData
            ? this.forPreview
              ? this.viewerSvc.getAuthoringUrl(this.pdfData.artifactUrl)
              : this.pdfData.artifactUrl
            : ''
          this.widgetResolverPdfData.widgetData.identifier = this.pdfData && this.pdfData.identifier

          this.widgetResolverPdfData = JSON.parse(JSON.stringify(this.widgetResolverPdfData))
          // if (this.pdfData) {
          //   this.oldData = this.pdfData
          //   this.alreadyRaised = true
          //   this.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, this.pdfData)
          // }
          this.isFetchingDataComplete = true
        },
        () => {},
      )
    }
  // TODO  console.log('PDF Content',this.pdfData)
  }

  formDiscussionForumWidget(content: NsContent.IContent) {
    this.discussionForumWidget = {
      widgetData: {
        description: content.description,
        id: content.identifier,
        name: NsDiscussionForum.EDiscussionType.LEARNING,
        title: content.name,
        initialPostCount: 2,
        isDisabled: this.forPreview,
      },
      widgetSubType: 'discussionForum',
      widgetType: 'discussionForum',
    }
  }

  raiseEvent(state: WsEvents.EnumTelemetrySubType, data: NsContent.IContent) {
    if (this.forPreview) {
      return
    }

    const event = {
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Info,
      from: 'pdf',
      to: '',
      data: {
        state,
        type: WsEvents.WsTimeSpentType.Player,
        mode: WsEvents.WsTimeSpentMode.Play,
        content: data,
        identifier: data ? data.identifier : null,
        mimeType: NsContent.EMimeTypes.PDF,
        url: data ? data.artifactUrl : null,
      },
    }
    this.eventSvc.dispatchEvent(event)
  }

  async fetchContinueLearning(collectionId: string, pdfId: string): Promise<boolean> {
    return new Promise(resolve => {
      this.contentSvc.fetchContentHistory(collectionId).subscribe(
        data => {
          if (data) {
            if (data.identifier === pdfId && data.continueData && data.continueData.progress) {
              this.widgetResolverPdfData.widgetData.resumePage = Number(data.continueData.progress)
            }
          }
          resolve(true)
        },
        () => resolve(true),
      )
    })
  }

  private async setS3Cookie(contentId: string) {
    await this.contentSvc
      .setS3Cookie(contentId)
      .toPromise()
      .catch(() => {
    // TODO   console.log('Cookie error for s3')
      })
    return
  }

  ngOnDestroy() {
    if (this.pdfData) {
      this.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, this.pdfData)
    }
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe()
    }
    if (this.viewerDataSubscription) {
      this.viewerDataSubscription.unsubscribe()
    }
    if (this.telemetryIntervalSubscription) {
      this.telemetryIntervalSubscription.unsubscribe()
    }
  }
}
