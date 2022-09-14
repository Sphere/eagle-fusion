import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { EventService, ConfigurationsService } from '@ws-widget/utils'
import videoJs from 'video.js'
import { ViewerUtilService } from '../../../../../../project/ws/viewer/src/lib/viewer-util.service'
import { ROOT_WIDGET_CONFIG } from '../collection.config'
import { IWidgetsPlayerMediaData } from '../_models/player-media.model'
import {
  fireRealTimeProgressFunction,
  saveContinueLearningFunction,
  telemetryEventDispatcherFunction,
  videoInitializer,
  videoJsInitializer,
} from '../_services/videojs-util'
import { NsContent } from '../_services/widget-content.model'
import { WidgetContentService } from '../_services/widget-content.service'

const videoJsOptions: videoJs.PlayerOptions = {
  controls: true,
  autoplay: false,
  preload: 'auto',
  fluid: false,
  techOrder: ['html5'],
  playbackRates: [0.75, 0.85, 1, 1.25, 2, 3],
  poster: '',
  html5: {
    hls: {
      overrideNative: true,
    },
    nativeVideoTracks: false,
    nativeAudioTracks: false,
    nativeTextTracks: false,
  },
  nativeControlsForTouch: false,
}

@Component({
  selector: 'ws-widget-player-video',
  templateUrl: './player-video.component.html',
  styleUrls: ['./player-video.component.scss'],
})
export class PlayerVideoComponent extends WidgetBaseComponent
  implements
  OnInit,
  AfterViewInit,
  OnDestroy,
  NsWidgetResolver.IWidgetData<IWidgetsPlayerMediaData> {
  @Input() widgetData!: IWidgetsPlayerMediaData
  @ViewChild('videoTag', { static: false }) videoTag!: ElementRef<HTMLVideoElement>
  @ViewChild('realvideoTag', { static: false }) realvideoTag!: ElementRef<HTMLVideoElement>
  private player: videoJs.Player | null = null
  private dispose: (() => void) | null = null
  contentData: any

  constructor(
    private eventSvc: EventService,
    private contentSvc: WidgetContentService,
    private viewerSvc: ViewerUtilService,
    private activatedRoute: ActivatedRoute,
    private configSvc: ConfigurationsService
  ) {
    super()
    // console.log(window.innerWidth)
    // if (window.innerWidth < 768) {
    //   screen.orientation.lock('landscape');
    //   //this.isMobileResolution = true;
    // } else {
    //   //this.isMobileResolution = false;
    // }
  }

  ngOnInit() { }

  async ngAfterViewInit() {
    this.widgetData = {
      ...this.widgetData,
    }
    if (this.widgetData && this.widgetData.identifier && !this.widgetData.url) {
      await this.fetchContent()
    }
    if (this.widgetData.url) {
      if (this.widgetData.isVideojs) {
        this.initializePlayer()
      } else {
        this.initializeVPlayer()
      }
    }
  }
  ngOnDestroy() {
    if (this.player) {
      this.player.dispose()
    }
    if (this.dispose) {
      this.dispose()
    }
  }
  private initializeVPlayer() {
    const dispatcher: telemetryEventDispatcherFunction = event => {
      if (this.widgetData.identifier) {
        this.eventSvc.dispatchEvent(event)
      }
    }
    const saveCLearning: saveContinueLearningFunction = data => {
      if (this.widgetData.identifier) {
        if (this.activatedRoute.snapshot.queryParams.collectionType &&
          this.activatedRoute.snapshot.queryParams.collectionType.toLowerCase() === 'playlist') {
          const continueLearningData = {
            contextPathId: this.activatedRoute.snapshot.queryParams.collectionId ?
              this.activatedRoute.snapshot.queryParams.collectionId : this.widgetData.identifier,
            resourceId: data.resourceId,
            contextType: 'playlist',
            dateAccessed: Date.now(),
            data: JSON.stringify({
              progress: data.progress,
              timestamp: Date.now(),
              contextFullPath: [this.activatedRoute.snapshot.queryParams.collectionId, data.resourceId],
            }),
          }
          this.contentSvc
            .saveContinueLearning(continueLearningData)
            .toPromise()
            .catch()
        } else {
          const continueLearningData = {
            contextPathId: this.activatedRoute.snapshot.queryParams.collectionId ?
              this.activatedRoute.snapshot.queryParams.collectionId : this.widgetData.identifier,
            ...data,
            // resourceId: data.resourceId,
            // dateAccessed: Date.now(),
            // data: data.data,
          }
          // JSON.stringify({
          //   progress: data.progress,
          //   timestamp: Date.now(),
          // }),
          this.contentSvc
            .saveContinueLearning(continueLearningData)
            .toPromise()
            .catch()
        }
      }
    }
    const fireRProgress: fireRealTimeProgressFunction = (identifier, data) => {
      const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?
        this.activatedRoute.snapshot.queryParams.collectionId : this.widgetData.identifier
      const batchId = this.activatedRoute.snapshot.queryParams.batchId ?
        this.activatedRoute.snapshot.queryParams.batchId : this.widgetData.identifier
      if (this.widgetData.identifier) {
        this.viewerSvc
          .realTimeProgressUpdate(identifier, data, collectionId, batchId)
      }

    }

    if (this.widgetData.resumePoint && this.widgetData.resumePoint !== 0) {
      this.realvideoTag.nativeElement.currentTime = this.widgetData.resumePoint
    }
    let enableTelemetry = false
    if (!this.widgetData.disableTelemetry && typeof (this.widgetData.disableTelemetry) !== 'undefined') {
      enableTelemetry = true
    }
    this.dispose = videoInitializer(
      this.realvideoTag.nativeElement,
      dispatcher,
      saveCLearning,
      fireRProgress,
      this.widgetData.passThroughData,
      ROOT_WIDGET_CONFIG.player.video,
      enableTelemetry,
      this.widgetData,
      this.widgetData.mimeType,
    ).dispose
  }

  private initializePlayer() {
    const dispatcher: telemetryEventDispatcherFunction = event => {
      if (this.widgetData.identifier) {
        this.eventSvc.dispatchEvent(event)
      }
    }
    const saveCLearning: saveContinueLearningFunction = data => {
      if (this.widgetData.identifier && data) {
        if (this.activatedRoute.snapshot.queryParams.collectionType &&
          this.activatedRoute.snapshot.queryParams.collectionType.toLowerCase() === 'playlist') {
          // const continueLearningData = {
          //   contextPathId: this.activatedRoute.snapshot.queryParams.collectionId ?
          //     this.activatedRoute.snapshot.queryParams.collectionId : this.widgetData.identifier,
          //   resourceId: data.resourceId,
          //   contextType: 'playlist',
          //   dateAccessed: Date.now(),
          //   data: JSON.stringify({
          //     progress: data.progress,
          //     timestamp: Date.now(),
          //     contextFullPath: [this.activatedRoute.snapshot.queryParams.collectionId, data.resourceId],
          //   }),
          // }
          // this.contentSvc
          //   .saveContinueLearning(continueLearningData)
          //   .toPromise()
          //   .catch()
        } else {
          // const continueLearningData = {
          //   contextPathId: this.activatedRoute.snapshot.queryParams.collectionId
          //     ? this.activatedRoute.snapshot.queryParams.collectionId
          //     : this.widgetData.identifier,
          //   ...data,
          //   // resourceId: data.resourceId,
          //   // dateAccessed: Date.now(),
          //   // data: JSON.stringify({
          //   //   progress: data.progress,
          //   //   timestamp: Date.now(),
          //   // }),
          // }
          // this.contentSvc
          //   .saveContinueLearning(continueLearningData)
          //   .toPromise()
          //   .catch()
        }
      }
    }
    const fireRProgress: fireRealTimeProgressFunction = (identifier, data) => {
      const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?
        this.activatedRoute.snapshot.queryParams.collectionId : this.widgetData.identifier
      const batchId = this.activatedRoute.snapshot.queryParams.batchId ?
        this.activatedRoute.snapshot.queryParams.batchId : this.widgetData.identifier

      let userId
      if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId || ''
      }
      const req: NsContent.IContinueLearningDataReq = {
        request: {
          userId,
          batchId,
          courseId: collectionId,
          contentIds: [],
          fields: ['progressdetails'],
        },
      }
      this.contentSvc.fetchContentHistoryV2(req).subscribe(
        result => {
          this.contentData = result['result']['contentList'].find((obj: any) => obj.contentId === identifier)
          const temp = data.current
          const latest = parseFloat(temp[temp.length - 1] || '0')
          const percentMilis = (latest / data.max_size) * 100
          const percent = parseFloat(percentMilis.toFixed(2))
          if (this.contentData && percent >= this.contentData.completionPercentage) {
            if (this.widgetData.identifier && identifier && data) {
              this.viewerSvc
                .realTimeProgressUpdate(identifier, data, collectionId, batchId)
              this.contentSvc.changeMessage('Video')
            }
          }
          if (this.contentData === undefined && percent > 95) {
            this.viewerSvc
              .realTimeProgressUpdate(identifier, data, collectionId, batchId)
            this.contentSvc.changeMessage('Video')
          }

        })
    }

    let enableTelemetry = false
    if (!this.widgetData.disableTelemetry && typeof (this.widgetData.disableTelemetry) !== 'undefined') {
      enableTelemetry = true
    }
    const initObj = videoJsInitializer(
      this.videoTag.nativeElement,
      {
        ...videoJsOptions,
        poster: this.widgetData.posterImage,
        autoplay: this.widgetData.autoplay || false,
      },
      dispatcher,
      saveCLearning,
      fireRProgress,
      this.widgetData.passThroughData,
      ROOT_WIDGET_CONFIG.player.video,
      this.widgetData.resumePoint ? this.widgetData.resumePoint : 0,
      enableTelemetry,
      this.widgetData,
      this.widgetData.mimeType,
    )

    this.player = initObj.player
    this.dispose = initObj.dispose
    initObj.player.ready(() => {
      if (Array.isArray(this.widgetData.subtitles)) {
        this.widgetData.subtitles.forEach((u, index) => {
          initObj.player.addRemoteTextTrack(
            {
              default: index === 0,
              kind: 'captions',
              label: u.label,
              srclang: u.srclang,
              src: u.url,
            },
            false,
          )
        })
      }
      if (this.widgetData.url) {
        initObj.player.src(this.widgetData.url)
      }
    })
  }
  // onTimeUpdate() {
  //   const percentage = (this.videoTag.nativeElement.currentTime / this.videoTag.nativeElement.duration) * 100

  //   const data = {
  //     current: this.videoTag.nativeElement.currentTime,
  //     max_size: this.videoTag.nativeElement.duration,
  //     mime_type: this.widgetData.mimeType,
  //   }

  //   const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?
  //     this.activatedRoute.snapshot.queryParams.collectionId : this.widgetData.identifier
  //   const batchId = this.activatedRoute.snapshot.queryParams.batchId ?
  //     this.activatedRoute.snapshot.queryParams.batchId : this.widgetData.identifier
  //   if (this.widgetData.identifier) {
  //     if (percentage >= 98) {
  //       data.current = data.max_size;
  //       this.viewerSvc
  //         .realTimeProgressUpdate(this.widgetData.identifier, data, collectionId, batchId)
  //    }
  //   }
  // }
  async fetchContent() {
    const content = await this.contentSvc
      .fetchContent(this.widgetData.identifier || '', 'minimal', [], this.widgetData.primaryCategory)
      .toPromise()
    if (content.artifactUrl && content.artifactUrl.indexOf('/content-store/') > -1) {
      this.widgetData.url = content.artifactUrl
      this.widgetData.posterImage = content.appIcon
      await this.contentSvc.setS3Cookie(this.widgetData.identifier || '').toPromise()
    }
  }
}
