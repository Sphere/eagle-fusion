import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { EventService, ValueService } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import videoJs from 'video.js'
import { ActivatedRoute } from '../../../../../../node_modules/@angular/router'
import { ViewerUtilService } from '../../../../../../project/ws/viewer/src/lib/viewer-util.service'
import { ROOT_WIDGET_CONFIG } from '../collection.config'
import { IWidgetsPlayerMediaData } from '../_models/player-media.model'
import { fireRealTimeProgressFunction, saveContinueLearningFunction, telemetryEventDispatcherFunction, videoJsInitializer, youtubeInitializer } from '../_services/videojs-util'
import { NsContent } from '../_services/widget-content.model'
import { WidgetContentService } from '../_services/widget-content.service'
interface IYTOptions extends videoJs.PlayerOptions {
  youtube: {
    ytControls: 0 | 1 | 2
    customVars?: {
      wmode: 'transparent'
    }
  }
}
const videoJsOptions: IYTOptions = {
  controls: true,
  autoplay: false,
  preload: 'auto',
  fluid: true,
  techOrder: ['youtube'],
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
  youtube: {
    ytControls: 0,
    customVars: {
      wmode: 'transparent',
    },
  },
}

@Component({
  selector: 'ws-widget-player-youtube',
  templateUrl: './player-youtube.component.html',
  styleUrls: ['./player-youtube.component.scss'],
})
export class PlayerYoutubeComponent extends WidgetBaseComponent
  implements OnInit, AfterViewInit, OnDestroy, NsWidgetResolver.IWidgetData<any> {
  @Input() widgetData!: IWidgetsPlayerMediaData
  screenSubscription: Subscription | null = null
  screenHeight: string | null = null
  // @Input() data!: IWidgetsPlayerMediaData
  @ViewChild('videoTag', { static: false }) videoTag!: ElementRef<HTMLVideoElement>
  @ViewChild('youtubeTag', { static: false }) youtubeTag!: ElementRef<HTMLElement>
  private player: videoJs.Player | null = null
  private dispose: (() => void) | null = null
  constructor(
    private eventSvc: EventService,
    private contentSvc: WidgetContentService,
    private viewerSvc: ViewerUtilService,
    private activatedRoute: ActivatedRoute,
    private valueSvc: ValueService,
  ) {
    super()
  }

  ngOnInit() {
    this.screenSubscription = this.valueSvc.isXSmall$.subscribe(isXsSmall => {
      if (isXsSmall) {
        this.screenHeight = '100%'
      } else {
        this.screenHeight = '500vh'
      }
    })
  }

  ngAfterViewInit() {
    if (this.widgetData && this.widgetData.url) {
      if (this.widgetData.isVideojs) {
        this.initializePlayer()
      } else {
        this.initializeYPlayer(this.widgetData.url.split('embed/')[1])
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
    if (this.screenSubscription) {
      this.screenSubscription.unsubscribe()
    }
  }

  private initializeYPlayer(videoId: string) {
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
            resourceId: data.resourceId,
            dateAccessed: Date.now(),
            data: JSON.stringify({
              progress: data.progress,
              timestamp: Date.now(),
            }),
          }
          this.contentSvc
            .saveContinueLearning(continueLearningData)
            .toPromise()
            .catch()
        }
      }
    }
    const fireRProgress: fireRealTimeProgressFunction = (identifier, data) => {
      if (this.widgetData.identifier) {
        this.viewerSvc
          .realTimeProgressUpdate(identifier, data)
      }
    }
    let enableTelemetry = false
    if (!this.widgetData.disableTelemetry && typeof (this.widgetData.disableTelemetry) !== 'undefined') {
      enableTelemetry = true
    }
    this.dispose = youtubeInitializer(
      this.youtubeTag.nativeElement,
      videoId,
      dispatcher,
      saveCLearning,
      fireRProgress,
      this.widgetData.passThroughData,
      ROOT_WIDGET_CONFIG.player.video,
      enableTelemetry,
      this.widgetData,
      NsContent.EMimeTypes.YOUTUBE,
      this.screenHeight ? this.screenHeight : '100 %',
    ).dispose
  }

  private initializePlayer() {
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
            resourceId: data.resourceId,
            dateAccessed: Date.now(),
            data: JSON.stringify({
              progress: data.progress,
              timestamp: Date.now(),
            }),
          }
          this.contentSvc
            .saveContinueLearning(continueLearningData)
            .toPromise()
            .catch()
        }
      }
    }
    const fireRProgress: fireRealTimeProgressFunction = (identifier, data) => {
      if (this.widgetData.identifier) {
        this.viewerSvc
          .realTimeProgressUpdate(identifier, data)
      }
    }
    let enableTelemetry = false
    if (!this.widgetData.disableTelemetry && typeof (this.widgetData.disableTelemetry) !== 'undefined') {
      enableTelemetry = true
    }
    if (this.widgetData.url) {
      const initObj = videoJsInitializer(
        this.videoTag.nativeElement,
        {
          ...videoJsOptions,
          poster: this.widgetData.posterImage,
          sources: [
            {
              type: 'video/youtube',
              src: this.widgetData.url,
            },
          ],
        },
        dispatcher,
        saveCLearning,
        fireRProgress,
        this.widgetData.passThroughData,
        ROOT_WIDGET_CONFIG.player.video,
        this.widgetData.resumePoint ? this.widgetData.resumePoint : 0,
        enableTelemetry,
        this.widgetData,
        NsContent.EMimeTypes.YOUTUBE,
      )
      this.player = initObj.player
      this.dispose = initObj.dispose
    }
  }
}
