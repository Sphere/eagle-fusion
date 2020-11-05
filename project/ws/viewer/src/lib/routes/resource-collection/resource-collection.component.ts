import { Component, OnInit, OnDestroy } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Subscription } from 'rxjs'
import { NsContent, NsDiscussionForum, WidgetContentService } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ActivatedRoute } from '@angular/router'
import { EventService, WsEvents } from '@ws-widget/utils'
import { ViewerUtilService } from '../../viewer-util.service'

@Component({
  selector: 'viewer-resource-collection',
  templateUrl: './resource-collection.component.html',
  styleUrls: ['./resource-collection.component.scss'],
})
export class ResourceCollectionComponent implements OnInit, OnDestroy {
  private dataSubscription: Subscription | null = null
  isFetchingDataComplete = false
  forPreview = window.location.href.includes('/author/')
  isErrorOccured = false
  resourceCollectionData: NsContent.IContent | null = null
  oldData: NsContent.IContent | null = null
  alreadyRaised = false
  resourceCollectionManifest: any
  discussionForumWidget: NsWidgetResolver.IRenderConfigWithTypedData<
    NsDiscussionForum.IDiscussionForumInput
  > | null = null
  constructor(
    private activatedRoute: ActivatedRoute,
    private contentSvc: WidgetContentService,
    private http: HttpClient,
    private eventSvc: EventService,
    private viewSvc: ViewerUtilService,
  ) {}

  ngOnInit() {
    this.dataSubscription = this.activatedRoute.data.subscribe(
      async data => {
        this.resourceCollectionData = data.content.data
        if (this.alreadyRaised && this.oldData) {
          this.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, this.oldData)
        }
        if (this.resourceCollectionData) {
          this.formDiscussionForumWidget(this.resourceCollectionData)
        }
        if (
          this.resourceCollectionData &&
          this.resourceCollectionData.artifactUrl.indexOf('content-store') >= 0
        ) {
          await this.setS3Cookie(this.resourceCollectionData.identifier)
        }
        if (
          this.resourceCollectionData &&
          this.resourceCollectionData.mimeType === NsContent.EMimeTypes.COLLECTION_RESOURCE
        ) {
          this.resourceCollectionManifest = await this.transformResourceCollection(
            this.resourceCollectionData,
          )
        }
        if (this.resourceCollectionData && this.resourceCollectionManifest) {
          this.oldData = this.resourceCollectionData
          this.alreadyRaised = true
          this.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, this.resourceCollectionData)
          this.isFetchingDataComplete = true
        } else {
          this.isErrorOccured = true
        }
      },
      () => {},
    )
  }

  async ngOnDestroy() {
    if (this.activatedRoute.snapshot.queryParams.collectionId &&
      this.activatedRoute.snapshot.queryParams.collectionType
      && this.resourceCollectionData) {
      await this.contentSvc.continueLearning(this.resourceCollectionData.identifier,
                                             this.activatedRoute.snapshot.queryParams.collectionId,
                                             this.activatedRoute.snapshot.queryParams.collectionType,
      )
    } else if (this.resourceCollectionData) {
      await this.contentSvc.continueLearning(this.resourceCollectionData.identifier)
    }
    if (this.resourceCollectionData) {
      this.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, this.resourceCollectionData)
    }
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe()
    }
  }

  private async transformResourceCollection(_content: NsContent.IContent) {
    let manifestFile = ''
    if (this.resourceCollectionData && this.resourceCollectionData.artifactUrl) {
      const artifactUrl = this.forPreview
        ? this.viewSvc.getAuthoringUrl(this.resourceCollectionData.artifactUrl)
        : this.resourceCollectionData.artifactUrl
      manifestFile = await this.http
        .get<any>(artifactUrl || '')
        .toPromise()
        .catch((_err: any) => {})
    }
    return manifestFile
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
      from: 'resource-collection',
      to: '',
      data: {
        state,
        type: WsEvents.WsTimeSpentType.Player,
        mode: WsEvents.WsTimeSpentMode.Play,
        courseId: null,
        content: data,
        identifier: data ? data.identifier : null,
        isCompleted: true,
        mimeType: NsContent.EMimeTypes.COLLECTION_RESOURCE,
        isIdeal: false,
        url: data ? data.artifactUrl : null,
      },
    }
    this.eventSvc.dispatchEvent(event)
  }

  private async setS3Cookie(contentId: string) {
    await this.contentSvc
      .setS3Cookie(contentId)
      .toPromise()
      .catch(() => {
        // throw new DataResponseError('COOKIE_SET_FAILURE')
      })
    return
  }
}
